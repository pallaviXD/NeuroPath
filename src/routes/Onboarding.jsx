import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Brain, Activity, Clock, Target, CheckCircle, XCircle } from "lucide-react";
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

export default function Onboarding() {
  const navigate = useNavigate();
  const { computeCognitiveBaseline } = useStore();

  const [step, setStep] = useState("intro"); // intro, balloon, story, result
  const [results, setResults] = useState([]);
  const [accessibilityFlag, setAccessibilityFlag] = useState("none");
  const [profile, setProfile] = useState(null);

  const handleTaskComplete = (result) => {
    const newResults = [...results, result];
    setResults(newResults);

    if (step === "balloon") {
      setStep("story");
    } else if (step === "story") {
      const finalProfile = computeCognitiveBaseline({
        quizResults: newResults,
        accessibilityFlag
      });
      setProfile(finalProfile);
      setStep("result");
    }
  };

  const renderIntro = () => (
    <SlideWrapper>
      <div className="max-w-xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.12em] text-accent-violetLight bg-accent-violet/10 border border-accent-violet/30 px-4 py-1.5 rounded-full mb-6 uppercase">
          <Brain size={12} />
          Cognitive Calibration
        </div>
        <h1 className="font-display font-bold text-4xl tracking-tight mb-4 text-text-primary">
          Let's calibrate your brain.
        </h1>
        <p className="text-text-dim text-base leading-relaxed mb-8">
          To personalize your learning, we need to establish your cognitive baseline. 
          You will complete two tasks: a Balloon Pop Game and a Story Quiz.
          <br /><br />
          <strong className="text-accent-pink">Note:</strong> We measure speed, accuracy, and effort.
        </p>

        <div className="mb-8 p-4 rounded-xl border border-white/10 bg-white/5 text-left">
          <p className="font-mono text-[11px] uppercase tracking-wider text-text-faint mb-3">
            Accessibility Override
          </p>
          <label className="flex items-center gap-3 cursor-pointer group text-sm select-none">
            <input 
              type="checkbox"
              checked={accessibilityFlag === "deaf"}
              onChange={(e) => setAccessibilityFlag(e.target.checked ? "deaf" : "none")}
              className="w-4 h-4 rounded border-white/10 bg-white/5 text-accent-violet focus:ring-0 cursor-pointer"
            />
            <span className="font-semibold text-text-dim group-hover:text-text-primary transition-colors">
              I am Deaf / Hard-of-Hearing (Enable Sign Language Priority)
            </span>
          </label>
        </div>

        <button
          onClick={() => setStep("balloon")}
          className="w-full py-4 rounded-2xl font-bold text-[16px] flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
          style={{ background: "linear-gradient(135deg, #7B2FF7, #15CFA0)", color: "#fff", boxShadow: "0 0 30px rgba(123,47,247,0.3)" }}
        >
          Start Calibration
          <ArrowRight size={18} />
        </button>
      </div>
    </SlideWrapper>
  );

  const renderResult = () => (
    <SlideWrapper>
      <div className="max-w-xl mx-auto text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-accent-mint/10 border border-accent-mint/30 shadow-[0_0_40px_rgba(21,207,160,0.15)]"
        >
          <Target size={36} className="text-accent-mint" />
        </motion.div>

        <div className="font-mono text-[11px] uppercase tracking-widest mb-2 text-accent-mint">
          Calibration Complete
        </div>
        <h2 className="font-display font-bold text-3xl md:text-4xl text-text-primary mb-8">
          Baseline Established
        </h2>

        {/* Profile Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8 text-left">
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="flex items-center gap-2 mb-1 opacity-60 text-[11px] font-mono uppercase">
              <Activity size={14} /> Cognitive Style
            </div>
            <div className="text-lg font-semibold text-accent-violetLight">
              {profile?.cognitiveStyle || "Balanced"}
            </div>
          </div>
          
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="flex items-center gap-2 mb-1 opacity-60 text-[11px] font-mono uppercase">
              <Clock size={14} /> Processing Speed
            </div>
            <div className="text-lg font-semibold text-accent-amber">
              {profile?.processingSpeed || "Average"}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-white/5 col-span-2 flex justify-between items-center">
            <div className="flex items-center gap-2 opacity-60 text-[11px] font-mono uppercase">
              <Brain size={14} /> Effort Detection
            </div>
            <div className={`text-sm font-bold flex items-center gap-1 ${profile?.effort === "Low (Random Guessing)" ? "text-accent-pink" : "text-accent-mint"}`}>
              {profile?.effort === "Low (Random Guessing)" ? <XCircle size={16} /> : <CheckCircle size={16} />}
              {profile?.effort}
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/demo")}
          className="w-full py-5 rounded-2xl font-bold text-[16px] flex items-center justify-center gap-3 cursor-pointer"
          style={{ background: "linear-gradient(135deg, #7B2FF7, #15CFA0)", boxShadow: "0 0 32px rgba(21,207,160,0.3)", color: "white" }}
        >
          Continue to Demo
          <ArrowRight size={18} />
        </motion.button>
      </div>
    </SlideWrapper>
  );

  return (
    <div className="w-full max-w-5xl mx-auto pt-28 pb-20 px-6 md:px-12 flex flex-col items-center">
      <div className="w-full">
        <AnimatePresence mode="wait">
          {step === "intro" && renderIntro()}
          {step === "balloon" && <SlideWrapper key="balloon"><BalloonGame onComplete={handleTaskComplete} /></SlideWrapper>}
          {step === "story" && <SlideWrapper key="story"><StoryQuiz onComplete={handleTaskComplete} /></SlideWrapper>}
          {step === "result" && renderResult()}
        </AnimatePresence>
      </div>
    </div>
  );
}
