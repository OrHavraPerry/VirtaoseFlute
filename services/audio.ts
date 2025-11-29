
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

  // Instruments
  private gainNode: GainNode | null = null;
  private drums: DrumMachine | null = null;
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
      this.gainNode = this.ctx.createGain();
      this.gainNode.connect(this.ctx.destination);
      this.gainNode.gain.value = 0.4; // Master volume

      this.drums = new DrumMachine(this.ctx, this.gainNode);
      this.piano = new PolySynth(this.ctx, this.gainNode);
      this.bass = new MonoSynth(this.ctx, this.gainNode);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
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

  private playStep(time: number, step: number, bar: number) {
    if (!this.ctx || !this.drums || !this.piano || !this.bass) return;

    const pattern = this.getActiveRhythmPattern();
    const progressionIndices = this.getActiveProgression();
    
    // Calculate current chord based on Bar number
    // Fallback to avoid undefined access
    const chordIndex = bar % (progressionIndices.length || 1);
    const rootScaleDegree = progressionIndices[chordIndex] || 0;

    const scaleNotes = MusicTheory.getScaleNotes(this.scaleRoot, this.scaleType);
    const triadNotes = MusicTheory.getChordNotes(rootScaleDegree, scaleNotes);

    // Sync Visuals: Notify on the first step of the bar (Downbeat)
    if (step === 0) {
        // Convert note names back to scale indices for the UI
        const indices = triadNotes.map(noteName => scaleNotes.indexOf(noteName));
        
        // Dispatch slightly in future to match audio
        const delay = (time - this.ctx.currentTime) * 1000;
        setTimeout(() => {
            if (this.isPlaying) {
                this.listeners.forEach(cb => cb(indices));
            }
        }, Math.max(0, delay));
    }

    // --- DRUMS ---
    if (pattern.kick[step]) this.drums.playKick(time);
    if (pattern.snare[step]) this.drums.playSnare(time);
    if (pattern.hihat[step]) this.drums.playHiHat(time, step % 4 === 2); // Open hat on off-beat slightly?

    // --- BASS ---
    if (pattern.bass[step]) {
        // Simple bass: Play Root of current chord
        const note = triadNotes[0]; // Root of triad
        if (note) {
            const freq = MusicTheory.getFrequency(`${note}2`); // Low octave
            // Duration: 16th note
            this.bass.playBass(freq, time, 0.2); 
        }
    }

    // --- CHORDS ---
    if (this.chordsEnabled && pattern.chord[step]) {
        const freqs = triadNotes.map(n => n ? MusicTheory.getFrequency(`${n}4`) : 0).filter(f => f > 0);
        // Longer duration for chords usually, unless funk
        if (freqs.length > 0) {
            this.piano.playChord(freqs, time, 0.4);
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
