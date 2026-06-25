// SVGSignRenderer — renders a sign vocabulary sequence as animated SVG handshapes
// Used in AccessibilityLessonView for sign vocabulary display

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";

// Simple SVG hand shapes for common signs
const HAND_SHAPES = {
  default: `<svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="40" cy="70" rx="18" ry="22" fill="#15CFA0" opacity="0.3"/>
    <rect x="32" y="18" width="8" height="35" rx="4" fill="#15CFA0"/>
    <rect x="42" y="14" width="8" height="38" rx="4" fill="#15CFA0"/>
    <rect x="22" y="20" width="8" height="32" rx="4" fill="#15CFA0"/>
    <rect x="52" y="22" width="7" height="28" rx="3.5" fill="#15CFA0"/>
    <rect x="14" y="32" width="7" height="20" rx="3.5" fill="#15CFA0"/>
  </svg>`,
  fist: `<svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="40" cy="60" rx="22" ry="25" fill="#7B2FF7" opacity="0.3"/>
    <rect x="18" y="45" width="44" height="30" rx="10" fill="#7B2FF7"/>
    <rect x="22" y="38" width="10" height="18" rx="5" fill="#7B2FF7"/>
    <rect x="34" y="36" width="10" height="18" rx="5" fill="#7B2FF7"/>
    <rect x="46" y="38" width="9" height="16" rx="4.5" fill="#7B2FF7"/>
    <rect x="14" y="48" width="8" height="14" rx="4" fill="#7B2FF7"/>
  </svg>`,
  point: `<svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="40" cy="70" rx="18" ry="22" fill="#FF1D7E" opacity="0.3"/>
    <rect x="36" y="10" width="8" height="45" rx="4" fill="#FF1D7E"/>
    <rect x="22" y="40" width="8" height="22" rx="4" fill="#FF1D7E"/>
    <rect x="32" y="44" width="8" height="22" rx="4" fill="#FF1D7E"/>
    <rect x="50" y="44" width="7" height="20" rx="3.5" fill="#FF1D7E"/>
    <rect x="14" y="48" width="7" height="16" rx="3.5" fill="#FF1D7E"/>
  </svg>`,
  flat: `<svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="40" cy="65" rx="20" ry="18" fill="#FFB347" opacity="0.3"/>
    <rect x="14" y="30" width="52" height="10" rx="5" fill="#FFB347"/>
    <rect x="18" y="40" width="44" height="20" rx="8" fill="#FFB347"/>
    <rect x="22" y="20" width="8" height="20" rx="4" fill="#FFB347"/>
    <rect x="32" y="18" width="8" height="20" rx="4" fill="#FFB347"/>
    <rect x="42" y="18" width="8" height="20" rx="4" fill="#FFB347"/>
    <rect x="52" y="20" width="7" height="18" rx="3.5" fill="#FFB347"/>
  </svg>`,
};

function getHandShape(gloss) {
  const g = (gloss || "").toUpperCase();
  if (["PUSH", "FORCE", "MOVE", "GO", "AWAY"].some(w => g.includes(w))) return "point";
  if (["STAY", "HOLD", "STOP", "SAME", "FLAT"].some(w => g.includes(w))) return "flat";
  if (["GRAB", "HOLD", "TAKE", "CLOSE", "TIGHT"].some(w => g.includes(w))) return "fist";
  return "default";
}

function getHandColor(gloss) {
  const g = (gloss || "").toUpperCase();
  if (["PUSH", "FORCE", "MOVE"].some(w => g.includes(w))) return "#FF1D7E";
  if (["STAY", "STOP", "SAME"].some(w => g.includes(w))) return "#FFB347";
  if (["OBJECT", "THING", "MATTER"].some(w => g.includes(w))) return "#7B2FF7";
  return "#15CFA0";
}

export function SVGSignPlayer({ glossSequence = [] }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timerRef = useRef(null);

  const active = glossSequence[index];
  const progress = glossSequence.length ? ((index + 1) / glossSequence.length) * 100 : 0;

  useEffect(() => {
    if (!playing || !active || !glossSequence.length) return;
    const dur = active.duration || 700;
    timerRef.current = setTimeout(() => {
      setIndex(prev => {
        if (prev >= glossSequence.length - 1) { setPlaying(false); return prev; }
        return prev + 1;
      });
    }, dur);
    return () => clearTimeout(timerRef.current);
  }, [index, playing, active, glossSequence.length]);

  useEffect(() => {
    setIndex(0);
    setPlaying(true);
  }, [glossSequence]);

  if (!glossSequence.length) {
    return (
      <div className="p-6 text-center text-text-faint font-mono text-xs border border-white/5 rounded-xl">
        No sign sequence available.
      </div>
    );
  }

  const shape = getHandShape(active?.gloss);
  const color = getHandColor(active?.gloss);

  return (
    <div className="w-full space-y-3">
      {/* Sign display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active?.gloss}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center p-4 rounded-2xl border border-white/10 bg-white/[0.02]"
        >
          <div className="w-20 h-24 mb-2" dangerouslySetInnerHTML={{ __html: HAND_SHAPES[shape] }} />
          <div className="font-mono font-black text-2xl" style={{ color }}>{active?.gloss}</div>
          {active?.word && <div className="font-mono text-xs text-text-faint mt-1">{active.word}</div>}
        </motion.div>
      </AnimatePresence>

      {/* Progress */}
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div className="h-full bg-accent-mint rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.2 }} />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <button onClick={() => setIndex(Math.max(0, index - 1))} disabled={index === 0}
          className="p-2 rounded-full border border-white/10 disabled:opacity-30 cursor-pointer">
          <ChevronLeft size={14} />
        </button>
        <button onClick={() => setPlaying(!playing)}
          className="px-4 py-1.5 rounded-full bg-accent-mint/15 border border-accent-mint/30 text-accent-mint font-mono text-xs cursor-pointer flex items-center gap-1.5">
          {playing ? <Pause size={12} /> : <Play size={12} />}
          {playing ? "Pause" : "Play"}
        </button>
        <button onClick={() => { setIndex(Math.min(glossSequence.length - 1, index + 1)); }} disabled={index >= glossSequence.length - 1}
          className="p-2 rounded-full border border-white/10 disabled:opacity-30 cursor-pointer">
          <ChevronRight size={14} />
        </button>
        <button onClick={() => { setIndex(0); setPlaying(true); }}
          className="p-2 rounded-full border border-white/10 cursor-pointer">
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Token list */}
      <div className="flex flex-wrap gap-1 justify-center">
        {glossSequence.map((t, i) => (
          <button key={i} onClick={() => { setIndex(i); setPlaying(true); }}
            className={`font-mono text-[9px] px-2 py-0.5 rounded-full border cursor-pointer transition-all ${
              i === index ? "border-accent-mint/50 bg-accent-mint/15 text-accent-mint font-bold" : "border-white/8 text-text-faint hover:text-text-dim"
            }`}>
            {t.gloss}
          </button>
        ))}
      </div>
    </div>
  );
}
