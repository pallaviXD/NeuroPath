import React from "react";
import { motion } from "framer-motion";
import { Target, Activity, Eye, Info, Sparkles } from "lucide-react";
import { useAccessibilityStore, ACCESSIBILITY_MODES } from "../../store/useAccessibilityStore";

export default function LessonPlayerHeader({
  lesson,
  progress = 0,
  activeModality,
  activeIntervention,
  interventions = [],
}) {
  const mode = useAccessibilityStore((state) => state.mode);

  const getAccessibilityBadge = () => {
    switch (mode) {
      case ACCESSIBILITY_MODES.CAPTIONS:
        return (
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold text-accent-pinkLight bg-accent-pink/10 border border-accent-pink/25 px-3 py-1 rounded-full uppercase tracking-wider shadow-[0_0_12px_rgba(255,29,126,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-pink animate-pulse" />
            Captions Active
          </span>
        );
      case ACCESSIBILITY_MODES.SIGN:
        return (
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold text-accent-mint bg-accent-mint/10 border border-accent-mint/25 px-3 py-1 rounded-full uppercase tracking-wider shadow-[0_0_12px_rgba(21,207,160,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-mint animate-pulse" />
            Sign Support Active
          </span>
        );
      case ACCESSIBILITY_MODES.HIGH_CONTRAST:
        return (
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold text-accent-amber bg-accent-amber/10 border border-accent-amber/25 px-3 py-1 rounded-full uppercase tracking-wider shadow-[0_0_12px_rgba(255,179,71,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-amber animate-pulse" />
            High Contrast Active
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-text-faint bg-white/5 border border-white/10 px-3 py-1 rounded-full uppercase tracking-wider">
            Standard Mode
          </span>
        );
    }
  };

  const getModalityColor = (modality) => {
    switch (modality) {
      case "visual":
        return "text-accent-pinkLight bg-accent-pink/10 border-accent-pink/20";
      case "narrative":
        return "text-accent-violetLight bg-accent-violet/10 border-accent-violet/20";
      case "kinesthetic":
        return "text-accent-amber bg-accent-amber/10 border-accent-amber/20";
      case "sign":
        return "text-accent-mint bg-accent-mint/10 border-accent-mint/20";
      default:
        return "text-text-dim bg-white/5 border-white/10";
    }
  };

  return (
    <div className="w-full glass-panel rounded-[24px] border border-white/10 p-6 text-left space-y-5 relative overflow-hidden mb-6">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-accent-violet/5 rounded-full blur-2xl pointer-events-none" />

      {/* Main Title & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <span className="font-mono text-[10px] text-accent-violetLight bg-accent-violet/10 border border-accent-violet/20 px-2.5 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
            {lesson.subject || "Subject"}
          </span>
          <h2 className="font-display font-bold text-xl md:text-2xl text-text-primary tracking-tight">
            {lesson.title}
          </h2>
        </div>

        {/* Accessibility Status Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {getAccessibilityBadge()}
        </div>
      </div>

      {/* Progress tracker */}
      <div className="space-y-2">
        <div className="flex items-center justify-between font-mono text-[10.5px] text-text-dim">
          <span className="flex items-center gap-1">
            <Activity size={12} className="text-accent-pink" />
            Lesson Progress
          </span>
          <span className="font-bold text-text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-accent-pink via-accent-violet to-accent-mint"
          />
        </div>
      </div>

      {/* Learning Objectives */}
      {lesson.objectives && (
        <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] space-y-2">
          <div className="font-mono text-[10px] text-text-faint uppercase tracking-wider flex items-center gap-1.5">
            <Target size={12} className="text-accent-pink" />
            Learning Objectives
          </div>
          <p className="text-xs text-text-dim leading-relaxed">
            {lesson.objectives}
          </p>
        </div>
      )}

      {/* Modality Status & Intervention logs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-text-faint uppercase tracking-wider">
            Current Modality:
          </span>
          <span className={`font-mono text-[10.5px] px-3 py-1 rounded-full uppercase tracking-wider border font-bold ${getModalityColor(activeModality)}`}>
            {activeModality || "Select Modality"}
          </span>
        </div>

        {/* Intervention logs snippet */}
        {activeIntervention && (
          <div className="flex items-center gap-1.5 font-mono text-[10.5px] text-accent-amber">
            <Sparkles size={12} />
            <span>AI Adaptation Active: {activeIntervention.type}</span>
          </div>
        )}
      </div>
    </div>
  );
}
