import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Hand,
  VolumeX,
} from "lucide-react";
import { ASL_SIGNS } from "./SignCard";
import FingerspellPlayer from "./FingerspellPlayer";
import { enrichToken } from "../lib/signPoseMap";

const SPEEDS = [
  { label: "0.75×", value: 0.75 },
  { label: "1×", value: 1 },
  { label: "1.25×", value: 1.25 },
];

export default function SignStudyPlayer({ signData, signSystem = "SgSL" }) {
  const sequence = useMemo(() => {
    if (signData?.fullSequence?.length) {
      return signData.fullSequence.map(enrichToken);
    }
    if (signData?.gloss?.length) {
      return signData.gloss.map(enrichToken);
    }
    return [];
  }, [signData]);

  const sections = signData?.sections || [];

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showEnglish, setShowEnglish] = useState(false);
  const timerRef = useRef(null);

  const active = sequence[index];
  const progress = sequence.length ? ((index + 1) / sequence.length) * 100 : 0;
  const done = index >= sequence.length - 1 && !playing;

  const sectionStarts = useMemo(() => {
    if (!sections.length) return [{ title: "Full lesson", start: 0 }];
    let cursor = 0;
    return sections.map((section) => {
      const start = cursor;
      section.sentences?.forEach((s) => {
        cursor += s.tokens?.length || 0;
      });
      return { title: section.title, start };
    });
  }, [sections]);

  const currentSection =
    [...sectionStarts].reverse().find((s) => index >= s.start)?.title ||
    "Lesson";

  useEffect(() => {
    setIndex(0);
    setPlaying(true);
  }, [signData]);

  useEffect(() => {
    if (!playing || !active || sequence.length === 0) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const isFingerspelling = !ASL_SIGNS[active.gloss];
    const lettersLength = (active.gloss || "").replace(/[^A-Z]/g, "").length;
    const baseDuration = isFingerspelling && lettersLength > 0 
      ? (lettersLength * 700 + 500) 
      : (active.duration || 650);
      
    const duration = Math.round(baseDuration / speed);
    timerRef.current = setTimeout(() => {
      setIndex((prev) => {
        if (prev >= sequence.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, duration);

    return () => clearTimeout(timerRef.current);
  }, [index, playing, active, sequence.length, speed]);

  const jumpTo = (i) => {
    setIndex(Math.max(0, Math.min(i, sequence.length - 1)));
    setPlaying(true);
  };

  if (!sequence.length) {
    return (
      <div className="p-8 text-center text-text-faint font-mono text-xs">
        No sign sequence generated yet.
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header — minimal text for Deaf-first UX */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-accent-mint/15 text-accent-mint border border-accent-mint/25 uppercase tracking-wider flex items-center gap-1.5">
            <Hand size={11} />
            {signSystem} · 3D Sign Study
          </span>
          <span className="font-mono text-[10px] text-text-faint">
            {sequence.length} signs · no reading required
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEnglish(!showEnglish)}
            className="font-mono text-[9px] uppercase px-2.5 py-1 rounded-full border border-white/10 text-text-faint hover:text-text-primary flex items-center gap-1 cursor-pointer"
          >
            {showEnglish ? <EyeOff size={10} /> : <Eye size={10} />}
            {showEnglish ? "Hide words" : "Show words"}
          </button>
          <div className="flex rounded-full border border-white/10 overflow-hidden">
            {SPEEDS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setSpeed(s.value)}
                className={`px-2 py-1 font-mono text-[9px] cursor-pointer ${
                  speed === s.value
                    ? "bg-accent-violet/20 text-accent-violetLight"
                    : "text-text-faint hover:text-text-dim"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current sign — large visual focus */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active?.gloss}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="text-center py-4 px-6 rounded-2xl border border-accent-mint/25 bg-accent-mint/5"
        >
          <div className="font-display font-black text-4xl md:text-5xl text-accent-mint tracking-wide mb-1">
            {active?.gloss}
          </div>
          {showEnglish && (
            <p className="text-sm text-text-dim font-mono">{active?.word}</p>
          )}
          <p className="font-mono text-[10px] text-text-faint mt-2 uppercase">
            {currentSection} · sign {index + 1} of {sequence.length}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="grid gap-4 grid-cols-1">
        <div className="rounded-2xl border border-white/10 overflow-hidden bg-dark-card">
          <div className="px-3 py-2 border-b border-white/5 font-mono text-[9px] text-text-faint uppercase">
            Hand Signs (SVG)
          </div>
          <div className="h-[220px] flex items-center justify-center p-4 relative">
            {(() => {
              const isFingerspelling = !ASL_SIGNS[active?.gloss];
              
              if (isFingerspelling) {
                return <FingerspellPlayer word={active?.gloss || active?.word} playing={playing} />;
              }

              const signInfo = ASL_SIGNS[active?.gloss];
              return (
                <>
                  <div 
                    className="absolute inset-0 opacity-20 blur-2xl transition-colors duration-500"
                    style={{ background: signInfo.color }}
                  />
                  <div
                    className="w-full h-full max-w-[140px] relative z-10 transition-all duration-300"
                    style={{
                      transform: playing ? "scale(1.05)" : "scale(1)",
                    }}
                    dangerouslySetInnerHTML={{ __html: signInfo.svg }}
                  />
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between font-mono text-[10px] text-text-faint">
          <span className="flex items-center gap-1">
            <VolumeX size={10} /> Visual-only study path
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-accent-mint to-accent-violet"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => jumpTo(index - 1)}
          disabled={index === 0}
          className="p-2.5 rounded-full border border-white/10 disabled:opacity-30 cursor-pointer hover:border-accent-mint/30"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => setPlaying(!playing)}
          className="px-6 py-2.5 rounded-full bg-accent-mint/15 border border-accent-mint/30 text-accent-mint font-mono text-xs uppercase flex items-center gap-2 cursor-pointer hover:bg-accent-mint/25"
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
          {playing ? "Pause" : done ? "Replay" : "Play all signs"}
        </button>
        <button
          type="button"
          onClick={() => jumpTo(index + 1)}
          disabled={index >= sequence.length - 1}
          className="p-2.5 rounded-full border border-white/10 disabled:opacity-30 cursor-pointer hover:border-accent-mint/30"
        >
          <ChevronRight size={16} />
        </button>
        <button
          type="button"
          onClick={() => {
            setIndex(0);
            setPlaying(true);
          }}
          className="p-2.5 rounded-full border border-white/10 cursor-pointer hover:border-white/20"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Section jump */}
      {sectionStarts.length > 1 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
          {sectionStarts.map((sec) => (
            <button
              key={sec.title}
              type="button"
              onClick={() => jumpTo(sec.start)}
              className={`font-mono text-[10px] px-3 py-1 rounded-full border cursor-pointer transition-colors ${
                index >= sec.start &&
                (sectionStarts[sectionStarts.indexOf(sec) + 1]?.start ?? sequence.length) > index
                  ? "border-accent-mint/40 bg-accent-mint/10 text-accent-mint"
                  : "border-white/10 text-text-faint hover:text-text-dim"
              }`}
            >
              {sec.title}
            </button>
          ))}
        </div>
      )}

      {done && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center p-4 rounded-xl border border-accent-mint/30 bg-accent-mint/5 font-mono text-xs text-accent-mint"
        >
          Section complete — you studied {sequence.length} signs without reading the full text.
        </motion.div>
      )}
    </div>
  );
}
