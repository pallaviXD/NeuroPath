import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Brain, Zap, Eye, Hand, BookOpen, CheckCircle, XCircle, Sparkles, Volume2 } from "lucide-react";
import { useStore } from "../store/useStore";
import { useAuthStore } from "../store/useAuthStore";
import BalloonGame from "../components/BalloonGame";
import StoryQuiz from "../components/StoryQuiz";
import { analyzeStudentCapacity } from "../lib/neuropath-agent";

/* ── Particle burst on step complete ── */
function Burst({ trigger }) {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i, angle: (i / 18) * 360,
    color: ["#FF1D7E","#7B2FF7","#15CFA0","#FFB347"][i % 4],
  }));
  return (
    <AnimatePresence>
      {trigger && particles.map(p => (
        <motion.div key={p.id} className="absolute w-2 h-2 rounded-full pointer-events-none z-50"
          style={{ backgroundColor: p.color, top: "50%", left: "50%" }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos(p.angle * Math.PI / 180) * (60 + Math.random() * 60),
            y: Math.sin(p.angle * Math.PI / 180) * (60 + Math.random() * 60),
            opacity: 0, scale: 0,
          }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      ))}
    </AnimatePresence>
  );
}

/* ── Step indicator ── */
const STEPS = [
  { id: "welcome", label: "Start", icon: "👋" },
  { id: "balloon", label: "Reflex", icon: "🎯" },
  { id: "story", label: "Story", icon: "📖" },
  { id: "generating", label: "Scan", icon: "🧬" },
  { id: "result", label: "Profile", icon: "🔐" },
];

function StepDots({ current }) {
  const idx = STEPS.findIndex(s => s.id === current);
  return (
    <div className="flex items-center gap-3 mb-10">
      {STEPS.map((s, i) => (
        <div key={s.id} className="flex items-center gap-3">
          <motion.div animate={{ scale: i === idx ? 1.2 : 1 }}
            className={`relative flex items-center justify-center w-9 h-9 rounded-full border-2 font-mono text-[11px] font-bold transition-all duration-400 ${
              i < idx ? "border-accent-mint bg-accent-mint text-dark-bg" :
              i === idx ? "border-accent-pink bg-accent-pink/15 text-accent-pink shadow-[0_0_16px_rgba(255,29,126,0.4)]" :
              "border-white/15 text-text-faint bg-transparent"
            }`}>
            {i < idx ? <CheckCircle size={14} /> : s.icon}
            {i === idx && (
              <motion.div className="absolute -inset-1 rounded-full border-2 border-accent-pink/30"
                animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 1.8, repeat: Infinity }} />
            )}
          </motion.div>
          {i < STEPS.length - 1 && (
            <div className="w-8 h-0.5 rounded-full overflow-hidden bg-white/8">
              <motion.div className="h-full bg-gradient-to-r from-accent-pink to-accent-mint rounded-full"
                animate={{ width: i < idx ? "100%" : "0%" }}
                transition={{ duration: 0.5, delay: 0.1 }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Main ── */
export default function Onboarding() {
  const navigate = useNavigate();
  const { computeCognitiveBaseline } = useStore();
  const [step, setStep] = useState("welcome");
  const [results, setResults] = useState([]);
  const [deaf, setDeaf] = useState(false);
  const [profile, setProfile] = useState(null);
  const [genLine, setGenLine] = useState(0);
  const [burst, setBurst] = useState(false);

  const GEN_LINES = [
    "Parsing kinetic coordination signals...",
    "Mapping cognitive pattern vectors...",
    "Correlating reading-speed ratios...",
    "Locking modality preference matrix...",
    "Fingerprint engraved ✓",
  ];

  const fireBurst = () => { setBurst(true); setTimeout(() => setBurst(false), 800); };

  const handleTaskComplete = (result) => {
    const next = [...results, result];
    setResults(next);
    fireBurst();
    if (step === "balloon") setStep("story");
    else if (step === "story") setStep("generating");
  };

  useEffect(() => {
    if (step !== "generating") return;
    let i = 0;
    const iv = setInterval(async () => {
      i++;
      if (i < GEN_LINES.length) { setGenLine(i); }
      else {
        clearInterval(iv);
        // Analyze capacity from balloon game results
        const balloonResult = results.find(r => r.modality === "kinesthetic");
        const storyResult   = results.find(r => r.modality === "narrative");
        let capacityAnalysis = { capacityLevel: "medium", difficultyLabel: "Standard", recommendation: "" };
        if (balloonResult) {
          capacityAnalysis = await analyzeStudentCapacity({
            accuracy:          balloonResult.accuracy || 0.5,
            avgReactionTimeMs: balloonResult.avgReactionTimeMs || 800,
            score:             balloonResult.score || 0,
            totalSpawned:      balloonResult.totalSpawned || 1,
            storyQuizAccuracy: storyResult?.accuracy || 1.0,
            deafOrHoh:         deaf,
          });
        }
        const p = computeCognitiveBaseline({
          quizResults:       results,
          accessibilityFlag: deaf ? "deaf" : "none",
        });
        // Merge capacity into profile
        p.capacityLevel    = capacityAnalysis.capacityLevel;
        p.difficultyLabel  = capacityAnalysis.difficultyLabel;
        p.capacityNote     = capacityAnalysis.recommendation;
        p.signRecommended  = capacityAnalysis.signLanguageRecommended || deaf;
        setProfile(p);
        setTimeout(() => { fireBurst(); setStep("result"); }, 400);
      }
    }, 800);
    return () => clearInterval(iv);
  }, [step]);

  const slide = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } };

  return (
    <div className="w-full min-h-screen bg-dark-bg flex flex-col items-center justify-start pt-24 pb-20 px-6 relative overflow-hidden">

      {/* BG */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div className="absolute -top-48 -left-48 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(123,47,247,0.12) 0%, transparent 65%)" }}
          animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 12, repeat: Infinity }} />
        <motion.div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(21,207,160,0.1) 0%, transparent 65%)" }}
          animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 10, repeat: Infinity, delay: 4 }} />
      </div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">

        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-accent-pink to-accent-violet flex items-center justify-center shadow-[0_0_16px_rgba(255,29,126,0.4)]">
            <div className="w-2.5 h-2.5 rounded-full bg-dark-bg" />
          </div>
          <span className="font-display font-bold text-base text-text-primary">NeuroPath</span>
        </motion.div>

        {/* Step dots */}
        <StepDots current={step} />

        {/* Burst container */}
        <div className="relative w-full">
          <Burst trigger={burst} />

          <AnimatePresence mode="wait">

            {/* ═══ WELCOME ═══ */}
            {step === "welcome" && (
              <motion.div key="welcome" {...slide} className="text-center">
                <motion.div animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="text-7xl mb-6 inline-block">👋</motion.div>

                <h1 className="font-display font-black text-4xl md:text-5xl text-text-primary mb-4 leading-tight">
                  Let's build your<br /><span className="gradient-text-shift">brain fingerprint.</span>
                </h1>
                <p className="text-text-dim text-base leading-relaxed mb-8 max-w-lg mx-auto">
                  Two quick challenges. We watch how you play and read — <strong className="text-text-primary">not what you answer</strong>. Your learning profile gets built from your behavior, automatically.
                </p>

                {/* What we measure */}
                <div className="grid grid-cols-3 gap-3 mb-8 text-left">
                  {[
                    { icon: "⚡", label: "Reflex Speed", desc: "How fast you react to tasks" },
                    { icon: "📖", label: "Reading Style", desc: "How long you dwell on text" },
                    { icon: "🎯", label: "Accuracy", desc: "Pattern of correct responses" },
                  ].map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                      className="glass-panel rounded-2xl p-4 border border-white/8 text-center">
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <div className="font-display font-bold text-sm text-text-primary mb-1">{item.label}</div>
                      <div className="font-mono text-[9px] text-text-faint">{item.desc}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Deaf toggle */}
                <motion.label initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all mb-8 ${deaf ? "border-accent-mint/50 bg-accent-mint/8" : "border-white/8 bg-white/[0.02] hover:border-white/20"}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${deaf ? "bg-accent-mint/15" : "bg-white/5"}`}>🤟</div>
                  <div className="flex-1 text-left">
                    <div className="font-display font-bold text-sm text-text-primary">I'm Deaf or Hard-of-Hearing</div>
                    <div className="font-mono text-[10px] text-text-faint mt-0.5">Sign language will be set as your primary format</div>
                  </div>
                  <div className={`w-12 h-6 rounded-full transition-all relative ${deaf ? "bg-accent-mint" : "bg-white/15"}`}>
                    <motion.div className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                      animate={{ left: deaf ? "auto" : "4px", right: deaf ? "4px" : "auto" }} />
                  </div>
                  <input type="checkbox" checked={deaf} onChange={e => setDeaf(e.target.checked)} className="hidden" />
                </motion.label>

                <motion.button onClick={() => { fireBurst(); setStep("balloon"); }}
                  whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                  className="w-full py-5 rounded-2xl font-black text-lg text-white flex items-center justify-center gap-3 shadow-[0_10px_40px_rgba(255,29,126,0.45)] relative overflow-hidden group"
                  style={{ background: "linear-gradient(135deg, #FF1D7E, #7B2FF7)" }}>
                  <span className="relative z-10 flex items-center gap-3">
                    <Zap size={20} /> Start Challenge 1 of 2
                    <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <ArrowRight size={18} />
                    </motion.span>
                  </span>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              </motion.div>
            )}

            {/* ═══ BALLOON GAME ═══ */}
            {step === "balloon" && (
              <motion.div key="balloon" {...slide} className="w-full">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest text-accent-violet bg-accent-violet/10 border border-accent-violet/25 px-4 py-1.5 rounded-full uppercase mb-3">
                    <Zap size={10} /> Challenge 1 — Kinesthetic Reflex Test
                  </div>
                  <h2 className="font-display font-black text-3xl text-text-primary mb-2">Pop every balloon.</h2>
                  <p className="text-text-dim text-sm">Your speed and accuracy reveal how your hands-on learning system works. Click fast — they fall!</p>
                </div>
                <BalloonGame onComplete={handleTaskComplete} />
              </motion.div>
            )}

            {/* ═══ STORY QUIZ ═══ */}
            {step === "story" && (
              <motion.div key="story" {...slide} className="w-full">
                <div className="text-center mb-6">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}
                    className="inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest text-accent-amber bg-accent-amber/10 border border-accent-amber/25 px-4 py-1.5 rounded-full uppercase mb-3">
                    🎉 Challenge 1 done! Now — Challenge 2 — Reading Comprehension
                  </motion.div>
                  <h2 className="font-display font-black text-3xl text-text-primary mb-2">Read the story. Answer once.</h2>
                  <p className="text-text-dim text-sm">We measure how you process narrative information. Take your time — we're watching speed, not just the answer.</p>
                </div>
                <StoryQuiz onComplete={handleTaskComplete} />
              </motion.div>
            )}

            {/* ═══ GENERATING ═══ */}
            {step === "generating" && (
              <motion.div key="generating" {...slide} className="text-center py-12">
                <div className="relative w-28 h-28 mx-auto mb-8">
                  <motion.div className="absolute inset-0 rounded-full border-4 border-accent-pink/20"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
                  <motion.div className="absolute inset-0 rounded-full border-4 border-accent-violet border-t-transparent"
                    animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }} />
                  <motion.div className="absolute inset-2 rounded-full border-2 border-accent-mint border-b-transparent"
                    animate={{ rotate: -360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <Brain className="text-accent-pink" size={32} />
                    </motion.div>
                  </div>
                </div>

                <h3 className="font-display font-black text-3xl text-text-primary mb-3">Building your fingerprint</h3>
                <motion.p key={genLine} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="font-mono text-sm text-accent-violet">
                  {GEN_LINES[genLine]}
                </motion.p>

                <div className="flex justify-center gap-1.5 mt-8">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-2 h-2 rounded-full bg-accent-pink"
                      animate={{ scale: [1, 1.8, 1], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ═══ RESULT ═══ */}
            {step === "result" && profile && (
              <motion.div key="result" {...slide} className="text-center">
                {/* Big result reveal */}
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                  className="relative w-32 h-32 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-pink to-accent-violet shadow-[0_0_60px_rgba(255,29,126,0.5)] flex items-center justify-center text-5xl">
                    {profile.primary === "sign" ? "🤟" : profile.primary === "visual" ? "👁️" : profile.primary === "narrative" ? "📖" : "🧪"}
                  </div>
                  <motion.div className="absolute -inset-3 rounded-full border-2 border-accent-pink/30"
                    animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <div className="font-mono text-[10px] text-text-faint uppercase tracking-[0.2em] mb-2">Cognitive fingerprint locked</div>
                  <h2 className="font-display font-black text-4xl md:text-5xl text-text-primary mb-1 capitalize">
                    {profile.primary} Learner
                  </h2>
                  <div className="font-mono text-sm text-accent-pinkLight mb-8">{profile.confidence || 75}% confidence</div>
                </motion.div>

                {/* Stats */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="grid grid-cols-3 gap-3 mb-8">
                  {[
                    { label: "Cognitive Style", value: profile.cognitiveStyle || "Analytical", color: "text-accent-violetLight" },
                    { label: "Processing", value: profile.processingSpeed || "Average", color: "text-accent-amber" },
                    { label: "Capacity Level", value: profile.difficultyLabel || "Standard", color: profile.capacityLevel === "high" ? "text-accent-mint" : profile.capacityLevel === "low" ? "text-accent-pink" : "text-accent-amber" },
                  ].map((s, i) => (
                    <motion.div key={i} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5 + i * 0.1 }}
                      className="glass-panel rounded-2xl p-4 border border-white/8">
                      <div className="font-mono text-[9px] text-text-faint uppercase tracking-wider mb-1">{s.label}</div>
                      <div className={`font-display font-bold text-sm ${s.color}`}>{s.value}</div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Capacity recommendation */}
                {profile.capacityNote && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                    className="glass-panel rounded-2xl border border-accent-violet/20 bg-accent-violet/5 p-4 text-left">
                    <div className="font-mono text-[9px] text-accent-violetLight uppercase tracking-wider mb-1.5">AI teaching recommendation</div>
                    <p className="text-text-dim text-xs leading-relaxed">{profile.capacityNote}</p>
                  </motion.div>
                )}

                {/* Modality bars */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                  className="glass-panel rounded-2xl border border-white/8 p-5 mb-8 text-left">
                  <div className="font-mono text-[9px] text-text-faint uppercase tracking-wider mb-4">Full modality breakdown</div>
                  {[
                    { key: "visual", label: "Visual", color: "#FF1D7E" },
                    { key: "narrative", label: "Narrative", color: "#FFB347" },
                    { key: "kinesthetic", label: "Kinesthetic", color: "#7B2FF7" },
                    { key: "sign", label: "Sign Language", color: "#15CFA0" },
                  ].map((m, i) => {
                    const val = profile.breakdown?.[m.key] || 0;
                    return (
                      <div key={m.key} className="mb-3">
                        <div className="flex justify-between font-mono text-[10px] mb-1">
                          <span className="text-text-dim">{m.label}</span>
                          <span className="font-bold" style={{ color: m.color }}>{val}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div className="h-full rounded-full" style={{ backgroundColor: m.color, boxShadow: `0 0 8px ${m.color}60` }}
                            initial={{ width: 0 }} animate={{ width: `${val}%` }}
                            transition={{ duration: 0.8, delay: 0.8 + i * 0.1, ease: "easeOut" }} />
                        </div>
                      </div>
                    );
                  })}
                </motion.div>

                <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
                  onClick={() => navigate("/lessons")}
                  whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.97 }}
                  className="w-full py-5 rounded-2xl font-black text-xl text-white flex items-center justify-center gap-3 shadow-[0_12px_50px_rgba(21,207,160,0.4)] relative overflow-hidden group"
                  style={{ background: "linear-gradient(135deg, #7B2FF7, #15CFA0)" }}>
                  <span className="relative z-10 flex items-center gap-3">
                    <Sparkles size={22} /> Start Learning — Adapted to You
                    <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <ArrowRight size={20} />
                    </motion.span>
                  </span>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
