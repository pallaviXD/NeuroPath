import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Eye, Hand, Contrast, Type, Zap, X } from "lucide-react";
import { useAccessibilityStore, ACCESSIBILITY_MODES, FONT_SIZES } from "../../store/useAccessibilityStore";

export default function AccessibilityCenter({ isOpen, onClose }) {
  const {
    mode,
    fontSize,
    reducedMotion,
    signLanguage,
    setMode,
    setFontSize,
    setReducedMotion,
    setSignLanguage,
    reset
  } = useAccessibilityStore();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg glass-panel rounded-3xl border border-white/10 p-6 md:p-8 bg-dark-bg/95 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent-pink/15 border border-accent-pink/20 flex items-center justify-center text-accent-pinkLight">
                <Settings size={18} />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-text-primary">Accessibility Center</h3>
                <p className="text-[10px] font-mono text-text-faint uppercase tracking-wider">Configure your learning profile</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full border border-white/5 text-text-dim hover:text-text-primary hover:bg-white/5 cursor-pointer transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-6">
            {/* 1. Learning Mode Selection */}
            <div>
              <label className="font-mono text-[10px] text-text-faint uppercase tracking-wider mb-3 block">
                Learning Modality Overlay
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMode(ACCESSIBILITY_MODES.STANDARD)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    mode === ACCESSIBILITY_MODES.STANDARD
                      ? "border-accent-violet bg-accent-violet/10 text-accent-violetLight"
                      : "border-white/5 bg-white/[0.02] text-text-dim hover:border-white/15 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="font-semibold text-sm mb-1">Standard Mode</div>
                  <div className="font-mono text-[10px] text-text-faint">Visual, stories & tasks</div>
                </button>

                <button
                  onClick={() => setMode(ACCESSIBILITY_MODES.CAPTIONS)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    mode === ACCESSIBILITY_MODES.CAPTIONS
                      ? "border-accent-pink bg-accent-pink/10 text-accent-pinkLight"
                      : "border-white/5 bg-white/[0.02] text-text-dim hover:border-white/15 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Eye size={14} className="text-accent-pinkLight" />
                    <span className="font-semibold text-sm">Captions</span>
                  </div>
                  <div className="font-mono text-[10px] text-text-faint">Synchronized text overlay</div>
                </button>

                <button
                  onClick={() => setMode(ACCESSIBILITY_MODES.SIGN)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    mode === ACCESSIBILITY_MODES.SIGN
                      ? "border-accent-mint bg-accent-mint/10 text-accent-mint"
                      : "border-white/5 bg-white/[0.02] text-text-dim hover:border-white/15 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Hand size={14} className="text-accent-mint" />
                    <span className="font-semibold text-sm">Sign Language</span>
                  </div>
                  <div className="font-mono text-[10px] text-text-faint">3D ISL avatar gestures</div>
                </button>

                <button
                  onClick={() => setMode(ACCESSIBILITY_MODES.HIGH_CONTRAST)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    mode === ACCESSIBILITY_MODES.HIGH_CONTRAST
                      ? "border-accent-amber bg-accent-amber/10 text-accent-amber"
                      : "border-white/5 bg-white/[0.02] text-text-dim hover:border-white/15 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Contrast size={14} className="text-accent-amber" />
                    <span className="font-semibold text-sm">High Contrast</span>
                  </div>
                  <div className="font-mono text-[10px] text-text-faint">Strong visual visibility</div>
                </button>
              </div>
            </div>

            {/* 2. Font Size Controls */}
            <div>
              <label className="font-mono text-[10px] text-text-faint uppercase tracking-wider mb-3 block flex items-center gap-1.5">
                <Type size={13} className="text-text-faint" />
                Text Sizing
              </label>
              <div className="flex gap-2.5">
                {Object.values(FONT_SIZES).map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`flex-1 py-2.5 rounded-xl border font-mono text-xs uppercase cursor-pointer transition-all ${
                      fontSize === size
                        ? "border-accent-pink bg-accent-pink/10 text-accent-pinkLight font-bold"
                        : "border-white/5 bg-white/[0.02] text-text-dim hover:border-white/10"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Reduced Motion & Settings Reset */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setReducedMotion(!reducedMotion)}
                className={`p-3.5 rounded-xl border-2 text-left transition-all flex items-center justify-between cursor-pointer ${
                  reducedMotion
                    ? "border-accent-violet bg-accent-violet/10 text-accent-violetLight"
                    : "border-white/5 bg-white/[0.02] text-text-dim hover:border-white/10"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Zap size={14} />
                  <span className="text-xs font-semibold">Reduced Motion</span>
                </div>
                <div className={`w-8 h-4.5 rounded-full p-0.5 transition-all ${reducedMotion ? "bg-accent-violet" : "bg-white/10"}`}>
                  <div className={`w-3.5 h-3.5 rounded-full bg-white transition-all ${reducedMotion ? "translate-x-3.5" : ""}`} />
                </div>
              </button>

              <button
                onClick={reset}
                className="p-3.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 text-text-dim hover:text-text-primary text-xs font-mono uppercase tracking-wider text-center cursor-pointer transition-colors"
              >
                Reset Defaults
              </button>
            </div>

            {/* 4. Language Selection */}
            {mode === ACCESSIBILITY_MODES.SIGN && (
              <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-text-primary">Sign Language Variant</div>
                  <div className="text-[10px] text-text-faint font-mono uppercase mt-0.5">Procedural & SVG rendering</div>
                </div>
                <span className="font-mono text-xs text-accent-mint bg-accent-mint/10 border border-accent-mint/20 px-3 py-1 rounded-full">
                  {signLanguage}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
