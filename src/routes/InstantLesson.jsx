import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, X, Sparkles, Brain, Zap, Hand, BookOpen,
  Eye, ArrowRight, Check, AlertTriangle, RotateCcw, Play,
  ChevronRight, Loader2, Download, ExternalLink
} from "lucide-react";
import {
  generateLessonFoundation, generateStoryMode, generateShorterMode,
  generateVisualMode, generateFullSignStudy, isAgentConfigured
} from "../lib/neuropath-agent";
import { extractTextFromPDF } from "../lib/pdf/pdfExtractor";
import { cleanText } from "../lib/pdf/textProcessor";
import { saveGeneratedLesson } from "../lib/lessons";
import { useStore } from "../store/useStore";
import SignStudyPlayer from "../components/SignStudyPlayer";
import WikiImageFetcher from "../components/WikiImageFetcher";

/* ── Animated status line ── */
function StatusLine({ text }) {
  return (
    <motion.p key={text} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }} className="font-mono text-sm text-accent-violet text-center">
      {text}
    </motion.p>
  );
}

/* ── Drop zone ── */
function DropZone({ onFile, disabled }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();

  const handle = useCallback((file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["pdf", "txt", "md"].includes(ext)) { alert("Upload a PDF, TXT, or MD file."); return; }
    onFile(file);
  }, [onFile]);

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`relative cursor-pointer rounded-3xl border-2 border-dashed p-16 text-center transition-all duration-300 overflow-hidden group
        ${drag ? "border-accent-pink bg-accent-pink/8 scale-[0.99]" : "border-white/15 bg-white/[0.02] hover:border-accent-pink/40 hover:bg-accent-pink/5"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input ref={inputRef} type="file" accept=".pdf,.txt,.md" className="hidden"
        onChange={e => handle(e.target.files?.[0])} />

      {/* Animated orb */}
      <motion.div className="absolute inset-0 pointer-events-none"
        animate={{ opacity: drag ? 1 : 0 }}
        style={{ background: "radial-gradient(circle at 50% 50%, rgba(255,29,126,0.12) 0%, transparent 65%)" }} />

      <motion.div animate={{ y: drag ? -6 : 0, scale: drag ? 1.1 : 1 }}
        className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent-pink/20 to-accent-violet/15 border border-accent-pink/30 flex items-center justify-center mx-auto mb-5">
        <Upload size={32} className="text-accent-pink" />
      </motion.div>

      <h3 className="font-display font-black text-2xl text-text-primary mb-2">
        Drop your PDF here
      </h3>
      <p className="text-text-dim text-sm mb-1">or click to browse · PDF, TXT, MD</p>
      <p className="font-mono text-[10px] text-text-faint">
        Gemini reads it · generates visual, story, hands-on, and signed versions instantly
      </p>

      {/* Format badges */}
      <div className="flex flex-wrap justify-center gap-2 mt-6">
        {[
          { icon: "📊", label: "Visual", color: "#FF1D7E" },
          { icon: "📖", label: "Story", color: "#FFB347" },
          { icon: "🧪", label: "Hands-on", color: "#7B2FF7" },
          { icon: "🤟", label: "Sign Language", color: "#15CFA0" },
        ].map(b => (
          <span key={b.label} className="flex items-center gap-1.5 font-mono text-[10px] px-3 py-1.5 rounded-full border"
            style={{ borderColor: `${b.color}30`, backgroundColor: `${b.color}10`, color: b.color }}>
            {b.icon} {b.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Progress stepper ── */
const STEPS = [
  { id: "extract", label: "Reading file", icon: FileText },
  { id: "gemini", label: "AI processing", icon: Brain },
  { id: "modalities", label: "Generating formats", icon: Sparkles },
  { id: "done", label: "Ready!", icon: Check },
];

function ProgressStepper({ current }) {
  const idx = STEPS.findIndex(s => s.id === current);
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={s.id} className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <motion.div
                animate={{ scale: active ? [1, 1.15, 1] : 1 }}
                transition={{ duration: 1, repeat: active ? Infinity : 0 }}
                className={`w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-all ${
                  done ? "border-accent-mint bg-accent-mint text-dark-bg" :
                  active ? "border-accent-pink bg-accent-pink/20 text-accent-pink shadow-[0_0_16px_rgba(255,29,126,0.4)]" :
                  "border-white/10 text-text-faint"
                }`}>
                {done ? <Check size={14} /> : <Icon size={14} />}
              </motion.div>
              <span className={`font-mono text-[8px] uppercase tracking-wider ${active ? "text-accent-pink" : done ? "text-accent-mint" : "text-text-faint"}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-8 h-px mt-[-14px]">
                <motion.div className="h-full bg-gradient-to-r from-accent-mint to-accent-pink"
                  animate={{ scaleX: done ? 1 : 0 }} style={{ transformOrigin: "left" }}
                  transition={{ duration: 0.4 }} />
                <div className="h-full bg-white/8 -mt-px" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Modality tab content ── */
function ModalityContent({ modality, lesson, generating }) {
  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}>
          <Loader2 size={32} className="text-accent-violet" />
        </motion.div>
        <p className="font-mono text-sm text-accent-violet">Generating {modality} format...</p>
      </div>
    );
  }

  const data = lesson?.modalities?.[modality];
  if (!data) return (
    <div className="py-16 text-center text-text-faint font-mono text-xs">
      Click the tab to generate this format.
    </div>
  );

  if (modality === "narrative") {
    return (
      <div className="space-y-4">
        <h3 className="font-display font-bold text-xl text-text-primary">{data.storyTitle}</h3>
        <div className="text-text-dim text-[15px] leading-relaxed whitespace-pre-line bg-white/[0.02] border border-white/8 rounded-2xl p-5 italic">
          {data.content}
        </div>
      </div>
    );
  }

  if (modality === "shorter") {
    return (
      <div className="text-text-dim text-[15px] leading-relaxed whitespace-pre-line bg-white/[0.02] border border-white/8 rounded-2xl p-5">
        {data.content}
      </div>
    );
  }

  if (modality === "visual") {
    return (
      <div className="space-y-5">
        <p className="text-text-dim text-[15px] leading-relaxed">{data.content}</p>
        {data.wikiTopic && <WikiImageFetcher topic={data.wikiTopic} searchQuery={data.searchQuery} />}
        {data.videos?.length > 0 && (
          <div className="space-y-2">
            <div className="font-mono text-[10px] text-text-faint uppercase tracking-wider mb-3 flex items-center gap-2">
              <Play size={10} /> Video resources
            </div>
            {data.videos.map((v, i) => (
              <a key={i} href={`https://www.youtube.com/results?search_query=${encodeURIComponent(v.searchQuery || v.title)}`}
                target="_blank" rel="noreferrer"
                className="flex items-center justify-between p-3.5 rounded-xl border border-white/8 bg-white/[0.02] hover:border-accent-pink/30 hover:bg-accent-pink/5 transition-all group">
                <div>
                  <div className="font-semibold text-sm text-text-primary group-hover:text-accent-pinkLight transition-colors">{v.title}</div>
                  <div className="font-mono text-[10px] text-text-faint mt-0.5">{v.channel} · {v.duration}</div>
                </div>
                <ExternalLink size={14} className="text-text-faint group-hover:text-accent-pink transition-colors" />
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (modality === "sign") {
    return (
      <div className="space-y-4">
        {data.summaryGloss && (
          <p className="font-mono text-[11px] text-accent-mint text-center uppercase tracking-wider">{data.summaryGloss}</p>
        )}
        <SignStudyPlayer signData={data} signSystem={data.signSystem || "SgSL"} />
        <p className="text-[11px] text-text-faint font-mono text-center">
          Full syllabus → signed word-by-word. No reading required.
        </p>
      </div>
    );
  }

  return null;
}

/* ── Main component ── */
const TABS = [
  { id: "visual",    icon: "📊", label: "Visual",      color: "#FF1D7E" },
  { id: "narrative", icon: "📖", label: "Story",        color: "#FFB347" },
  { id: "shorter",   icon: "⚡", label: "Concise",      color: "#7B2FF7" },
  { id: "sign",      icon: "🤟", label: "Sign Language", color: "#15CFA0" },
];

export default function InstantLesson() {
  const navigate = useNavigate();
  const studentProfile = useStore(s => s.studentProfile);

  const [file, setFile] = useState(null);
  const [phase, setPhase] = useState("idle"); // idle | processing | lesson
  const [stepId, setStepId] = useState("extract");
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [activeTab, setActiveTab] = useState("visual");
  const [generatingTab, setGeneratingTab] = useState(null);
  const [progress, setProgress] = useState(0);

  const status = (msg, step) => {
    setStatusText(msg);
    if (step) setStepId(step);
  };

  const processFile = async (f) => {
    setFile(f);
    setPhase("processing");
    setError(null);
    setLesson(null);
    setProgress(0);

    try {
      // 1. Extract text
      status("Reading your file...", "extract");
      let text = "";
      if (f.name.toLowerCase().endsWith(".pdf")) {
        text = await extractTextFromPDF(f, p => setProgress(Math.round(p * 30)));
      } else {
        text = await f.text();
      }
      const cleaned = cleanText(text);
      if (!cleaned?.trim()) throw new Error("Could not extract text from this file. Try a text-based PDF.");
      setProgress(35);

      // 2. Gemini foundation
      status("Gemini is analysing your content...", "gemini");
      const onStatus = (msg) => setStatusText(msg);
      const foundation = await generateLessonFoundation(cleaned, f.name, onStatus);
      setProgress(60);

      // 3. Generate all 4 modalities in parallel
      status("Generating all 4 learning formats simultaneously...", "modalities");
      const [visual, narrative, shorter, sign] = await Promise.allSettled([
        generateVisualMode(foundation),
        generateStoryMode(foundation),
        generateShorterMode(foundation),
        generateFullSignStudy(foundation),
      ]);

      foundation.modalities = {
        visual:    visual.status === "fulfilled"    ? visual.value    : { content: foundation.description, wikiTopic: foundation.title, videos: [] },
        narrative: narrative.status === "fulfilled" ? narrative.value : { storyTitle: `Story: ${foundation.title}`, content: foundation.description },
        shorter:   shorter.status === "fulfilled"   ? shorter.value   : { content: foundation.description },
        sign:      sign.status === "fulfilled"      ? sign.value      : null,
      };

      setProgress(95);
      status("All formats ready!", "done");
      saveGeneratedLesson(foundation);
      setLesson(foundation);
      setProgress(100);

      // Auto-select the student's preferred modality
      const preferred = studentProfile?.deafOrHoh ? "sign" : (studentProfile?.primary === "narrative" ? "narrative" : studentProfile?.primary === "kinesthetic" ? "shorter" : "visual");
      setActiveTab(preferred || "visual");

      setTimeout(() => setPhase("lesson"), 400);
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setPhase("idle");
    }
  };

  const reset = () => {
    setFile(null); setPhase("idle"); setLesson(null);
    setError(null); setStatusText(""); setProgress(0); setStepId("extract");
  };

  return (
    <div className="w-full min-h-screen bg-dark-bg relative overflow-hidden">
      {/* BG orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div className="absolute -top-48 -left-48 w-[700px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,29,126,0.1) 0%, transparent 65%)" }}
          animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 12, repeat: Infinity }} />
        <motion.div className="absolute top-1/2 -right-48 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(123,47,247,0.1) 0%, transparent 65%)" }}
          animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 14, repeat: Infinity, delay: 4 }} />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto pt-28 pb-24 px-6 md:px-12">

        <AnimatePresence mode="wait">

          {/* ══ IDLE — upload screen ══ */}
          {phase === "idle" && (
            <motion.div key="idle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {/* Header */}
              <div className="text-center mb-10">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
                  className="inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest text-accent-pinkLight bg-accent-pink/10 border border-accent-pink/25 px-4 py-1.5 rounded-full uppercase mb-5">
                  <Sparkles size={10} /> Instant AI Lesson Generator
                </motion.div>
                <h1 className="font-display font-black text-5xl md:text-6xl text-text-primary leading-tight mb-4">
                  Drop a PDF.<br />
                  <span className="gradient-text-shift">Get a full lesson.</span>
                </h1>
                <p className="text-text-dim text-lg max-w-2xl mx-auto">
                  Upload any notes, textbook chapter, or study material. Gemini reads it and instantly generates 4 completely different versions — visual diagrams, a story analogy, a concise summary, and a full sign-language walkthrough.
                </p>
                {!isAgentConfigured() && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                    className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] text-accent-amber bg-accent-amber/10 border border-accent-amber/25 px-4 py-2 rounded-full">
                    <AlertTriangle size={11} /> No API key — AI will use smart offline fallback
                  </motion.div>
                )}
              </div>

              {/* Drop zone */}
              <DropZone onFile={processFile} disabled={false} />

              {/* Error */}
              {error && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-5 p-4 rounded-2xl border border-accent-pink/30 bg-accent-pink/8 flex items-start gap-3">
                  <AlertTriangle size={16} className="text-accent-pink flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-text-dim">{error}</p>
                </motion.div>
              )}

              {/* Tiny hint */}
              <p className="text-center font-mono text-[10px] text-text-faint mt-6">
                Works with any subject · textbooks · lecture notes · research papers · study guides
              </p>
            </motion.div>
          )}

          {/* ══ PROCESSING ══ */}
          {phase === "processing" && (
            <motion.div key="processing" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] gap-8">

              {/* Spinning rings */}
              <div className="relative w-32 h-32">
                <motion.div className="absolute inset-0 rounded-full border-4 border-accent-pink/20"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
                <motion.div className="absolute inset-0 rounded-full border-4 border-accent-pink border-t-transparent"
                  animate={{ rotate: 360 }} transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }} />
                <motion.div className="absolute inset-3 rounded-full border-2 border-accent-violet border-b-transparent"
                  animate={{ rotate: -360 }} transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }} />
                <motion.div className="absolute inset-6 rounded-full border-2 border-accent-mint border-l-transparent"
                  animate={{ rotate: 360 }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain size={28} className="text-accent-pink" />
                </div>
              </div>

              <div className="text-center">
                <h3 className="font-display font-black text-3xl text-text-primary mb-3">
                  Reading <span className="text-accent-pinkLight">"{file?.name}"</span>
                </h3>
                <ProgressStepper current={stepId} />
                <AnimatePresence mode="wait">
                  <StatusLine key={statusText} text={statusText} />
                </AnimatePresence>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-md">
                <div className="flex justify-between font-mono text-[10px] text-text-faint mb-2">
                  <span>Processing</span><span>{progress}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-accent-pink via-accent-violet to-accent-mint rounded-full"
                    animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: "easeOut" }} />
                </div>
              </div>

              <p className="font-mono text-[10px] text-text-faint text-center">
                Generating visual · story · concise · sign language simultaneously...
              </p>
            </motion.div>
          )}

          {/* ══ LESSON ══ */}
          {phase === "lesson" && lesson && (
            <motion.div key="lesson" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

              {/* Lesson header */}
              <div className="mb-8">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}
                        className="flex items-center gap-1.5 font-mono text-[9px] text-accent-mint bg-accent-mint/10 border border-accent-mint/20 px-3 py-1 rounded-full uppercase font-bold">
                        <Check size={9} /> 4 formats generated
                      </motion.div>
                      <span className="font-mono text-[9px] text-accent-violet bg-accent-violet/10 border border-accent-violet/20 px-3 py-1 rounded-full uppercase">
                        {lesson.subject}
                      </span>
                    </div>
                    <h1 className="font-display font-black text-3xl md:text-4xl text-text-primary leading-tight">
                      {lesson.title}
                    </h1>
                    <p className="text-text-dim text-sm mt-2 max-w-2xl">{lesson.description}</p>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <motion.button onClick={() => navigate(`/lesson/${lesson.id}`)}
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-violet to-accent-mint text-dark-bg font-bold text-sm flex items-center gap-2 shadow-[0_6px_20px_rgba(123,47,247,0.35)]">
                      <Zap size={14} /> Open full lesson
                    </motion.button>
                    <motion.button onClick={reset} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      className="px-4 py-2.5 rounded-xl border border-white/12 text-text-dim hover:text-text-primary bg-white/[0.03] text-sm flex items-center gap-2 transition-all">
                      <RotateCcw size={13} /> Upload another
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Modality tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {TABS.map(tab => {
                  const isActive = activeTab === tab.id;
                  const hasData = !!lesson.modalities?.[tab.id];
                  return (
                    <motion.button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider border transition-all ${
                        isActive
                          ? "border-2 text-white shadow-lg"
                          : "border-white/10 text-text-faint hover:text-text-dim hover:border-white/20 bg-white/[0.02]"
                      }`}
                      style={isActive ? { borderColor: tab.color, backgroundColor: `${tab.color}18`, color: tab.color, boxShadow: `0 0 20px ${tab.color}40` } : {}}>
                      <span className="text-base">{tab.icon}</span>
                      {tab.label}
                      {!hasData && !isActive && <span className="text-[8px] opacity-50">(tap to load)</span>}
                    </motion.button>
                  );
                })}
              </div>

              {/* Tab content */}
              <div className="glass-panel rounded-3xl border border-white/10 p-6 md:p-8 min-h-[320px]">
                <AnimatePresence mode="wait">
                  <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                    <ModalityContent modality={activeTab} lesson={lesson} generating={generatingTab === activeTab} />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Quiz section */}
              {lesson.microCheck && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="mt-6 glass-panel rounded-3xl border border-white/10 p-6">
                  <QuickCheck microCheck={lesson.microCheck} />
                </motion.div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Quick inline check ── */
function QuickCheck({ microCheck }) {
  const [selected, setSelected] = useState(null);
  const correct = selected === microCheck.answerIndex;
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-accent-pink/15 border border-accent-pink/25 flex items-center justify-center">
          <Zap size={14} className="text-accent-pink" />
        </div>
        <div>
          <div className="font-mono text-[9px] text-text-faint uppercase tracking-wider">Quick check</div>
          <div className="font-display font-bold text-sm text-text-primary">{microCheck.question}</div>
        </div>
      </div>
      <div className="space-y-2">
        {microCheck.options.map((opt, i) => (
          <motion.button key={i} onClick={() => !selected && setSelected(i)}
            whileHover={{ x: selected ? 0 : 4 }} whileTap={{ scale: 0.99 }}
            disabled={selected !== null}
            className={`w-full p-4 rounded-xl border text-left text-sm transition-all ${
              selected === null ? "border-white/8 bg-white/[0.02] text-text-dim hover:border-white/20 hover:text-text-primary cursor-pointer" :
              i === microCheck.answerIndex ? "border-accent-mint bg-accent-mint/10 text-accent-mint" :
              selected === i ? "border-accent-pink bg-accent-pink/10 text-accent-pink" :
              "border-white/5 bg-white/[0.01] text-text-faint"
            }`}>
            {opt}
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {selected !== null && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-4 rounded-xl border text-sm ${correct ? "border-accent-mint/30 bg-accent-mint/8 text-accent-mint" : "border-accent-pink/30 bg-accent-pink/8 text-accent-pink"}`}>
            {correct ? <><strong>Correct!</strong> {microCheck.explanation}</> : <><strong>Not quite.</strong> Try the lesson in a different format — visual, story, or sign.</>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
