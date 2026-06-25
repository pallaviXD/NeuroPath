import React, { useState, useEffect, useRef } from "react";
import { svgSignEngine } from "./SVGSignEngine";
import { Play, Pause, RotateCcw, VolumeX, Hand } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Beautiful interactive SVG sign player component
export function SVGSignPlayer({ glossSequence = [], activeIndex, isPlaying: externalPlaying, onIndexChange, speed = 1, compact = false }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [internalPlaying, setInternalPlaying] = useState(true);
  const [currentSignData, setCurrentSignData] = useState(null); // { type: 'word'|'letters', paths: Array, fallback: boolean }
  const [letterIndex, setLetterIndex] = useState(0);
  const [svgContent, setSvgContent] = useState("");
  const [loading, setLoading] = useState(false);

  const isControlled = activeIndex !== undefined;
  const index = isControlled ? activeIndex : currentIndex;
  const playing = isControlled ? externalPlaying : internalPlaying;

  const activeToken = glossSequence[index];
  const word = activeToken?.word || activeToken?.gloss || "";

  // Resolve SVG paths for current word
  useEffect(() => {
    if (!word) return;
    setLoading(true);
    setLetterIndex(0);
    svgSignEngine.renderWord(word).then((res) => {
      setCurrentSignData(res);
      setLoading(false);
    });
  }, [word]);

  // Handle letter-by-letter cycling or moving to next word
  useEffect(() => {
    if (!playing || !currentSignData || glossSequence.length === 0) return;

    if (currentSignData.type === "word") {
      // Word level sign duration
      const duration = (activeToken?.duration || 1500) / speed;
      const timer = setTimeout(() => {
        if (isControlled) {
          if (onIndexChange) onIndexChange((index + 1) % glossSequence.length);
        } else {
          setCurrentIndex((prev) => (prev + 1) % glossSequence.length);
        }
      }, duration);
      return () => clearTimeout(timer);
    } else {
      // Fingerspelling letters loop
      const paths = currentSignData.paths;
      const duration = 700 / speed;
      const timer = setTimeout(() => {
        if (letterIndex < paths.length - 1) {
          setLetterIndex((prev) => prev + 1);
        } else {
          // Finished spelling the word, go to next word
          setLetterIndex(0);
          if (isControlled) {
            if (onIndexChange) onIndexChange((index + 1) % glossSequence.length);
          } else {
            setCurrentIndex((prev) => (prev + 1) % glossSequence.length);
          }
        }
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [index, playing, currentSignData, letterIndex, speed, isControlled, glossSequence.length, activeToken?.duration]);

  // Load actual SVG file content
  useEffect(() => {
    if (!currentSignData) return;
    let path = "";
    if (currentSignData.type === "word") {
      path = currentSignData.paths[0];
    } else if (currentSignData.paths.length > 0) {
      path = currentSignData.paths[letterIndex];
    }

    if (path) {
      fetch(path)
        .then((res) => {
          if (res.ok) return res.text();
          throw new Error("Failed to load SVG");
        })
        .then((text) => {
          // Remove potential scripts or unwanted XML headers
          const cleanSvg = text.replace(/<\?xml[^>]*>/, "").replace(/<!DOCTYPE[^>]*>/, "");
          setSvgContent(cleanSvg);
        })
        .catch(() => {
          setSvgContent(`<svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg">
            <text x="60" y="80" text-anchor="middle" fill="#15CFA0" font-size="14" font-family="monospace">?</text>
          </svg>`);
        });
    }
  }, [currentSignData, letterIndex]);

  const progress = glossSequence.length ? ((index + 1) / glossSequence.length) * 100 : 0;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Viewport */}
      <div className={`w-full ${compact ? "h-[180px]" : "h-[220px]"} bg-dark-card border border-white/5 rounded-2xl relative overflow-hidden flex items-center justify-center p-4`}>
        {/* Soft grid lines inside viewport */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

        {/* Backdrop Glow */}
        <div 
          className="absolute inset-0 opacity-15 blur-3xl transition-colors duration-500 bg-accent-mint"
        />

        {/* SVG Container */}
        <div 
          className={`w-full h-full max-w-[130px] relative z-10 transition-transform duration-300 flex items-center justify-center ${
            playing ? "scale-105" : "scale-100"
          }`}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />

        {/* Controls Overlay */}
        {!isControlled && (
          <div className="absolute bottom-2 right-2 flex gap-1.5 z-20">
            <button
              onClick={() => setInternalPlaying(!internalPlaying)}
              className="px-2.5 py-1 bg-dark-bg/85 border border-white/10 hover:border-accent-mint/30 hover:bg-dark-bg text-text-dim hover:text-accent-mint font-mono text-[9px] uppercase tracking-wider rounded-md cursor-pointer transition-all"
            >
              {playing ? "Pause" : "Play"}
            </button>
            <button
              onClick={() => {
                setCurrentIndex(0);
                setLetterIndex(0);
              }}
              className="px-2.5 py-1 bg-dark-bg/85 border border-white/10 hover:border-white/20 text-text-dim hover:text-text-primary font-mono text-[9px] uppercase tracking-wider rounded-md cursor-pointer transition-all"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Gloss spelling / sub-letter track */}
      {currentSignData && currentSignData.type === "letters" && (
        <div className="mt-3 flex gap-1 justify-center flex-wrap">
          {word.toUpperCase().split("").map((char, i) => (
            <span 
              key={i} 
              className={`font-mono text-xs uppercase transition-colors duration-200 ${
                i === letterIndex 
                  ? "text-accent-mint font-bold scale-110" 
                  : i < letterIndex 
                    ? "text-accent-mint/50" 
                    : "text-text-faint"
              }`}
            >
              {char}
            </span>
          ))}
        </div>
      )}

      {/* Word Sequence List */}
      {!compact && (
        <div className="w-full mt-3 px-2 flex flex-wrap justify-center items-center gap-1.5">
          {glossSequence.map((token, idx) => (
            <span
              key={idx}
              className={`font-mono text-[11px] px-2.5 py-0.5 rounded-full transition-all border ${
                idx === index && playing
                  ? "bg-accent-mint/20 border-accent-mint/45 text-accent-mint font-bold scale-105 shadow-[0_0_12px_rgba(21,207,160,0.2)]"
                  : "bg-white/[0.01] border-white/5 text-text-faint"
              }`}
            >
              {token.gloss}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export class SVGSignRenderer {
  constructor() {
    this.name = "SVG";
  }

  async render(glossSequence, options = {}) {
    return {
      component: SVGSignPlayer,
      props: {
        glossSequence,
        ...options,
      }
    };
  }
}
