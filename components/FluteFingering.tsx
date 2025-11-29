import React from 'react';
import { Fingering } from '../types';

interface FluteFingeringProps {
  fingering: Fingering | null;
}

export const FluteFingering: React.FC<FluteFingeringProps> = ({ fingering }) => {
  // Default State
  const active = fingering || {
    note: 'Select Note',
    thumb: false, thumbBb: false,
    lh1: false, lh2: false, lh3: false, lhPinky: false,
    rh1: false, rh2: false, rh3: false, 
    rhPinkyEb: false, rhPinkyCsharp: false, rhPinkyC: false,
  };

  const isSelected = !!fingering;

  // Component for drawing keys
  const Key = ({ x, y, r = 10, pressed, label, type = 'circle' }: { x: number, y: number, r?: number, pressed: boolean, label?: string, type?: 'circle' | 'rect' | 'pill' | 'paddle' | 'lever' }) => {
    // Styling
    // Filled = Closed/Pressed. Outline = Open.
    // In flute charts, filled circle usually means key pressed.
    const fillClass = pressed ? 'fill-slate-900' : 'fill-white';
    const strokeClass = 'stroke-slate-900';
    
    return (
      <g transform={`translate(${x}, ${y})`}>
        {type === 'circle' && (
             <circle cx={0} cy={0} r={r} className={`${fillClass} ${strokeClass} stroke-2`} />
        )}
        
        {type === 'pill' && (
             <rect x={-r} y={-r + 2} width={r * 2} height={r * 1.5} rx={5} className={`${fillClass} ${strokeClass} stroke-2`} />
        )}

        {type === 'lever' && (
             <rect x={-r/2} y={-r} width={r} height={r * 2.5} rx={3} className={`${fillClass} ${strokeClass} stroke-2`} />
        )}

        {type === 'paddle' && (
             <path 
                d={`M ${-r} ${-r/2} Q 0 ${-r} ${r+2} ${-r/2} L ${r+2} ${r/2} Q 0 ${r} ${-r} ${r/2} Z`} 
                className={`${fillClass} ${strokeClass} stroke-2`} 
            />
        )}
        
        {label && (
           <text x={r + 15} y={5} className="fill-slate-600 text-[10px] font-sans font-bold uppercase">{label}</text>
        )}
      </g>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 bg-white border border-slate-200 rounded-xl shadow-lg relative overflow-hidden">
      
      <h3 className={`text-4xl font-serif mb-6 tracking-wider ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
        {active.note}
      </h3>
      
      <div className="relative p-4">
        {/* SVG Fingering Chart - Vertical Style */}
        <svg width="240" height="550" viewBox="0 0 240 550" className="drop-shadow-sm">
          
          {/* Central Guide Line */}
          <line x1="120" y1="20" x2="120" y2="530" className="stroke-slate-300" strokeWidth="1" strokeDasharray="4 4"/>

          {/* LEFT HAND HEADER */}
          <text x="70" y="25" className="fill-slate-400 text-[10px] font-bold uppercase tracking-widest text-center">Left Hand</text>
          
          {/* Thumb Keys Area (Offset Left) */}
          <g transform="translate(60, 60)">
             {/* B Thumb */}
             <Key x={0} y={0} r={11} pressed={active.thumb} type="circle" />
             <text x={-25} y={4} className="fill-slate-500 text-[9px] font-bold">TH</text>
             
             {/* Bb Thumb (Lever/Key) */}
             <Key x={0} y={28} r={9} pressed={active.thumbBb} type="lever" />
             <text x={-25} y={32} className="fill-slate-500 text-[9px] font-bold">Bb</text>
          </g>

          {/* Main Key Stack LH */}
          <g transform="translate(120, 60)">
             {/* 1 (Index) */}
             <Key x={0} y={0} pressed={active.lh1} label="1" />
             
             {/* 2 (Middle) - often skipped key in between visually but let's keep it simple stack */}
             <Key x={0} y={40} pressed={active.lh2} label="2" />
             
             {/* 3 (Ring) */}
             <Key x={0} y={80} pressed={active.lh3} label="3" />
             
             {/* G# (Pinky) - Offset Right */}
             <Key x={35} y={95} r={10} pressed={active.lhPinky} type="paddle" label="G#" />
          </g>

          {/* DIVIDER */}
          <line x1="80" y1="180" x2="160" y2="180" className="stroke-slate-300" strokeWidth="2" />

          {/* RIGHT HAND HEADER */}
          <text x="70" y="210" className="fill-slate-400 text-[10px] font-bold uppercase tracking-widest text-center">Right Hand</text>

          {/* Main Key Stack RH */}
          <g transform="translate(120, 240)">
             {/* 1 (Index) */}
             <Key x={0} y={0} pressed={active.rh1} label="1" />
             
             {/* 2 (Middle) */}
             <Key x={0} y={40} pressed={active.rh2} label="2" />
             
             {/* 3 (Ring) */}
             <Key x={0} y={80} pressed={active.rh3} label="3" />
          </g>

          {/* RH Pinky Cluster (Foot Joint Keys) */}
          <g transform="translate(120, 350)">
             {/* Eb Key (Standard Pinky) - Offset Right */}
             <Key x={35} y={0} r={11} pressed={active.rhPinkyEb} type="paddle" label="Eb" />

             {/* C# Roller - Below Eb, slightly further out or in line? Usually lower/wider */}
             <Key x={35} y={40} r={10} pressed={active.rhPinkyCsharp} type="circle" label="C#" />

             {/* C Roller - Below C# */}
             <Key x={35} y={75} r={10} pressed={active.rhPinkyC} type="circle" label="C" />
          </g>

          {/* Connecting lines for visualization aesthetics */}
          <path d="M 120 60 L 120 140" className="stroke-slate-200 stroke-1 fill-none" />
          <path d="M 120 240 L 120 320" className="stroke-slate-200 stroke-1 fill-none" />

        </svg>
      </div>
      
      {!isSelected && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
             <p className="text-slate-500 font-serif italic text-lg">Select a note</p>
          </div>
      )}
    </div>
  );
};