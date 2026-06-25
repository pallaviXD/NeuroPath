import React, { useState, useEffect } from "react";
import { generateSimplifiedText, generateAccessibilityText } from "../../lib/neuropath-agent";
import { SVGSignPlayer } from "../../features/sign-language/SVGSignRenderer";
import { Sparkles, Loader, FileText, CheckCircle, List, MessageSquare, Hand, Volume2, VolumeX } from "lucide-react";
import { speakText, stopSpeaking } from "../../lib/speech/speechEngine";

export default function AccessibilityLessonView({ lesson, onAdaptation }) {
  const [activeTab, setActiveTab] = useState("simplified"); // simplified | accessible | sign
  const [simplifiedContent, setSimplifiedContent] = useState("");
  const [accessibleContent, setAccessibleContent] = useState("");
  const [loadingSimplified, setLoadingSimplified] = useState(false);
  const [loadingAccessible, setLoadingAccessible] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Extract vocabulary tokens from lesson
  const signSequence = lesson.modalities?.sign?.fullSequence || lesson.gloss || [];

  // Stop speaking on unmount or tab/lesson change
  useEffect(() => {
    return () => {
      stopSpeaking();
      setIsSpeaking(false);
    };
  }, [activeTab, lesson]);

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = activeTab === "simplified" ? simplifiedContent : accessibleContent;
    if (!textToSpeak) return;

    speakText(
      textToSpeak,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  // Generate Simplified content
  useEffect(() => {
    if (activeTab === "simplified" && !simplifiedContent) {
      setLoadingSimplified(true);
      if (onAdaptation) onAdaptation("Generated simplified language structure");
      
      generateSimplifiedText(lesson)
        .then((res) => {
          setSimplifiedContent(res.content);
          setLoadingSimplified(false);
        })
        .catch(() => {
          setSimplifiedContent(lesson.description || lesson.originalText);
          setLoadingSimplified(false);
        });
    }
  }, [activeTab, lesson, simplifiedContent, onAdaptation]);

  // Generate Accessible (Neurodivergent-friendly) content
  useEffect(() => {
    if (activeTab === "accessible" && !accessibleContent) {
      setLoadingAccessible(true);
      if (onAdaptation) onAdaptation("Created bulleted low-cognitive-load formatting");
      
      generateAccessibilityText(lesson)
        .then((res) => {
          setAccessibleContent(res.content);
          setLoadingAccessible(false);
        })
        .catch(() => {
          setAccessibleContent(lesson.description || lesson.originalText);
          setLoadingAccessible(false);
        });
    }
  }, [activeTab, lesson, accessibleContent, onAdaptation]);

  return (
    <div className="w-full bg-surface-glass border border-white/5 rounded-2xl p-6 relative overflow-hidden space-y-6">
      {/* Background Subtle Gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-accent-purple/10 rounded-full blur-3xl pointer-events-none" />

      {/* Tabs and Speech Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 gap-3 pb-2">
        <div className="flex overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab("simplified")}
            className={`pb-3 px-4 text-xs font-mono uppercase tracking-wider flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
              activeTab === "simplified"
                ? "border-accent-mint text-accent-mint font-bold"
                : "border-transparent text-text-dim hover:text-text-primary"
            }`}
          >
            <MessageSquare size={13} />
            Simplified Explanation
          </button>
          <button
            onClick={() => setActiveTab("accessible")}
            className={`pb-3 px-4 text-xs font-mono uppercase tracking-wider flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
              activeTab === "accessible"
                ? "border-accent-purple text-accent-purpleLight font-bold"
                : "border-transparent text-text-dim hover:text-text-primary"
            }`}
          >
            <List size={13} />
            Accessible (Structured)
          </button>
          {signSequence.length > 0 && (
            <button
              onClick={() => setActiveTab("sign")}
              className={`pb-3 px-4 text-xs font-mono uppercase tracking-wider flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
                activeTab === "sign"
                  ? "border-accent-blue text-accent-blue font-bold"
                  : "border-transparent text-text-dim hover:text-text-primary"
              }`}
            >
              <Hand size={13} />
              Sign Vocabulary
            </button>
          )}
        </div>

        {/* Read Aloud Button */}
        {activeTab !== "sign" && (
          <button
            onClick={handleSpeak}
            className={`pb-2 px-3 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 text-text-dim hover:text-accent-pink transition-colors cursor-pointer self-start sm:self-auto ${
              isSpeaking ? "text-accent-pinkLight font-bold" : ""
            }`}
            title={isSpeaking ? "Stop Narration" : "Listen to this content"}
          >
            {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
            {isSpeaking ? "Stop Voice" : "Listen"}
          </button>
        )}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[220px]">
        {activeTab === "simplified" && (
          <div className="space-y-4">
            {loadingSimplified ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-3">
                <Loader className="animate-spin text-accent-mint" size={24} />
                <p className="text-xs text-text-dim font-mono">Simplifying language structure...</p>
              </div>
            ) : (
              <div className="text-text-dim text-sm leading-relaxed space-y-4 font-sans max-w-3xl whitespace-pre-line">
                {simplifiedContent}
              </div>
            )}
          </div>
        )}

        {activeTab === "accessible" && (
          <div className="space-y-4">
            {loadingAccessible ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-3">
                <Loader className="animate-spin text-accent-purple" size={24} />
                <p className="text-xs text-text-dim font-mono">Restructuring layout...</p>
              </div>
            ) : (
              <div className="text-text-dim text-sm leading-relaxed space-y-4 font-sans max-w-3xl whitespace-pre-line">
                {accessibleContent}
              </div>
            )}
          </div>
        )}

        {activeTab === "sign" && signSequence.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-3">
              <h4 className="font-sans font-semibold text-text-primary text-sm">Sign Language Player</h4>
              <p className="text-xs text-text-dim">
                Watch the visual sign translations of the vocabulary words below.
              </p>
              <SVGSignPlayer glossSequence={signSequence} />
            </div>

            <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5 max-h-[300px] overflow-y-auto">
              <h4 className="font-mono text-[10px] uppercase tracking-wider text-text-faint">Direct vocabulary list</h4>
              <div className="grid grid-cols-2 gap-2">
                {signSequence.map((token, idx) => (
                  <div key={idx} className="p-2 rounded bg-white/[0.02] border border-white/5 flex flex-col">
                    <span className="font-mono text-xs font-bold text-accent-mint">{token.gloss}</span>
                    <span className="text-[10px] text-text-dim font-sans">{token.word}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
