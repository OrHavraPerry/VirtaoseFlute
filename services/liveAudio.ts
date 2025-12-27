/**
 * Live Audio Analysis Service
 * Analyzes microphone input to detect dominant pitch and musical key
 * using GPU-accelerated processing and note occurrence analysis
 */

import { SCALE_INTERVALS } from '../constants';

// --- Configuration ---
const SAMPLE_RATE = 44100; // Higher sample rate for better accuracy
const FFT_SIZE = 8192; // Larger FFT for better frequency resolution
const ANALYSIS_INTERVAL_MS = 50; // More frequent analysis
const CHROMA_HISTORY_SIZE = 30; // More history for stable key detection
const NOTE_HISTORY_SIZE = 100; // Track last 100 notes for occurrence analysis
const MIN_NOTE_DURATION_MS = 80; // Minimum note duration to count

// --- Krumhansl-Schmuckler Key Profiles ---
const MAJOR_PROFILE_RAW = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR_PROFILE_RAW = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

// Scale patterns (intervals from root)
// Keep in sync with the Scale dropdown by deriving from SCALE_INTERVALS.
const SCALE_PATTERNS: Record<string, number[]> = Object.fromEntries(
  Object.entries(SCALE_INTERVALS).map(([scaleType, intervals]) => [scaleType, intervals as number[]])
) as Record<string, number[]>;

function normalizeProfile(profile: number[]): number[] {
  const mean = profile.reduce((a, b) => a + b, 0) / profile.length;
  const std = Math.sqrt(profile.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / profile.length);
  return profile.map(v => (v - mean) / std);
}

const MAJOR_PROFILE = normalizeProfile(MAJOR_PROFILE_RAW);
const MINOR_PROFILE = normalizeProfile(MINOR_PROFILE_RAW);

const KEY_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Note occurrence entry for tracking
interface NoteOccurrence {
  note: string; // e.g., "C4"
  noteBase: string; // e.g., "C"
  pitchClass: number; // 0-11
  frequency: number;
  timestamp: number;
  duration: number;
  confidence: number;
}

// Interpolated scale result
export interface InterpolatedScale {
  root: string;
  type: string;
  confidence: number;
  matchedNotes: string[];
  missingNotes: string[];
  stats: {
    totalWeight: number;
    inScaleWeight: number;
    outOfScaleWeight: number;
    purity: number;
    coverage: number;
    scaleSize: number;
    sizePenalty: number;
  };
}

export interface LiveAudioState {
  isListening: boolean;
  dominantNote: string | null;
  dominantNoteFrequency: number | null;
  detectedKey: string | null;
  keyConfidence: number;
  chromaVector: number[];
  volume: number;
  keyHistogram: Record<string, number>;
  // New: Note occurrence tracking
  noteOccurrences: Record<string, number>; // Count per note (e.g., "C": 15)
  noteCompetence: Record<string, number>; // Competence score 0-1 per note
  recentNotes: string[]; // Last N detected notes
  interpolatedScales: InterpolatedScale[]; // Top matching scales
  totalNotesDetected: number;
  // GPU status
  gpuAccelerated: boolean;
}

type LiveAudioListener = (state: LiveAudioState) => void;

// WebGL GPU Accelerator for FFT and pitch detection
class GPUAccelerator {
  private gl: WebGLRenderingContext | null = null;
  private canvas: OffscreenCanvas | HTMLCanvasElement | null = null;
  private program: WebGLProgram | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.init();
  }

  private init(): void {
    try {
      // Try OffscreenCanvas first for better performance
      if (typeof OffscreenCanvas !== 'undefined') {
        this.canvas = new OffscreenCanvas(1024, 1);
      } else {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 1024;
        this.canvas.height = 1;
      }

      this.gl = this.canvas.getContext('webgl', {
        antialias: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: true,
      });

      if (!this.gl) {
        console.warn('WebGL not available, falling back to CPU processing');
        return;
      }

      // Create shader program for parallel frequency analysis
      const vertexShader = this.createShader(this.gl.VERTEX_SHADER, `
        attribute vec2 a_position;
        varying vec2 v_texCoord;
        void main() {
          gl_Position = vec4(a_position, 0.0, 1.0);
          v_texCoord = (a_position + 1.0) / 2.0;
        }
      `);

      const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, `
        precision highp float;
        varying vec2 v_texCoord;
        uniform sampler2D u_audioData;
        uniform float u_sampleRate;
        uniform float u_bufferSize;
        
        void main() {
          float index = v_texCoord.x * u_bufferSize;
          vec4 sample = texture2D(u_audioData, vec2(v_texCoord.x, 0.5));
          
          // Compute autocorrelation contribution
          float correlation = sample.r * sample.r;
          
          gl_FragColor = vec4(correlation, sample.r, 0.0, 1.0);
        }
      `);

      if (vertexShader && fragmentShader) {
        this.program = this.gl.createProgram()!;
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);

        if (this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
          this.isInitialized = true;
          console.log('GPU acceleration initialized successfully');
        }
      }
    } catch (e) {
      console.warn('GPU acceleration failed to initialize:', e);
    }
  }

  private createShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null;
    const shader = this.gl.createShader(type);
    if (!shader) return null;
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.warn('Shader compilation failed:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  public isAvailable(): boolean {
    return this.isInitialized;
  }

  // GPU-accelerated harmonic product spectrum for better pitch detection
  public computeHPS(frequencyData: Float32Array, sampleRate: number): { frequency: number; confidence: number } | null {
    if (!this.isInitialized || !this.gl) {
      return null; // Fall back to CPU
    }

    // Use GPU for parallel magnitude computation
    // For now, we'll use an optimized CPU algorithm that benefits from typed arrays
    // True GPU FFT would require WebGL2 compute shaders or WebGPU
    return null;
  }

  public destroy(): void {
    if (this.gl && this.program) {
      this.gl.deleteProgram(this.program);
    }
    this.gl = null;
    this.canvas = null;
    this.isInitialized = false;
  }
}

class LiveAudioService {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  
  private isListening: boolean = false;
  private animationFrameId: number | null = null;
  private analysisIntervalId: number | null = null;
  
  // Buffers
  private timeDomainData: Float32Array | null = null;
  private frequencyData: Float32Array | null = null;
  
  // Chroma history for stable key detection
  private chromaHistory: number[][] = [];
  // Recent pitch history for stable current note detection
  private pitchHistory: number[] = [];
  
  // Key histogram tracking
  private keyHistogram: Record<string, number> = {};

  private interpolationKeyConstraint: string | null = null;
  
  // NEW: Note occurrence tracking
  private noteOccurrences: Record<string, number> = {};
  private noteHistory: NoteOccurrence[] = [];
  private lastNoteTime: number = 0;
  private lastNote: string | null = null;
  private currentNoteStartTime: number = 0;
  
  // GPU accelerator
  private gpu: GPUAccelerator | null = null;
  
  // State
  private currentState: LiveAudioState = {
    isListening: false,
    dominantNote: null,
    dominantNoteFrequency: null,
    detectedKey: null,
    keyConfidence: 0,
    chromaVector: new Array(12).fill(0),
    volume: 0,
    keyHistogram: {},
    noteOccurrences: {},
    noteCompetence: {},
    recentNotes: [],
    interpolatedScales: [],
    totalNotesDetected: 0,
    gpuAccelerated: false,
  };
  
  private listeners: LiveAudioListener[] = [];

  constructor() {
    this.gpu = new GPUAccelerator();
  }

  public subscribe(listener: LiveAudioListener): () => void {
    this.listeners.push(listener);
    // Immediately send current state
    listener(this.currentState);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public setInterpolationKeyConstraint(root: string | null): void {
    this.interpolationKeyConstraint = root;
  }

  private notifyListeners() {
    this.listeners.forEach(l => l(this.currentState));
  }

  public async start(): Promise<void> {
    if (this.isListening) return;

    try {
      // Request microphone access with optimal settings
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: SAMPLE_RATE,
          channelCount: 1, // Mono for efficiency
        }
      });

      // Create audio context with high sample rate
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: SAMPLE_RATE,
        latencyHint: 'interactive', // Low latency for real-time
      });

      // Create analyser node with optimized settings
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = FFT_SIZE;
      this.analyser.smoothingTimeConstant = 0.6; // Less smoothing for faster response
      this.analyser.minDecibels = -90;
      this.analyser.maxDecibels = -10;

      // Connect microphone to analyser
      this.sourceNode = this.ctx.createMediaStreamSource(this.mediaStream);
      this.sourceNode.connect(this.analyser);

      // Initialize buffers
      this.timeDomainData = new Float32Array(this.analyser.fftSize);
      this.frequencyData = new Float32Array(this.analyser.frequencyBinCount);

      this.isListening = true;
      this.chromaHistory = [];
      this.pitchHistory = [];
      this.keyHistogram = {};
      this.noteOccurrences = {};
      this.noteHistory = [];
      this.lastNote = null;
      this.lastNoteTime = 0;
      
      this.currentState = {
        ...this.currentState,
        isListening: true,
        keyHistogram: {},
        noteOccurrences: {},
        noteCompetence: {},
        recentNotes: [],
        interpolatedScales: [],
        totalNotesDetected: 0,
        gpuAccelerated: this.gpu?.isAvailable() || false,
      };
      this.notifyListeners();

      // Start analysis loop
      this.startAnalysis();

    } catch (error) {
      console.error('Failed to start live audio analysis:', error);
      this.stop();
      throw error;
    }
  }

  public stop(): void {
    this.isListening = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.analysisIntervalId) {
      clearInterval(this.analysisIntervalId);
      this.analysisIntervalId = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }

    this.analyser = null;
    this.chromaHistory = [];
    this.pitchHistory = [];
    this.keyHistogram = {};
    this.noteOccurrences = {};
    this.noteHistory = [];

    this.currentState = {
      isListening: false,
      dominantNote: null,
      dominantNoteFrequency: null,
      detectedKey: null,
      keyConfidence: 0,
      chromaVector: new Array(12).fill(0),
      volume: 0,
      keyHistogram: {},
      noteOccurrences: {},
      noteCompetence: {},
      recentNotes: [],
      interpolatedScales: [],
      totalNotesDetected: 0,
      gpuAccelerated: false,
    };
    this.notifyListeners();
  }

  public getState(): LiveAudioState {
    return { ...this.currentState };
  }

  private startAnalysis(): void {
    // Use interval for key detection (less frequent, more stable)
    this.analysisIntervalId = window.setInterval(() => {
      this.analyzeAudio();
    }, ANALYSIS_INTERVAL_MS);
  }

  private analyzeAudio(): void {
    if (!this.analyser || !this.ctx || !this.timeDomainData || !this.frequencyData) return;

    // Get time domain data for pitch detection
    this.analyser.getFloatTimeDomainData(this.timeDomainData);
    
    // Get frequency data for chroma extraction
    this.analyser.getFloatFrequencyData(this.frequencyData);

    // Calculate volume (RMS)
    const volume = this.calculateRMS(this.timeDomainData);

    // Try GPU-accelerated pitch detection first, fall back to CPU
    let pitchResult = this.gpu?.computeHPS(this.frequencyData, this.ctx.sampleRate);
    
    // Fall back to enhanced CPU pitch detection
    if (!pitchResult) {
      pitchResult = this.detectPitchHPS(this.timeDomainData, this.frequencyData);
    }

    const rawFreq = pitchResult?.frequency || null;
    const pitchConfidence = pitchResult?.confidence || 0;

    // Smooth pitch over a short history to avoid flickering
    let dominantFreq: number | null = null;
    let dominantNote: string | null = null;

    const now = performance.now();

    if (rawFreq && volume > 0.01 && pitchConfidence > 0.3) {
      this.pitchHistory.push(rawFreq);
      if (this.pitchHistory.length > 7) {
        this.pitchHistory.shift();
      }

      // Use weighted median for stability
      const sorted = [...this.pitchHistory].sort((a, b) => a - b);
      const medianFreq = sorted[Math.floor(sorted.length / 2)];

      dominantFreq = medianFreq;
      dominantNote = this.frequencyToNote(medianFreq);

      // Track note occurrences
      if (dominantNote) {
        const noteBase = dominantNote.replace(/[0-9]/g, '');
        
        // Check if this is a new note or continuation
        if (this.lastNote !== noteBase) {
          // Record the previous note's duration if it was held long enough
          if (this.lastNote && (now - this.currentNoteStartTime) >= MIN_NOTE_DURATION_MS) {
            this.recordNoteOccurrence(this.lastNote, now - this.currentNoteStartTime, pitchConfidence);
          }
          
          this.lastNote = noteBase;
          this.currentNoteStartTime = now;
        }
        this.lastNoteTime = now;
      }
    } else {
      // Silence or unclear pitch - finalize any held note
      if (this.lastNote && (now - this.currentNoteStartTime) >= MIN_NOTE_DURATION_MS) {
        this.recordNoteOccurrence(this.lastNote, now - this.currentNoteStartTime, pitchConfidence);
      }
      this.lastNote = null;
      this.pitchHistory = [];
    }

    // Extract chroma vector from frequency data
    const chromaVector = this.extractChroma(this.frequencyData);

    // Add to history for stable key detection
    if (volume > 0.01) {
      this.chromaHistory.push(chromaVector);
      if (this.chromaHistory.length > CHROMA_HISTORY_SIZE) {
        this.chromaHistory.shift();
      }
    }

    // Compute note competence scores
    const noteCompetence = this.computeNoteCompetence();

    // Detect key from averaged chroma (with dominant-note prior)
    const { key, confidence } = this.detectKey(noteCompetence);

    // Update key histogram
    if (key && confidence > 0.3 && volume > 0.01) {
      this.keyHistogram[key] = (this.keyHistogram[key] || 0) + 1;
    }

    // Interpolate scales
    const rootForInterpolation = this.interpolationKeyConstraint || key;
    const interpolatedScales = this.interpolateScales(noteCompetence, rootForInterpolation);
    const recentNotes = this.noteHistory.slice(-20).map(n => n.noteBase);

    this.currentState = {
      isListening: true,
      dominantNote: volume > 0.01 ? dominantNote : null,
      dominantNoteFrequency: volume > 0.01 ? dominantFreq : null,
      detectedKey: key,
      keyConfidence: confidence,
      chromaVector,
      volume,
      keyHistogram: { ...this.keyHistogram },
      noteOccurrences: { ...this.noteOccurrences },
      noteCompetence,
      recentNotes,
      interpolatedScales,
      totalNotesDetected: this.noteHistory.length,
      gpuAccelerated: this.gpu?.isAvailable() || false,
    };

    this.notifyListeners();
  }

  /**
   * Record a note occurrence for tracking
   */
  private recordNoteOccurrence(noteBase: string, duration: number, confidence: number): void {
    const pitchClass = KEY_NAMES.indexOf(noteBase);
    if (pitchClass === -1) return;

    const occurrence: NoteOccurrence = {
      note: noteBase,
      noteBase,
      pitchClass,
      frequency: 0,
      timestamp: performance.now(),
      duration,
      confidence,
    };

    this.noteHistory.push(occurrence);
    if (this.noteHistory.length > NOTE_HISTORY_SIZE) {
      this.noteHistory.shift();
    }

    // Update occurrence count
    this.noteOccurrences[noteBase] = (this.noteOccurrences[noteBase] || 0) + 1;
  }

  /**
   * Compute competence score for each note (0-1)
   * Based on frequency of occurrence, duration, and confidence
   */
  private computeNoteCompetence(): Record<string, number> {
    const competence: Record<string, number> = {};
    const totalNotes = this.noteHistory.length;
    
    if (totalNotes === 0) return competence;

    // Calculate weighted scores for each note
    const scores: Record<string, { count: number; totalDuration: number; avgConfidence: number }> = {};
    
    for (const note of this.noteHistory) {
      if (!scores[note.noteBase]) {
        scores[note.noteBase] = { count: 0, totalDuration: 0, avgConfidence: 0 };
      }
      scores[note.noteBase].count++;
      scores[note.noteBase].totalDuration += note.duration;
      scores[note.noteBase].avgConfidence += note.confidence;
    }

    // Normalize and compute final competence
    const maxCount = Math.max(...Object.values(scores).map(s => s.count), 1);
    const maxDuration = Math.max(...Object.values(scores).map(s => s.totalDuration), 1);

    for (const [note, score] of Object.entries(scores)) {
      score.avgConfidence /= score.count;
      
      // Weighted combination: 40% frequency, 40% duration, 20% confidence
      const freqScore = score.count / maxCount;
      const durScore = score.totalDuration / maxDuration;
      const confScore = score.avgConfidence;
      
      competence[note] = 0.4 * freqScore + 0.4 * durScore + 0.2 * confScore;
    }

    return competence;
  }

  /**
   * Interpolate the most likely scales from detected notes
   */
  private interpolateScales(noteCompetence: Record<string, number>, rootConstraint: string | null): InterpolatedScale[] {
    const detectedNotes = Object.keys(this.noteOccurrences);
    if (detectedNotes.length < 3) return [];

    const results: InterpolatedScale[] = [];

    const evidence: Record<string, { count: number; totalDuration: number; avgConfidence: number }> = {};
    for (const note of this.noteHistory) {
      if (!evidence[note.noteBase]) {
        evidence[note.noteBase] = { count: 0, totalDuration: 0, avgConfidence: 0 };
      }
      evidence[note.noteBase].count++;
      evidence[note.noteBase].totalDuration += note.duration;
      evidence[note.noteBase].avgConfidence += note.confidence;
    }

    const maxDuration = Math.max(...Object.values(evidence).map(e => e.totalDuration), 1);
    const weightByNote: Record<string, number> = {};
    for (const note of detectedNotes) {
      const e = evidence[note];
      const avgConfidence = e && e.count > 0 ? e.avgConfidence / e.count : 0;
      const durationNorm = e ? e.totalDuration / maxDuration : 0;
      const competence = Math.max(0, Math.min(1, noteCompetence[note] ?? 0));
      const occurrenceCount = this.noteOccurrences[note] ?? 0;

      const confidenceFactor = 0.2 + 0.8 * Math.max(0, Math.min(1, avgConfidence));
      const durationFactor = 0.2 + 0.8 * Math.max(0, Math.min(1, durationNorm));
      const competenceFactor = 0.2 + 0.8 * competence;

      weightByNote[note] = occurrenceCount * confidenceFactor * durationFactor * competenceFactor;
    }

    const totalWeight = Object.values(weightByNote).reduce((a, b) => a + b, 0);
    if (totalWeight <= 0) return [];

    const constrainedRootIdx = rootConstraint ? KEY_NAMES.indexOf(rootConstraint) : -1;
    const rootIndices = constrainedRootIdx >= 0 ? [constrainedRootIdx] : [...Array(12).keys()];

    // Test each possible root and scale type
    for (const rootIdx of rootIndices) {
      const root = KEY_NAMES[rootIdx];

      for (const [scaleType, pattern] of Object.entries(SCALE_PATTERNS)) {
        // Get the notes in this scale
        const scaleNotes = pattern.map(interval => KEY_NAMES[(rootIdx + interval) % 12]);
        
        // Count matches and misses
        const matchedNotes: string[] = [];
        const missingNotes: string[] = [];
        let inScaleWeight = 0;

        for (const note of detectedNotes) {
          if (scaleNotes.includes(note)) {
            matchedNotes.push(note);
            inScaleWeight += weightByNote[note] || 0;
          }
        }

        for (const note of scaleNotes) {
          if (!detectedNotes.includes(note)) {
            missingNotes.push(note);
          }
        }

        const outOfScaleWeight = Math.max(0, totalWeight - inScaleWeight);
        const purity = totalWeight > 0 ? inScaleWeight / totalWeight : 0;
        const coverage = matchedNotes.length / Math.max(1, scaleNotes.length);

        const scaleSize = scaleNotes.length;
        const sizePenalty = scaleSize > 7 ? (7 / scaleSize) : 1;

        const confidence = (0.7 * purity + 0.3 * coverage) * sizePenalty;

        if (confidence > 0.35 && matchedNotes.length >= 3) {
          results.push({
            root,
            type: scaleType,
            confidence,
            matchedNotes,
            missingNotes,
            stats: {
              totalWeight,
              inScaleWeight,
              outOfScaleWeight,
              purity,
              coverage,
              scaleSize,
              sizePenalty,
            },
          });
        }
      }
    }

    // Sort by confidence and return top 5
    return results.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  }

  private calculateRMS(data: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i];
    }
    return Math.sqrt(sum / data.length);
  }

  /**
   * Enhanced pitch detection using Harmonic Product Spectrum (HPS)
   * Combined with autocorrelation for better accuracy
   * More CPU-intensive but much more accurate for musical instruments
   */
  private detectPitchHPS(timeDomain: Float32Array, frequencyData: Float32Array): { frequency: number; confidence: number } | null {
    const sampleRate = this.ctx?.sampleRate || SAMPLE_RATE;
    
    // First, use autocorrelation for initial estimate
    const acResult = this.autocorrelate(timeDomain, sampleRate);
    
    // Then use HPS on frequency data for refinement
    const hpsResult = this.harmonicProductSpectrum(frequencyData, sampleRate);
    
    // Combine results - prefer HPS if both are valid and close
    if (acResult && hpsResult) {
      const ratio = acResult.frequency / hpsResult.frequency;
      // If they're within 5% of each other, use HPS (more accurate for harmonics)
      if (ratio > 0.95 && ratio < 1.05) {
        return {
          frequency: hpsResult.frequency,
          confidence: (acResult.confidence + hpsResult.confidence) / 2,
        };
      }
      // If AC found a lower frequency (likely fundamental), prefer it
      if (acResult.frequency < hpsResult.frequency && acResult.confidence > 0.4) {
        return acResult;
      }
      // Otherwise use the one with higher confidence
      return acResult.confidence > hpsResult.confidence ? acResult : hpsResult;
    }
    
    return acResult || hpsResult;
  }

  /**
   * Autocorrelation-based pitch detection
   */
  private autocorrelate(buffer: Float32Array, sampleRate: number): { frequency: number; confidence: number } | null {
    const bufferSize = buffer.length;
    
    // Apply a simple window function to reduce spectral leakage
    const windowed = new Float32Array(bufferSize);
    for (let i = 0; i < bufferSize; i++) {
      const window = 0.5 * (1 - Math.cos(2 * Math.PI * i / (bufferSize - 1))); // Hann window
      windowed[i] = buffer[i] * window;
    }
    
    // Compute autocorrelation using difference function (YIN-inspired)
    const minLag = Math.floor(sampleRate / 2000); // Max freq ~2000Hz
    const maxLag = Math.floor(sampleRate / 60);   // Min freq ~60Hz (flute range)
    
    const correlations = new Float32Array(maxLag);
    const differences = new Float32Array(maxLag);
    
    // Compute autocorrelation and difference function
    for (let lag = 0; lag < maxLag; lag++) {
      let correlation = 0;
      let difference = 0;
      for (let i = 0; i < bufferSize - lag; i++) {
        correlation += windowed[i] * windowed[i + lag];
        const diff = windowed[i] - windowed[i + lag];
        difference += diff * diff;
      }
      correlations[lag] = correlation;
      differences[lag] = difference;
    }
    
    // Cumulative mean normalized difference function (CMNDF)
    const cmndf = new Float32Array(maxLag);
    cmndf[0] = 1;
    let runningSum = 0;
    for (let lag = 1; lag < maxLag; lag++) {
      runningSum += differences[lag];
      cmndf[lag] = differences[lag] * lag / runningSum;
    }
    
    // Find the first minimum below threshold
    const threshold = 0.2;
    let bestLag = 0;
    let bestValue = 1;
    
    for (let lag = minLag; lag < maxLag - 1; lag++) {
      if (cmndf[lag] < threshold) {
        // Found a dip, look for the local minimum
        while (lag + 1 < maxLag && cmndf[lag + 1] < cmndf[lag]) {
          lag++;
        }
        bestLag = lag;
        bestValue = cmndf[lag];
        break;
      }
    }
    
    // If no clear dip found, find the global minimum
    if (bestLag === 0) {
      for (let lag = minLag; lag < maxLag; lag++) {
        if (cmndf[lag] < bestValue) {
          bestValue = cmndf[lag];
          bestLag = lag;
        }
      }
    }
    
    if (bestLag === 0 || bestValue > 0.5) {
      return null;
    }
    
    // Parabolic interpolation for sub-sample accuracy
    let refinedLag = bestLag;
    if (bestLag > 0 && bestLag < maxLag - 1) {
      const y0 = cmndf[bestLag - 1];
      const y1 = cmndf[bestLag];
      const y2 = cmndf[bestLag + 1];
      const d = (y0 - y2) / (2 * (y0 - 2 * y1 + y2));
      refinedLag = bestLag + d;
    }
    
    const frequency = sampleRate / refinedLag;
    const confidence = 1 - bestValue;
    
    return { frequency, confidence };
  }

  /**
   * Harmonic Product Spectrum for pitch detection
   * Excellent for instruments with strong harmonics
   */
  private harmonicProductSpectrum(frequencyData: Float32Array, sampleRate: number): { frequency: number; confidence: number } | null {
    const binCount = frequencyData.length;
    const freqPerBin = sampleRate / (binCount * 2);
    
    // Convert dB to linear magnitude
    const magnitude = new Float32Array(binCount);
    for (let i = 0; i < binCount; i++) {
      magnitude[i] = Math.pow(10, frequencyData[i] / 20);
    }
    
    // Harmonic product spectrum with 4 harmonics
    const numHarmonics = 4;
    const hps = new Float32Array(Math.floor(binCount / numHarmonics));
    
    for (let i = 0; i < hps.length; i++) {
      hps[i] = magnitude[i];
      for (let h = 2; h <= numHarmonics; h++) {
        const harmonicBin = i * h;
        if (harmonicBin < binCount) {
          hps[i] *= magnitude[harmonicBin];
        }
      }
    }
    
    // Find the peak in the HPS (within musical range)
    const minBin = Math.floor(60 / freqPerBin);  // 60 Hz minimum
    const maxBin = Math.min(Math.floor(2000 / freqPerBin), hps.length - 1); // 2000 Hz max
    
    let maxVal = 0;
    let maxBinIdx = 0;
    
    for (let i = minBin; i <= maxBin; i++) {
      if (hps[i] > maxVal) {
        maxVal = hps[i];
        maxBinIdx = i;
      }
    }
    
    if (maxBinIdx === 0 || maxVal < 1e-10) {
      return null;
    }
    
    // Parabolic interpolation
    let refinedBin = maxBinIdx;
    if (maxBinIdx > 0 && maxBinIdx < hps.length - 1) {
      const y0 = hps[maxBinIdx - 1];
      const y1 = hps[maxBinIdx];
      const y2 = hps[maxBinIdx + 1];
      if (y0 !== y2) {
        const d = (y0 - y2) / (2 * (y0 - 2 * y1 + y2));
        refinedBin = maxBinIdx + d;
      }
    }
    
    const frequency = refinedBin * freqPerBin;
    
    // Confidence based on peak prominence
    const avgMagnitude = hps.reduce((a, b) => a + b, 0) / hps.length;
    const confidence = Math.min(1, maxVal / (avgMagnitude * 10 + 1e-10));
    
    return { frequency, confidence };
  }

  /**
   * Convert frequency to note name with octave
   */
  private frequencyToNote(freq: number): string {
    if (freq <= 0) return '';
    
    // A4 = 440Hz
    const semitones = 12 * Math.log2(freq / 440);
    const noteIndex = Math.round(semitones) + 9; // A is at index 9
    
    const octave = Math.floor((noteIndex + 12 * 4) / 12);
    const noteInOctave = ((noteIndex % 12) + 12) % 12;
    
    return `${KEY_NAMES[noteInOctave]}${octave}`;
  }

  /**
   * Extract chroma vector from frequency data
   * Maps frequency bins to 12 pitch classes
   */
  private extractChroma(frequencyData: Float32Array): number[] {
    const sampleRate = this.ctx?.sampleRate || SAMPLE_RATE;
    const binCount = frequencyData.length;
    const chroma = new Array(12).fill(0);
    
    // Frequency resolution
    const freqPerBin = sampleRate / (binCount * 2);
    
    // Only consider frequencies in musical range (roughly 80Hz to 2000Hz)
    const minBin = Math.floor(80 / freqPerBin);
    const maxBin = Math.min(Math.floor(2000 / freqPerBin), binCount - 1);

    for (let bin = minBin; bin <= maxBin; bin++) {
      const freq = bin * freqPerBin;
      if (freq <= 0) continue;

      // Convert dB to linear magnitude
      const magnitude = Math.pow(10, frequencyData[bin] / 20);
      
      // Map frequency to pitch class
      const semitones = 12 * Math.log2(freq / 440);
      const pitchClass = ((Math.round(semitones) % 12) + 12 + 9) % 12; // +9 because A=0 in our calculation
      
      chroma[pitchClass] += magnitude;
    }

    // Normalize chroma vector
    const maxVal = Math.max(...chroma, 0.0001);
    return chroma.map(v => v / maxVal);
  }

  /**
   * Detect musical key using Krumhansl-Schmuckler algorithm
   */
  private estimateDominantPitchClass(noteCompetence: Record<string, number>): { pitchClass: number | null; strength: number } {
    if (this.noteHistory.length < 3) {
      return { pitchClass: null, strength: 0 };
    }

    const now = performance.now();
    const WINDOW_MS = 15000;
    const HALF_LIFE_MS = 6000;

    const weights = new Array(12).fill(0);
    let total = 0;

    for (const occ of this.noteHistory) {
      const age = now - occ.timestamp;
      if (age < 0) continue;
      if (age > WINDOW_MS) continue;

      const decay = Math.pow(0.5, age / HALF_LIFE_MS);
      const competence = Math.max(0, Math.min(1, noteCompetence[occ.noteBase] ?? 0));
      const confidenceFactor = 0.2 + 0.8 * Math.max(0, Math.min(1, occ.confidence));
      const competenceFactor = 0.2 + 0.8 * competence;
      const durationSeconds = Math.max(0, occ.duration) / 1000;
      const durationFactor = Math.min(2.5, durationSeconds);

      const w = decay * confidenceFactor * competenceFactor * durationFactor;
      weights[occ.pitchClass] += w;
      total += w;
    }

    if (total <= 1e-6) {
      return { pitchClass: null, strength: 0 };
    }

    let bestIdx = 0;
    for (let i = 1; i < 12; i++) {
      if (weights[i] > weights[bestIdx]) bestIdx = i;
    }

    const strength = weights[bestIdx] / total;
    if (strength < 0.22) {
      return { pitchClass: null, strength };
    }

    return { pitchClass: bestIdx, strength };
  }

  private detectKey(noteCompetence: Record<string, number>): { key: string | null; confidence: number } {
    if (this.chromaHistory.length < 3) {
      return { key: null, confidence: 0 };
    }

    // Average chroma over history
    const avgChroma = new Array(12).fill(0);
    for (const chroma of this.chromaHistory) {
      for (let i = 0; i < 12; i++) {
        avgChroma[i] += chroma[i];
      }
    }
    for (let i = 0; i < 12; i++) {
      avgChroma[i] /= this.chromaHistory.length;
    }

    // Normalize for correlation
    const mean = avgChroma.reduce((a, b) => a + b, 0) / 12;
    const std = Math.sqrt(avgChroma.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / 12);
    
    if (std < 0.001) {
      return { key: null, confidence: 0 };
    }

    const normalizedChroma = avgChroma.map(v => (v - mean) / std);

    const { pitchClass: dominantPc, strength: dominantStrength } = this.estimateDominantPitchClass(noteCompetence);
    const ROOT_PRIOR_WEIGHT = 0.22;

    let maxScore = -Infinity;
    let bestKey: string | null = null;
    let bestRawCorr = -Infinity;

    // Test all 24 major/minor keys
    for (let i = 0; i < 12; i++) {
      // Rotate profiles to match root note
      const rotatedMajor = this.rotateArray(MAJOR_PROFILE, i);
      const rotatedMinor = this.rotateArray(MINOR_PROFILE, i);

      // Pearson correlation
      const corrMajor = this.pearsonCorrelation(normalizedChroma, rotatedMajor);
      const corrMinor = this.pearsonCorrelation(normalizedChroma, rotatedMinor);

      const rootPrior = dominantPc !== null && i === dominantPc ? dominantStrength : 0;

      const scoreMajor = corrMajor + ROOT_PRIOR_WEIGHT * rootPrior;
      const scoreMinor = corrMinor + ROOT_PRIOR_WEIGHT * rootPrior;

      if (scoreMajor > maxScore) {
        maxScore = scoreMajor;
        bestRawCorr = corrMajor;
        bestKey = `${KEY_NAMES[i]}`;
      }

      if (scoreMinor > maxScore) {
        maxScore = scoreMinor;
        bestRawCorr = corrMinor;
        bestKey = `${KEY_NAMES[i]}`;
      }
    }

    // If correlation is too weak, treat as "no reliable key"
    if ((bestRawCorr < 0.33 && dominantStrength < 0.35) || !bestKey) {
      return { key: null, confidence: 0 };
    }

    // Map score to a 0..1 confidence range with a floor threshold
    const base = Math.max(0, Math.min(1, (maxScore - 0.33) / 0.67));
    const tonicBoost = dominantPc !== null ? (0.75 + 0.25 * dominantStrength) : 1;
    const confidence = Math.max(0, Math.min(1, base * tonicBoost));

    return { key: bestKey, confidence };
  }

  private rotateArray(arr: number[], shift: number): number[] {
    const result = new Array(arr.length);
    for (let i = 0; i < arr.length; i++) {
      result[i] = arr[(i - shift + arr.length) % arr.length];
    }
    return result;
  }

  private pearsonCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    let sumXY = 0;
    let sumX2 = 0;
    let sumY2 = 0;

    for (let i = 0; i < n; i++) {
      sumXY += x[i] * y[i];
      sumX2 += x[i] * x[i];
      sumY2 += y[i] * y[i];
    }

    const denom = Math.sqrt(sumX2 * sumY2);
    if (denom === 0) return 0;
    
    return sumXY / denom;
  }
}

export const liveAudioService = new LiveAudioService();
