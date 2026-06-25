import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Heart,
  Lightbulb,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useStore } from "../store/useStore";
import { dbService } from "../lib/firebase";
import { getLesson } from "../lib/lessons";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function buildWeeklyChart(sessions) {
  const mins = Object.fromEntries(DAY_LABELS.map((d) => [d, 0]));
  sessions.forEach((s) => {
    const d = new Date(`${s.date}T12:00:00`);
    const label = DAY_LABELS[(d.getDay() + 6) % 7];
    mins[label] += Math.round((s.duration || 0) / 60);
  });
  return DAY_LABELS.map((day) => ({ day, mins: mins[day] }));
}

function computeStreak(sessions) {
  if (!sessions.length) return 0;
  const dates = [...new Set(sessions.map((s) => s.date))].sort().reverse();
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);

  for (let i = 0; i < 14; i++) {
    const key = cursor.toISOString().split("T")[0];
    if (dates.includes(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (i === 0) {
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function formatDuration(totalMins) {
  if (totalMins < 60) return `${totalMins}m`;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function modalityTip(primary, deafOrHoh) {
  if (deafOrHoh || primary === "sign") {
    return {
      icon: "🤟",
      title: "Sign language is a strength",
      body: "Your child learns best through spatial, visual signing. Use gestures and spatial analogies when explaining new ideas at home.",
    };
  }
  if (primary === "visual") {
    return {
      icon: "📊",
      title: "Try drawing it out",
      body: "Your child processes information best through diagrams. When they're stuck, sketch the concept on paper together.",
    };
  }
  if (primary === "narrative") {
    return {
      icon: "📖",
      title: "Tell it as a story",
      body: "Analogies and characters help ideas stick. Reframe homework concepts as short stories or real-life scenarios.",
    };
  }
  if (primary === "kinesthetic") {
    return {
      icon: "🧪",
      title: "Learn by doing",
      body: "Hands-on practice beats reading alone. Use objects, movement, or simple experiments to reinforce lessons.",
    };
  }
  return {
    icon: "🔁",
    title: "Repetition is fine",
    body: "Re-reading is a signal of engagement, not failure. Encourage them to revisit tricky parts until it clicks.",
  };
}

function buildTips(profile) {
  const primary = profile?.primary || "visual";
  const tips = [modalityTip(primary, profile?.deafOrHoh)];
  tips.push({
    icon: "🔁",
    title: "Struggle is data, not failure",
    body: "When NeuroPath adapts the format, let your child explore the new version before jumping in to explain.",
  });
  if (profile?.processingSpeed === "Deep Thinker") {
    tips.push({
      icon: "⏳",
      title: "Allow thinking time",
      body: "Your child benefits from pauses. Avoid rushing — deep processing is a strength.",
    });
  } else {
    tips.push({
      icon: "✅",
      title: "Celebrate small wins",
      body: "Short study bursts with clear checkpoints work well. Review what they mastered each week together.",
    });
  }
  return tips.slice(0, 3);
}

function plainStruggleSummary(item) {
  const modality = item.modalityOffered || "adaptive";
  let how = `NeuroPath switched to a ${modality} explanation`;
  if (item.outcomeVerified) {
    how += ` — your child verified understanding in ${item.resolutionSeconds || "?"}s`;
    if (item.attemptsBefore > 0) {
      how += ` (after ${item.attemptsBefore} earlier attempt${item.attemptsBefore !== 1 ? "s" : ""})`;
    }
  } else if (item.agentReasoning) {
    how += `. ${item.agentReasoning}`;
  } else {
    how += " — and continued the lesson.";
  }
  return how;
}

export default function ParentPortal() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const studentProfile = useStore((s) => s.studentProfile);

  const [wardNameInput, setWardNameInput] = useState("");
  const [storedWardName, setStoredWardName] = useState(() => {
    try {
      const wardsDb = JSON.parse(localStorage.getItem("neuropath_parent_wards") || "{}");
      return user?.email ? (wardsDb[user.email] || "") : "";
    } catch {
      return "";
    }
  });

  const handleSaveWard = (e) => {
    e.preventDefault();
    if (!wardNameInput.trim()) return;
    try {
      const wardsDb = JSON.parse(localStorage.getItem("neuropath_parent_wards") || "{}");
      wardsDb[user.email] = wardNameInput.trim();
      localStorage.setItem("neuropath_parent_wards", JSON.stringify(wardsDb));
      setStoredWardName(wardNameInput.trim());
    } catch (err) {
      console.error(err);
    }
  };

  const showWardPrompt = user?.role === "parent" && !storedWardName;

  const report = useMemo(() => {
    const student = dbService.getStudents().find((s) => s.id === "current_user");
    const sessions = studentProfile?.sessions?.length
      ? studentProfile.sessions
      : student?.sessions || [];
    const struggles = student?.struggleHistory || [];

    const totalMins = sessions.reduce(
      (sum, s) => sum + Math.round((s.duration || 0) / 60),
      0
    );
    const avgScore =
      sessions.length > 0
        ? Math.round(
            sessions.reduce((sum, s) => sum + (s.score || 0), 0) / sessions.length
          )
        : null;

    const concepts = sessions.map((s) => {
      const lesson = getLesson(s.lessonId);
      return {
        name: s.lessonTitle || lesson?.title || s.lessonId,
        subject: lesson?.subject || "General",
        mastered: (s.score || 0) >= 80,
        score: s.score || 0,
        date: s.date
          ? new Date(`${s.date}T12:00:00`).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : "—",
        adapted: !!s.adapted,
      };
    });

    const struggleSummaries = struggles.slice(0, 5).map((s) => ({
      concept: s.concept,
      how: plainStruggleSummary(s),
      resolved: s.outcomeVerified || s.resolved,
    }));

    return {
      childName: student?.name?.replace(" (You)", "") || "your child",
      weeklyData: buildWeeklyChart(sessions),
      totalMins,
      avgScore,
      streak: computeStreak(sessions),
      concepts,
      struggles: struggleSummaries,
      tips: buildTips(studentProfile),
      hasData: sessions.length > 0 || struggles.length > 0,
      primary: studentProfile?.primary,
    };
  }, [studentProfile, storedWardName]);

  const maxMins = Math.max(...report.weeklyData.map((d) => d.mins), 1);
  const weekLabel = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-dark-bg text-text-primary">
      <div className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-xl border-b border-white/8 px-6 md:px-16 py-4 flex items-center justify-between">
        <div
          className="flex items-center gap-2.5 font-display font-bold text-base cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-accent-pink to-accent-violet flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-dark-bg" />
          </div>
          NeuroPath
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[11px] text-text-faint">
            {user?.name || "Parent"}
          </span>
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="font-mono text-[11px] text-accent-pink hover:underline"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="pt-24 pb-20 px-6 md:px-16 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 font-mono text-[10.5px] text-accent-mint bg-accent-mint/10 border border-accent-mint/20 px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            <Heart size={10} className="fill-accent-mint text-accent-mint" />{" "}
            Weekly Report · {weekLabel}
          </div>
          <h1 className="font-display font-black text-4xl md:text-5xl mb-2">
            Hi, {user?.name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-text-dim text-lg">
            Here's how{" "}
            <strong className="text-text-primary">{report.childName}</strong> did
            this week — plain and simple.
            {report.primary && (
              <span className="block text-sm text-text-faint mt-2 font-mono">
                Learning style: {report.primary}
                {studentProfile?.confidence
                  ? ` · ${studentProfile.confidence}% calibration confidence`
                  : ""}
              </span>
            )}
          </p>
        </motion.div>

        {!report.hasData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-panel rounded-2xl p-8 border border-white/8 mb-10 text-center"
          >
            <p className="text-text-dim text-sm mb-4">
              No lesson activity yet. Complete onboarding and a lesson as a student
              to populate this report.
            </p>
            <button
              onClick={() => navigate("/onboarding")}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-accent-pink to-[#C2127F] text-white text-xs font-bold uppercase tracking-wider"
            >
              Start student calibration
            </button>
          </motion.div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            {
              icon: Clock,
              label: "Time learning",
              value: report.totalMins ? formatDuration(report.totalMins) : "—",
              sub: "logged sessions",
              color: "violet",
            },
            {
              icon: BookOpen,
              label: "Lessons completed",
              value: report.concepts.length || "0",
              sub: "concepts covered",
              color: "pink",
            },
            {
              icon: Award,
              label: "Avg score",
              value: report.avgScore != null ? `${report.avgScore}%` : "—",
              sub: "across checkpoints",
              color: "mint",
            },
            {
              icon: TrendingUp,
              label: "Streak",
              value: report.streak ? `${report.streak} day${report.streak !== 1 ? "s" : ""}` : "—",
              sub: "active learning",
              color: "amber",
            },
          ].map((k, i) => {
            const Icon = k.icon;
            const cMap = {
              pink: "text-accent-pink bg-accent-pink/10",
              violet: "text-accent-violetLight bg-accent-violet/10",
              mint: "text-accent-mint bg-accent-mint/10",
              amber: "text-accent-amber bg-accent-amber/10",
            };
            return (
              <motion.div
                key={k.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-panel rounded-2xl p-5 border border-white/8 text-left"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${cMap[k.color]}`}
                >
                  <Icon size={16} />
                </div>
                <div className="font-display font-black text-2xl text-text-primary">
                  {k.value}
                </div>
                <div className="font-mono text-[10px] text-text-faint mt-1 uppercase tracking-wider">
                  {k.sub}
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel rounded-2xl p-6 border border-white/8 mb-8"
        >
          <h2 className="font-display font-bold text-base mb-4 text-left">
            Daily learning time
          </h2>
          <div className="flex items-end gap-2 h-24">
            {report.weeklyData.map((d, i) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  className="w-full rounded-lg bg-gradient-to-t from-accent-pink to-accent-violet"
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.mins / maxMins) * 80}px` }}
                  transition={{ delay: 0.4 + i * 0.05, duration: 0.6, ease: "easeOut" }}
                  style={{ opacity: d.mins === 0 ? 0.1 : 0.85 }}
                />
                <span className="font-mono text-[9px] text-text-faint">{d.day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel rounded-2xl p-6 border border-white/8"
          >
            <h2 className="font-display font-bold text-base mb-4 text-left">
              What {report.childName.split(" ")[0]} learned
            </h2>
            <div className="space-y-3">
              {report.concepts.length > 0 ? (
                report.concepts.map((c) => (
                  <div
                    key={`${c.name}-${c.date}`}
                    className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5"
                  >
                    <div>
                      <div className="font-semibold text-sm text-text-primary">
                        {c.name}
                      </div>
                      <div className="font-mono text-[10px] text-text-faint mt-0.5">
                        {c.subject} · {c.date}
                        {c.adapted && " · adapted"}
                      </div>
                    </div>
                    <div
                      className={`font-bold text-sm flex items-center gap-1 ${c.mastered ? "text-accent-mint" : "text-accent-amber"}`}
                    >
                      {c.mastered ? <Award size={14} /> : null} {c.score}%
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-text-faint text-xs font-mono py-4 text-center">
                  Lessons will appear here after completion.
                </p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-panel rounded-2xl p-6 border border-white/8"
          >
            <h2 className="font-display font-bold text-base mb-4 text-left">
              Where {report.childName.split(" ")[0]} got stuck — and unstuck
            </h2>
            <div className="space-y-3">
              {report.struggles.length > 0 ? (
                report.struggles.map((s, i) => (
                  <div
                    key={i}
                    className="p-3 bg-white/[0.02] rounded-xl border border-white/5"
                  >
                    <div className="font-semibold text-sm text-text-primary mb-1">
                      {s.concept}
                    </div>
                    <div className="text-[12px] text-text-dim leading-relaxed">
                      {s.how}
                    </div>
                    {s.resolved && (
                      <div className="mt-2 flex items-center gap-1 font-mono text-[10px] text-accent-mint">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-mint" />{" "}
                        Resolved
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-text-faint text-xs font-mono py-4 text-center">
                  Struggle summaries appear when NeuroPath adapts during a lesson.
                </p>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-panel rounded-2xl p-6 border border-white/8 mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={16} className="text-accent-amber" />
            <h2 className="font-display font-bold text-base text-left">
              How to support {report.childName.split(" ")[0]} at home
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {report.tips.map((t, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -3 }}
                className="p-4 bg-white/[0.02] rounded-xl border border-white/5 text-left"
              >
                <div className="text-2xl mb-2">{t.icon}</div>
                <div className="font-display font-bold text-sm text-text-primary mb-1">
                  {t.title}
                </div>
                <div className="text-[12.5px] text-text-dim leading-relaxed">
                  {t.body}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="text-center font-mono text-[10.5px] text-text-faint leading-relaxed max-w-lg mx-auto">
          Raw behavioral data (re-read counts, pause lengths) stays internal to
          NeuroPath and is never shared with parents or third parties. This report
          contains only outcomes and plain-language summaries.
      </div>

      {/* Ward Name Prompt Modal Overlay */}
      <AnimatePresence>
        {showWardPrompt && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md glass-panel rounded-3xl border border-white/10 p-8 bg-dark-bg/95 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-accent-pink/15 border border-accent-pink/20 flex items-center justify-center mx-auto mb-5 text-accent-pinkLight">
                <Heart size={22} className="fill-accent-pink text-accent-pink" />
              </div>
              <h3 className="font-display font-black text-2xl text-text-primary mb-2">Welcome to Parent Portal</h3>
              <p className="text-text-dim text-sm mb-6 leading-relaxed">
                To customize your reports, please enter the name of your child or ward.
              </p>
              <form onSubmit={handleSaveWard} className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter name (e.g. Rahul, Sophia)"
                  value={wardNameInput}
                  onChange={(e) => setWardNameInput(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-text-primary placeholder:text-text-faint focus:border-accent-pink focus:bg-white/[0.05] focus:outline-none transition-all text-center"
                  required
                  autoFocus
                />
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accent-pink to-[#C2127F] text-white font-bold text-sm shadow-[0_6px_24px_rgba(255,29,126,0.4)] flex items-center justify-center gap-2"
                >
                  Save & View Reports
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  </div>
  );
}
