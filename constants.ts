
import { NoteName, ScaleType, Fingering, ProgressionType, RhythmType, RhythmPattern } from './types';

export const NOTES_ORDER = [
  NoteName.C, NoteName.CSharp, NoteName.D, NoteName.DSharp, NoteName.E, 
  NoteName.F, NoteName.FSharp, NoteName.G, NoteName.GSharp, NoteName.A, 
  NoteName.ASharp, NoteName.B
];

export const SCALE_INTERVALS: Record<ScaleType, number[]> = {
  [ScaleType.Major]: [0, 2, 4, 5, 7, 9, 11],
  [ScaleType.Minor]: [0, 2, 3, 5, 7, 8, 10],
  [ScaleType.HarmonicMinor]: [0, 2, 3, 5, 7, 8, 11],
  [ScaleType.MelodicMinor]: [0, 2, 3, 5, 7, 9, 11],
  [ScaleType.PentatonicMajor]: [0, 2, 4, 7, 9],
  [ScaleType.PentatonicMinor]: [0, 3, 5, 7, 10],
  [ScaleType.Blues]: [0, 3, 5, 6, 7, 10], 
  [ScaleType.Dorian]: [0, 2, 3, 5, 7, 9, 10],
  [ScaleType.Phrygian]: [0, 1, 3, 5, 7, 8, 10],
  [ScaleType.Lydian]: [0, 2, 4, 6, 7, 9, 11],
  [ScaleType.Mixolydian]: [0, 2, 4, 5, 7, 9, 10],
  [ScaleType.Locrian]: [0, 1, 3, 5, 6, 8, 10],
  [ScaleType.WholeTone]: [0, 2, 4, 6, 8, 10],
  [ScaleType.Hijaz]: [0, 1, 4, 5, 7, 8, 10], // Phrygian Dominant
  [ScaleType.Hirajoshi]: [0, 2, 3, 7, 8],
  [ScaleType.InSen]: [0, 1, 5, 7, 10],
  [ScaleType.GypsyMinor]: [0, 2, 3, 6, 7, 8, 11],
  [ScaleType.Arabian]: [0, 1, 4, 5, 7, 8, 11], 
  [ScaleType.Persian]: [0, 1, 4, 5, 6, 8, 11],
  [ScaleType.Egyptian]: [0, 2, 5, 7, 10], 
};

// 16-Step Patterns (1 = Trigger, 0 = Silent)
// Standard 4/4 implies 16 steps (16th notes). 4 steps per beat.
// Beat 1 = Step 0. Beat 2 = Step 4. Beat 3 = Step 8. Beat 4 = Step 12.

export const RHYTHM_PATTERNS: Record<RhythmType, RhythmPattern> = {
  [RhythmType.Standard]: {
    steps: 16,
    beatsPerBar: 4,
    kick:  [1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 1, 0,  0, 0, 0, 0],
    snare: [0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0],
    hihat: [1, 0, 1, 0,  1, 0, 1, 0,  1, 0, 1, 0,  1, 0, 1, 0],
    bass:  [1, 0, 0, 1,  0, 0, 1, 0,  1, 0, 0, 0,  0, 0, 0, 0], 
    chord: [1, 0, 0, 0,  0, 0, 1, 0,  0, 0, 0, 0,  1, 0, 0, 0]
  },
  [RhythmType.Waltz]: {
    steps: 12, // 3/4 time, 16th notes -> 3 * 4 = 12 steps
    beatsPerBar: 3,
    kick:  [1, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0],
    snare: [0, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0],
    hihat: [1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0],
    bass:  [1, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0],
    chord: [1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0]
  },
  [RhythmType.Ballad]: {
    steps: 16,
    beatsPerBar: 4,
    kick:  [1, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0],
    snare: [0, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0], 
    hihat: [1, 1, 1, 1,  1, 1, 1, 1,  1, 1, 1, 1,  1, 1, 1, 1], 
    bass:  [1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0],
    chord: [1, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0]  
  },
  [RhythmType.March]: {
    steps: 8, // 2/4 time
    beatsPerBar: 2,
    kick:  [1, 0, 0, 0,  0, 0, 1, 0],
    snare: [0, 0, 1, 0,  1, 0, 1, 0],
    hihat: [1, 0, 1, 0,  1, 0, 1, 0],
    bass:  [1, 0, 0, 0,  0, 0, 1, 0],
    chord: [0, 0, 1, 0,  0, 0, 1, 0]
  },
  [RhythmType.Funk]: {
    steps: 16,
    beatsPerBar: 4,
    kick:  [1, 0, 0, 1,  0, 0, 1, 0,  0, 1, 0, 0,  0, 0, 0, 0],
    snare: [0, 0, 0, 0,  1, 0, 0, 1,  0, 0, 0, 0,  1, 0, 0, 0],
    hihat: [1, 0, 1, 0,  1, 0, 1, 0,  1, 0, 1, 1,  1, 0, 1, 0],
    bass:  [1, 0, 1, 0,  0, 0, 0, 0,  1, 0, 1, 0,  0, 1, 0, 0],
    chord: [0, 0, 1, 0,  0, 0, 1, 0,  0, 0, 0, 0,  0, 0, 1, 0]
  },
  [RhythmType.JazzSwing]: {
    steps: 16,
    beatsPerBar: 4,
    // Ride pattern simulation (Ding, ding-a, ding) on HH. Walking Bass.
    kick:  [1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0], // Soft feathering
    snare: [0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0], // Maybe brushes later
    hihat: [1, 0, 0, 1,  1, 0, 0, 1,  1, 0, 0, 1,  1, 0, 0, 1], // Swing feel approx
    bass:  [1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0], // Walking (Quarter notes)
    chord: [0, 0, 1, 0,  0, 0, 0, 0,  0, 0, 1, 0,  0, 0, 0, 0]  // Comping on off-beats
  },
  [RhythmType.Disco]: {
    steps: 16,
    beatsPerBar: 4,
    // Four on the floor
    kick:  [1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0],
    snare: [0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0],
    hihat: [0, 0, 1, 0,  0, 0, 1, 0,  0, 0, 1, 0,  0, 0, 1, 0], // Open hat on 'and'
    bass:  [0, 0, 1, 0,  0, 0, 1, 0,  0, 0, 1, 0,  0, 0, 1, 0], // Octaves feel
    chord: [1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0],
    cowbell: [1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0], // Classic disco cowbell
    clap: [0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0]
  },
  [RhythmType.Techno]: {
    steps: 16,
    beatsPerBar: 4,
    kick:  [1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0],
    snare: [0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0], // No snare, use clap
    hihat: [0, 0, 1, 0,  0, 0, 1, 0,  0, 0, 1, 0,  0, 0, 1, 0],
    bass:  [0, 0, 1, 1,  0, 0, 1, 1,  0, 0, 1, 1,  0, 0, 1, 1], // Rolling
    chord: [1, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0],
    clap:  [0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0] // Clap on 2 and 4
  },
  [RhythmType.Reggae]: {
    steps: 16,
    beatsPerBar: 4,
    // One Drop (Kick on 3)
    kick:  [0, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0],
    snare: [0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0], // No snare, use rimshot
    hihat: [1, 0, 1, 0,  1, 0, 1, 0,  1, 0, 1, 0,  1, 0, 1, 0],
    bass:  [1, 0, 0, 0,  0, 0, 1, 0,  0, 0, 0, 0,  0, 0, 1, 0], // Leaving space
    chord: [0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0], // Skank on 2 and 4
    rimshot: [0, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0] // Sidestick on 3
  },
  [RhythmType.Afrobeat]: {
    steps: 16,
    beatsPerBar: 4,
    // Tony Allen style: kick on 1, 1e, 3, 3e - syncopated snare
    kick:  [1, 1, 0, 0,  0, 0, 0, 0,  1, 1, 0, 0,  0, 0, 0, 0],
    snare: [0, 0, 0, 0,  1, 0, 0, 1,  0, 0, 0, 0,  1, 0, 0, 0],
    hihat: [1, 0, 1, 1,  1, 0, 1, 1,  1, 0, 1, 1,  1, 0, 1, 1], // 8th + two 16ths pattern
    bass:  [1, 0, 0, 0,  0, 0, 1, 0,  1, 0, 0, 0,  0, 0, 1, 0],
    chord: [0, 0, 1, 0,  0, 0, 0, 1,  0, 0, 1, 0,  0, 0, 0, 1],
    shaker: [1, 1, 1, 1,  1, 1, 1, 1,  1, 1, 1, 1,  1, 1, 1, 1], // Shekere pattern
    conga: [0, 0, 1, 0,  1, 0, 0, 1,  0, 0, 1, 0,  1, 0, 0, 1] // Conga tumbao
  },
  [RhythmType.RnB]: {
    steps: 16,
    beatsPerBar: 4,
    kick:  [1, 0, 0, 0,  0, 0, 1, 0,  0, 0, 0, 0,  0, 0, 1, 0],
    snare: [0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0],
    hihat: [1, 0, 1, 0,  1, 0, 1, 0,  1, 0, 1, 0,  1, 0, 1, 0],
    bass:  [1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0], // Long sustain
    chord: [1, 0, 0, 0,  0, 0, 1, 0,  0, 0, 0, 0,  0, 0, 1, 0]
  },
  [RhythmType.HipHop]: {
    steps: 16,
    beatsPerBar: 4,
    kick:  [1, 0, 0, 0,  0, 0, 1, 1,  0, 0, 0, 0,  0, 1, 0, 0],
    snare: [0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0],
    hihat: [1, 0, 1, 0,  1, 0, 1, 0,  1, 0, 1, 0,  1, 0, 1, 0],
    bass:  [1, 0, 0, 0,  0, 0, 1, 0,  0, 0, 0, 0,  0, 1, 0, 0],
    chord: [1, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0]
  },
  [RhythmType.ChaCha]: {
    steps: 16,
    beatsPerBar: 4,
    // Authentic Cha-Cha-Chá - "one, two, cha-cha-cha"
    kick:  [1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0], // On 1 and 3
    snare: [0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0], // No snare
    hihat: [0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0], // Use guiro
    bass:  [1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 1, 1,  0, 0, 0, 0], // 1, 3, 4-and
    chord: [0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 1, 1,  0, 0, 0, 0], // 2, 4-and (cha-cha-cha)
    cowbell: [1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 1, 1,  0, 0, 0, 0], // Cha-cha-cha bell
    shaker: [1, 0, 1, 0,  1, 0, 1, 0,  1, 0, 1, 0,  1, 0, 1, 0], // Guiro 8ths
    conga: [0, 0, 0, 1,  0, 0, 0, 1,  0, 0, 0, 1,  0, 0, 0, 1] // Conga slaps
  },
  [RhythmType.Samba]: {
    steps: 16,
    beatsPerBar: 4,
    // Authentic Samba - Surdo pattern with tamborim
    kick:  [1, 0, 0, 0,  0, 0, 0, 1,  1, 0, 0, 0,  0, 0, 0, 1], // Surdo 1st (marcação)
    snare: [0, 0, 0, 1,  0, 0, 1, 0,  0, 0, 0, 1,  0, 0, 1, 0], // Caixa pattern
    hihat: [0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0], // Use shaker
    bass:  [1, 0, 0, 0,  0, 0, 0, 1,  1, 0, 0, 0,  0, 0, 0, 1],
    chord: [0, 0, 1, 0,  1, 0, 0, 1,  0, 0, 1, 0,  1, 0, 0, 1], // Cavaquinho strum
    shaker: [1, 1, 1, 1,  1, 1, 1, 1,  1, 1, 1, 1,  1, 1, 1, 1], // Ganzá 16ths
    conga: [0, 1, 0, 0,  1, 0, 1, 0,  0, 1, 0, 0,  1, 0, 1, 0] // Tamborim pattern
  },
  [RhythmType.FiveFour]: {
    steps: 20, // 5 beats * 4 steps
    beatsPerBar: 5,
    // Take Five feel (3 + 2)
    kick:  [1, 0, 0, 0,  0, 0, 1, 0,  0, 0, 1, 0,  0, 0, 0, 0, 0, 0, 0, 0],
    snare: [0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0], // Snare on 2 and 4?
    hihat: [1, 0, 1, 0,  1, 0, 1, 0,  1, 0, 1, 0,  1, 0, 1, 0,  1, 0, 1, 0],
    bass:  [1, 0, 0, 0,  0, 0, 1, 0,  0, 0, 1, 0,  0, 0, 1, 0,  0, 0, 0, 0],
    chord: [1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0]
  },
  [RhythmType.SevenEight]: {
    steps: 14, // 7 beats * 2 steps (using 8th notes as grid for simplicity) or 14 16ths
    beatsPerBar: 7,
    // 2+2+3
    kick:  [1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0,  0, 0],
    snare: [0, 0, 1, 0,  0, 0, 1, 0,  0, 0, 1, 0,  0, 0],
    hihat: [1, 1, 1, 1,  1, 1, 1, 1,  1, 1, 1, 1,  1, 1],
    bass:  [1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0,  0, 0],
    chord: [1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0,  0, 0]
  },
  [RhythmType.BossaNova]: {
    steps: 16,
    beatsPerBar: 4,
    // Authentic Bossa Nova - João Gilberto style
    kick:  [1, 0, 0, 0,  0, 0, 1, 0,  0, 0, 1, 0,  0, 0, 0, 0], // Surdo-inspired
    snare: [0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0], // No snare, use rimshot
    hihat: [1, 0, 1, 0,  1, 0, 1, 0,  1, 0, 1, 0,  1, 0, 1, 0], // Ganza pattern (8ths)
    bass:  [1, 0, 0, 0,  0, 0, 1, 0,  0, 0, 1, 0,  0, 0, 0, 0],
    chord: [1, 0, 0, 1,  0, 0, 1, 0,  0, 1, 0, 0,  1, 0, 0, 0], // Syncopated guitar
    shaker: [1, 1, 1, 1,  1, 1, 1, 1,  1, 1, 1, 1,  1, 1, 1, 1], // Soft 16th shaker
    rimshot: [0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0] // Cross-stick on 2 and 4
  },
  [RhythmType.Salsa]: {
    steps: 16,
    beatsPerBar: 4,
    // Authentic Salsa with Son Clave 3-2
    kick:  [1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0], // Light pulse on 1 and 3
    snare: [0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0], // No snare
    hihat: [0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0], // Use cowbell
    bass:  [1, 0, 0, 0,  0, 0, 0, 1,  0, 0, 1, 0,  0, 0, 0, 1], // Tumbao bass
    chord: [0, 0, 1, 0,  0, 1, 0, 0,  0, 0, 1, 0,  0, 1, 0, 0], // Montuno piano
    // Son Clave 3-2: X..X..X. | ....X..X (positions 0,3,6 | 12,14 in 16ths)
    clave: [1, 0, 0, 1,  0, 0, 1, 0,  0, 0, 0, 0,  1, 0, 1, 0],
    // Cascara/Cowbell pattern
    cowbell: [1, 0, 1, 0,  1, 0, 1, 0,  0, 0, 1, 0,  1, 0, 1, 0],
    conga: [0, 0, 1, 0,  1, 0, 0, 1,  0, 0, 1, 0,  1, 0, 0, 1] // Tumbao conga
  },
  [RhythmType.Custom]: {
    steps: 16,
    beatsPerBar: 4,
    kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    snare: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    bass: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    chord: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    name: 'Custom'
  }
};

// ... keep existing fingering constants ...
// Helper to create fingering object with defaults
const createFingering = (data: Partial<Fingering>): Fingering => ({
    note: '',
    thumb: false, thumbBb: false,
    lh1: false, lh2: false, lh3: false, lhPinky: false,
    rh1: false, rh2: false, rh3: false, 
    rhPinkyEb: false, rhPinkyCsharp: false, rhPinkyC: false,
    ...data
});

// Standard Boehm Flute Fingerings (C4 - C6)
export const FLUTE_FINGERINGS: Record<string, Fingering> = {
  // Low Register
  'C4': createFingering({ note: 'C4', thumb: true, lh1: true, lh2: true, lh3: true, rh1: true, rh2: true, rh3: true, rhPinkyC: true, rhPinkyCsharp: true }),
  'C#4': createFingering({ note: 'C#4', thumb: true, lh1: true, lh2: true, lh3: true, rh1: true, rh2: true, rh3: true, rhPinkyCsharp: true }),
  'D4': createFingering({ note: 'D4', thumb: true, lh1: true, lh2: true, lh3: true, rh1: true, rh2: true, rh3: true }),
  'D#4': createFingering({ note: 'D#4', thumb: true, lh1: true, lh2: true, lh3: true, rh1: true, rh2: true, rh3: true, rhPinkyEb: true }),
  'E4': createFingering({ note: 'E4', thumb: true, lh1: true, lh2: true, lh3: true, rh1: true, rh2: true, rhPinkyEb: true }),
  'F4': createFingering({ note: 'F4', thumb: true, lh1: true, lh2: true, lh3: true, rh1: true, rhPinkyEb: true }),
  'F#4': createFingering({ note: 'F#4', thumb: true, lh1: true, lh2: true, lh3: true, rh3: true, rhPinkyEb: true }),
  'G4': createFingering({ note: 'G4', thumb: true, lh1: true, lh2: true, lh3: true, rhPinkyEb: true }),
  'G#4': createFingering({ note: 'G#4', thumb: true, lh1: true, lh2: true, lh3: true, lhPinky: true, rhPinkyEb: true }),
  'A4': createFingering({ note: 'A4', thumb: true, lh1: true, lh2: true, rhPinkyEb: true }),
  'A#4': createFingering({ note: 'A#4', thumb: true, lh1: true, rh1: true, rhPinkyEb: true }), // 1-1 Fingering usually standard for beginner/charts
  'B4': createFingering({ note: 'B4', thumb: true, lh1: true, rhPinkyEb: true }),
  
  // Middle Register
  'C5': createFingering({ note: 'C5', lh1: true, rhPinkyEb: true }),
  'C#5': createFingering({ note: 'C#5', rhPinkyEb: true }), // Open C#
  'D5': createFingering({ note: 'D5', thumb: true, lh2: true, lh3: true, rh1: true, rh2: true, rh3: true }),
  'D#5': createFingering({ note: 'D#5', thumb: true, lh2: true, lh3: true, rh1: true, rh2: true, rh3: true, rhPinkyEb: true }),
  'E5': createFingering({ note: 'E5', thumb: true, lh1: true, lh2: true, lh3: true, rh1: true, rh2: true, rhPinkyEb: true }),
  'F5': createFingering({ note: 'F5', thumb: true, lh1: true, lh2: true, lh3: true, rh1: true, rh2: true, rhPinkyEb: true }),
  'F#5': createFingering({ note: 'F#5', thumb: true, lh1: true, lh2: true, lh3: true, rh3: true, rhPinkyEb: true }),
  'G5': createFingering({ note: 'G5', thumb: true, lh1: true, lh2: true, lh3: true, rhPinkyEb: true }),
  'G#5': createFingering({ note: 'G#5', thumb: true, lh1: true, lh2: true, lh3: true, lhPinky: true, rhPinkyEb: true }),
  'A5': createFingering({ note: 'A5', thumb: true, lh1: true, lh2: true, rhPinkyEb: true }),
  'A#5': createFingering({ note: 'A#5', thumb: true, lh1: true, rh1: true, rhPinkyEb: true }),
  'B5': createFingering({ note: 'B5', thumb: true, lh1: true, rhPinkyEb: true }),
  'C6': createFingering({ note: 'C6', lh1: true, rhPinkyEb: true }),
};

export const getFingering = (noteName: string): Fingering | null => {
  const base = noteName.replace(/[0-9]/g, '');
  const attempt4 = `${base}4`;
  const attempt5 = `${base}5`;
  
  if (FLUTE_FINGERINGS[noteName]) return FLUTE_FINGERINGS[noteName];
  if (FLUTE_FINGERINGS[attempt5]) return FLUTE_FINGERINGS[attempt5];
  if (FLUTE_FINGERINGS[attempt4]) return FLUTE_FINGERINGS[attempt4];
  
  return null;
};

export const getValidProgressions = (scaleType: ScaleType): ProgressionType[] => {
  const majorScales = [ScaleType.Major, ScaleType.PentatonicMajor, ScaleType.Lydian, ScaleType.Mixolydian, ScaleType.WholeTone];
  const minorScales = [ScaleType.Minor, ScaleType.HarmonicMinor, ScaleType.MelodicMinor, ScaleType.PentatonicMinor, ScaleType.Dorian, ScaleType.Phrygian, ScaleType.Locrian];
  const exoticScales = [ScaleType.Hirajoshi, ScaleType.InSen, ScaleType.GypsyMinor, ScaleType.Arabian, ScaleType.Persian, ScaleType.Egyptian, ScaleType.Hijaz];

  const common = [ProgressionType.Custom];

  if (majorScales.includes(scaleType)) {
    return [
      ProgressionType.Classic,
      ProgressionType.Pop,
      ProgressionType.BossaNova,
      ProgressionType.SalsaMontuno,
      ProgressionType.Jazz,
      ProgressionType.DooWop,
      ProgressionType.Canon,
      ProgressionType.CircleOfFifths,
      ProgressionType.RoyalRoad,
      ...common
    ];
  }

  if (minorScales.includes(scaleType)) {
     return [
      ProgressionType.Andalusian,
      ProgressionType.BossaNova,
      ProgressionType.SalsaMontuno,
      ProgressionType.Jazz,
      ProgressionType.CircleOfFifths,
      ProgressionType.Pop, 
      ...common
     ];
  }

  if (scaleType === ScaleType.Blues) {
    return [
      ProgressionType.TwelveBarBlues, 
      ProgressionType.BluesTurn, 
      ProgressionType.Pop, 
      ...common
    ];
  }

  if (exoticScales.includes(scaleType)) {
    return [
      ProgressionType.HijazVamp,
      ProgressionType.Andalusian, 
      ...common
    ];
  }

  return Object.values(ProgressionType);
}

export const getValidRhythms = (progressionType: ProgressionType): RhythmType[] => {
   const common = [RhythmType.Standard, RhythmType.Ballad, RhythmType.Custom];
   const odd = [RhythmType.FiveFour, RhythmType.SevenEight, RhythmType.Waltz];
   const dance = [RhythmType.Disco, RhythmType.Techno, RhythmType.Funk, RhythmType.HipHop, RhythmType.RnB];

   if (progressionType === ProgressionType.TwelveBarBlues || progressionType === ProgressionType.BluesTurn) {
     return [...common, RhythmType.Funk, RhythmType.HipHop, RhythmType.JazzSwing];
   }
   
   if (progressionType === ProgressionType.Jazz) {
       return [RhythmType.JazzSwing, RhythmType.BossaNova, RhythmType.Ballad, ...odd, RhythmType.Custom];
   }

   if (progressionType === ProgressionType.Pop || progressionType === ProgressionType.Classic) {
       return [...common, ...dance, RhythmType.Reggae];
   }
   
   if (progressionType === ProgressionType.Canon) {
      return [...common, RhythmType.Waltz];
   }

   if (progressionType === ProgressionType.BossaNova) {
       return [RhythmType.BossaNova, RhythmType.Standard, RhythmType.JazzSwing];
   }

   if (progressionType === ProgressionType.SalsaMontuno) {
       return [RhythmType.Salsa, RhythmType.ChaCha, RhythmType.Standard];
   }

   if (progressionType === ProgressionType.HijazVamp) {
       return [RhythmType.Ballad, RhythmType.Afrobeat, RhythmType.Standard]; 
   }

   if (progressionType === ProgressionType.Andalusian) {
       return [RhythmType.Ballad, RhythmType.ChaCha, RhythmType.Standard]; 
   }

   return Object.values(RhythmType);
}
