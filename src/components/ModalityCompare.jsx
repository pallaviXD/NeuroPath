import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle, CheckCircle2, ArrowRightLeft } from "lucide-react";

const SCENARIOS = {
  wrong: {
    label: "Generic rotation (no profile)",
    modality: "narrative",
    content:
      "Organizational inertia means companies resist change. Strategy stays static until external pressure forces adaptation...",
    attempts: 3,
    timeSec: 47,
    resolved: false,
    score: "Failed checkpoint",
  },
  right: {
    label: "Profile-aware intervention",
    modality: "visual",
    content: "Interactive force diagram: Market Push vs Status Quo on the company — hover nodes to trace strategic tension.",
    attempts: 1,
    timeSec: 12,
    resolved: true,
    score: "Checkpoint cleared",
  },
};

export default function ModalityCompare() {
  const [mode, setMode] = useState("wrong");
  const active = SCENARIOS[mode];

  return (
    <div className="glass-panel rounded-3xl border border-white/10 p-6 md:p-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-accent-amber mb-1 flex items-center gap-1.5">
            <ArrowRightLeft size={11} /> A/B proof
          </div>
          <h3 className="font-display font-bold text-lg text-text-primary">
            Same student. Same struggle. Different outcome.
          </h3>
        </div>
        <div className="flex rounded-full border border-white/10 p-1 bg-dark-bg/60">
          {(["wrong", "right"]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setMode(key)}
              className={`px-4 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                mode === key
                  ? key === "wrong"
                    ? "bg-accent-pink/20 text-accent-pink border border-accent-pink/30"
                    : "bg-accent-mint/20 text-accent-mint border border-accent-mint/30"
                  : "text-text-faint hover:text-text-dim"
              }`}
            >
              {key === "wrong" ? "Without profile" : "With NeuroPath"}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className={`rounded-2xl border p-5 ${
            mode === "wrong"
              ? "border-accent-pink/25 bg-accent-pink/5"
              : "border-accent-mint/25 bg-accent-mint/5"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] uppercase text-text-faint">
              {active.label}
            </span>
            <span
              className={`font-mono text-[10px] px-2 py-0.5 rounded-full uppercase ${
                mode === "wrong"
                  ? "bg-accent-pink/15 text-accent-pink"
                  : "bg-accent-mint/15 text-accent-mint"
              }`}
            >
              {active.modality} modality
            </span>
          </div>
          <p className="text-sm text-text-dim leading-relaxed mb-4">{active.content}</p>
          <div className="grid grid-cols-3 gap-3 font-mono text-[10px]">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-text-faint mb-1">Attempts</div>
              <div className="text-lg font-bold text-text-primary">{active.attempts}</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-text-faint mb-1">Time to clear</div>
              <div className="text-lg font-bold text-text-primary">{active.timeSec}s</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-text-faint mb-1">Outcome</div>
              <div
                className={`text-xs font-bold flex items-center gap-1 ${
                  active.resolved ? "text-accent-mint" : "text-accent-pink"
                }`}
              >
                {active.resolved ? (
                  <CheckCircle2 size={12} />
                ) : (
                  <XCircle size={12} />
                )}
                {active.score}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
