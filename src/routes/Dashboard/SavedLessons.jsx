import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Zap, Eye, Hand, Trash2, ExternalLink,
  Clock, FileText, CheckCircle, Circle, ChevronRight, Search
} from "lucide-react";
import { getGeneratedLessons, clearLessonCache } from "../../lib/lessons";

const MODALITY_META = {
  visual:    { label: "Visual",    icon: Eye,      color: "#4F8EF7" },
  narrative: { label: "Story",     icon: BookOpen,  color: "#EC4899" },
  shorter:   { label: "Shorter",   icon: Zap,       color: "#A78BFA" },
  sign:      { label: "Sign",      icon: Hand,      color: "#15CFA0" },
};

function deleteSavedLesson(id) {
  try {
    const key = "neuropath_generated_lessons";
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const lessons = JSON.parse(raw);
    delete lessons[id];
    localStorage.setItem(key, JSON.stringify(lessons));
  } catch {}
}

export default function SavedLessons() {
  const [lessons, setLessons] = useState([]);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const reload = () => {
    const saved = getGeneratedLessons();
    setLessons(Object.values(saved).sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0)));
  };

  useEffect(() => { reload(); }, []);

  const filtered = lessons.filter((l) =>
    l.title?.toLowerCase().includes(search.toLowerCase()) ||
    l.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id) => {
    setDeletingId(id);
    setTimeout(() => {
      deleteSavedLesson(id);
      setDeletingId(null);
      reload();
    }, 350);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-xl text-text-primary">Saved Lessons</h2>
          <p className="text-text-dim text-sm mt-1">
            Re-open any previously generated lesson and switch study modes without using any API quota.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-text-faint">
            {lessons.length} lesson{lessons.length !== 1 ? "s" : ""} saved
          </span>
        </div>
      </div>

      {/* Search */}
      {lessons.length > 0 && (
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint" />
          <input
            type="text"
            placeholder="Search by title or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-faint focus:outline-none focus:border-accent-blue/50 transition-colors"
          />
        </div>
      )}

      {/* Empty state */}
      {lessons.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <FileText size={28} className="text-text-faint" />
          </div>
          <h3 className="font-display font-semibold text-text-primary mb-2">No saved lessons yet</h3>
          <p className="text-text-dim text-sm max-w-sm">
            Upload a PDF or text file in the{" "}
            <Link to="/dashboard/content" className="text-accent-blue underline">Content Ingestion</Link>{" "}
            tab to generate your first lesson. It will appear here automatically.
          </p>
        </motion.div>
      )}

      {/* Lesson cards */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {filtered.map((lesson) => {
            const generatedModalities = Object.keys(lesson.modalities || {});
            const isDeleting = deletingId === lesson.id;

            return (
              <motion.div
                key={lesson.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: isDeleting ? 0 : 1, y: 0, scale: isDeleting ? 0.97 : 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.3 }}
                className="bg-surface-glass border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* Left: info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-mono text-[10px] text-accent-pink bg-accent-pink/10 border border-accent-pink/20 px-2.5 py-0.5 rounded-full uppercase">
                        {lesson.subject || "General"}
                      </span>
                      {lesson.generated && (
                        <span className="font-mono text-[10px] text-accent-mint bg-accent-mint/10 border border-accent-mint/20 px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                          <CheckCircle size={9} /> AI Generated
                        </span>
                      )}
                    </div>

                    <h3 className="font-display font-bold text-text-primary text-base mb-1 truncate">
                      {lesson.title}
                    </h3>

                    {lesson.description && (
                      <p className="text-text-dim text-xs leading-relaxed line-clamp-2 mb-3">
                        {lesson.description}
                      </p>
                    )}

                    {/* Modality pills */}
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(MODALITY_META).map(([key, meta]) => {
                        const isReady = generatedModalities.includes(key);
                        const Icon = meta.icon;
                        return (
                          <span
                            key={key}
                            className="flex items-center gap-1.5 font-mono text-[10px] px-2.5 py-1 rounded-full border transition-all"
                            style={{
                              background: isReady ? meta.color + "18" : "rgba(255,255,255,0.03)",
                              borderColor: isReady ? meta.color + "50" : "rgba(255,255,255,0.08)",
                              color: isReady ? meta.color : "rgba(255,255,255,0.25)",
                            }}
                          >
                            {isReady ? (
                              <CheckCircle size={9} />
                            ) : (
                              <Circle size={9} />
                            )}
                            {meta.label}
                          </span>
                        );
                      })}
                      <span className="flex items-center gap-1 font-mono text-[10px] text-text-faint">
                        <Clock size={9} />
                        {generatedModalities.length}/{Object.keys(MODALITY_META).length} modes cached
                      </span>
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleDelete(lesson.id)}
                      className="p-2 rounded-lg text-text-faint hover:text-accent-pink hover:bg-accent-pink/10 border border-transparent hover:border-accent-pink/20 transition-all cursor-pointer"
                      title="Delete saved lesson"
                    >
                      <Trash2 size={15} />
                    </button>
                    <Link
                      to={`/lesson/${lesson.id}`}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-blue/15 border border-accent-blue/30 text-accent-blue font-mono text-xs uppercase hover:bg-accent-blue/25 hover:border-accent-blue/60 transition-all group/btn"
                    >
                      Open Lesson
                      <ChevronRight size={13} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* Inline tip if some modalities already cached */}
                {generatedModalities.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/5 text-[11px] text-text-faint font-mono">
                    ✓ {generatedModalities.length} mode{generatedModalities.length > 1 ? "s" : ""} already cached —
                    switching to {generatedModalities.map((m) => MODALITY_META[m]?.label || m).join(", ")} costs zero API calls.
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* No search results */}
      {lessons.length > 0 && filtered.length === 0 && (
        <div className="text-center py-12 text-text-faint text-sm">
          No lessons match "{search}"
        </div>
      )}
    </div>
  );
}
