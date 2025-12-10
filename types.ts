
export enum NoteName {
  C = 'C',
  CSharp = 'C#',
  D = 'D',
  DSharp = 'D#',
  E = 'E',
  F = 'F',
  FSharp = 'F#',
  G = 'G',
  GSharp = 'G#',
  A = 'A',
  ASharp = 'A#',
  B = 'B'
}

export enum ScaleType {
  Major = 'Major',
  Minor = 'Minor',
  HarmonicMinor = 'Harmonic Minor',
  MelodicMinor = 'Melodic Minor',
  PentatonicMajor = 'Pentatonic Major',
  PentatonicMinor = 'Pentatonic Minor',
  Blues = 'Blues',
  Dorian = 'Dorian',
  Phrygian = 'Phrygian',
  Lydian = 'Lydian',
  Mixolydian = 'Mixolydian',
  Locrian = 'Locrian',
  WholeTone = 'Whole Tone',
  Hijaz = 'Hijaz (Phrygian Dominant)',
  Hirajoshi = 'Hirajoshi (Japanese)',
  InSen = 'In Sen (Japanese)',
  GypsyMinor = 'Gypsy Minor',
  Arabian = 'Arabian (Double Harmonic)',
  Persian = 'Persian',
  Egyptian = 'Egyptian',
  Chromatic = 'Chromatic',
  // Additional scales
  Bebop = 'Bebop Dominant',
  BebopMajor = 'Bebop Major',
  Diminished = 'Diminished (Whole-Half)',
  DiminishedHalfWhole = 'Diminished (Half-Whole)',
  Augmented = 'Augmented',
  DoubleHarmonic = 'Double Harmonic Major',
  Neapolitan = 'Neapolitan Minor',
  NeapolitanMajor = 'Neapolitan Major',
  Hungarian = 'Hungarian Minor',
  Flamenco = 'Flamenco (Spanish Phrygian)',
  Balinese = 'Balinese (Pelog)',
  Chinese = 'Chinese (Gong)',
  Prometheus = 'Prometheus',
  SuperLocrian = 'Super Locrian (Altered)',
  LydianDominant = 'Lydian Dominant'
}

export enum ProgressionType {
  Classic = 'Classic (I-IV-V-I)',
  Pop = 'Pop (I-V-vi-IV)',
  Jazz = 'Jazz (ii-V-I)',
  DooWop = 'Doo-Wop (I-vi-IV-V)',
  BluesTurn = 'Blues Turn (I-IV-I-V)',
  Andalusian = 'Andalusian (i-VII-VI-V)',
  HijazVamp = 'Hijaz Vamp (I-bII)',
  BossaNova = 'Bossa Nova (I-ii-V)',
  SalsaMontuno = 'Salsa Montuno (I-IV-V-IV)',
  Canon = 'Canon (I-V-vi-iii-IV-I...)',
  CircleOfFifths = 'Circle of Fifths (vi-ii-V-I)',
  RoyalRoad = 'Royal Road (IV-V-iii-vi)',
  TwelveBarBlues = '12-Bar Blues',
  Custom = 'Custom (AI Generated)'
}

export enum RhythmType {
  Standard = 'Standard 4/4',
  Waltz = 'Waltz 3/4',
  Ballad = 'Slow Ballad 4/4',
  March = 'March 2/4',
  Funk = 'Funk 4/4',
  JazzSwing = 'Jazz Swing 4/4',
  Disco = 'Disco 4/4',
  Techno = 'Techno/Trance',
  Reggae = 'Reggae (One Drop)',
  Afrobeat = 'Afrobeat',
  RnB = 'R&B / Soul',
  HipHop = 'Hip Hop (Boom Bap)',
  ChaCha = 'Cha Cha',
  Samba = 'Samba',
  FiveFour = 'Take Five (5/4)',
  SevenEight = 'Prog (7/8)',
  BossaNova = 'Bossa Nova',
  Salsa = 'Salsa (Clave 3-2)',
  // Additional rhythms
  Tango = 'Tango',
  Rumba = 'Rumba',
  Merengue = 'Merengue',
  Cumbia = 'Cumbia',
  Bolero = 'Bolero',
  Shuffle = 'Blues Shuffle',
  Motown = 'Motown',
  NewOrleans = 'New Orleans Second Line',
  Ska = 'Ska',
  Dub = 'Dub',
  DrumAndBass = 'Drum & Bass',
  House = 'House',
  Trap = 'Trap',
  LoFi = 'Lo-Fi Hip Hop',
  NineEight = 'Compound (9/8)',
  SixEight = 'Compound (6/8)',
  Custom = 'Custom (AI Generated)'
}

export interface Scale {
  root: NoteName;
  type: ScaleType;
  notes: string[]; 
}

export interface Fingering {
  note: string; 
  thumb: boolean;      
  thumbBb: boolean;    
  lh1: boolean;
  lh2: boolean;
  lh3: boolean;
  lhPinky: boolean;    
  rh1: boolean;
  rh2: boolean;
  rh3: boolean;
  rhPinkyEb: boolean;  
  rhPinkyCsharp: boolean; 
  rhPinkyC: boolean;      
}

// --- NEW SEQUENCER TYPES ---

export type StepValue = 0 | 1; // 0 = rest, 1 = play

export interface RhythmPattern {
    steps: number; // usually 16 for 4/4
    beatsPerBar: number;
    kick: StepValue[];
    snare: StepValue[];
    hihat: StepValue[];
    bass: StepValue[]; 
    chord: StepValue[];
    // Optional percussion for specific styles
    clave?: StepValue[];
    cowbell?: StepValue[];
    shaker?: StepValue[];
    conga?: StepValue[];
    rimshot?: StepValue[];
    clap?: StepValue[];
    // Additional optional instruments
    tom?: StepValue[];
    crash?: StepValue[];
    ride?: StepValue[];
    tambourine?: StepValue[];
    bongo?: StepValue[];
    timbale?: StepValue[];
    guiro?: StepValue[];
    cabasa?: StepValue[];
    agogo?: StepValue[];
    // Melodic backing elements
    melody?: MelodyNote[];
    counterMelody?: MelodyNote[];
    padChord?: StepValue[];
    arpeggio?: StepValue[];
    name?: string;
}

export interface MelodyNote {
    step: number;           // Which step (0-15 for 16 steps)
    scaleDegree: number;    // 0-6 for 7-note scale, or specific degree
    octaveOffset?: number;  // -1, 0, 1 for octave shift
    duration?: number;      // In steps (1 = 16th note, 4 = quarter note)
    velocity?: number;      // 0-1 for dynamics
}

export interface AIComposition {
  name: string;
  description: string;
  progression: number[]; // Scale degrees
  rhythm: RhythmPattern;
  tempo?: number;
}
