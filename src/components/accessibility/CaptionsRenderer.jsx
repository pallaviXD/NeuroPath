import React from "react";
import { motion } from "framer-motion";
import { useAccessibilityStore, ACCESSIBILITY_MODES } from "../../store/useAccessibilityStore";

export default function CaptionsRenderer({ text, activeToken }) {
  const mode = useAccessibilityStore((state) => state.mode);

  if (mode !== ACCESSIBILITY_MODES.CAPTIONS) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mt-4 p-4 rounded-xl border border-accent-pink/20 bg-accent-pink/5 text-left relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-accent-pink/5 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-[9px] text-accent-pinkLight uppercase tracking-wider font-bold">
          [Synchronized Captions Active]
        </span>
        {activeToken && (
          <span className="font-mono text-[9px] text-text-faint uppercase">
            Active: {activeToken.gloss}
          </span>
        )}
      </div>

      <p className="text-text-primary text-sm leading-relaxed">
        {activeToken ? (
          <span>
            Current gesture represents: <strong className="text-accent-pinkLight uppercase">{activeToken.word}</strong>
          </span>
        ) : (
          text || "No active speech or gesture details."
        )}
      </p>
    </motion.div>
  );
}
