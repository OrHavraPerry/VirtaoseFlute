import { NoteName, ScaleType } from '../types';
import { NOTES_ORDER, SCALE_INTERVALS } from '../constants';

export class MusicTheory {
    static getFrequency(note: string): number {
        const noteRegex = /([A-G]#?)(-?\d+)/;
        const match = note.match(noteRegex);
        if (!match) return 440;

        const name = match[1];
        const octave = parseInt(match[2], 10);

        const A4_INDEX = NOTES_ORDER.indexOf(NoteName.A); // 9
        const noteIndex = NOTES_ORDER.indexOf(name as NoteName);
        
        // Distance from A4 in semitones
        const semitones = (octave - 4) * 12 + (noteIndex - A4_INDEX);
        return 440 * Math.pow(2, semitones / 12);
    }

    static getScaleNotes(root: NoteName, type: ScaleType): string[] {
        const rootIndex = NOTES_ORDER.indexOf(root);
        const intervals = SCALE_INTERVALS[type];
        
        if (!intervals) return [];

        return intervals.map(interval => {
            const index = (rootIndex + interval) % 12;
            return NOTES_ORDER[index];
        });
    }

    static getChordNotes(rootIndex: number, scaleNotes: string[], includeSeventh: boolean = false): string[] {
        if (!scaleNotes || scaleNotes.length === 0) return [];

        // Triad: Root, 3rd, 5th within the scale context
        const idx1 = rootIndex % scaleNotes.length;
        const idx2 = (rootIndex + 2) % scaleNotes.length;
        const idx3 = (rootIndex + 4) % scaleNotes.length;
        
        const notes = [scaleNotes[idx1], scaleNotes[idx2], scaleNotes[idx3]];
        
        // Optionally add 7th for richer harmony
        if (includeSeventh && scaleNotes.length >= 7) {
            const idx4 = (rootIndex + 6) % scaleNotes.length;
            notes.push(scaleNotes[idx4]);
        }
        
        return notes;
    }

    static getVoicedChord(rootIndex: number, scaleNotes: string[], prevChordNotes: string[] = []): string[] {
        const chordNotes = this.getChordNotes(rootIndex, scaleNotes);
        
        if (prevChordNotes.length === 0) return chordNotes;
        
        // Simple voice leading: keep common tones, move others by smallest interval
        // For now, just return the chord notes (can be enhanced later)
        return chordNotes;
    }

    static getNoteNameFromIndex(index: number, scaleNotes: string[], root: NoteName): string {
         if (!scaleNotes || index < 0) return '';
         const noteName = scaleNotes[index];
         if (!noteName) return '';
          
         const rootIndex = NOTES_ORDER.indexOf(root);
         const noteIndex = NOTES_ORDER.indexOf(noteName as NoteName);
          
         // Simple octave logic: if note index is lower than root index in a standard scale, assume next octave
         const octave = (index >= 7 || noteIndex < rootIndex) ? '5' : '4';
         return `${noteName}${octave}`;
    }
}