
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
  [ScaleType.Chromatic]: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  // Jazz scales
  [ScaleType.Bebop]: [0, 2, 4, 5, 7, 9, 10, 11],        // Dominant bebop (adds major 7th)
  [ScaleType.BebopMajor]: [0, 2, 4, 5, 7, 8, 9, 11],    // Major bebop (adds #5)
  // Symmetric scales
  [ScaleType.Diminished]: [0, 2, 3, 5, 6, 8, 9, 11],    // Whole-half diminished
  [ScaleType.DiminishedHalfWhole]: [0, 1, 3, 4, 6, 7, 9, 10], // Half-whole diminished
  [ScaleType.Augmented]: [0, 3, 4, 7, 8, 11],           // Augmented scale
  // European classical scales
  [ScaleType.DoubleHarmonic]: [0, 1, 4, 5, 7, 8, 11],   // Byzantine scale
  [ScaleType.Neapolitan]: [0, 1, 3, 5, 7, 8, 11],       // Neapolitan minor
  [ScaleType.NeapolitanMajor]: [0, 1, 3, 5, 7, 9, 11],  // Neapolitan major
  [ScaleType.Hungarian]: [0, 2, 3, 6, 7, 8, 11],        // Hungarian minor
  [ScaleType.Flamenco]: [0, 1, 4, 5, 7, 8, 10],         // Flamenco mode (Phrygian dominant variant)
  // Asian scales
  [ScaleType.Balinese]: [0, 1, 3, 7, 8],                // Pelog scale
  [ScaleType.Chinese]: [0, 4, 6, 7, 11],                // Chinese pentatonic (Gong)
  // Modern jazz scales
  [ScaleType.Prometheus]: [0, 2, 4, 6, 9, 10],          // Scriabin's mystic chord scale
  [ScaleType.SuperLocrian]: [0, 1, 3, 4, 6, 8, 10],     // Altered scale
  [ScaleType.LydianDominant]: [0, 2, 4, 6, 7, 9, 10],   // Lydian b7
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
  // === NEW RHYTHM PATTERNS ===
  [RhythmType.Tango]: {
    steps: 16,
    beatsPerBar: 4,
    // Habanera-influenced rhythm with marcato accents
    kick:  [1, 0, 0, 1,  0, 0, 1, 0,  1, 0, 0, 1,  0, 0, 1, 0],
    snare: [0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0],
    hihat: [0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0],
    bass:  [1, 0, 0, 1,  0, 0, 1, 0,  1, 0, 0, 1,  0, 0, 1, 0],
    chord: [1, 0, 0, 1,  0, 0, 1, 0,  1, 0, 0, 1,  0, 0, 1, 0],
    rimshot: [0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0]
  },
  [RhythmType.Rumba]: {
    steps: 16,
    beatsPerBar: 4,
    // Cuban Rumba with clave
    kick:  [1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0],
    snare: [0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0],
    hihat: [0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0],
    bass:  [1, 0, 0, 0,  0, 0, 1, 0,  0, 0, 1, 0,  0, 0, 0, 0],
    chord: [0, 0, 1, 0,  0, 1, 0, 0,  0, 0, 1, 0,  0, 1, 0, 0],
    clave: [1, 0, 0, 1,  0, 0, 1, 0,  0, 0, 0, 0,  1, 0, 1, 0], // Rumba clave 3-2
    conga: [0, 1, 0, 0,  1, 0, 0, 1,  0, 1, 0, 0,  1, 0, 0, 1],
    shaker: [1, 1, 1, 1,  1, 1, 1, 1,  1, 1, 1, 1,  1, 1, 1, 1]
  },
  [RhythmType.Merengue]: {
    steps: 16,
    beatsPerBar: 4,
    // Fast 2-beat feel, tambora and güira
    kick:  [1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0],
    snare: [0, 0, 1, 0,  0, 0, 1, 0,  0, 0, 1, 0,  0, 0, 1, 0],
    hihat: [1, 1, 1, 1,  1, 1, 1, 1,  1, 1, 1, 1,  1, 1, 1, 1], // Güira
    bass:  [1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0],
    chord: [0, 0, 1, 0,  0, 0, 1, 0,  0, 0, 1, 0,  0, 0, 1, 0],
    tambourine: [1, 1, 1, 1,  1, 1, 1, 1,  1, 1, 1, 1,  1, 1, 1, 1]
  },
  [RhythmType.Cumbia]: {
    steps: 16,
    beatsPerBar: 4,
    // Colombian cumbia with gaita feel
    kick:  [1, 0, 0, 0,  0, 0, 1, 0,  1, 0, 0, 0,  0, 0, 1, 0],
    snare: [0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0],
    hihat: [0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0],
    bass:  [1, 0, 0, 0,  0, 0, 1, 0,  1, 0, 0, 0,  0, 0, 1, 0],
    chord: [0, 0, 1, 0,  0, 0, 0, 1,  0, 0, 1, 0,  0, 0, 0, 1],
    shaker: [1, 0, 1, 0,  1, 0, 1, 0,  1, 0, 1, 0,  1, 0, 1, 0], // Maracas
    conga: [0, 0, 1, 0,  1, 0, 0, 0,  0, 0, 1, 0,  1, 0, 0, 0]
  },
  [RhythmType.Bolero]: {
    steps: 16,
    beatsPerBar: 4,
    // Slow romantic Latin
    kick:  [1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0],
    snare: [0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0],
    hihat: [0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0],
    bass:  [1, 0, 0, 0,  0, 0, 0, 1,  0, 0, 1, 0,  0, 0, 0, 0],
    chord: [1, 0, 0, 1,  0, 0, 1, 0,  0, 1, 0, 0,  1, 0, 0, 0], // Arpeggiated guitar
    rimshot: [0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0],
    shaker: [1, 0, 1, 0,  1, 0, 1, 0,  1, 0, 1, 0,  1, 0, 1, 0]
  },
  [RhythmType.Shuffle]: {
    steps: 16,
    beatsPerBar: 4,
    // Blues shuffle (triplet feel implied)
    kick:  [1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0],
    snare: [0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0],
    hihat: [1, 0, 0, 1,  1, 0, 0, 1,  1, 0, 0, 1,  1, 0, 0, 1], // Shuffle pattern
    bass:  [1, 0, 0, 0,  0, 0, 0, 1,  1, 0, 0, 0,  0, 0, 0, 1], // Walking shuffle
    chord: [1, 0, 0, 1,  0, 0, 0, 0,  1, 0, 0, 1,  0, 0, 0, 0]
  },
  [RhythmType.Motown]: {
    steps: 16,
    beatsPerBar: 4,
    // Classic Motown/Soul with tambourine
    kick:  [1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0],
    snare: [0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0],
    hihat: [1, 0, 1, 0,  1, 0, 1, 0,  1, 0, 1, 0,  1, 0, 1, 0],
    bass:  [1, 0, 0, 1,  0, 0, 1, 0,  1, 0, 0, 1,  0, 0, 1, 0], // Jamerson-style
    chord: [1, 0, 0, 0,  0, 0, 1, 0,  0, 0, 0, 0,  0, 0, 1, 0],
    tambourine: [0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0]
  },
  [RhythmType.NewOrleans]: {
    steps: 16,
    beatsPerBar: 4,
    // Second Line parade rhythm
    kick:  [1, 0, 0, 0,  0, 0, 1, 0,  0, 0, 1, 0,  0, 0, 0, 0],
    snare: [0, 0, 1, 0,  1, 0, 0, 1,  0, 0, 1, 0,  1, 0, 0, 1], // Syncopated snare
    hihat: [1, 1, 1, 1,  1, 1, 1, 1,  1, 1, 1, 1,  1, 1, 1, 1],
    bass:  [1, 0, 0, 0,  0, 0, 1, 0,  0, 0, 1, 0,  0, 0, 0, 0],
    chord: [0, 0, 1, 0,  0, 0, 0, 1,  0, 0, 1, 0,  0, 0, 0, 1],
    cowbell: [1, 0, 1, 0,  1, 0, 1, 0,  1, 0, 1, 0,  1, 0, 1, 0]
  },
  [RhythmType.Ska]: {
    steps: 16,
    beatsPerBar: 4,
    // Offbeat skank
    kick:  [1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0],
    snare: [0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0],
    hihat: [1, 0, 1, 0,  1, 0, 1, 0,  1, 0, 1, 0,  1, 0, 1, 0],
    bass:  [1, 0, 0, 0,  0, 0, 1, 0,  1, 0, 0, 0,  0, 0, 1, 0],
    chord: [0, 0, 1, 0,  0, 0, 1, 0,  0, 0, 1, 0,  0, 0, 1, 0] // Offbeat skank
  },
  [RhythmType.Dub]: {
    steps: 16,
    beatsPerBar: 4,
    // Heavy bass, sparse drums with space
    kick:  [1, 0, 0, 0,  0, 0, 0, 0,  0, 0, 1, 0,  0, 0, 0, 0],
    snare: [0, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0], // One drop
    hihat: [1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0],
    bass:  [1, 0, 0, 1,  0, 0, 0, 0,  0, 0, 1, 0,  0, 1, 0, 0], // Deep dub bass
    chord: [0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0], // Sparse skank
    rimshot: [0, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0]
  },
  [RhythmType.DrumAndBass]: {
    steps: 16,
    beatsPerBar: 4,
    // Fast breakbeat pattern (usually 160-180 BPM)
    kick:  [1, 0, 0, 0,  0, 0, 1, 0,  0, 0, 0, 0,  0, 0, 1, 0],
    snare: [0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 1, 0,  0, 0, 0, 0],
    hihat: [1, 0, 1, 1,  1, 0, 1, 1,  1, 0, 1, 1,  1, 0, 1, 1],
    bass:  [1, 0, 0, 0,  0, 0, 1, 0,  0, 0, 0, 0,  0, 0, 1, 0],
    chord: [1, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0] // Sparse stabs
  },
  [RhythmType.House]: {
    steps: 16,
    beatsPerBar: 4,
    // Four on the floor with offbeat hats
    kick:  [1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0,  1, 0, 0, 0],
    snare: [0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0],
    hihat: [0, 0, 1, 0,  0, 0, 1, 0,  0, 0, 1, 0,  0, 0, 1, 0], // Offbeat
    bass:  [1, 0, 0, 1,  0, 0, 1, 0,  1, 0, 0, 1,  0, 0, 1, 0],
    chord: [0, 0, 1, 0,  0, 0, 1, 0,  0, 0, 1, 0,  0, 0, 1, 0],
    clap:  [0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0]
  },
  [RhythmType.Trap]: {
    steps: 16,
    beatsPerBar: 4,
    // 808 style with rolling hats
    kick:  [1, 0, 0, 0,  0, 0, 0, 0,  0, 0, 1, 0,  0, 0, 0, 0],
    snare: [0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0],
    hihat: [1, 1, 1, 1,  1, 1, 1, 1,  1, 1, 1, 1,  1, 1, 1, 1], // Rolling hats
    bass:  [1, 0, 0, 0,  0, 0, 0, 0,  0, 0, 1, 0,  0, 0, 0, 0], // 808 bass
    chord: [1, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0],
    clap:  [0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0]
  },
  [RhythmType.LoFi]: {
    steps: 16,
    beatsPerBar: 4,
    // Laid back, jazzy hip hop
    kick:  [1, 0, 0, 0,  0, 0, 1, 0,  0, 0, 0, 0,  0, 1, 0, 0],
    snare: [0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0],
    hihat: [1, 0, 1, 0,  1, 0, 1, 0,  1, 0, 1, 0,  1, 0, 1, 0],
    bass:  [1, 0, 0, 0,  0, 0, 1, 0,  0, 0, 0, 0,  0, 1, 0, 0],
    chord: [1, 0, 0, 0,  0, 0, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0], // Rhodes-style
    rimshot: [0, 0, 0, 0,  0, 0, 0, 1,  0, 0, 0, 0,  0, 0, 0, 1]
  },
  [RhythmType.NineEight]: {
    steps: 18, // 9/8 = 9 eighth notes = 18 sixteenths
    beatsPerBar: 9,
    // Compound meter (3+3+3)
    kick:  [1, 0, 0, 0, 0, 0,  1, 0, 0, 0, 0, 0,  1, 0, 0, 0, 0, 0],
    snare: [0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0,  0, 0, 0, 1, 0, 0],
    hihat: [1, 0, 1, 0, 1, 0,  1, 0, 1, 0, 1, 0,  1, 0, 1, 0, 1, 0],
    bass:  [1, 0, 0, 0, 0, 0,  1, 0, 0, 0, 0, 0,  1, 0, 0, 0, 0, 0],
    chord: [1, 0, 0, 0, 0, 0,  1, 0, 0, 0, 0, 0,  1, 0, 0, 0, 0, 0]
  },
  [RhythmType.SixEight]: {
    steps: 12, // 6/8 = 6 eighth notes = 12 sixteenths
    beatsPerBar: 6,
    // Compound duple (3+3)
    kick:  [1, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0],
    snare: [0, 0, 0, 0, 0, 0,  1, 0, 0, 0, 0, 0],
    hihat: [1, 0, 1, 0, 1, 0,  1, 0, 1, 0, 1, 0],
    bass:  [1, 0, 0, 0, 0, 0,  0, 0, 0, 1, 0, 0],
    chord: [1, 0, 0, 0, 0, 0,  1, 0, 0, 0, 0, 0],
    tambourine: [1, 0, 0, 1, 0, 0,  1, 0, 0, 1, 0, 0]
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
// Based on standard Boehm fingering charts (WFG, Yamaha, etc.)
// Notation reference: T = thumb, 123 = LH fingers, G# = LH pinky, | = divider, 123 = RH fingers, Eb/C#/C = foot keys
export const FLUTE_FINGERINGS: Record<string, Fingering> = {
  // Low Register (First Octave)
  // C4:  T 123 | 123 Eb C# C
  'C4': createFingering({ note: 'C4', thumb: true, lh1: true, lh2: true, lh3: true, rh1: true, rh2: true, rh3: true, rhPinkyEb: true, rhPinkyCsharp: true, rhPinkyC: true }),
  // C#4: T 123 | 123 C#
  'C#4': createFingering({ note: 'C#4', thumb: true, lh1: true, lh2: true, lh3: true, rh1: true, rh2: true, rh3: true, rhPinkyCsharp: true }),
  // D4:  T 123 | 123
  'D4': createFingering({ note: 'D4', thumb: true, lh1: true, lh2: true, lh3: true, rh1: true, rh2: true, rh3: true }),
  // D#4: T 123 | 123 Eb
  'D#4': createFingering({ note: 'D#4', thumb: true, lh1: true, lh2: true, lh3: true, rh1: true, rh2: true, rh3: true, rhPinkyEb: true }),
  // E4:  T 123 | 12
  'E4': createFingering({ note: 'E4', thumb: true, lh1: true, lh2: true, lh3: true, rh1: true, rh2: true }),
  // F4:  T 123 | 1
  'F4': createFingering({ note: 'F4', thumb: true, lh1: true, lh2: true, lh3: true, rh1: true }),
  // F#4: T 123 | - - 3
  'F#4': createFingering({ note: 'F#4', thumb: true, lh1: true, lh2: true, lh3: true, rh3: true }),
  // G4:  T 123 | -
  'G4': createFingering({ note: 'G4', thumb: true, lh1: true, lh2: true, lh3: true }),
  // G#4: T 123 G# | -
  'G#4': createFingering({ note: 'G#4', thumb: true, lh1: true, lh2: true, lh3: true, lhPinky: true }),
  // A4:  T 12 | -
  'A4': createFingering({ note: 'A4', thumb: true, lh1: true, lh2: true }),
  // A#4: T 1 | 1  (1-1 Bb fingering, standard for beginners)
  'A#4': createFingering({ note: 'A#4', thumb: true, lh1: true, rh1: true }),
  // B4:  T 1 | -
  'B4': createFingering({ note: 'B4', thumb: true, lh1: true }),
  
  // Middle Register (Second Octave)
  // C5:  - 1 | -
  'C5': createFingering({ note: 'C5', lh1: true }),
  // C#5: - - | -  (open C#)
  'C#5': createFingering({ note: 'C#5' }),
  // D5:  T - 23 | 123
  'D5': createFingering({ note: 'D5', thumb: true, lh2: true, lh3: true, rh1: true, rh2: true, rh3: true }),
  // D#5: T - 23 | 123 Eb
  'D#5': createFingering({ note: 'D#5', thumb: true, lh2: true, lh3: true, rh1: true, rh2: true, rh3: true, rhPinkyEb: true }),
  // E5:  T 123 | 12
  'E5': createFingering({ note: 'E5', thumb: true, lh1: true, lh2: true, lh3: true, rh1: true, rh2: true }),
  // F5:  T 123 | 1
  'F5': createFingering({ note: 'F5', thumb: true, lh1: true, lh2: true, lh3: true, rh1: true }),
  // F#5: T 123 | - - 3
  'F#5': createFingering({ note: 'F#5', thumb: true, lh1: true, lh2: true, lh3: true, rh3: true }),
  // G5:  T 123 | -
  'G5': createFingering({ note: 'G5', thumb: true, lh1: true, lh2: true, lh3: true }),
  // G#5: T 123 G# | -
  'G#5': createFingering({ note: 'G#5', thumb: true, lh1: true, lh2: true, lh3: true, lhPinky: true }),
  // A5:  T 12 | -
  'A5': createFingering({ note: 'A5', thumb: true, lh1: true, lh2: true }),
  // A#5: T 1 | 1  (1-1 Bb fingering)
  'A#5': createFingering({ note: 'A#5', thumb: true, lh1: true, rh1: true }),
  // B5:  T 1 | -
  'B5': createFingering({ note: 'B5', thumb: true, lh1: true }),
  // C6:  - 1 | -
  'C6': createFingering({ note: 'C6', lh1: true }),
};

// Optional: alternative fingerings per written note.
// Curated set of widely-used alternates; primary fingerings remain the same.
// Notation: T = thumb, Tb = thumb Bb lever, 123 = LH, G# = LH pinky, | = divider, 123 = RH, Eb/C#/C = foot
const FLUTE_FINGERING_ALTERNATIVES: Record<string, Fingering[]> = {
  // --- B♭ (A#) alternates ---
  // Primary: T 1 | 1  (1-1 Bb)
  'A#4': [
    // Thumb Bb: T Tb 1 | -
    createFingering({ note: 'A#4', thumb: true, thumbBb: true, lh1: true }),
    // Side Bb / Long Bb: T 1 | 12
    createFingering({ note: 'A#4', thumb: true, lh1: true, rh1: true, rh2: true }),
  ],
  'A#5': [
    // Thumb Bb: T Tb 1 | -
    createFingering({ note: 'A#5', thumb: true, thumbBb: true, lh1: true }),
    // Side Bb / Long Bb: T 1 | 12
    createFingering({ note: 'A#5', thumb: true, lh1: true, rh1: true, rh2: true }),
  ],

  // --- C# alternates ---
  // Primary C#4: T 123 | 123 C#
  // Alt: without RH3 for slightly different color
  'C#4': [
    // T 123 | 12 C#
    createFingering({ note: 'C#4', thumb: true, lh1: true, lh2: true, lh3: true, rh1: true, rh2: true, rhPinkyCsharp: true }),
  ],
  // Primary C#5: open (no keys)
  // Alt: closed fingering for stability/darker tone
  'C#5': [
    // T 123 | 12 C#
    createFingering({ note: 'C#5', thumb: true, lh1: true, lh2: true, lh3: true, rh1: true, rh2: true, rhPinkyCsharp: true }),
  ],

  // --- F# alternates ---
  // Primary: T 123 | - - 3
  // Alt: using RH2 instead of RH3
  'F#4': [
    // T 123 | - 2 -
    createFingering({ note: 'F#4', thumb: true, lh1: true, lh2: true, lh3: true, rh2: true }),
  ],
  'F#5': [
    // T 123 | - 2 -
    createFingering({ note: 'F#5', thumb: true, lh1: true, lh2: true, lh3: true, rh2: true }),
  ],

  // --- A alternates ---
  // Primary: T 12 | -
  // Alt: add RH1 for darker, more centered tone
  'A4': [
    // T 12 | 1
    createFingering({ note: 'A4', thumb: true, lh1: true, lh2: true, rh1: true }),
  ],
  'A5': [
    // T 12 | 1
    createFingering({ note: 'A5', thumb: true, lh1: true, lh2: true, rh1: true }),
  ],

  // --- D alternates ---
  // Primary D4: T 123 | 123
  // Alt: harmonic fingering for better intonation in certain keys
  'D4': [
    // T 123 | 12 (without RH3 for brighter tone)
    createFingering({ note: 'D4', thumb: true, lh1: true, lh2: true, lh3: true, rh1: true, rh2: true }),
  ],
  'D5': [
    // T 123 | 123 (full fingering for stability)
    createFingering({ note: 'D5', thumb: true, lh1: true, lh2: true, lh3: true, rh1: true, rh2: true, rh3: true }),
    // T - 23 | 12 (lighter alternative)
    createFingering({ note: 'D5', thumb: true, lh2: true, lh3: true, rh1: true, rh2: true }),
  ],

  // --- E alternates ---
  // Primary: T 123 | 12
  'E4': [
    // T 123 | 1 (for legato to F)
    createFingering({ note: 'E4', thumb: true, lh1: true, lh2: true, lh3: true, rh1: true }),
  ],
  'E5': [
    // T 123 | 1 (for legato to F)
    createFingering({ note: 'E5', thumb: true, lh1: true, lh2: true, lh3: true, rh1: true }),
  ],

  // --- F alternates ---
  // Primary: T 123 | 1
  'F4': [
    // T 123 | - (forked F, darker tone)
    createFingering({ note: 'F4', thumb: true, lh1: true, lh2: true, lh3: true }),
  ],
  'F5': [
    // T 123 | - (forked F)
    createFingering({ note: 'F5', thumb: true, lh1: true, lh2: true, lh3: true }),
  ],

  // --- G alternates ---
  // Primary: T 123 | -
  'G4': [
    // T 123 | 1 (for stability in loud passages)
    createFingering({ note: 'G4', thumb: true, lh1: true, lh2: true, lh3: true, rh1: true }),
  ],
  'G5': [
    // T 123 | 1 (for stability)
    createFingering({ note: 'G5', thumb: true, lh1: true, lh2: true, lh3: true, rh1: true }),
  ],

  // --- G# alternates ---
  // Primary: T 123 G# | -
  'G#4': [
    // T 123 G# | 1 (for better intonation)
    createFingering({ note: 'G#4', thumb: true, lh1: true, lh2: true, lh3: true, lhPinky: true, rh1: true }),
    // T 12 G# | - (trill fingering from A)
    createFingering({ note: 'G#4', thumb: true, lh1: true, lh2: true, lhPinky: true }),
  ],
  'G#5': [
    // T 123 G# | 1 (for better intonation)
    createFingering({ note: 'G#5', thumb: true, lh1: true, lh2: true, lh3: true, lhPinky: true, rh1: true }),
  ],

  // --- B alternates ---
  // Primary: T 1 | -
  'B4': [
    // T 1 | 1 (for stability, especially in loud dynamics)
    createFingering({ note: 'B4', thumb: true, lh1: true, rh1: true }),
    // T - | - (harmonic fingering)
    createFingering({ note: 'B4', thumb: true }),
  ],
  'B5': [
    // T 1 | 1 (for stability)
    createFingering({ note: 'B5', thumb: true, lh1: true, rh1: true }),
  ],

  // --- C alternates ---
  // Primary C5: - 1 | -
  'C5': [
    // - 1 | 1 (for stability)
    createFingering({ note: 'C5', lh1: true, rh1: true }),
    // T 1 | - (with thumb for darker tone)
    createFingering({ note: 'C5', thumb: true, lh1: true }),
  ],
  'C6': [
    // - 1 | 1 (for stability in high register)
    createFingering({ note: 'C6', lh1: true, rh1: true }),
    // T 1 | - (with thumb)
    createFingering({ note: 'C6', thumb: true, lh1: true }),
  ],

  // --- D# / Eb alternates ---
  // Primary: T 123 | 123 Eb
  'D#4': [
    // T 123 | 12 Eb (without RH3)
    createFingering({ note: 'D#4', thumb: true, lh1: true, lh2: true, lh3: true, rh1: true, rh2: true, rhPinkyEb: true }),
  ],
  'D#5': [
    // T 123 | 123 Eb (full fingering for second octave)
    createFingering({ note: 'D#5', thumb: true, lh1: true, lh2: true, lh3: true, rh1: true, rh2: true, rh3: true, rhPinkyEb: true }),
  ],
};

export const getFingeringAlternatives = (noteName: string): Fingering[] => {
  const base = noteName.replace(/[0-9]/g, '');
  const attempt4 = `${base}4`;
  const attempt5 = `${base}5`;

  return (
    FLUTE_FINGERING_ALTERNATIVES[noteName] ||
    FLUTE_FINGERING_ALTERNATIVES[attempt5] ||
    FLUTE_FINGERING_ALTERNATIVES[attempt4] ||
    []
  );
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
  const majorScales = [
    ScaleType.Major, ScaleType.PentatonicMajor, ScaleType.Lydian, ScaleType.Mixolydian, 
    ScaleType.WholeTone, ScaleType.BebopMajor, ScaleType.LydianDominant, ScaleType.NeapolitanMajor
  ];
  const minorScales = [
    ScaleType.Minor, ScaleType.HarmonicMinor, ScaleType.MelodicMinor, ScaleType.PentatonicMinor, 
    ScaleType.Dorian, ScaleType.Phrygian, ScaleType.Locrian, ScaleType.Neapolitan, ScaleType.Hungarian
  ];
  const jazzScales = [
    ScaleType.Bebop, ScaleType.BebopMajor, ScaleType.Diminished, ScaleType.DiminishedHalfWhole,
    ScaleType.SuperLocrian, ScaleType.LydianDominant, ScaleType.Augmented
  ];
  const exoticScales = [
    ScaleType.Hirajoshi, ScaleType.InSen, ScaleType.GypsyMinor, ScaleType.Arabian, 
    ScaleType.Persian, ScaleType.Egyptian, ScaleType.Hijaz, ScaleType.DoubleHarmonic,
    ScaleType.Flamenco, ScaleType.Balinese, ScaleType.Chinese, ScaleType.Prometheus
  ];

  const common = [ProgressionType.Custom];

  if (jazzScales.includes(scaleType)) {
    return [
      ProgressionType.Jazz,
      ProgressionType.CircleOfFifths,
      ProgressionType.TwelveBarBlues,
      ProgressionType.BossaNova,
      ...common
    ];
  }

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

  if (scaleType === ScaleType.Chromatic) {
    return [
      ProgressionType.Jazz,
      ProgressionType.Classic,
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
   const odd = [RhythmType.FiveFour, RhythmType.SevenEight, RhythmType.Waltz, RhythmType.SixEight, RhythmType.NineEight];
   const dance = [RhythmType.Disco, RhythmType.Techno, RhythmType.Funk, RhythmType.HipHop, RhythmType.RnB, RhythmType.House, RhythmType.DrumAndBass];
   const latin = [RhythmType.Salsa, RhythmType.ChaCha, RhythmType.Samba, RhythmType.BossaNova, RhythmType.Tango, RhythmType.Rumba, RhythmType.Merengue, RhythmType.Cumbia, RhythmType.Bolero];
   const urban = [RhythmType.HipHop, RhythmType.Trap, RhythmType.LoFi, RhythmType.RnB];
   const jamaican = [RhythmType.Reggae, RhythmType.Ska, RhythmType.Dub];

   if (progressionType === ProgressionType.TwelveBarBlues || progressionType === ProgressionType.BluesTurn) {
     return [...common, RhythmType.Shuffle, RhythmType.Funk, RhythmType.HipHop, RhythmType.JazzSwing, RhythmType.NewOrleans];
   }
   
   if (progressionType === ProgressionType.Jazz) {
       return [RhythmType.JazzSwing, RhythmType.BossaNova, RhythmType.Ballad, RhythmType.LoFi, ...odd, RhythmType.Custom];
   }

   if (progressionType === ProgressionType.Pop || progressionType === ProgressionType.Classic) {
       return [...common, ...dance, ...jamaican, RhythmType.Motown];
   }
   
   if (progressionType === ProgressionType.Canon) {
      return [...common, RhythmType.Waltz, RhythmType.SixEight];
   }

   if (progressionType === ProgressionType.BossaNova) {
       return [RhythmType.BossaNova, RhythmType.Samba, RhythmType.Standard, RhythmType.JazzSwing, RhythmType.Bolero];
   }

   if (progressionType === ProgressionType.SalsaMontuno) {
       return [...latin, RhythmType.Standard];
   }

   if (progressionType === ProgressionType.HijazVamp) {
       return [RhythmType.Ballad, RhythmType.Afrobeat, RhythmType.Standard, RhythmType.Tango, RhythmType.SixEight]; 
   }

   if (progressionType === ProgressionType.Andalusian) {
       return [RhythmType.Ballad, RhythmType.Tango, RhythmType.Rumba, RhythmType.ChaCha, RhythmType.Standard]; 
   }

   if (progressionType === ProgressionType.DooWop) {
       return [...common, RhythmType.Motown, RhythmType.Shuffle, ...urban];
   }

   if (progressionType === ProgressionType.CircleOfFifths) {
       return [...common, RhythmType.JazzSwing, RhythmType.BossaNova, ...odd];
   }

   return Object.values(RhythmType);
}
