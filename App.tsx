import React, { useState, useEffect, useMemo } from 'react';
import { Music, Play, Square, Settings2, Activity, Sliders, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { NoteName, ScaleType, ProgressionType, RhythmType, AIComposition } from './types';
import { NOTES_ORDER, getFingering, getFingeringAlternatives, getValidProgressions, getValidRhythms } from './constants';

import { FluteFingering } from './components/FluteFingering';
import { audioService } from './services/audio';
import { MusicTheory } from './services/theory';
import { AICoach } from './components/AICoach';
import { LiveAudioAnalyzer } from './components/LiveAudioAnalyzer';
import { liveAudioService } from './services/liveAudio';

const App: React.FC = () => {
  const [root, setRoot] = useState<NoteName>(NoteName.C);
  const [keyConstraint, setKeyConstraint] = useState<NoteName | null>(null);
  const [scaleType, setScaleType] = useState<ScaleType>(ScaleType.Major);
  const [progression, setProgression] = useState<ProgressionType>(ProgressionType.Classic);
  const [rhythm, setRhythm] = useState<RhythmType>(RhythmType.Standard);
  const [tempo, setTempo] = useState(100);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [chordsEnabled, setChordsEnabled] = useState(true);
  
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]); 
  const [playingNoteIndices, setPlayingNoteIndices] = useState<number[]>([]); 
  const [liveDetectedNoteBase, setLiveDetectedNoteBase] = useState<string | null>(null);

  // Derived state via Theory Service
  const currentScaleNotes = useMemo(() => MusicTheory.getScaleNotes(root, scaleType), [root, scaleType]);
  
  // Validation Logic
  const validProgressions = useMemo(() => getValidProgressions(scaleType), [scaleType]);
  const validRhythms = useMemo(() => getValidRhythms(progression), [progression]);

  // Determine which notes to display in fingering charts: show both octave 4 and 5,
  // and ensure they are ordered by pitch from low to high.
  const displayNotes = useMemo(() => {
    if (!currentScaleNotes) return [];

    const baseNotes = currentScaleNotes.map(n => n.replace(/[0-9]/g, ''));
    const octave4 = baseNotes.map(n => `${n}4`);
    const octave5 = baseNotes.map(n => `${n}5`);

    const all = [...octave4, ...octave5];

    const getPitchVal = (note: string) => {
      const match = note.match(/^([A-G]#?)(\d)$/);
      if (!match) return 0;
      const [, name, oct] = match;
      const octave = parseInt(oct, 10);
      const index = NOTES_ORDER.indexOf(name as NoteName);
      return octave * 12 + (index >= 0 ? index : 0);
    };

    return all.sort((a, b) => getPitchVal(a) - getPitchVal(b));
  }, [currentScaleNotes]);

  // Base-note set (without octave) for highlighting charts that correspond to selected notes
  const selectedBaseNotes = useMemo(() => {
    const bases = selectedNotes
      .map((n) => n.replace(/[0-9]/g, ''))
      .filter(Boolean);

    if (liveDetectedNoteBase && !bases.includes(liveDetectedNoteBase)) {
      bases.push(liveDetectedNoteBase);
    }

    return bases;
  }, [selectedNotes, liveDetectedNoteBase]);

  const togglePlay = () => {
    if (isPlaying) {
      audioService.stop();
      setIsPlaying(false);
      setPlayingNoteIndices([]);
    } else {
      audioService.start(root, scaleType, tempo, progression, rhythm);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      audioService.updateSettings(root, scaleType, tempo, progression, rhythm);
    }
  }, [root, scaleType, tempo, progression, rhythm, isPlaying]);

  useEffect(() => {
    audioService.setChordsEnabled(chordsEnabled);
  }, [chordsEnabled]);

  // Subscribe to live audio dominant note to highlight fingering charts for the current note
  useEffect(() => {
    const unsubscribe = liveAudioService.subscribe((state) => {
      if (state.dominantNote) {
        const base = state.dominantNote.replace(/[0-9]/g, '');
        setLiveDetectedNoteBase(base || null);
      } else {
        setLiveDetectedNoteBase(null);
      }
    });

    return unsubscribe;
  }, []);

  // Effect: Reset Progression if invalid for new Scale
  useEffect(() => {
    if (!validProgressions.includes(progression)) {
      setProgression(validProgressions[0]);
    }
  }, [scaleType, validProgressions, progression]);

  // Effect: Reset Rhythm if invalid for new Progression
  useEffect(() => {
    if (!validRhythms.includes(rhythm)) {
      setRhythm(validRhythms[0]);
    }
  }, [progression, validRhythms, rhythm]);

  // Subscribe to audio service updates to sync UI
  useEffect(() => {
    const unsubscribe = audioService.subscribe((chordIndices) => {
      setPlayingNoteIndices(chordIndices);
      
      if (!currentScaleNotes) return;

      const newNotes = chordIndices.map(idx => 
         MusicTheory.getNoteNameFromIndex(idx, currentScaleNotes, root)
      ).filter(Boolean);
      
      // Sort by pitch
      newNotes.sort((a, b) => {
        const getVal = (n: string) => {
           const name = n.slice(0, -1);
           const oct = parseInt(n.slice(-1));
           return oct * 12 + NOTES_ORDER.indexOf(name as NoteName);
        };
        return getVal(a) - getVal(b);
      });

      setSelectedNotes(newNotes);
    });

    return unsubscribe;
  }, [root, scaleType, currentScaleNotes]);

  // Handle manual selection
  const handleNoteClick = (noteName: string, index: number) => {
      const noteStr = MusicTheory.getNoteNameFromIndex(index, currentScaleNotes, root);
      setSelectedNotes([noteStr]);
  };

  const handleCompositionGenerated = (composition: AIComposition) => {
    audioService.setCustomComposition(composition);
    setProgression(ProgressionType.Custom);
    setRhythm(RhythmType.Custom);
    if (composition.tempo) {
        setTempo(composition.tempo);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-gold-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-30">
        <div className="w-full px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center text-slate-900 shadow-lg shadow-gold-500/20">
              <Music className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-serif font-semibold tracking-wide text-slate-100">Virtuoso <span className="text-gold-500">Flute</span></h1>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm text-slate-400">
             <span>Classical Companion</span>
          </div>
        </div>
      </header>

      <main className="w-full px-6 py-2 space-y-3">
        
        {/* 1. CONFIG SECTION */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-gold-500/10 transition-colors pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
                    <Settings2 className="w-5 h-5 text-gold-500" />
                    <h2 className="text-lg font-bold uppercase tracking-wider text-slate-200">Configuration</h2>
                </div>

                {/* Top Row: Root Note Selection */}
                <div className="mb-3">
                    <label className="block text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Key Center (Root)</label>
                    <div className="flex flex-wrap gap-2">
                    {Object.values(NoteName).map((n) => (
                        <button
                        key={n}
                        onClick={() => {
                          setRoot(n);
                          setKeyConstraint(n);
                        }}
                        className={`
                            px-4 py-2 rounded-md border text-sm font-bold transition-all duration-200 flex-1 min-w-[3rem]
                            ${root === n 
                            ? 'bg-gold-500 text-slate-900 border-gold-500 shadow-[0_0_10px_-2px_rgba(234,179,8,0.4)]' 
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200 hover:bg-slate-750'
                            }
                        `}
                        >
                        {n}
                        </button>
                    ))}
                    </div>
                </div>

                {/* Middle Row: Dropdowns & Sliders */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    {/* Scale Type */}
                    <div>
                        <label className="block text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Scale</label>
                        <div className="relative">
                            <select 
                                value={scaleType}
                                onChange={(e) => setScaleType(e.target.value as ScaleType)}
                                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 outline-none transition-all appearance-none cursor-pointer hover:bg-slate-750"
                            >
                                {Object.values(ScaleType).map(t => (
                                <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 rotate-90 pointer-events-none"/>
                        </div>
                    </div>

                    {/* Progression */}
                    <div>
                        <label className="block text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide flex items-center gap-1">
                            <Sliders className="w-3 h-3" /> Progression
                        </label>
                        <div className="relative">
                            <select 
                                value={progression}
                                onChange={(e) => setProgression(e.target.value as ProgressionType)}
                                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-gold-500/50 outline-none transition-all appearance-none cursor-pointer hover:bg-slate-750"
                            >
                                {validProgressions.map(t => (
                                <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 rotate-90 pointer-events-none"/>
                        </div>
                    </div>

                    {/* Rhythm */}
                    <div>
                        <label className="block text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Rhythm</label>
                        <div className="relative">
                            <select 
                                value={rhythm}
                                onChange={(e) => setRhythm(e.target.value as RhythmType)}
                                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-gold-500/50 outline-none transition-all appearance-none cursor-pointer hover:bg-slate-750"
                            >
                                {validRhythms.map(t => (
                                <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 rotate-90 pointer-events-none"/>
                        </div>
                    </div>
                </div>
                
                {/* Tempo Slider - Full Width */}
                <div className="mb-4">
                     <label className="block text-xs text-slate-400 mb-2 font-medium flex justify-between items-center uppercase tracking-wide">
                        <span>Tempo (BPM)</span>
                        <span className="bg-slate-800 text-gold-400 px-3 py-0.5 rounded text-xs font-mono border border-slate-700">{tempo}</span>
                    </label>
                    <input 
                        type="range" 
                        min="40" 
                        max="200" 
                        value={tempo} 
                        onChange={(e) => setTempo(Number(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-gold-500"
                    />
                </div>

                {/* Bottom Row: Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800 pt-3">
                    <button
                        onClick={() => setChordsEnabled(!chordsEnabled)}
                        className={`
                            px-3 py-2 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all w-full sm:w-auto justify-center
                            ${chordsEnabled 
                            ? 'bg-slate-800 text-gold-500 border border-gold-500/30 hover:bg-slate-750' 
                            : 'bg-slate-900/50 text-slate-500 border border-slate-700 hover:text-slate-400'
                            }
                        `}
                    >
                        {chordsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        Harmony
                    </button>

                    <button
                        onClick={togglePlay}
                        className={`
                            px-6 py-2 rounded-lg font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg w-full sm:w-auto
                            ${isPlaying 
                            ? 'bg-slate-800 text-red-500 border border-red-500/30 hover:bg-slate-750 hover:text-red-400' 
                            : 'bg-gold-500 text-slate-900 hover:bg-gold-400 hover:shadow-gold-500/20'
                            }
                        `}
                    >
                        {isPlaying ? (
                            <><Square className="w-5 h-5 fill-current" /> Stop</>
                        ) : (
                            <><Play className="w-5 h-5 fill-current" /> Play Backing Track</>
                        )}
                    </button>
                </div>
            </div>
        </section>

        {/* LIVE AUDIO ANALYSIS SECTION */}
        <LiveAudioAnalyzer
          selectedRoot={root}
          selectedScaleType={scaleType}
          onSelectScale={(nextRoot, nextScaleType) => {
            setRoot(nextRoot);
            setScaleType(nextScaleType);
            setKeyConstraint(nextRoot);
          }}
          keyConstraintRoot={keyConstraint}
          onSelectKeyConstraint={(next) => {
            setKeyConstraint(next);
            if (next) setRoot(next);
          }}
        />

        {/* 2. SCALE HARMONY SECTION */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-lg">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-slate-400" />
                    <h2 className="text-lg font-bold uppercase tracking-wider text-slate-200">Scale Harmony</h2>
                </div>
                <span className="text-[10px] text-slate-400 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full uppercase tracking-wide">
                   {root} {scaleType}
                </span>
            </div>
            
            <div className="flex flex-wrap gap-3 justify-center items-center py-2">
                {currentScaleNotes && currentScaleNotes.map((note, index) => {
                    const isRoot = index === 0;
                    const isPlayingThisNote = playingNoteIndices.includes(index);
                    
                    const noteStr = MusicTheory.getNoteNameFromIndex(index, currentScaleNotes, root);
                    const isSelected = selectedNotes.includes(noteStr);

                    return (
                    <button
                        key={`${note}-${index}`}
                        onClick={() => handleNoteClick(note, index)}
                        className={`
                        relative group w-14 h-20 sm:w-16 sm:h-22 rounded-lg border flex flex-col items-center justify-center transition-all duration-300
                        ${isSelected 
                            ? 'bg-gold-500/20 border-gold-500 scale-105 z-10 shadow-[0_0_20px_-5px_rgba(234,179,8,0.4)]' 
                            : 'bg-slate-800 border-slate-700 hover:border-slate-500 hover:bg-slate-750 hover:-translate-y-1'
                        }
                        `}
                    >
                        {isPlayingThisNote && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-slate-900 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 z-20 whitespace-nowrap shadow-md border border-green-400">
                             Active
                        </div>
                        )}
                        
                        <span className={`text-2xl sm:text-3xl font-serif font-bold ${isSelected ? 'text-gold-400' : 'text-slate-200'}`}>
                        {note}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase mt-2 font-medium tracking-wide">
                        {isRoot ? 'Root' : `Deg ${index + 1}`}
                        </span>
                    </button>
                    );
                })}
            </div>
        </section>

        {/* 3. FINGERING CHARTS SECTION */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-xl overflow-hidden">
            <div className="flex items-center gap-2 mb-2 border-b border-slate-800 pb-1">
                <Music className="w-5 h-5 text-slate-400" />
                <h2 className="text-lg font-bold uppercase tracking-wider text-slate-200">Fingering Charts</h2>
            </div>
            
            {/* Flex container - no scroll, all charts visible */}
            <div className="flex flex-wrap gap-3 w-full justify-center">
                {displayNotes.map((note) => {
                    const base = note.replace(/[0-9]/g, '');
                    const isHighlighted = selectedBaseNotes.includes(base);
                    const primaryFingering = getFingering(note);
                    const alternativeFingerings = getFingeringAlternatives(note);

                    return (
                        <div key={note} className="transition-transform duration-300">
                            <FluteFingering 
                                fingering={primaryFingering} 
                                alternatives={alternativeFingerings}
                                highlighted={isHighlighted} 
                            />
                        </div>
                    );
                })}
            </div>
            
            {displayNotes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <Music className="w-12 h-12 mb-4 opacity-20" />
                    <p className="italic">Select a note or play the track to view fingerings.</p>
                </div>
            )}
        </section>

        {/* 4. AI FEATURES SECTION - Hidden for hands-free mode */}
        {/* <section>
            <AICoach 
                root={root} 
                scaleType={scaleType} 
                onCompositionGenerated={handleCompositionGenerated}
            />
        </section> */}

      </main>
    </div>
  );
};

export default App;