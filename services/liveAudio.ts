/**
 * Live Audio Analysis Service
 * Analyzes microphone input to detect dominant pitch and musical key
 * using the Krumhansl-Schmuckler key-finding algorithm
 */

import { NoteName, ScaleType } from '../types';
import { NOTES_ORDER } from '../constants';

// --- Configuration ---
const SAMPLE_RATE = 22050;
const FFT_SIZE = 4096;
const ANALYSIS_INTERVAL_MS = 100; // How often to analyze (ms)
const CHROMA_HISTORY_SIZE = 20; // Number of chroma frames to average for key detection

// --- Krumhansl-Schmuckler Key Profiles ---
// These represent the relative stability/presence of notes in a key
const MAJOR_PROFILE_RAW = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR_PROFILE_RAW = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

// Normalize profiles
function normalizeProfile(profile: number[]): number[] {
  const mean = profile.reduce((a, b) => a + b, 0) / profile.length;
  const std = Math.sqrt(profile.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / profile.length);
  return profile.map(v => (v - mean) / std);
}

const MAJOR_PROFILE = normalizeProfile(MAJOR_PROFILE_RAW);
const MINOR_PROFILE = normalizeProfile(MINOR_PROFILE_RAW);

const KEY_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export interface LiveAudioState {
  isListening: boolean;
  dominantNote: string | null;
  dominantNoteFrequency: number | null;
  detectedKey: string | null;
  keyConfidence: number;
  chromaVector: number[];
  volume: number;
  keyHistogram: Record<string, number>; // Histogram of detected keys
}

type LiveAudioListener = (state: LiveAudioState) => void;

class LiveAudioService {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  
  private isListening: boolean = false;
  private animationFrameId: number | null = null;
  private analysisIntervalId: number | null = null;
  
  // Buffers
  private timeDomainData: Float32Array<ArrayBuffer> | null = null;
  private frequencyData: Float32Array<ArrayBuffer> | null = null;
  
  // Chroma history for stable key detection
  private chromaHistory: number[][] = [];
  // Recent pitch history for stable current note detection
  private pitchHistory: number[] = [];
  
  // Key histogram tracking
  private keyHistogram: Record<string, number> = {};
  
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
  };
  
  private listeners: LiveAudioListener[] = [];

  constructor() {}

  public subscribe(listener: LiveAudioListener): () => void {
    this.listeners.push(listener);
    // Immediately send current state
    listener(this.currentState);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(l => l(this.currentState));
  }

  public async start(): Promise<void> {
    if (this.isListening) return;

    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: SAMPLE_RATE,
        }
      });

      // Create audio context
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: SAMPLE_RATE,
      });

      // Create analyser node
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = FFT_SIZE;
      this.analyser.smoothingTimeConstant = 0.8;

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
      
      this.currentState = {
        ...this.currentState,
        isListening: true,
        keyHistogram: {},
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

    this.currentState = {
      isListening: false,
      dominantNote: null,
      dominantNoteFrequency: null,
      detectedKey: null,
      keyConfidence: 0,
      chromaVector: new Array(12).fill(0),
      volume: 0,
      keyHistogram: {},
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

    // Detect dominant pitch using autocorrelation (raw frequency)
    const { frequency: rawFreq } = this.detectPitch(this.timeDomainData);

    // Smooth pitch over a short history to avoid flickering to harmonics
    let dominantFreq: number | null = null;
    let dominantNote: string | null = null;

    if (rawFreq && volume > 0.01) {
      this.pitchHistory.push(rawFreq);
      if (this.pitchHistory.length > 5) {
        this.pitchHistory.shift();
      }

      const sorted = [...this.pitchHistory].sort((a, b) => a - b);
      const medianFreq = sorted[Math.floor(sorted.length / 2)];

      dominantFreq = medianFreq;
      dominantNote = this.frequencyToNote(medianFreq);
    } else {
      this.pitchHistory = [];
    }

    // Extract chroma vector from frequency data
    const chromaVector = this.extractChroma(this.frequencyData);

    // Add to history for stable key detection
    if (volume > 0.01) { // Only add if there's meaningful audio
      this.chromaHistory.push(chromaVector);
      if (this.chromaHistory.length > CHROMA_HISTORY_SIZE) {
        this.chromaHistory.shift();
      }
    }

    // Detect key from averaged chroma
    const { key, confidence } = this.detectKey();

    // Update key histogram if we have a valid key detection with good confidence
    if (key && confidence > 0.3 && volume > 0.01) {
      this.keyHistogram[key] = (this.keyHistogram[key] || 0) + 1;
    }

    this.currentState = {
      isListening: true,
      dominantNote: volume > 0.01 ? dominantNote : null,
      dominantNoteFrequency: volume > 0.01 ? dominantFreq : null,
      detectedKey: key,
      keyConfidence: confidence,
      chromaVector,
      volume,
      keyHistogram: { ...this.keyHistogram },
    };

    this.notifyListeners();
  }

  private calculateRMS(data: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i];
    }
    return Math.sqrt(sum / data.length);
  }

  /**
   * Pitch detection using autocorrelation method
   * Good for monophonic signals like flute
   */
  private detectPitch(buffer: Float32Array): { frequency: number | null } {
    const sampleRate = this.ctx?.sampleRate || SAMPLE_RATE;
    const bufferSize = buffer.length;
    
    // Autocorrelation
    const correlations = new Float32Array(bufferSize);
    
    for (let lag = 0; lag < bufferSize; lag++) {
      let sum = 0;
      for (let i = 0; i < bufferSize - lag; i++) {
        sum += buffer[i] * buffer[i + lag];
      }
      correlations[lag] = sum;
    }

    // Find the first peak after the initial decay
    // Skip the first few samples (too high frequency)
    const minLag = Math.floor(sampleRate / 2000); // Max freq ~2000Hz
    const maxLag = Math.floor(sampleRate / 50);   // Min freq ~50Hz

    let maxScore = -Infinity;
    let bestLagCorr = 0;
    let bestLag = 0;

    // Find first significant peak
    let foundPeak = false;
    for (let lag = minLag; lag < Math.min(maxLag, bufferSize); lag++) {
      const corr = correlations[lag];

      // Bias towards lower frequencies (larger lags) so we prefer the fundamental
      const score = corr * lag;

      if (score > maxScore) {
        maxScore = score;
        bestLagCorr = corr;
        bestLag = lag;
        foundPeak = true;
      }
    }

    if (!foundPeak || bestLag === 0 || bestLagCorr < correlations[0] * 0.1) {
      return { frequency: null };
    }

    const frequency = sampleRate / bestLag;
    return { frequency };
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
  private detectKey(): { key: string | null; confidence: number } {
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

    let maxCorr = -Infinity;
    let bestKey: string | null = null;

    // Test all 24 major/minor keys
    for (let i = 0; i < 12; i++) {
      // Rotate profiles to match root note
      const rotatedMajor = this.rotateArray(MAJOR_PROFILE, i);
      const rotatedMinor = this.rotateArray(MINOR_PROFILE, i);

      // Pearson correlation
      const corrMajor = this.pearsonCorrelation(normalizedChroma, rotatedMajor);
      const corrMinor = this.pearsonCorrelation(normalizedChroma, rotatedMinor);

      if (corrMajor > maxCorr) {
        maxCorr = corrMajor;
        bestKey = `${KEY_NAMES[i]} Major`;
      }

      if (corrMinor > maxCorr) {
        maxCorr = corrMinor;
        bestKey = `${KEY_NAMES[i]} Minor`;
      }
    }

    // If correlation is too weak, treat as "no reliable key"
    if (maxCorr < 0.35 || !bestKey) {
      return { key: null, confidence: 0 };
    }

    // Map correlation to a 0..1 confidence range with a floor threshold
    const confidence = Math.max(0, Math.min(1, (maxCorr - 0.35) / 0.65));

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
