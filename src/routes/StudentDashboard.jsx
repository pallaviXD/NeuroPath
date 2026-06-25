import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, Zap, BookOpen, Award, ArrowRight, Play, Hand, TrendingUp, Clock } from "lucide-react";
import { useStore } from "../store/useStore";
import { useAuthStore } from "../store/useAuthStore";
import { listLessonSummaries } from "../lib/lessons";

const M_CONFIG = {
  visual:      { icon: "📊", label: "Visual",      color: "#FF1D7E" },
  narrative:   { icon: "📖", label: "Story",        color: "#FFB347" },
  kinesthetic: { icon: "🧪", label: "Hands-on",    color: "#7B2FF7" },
  sign:        { icon: "🤟", label: "Sign Language", color: "#15CFA0" },
};

function RadarMini({ breakdown }) {
  const entries = Object.entries(breakdown || {});
  if (!entries.length) return null;
  return (
    <div className="space-y-2">
      {entries.map(([key, val]) => {
        const cfg = M_CONFIG[key];
        if (!cfg) return null;
        return (
          <div key={key}>
            <div className="flex justify-between font-mono text-[9px] mb-0.5">
              <span className="text-text-faint">{cfg.icon} {cfg.label}</span>
              <span style={{ color: cfg.color }}>{val}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ backgroundColor: cfg.color }}
                initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const studentProfile = useStore(s => s.studentProfile);
  const sessions = studentProfile?.sessions || [];
  const allLessons = listLessonSummaries();
  const completedIds = new Set(sessions.map(s => s.lessonId));
  const primary = studentProfile?.primary;
  const cfg = primary ? M_CONFIG[primary] : null;
  const totalTime = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  const avgScore = sessions.length > 0 ? Math.round(sessions.reduce((a, s) => a + (s.score || 0), 0) / sessions.length) : 0;
  const recentSessions = [...sessions].reverse().slice(0, 3);

  return (
    <div className="w-full max-w-5xl mx-auto pt-28 pb-24 px-6 md:px-12">

      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="font-mono text-[10px] text-text-faint uppercase tracking-[0.2em] mb-2">
          {new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening"}, {user?.name?.split(" ")[0] || "student"} 👋
        </div>
        <h1 className="font-display font-black text-4xl md:text-5xl text-text-primary leading-tight mb-2">
          Your Learning <span className="gradient-text-shift">Command Center</span>
        </h1>
        <p className="text-text-dim text-base">Everything you need to track your progress and continue learning.</p>
      </motion.div>

      {/* Profile + Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

        {/* Cognitive profile card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-panel rounded-3xl border border-white/10 p-5 md:col-span-1">
          <div className="font-mono text-[9px] text-text-faint uppercase tracking-wider mb-3">Your cognitive profile</div>
          {primary && cfg ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">{cfg.icon}</div>
                <div>
                  <div className="font-display font-black text-xl" style={{ color: cfg.color }}>{cfg.label} Learner</div>
                  <div className="font-mono text-[10px] text-text-faint">{studentProfile.confidence || 75}% confidence</div>
                </div>
              </div>
              {studentProfile.capacityLevel && (
                <div className={`inline-flex items-center gap-1.5 font-mono text-[9px] font-bold px-2.5 py-1 rounded-full border mb-3 ${
                  studentProfile.capacityLevel === "high" ? "border-accent-mint/30 bg-accent-mint/10 text-accent-mint" :
                  studentProfile.capacityLevel === "low" ? "border-accent-pink/30 bg-accent-pink/10 text-accent-pink" :
                  "border-accent-amber/30 bg-accent-amber/10 text-accent-amber"
                }`}>
                  <TrendingUp size={9} /> {studentProfile.difficultyLabel || "Standard"} Capacity
                </div>
              )}
              <RadarMini breakdown={studentProfile.breakdown} />
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-text-faint text-xs mb-3">No profile yet. Complete onboarding.</p>
              <motion.button onClick={() => navigate("/onboarding")} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-accent-violet to-accent-mint text-dark-bg font-bold text-xs">
                Build Profile →
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Stats */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          {[
            { icon: BookOpen, label: "Lessons completed", value: completedIds.size, color: "text-accent-pink", bg: "bg-accent-pink/10 border-accent-pink/20" },
            { icon: Award, label: "Average score", value: avgScore > 0 ? `${avgScore}%` : "—", color: "text-accent-mint", bg: "bg-accent-mint/10 border-accent-mint/20" },
            { icon: Clock, label: "Total study time", value: totalTime > 0 ? `${Math.round(totalTime/60)}m` : "—", color: "text-accent-amber", bg: "bg-accent-amber/10 border-accent-amber/20" },
            { icon: Zap, label: "Streak", value: `${sessions.length} sessions`, color: "text-accent-violetLight", bg: "bg-accent-violet/10 border-accent-violet/20" },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
                className={`glass-panel rounded-2xl p-5 border ${s.bg}`}>
                <Icon size={18} className={`${s.color} mb-2`} />
                <div className={`font-display font-black text-3xl ${s.color}`}>{s.value}</div>
                <div className="font-mono text-[9px] text-text-faint mt-1 uppercase tracking-wider">{s.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-panel rounded-3xl border border-white/10 p-6 mb-8">
          <h2 className="font-display font-bold text-lg text-text-primary mb-4">Recent Sessions</h2>
          <div className="space-y-3">
            {recentSessions.map((s, i) => {
              const lesson = allLessons.find(l => l.id === s.lessonId);
              return (
                <div key={i} className="flex items-center justify-between p-3.5 bg-white/[0.02] rounded-xl border border-white/6 hover:border-white/15 transition-all cursor-pointer"
                  onClick={() => navigate(`/lesson/${s.lessonId}`)}>
                  <div>
                    <div className="font-display font-bold text-sm text-text-primary">{lesson?.title || s.lessonId}</div>
                    <div className="font-mono text-[9px] text-text-faint mt-0.5">{s.date} · {Math.round((s.duration || 0) / 60)}m</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`font-display font-black text-lg ${s.score >= 80 ? "text-accent-mint" : s.score >= 60 ? "text-accent-amber" : "text-accent-pink"}`}>
                      {s.score}%
                    </div>
                    <ArrowRight size={14} className="text-text-faint" />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* CTA row */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="flex flex-wrap gap-4">
        <motion.button onClick={() => navigate("/lessons")} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
          className="px-7 py-4 rounded-2xl bg-gradient-to-r from-accent-pink to-[#C2127F] text-white font-black text-base shadow-[0_8px_30px_rgba(255,29,126,0.4)] flex items-center gap-2">
          <Play size={16} /> Browse Lessons
        </motion.button>
        <motion.button onClick={() => navigate("/instant")} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
          className="px-7 py-4 rounded-2xl border border-accent-violet/30 bg-accent-violet/10 text-accent-violetLight font-bold text-base flex items-center gap-2">
          <BookOpen size={16} /> Upload PDF Lesson
        </motion.button>
        {!primary && (
          <motion.button onClick={() => navigate("/onboarding")} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="px-7 py-4 rounded-2xl border border-accent-mint/30 bg-accent-mint/10 text-accent-mint font-bold text-base flex items-center gap-2">
            <Brain size={16} /> Build Cognitive Profile
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
