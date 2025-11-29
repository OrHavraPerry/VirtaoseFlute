
import { NoteName, ScaleType, ProgressionType, RhythmType, RhythmPattern, AIComposition } from '../types';
import { RHYTHM_PATTERNS } from '../constants';
import { MusicTheory } from './theory';
import { DrumMachine, PolySynth, MonoSynth } from './instruments';

type ChordChangeListener = (noteIndices: number[]) => void;

const PROGRESSION_MAPS: Record<ProgressionType, number[]> = {
  [ProgressionType.Classic]: [0, 3, 4, 0], 
  [ProgressionType.Pop]: [0, 4, 5, 3],     
  [ProgressionType.Jazz]: [1, 4, 0, 0],    
  [ProgressionType.DooWop]: [0, 5, 3, 4],  
  [ProgressionType.BluesTurn]: [0, 3, 0, 4], 
  [ProgressionType.Andalusian]: [0, 6, 5, 4], 
  [ProgressionType.Canon]: [0, 4, 5, 2, 3, 0, 3, 4], 
  [ProgressionType.CircleOfFifths]: [5, 1, 4, 0], 
  [ProgressionType.RoyalRoad]: [3, 4, 2, 5], 
  [ProgressionType.TwelveBarBlues]: [0, 0, 0, 0, 3, 3, 0, 0, 4, 3, 0, 4],
  [ProgressionType.HijazVamp]: [0, 1, 0, 6], // I - bII - I - vii
  [ProgressionType.BossaNova]: [0, 1, 4, 0], // I - ii - V - I
  [ProgressionType.SalsaMontuno]: [0, 3, 4, 3], // I - IV - V - IV
  [ProgressionType.Custom]: [0, 0, 0, 0] 
};

// Swing amounts per rhythm type (0 = straight, 0.33 = triplet swing)
const SWING_AMOUNTS: Partial<Record<RhythmType, number>> = {
  [RhythmType.JazzSwing]: 0.25,
  [RhythmType.HipHop]: 0.15,
  [RhythmType.RnB]: 0.12,
  [RhythmType.BossaNova]: 0.08,
};

class AudioService {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private tempo: number = 100; // BPM
  
  // Scheduling
  private nextNoteTime: number = 0;
  private timerID: number | null = null;
  private currentStep: number = 0; // 0 - 15 (usually)
  private currentBar: number = 0;
  
  // State
  private scaleRoot: NoteName = NoteName.C;
  private scaleType: ScaleType = ScaleType.Major;
  private progression: ProgressionType = ProgressionType.Classic;
  private rhythm: RhythmType = RhythmType.Standard;
  
  private customProgression: number[] = [0, 4, 5, 3];
  private customRhythm: RhythmPattern = RHYTHM_PATTERNS[RhythmType.Standard];
  private chordsEnabled: boolean = true;

  // Per-bus gain nodes for better mixing
  private masterGain: GainNode | null = null;
  private drumBus: GainNode | null = null;
  private percBus: GainNode | null = null;  // Separate bus for percussion
  private bassBus: GainNode | null = null;
  private chordBus: GainNode | null = null;
  
  // Simple reverb for depth
  private reverbNode: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  
  // Instruments
  private drums: DrumMachine | null = null;
  private perc: DrumMachine | null = null;  // Separate percussion instance
  private piano: PolySynth | null = null;
  private bass: MonoSynth | null = null;

  private listeners: ChordChangeListener[] = [];

  constructor() {}

  public subscribe(listener: ChordChangeListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Master gain for overall volume control
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.7;
      this.masterGain.connect(this.ctx.destination);
      
      // Create simple reverb
      this.reverbGain = this.ctx.createGain();
      this.reverbGain.gain.value = 0.15; // Subtle reverb
      this.reverbGain.connect(this.masterGain);
      this.createReverb();
      
      // Per-bus gains for better mixing balance
      this.drumBus = this.ctx.createGain();
      this.drumBus.gain.value = 0.8;
      this.drumBus.connect(this.masterGain);
      
      // Separate percussion bus (slightly lower, more reverb)
      this.percBus = this.ctx.createGain();
      this.percBus.gain.value = 0.6;
      this.percBus.connect(this.masterGain);
      if (this.reverbGain) this.percBus.connect(this.reverbGain);
      
      this.bassBus = this.ctx.createGain();
      this.bassBus.gain.value = 0.7;
      this.bassBus.connect(this.masterGain);
      
      this.chordBus = this.ctx.createGain();
      this.chordBus.gain.value = 0.5;
      this.chordBus.connect(this.masterGain);
      if (this.reverbGain) this.chordBus.connect(this.reverbGain);

      // Create instruments with their respective buses
      this.drums = new DrumMachine(this.ctx, this.drumBus);
      this.piano = new PolySynth(this.ctx, this.chordBus);
      this.bass = new MonoSynth(this.ctx, this.bassBus);
      
      // Create percussion instrument on separate bus
      this.perc = new DrumMachine(this.ctx, this.percBus!);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
  
  // Create a simple algorithmic reverb impulse
  private createReverb() {
    if (!this.ctx || !this.reverbGain) return;
    
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * 1.5; // 1.5 second reverb
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        // Exponential decay with some randomness
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
      }
    }
    
    this.reverbNode = this.ctx.createConvolver();
    this.reverbNode.buffer = impulse;
    this.reverbNode.connect(this.reverbGain);
  }

  private getActiveRhythmPattern(): RhythmPattern {
    if (this.rhythm === RhythmType.Custom) {
      return this.customRhythm;
    }
    return RHYTHM_PATTERNS[this.rhythm] || RHYTHM_PATTERNS[RhythmType.Standard];
  }

  private getActiveProgression(): number[] {
    if (this.progression === ProgressionType.Custom) {
      return this.customProgression;
    }
    // Fallback to avoid undefined if progression type is not found in map
    return PROGRESSION_MAPS[this.progression] || [0, 0, 0, 0];
  }

  private schedule() {
    if (!this.ctx) return;

    const secondsPerBeat = 60.0 / this.tempo;
    const secondsPerStep = secondsPerBeat / 4; 
    
    const lookahead = 0.1; 

    while (this.nextNoteTime < this.ctx.currentTime + lookahead) {
      this.playStep(this.nextNoteTime, this.currentStep, this.currentBar);
      
      this.nextNoteTime += secondsPerStep;
      this.currentStep++;
      
      const pattern = this.getActiveRhythmPattern();
      
      if (this.currentStep >= pattern.steps) {
        this.currentStep = 0;
        // Bar complete
        this.currentBar++; 
      }
    }
    this.timerID = window.setTimeout(() => this.schedule(), 25);
  }

  // Calculate swing offset for a given step
  private getSwingOffset(step: number): number {
    const swingAmount = SWING_AMOUNTS[this.rhythm] || 0;
    if (swingAmount === 0) return 0;
    
    // Apply swing to off-beat 16ths (steps 1, 3, 5, 7, 9, 11, 13, 15)
    if (step % 2 === 1) {
      const secondsPerBeat = 60.0 / this.tempo;
      const secondsPerStep = secondsPerBeat / 4;
      return secondsPerStep * swingAmount;
    }
    return 0;
  }

  // Get velocity based on step position (accents on strong beats)
  private getStepVelocity(step: number): number {
    // Downbeat (step 0) is strongest
    if (step === 0) return 1.0;
    // Beat 3 (step 8) is also strong
    if (step === 8) return 0.95;
    // Beats 2 and 4 (steps 4, 12) are medium
    if (step === 4 || step === 12) return 0.85;
    // Off-beats are softer
    if (step % 4 === 0) return 0.8;
    // 16th notes are softest
    return 0.7;
  }

  private playStep(time: number, step: number, bar: number) {
    if (!this.ctx || !this.drums || !this.piano || !this.bass || !this.perc) return;

    const pattern = this.getActiveRhythmPattern();
    const progressionIndices = this.getActiveProgression();
    
    // Apply swing timing
    const swungTime = time + this.getSwingOffset(step);
    const velocity = this.getStepVelocity(step);
    
    // Calculate current chord based on Bar number
    const chordIndex = bar % (progressionIndices.length || 1);
    const rootScaleDegree = progressionIndices[chordIndex] || 0;

    const scaleNotes = MusicTheory.getScaleNotes(this.scaleRoot, this.scaleType);
    const triadNotes = MusicTheory.getChordNotes(rootScaleDegree, scaleNotes);

    // Sync Visuals: Notify on the first step of the bar (Downbeat)
    if (step === 0) {
        const indices = triadNotes.map(noteName => scaleNotes.indexOf(noteName));
        
        const delay = (time - this.ctx.currentTime) * 1000;
        setTimeout(() => {
            if (this.isPlaying) {
                this.listeners.forEach(cb => cb(indices));
            }
        }, Math.max(0, delay));
    }

    // --- DRUMS (with velocity and swing) ---
    if (pattern.kick[step]) this.drums.playKick(swungTime, velocity);
    if (pattern.snare[step]) this.drums.playSnare(swungTime, velocity);
    if (pattern.hihat[step]) {
        const isOpen = step % 4 === 2;
        // Hi-hats get slightly lower velocity for groove
        this.drums.playHiHat(swungTime, isOpen, velocity * 0.9);
    }
    
    // --- PERCUSSION (style-specific, on separate bus with reverb) ---
    if (pattern.clave?.[step]) this.perc.playClave(swungTime, velocity);
    if (pattern.cowbell?.[step]) this.perc.playCowbell(swungTime, velocity * 0.8);
    if (pattern.shaker?.[step]) this.perc.playShaker(swungTime, velocity * 0.6);
    if (pattern.conga?.[step]) {
        const isHigh = step % 8 < 4;
        this.perc.playConga(swungTime, isHigh, velocity * 0.85);
    }
    if (pattern.rimshot?.[step]) this.perc.playRimshot(swungTime, velocity);
    if (pattern.clap?.[step]) this.perc.playClap(swungTime, velocity);

    // --- BASS (with swing) ---
    if (pattern.bass[step]) {
        const note = triadNotes[0];
        if (note) {
            const freq = MusicTheory.getFrequency(`${note}2`);
            this.bass.playBass(freq, swungTime, 0.2, velocity);
        }
    }

    // --- CHORDS (with swing and velocity) ---
    if (this.chordsEnabled && pattern.chord[step]) {
        const freqs = triadNotes.map(n => n ? MusicTheory.getFrequency(`${n}4`) : 0).filter(f => f > 0);
        if (freqs.length > 0) {
            this.piano.playChord(freqs, swungTime, 0.4, velocity);
        }
    }
  }

  public start(root: NoteName, type: ScaleType, tempo: number, progression: ProgressionType, rhythm: RhythmType) {
    this.init();
    if (this.isPlaying) return;

    this.scaleRoot = root;
    this.scaleType = type;
    this.tempo = tempo;
    this.progression = progression;
    this.rhythm = rhythm;
    
    this.currentStep = 0;
    this.currentBar = 0;
    
    if (this.ctx) {
        this.nextNoteTime = this.ctx.currentTime + 0.1;
    }
    
    this.isPlaying = true;
    this.schedule();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerID) {
      window.clearTimeout(this.timerID);
      this.timerID = null;
    }
  }

  public updateSettings(root: NoteName, type: ScaleType, tempo: number, progression: ProgressionType, rhythm: RhythmType) {
      this.scaleRoot = root;
      this.scaleType = type;
      this.tempo = tempo;
      this.progression = progression;
      this.rhythm = rhythm;
  }

  public setCustomComposition(composition: AIComposition) {
    this.customProgression = composition.progression;
    this.customRhythm = composition.rhythm;
  }

  public setChordsEnabled(enabled: boolean) {
    this.chordsEnabled = enabled;
  }
}

export const audioService = new AudioService();
