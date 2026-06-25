import React, { useMemo } from "react";
import { AVAILABLE_WORDS } from "../../features/sign-language/wordIndex";
import { ShieldAlert, CheckCircle, BarChart2, Star, BookOpen, AlertCircle } from "lucide-react";

// Simple syllable counter helper
function countSyllablesInWord(word) {
  let w = word.toLowerCase().trim();
  if (w.length <= 3) return 1;
  w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  w = w.replace(/^y/, "");
  const syllables = w.match(/[aeiouy]{1,2}/g);
  return syllables ? syllables.length : 1;
}

export function calculateAccessibilityScore(text) {
  if (!text) {
    return {
      fleschEase: 100,
      sentenceComplexity: 0,
      vocabDifficulty: 0,
      signCoverage: 100,
      recommendations: [],
    };
  }

  // Count sentences, words, syllables
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 0);
  const words = text.replace(/[^a-zA-Z\s]/g, "").split(/\s+/).map((s) => s.trim()).filter((s) => s.length > 0);
  
  const numSentences = Math.max(1, sentences.length);
  const numWords = Math.max(1, words.length);
  
  let totalSyllables = 0;
  let complexWordsCount = 0;
  let matchesWordSignCount = 0;

  words.forEach((w) => {
    const syl = countSyllablesInWord(w);
    totalSyllables += syl;
    if (syl >= 3) complexWordsCount++;
    
    // Check coverage against local ISL vocabulary
    if (AVAILABLE_WORDS.has(w.toLowerCase())) {
      matchesWordSignCount++;
    }
  });

  // Flesch Reading Ease Formula
  // 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
  const avgSentenceLength = numWords / numSentences;
  const avgSyllablesPerWord = totalSyllables / numWords;
  let fleschEase = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;
  fleschEase = Math.max(0, Math.min(100, fleschEase));

  // Complex word percentage
  const complexPct = (complexWordsCount / numWords) * 100;
  // Sign language direct coverage
  const signCoverage = numWords > 0 ? (matchesWordSignCount / numWords) * 100 : 100;

  // Compile tailored recommendations
  const recommendations = [];
  if (avgSentenceLength > 18) {
    recommendations.push({
      id: "split-sentences",
      type: "warning",
      text: "Sentences average over 18 words. Consider splitting complex clauses to reduce cognitive load.",
    });
  } else {
    recommendations.push({
      id: "sentences-ok",
      type: "success",
      text: "Sentence length is ideal for processing.",
    });
  }

  if (complexPct > 20) {
    recommendations.push({
      id: "simplify-vocab",
      type: "warning",
      text: "More than 20% of words are multi-syllabic. Simplify advanced terminology or add inline explanations.",
    });
  } else {
    recommendations.push({
      id: "vocab-ok",
      type: "success",
      text: "Vocabulary difficulty is within standard limits.",
    });
  }

  if (signCoverage < 15) {
    recommendations.push({
      id: "add-signs",
      type: "info",
      text: `Direct sign coverage is ${Math.round(signCoverage)}%. Large parts will use spelling fallbacks. Simplify terms to match registered ISL concepts.`,
    });
  } else {
    recommendations.push({
      id: "signs-ok",
      type: "success",
      text: "Strong coverage of core sign language terms.",
    });
  }

  return {
    fleschEase: Math.round(fleschEase),
    sentenceComplexity: Math.round(avgSentenceLength),
    vocabDifficulty: Math.round(complexPct),
    signCoverage: Math.round(signCoverage),
    recommendations,
  };
}

export default function AccessibilityScore({ text }) {
  const metrics = useMemo(() => calculateAccessibilityScore(text), [text]);

  // Overall Grade
  const grade = useMemo(() => {
    const score = (metrics.fleschEase * 0.4) + ((100 - metrics.vocabDifficulty) * 0.3) + (metrics.signCoverage * 0.3);
    if (score >= 85) return { letter: "A", label: "Excellent Accessibility", color: "text-accent-mint border-accent-mint/20 bg-accent-mint/5" };
    if (score >= 70) return { letter: "B", label: "Good Accessibility", color: "text-accent-blue border-accent-blue/20 bg-accent-blue/5" };
    if (score >= 50) return { letter: "C", label: "Needs Adaptive Simplification", color: "text-accent-amber border-accent-amber/20 bg-accent-amber/5" };
    return { letter: "D", label: "High Cognitive Load", color: "text-accent-pink border-accent-pink/20 bg-accent-pink/5" };
  }, [metrics]);

  return (
    <div className="bg-surface-glass border border-white/5 p-6 rounded-2xl relative overflow-hidden group space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-lg text-text-primary flex items-center gap-2">
          <BarChart2 className="text-accent-mint" size={20} />
          Content Accessibility Audit
        </h3>
        <span className="font-mono text-[9px] uppercase tracking-wider text-text-faint">
          Real-time Telemetry
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Overall Grade Card */}
        <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${grade.color}`}>
          <span className="text-4xl font-black font-display tracking-tight">{grade.letter}</span>
          <span className="text-xs font-semibold mt-1 block">{grade.label}</span>
        </div>

        {/* Flesch Ease */}
        <div className="p-4 rounded-xl border border-white/5 bg-black/25 flex flex-col justify-between">
          <span className="font-mono text-[9px] text-text-faint uppercase tracking-wider block">Readability Ease</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-bold font-sans text-text-primary">{metrics.fleschEase}</span>
            <span className="text-xs text-text-dim">/100</span>
          </div>
          <span className="text-[10px] text-text-dim mt-2 block">
            {metrics.fleschEase >= 70 ? "Easy to read" : metrics.fleschEase >= 50 ? "Moderate" : "Advanced / Academic"}
          </span>
        </div>

        {/* Complex Words */}
        <div className="p-4 rounded-xl border border-white/5 bg-black/25 flex flex-col justify-between">
          <span className="font-mono text-[9px] text-text-faint uppercase tracking-wider block">Complexity Ratio</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-bold font-sans text-text-primary">{metrics.vocabDifficulty}%</span>
          </div>
          <span className="text-[10px] text-text-dim mt-2 block">
            Complex words (3+ syllables)
          </span>
        </div>

        {/* Sign Vocabulary Coverage */}
        <div className="p-4 rounded-xl border border-white/5 bg-black/25 flex flex-col justify-between">
          <span className="font-mono text-[9px] text-text-faint uppercase tracking-wider block">Direct Sign Ratio</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-bold font-sans text-text-primary">{metrics.signCoverage}%</span>
          </div>
          <span className="text-[10px] text-text-dim mt-2 block">
            Custom word-signs found
          </span>
        </div>
      </div>

      {/* Recommendations & Action Plan */}
      <div className="space-y-3">
        <h4 className="font-mono text-[10px] uppercase text-text-faint tracking-wider">
          System Intervention Recommendations
        </h4>
        <div className="space-y-2.5">
          {metrics.recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                rec.type === "warning"
                  ? "bg-accent-amber/5 border-accent-amber/15 text-accent-amberLight"
                  : rec.type === "info"
                  ? "bg-accent-blue/5 border-accent-blue/15 text-accent-blueLight"
                  : "bg-accent-mint/5 border-accent-mint/15 text-accent-mint"
              }`}
            >
              {rec.type === "warning" ? (
                <ShieldAlert className="shrink-0 mt-0.5" size={14} />
              ) : rec.type === "info" ? (
                <AlertCircle className="shrink-0 mt-0.5" size={14} />
              ) : (
                <CheckCircle className="shrink-0 mt-0.5" size={14} />
              )}
              <span>{rec.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
