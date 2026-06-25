import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Brain, Activity, Clock, Target, CheckCircle, XCircle, ShieldAlert, Sparkles, Loader } from "lucide-react";
import { useStore } from "../store/useStore";
import BalloonGame from "../components/BalloonGame";
import StoryQuiz from "../components/StoryQuiz";

function SlideWrapper({ children, direction = 1 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 * direction }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 * direction }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

const STEPS = [
  { id: "welcome", label: "Welcome" },
  { id: "explanation", label: "How We Learn" },
  { id: "balloon", label: "Kinesthetic" },
  { id: "story", label: "Comprehension" },
  { id: "generating", label: "Generation" },
  { id: "result", label: "Fingerprint" }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { computeCognitiveBaseline } = useStore();

  const [step, setStep] = useState("welcome"); // welcome, explanation, balloon, story, generating, result
  const [results, setResults] = useState([]);
  const [accessibilityFlag, setAccessibilityFlag] = useState("none");
  const [profile, setProfile] = useState(null);
  const [genStatusIndex, setGenStatusIndex] = useState(0);

  const genStatuses = [
    "Reading kinetic coordination profiles...",
    "Correlating gaze-duration arrays...",
    "Simplifying syntax vectors...",
    "Engraving cognitive fingerprint locks...",
    "Calibration matrix complete ✓"
  ];

  const getStepIndex = (s) => {
    switch (s) {
      case "welcome": return 0;
      case "explanation": return 1;
      case "balloon": return 2;
      case "story": return 3;
      case "generating": return 4;
      case "result": return 5;
      default: return 0;
    }
  };

  const handleTaskComplete = (result) => {
    const newResults = [...results, result];
    setResults(newResults);

    if (step === "balloon") {
      setStep("story");
    } else if (step === "story") {
      setStep("generating");
    }
  };

  // Simulating the profile generation steps with status text changes
  useEffect(() => {
    if (step !== "generating") return;

    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      if (idx < genStatuses.length) {
        setGenStatusIndex(idx);
      } else {
        clearInterval(interval);
        const finalProfile = computeCognitiveBaseline({
          quizResults: results,
          accessibilityFlag
        });
        setProfile(finalProfile);
        setStep("result");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [step, results, accessibilityFlag]);

  const renderWelcome = () => (
    <SlideWrapper>
      <div className="max-w-xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.12em] text-accent-violetLight bg-accent-violet/10 border border-accent-violet/30 px-4 py-1.5 rounded-full uppercase">
          <Brain size={12} />
          Cognitive Calibration
        </div>
        <h1 className="font-display font-bold text-4xl tracking-tight text-text-primary">
          Let's calibrate your brain.
        </h1>
        <p className="text-text-dim text-sm leading-relaxed max-w-lg mx-auto font-sans">
          To build your custom learning interface, NeuroPath runs a rapid sensor sweep of your comprehension rates, cognitive timing, and effort styles.
        </p>

        <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-left space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
            Learning Modality Preference
          </p>
          <label className="flex items-center gap-3 cursor-pointer group text-xs select-none">
            <input 
              type="checkbox"
              checked={accessibilityFlag === "deaf"}
              onChange={(e) => setAccessibilityFlag(e.target.checked ? "deaf" : "none")}
              className="w-4 h-4 rounded border-white/10 bg-white/5 text-accent-violet focus:ring-0 cursor-pointer"
            />
            <span className="font-semibold text-text-dim group-hover:text-text-primary transition-colors">
              I am Deaf / Hard-of-Hearing (Set Sign Language Priority)
            </span>
          </label>
        </div>

        <button
          onClick={() => setStep("explanation")}
          className="w-full py-4 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
          style={{ background: "linear-gradient(135deg, #7B2FF7, #15CFA0)", color: "#fff", boxShadow: "0 0 30px rgba(123,47,247,0.3)" }}
        >
          Next: Learn How We Learn
          <ArrowRight size={18} />
        </button>
      </div>
    </SlideWrapper>
  );

  const renderExplanation = () => (
    <SlideWrapper>
      <div className="max-w-xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.12em] text-accent-mint bg-accent-mint/10 border border-accent-mint/30 px-4 py-1.5 rounded-full uppercase">
          <Sparkles size={12} />
          Adaptive Engine Basics
        </div>
        <h2 className="font-display font-bold text-3xl tracking-tight text-text-primary">
          We Learn How You Learn
        </h2>
        <div className="text-text-dim text-sm leading-relaxed space-y-4 max-w-lg mx-auto text-left font-sans">
          <p>
            NeuroPath doesn't just adapt to your wrong answers. Our system observes **micro-interventions**:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-accent-mint">Kinesthetic Gaps:</strong> Monitored via task timing and input calibration.</li>
            <li><strong className="text-accent-purple">Read & Digest Rates:</strong> Measured through gaze duration ratios and paragraph revisions.</li>
            <li><strong className="text-accent-pink">Attention Thresholds:</strong> Fired programmatically using idle telemetry tracking.</li>
          </ul>
        </div>

        <button
          onClick={() => setStep("balloon")}
          className="w-full py-4 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
          style={{ background: "linear-gradient(135deg, #7B2FF7, #15CFA0)", color: "#fff", boxShadow: "0 0 30px rgba(123,47,247,0.3)" }}
        >
          Start Challenges
          <ArrowRight size={18} />
        </button>
      </div>
    </SlideWrapper>
  );

  const renderGenerating = () => (
    <SlideWrapper>
      <div className="max-w-xl mx-auto text-center space-y-6 py-8">
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-white/5" />
          <div className="absolute inset-0 rounded-full border-4 border-accent-purple border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="text-accent-purple animate-pulse" size={28} />
          </div>
        </div>
        <h3 className="font-display font-bold text-xl text-text-primary">Generating Cognitive Profile</h3>
        <p className="text-xs text-text-dim font-mono animate-pulse">{genStatuses[genStatusIndex]}</p>
      </div>
    </SlideWrapper>
  );

  const renderResult = () => (
    <SlideWrapper>
      <div className="max-w-xl mx-auto text-center space-y-6">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2 bg-accent-mint/10 border border-accent-mint/30 shadow-[0_0_40px_rgba(21,207,160,0.15)]"
        >
          <Target size={36} className="text-accent-mint" />
        </motion.div>

        <div className="font-mono text-[10px] uppercase tracking-widest text-accent-mint font-bold">
          Calibration Matrix Locked
        </div>
        <h2 className="font-display font-bold text-3xl text-text-primary">
          Your Cognitive Fingerprint
        </h2>

        {/* Profile Stats */}
        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="p-4 rounded-xl border border-white/5 bg-black/30">
            <div className="flex items-center gap-2 mb-1 opacity-60 text-[10px] font-mono uppercase text-text-faint">
              <Activity size={12} className="text-accent-purple" /> Cognitive Style
            </div>
            <div className="text-base font-semibold text-accent-violetLight">
              {profile?.cognitiveStyle || "Balanced"}
            </div>
          </div>
          
          <div className="p-4 rounded-xl border border-white/5 bg-black/30">
            <div className="flex items-center gap-2 mb-1 opacity-60 text-[10px] font-mono uppercase text-text-faint">
              <Clock size={12} className="text-accent-amber" /> Processing Rate
            </div>
            <div className="text-base font-semibold text-accent-amber">
              {profile?.processingSpeed || "Average"}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-white/5 bg-black/30 col-span-2 flex justify-between items-center">
            <div className="flex items-center gap-2 opacity-60 text-[10px] font-mono uppercase text-text-faint">
              <Brain size={12} className="text-accent-mint" /> Calibration Integrity
            </div>
            <div className={`text-xs font-bold flex items-center gap-1 ${profile?.effort === "Low (Random Guessing)" ? "text-accent-pink" : "text-accent-mint"}`}>
              {profile?.effort === "Low (Random Guessing)" ? <XCircle size={14} /> : <CheckCircle size={14} />}
              {profile?.effort}
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/lessons")}
          className="w-full py-4.5 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-3 cursor-pointer"
          style={{ background: "linear-gradient(135deg, #7B2FF7, #15CFA0)", boxShadow: "0 0 32px rgba(21,207,160,0.3)", color: "white" }}
        >
          Begin Learning Curriculum
          <ArrowRight size={18} />
        </motion.button>
      </div>
    </SlideWrapper>
  );

  return (
    <div className="w-full max-w-5xl mx-auto pt-28 pb-20 px-6 md:px-12 flex flex-col items-center">
      
      {/* 6-Step Progress Tracker */}
      <div className="w-full max-w-2xl mx-auto mb-10 flex items-center justify-between relative px-2">
        {/* Progress lines */}
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white/5 -translate-y-1/2 z-0" />
        <div 
          className="absolute left-0 top-1/2 h-0.5 bg-gradient-to-r from-accent-purple to-accent-mint -translate-y-1/2 z-0 transition-all duration-500" 
          style={{ width: `${(getStepIndex(step) / 5) * 100}%` }}
        />
        {STEPS.map((s, idx) => {
          const isActive = idx === getStepIndex(step);
          const isCompleted = idx < getStepIndex(step);
          return (
            <div key={s.id} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[9px] font-bold border transition-all duration-300 ${
                  isActive 
                    ? "bg-accent-purple border-accent-purple text-white scale-110 shadow-[0_0_12px_rgba(123,47,247,0.4)]"
                    : isCompleted
                      ? "bg-accent-mint border-accent-mint text-black"
                      : "bg-black border-white/10 text-text-faint"
                }`}
              >
                {isCompleted ? "✓" : idx + 1}
              </div>
              <span className={`hidden md:block font-mono text-[9px] uppercase tracking-wider mt-2 transition-colors ${
                isActive ? "text-accent-purple font-bold" : "text-text-faint"
              }`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="w-full">
        <AnimatePresence mode="wait">
          {step === "welcome" && renderWelcome()}
          {step === "explanation" && renderExplanation()}
          {step === "balloon" && <SlideWrapper key="balloon"><BalloonGame onComplete={handleTaskComplete} /></SlideWrapper>}
          {step === "story" && <SlideWrapper key="story"><StoryQuiz onComplete={handleTaskComplete} /></SlideWrapper>}
          {step === "generating" && renderGenerating()}
          {step === "result" && renderResult()}
        </AnimatePresence>
      </div>
    </div>
  );
}
