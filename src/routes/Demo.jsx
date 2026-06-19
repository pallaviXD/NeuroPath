import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, ChevronRight, HelpCircle, ArrowRightLeft, Activity } from "lucide-react";
import ForceDiagram from "../components/ForceDiagram";
import SigningAvatar from "../components/SigningAvatar";

export default function Demo() {
  // Demo states: 0=Reset/Ready, 1=Reading, 2=ConfusionDetected, 3=InterventionDelivered, 4=LessonCompleted
  const [demoState, setDemoState] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const autoplayTimerRef = useRef(null);

  // Sign gloss sequence for Student B
  const gravityGloss = [
    { gloss: "OBJECT", duration: 800 },
    { gloss: "STAY", duration: 600 },
    { gloss: "SAME", duration: 800 },
    { gloss: "UNTIL", duration: 500 },
    { gloss: "PUSH", duration: 900 },
    { gloss: "CHANGES", duration: 700 }
  ];

  // Autoplay sequencer
  useEffect(() => {
    if (!isPlaying) {
      if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current);
      return;
    }

    if (demoState === 0) {
      setDemoState(1);
      autoplayTimerRef.current = setTimeout(() => setDemoState(2), 1200);
    } else if (demoState === 1) {
      autoplayTimerRef.current = setTimeout(() => setDemoState(2), 1200);
    } else if (demoState === 2) {
      autoplayTimerRef.current = setTimeout(() => setDemoState(3), 1800);
    } else if (demoState === 3) {
      autoplayTimerRef.current = setTimeout(() => setDemoState(4), 2800);
    } else if (demoState === 4) {
      setIsPlaying(false);
    }

    return () => {
      if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current);
    };
  }, [isPlaying, demoState]);

  const handleReset = () => {
    setIsPlaying(false);
    setDemoState(0);
    if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current);
  };

  const handleNextStep = () => {
    setIsPlaying(false);
    setDemoState((prev) => Math.min(prev + 1, 4));
  };

  // Get status class/label
  const getStatusText = (state) => {
    switch (state) {
      case 0: return "Ready";
      case 1: return "Reading…";
      case 2: return "Confusion Detected";
      case 3: return "Intervention Delivered";
      case 4: return "Lesson Complete ✓";
      default: return "Ready";
    }
  };

  const getStatusBadgeClass = (state) => {
    switch (state) {
      case 0: return "bg-white/5 text-text-faint border border-white/5";
      case 1: return "bg-accent-violet/10 text-accent-violetLight border border-accent-violet/20 animate-pulse";
      case 2: return "bg-accent-amber/15 text-accent-amber border border-accent-amber/20";
      case 3: return "bg-accent-pink/15 text-accent-pinkLight border border-accent-pink/20";
      case 4: return "bg-accent-mint/15 text-accent-mint border border-accent-mint/20";
      default: return "bg-white/5 text-text-faint";
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto pt-28 pb-20 px-6 md:px-16 flex flex-col items-center">
      {/* Page Header */}
      <div className="text-center max-w-2xl mb-10">
        <div className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.12em] text-accent-pinkLight bg-accent-pink/10 border border-accent-pink/35 px-4 py-1.5 rounded-full mb-4 uppercase">
          <ArrowRightLeft size={12} className="text-accent-pink" />
          Interactive Telemetry Demo
        </div>
        <h1 className="font-display font-bold text-3xl md:text-5xl tracking-tight mb-4">
          Dual Student Simulation
        </h1>
        <p className="text-text-dim text-sm md:text-base leading-relaxed">
          Newton's First Law. Same moment of confusion. Two different profiles. 
          Watch how the struggle pipeline adapts content for an Analytical learner vs a Sign-preferred Deaf student.
        </p>
      </div>

      {/* Controller HUD Panel */}
      <div className="w-full glass-panel rounded-2xl p-5 border border-white/10 mb-8 flex flex-col sm:flex-row items-center justify-between gap-5 relative z-20">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              if (demoState === 4) setDemoState(0);
              setIsPlaying(!isPlaying);
            }}
            className={`px-5 py-2.5 rounded-full font-mono text-[12.5px] font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              isPlaying 
                ? "bg-accent-pink/15 border border-accent-pink/30 text-accent-pink" 
                : "bg-gradient-to-r from-accent-pink to-[#C2127F] text-white shadow-glowPink"
            }`}
          >
            <Play size={12} />
            {isPlaying ? "Pause Autoplay" : "Start Autoplay"}
          </button>
          
          <button
            disabled={demoState === 4}
            onClick={handleNextStep}
            className="px-5 py-2.5 rounded-full border border-white/10 text-text-dim hover:text-text-primary hover:border-text-dim bg-transparent hover:bg-white/5 font-mono text-[12.5px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
          >
            Next Step
            <ChevronRight size={12} />
          </button>

          <button
            onClick={handleReset}
            className="p-2.5 rounded-full border border-white/10 text-text-dim hover:text-text-primary hover:bg-white/5 cursor-pointer transition-colors"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Current status display */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-text-faint">Status:</span>
          <span className={`font-mono text-xs px-3 py-1 rounded-full uppercase tracking-wider ${getStatusBadgeClass(demoState)}`}>
            {getStatusText(demoState)}
          </span>
        </div>
      </div>

      {/* Demo Split View Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        
        {/* STUDENT A PANEL */}
        <div className="border border-white/5 bg-dark-surface rounded-[24px] overflow-hidden flex flex-col justify-between text-left h-[500px]">
          
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-accent-violet to-accent-violetLight flex items-center justify-center font-display font-bold text-sm text-white">A</div>
              <div>
                <div className="font-semibold text-[14.5px] text-text-primary">Student A</div>
                <div className="text-[11.5px] text-text-faint font-mono">Profile: Analytical</div>
              </div>
            </div>
            <div className="font-mono text-[10.5px] px-3 py-1 bg-accent-violet/15 text-accent-violetLight border border-accent-violet/20 rounded-full uppercase">Inertia Check</div>
          </div>

          {/* Lesson Body */}
          <div className="p-6 flex-1 overflow-y-auto flex flex-col justify-between">
            <div className="text-text-dim text-[14.5px] leading-[1.7] relative">
              An object at rest stays at rest, and an object in motion stays in motion, unless acted on by{" "}
              <span className={`rounded px-1.5 py-0.5 border transition-all duration-300 ${demoState >= 2 ? "bg-accent-pink/25 border-accent-pink/40 text-text-primary" : "border-transparent"}`}>
                an unbalanced force
              </span>
              . This is Newton's First Law — the law of inertia.
            </div>

            {/* Intervention Box A */}
            <AnimatePresence>
              {demoState >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="mt-6 border border-accent-violet/30 bg-accent-violet/5 rounded-xl p-4"
                >
                  <div className="font-mono text-[10.5px] text-accent-violetLight font-bold uppercase tracking-wider mb-3">⚡ INTERVENTION — FORCE DIAGRAM</div>
                  <ForceDiagram lessonId="newtons-first-law" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer progress bar */}
          <div className="p-5 border-t border-white/10 flex items-center justify-between">
            <div className="flex-1 bg-white/5 h-1.5 rounded-full mr-4 overflow-hidden">
              <div 
                className="h-full bg-accent-violet transition-all duration-1000 ease-out" 
                style={{ 
                  width: demoState === 0 ? "0%" : demoState === 1 ? "15%" : demoState === 2 ? "15%" : demoState === 3 ? "15%" : "100%" 
                }} 
              />
            </div>
            <div className={`font-mono text-[10.5px] px-2.5 py-0.5 rounded-full ${
              demoState <= 1 ? "bg-white/5 text-text-faint" : demoState === 2 ? "bg-accent-amber/15 text-accent-amber" : "bg-accent-mint/15 text-accent-mint"
            }`}>
              {demoState <= 1 ? "Reading..." : demoState === 2 ? "Struggle Detected" : "Resolved ✓"}
            </div>
          </div>

        </div>

        {/* STUDENT B PANEL */}
        <div className="border border-white/5 bg-dark-surface rounded-[24px] overflow-hidden flex flex-col justify-between text-left h-[500px]">
          
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-accent-mint to-[#6df3cf] flex items-center justify-center font-display font-bold text-sm text-dark-bg">B</div>
              <div>
                <div className="font-semibold text-[14.5px] text-text-primary">Student B</div>
                <div className="text-[11.5px] text-text-faint font-mono">Profile: Sign · Deaf</div>
              </div>
            </div>
            <div className="font-mono text-[10.5px] px-3 py-1 bg-accent-mint/15 text-accent-mint border border-accent-mint/20 rounded-full uppercase">Inertia Check</div>
          </div>

          {/* Lesson Body */}
          <div className="p-6 flex-1 overflow-y-auto flex flex-col justify-between">
            <div className="text-text-dim text-[14.5px] leading-[1.7] relative">
              An object at rest stays at rest, and an object in motion stays in motion, unless acted on by{" "}
              <span className={`rounded px-1.5 py-0.5 border transition-all duration-300 ${demoState >= 2 ? "bg-accent-pink/25 border-accent-pink/40 text-text-primary" : "border-transparent"}`}>
                an unbalanced force
              </span>
              . This is Newton's First Law — the law of inertia.
            </div>

            {/* Intervention Box B */}
            <AnimatePresence>
              {demoState >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="mt-6 border border-accent-mint/30 bg-accent-mint/5 rounded-xl p-4"
                >
                  <div className="font-mono text-[10.5px] text-accent-mint font-bold uppercase tracking-wider mb-2">🤟 INTERVENTION — SIGNED EXPLANATION</div>
                  <SigningAvatar glossSequence={gravityGloss} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer progress bar */}
          <div className="p-5 border-t border-white/10 flex items-center justify-between">
            <div className="flex-1 bg-white/5 h-1.5 rounded-full mr-4 overflow-hidden">
              <div 
                className="h-full bg-accent-mint transition-all duration-1000 ease-out" 
                style={{ 
                  width: demoState === 0 ? "0%" : demoState === 1 ? "15%" : demoState === 2 ? "15%" : demoState === 3 ? "15%" : "100%" 
                }} 
              />
            </div>
            <div className={`font-mono text-[10.5px] px-2.5 py-0.5 rounded-full ${
              demoState <= 1 ? "bg-white/5 text-text-faint" : demoState === 2 ? "bg-accent-amber/15 text-accent-amber" : "bg-accent-mint/15 text-accent-mint"
            }`}>
              {demoState <= 1 ? "Reading..." : demoState === 2 ? "Struggle Detected" : "Resolved ✓"}
            </div>
          </div>

        </div>

      </div>

      {/* Explanatory telemetry graph in demo */}
      <div className="w-full glass-panel rounded-2xl p-6 border border-white/10 text-left mt-8">
        <h4 className="font-display font-semibold text-sm text-text-primary mb-4 flex items-center gap-1.5">
          <Activity size={14} className="text-accent-pink" /> 
          Telemetry Step-by-Step Explanation
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className={`p-3 rounded-xl border transition-all ${demoState === 1 ? "border-accent-violet/40 bg-accent-violet/5 text-text-primary" : "border-white/5 text-text-faint"}`}>
            <strong>Step 1: Reading</strong><br />
            Students begin reading raw Newton concepts. Telemetry clocks active gaze scroll speed.
          </div>
          <div className={`p-3 rounded-xl border transition-all ${demoState === 2 ? "border-accent-amber/40 bg-accent-amber/5 text-text-primary" : "border-white/5 text-text-faint"}`}>
            <strong>Step 2: Confusion</strong><br />
            Student A hesitates on "unbalanced force" (15s idle). Student B repeats reading the phrase (re-read log).
          </div>
          <div className={`p-3 rounded-xl border transition-all ${demoState === 3 ? "border-accent-pink/40 bg-accent-pink/5 text-text-primary" : "border-white/5 text-text-faint"}`}>
            <strong>Step 3: Intervention</strong><br />
            NeuroPath detects struggle, queries state, triggers LLM synthesis, and renders custom adapters inline.
          </div>
          <div className={`p-3 rounded-xl border transition-all ${demoState === 4 ? "border-accent-mint/40 bg-accent-mint/5 text-text-primary" : "border-white/5 text-text-faint"}`}>
            <strong>Step 4: Completion</strong><br />
            Interventions resolve blockages. Students resume reading and successfully clear final checkpoints.
          </div>
        </div>
      </div>
    </div>
  );
}
