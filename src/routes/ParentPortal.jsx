import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Clock, Award, TrendingUp, Heart, Lightbulb, ChevronRight, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const weeklyData = [
  { day: "Mon", mins: 18 }, { day: "Tue", mins: 32 }, { day: "Wed", mins: 25 },
  { day: "Thu", mins: 40 }, { day: "Fri", mins: 22 }, { day: "Sat", mins: 0 }, { day: "Sun", mins: 15 },
];

const concepts = [
  { name: "Newton's First Law", subject: "Physics", mastered: true, score: 95, date: "Jun 18" },
  { name: "Photosynthesis", subject: "Biology", mastered: true, score: 90, date: "Jun 19" },
  { name: "Force & Acceleration", subject: "Physics", mastered: false, score: 70, date: "Jun 19" },
];

const struggles = [
  { concept: "Unbalanced forces", how: "NeuroPath switched to a visual diagram — it helped.", resolved: true },
  { concept: "Calvin cycle flow", how: "An analogy story was offered — your child re-read twice then got it.", resolved: true },
];

const tips = [
  { icon: "📊", title: "Try drawing it out", body: "Your child processes information best through diagrams. When they're stuck at home, sketch the concept on paper together." },
  { icon: "🔁", title: "Repetition is fine", body: "Re-reading is a signal of engagement, not failure. Encourage them to re-read until it clicks." },
  { icon: "🤟", title: "Sign language is a strength", body: "If your child uses sign language, their visual-spatial memory is exceptional. Use spatial analogies when explaining new ideas." },
];

export default function ParentPortal() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const childName = "Alex";
  const maxMins = Math.max(...weeklyData.map((d) => d.mins), 1);

  return (
    <div className="min-h-screen bg-dark-bg text-text-primary">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-xl border-b border-white/8 px-6 md:px-16 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 font-display font-bold text-base cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-accent-pink to-accent-violet flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-dark-bg" />
          </div>
          NeuroPath
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[11px] text-text-faint">{user?.name || "Parent"}</span>
          <button onClick={() => { logout(); navigate("/"); }} className="font-mono text-[11px] text-accent-pink hover:underline">Sign out</button>
        </div>
      </div>

      <div className="pt-24 pb-20 px-6 md:px-16 max-w-5xl mx-auto">
        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-10">
          <div className="inline-flex items-center gap-2 font-mono text-[10.5px] text-accent-mint bg-accent-mint/10 border border-accent-mint/20 px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            <Heart size={10} className="fill-accent-mint text-accent-mint" /> Weekly Report · Week of Jun 16
          </div>
          <h1 className="font-display font-black text-4xl md:text-5xl mb-2">Hi, {user?.name?.split(" ")[0] || "there"} 👋</h1>
          <p className="text-text-dim text-lg">Here's how <strong className="text-text-primary">{childName}</strong> did this week — plain and simple.</p>
        </motion.div>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Clock, label: "Time learning", value: "2h 32m", sub: "this week", color: "violet" },
            { icon: BookOpen, label: "Concepts covered", value: "3", sub: "lessons completed", color: "pink" },
            { icon: Award, label: "Avg score", value: "85%", sub: "across quizzes", color: "mint" },
            { icon: TrendingUp, label: "Streak", value: "5 days", sub: "in a row", color: "amber" },
          ].map((k, i) => {
            const Icon = k.icon;
            const cMap = { pink: "text-accent-pink bg-accent-pink/10", violet: "text-accent-violetLight bg-accent-violet/10", mint: "text-accent-mint bg-accent-mint/10", amber: "text-accent-amber bg-accent-amber/10" };
            return (
              <motion.div key={k.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="glass-panel rounded-2xl p-5 border border-white/8 text-left">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${cMap[k.color]}`}>
                  <Icon size={16} />
                </div>
                <div className="font-display font-black text-2xl text-text-primary">{k.value}</div>
                <div className="font-mono text-[10px] text-text-faint mt-1 uppercase tracking-wider">{k.sub}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Weekly chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-panel rounded-2xl p-6 border border-white/8 mb-8">
          <h2 className="font-display font-bold text-base mb-4 text-left">Daily learning time</h2>
          <div className="flex items-end gap-2 h-24">
            {weeklyData.map((d, i) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <motion.div className="w-full rounded-lg bg-gradient-to-t from-accent-pink to-accent-violet"
                  initial={{ height: 0 }} animate={{ height: `${(d.mins / maxMins) * 80}px` }}
                  transition={{ delay: 0.4 + i * 0.05, duration: 0.6, ease: "easeOut" }}
                  style={{ opacity: d.mins === 0 ? 0.1 : 0.85 }}
                />
                <span className="font-mono text-[9px] text-text-faint">{d.day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Concepts */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="glass-panel rounded-2xl p-6 border border-white/8">
            <h2 className="font-display font-bold text-base mb-4 text-left">What {childName} learned</h2>
            <div className="space-y-3">
              {concepts.map((c) => (
                <div key={c.name} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5">
                  <div>
                    <div className="font-semibold text-sm text-text-primary">{c.name}</div>
                    <div className="font-mono text-[10px] text-text-faint mt-0.5">{c.subject} · {c.date}</div>
                  </div>
                  <div className={`font-bold text-sm flex items-center gap-1 ${c.mastered ? "text-accent-mint" : "text-accent-amber"}`}>
                    {c.mastered ? <Award size={14} /> : null} {c.score}%
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Struggles resolved */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="glass-panel rounded-2xl p-6 border border-white/8">
            <h2 className="font-display font-bold text-base mb-4 text-left">Where {childName} got stuck — and unstuck</h2>
            <div className="space-y-3">
              {struggles.map((s, i) => (
                <div key={i} className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
                  <div className="font-semibold text-sm text-text-primary mb-1">{s.concept}</div>
                  <div className="text-[12px] text-text-dim leading-relaxed">{s.how}</div>
                  {s.resolved && (
                    <div className="mt-2 flex items-center gap-1 font-mono text-[10px] text-accent-mint">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-mint" /> Resolved automatically
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Tips */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="glass-panel rounded-2xl p-6 border border-white/8 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={16} className="text-accent-amber" />
            <h2 className="font-display font-bold text-base text-left">How to support {childName} at home</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tips.map((t, i) => (
              <motion.div key={i} whileHover={{ y: -3 }} className="p-4 bg-white/[0.02] rounded-xl border border-white/5 text-left">
                <div className="text-2xl mb-2">{t.icon}</div>
                <div className="font-display font-bold text-sm text-text-primary mb-1">{t.title}</div>
                <div className="text-[12.5px] text-text-dim leading-relaxed">{t.body}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Privacy note */}
        <div className="text-center font-mono text-[10.5px] text-text-faint leading-relaxed max-w-lg mx-auto">
          Raw behavioral data (re-read counts, pause lengths) stays internal to NeuroPath and is never shared with parents or third parties. This report contains only outcomes and plain-language summaries.
        </div>
      </div>
    </div>
  );
}
