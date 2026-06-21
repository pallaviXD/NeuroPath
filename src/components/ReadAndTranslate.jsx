import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Loader2, Globe } from "lucide-react";
import { translateText } from "../lib/neuropath-agent";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "hi", label: "Hindi" },
  { code: "zh-CN", label: "Mandarin" },
  { code: "ar", label: "Arabic" },
];

export default function ReadAndTranslate({ originalText, className }) {
  const [lang, setLang] = useState("en");
  const [translatedText, setTranslatedText] = useState(originalText);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Reset when new originalText comes in
    setTranslatedText(originalText);
    setLang("en");
    setIsPlaying(false);
    window.speechSynthesis.cancel();
  }, [originalText]);

  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  const handleTranslate = async (e) => {
    const targetLang = e.target.value;
    if (targetLang === "en") {
      setTranslatedText(originalText);
      setLang(targetLang);
      return;
    }

    setIsTranslating(true);
    try {
      const targetLangLabel = LANGUAGES.find(l => l.code === targetLang)?.label || targetLang;
      const result = await translateText(originalText, targetLangLabel);
      setTranslatedText(result);
      setLang(targetLang);
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      }
    } catch (e) {
      alert("Translation failed. Make sure you have a valid API Key.");
    } finally {
      setIsTranslating(false);
    }
  };

  const toggleSpeech = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(translatedText);
      utterance.lang = lang; 
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  return (
    <div className="space-y-3">
      {/* Mini-toolbar */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSpeech}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
            isPlaying
              ? "bg-accent-blue/20 text-accent-blue border border-accent-blue/30"
              : "bg-surface-glass border border-white/10 text-text-faint hover:text-text-primary"
          }`}
        >
          {isPlaying ? <VolumeX size={12} /> : <Volume2 size={12} />}
          {isPlaying ? "Stop Audio" : "Read Aloud"}
        </button>

        <div className="relative flex items-center">
          <Globe size={12} className="absolute left-3 text-text-faint" />
          <select
            value={lang}
            onChange={handleTranslate}
            disabled={isTranslating}
            className="appearance-none pl-8 pr-8 py-1.5 bg-surface-glass border border-white/10 rounded-full text-[11px] font-mono uppercase tracking-wider text-text-faint focus:outline-none focus:border-accent-mint/30 disabled:opacity-50 cursor-pointer"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="bg-dark-bg text-text-primary">
                {l.label}
              </option>
            ))}
          </select>
          {isTranslating && (
            <Loader2 size={12} className="absolute right-3 animate-spin text-accent-mint" />
          )}
        </div>
      </div>

      {/* Content Display */}
      <p className={`relative ${className} ${isTranslating ? 'opacity-50 blur-[1px]' : 'opacity-100'} transition-all duration-300`}>
        {translatedText}
      </p>
    </div>
  );
}
