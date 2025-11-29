import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { NoteName, ScaleType, AIComposition } from '../types';
import { Sparkles, MessageCircle, Loader2, Music4, Wand2 } from 'lucide-react';

interface AICoachProps {
  root: NoteName;
  scaleType: ScaleType;
  onCompositionGenerated: (composition: AIComposition) => void;
}

export const AICoach: React.FC<AICoachProps> = ({ root, scaleType, onCompositionGenerated }) => {
  const [activeTab, setActiveTab] = useState<'coach' | 'composer'>('coach');
  const [tip, setTip] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedInfo, setGeneratedInfo] = useState<string | null>(null);
  const [promptText, setPromptText] = useState('');

  const fetchTip = async () => {
    if (!process.env.API_KEY) {
        setTip("Please configure your API Key to use the AI Coach.");
        return;
    }

    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        Act as a world-class classical flute professor. 
        Give me one specific, advanced technique or emotional visualization tip 
        for improvising or playing in the key of ${root} ${scaleType}. 
        Keep it under 50 words. Focus on tone color or phrasing.
      `;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setTip(response.text || "Keep your air stream steady and listen to the harmony.");
    } catch (error) {
      console.error("Gemini Error:", error);
      setTip("Could not connect to the maestro. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateComposition = async () => {
    if (!process.env.API_KEY) return;
    setLoading(true);
    setGeneratedInfo(null);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const userContext = promptText.trim() 
            ? `The user wants a backing track with this specific vibe/style: "${promptText}".` 
            : 'Create a musically interesting backing track suitable for improvisation.';

        const prompt = `
            Act as a music composer. ${userContext}
            Create a unique 4-bar chord progression and a 16-step rhythm pattern (step sequencer style) for a flute backing track in the key of ${root} ${scaleType}.
            
            Return ONLY a valid JSON object with the following structure:
            {
                "name": "Creative Title",
                "description": "Short description of the mood",
                "progression": [0, 4, 5, 3], // Array of 4 integers representing scale degrees (0-6)
                "rhythm": {
                    "steps": 16,
                    "beatsPerBar": 4,
                    "kick": [1, 0, 0, 0, ...], // Array of 16 integers (0 or 1)
                    "snare": [0, 0, 0, 0, ...], // Array of 16 integers
                    "hihat": [1, 1, 1, 1, ...], // Array of 16 integers
                    "bass": [1, 0, 0, 0, ...],  // Array of 16 integers
                    "chord": [1, 0, 0, 0, ...]  // Array of 16 integers
                },
                "tempo": 90
            }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    progression: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                    rhythm: {
                      type: Type.OBJECT,
                      properties: {
                        steps: { type: Type.INTEGER },
                        beatsPerBar: { type: Type.INTEGER },
                        kick: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                        snare: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                        hihat: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                        bass: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                        chord: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                      }
                    },
                    tempo: { type: Type.INTEGER },
                  }
                }
            }
        });

        const jsonText = response.text;
        if (jsonText) {
            const composition = JSON.parse(jsonText) as AIComposition;
            onCompositionGenerated(composition);
            setGeneratedInfo(`Generated: "${composition.name}" - ${composition.description}`);
        }
    } catch (error) {
        console.error("Gemini Gen Error:", error);
        setGeneratedInfo("Failed to compose music. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="mt-8 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-700">
            <button 
                onClick={() => setActiveTab('coach')}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'coach' ? 'bg-slate-800 text-gold-500' : 'bg-slate-900/50 text-slate-500 hover:text-slate-300'}`}
            >
                <MessageCircle className="w-4 h-4" /> Maestro Coach
            </button>
            <button 
                onClick={() => setActiveTab('composer')}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'composer' ? 'bg-slate-800 text-gold-500' : 'bg-slate-900/50 text-slate-500 hover:text-slate-300'}`}
            >
                <Music4 className="w-4 h-4" /> AI Composer
            </button>
        </div>

        <div className="p-6">
            {activeTab === 'coach' ? (
                <>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-serif text-slate-100 flex items-center gap-2">
                        <Sparkles className="text-gold-400 w-5 h-5" />
                        Performance Advice
                        </h3>
                        <button
                        onClick={fetchTip}
                        disabled={loading}
                        className="px-4 py-2 bg-gold-600 hover:bg-gold-500 text-slate-900 font-semibold rounded-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
                        >
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                        {loading ? "Thinking..." : "Get Advice"}
                        </button>
                    </div>
                    
                    <div className="min-h-[60px] bg-slate-950/50 rounded-lg p-4 border border-slate-800">
                        {tip ? (
                        <p className="text-slate-300 font-serif italic leading-relaxed">"{tip}"</p>
                        ) : (
                        <p className="text-slate-600 text-sm">Ask for a tip on how to approach this scale emotionally or technically...</p>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <div className="mb-6">
                         <label className="block text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">
                            Describe the style or mood (Optional)
                         </label>
                         <textarea
                            value={promptText}
                            onChange={(e) => setPromptText(e.target.value)}
                            placeholder="E.g., A melancholic jazz ballad in 3/4 time, or an energetic latin groove with syncopation..."
                            className="w-full bg-slate-950/50 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:ring-2 focus:ring-purple-500/50 outline-none resize-none h-24 placeholder:text-slate-600 transition-all focus:border-purple-500/50"
                         />
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-serif text-slate-100 flex items-center gap-2">
                        <Wand2 className="text-purple-400 w-5 h-5" />
                        Generate Backing Track
                        </h3>
                        <button
                        onClick={generateComposition}
                        disabled={loading}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-50 shadow-lg shadow-purple-900/20"
                        >
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                        {loading ? "Composing..." : "Create Pattern"}
                        </button>
                    </div>
                    
                    <div className="min-h-[60px] bg-slate-950/50 rounded-lg p-4 border border-slate-800">
                        {generatedInfo ? (
                        <div className="text-slate-300">
                            <p className="font-semibold text-purple-400 mb-1">New Composition Ready</p>
                            <p className="text-sm italic">"{generatedInfo}"</p>
                            <p className="text-xs text-slate-500 mt-2">The progression and rhythm settings have been updated to "Custom". Press Play to hear it!</p>
                        </div>
                        ) : (
                        <p className="text-slate-600 text-sm">Use AI to generate a unique chord progression and rhythm pattern for this scale.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    </div>
  );
};
