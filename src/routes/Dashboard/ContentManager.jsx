import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Upload, FileText, Loader, CheckCircle, Sparkles, AlertCircle, ExternalLink, RefreshCw } from "lucide-react";
import { generateLessonFoundation, isAgentConfigured, generateVisualMode, generateShorterMode, generateStoryMode, generateFullSignStudy } from "../../lib/neuropath-agent";
import { saveGeneratedLesson, getGeneratedLessons } from "../../lib/lessons";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

async function readPdfText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(" ");
    text += pageText + "\n";
  }
  return text;
}

async function readFileText(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) {
    return readPdfText(file);
  }
  return file.text();
}

export default function ContentManager() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusLine, setStatusLine] = useState("");
  const [error, setError] = useState(null);
  const [generatedLesson, setGeneratedLesson] = useState(null);
  const [retryInfo, setRetryInfo] = useState(null); // { delayMs, attempt, max }

  const agentReady = isAgentConfigured();

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setGeneratedLesson(null);
      setError(null);
    }
  };

  const processContent = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(10);
    setStatusLine("Reading uploaded content...");
    setError(null);
    setGeneratedLesson(null);
    setRetryInfo(null);

    // Simple status callback — no module mutation needed
    const onStatus = (msg, isRetry = false) => {
      setStatusLine(msg);
      if (isRetry) {
        // Parse countdown from message like "retrying in 10s"
        const match = msg.match(/(\d+)s/);
        if (match) setRetryInfo({ secsLeft: parseInt(match[1]) });
      } else {
        setRetryInfo(null);
      }
    };

    // 45-second timeout guard
    const timeoutId = setTimeout(() => {
      setError("Request timed out after 45s. The PDF may be too large or the API is unresponsive. Try a smaller file or wait a moment.");
      setStatusLine("");
      setIsProcessing(false);
    }, 45000);

    try {
      // 1. LIGHTNING DEMO CACHE
      // If the user uploads a PDF that they have already generated in the past,
      // load it instantly from the local cache instead of hitting the slow AI API.
      const savedLessons = Object.values(getGeneratedLessons());
      const cachedLesson = savedLessons.find(l => l.title === file.name);
      // Fallback check if filename is somehow close to title
      const instantLoadLesson = savedLessons.find(l => 
        l.title?.toLowerCase() === file.name.replace(/\.[^/.]+$/, "").toLowerCase() ||
        l.id === file.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      );

      const hitLesson = cachedLesson || instantLoadLesson;
      if (hitLesson) {
        setProgress(100);
        setStatusLine("Lightning Cache hit! Instant load successful.");
        setGeneratedLesson(hitLesson);
        setIsProcessing(false);
        clearTimeout(timeoutId);
        return;
      }

      const text = await readFileText(file);
      setProgress(35);
      setStatusLine("Extracting concepts & generating quiz...");

      const foundation = await generateLessonFoundation(text, file.name, onStatus);

      clearTimeout(timeoutId);
      setProgress(90);
      setStatusLine("Saving lesson...");
      saveGeneratedLesson(foundation);
      setGeneratedLesson(foundation);
      setProgress(100);
      setStatusLine("Done! Lesson ready.");

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

        <p className="text-text-dim text-sm mb-4 max-w-2xl">
          Upload a syllabus chapter or reading assignment (.txt / .md / .pdf). NeuroPath parses the content and can translate the{" "}
          <strong className="text-accent-mint">full summarized syllabus into word-by-word 3D SgSL signs</strong> for Deaf/HoH learners — plus visual, narrative, and kinesthetic formats.
        </p>

        {!agentReady && (
          <div className="mb-6 p-4 rounded-xl border border-accent-amber/30 bg-accent-amber/5 flex items-start gap-3">
            <AlertCircle className="text-accent-amber shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-text-dim">
              <p className="text-text-primary font-medium mb-1">Configure Gemini to enable ingestion</p>
              <p>Add <code className="text-accent-amber">VITE_GEMINI_API_KEY</code> to a <code>.env</code> file (see <code>.env.example</code>) and restart the dev server.</p>
            </div>
          </div>
        )}

        <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center bg-black/20 hover:bg-black/40 transition-colors">
          <input
            type="file"
            id="file-upload"
            accept=".pdf,.txt,.md"
            className="hidden"
            onChange={handleFileUpload}
          />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-accent-blue/10 flex items-center justify-center mb-4 border border-accent-blue/20 group-hover:scale-105 transition-transform">
              <Upload className="text-accent-blue" size={28} />
            </div>
            <span className="text-text-primary font-medium mb-1">Click to upload or drag and drop</span>
            <span className="text-text-faint text-xs">TXT or MD recommended (max 10MB)</span>
          </label>
        </div>

        {file && (
          <div className="mt-6 p-4 rounded-xl border border-white/5 bg-black/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent-purple/10 rounded-lg">
                <FileText className="text-accent-purple" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">{file.name}</p>
                <p className="text-xs text-text-dim">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button
              onClick={processContent}
              disabled={isProcessing || !agentReady}
              className={`px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-all ${
                isProcessing || !agentReady
                  ? "bg-white/5 text-text-dim cursor-not-allowed"
                  : "bg-accent-blue text-black hover:bg-accent-blue/90 shadow-[0_0_15px_var(--blue)]"
              }`}
            >
              {isProcessing ? "Processing..." : "Generate Lesson"}
            </button>
          </div>
        )}

        {isProcessing && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs text-text-dim font-mono">
              <span className="flex items-center gap-2">
                {retryInfo ? (
                  <RefreshCw size={12} className="animate-spin text-accent-amber" />
                ) : (
                  <Loader size={12} className="animate-spin text-accent-pink" />
                )}
                {statusLine || "Generating modalities via Gemini..."}
              </span>
              <span>{progress}%</span>
            </div>
            {retryInfo && (
              <div className="p-3 rounded-lg border border-accent-amber/30 bg-accent-amber/5 text-xs text-accent-amber font-mono flex items-center gap-2">
                <RefreshCw size={12} className="animate-spin" />
                Free tier quota hit. Waiting for cooldown then retrying automatically — no action needed.
              </div>
            )}
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ease-out shadow-[0_0_10px_var(--pink)] ${retryInfo ? "bg-accent-amber" : "bg-accent-pink"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 rounded-xl border border-accent-pink/30 bg-accent-pink/5 flex items-start gap-3">
            <AlertCircle className="text-accent-pink shrink-0" size={18} />
            <span className="text-sm text-text-dim">{error}</span>
          </div>
        )}

        {generatedLesson && (
          <div className="mt-6 p-5 rounded-xl border border-accent-mint/30 bg-accent-mint/5 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-accent-mint" size={20} />
              <div>
                <p className="text-sm font-semibold text-text-primary">{generatedLesson.title}</p>
                <p className="text-xs text-text-dim">{generatedLesson.subject} · Sign study + 3 modalities · micro-check + assessment</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                <span className="font-mono text-text-faint uppercase tracking-wider block mb-1">On-Demand Architecture</span>
                <p className="text-text-dim">Choose <strong className="text-accent-mint">3D Sign Language Study</strong> in the lesson to generate every word as a 3D hand sign from your uploaded notes.</p>
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
                View in Saved Lessons →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
