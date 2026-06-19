import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ArrowRight, BookOpen, Layers, CheckCircle2, ChevronRight, Award, Activity } from "lucide-react";
import { useStore } from "../store/useStore";
import { lessonsData } from "../data/lessonsData";
import { dbService } from "../lib/firebase";
import ForceDiagram from "../components/ForceDiagram";
import MoleculeBuilder from "../components/MoleculeBuilder";
import SigningAvatar from "../components/SigningAvatar";

export default function Lesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const lesson = lessonsData[lessonId];

  const {
    studentProfile,
    activeModality,
    setActiveModality,
    triggerStruggleIntervention
  } = useStore();

  const [lessonComplete, setLessonComplete] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  
  // Quick inline check state
  const [microAnswer, setMicroAnswer] = useState(null);
  const [microAttempts, setMicroAttempts] = useState(0);
  const [microResolved, setMicroResolved] = useState(false);

  // Intervention pipeline states
  const [activeIntervention, setActiveIntervention] = useState(null);
  const [pipelineState, setPipelineState] = useState({ active: false, step: 0 });

  // Refs for tracking telemetry struggle
  const lastScrollTime = useRef(Date.now());
  const paragraphRef = useRef(null);
  const containerRef = useRef(null);
  
  // Timer for assessment idleness
  const idleTimerRef = useRef(null);
  const isQuestionActive = useRef(false);

  // Initialize modality
  useEffect(() => {
    if (!lesson) return;
    if (studentProfile.primary) {
      setActiveModality(studentProfile.primary);
    } else {
      // Default fallback if student navigated here directly
      setActiveModality("visual");
    }
    
    // Reset state
    setLessonComplete(false);
    setShowAssessment(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setScore(null);
    setMicroAnswer(null);
    setMicroAttempts(0);
    setMicroResolved(false);
    setActiveIntervention(null);
    setPipelineState({ active: false, step: 0 });
    isQuestionActive.current = false;
  }, [lessonId, studentProfile.primary]);

  // 1. STRUGGLE DETECTION: Re-reading scroll check
  useEffect(() => {
    if (isCalculatedOrAdapted() || !containerRef.current) return;

    const handleScroll = () => {
      const now = Date.now();
      const timeDelta = now - lastScrollTime.current;
      
      // If user scrolls up quickly and stays, count as re-reading
      if (timeDelta > 500 && timeDelta < 2500) {
        const scrollTop = containerRef.current.scrollTop;
        if (scrollTop < 30) {
          triggerStruggle("re-reading", "scrolled back to top paragraph within 2s");
        }
      }
      lastScrollTime.current = now;
    };

    const container = containerRef.current;
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [activeModality, activeIntervention]);

  // 2. STRUGGLE DETECTION: Idle timer on assessments only
  useEffect(() => {
    if (isCalculatedOrAdapted()) return;

    const resetIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (!isQuestionActive.current) return;

      idleTimerRef.current = setTimeout(() => {
        triggerStruggle("idle-timer", "no input on assessment for >15s");
      }, 15000);
    };

    const handleUserInteraction = () => {
      resetIdleTimer();
    };

    window.addEventListener("click", handleUserInteraction);
    window.addEventListener("mousemove", handleUserInteraction);
    window.addEventListener("keypress", handleUserInteraction);

    // Initial trigger
    resetIdleTimer();

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("mousemove", handleUserInteraction);
      window.removeEventListener("keypress", handleUserInteraction);
    };
  }, [showAssessment, currentQuestionIndex, activeIntervention]);

  const isCalculatedOrAdapted = () => {
    return !!activeIntervention;
  };

  // Trigger Intervention Pipeline
  const triggerStruggle = (type, details) => {
    if (activeIntervention) return; // Only trigger one intervention per session
    
    // Start Pipeline animation step-by-step
    setPipelineState({ active: true, step: 0 });
    
    const steps = [
      () => setPipelineState({ active: true, step: 1 }), // Checked Profile
      () => setPipelineState({ active: true, step: 2 }), // Generated Explanation
      () => setPipelineState({ active: true, step: 3 }), // Translate (if sign)
      () => {
        // Resolve pipeline & deliver intervention
        setPipelineState({ active: false, step: 4 });
        
        // Pick a secondary modality different from active
        let nextModality = "visual";
        if (activeModality === "visual") nextModality = "narrative";
        else if (activeModality === "narrative") nextModality = "kinesthetic";
        else if (activeModality === "kinesthetic") nextModality = "sign";
        else if (activeModality === "sign") nextModality = "visual";

        // Save intervention in store
        triggerStruggleIntervention("current_user", lesson.title, type, nextModality);

        // Update modality and display intervention explanation
        setActiveModality(nextModality);
        setActiveIntervention({
          type,
          details,
          message: getInterventionMessage(nextModality)
        });
      }
    ];

    // Play tick sequence
    setTimeout(steps[0], 400);
    setTimeout(steps[1], 800);
    setTimeout(steps[2], 1200);
    setTimeout(steps[3], 1800);
  };

  const getInterventionMessage = (modality) => {
    switch (modality) {
      case "visual":
        return "Visual representation unlocked: trace the diagram nodes to see relationships.";
      case "narrative":
        return "Narrative story unlocked: we translated this concept into an analogy to help your brain map it.";
      case "kinesthetic":
        return "Kinesthetic sandbox unlocked: interact with the adjusters to feel how variables respond.";
      case "sign":
        return "3D sign explanations generated: watch the avatar's movements and check the gloss tokens below.";
      default:
        return "Adapted explanation delivered.";
    }
  };

  // Handle micro-check submissions
  const handleMicroCheck = (index) => {
    if (microResolved) return;
    setMicroAnswer(index);

    if (index === lesson.microCheck.answerIndex) {
      setMicroResolved(true);
      // If corrected after failing
      if (microAttempts > 0) {
        triggerStruggle("wrong-then-correct", "corrected check answer immediately");
      }
    } else {
      setMicroAttempts(prev => prev + 1);
    }
  };

  // Start final assessment
  const handleStartAssessment = () => {
    setShowAssessment(true);
    isQuestionActive.current = true;
  };

  // Submit assessment answer
  const handleAnswerSubmit = (optionIndex) => {
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: optionIndex }));
    
    if (currentQuestionIndex < lesson.assessment.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Finished
      isQuestionActive.current = false;
      const finalAnswers = { ...answers, [currentQuestionIndex]: optionIndex };
      let correctCount = 0;
      lesson.assessment.forEach((q, idx) => {
        if (finalAnswers[idx] === q.answerIndex) correctCount++;
      });
      const finalScore = Math.round((correctCount / lesson.assessment.length) * 100);
      setScore(finalScore);
      setLessonComplete(true);

      // Save session logs to database fallback
      dbService.saveSession({
        lessonId,
        lessonTitle: lesson.title,
        score: finalScore,
        duration: 300, // mock duration
        date: new Date().toISOString().split('T')[0],
        adapted: !!activeIntervention
      });
    }
  };

  if (!lesson) {
    return (
      <div className="pt-32 text-center">
        <h2 className="text-xl">Lesson not found.</h2>
        <Link to="/" className="text-accent-pink hover:underline mt-4 inline-block">Back home</Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto pt-28 pb-20 px-6 md:px-16 flex flex-col items-center">
      
      {/* Back button */}
      <div className="w-full flex justify-start mb-6">
        <Link to="/" className="text-xs font-mono text-text-faint hover:text-accent-pink transition-colors flex items-center gap-1">
          ← Back to Curriculum
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
        
        {/* Left Side: Lesson Viewer */}
        <div ref={containerRef} className="lg:col-span-8 glass-panel rounded-[28px] border border-white/10 p-6 md:p-8 text-left min-h-[460px] flex flex-col justify-between max-h-[75vh] overflow-y-auto">
          
          {!showAssessment ? (
            // ============ LESSON CONTENT VIEW ============
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-accent-pinkLight bg-accent-pink/10 border border-accent-pink/20 px-3 py-1 rounded-full uppercase">
                  {lesson.subject}
                </span>
                <span className="font-mono text-[10px] text-text-faint uppercase">
                  Rendering: {activeModality} mode
                </span>
              </div>
              
              <h2 className="font-display font-bold text-2xl md:text-3xl text-text-primary mb-5">
                {lesson.title}
              </h2>

              {/* Dynamic Modality Renderer */}
              <div className="space-y-6">
                
                {/* 1. VISUAL */}
                {activeModality === "visual" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                    <p ref={paragraphRef} className="text-text-dim text-[14.5px] leading-relaxed">
                      {lesson.modalities.visual.content}
                    </p>
                    <ForceDiagram lessonId={lessonId} />
                  </motion.div>
                )}

                {/* 2. NARRATIVE */}
                {activeModality === "narrative" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                    <h4 className="font-display font-semibold text-text-primary text-md">
                      {lesson.modalities.narrative.storyTitle}
                    </h4>
                    <p ref={paragraphRef} className="text-text-dim text-[14.5px] leading-relaxed whitespace-pre-line bg-white/[0.01] border border-white/5 p-4 rounded-2xl italic">
                      {lesson.modalities.narrative.content}
                    </p>
                  </motion.div>
                )}

                {/* 3. KINESTHETIC */}
                {activeModality === "kinesthetic" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                    <p ref={paragraphRef} className="text-text-dim text-[14.5px] leading-relaxed">
                      {lesson.modalities.kinesthetic.instructions}
                    </p>
                    <MoleculeBuilder lessonId={lessonId} />
                  </motion.div>
                )}

                {/* 4. SIGN LANGUAGE */}
                {activeModality === "sign" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                    <p ref={paragraphRef} className="text-text-dim text-[14.5px] leading-relaxed">
                      {lesson.modalities.sign.text}
                    </p>
                    <SigningAvatar glossSequence={lesson.modalities.sign.gloss} />
                  </motion.div>
                )}

              </div>

              {/* Inline concept checkpoint */}
              <div className="mt-8 pt-6 border-t border-dashed border-white/10 text-left">
                <h4 className="font-display font-semibold text-sm text-text-primary mb-3">Concept Checkpoint</h4>
                <p className="text-xs text-text-dim mb-4">{lesson.microCheck.question}</p>
                <div className="space-y-2">
                  {lesson.microCheck.options.map((opt, index) => (
                    <button
                      key={index}
                      onClick={() => handleMicroCheck(index)}
                      className={`w-full p-3 rounded-xl border text-left text-[12.5px] transition-colors cursor-pointer ${
                        microAnswer === index 
                          ? index === lesson.microCheck.answerIndex
                            ? "bg-accent-mint/15 border-accent-mint text-accent-mint"
                            : "bg-accent-pink/15 border-accent-pink text-accent-pink"
                          : "bg-white/[0.02] border-white/5 text-text-dim hover:bg-white/5"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                
                {microResolved && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 bg-accent-mint/5 border border-accent-mint/20 rounded-xl text-xs text-accent-mint">
                    <strong>Correct!</strong> {lesson.microCheck.explanation}
                  </motion.div>
                )}
              </div>

            </div>
          ) : (
            // ============ FINAL ASSESSMENT VIEW ============
            <div>
              <span className="font-mono text-xs text-accent-pinkLight bg-accent-pink/10 border border-accent-pink/20 px-3 py-1 rounded-full uppercase mb-4 inline-block">
                Final Check
              </span>
              
              {!lessonComplete ? (
                <div>
                  <h3 className="font-display font-semibold text-[17px] text-text-primary mb-4 text-left">
                    Question {currentQuestionIndex + 1} of {lesson.assessment.length}
                  </h3>
                  <p className="text-[14.5px] text-text-dim mb-5 text-left">
                    {lesson.assessment[currentQuestionIndex].question}
                  </p>
                  
                  <div className="space-y-3">
                    {lesson.assessment[currentQuestionIndex].options.map((opt, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSubmit(index)}
                        className="w-full p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/20 text-left text-sm text-text-dim hover:text-text-primary transition-all cursor-pointer"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 flex flex-col items-center">
                  <Award size={48} className="text-accent-mint mb-4" />
                  <h3 className="font-display font-bold text-2xl text-text-primary mb-2">Lesson Complete!</h3>
                  <p className="text-text-dim text-sm max-w-sm mb-6">
                    You scored <strong className="text-accent-mint">{score}%</strong>. Your adaptive telemetry log has been updated in the teacher panel.
                  </p>
                  <div className="flex gap-4">
                    <button onClick={() => navigate("/")} className="px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:border-white/20 text-text-dim hover:text-text-primary transition-all text-xs font-bold uppercase tracking-wider">
                      Home
                    </button>
                    <button 
                      onClick={() => navigate("/dashboard")} 
                      className="px-6 py-3 rounded-full bg-gradient-to-r from-accent-pink to-[#C2127F] text-white transition-all text-xs font-bold uppercase tracking-wider shadow-glowPink"
                    >
                      View in Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer controls */}
          {!showAssessment && (
            <div className="mt-8 pt-5 border-t border-white/5 flex items-center justify-between">
              <div className="text-xs text-text-faint font-mono">
                {!microResolved ? "Solve checkpoint to unlock quiz" : "Checkpoint clear ✓"}
              </div>
              <button
                disabled={!microResolved}
                onClick={handleStartAssessment}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-accent-pink to-[#C2127F] text-white font-semibold text-xs uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-glowPink transition-all flex items-center gap-1.5"
              >
                Take Assessment
                <ChevronRight size={14} />
              </button>
            </div>
          )}

        </div>

        {/* Right Side: Telemetry Status & Intervention Pipe */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Active Adaptive pipeline simulator */}
          <div className="glass-panel rounded-2xl p-6 text-left border border-white/10">
            <h3 className="font-display font-bold text-[15px] mb-3 text-text-primary flex items-center gap-2">
              <Activity className="text-accent-pink" size={16} />
              Struggle Resolution Pipeline
            </h3>
            
            <div className="space-y-4 mt-5">
              <div className={`flex items-center gap-3 text-xs ${pipelineState.active && pipelineState.step >= 0 ? "text-accent-pink font-semibold" : "text-text-faint"}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${pipelineState.active && pipelineState.step >= 0 ? "bg-accent-pink shadow-[0_0_8px_var(--pink)]" : "bg-white/10"}`} />
                Confusion signal scanned
              </div>
              <div className={`flex items-center gap-3 text-xs ${pipelineState.active && pipelineState.step >= 1 ? "text-accent-pink font-semibold" : "text-text-faint"}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${pipelineState.active && pipelineState.step >= 1 ? "bg-accent-pink shadow-[0_0_8px_var(--pink)]" : "bg-white/10"}`} />
                Cognitive profile queried
              </div>
              <div className={`flex items-center gap-3 text-xs ${pipelineState.active && pipelineState.step >= 2 ? "text-accent-pink font-semibold" : "text-text-faint"}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${pipelineState.active && pipelineState.step >= 2 ? "bg-accent-pink shadow-[0_0_8px_var(--pink)]" : "bg-white/10"}`} />
                Modality shift calculated
              </div>
              <div className={`flex items-center gap-3 text-xs ${pipelineState.active && pipelineState.step >= 3 ? "text-accent-pink font-semibold" : "text-text-faint"}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${pipelineState.active && pipelineState.step >= 3 ? "bg-accent-pink shadow-[0_0_8px_var(--pink)]" : "bg-white/10"}`} />
                Adaptation content translation
              </div>
              <div className={`flex items-center gap-3 text-xs ${pipelineState.step === 4 ? "text-accent-mint font-semibold animate-pulse" : "text-text-faint"}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${pipelineState.step === 4 ? "bg-accent-mint shadow-[0_0_8px_var(--mint)]" : "bg-white/10"}`} />
                Delivered inline (complete)
              </div>
            </div>
          </div>

          {/* Intervention banner */}
          <AnimatePresence>
            {activeIntervention && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel border-accent-amber/35 bg-accent-amber/5 rounded-2xl p-6 text-left border relative overflow-hidden"
              >
                <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-accent-amber/10 blur-xl" />
                <h4 className="font-mono text-[10.5px] text-accent-amber font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                  <AlertCircle size={12} />
                  Micro-Intervention Fired
                </h4>
                <p className="text-xs text-text-faint font-mono mb-3">
                  Reason: {activeIntervention.type === "re-reading" ? "Gaze re-reading patterns" : activeIntervention.type === "idle-timer" ? "Assessment response delay" : "Correction sequence"}
                </p>
                <p className="text-[13px] text-text-dim leading-relaxed font-body">
                  {activeIntervention.message}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
