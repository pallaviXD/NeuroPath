import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Sparkles, AlertCircle, ExternalLink, RefreshCw, Loader } from "lucide-react";
import { generateLessonFoundation, isAgentConfigured } from "../../lib/neuropath-agent";
import { saveGeneratedLesson, getGeneratedLessons } from "../../lib/lessons";

// Import custom uploader, extractor, processor and score
import PDFLessonUploader from "../../components/upload/PDFLessonUploader";
import { extractTextFromPDF } from "../../lib/pdf/pdfExtractor";
import { cleanText } from "../../lib/pdf/textProcessor";
import AccessibilityScore from "../../components/upload/AccessibilityScore";

export default function ContentManager() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusLine, setStatusLine] = useState("");
  const [error, setError] = useState(null);
  const [generatedLesson, setGeneratedLesson] = useState(null);
  const [retryInfo, setRetryInfo] = useState(null); // { secsLeft }
  const [extractedText, setExtractedText] = useState("");

  const agentReady = isAgentConfigured();

  const handleFileLoaded = (loadedFile) => {
    setFile(loadedFile);
    setGeneratedLesson(null);
    setError(null);
    setExtractedText("");
  };

  const handleReset = () => {
    setFile(null);
    setGeneratedLesson(null);
    setError(null);
    setExtractedText("");
  };

  const processContent = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(5);
    setStatusLine("Extracting content...");
    setError(null);
    setGeneratedLesson(null);
    setRetryInfo(null);

    const onStatus = (msg, isRetry = false) => {
      setStatusLine(msg);
      if (isRetry) {
        const match = msg.match(/(\d+)s/);
        if (match) setRetryInfo({ secsLeft: parseInt(match[1]) });
      } else {
        setRetryInfo(null);
      }
    };

    // 45-second timeout guard
    const timeoutId = setTimeout(() => {
      setError("Request timed out after 45s. The file may be too large or the API is unresponsive. Try a smaller file or wait a moment.");
      setStatusLine("");
      setIsProcessing(false);
    }, 45000);

    try {
      // 1. LIGHTNING DEMO CACHE
      const savedLessons = Object.values(getGeneratedLessons());
      const cachedLesson = savedLessons.find(l => l.title === file.name);
      const instantLoadLesson = savedLessons.find(l => 
        l.title?.toLowerCase() === file.name.replace(/\.[^/.]+$/, "").toLowerCase() ||
        l.id === file.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      );

      const hitLesson = cachedLesson || instantLoadLesson;
      if (hitLesson) {
        setProgress(100);
        setStatusLine("Lightning Cache hit! Instant load successful.");
        setGeneratedLesson(hitLesson);
        setExtractedText(hitLesson.originalText || "Cache hit content.");
        setIsProcessing(false);
        clearTimeout(timeoutId);
        return;
      }

      // 2. PARSE TEXT CLIENT-SIDE
      setStatusLine("Parsing text from file...");
      setProgress(15);
      let text = "";
      if (file.name.toLowerCase().endsWith(".pdf")) {
        text = await extractTextFromPDF(file, (p) => {
          setProgress(15 + Math.round(p * 0.2)); // map 0-100% to 15-35%
        });
      } else {
        text = await file.text();
      }

      const cleaned = cleanText(text);
      setExtractedText(cleaned);
      setProgress(40);
      setStatusLine("Extracting concepts & generating quiz via Gemini...");

      // 3. INVOKE AGENT INGESTION
      const foundation = await generateLessonFoundation(cleaned, file.name, onStatus);

      clearTimeout(timeoutId);
      setProgress(90);
      setStatusLine("Saving adaptive lesson...");
      saveGeneratedLesson(foundation);
      setGeneratedLesson(foundation);
      setProgress(100);
      setStatusLine("Done! Ingestion complete.");

    } catch (err) {
      clearTimeout(timeoutId);
      setError(err.message || "Failed to generate lesson.");
      setStatusLine("");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="bg-surface-glass border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-xl text-text-primary">Ingest New Content</h2>
          <span className={`font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border ${
            agentReady
              ? "text-accent-mint border-accent-mint/30 bg-accent-mint/10"
              : "text-accent-amber border-accent-amber/30 bg-accent-amber/10"
          }`}>
            {agentReady ? "Gemini Agent Live" : "API Key Required"}
          </span>
        </div>

        <p className="text-text-dim text-sm mb-4 max-w-2xl font-sans">
          Upload a syllabus chapter or reading assignment (.txt / .md / .pdf). NeuroPath parses the content and can translate the{" "}
          <strong className="text-accent-mint font-semibold">full summarized syllabus into word-by-word 3D SgSL signs</strong> for Deaf/HoH learners — plus visual, narrative, and kinesthetic formats.
        </p>

        {!agentReady && (
          <div className="mb-6 p-4 rounded-xl border border-accent-amber/30 bg-accent-amber/5 flex items-start gap-3">
            <AlertCircle className="text-accent-amber shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-text-dim font-sans">
              <p className="text-text-primary font-medium mb-1">Configure Gemini to enable ingestion</p>
              <p>Add <code className="text-accent-amber">VITE_GEMINI_API_KEY</code> to a <code>.env</code> file (see <code>.env.example</code>) and restart the dev server.</p>
            </div>
          </div>
        )}

        {/* Drag-and-Drop Ingestion Zone */}
        <PDFLessonUploader
          onFileLoaded={handleFileLoaded}
          isProcessing={isProcessing}
          progress={progress}
          statusLine={statusLine}
          error={error}
          generatedLesson={generatedLesson}
          onReset={handleReset}
        />

        {/* Trigger Button if File Selected */}
        {file && !isProcessing && !generatedLesson && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={processContent}
              disabled={!agentReady}
              className={`px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
                !agentReady
                  ? "bg-white/5 text-text-dim cursor-not-allowed border border-white/5"
                  : "bg-accent-blue text-black hover:bg-accent-blue/90 shadow-[0_0_15px_rgba(59,130,246,0.25)] border border-accent-blue/30"
              }`}
            >
              Start AI Ingestion
            </button>
          </div>
        )}

        {/* Cooldown message if active */}
        {isProcessing && retryInfo && (
          <div className="mt-4 p-3 rounded-lg border border-accent-amber/30 bg-accent-amber/5 text-xs text-accent-amber font-mono flex items-center gap-2 animate-pulse">
            <RefreshCw size={12} className="animate-spin" />
            Free tier rate limit cooldown active. Retrying automatically in {retryInfo.secsLeft}s...
          </div>
        )}

        {/* Success Output */}
        {generatedLesson && (
          <div className="mt-6 p-5 rounded-xl border border-accent-mint/30 bg-accent-mint/5 space-y-4 transition-all">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-accent-mint" size={20} />
              <div>
                <p className="text-sm font-semibold text-text-primary">{generatedLesson.title}</p>
                <p className="text-xs text-text-dim">
                  {generatedLesson.subject} · Direct SgSL Sign Study + 3 modalities ready
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to={`/lesson/${generatedLesson.id}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent-mint text-black font-mono text-xs uppercase tracking-wider hover:bg-accent-mint/90 transition-colors"
              >
                <Sparkles size={14} />
                Open Adaptive Lesson
                <ExternalLink size={12} />
              </Link>
              <Link
                to="/dashboard/saved"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-text-dim font-mono text-xs uppercase tracking-wider hover:bg-white/10 transition-colors"
              >
                Curriculum List →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Render Real-Time Accessibility Score card once parsed */}
      {extractedText && (
        <AccessibilityScore text={extractedText} />
      )}
    </div>
  );
}
