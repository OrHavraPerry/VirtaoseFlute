import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Music, Activity, BarChart3, Cpu, Zap, Target } from 'lucide-react';
import { liveAudioService, LiveAudioState, InterpolatedScale } from '../services/liveAudio';

export const LiveAudioAnalyzer: React.FC = () => {
  const [audioState, setAudioState] = useState<LiveAudioState>({
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
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = liveAudioService.subscribe((state) => {
      setAudioState(state);
    });

    return () => {
      unsubscribe();
      liveAudioService.stop();
    };
  }, []);

  const toggleListening = async () => {
    setError(null);
    if (audioState.isListening) {
      liveAudioService.stop();
    } else {
      try {
        await liveAudioService.start();
      } catch (err) {
        setError('Could not access microphone. Please allow microphone permissions.');
      }
    }
  };

  const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // Parse detected key to get root note for highlighting
  const getKeyRoot = (): number | null => {
    if (!audioState.detectedKey) return null;
    const parts = audioState.detectedKey.split(' ');
    if (parts.length < 2) return null;
    const rootNote = parts[0];
    return NOTE_NAMES.indexOf(rootNote);
  };

  const keyRootIndex = getKeyRoot();

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 group-hover:bg-emerald-500/10 transition-colors pointer-events-none"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold uppercase tracking-wider text-slate-200">Live Audio Analysis</h2>
          </div>
          
          <button
            onClick={toggleListening}
            className={`
              px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-widest flex items-center gap-2 transition-all
              ${audioState.isListening
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                : 'bg-emerald-500 text-slate-900 hover:bg-emerald-400'
              }
            `}
          >
            {audioState.isListening ? (
              <><MicOff className="w-4 h-4" /> Stop</>
            ) : (
              <><Mic className="w-4 h-4" /> Start Listening</>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Main Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Detected Key */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Music className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">Detected Key</span>
            </div>
            <div className="text-3xl font-serif font-bold text-emerald-400">
              {audioState.detectedKey || '—'}
            </div>
            {audioState.keyConfidence > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-slate-500">Confidence:</span>
                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${Math.min(audioState.keyConfidence * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {Math.round(audioState.keyConfidence * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Dominant Note */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">Current Note</span>
            </div>
            <div className="text-3xl font-serif font-bold text-gold-400">
              {audioState.dominantNote || '—'}
            </div>
            {audioState.dominantNoteFrequency && (
              <div className="mt-2 text-xs text-slate-500">
                {audioState.dominantNoteFrequency.toFixed(1)} Hz
              </div>
            )}
            {/* Volume indicator */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-slate-500">Level:</span>
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gold-500 transition-all duration-75"
                  style={{ width: `${Math.min(audioState.volume * 500, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Note Occurrence Graph */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-gold-500" />
              <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">Note Occurrences</span>
            </div>
            <div className="flex items-center gap-2">
              {audioState.gpuAccelerated && (
                <span className="flex items-center gap-1 text-xs text-emerald-400">
                  <Zap className="w-3 h-3" /> GPU
                </span>
              )}
              <span className="text-xs text-slate-500">
                {audioState.totalNotesDetected} notes
              </span>
            </div>
          </div>
          
          {/* Note bars */}
          {(() => {
            const noteEntries = Object.entries(audioState.noteOccurrences) as [string, number][];
            if (noteEntries.length === 0) {
              return (
                <div className="text-center text-slate-500 text-sm py-4">
                  {audioState.isListening ? 'Play some notes...' : 'No notes detected yet'}
                </div>
              );
            }
            
            const maxOccurrence = Math.max(...noteEntries.map(([, count]) => count), 1);
            const sortedNotes = NOTE_NAMES.filter(n => audioState.noteOccurrences[n]);
            
            return (
              <div className="space-y-1">
                {sortedNotes.map(note => {
                  const count = audioState.noteOccurrences[note] || 0;
                  const competence = audioState.noteCompetence[note] || 0;
                  const barWidth = (count / maxOccurrence) * 100;
                  const isCurrentNote = audioState.dominantNote?.replace(/[0-9]/g, '') === note;
                  
                  return (
                    <div key={note} className="flex items-center gap-2">
                      <span className={`w-8 text-sm font-mono font-bold ${
                        isCurrentNote ? 'text-gold-400' : 'text-slate-300'
                      }`}>
                        {note}
                      </span>
                      <div className="flex-1 h-4 bg-slate-700 rounded overflow-hidden relative">
                        <div 
                          className={`h-full transition-all duration-150 ${
                            isCurrentNote ? 'bg-gold-500' : 'bg-blue-500/70'
                          }`}
                          style={{ width: `${barWidth}%` }}
                        />
                        {/* Competence indicator overlay */}
                        <div 
                          className="absolute top-0 right-0 h-full bg-emerald-500/30"
                          style={{ width: `${competence * 100}%` }}
                        />
                      </div>
                      <span className="w-16 text-right text-xs font-mono text-slate-400">
                        {count} <span className="text-emerald-400">({(competence * 100).toFixed(0)}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Interpolated Scales */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">Interpolated Scales (from notes)</span>
          </div>
          {(() => {
            const scales = audioState.interpolatedScales;
            if (scales.length === 0) {
              return (
                <div className="text-center text-slate-500 text-sm py-4">
                  {audioState.isListening ? 'Need more notes to interpolate scale...' : 'No scale detected'}
                </div>
              );
            }
            
            return (
              <div className="space-y-2">
                {scales.slice(0, 5).map((scale, idx) => (
                  <div key={`${scale.root}-${scale.type}`} className={`p-2 rounded ${
                    idx === 0 ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-slate-700/50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${
                        idx === 0 ? 'text-purple-400' : 'text-slate-300'
                      }`}>
                        {scale.root} {scale.type}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {(scale.confidence * 100).toFixed(0)}% match
                      </span>
                    </div>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {scale.matchedNotes.map(note => (
                        <span key={note} className="px-1.5 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 rounded">
                          {note}
                        </span>
                      ))}
                      {scale.missingNotes.slice(0, 3).map(note => (
                        <span key={note} className="px-1.5 py-0.5 text-xs bg-slate-600/50 text-slate-500 rounded">
                          {note}?
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Key Histogram */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Music className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">Key Detection (Krumhansl-Schmuckler)</span>
          </div>
          {(() => {
            const entries = Object.entries(audioState.keyHistogram) as [string, number][];
            if (entries.length === 0) {
              return (
                <div className="text-center text-slate-500 text-sm py-4">
                  {audioState.isListening ? 'Listening for keys...' : 'No data yet'}
                </div>
              );
            }
            const sorted = entries.sort((a, b) => b[1] - a[1]).slice(0, 6);
            const maxCount = sorted[0]?.[1] || 1;
            const totalCount = entries.reduce((sum, [, count]) => sum + count, 0);
            
            return (
              <div className="space-y-1">
                {sorted.map(([key, count]) => {
                  const percentage = (count / totalCount) * 100;
                  const isCurrentKey = key === audioState.detectedKey;
                  const barWidth = (count / maxCount) * 100;
                  
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <span className={`w-20 text-xs font-medium truncate ${
                        isCurrentKey ? 'text-emerald-400' : 'text-slate-300'
                      }`}>
                        {key}
                      </span>
                      <div className="flex-1 h-3 bg-slate-700 rounded overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            isCurrentKey ? 'bg-emerald-500' : 'bg-slate-500'
                          }`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <span className={`w-12 text-right text-xs font-mono ${
                        isCurrentKey ? 'text-emerald-400' : 'text-slate-400'
                      }`}>
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Instructions */}
        {!audioState.isListening && (
          <div className="mt-4 text-center text-slate-500 text-sm">
            Click "Start Listening" to analyze live audio from your microphone
          </div>
        )}
      </div>
    </section>
  );
};
