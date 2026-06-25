import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen, Zap, Eye, Hand, ArrowRight, Award, Clock,
  Lock, CheckCircle2, Sparkles, Upload, Brain
} from "lucide-react";
import { useStore } from "../store/useStore";
import { useAuthStore } from "../store/useAuthStore";
import { listLessonSummaries } from "../lib/lessons";

const MODALITY_COLOR = {
  visual: { bg: "bg-accent-pink/10", text: "text-accent-pinkLight", border: "border-accent-pink/20" },
  narrative: { bg: "bg-accent-amber/10", text: "text-accent-amber", border: "border-accent-amber/20" },
  kinesthetic: { bg: "bg-accent-violet/10", text: "text-accent-violetLight", border: "border-accent-violet/20" },
  sign: { bg: "bg-accent-mint/10", text: "text-accent-mint", border: "border-accent-mint/20" },
};

const SUBJECT_COLOR = {
  Physics: "text-accent-pink bg-accent-pink/10 border-accent-pink/20",
  Biology: "text-accent-mint bg-accent-mint/10 border-accent-mint/20",
  Chemistry: "text-accent-violet bg-accent-violet/10 border-accent-violet/20",
  Math: "text-accent-amber bg-accent-amber/10 border-accent-amber/20",
  "Custom Study": "text-accent-violetLight bg-accent-violet/10 border-accent-violet/20",
  General: "text-text-dim bg-white/5 border-white/10",
};

export default function Lessons() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const studentProfile = useStore((s) => s.studentProfile);
  const sessions = studentProfile?.sessions || [];
  const allLessons = listLessonSummaries();

  // Separate built-in from AI-generated
  const builtIn = allLessons.filter(l => !l.generated);
  const generated = allLessons.filter(l => l.generated);

  // Which lessons has this student completed?
  const completedIds = new Set(sessions.map(s => s.lessonId));

  const primaryModality = studentProfile?.primary;
  const modalityColors = primaryModality ? MODALITY_COLOR[primaryModality] : MODALITY_COLOR.visual;

  return (
    <div className="w-full max-w-6xl mx-auto pt-28 pb-20 px-6 md:px-16">

      {/* Header */}
      <div className="mb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {primaryModality ? (
            <div className={`inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.14em] border px-3 py-1 rounded-full uppercase mb-4 ${modalityColors.bg} ${modalityColors.text} ${modalityColors.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse-dot ${primaryModality === "sign" ? "bg-accent-mint" : primaryModality === "narrative" ? "bg-accent-amber" : primaryModality === "kinesthetic" ? "bg-accent-violetLight" : "bg-accent-pink"}`} />
              {primaryModality} learner · lessons adapted for you
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.14em] border px-3 py-1 rounded-full uppercase mb-4 text-text-faint bg-white/5 border-white/10">
              <Sparkles size={10} /> Your curriculum
            </div>
          )}

          <h1 className="font-display font-black text-4xl md:text-5xl text-text-primary mb-3">
            {user?.name ? `Hi ${user.name.split(" ")[0]},` : "Your Lessons"}
            {user?.name && <br />}
            {user?.name && <span>ready to learn?</span>}
          </h1>
          <p className="text-text-dim text-base max-w-xl">
            {primaryModality
              ? `Every lesson below will be delivered in ${primaryModality} format first — matching your cognitive fingerprint. You can always switch formats inside the lesson.`
              : "Complete onboarding to get a personalised cognitive fingerprint. Your lessons will then adapt automatically."}
          </p>
        </motion.div>
      </div>

      {/* Profile reminder if not onboarded */}
      {!primaryModality && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-5 rounded-2xl border border-accent-amber/30 bg-accent-amber/5 flex items-start gap-4">
          <Brain size={20} className="text-accent-amber flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-display font-bold text-sm text-text-primary mb-1">Your cognitive fingerprint isn't built yet</p>
            <p className="text-text-dim text-xs">Complete the 2-minute onboarding to unlock lessons that adapt to how you actually learn.</p>
          </div>
          <motion.button onClick={() => navigate("/onboarding")} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-amber to-[#e08000] text-dark-bg font-bold text-xs flex items-center gap-1.5 flex-shrink-0">
            Build Profile <ArrowRight size={13} />
          </motion.button>
        </motion.div>
      )}

      {/* Built-in lessons */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-xl text-text-primary">Core Curriculum</h2>
          <span className="font-mono text-[10px] text-text-faint uppercase tracking-wider">{builtIn.length} lessons available</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {builtIn.map((lesson, i) => {
            const done = completedIds.has(lesson.id);
            const subjectColor = SUBJECT_COLOR[lesson.subject] || SUBJECT_COLOR.General;
            return (
              <motion.div key={lesson.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/lesson/${lesson.id}`)}
                className="glass-panel rounded-2xl border border-white/8 hover:border-accent-pink/30 hover:shadow-[0_20px_50px_-15px_rgba(255,29,126,0.2)] transition-all duration-300 cursor-pointer group overflow-hidden"
              >
                <div className="p-6">
                  {/* Subject + done badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`font-mono text-[9.5px] font-bold uppercase tracking-wider border px-2.5 py-1 rounded-full ${subjectColor}`}>
                      {lesson.subject}
                    </span>
                    {done && (
                      <span className="flex items-center gap-1 font-mono text-[9px] text-accent-mint bg-accent-mint/10 border border-accent-mint/20 px-2 py-0.5 rounded-full uppercase">
                        <CheckCircle2 size={9} /> Completed
                      </span>
                    )}
                  </div>

                  <h3 className="font-display font-bold text-xl text-text-primary mb-2 group-hover:text-accent-pinkLight transition-colors">
                    {lesson.title}
                  </h3>

                  {/* Modality format badges */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {["visual","narrative","kinesthetic","sign"].map(m => (
                      <span key={m} className={`font-mono text-[9px] px-2 py-0.5 rounded-full border capitalize ${MODALITY_COLOR[m].bg} ${MODALITY_COLOR[m].text} ${MODALITY_COLOR[m].border} ${m === primaryModality ? "ring-1 ring-current font-bold" : ""}`}>
                        {m === primaryModality ? `★ ${m}` : m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA bar */}
                <div className="px-6 py-3.5 border-t border-white/6 bg-white/[0.015] flex items-center justify-between">
                  <span className="font-mono text-[10px] text-text-faint">
                    {done ? "Review or try a different format" : "Adaptive lesson · 4 formats"}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[10px] text-accent-pink font-bold group-hover:gap-2 transition-all">
                    {done ? "Review" : "Start"} <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* AI-generated lessons (from teacher uploads) */}
      {generated.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-bold text-xl text-text-primary">Your Uploaded Content</h2>
              <p className="text-text-faint text-xs font-mono mt-0.5">Generated by Gemini from uploaded PDFs</p>
            </div>
            <span className="font-mono text-[10px] text-text-faint uppercase tracking-wider">{generated.length} lesson{generated.length !== 1 ? "s" : ""}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generated.map((lesson, i) => (
              <motion.div key={lesson.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                whileHover={{ y: -3 }}
                onClick={() => navigate(`/lesson/${lesson.id}`)}
                className="glass-panel rounded-2xl border border-white/8 hover:border-accent-violet/30 transition-all duration-300 cursor-pointer group p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="font-mono text-[9px] text-accent-violet bg-accent-violet/10 border border-accent-violet/20 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                    <Sparkles size={9} /> AI generated
                  </span>
                </div>
                <h3 className="font-display font-bold text-base text-text-primary mb-1 group-hover:text-accent-violetLight transition-colors line-clamp-2">
                  {lesson.title}
                </h3>
                <p className="text-text-faint text-[11px] font-mono">{lesson.subject}</p>
                <div className="mt-3 flex items-center gap-1 font-mono text-[10px] text-accent-violet font-bold group-hover:gap-2 transition-all">
                  Open lesson <ArrowRight size={11} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Upload CTA for teachers */}
      {user?.role === "teacher" || user?.role === "admin" ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl border border-dashed border-accent-amber/30 bg-accent-amber/5 flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-start gap-4">
            <Upload size={22} className="text-accent-amber flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-display font-bold text-base text-text-primary">Add more lessons</p>
              <p className="text-text-dim text-sm mt-0.5">Upload a PDF, textbook chapter, or notes. Gemini will generate all 4 modalities automatically.</p>
            </div>
          </div>
          <motion.button onClick={() => navigate("/dashboard/content")} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent-amber to-[#e08000] text-dark-bg font-bold text-sm flex items-center gap-2 flex-shrink-0">
            <Upload size={15} /> Upload Content
          </motion.button>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="p-5 rounded-2xl border border-white/8 bg-white/[0.02] flex items-center justify-between gap-4 flex-wrap">
          <p className="text-text-faint text-sm font-mono">More lessons are added regularly by your teacher.</p>
          <Link to="/demo" className="font-mono text-[11px] text-accent-pink hover:underline flex items-center gap-1">
            Watch the live demo <ArrowRight size={11} />
          </Link>
        </motion.div>
      )}
    </div>
  );
}
