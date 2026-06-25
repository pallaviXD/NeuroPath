import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, Sparkles, Brain, Zap, Hand, Eye, BookOpen, CheckCircle2, Star, Clock, Trophy, Upload, Play } from "lucide-react";import { useStore } from "../store/useStore";
import { useAuthStore } from "../store/useAuthStore";
import { listLessonSummaries } from "../lib/lessons";

/* ── Floating orbs behind cards ── */
function FloatOrb({ color, size, top, left, delay }) {
  return (
    <motion.div className="absolute rounded-full pointer-events-none"
      style={{ background: color, width: size, height: size, top, left, filter: "blur(60px)", opacity: 0.12 }}
      animate={{ scale: [1, 1.3, 1], opacity: [0.12, 0.22, 0.12] }}
      transition={{ duration: 8 + delay, repeat: Infinity, delay, ease: "easeInOut" }} />
  );
}

/* ── Modality icon pill ── */
const M_CONFIG = {
  visual:      { icon: "📊", label: "Visual",      color: "#FF1D7E", glow: "rgba(255,29,126,0.3)" },
  narrative:   { icon: "📖", label: "Story",        color: "#FFB347", glow: "rgba(255,179,71,0.3)" },
  kinesthetic: { icon: "🧪", label: "Hands-on",    color: "#7B2FF7", glow: "rgba(123,47,247,0.3)" },
  sign:        { icon: "🤟", label: "Sign Lang.",   color: "#15CFA0", glow: "rgba(21,207,160,0.3)" },
};

/* ── Lesson card ── */
function LessonCard({ lesson, done, primaryModality, index, onClick }) {
  const [hovered, setHovered] = useState(false);
  const subjectEmoji = { Physics: "⚡", Biology: "🌿", Chemistry: "🧪", Math: "📐", "Custom Study": "✨", General: "📚" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, scale: 1.01 }}
      onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      className="relative cursor-pointer group rounded-3xl overflow-hidden"
      style={{ isolation: "isolate" }}
    >
      {/* Glow border */}
      <motion.div className="absolute -inset-px rounded-3xl"
        animate={{ opacity: hovered ? 1 : 0 }}
        style={{ background: "linear-gradient(135deg, rgba(255,29,126,0.5), rgba(123,47,247,0.3), rgba(21,207,160,0.2))" }} />

      <div className="relative glass-panel rounded-3xl border border-white/8 overflow-hidden h-full">
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-accent-pink via-accent-violet to-accent-mint" />

        {/* Card content */}
        <div className="p-6 pb-5">
          {/* Header row */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <motion.div animate={{ rotate: hovered ? [0, -10, 10, 0] : 0 }} transition={{ duration: 0.5 }}
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-dark-card to-dark-card2 border border-white/8 flex items-center justify-center text-2xl shadow-lg">
                {subjectEmoji[lesson.subject] || "📚"}
              </motion.div>
              <div>
                <div className="font-mono text-[9px] font-bold uppercase tracking-widest text-text-faint">{lesson.subject}</div>
                {done && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="flex items-center gap-1 mt-0.5 font-mono text-[8px] text-accent-mint">
                    <CheckCircle2 size={8} /> Completed
                  </motion.div>
                )}
              </div>
            </div>
            {lesson.generated && (
              <span className="font-mono text-[8px] text-accent-violet bg-accent-violet/10 border border-accent-violet/20 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                <Sparkles size={7} /> AI
              </span>
            )}
          </div>

          <h3 className="font-display font-black text-xl text-text-primary mb-3 leading-tight group-hover:text-accent-pinkLight transition-colors duration-300">
            {lesson.title}
          </h3>

          {/* Modality pills */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {Object.entries(M_CONFIG).map(([key, cfg]) => {
              const isMatch = key === primaryModality;
              return (
                <motion.span key={key}
                  whileHover={{ scale: 1.1 }}
                  className="flex items-center gap-1 font-mono text-[9px] px-2 py-1 rounded-full border transition-all"
                  style={{
                    backgroundColor: isMatch ? `${cfg.color}18` : "rgba(255,255,255,0.03)",
                    borderColor: isMatch ? `${cfg.color}50` : "rgba(255,255,255,0.08)",
                    color: isMatch ? cfg.color : "rgba(255,255,255,0.3)",
                    boxShadow: isMatch ? `0 0 10px ${cfg.glow}` : "none",
                    fontWeight: isMatch ? 700 : 400,
                  }}>
                  {cfg.icon} {isMatch ? `★ ${cfg.label}` : cfg.label}
                </motion.span>
              );
            })}
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="px-6 py-4 border-t border-white/6 bg-white/[0.015] flex items-center justify-between">
          <span className="font-mono text-[10px] text-text-faint">
            {done ? "Try another format" : "Adapted to your profile"}
          </span>
          <motion.div animate={{ x: hovered ? 4 : 0 }}
            className="flex items-center gap-1.5 font-mono text-[10px] text-accent-pink font-bold">
            <Play size={10} /> {done ? "Review" : "Start"} <ArrowRight size={11} />
          </motion.div>
        </div>

        {/* Hover shimmer */}
        <motion.div className="absolute inset-0 pointer-events-none"
          animate={{ opacity: hovered ? 1 : 0 }}
          style={{ background: "linear-gradient(135deg, rgba(255,29,126,0.04) 0%, transparent 60%)" }} />
      </div>
    </motion.div>
  );
}

/* ── Profile badge ── */
function ProfileBadge({ profile }) {
  if (!profile?.primary) return null;
  const cfg = M_CONFIG[profile.primary];
  if (!cfg) return null;
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
      className="flex items-center gap-3 glass-panel border border-white/10 rounded-2xl px-4 py-3">
      <div className="text-2xl">{cfg.icon}</div>
      <div>
        <div className="font-mono text-[9px] text-text-faint uppercase tracking-wider">Your learning style</div>
        <div className="font-display font-bold text-sm mt-0.5" style={{ color: cfg.color }}>
          {cfg.label} Learner · {profile.confidence || 75}% confidence
        </div>
      </div>
    </motion.div>
  );
}

/* ── Streak widget ── */
function StreakWidget({ sessions }) {
  const streak = sessions?.length || 0;
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
      className="flex items-center gap-3 glass-panel border border-white/10 rounded-2xl px-4 py-3">
      <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        className="text-2xl">🔥</motion.div>
      <div>
        <div className="font-mono text-[9px] text-text-faint uppercase tracking-wider">Lesson streak</div>
        <div className="font-display font-bold text-sm text-accent-amber mt-0.5">{streak} completed</div>
      </div>
    </motion.div>
  );
}

/* ── Main ── */
export default function Lessons() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const studentProfile = useStore(s => s.studentProfile);
  const sessions = studentProfile?.sessions || [];
  const allLessons = listLessonSummaries();
  const builtIn = allLessons.filter(l => !l.generated);
  const generated = allLessons.filter(l => l.generated);
  const completedIds = new Set(sessions.map(s => s.lessonId));
  const primary = studentProfile?.primary;

  const firstName = user?.name?.split(" ")[0] || "there";
  const timeOfDay = new Date().getHours();
  const greeting = timeOfDay < 12 ? "Good morning" : timeOfDay < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="w-full min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <FloatOrb color="#FF1D7E" size={500} top="-10%" left="-10%" delay={0} />
        <FloatOrb color="#7B2FF7" size={400} top="40%" left="70%" delay={3} />
        <FloatOrb color="#15CFA0" size={300} top="70%" left="10%" delay={6} />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto pt-28 pb-24 px-6 md:px-12">

        {/* ── Header ── */}
        <div className="mb-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>

            {/* Greeting */}
            <div className="font-mono text-[11px] text-text-faint uppercase tracking-[0.2em] mb-2">{greeting}, {firstName}</div>
            <h1 className="font-display font-black text-5xl md:text-6xl text-text-primary leading-tight mb-6">
              {!primary ? (
                <>Your lessons<br /><span className="gradient-text-shift">await.</span></>
              ) : (
                <>Ready to learn<br /><span className="gradient-text-shift">your way?</span></>
              )}
            </h1>

            {/* Profile + streak row */}
            <div className="flex flex-wrap gap-3 mb-8">
              <ProfileBadge profile={studentProfile} />
              <StreakWidget sessions={sessions} />
            </div>

            {/* Upload PDF CTA — always visible */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="mb-8">
              <motion.button onClick={() => navigate("/instant")}
                whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 px-7 py-4 rounded-2xl bg-gradient-to-r from-accent-pink to-[#C2127F] text-white font-black text-base shadow-[0_8px_32px_rgba(255,29,126,0.45)] relative overflow-hidden group">
                <span className="relative z-10 flex items-center gap-3">
                  <Upload size={18} /> Upload any PDF → Get instant lesson
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
              <p className="font-mono text-[10px] text-text-faint mt-2 ml-1">
                Any subject · Gemini generates visual, story, hands-on & sign language formats
              </p>
            </motion.div>

            {/* No profile CTA */}
            {!primary && (              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="relative overflow-hidden rounded-3xl border border-accent-violet/30 bg-gradient-to-br from-accent-violet/10 to-accent-mint/5 p-6 mb-8">
                <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-accent-violet/20 blur-3xl pointer-events-none" />
                <div className="flex items-center gap-6 flex-wrap relative z-10">
                  <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-violet to-accent-mint flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(123,47,247,0.4)] flex-shrink-0">
                    🧠
                  </motion.div>
                  <div className="flex-1">
                    <div className="font-display font-black text-xl text-text-primary mb-1">
                      Your cognitive profile isn't built yet
                    </div>
                    <p className="text-text-dim text-sm">
                      Complete the 2-minute fingerprinting. We'll watch how you interact — no quiz needed — and every lesson will reshape itself to match your brain.
                    </p>
                  </div>
                  <motion.button onClick={() => navigate("/onboarding")}
                    whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-accent-violet to-accent-mint text-dark-bg font-black text-sm flex items-center gap-2 shadow-[0_8px_30px_rgba(123,47,247,0.4)] flex-shrink-0">
                    <Brain size={16} /> Build my profile <ArrowRight size={14} />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* ── Core lessons ── */}
        <div className="mb-14">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-black text-2xl text-text-primary">Core Curriculum</h2>
              <p className="text-text-faint text-xs font-mono mt-0.5">
                {primary ? `Served in ${primary} format first · switch anytime inside` : "Choose your format inside each lesson"}
              </p>
            </div>
            <span className="font-mono text-[10px] text-text-faint bg-white/5 border border-white/8 px-3 py-1.5 rounded-full uppercase tracking-wider">
              {builtIn.length} lessons
            </span>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {builtIn.map((lesson, i) => (
              <LessonCard key={lesson.id} lesson={lesson} done={completedIds.has(lesson.id)}
                primaryModality={primary} index={i}
                onClick={() => navigate(`/lesson/${lesson.id}`)} />
            ))}
          </div>
        </div>

        {/* ── AI-generated ── */}
        {generated.length > 0 && (
          <div className="mb-14">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display font-black text-2xl text-text-primary">Your Uploaded Lessons</h2>
                <p className="text-text-faint text-xs font-mono mt-0.5">Generated by Gemini from your PDFs</p>
              </div>
              <span className="font-mono text-[10px] text-accent-violet bg-accent-violet/10 border border-accent-violet/20 px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={9} /> {generated.length} ai lessons
              </span>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {generated.map((lesson, i) => (
                <LessonCard key={lesson.id} lesson={lesson} done={completedIds.has(lesson.id)}
                  primaryModality={primary} index={i}
                  onClick={() => navigate(`/lesson/${lesson.id}`)} />
              ))}
            </div>
          </div>
        )}

        {/* ── Bottom CTA ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-dark-card to-dark-card2 p-8 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-pink/5 via-transparent to-accent-violet/5 pointer-events-none" />
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-pink to-accent-violet flex items-center justify-center text-2xl mx-auto mb-4 shadow-[0_0_30px_rgba(255,29,126,0.3)]">
            🚀
          </motion.div>
          <h3 className="font-display font-black text-2xl text-text-primary mb-2">More lessons coming.</h3>
          <p className="text-text-dim text-sm max-w-md mx-auto mb-5">
            Your teacher uploads PDFs and Gemini generates new adaptive lessons — visual, story, hands-on, and signed — automatically.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <motion.button onClick={() => navigate("/demo")} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="px-6 py-3 rounded-xl border border-accent-pink/30 bg-accent-pink/10 text-accent-pinkLight font-bold text-sm flex items-center gap-2">
              <Play size={14} /> Watch live demo
            </motion.button>
            {(user?.role === "teacher" || user?.role === "admin") && (
              <motion.button onClick={() => navigate("/dashboard/content")} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent-amber to-[#e08000] text-dark-bg font-black text-sm flex items-center gap-2">
                <Upload size={14} /> Upload PDF
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
