import { useEffect, useState, useRef, lazy, Suspense } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ArrowRight, BookOpen, Layers, CheckCircle2, ChevronRight, Award, Activity, Loader2, PlayCircle, ExternalLink, Volume2, VolumeX, Mic, MicOff } from "lucide-react";
import { useStore } from "../store/useStore";
import { getLesson, saveGeneratedLesson } from "../lib/lessons";
import {
  resolveStruggle,
  generateStoryMode,
  generateShorterMode,
  generateSignMode,
  generateFullSignStudy,
  generateVisualMode,
  isAgentConfigured,
  isUsingProxy,
} from "../lib/neuropath-agent";
import { dbService } from "../lib/firebase";

const ForceDiagram = lazy(() => import("../components/ForceDiagram"));
const MoleculeBuilder = lazy(() => import("../components/MoleculeBuilder"));

import WikiImageFetcher from "../components/WikiImageFetcher";
import ReadAndTranslate from "../components/ReadAndTranslate";
import UnmuteAvatar from "../components/UnmuteAvatar";
import SignStudyPlayer from "../components/SignStudyPlayer";
import LessonChoice from "../components/LessonChoice";

// Accessibility enhancements
import { useAccessibilityStore, ACCESSIBILITY_MODES } from "../store/useAccessibilityStore";
import LessonPlayerHeader from "../components/lesson/LessonPlayerHeader";
import AccessibilityLessonView from "../components/lesson/AccessibilityLessonView";
import CaptionsRenderer from "../components/accessibility/CaptionsRenderer";
import { speakText, stopSpeaking, startListening, stopListening } from "../lib/speech/speechEngine";

export default function Lesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const lesson = getLesson(lessonId);

  // Global Accessibility Store
  const { mode, fontSize, reducedMotion } = useAccessibilityStore();

  const {
    studentProfile,
    activeModality,
    setActiveModality,
    triggerStruggleIntervention,
    confirmInterventionOutcome,
  } = useStore();

  const [lessonComplete, setLessonComplete] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  
  // Quick inline check state
  const [microAnswer, setMicroAnswer] = useState(null);
  const [microAttempts, setMicroAttempts] = useState(0);
  const [microResolved, setMicroResolved] = useState(false);

  // Intervention pipeline states
  const [activeIntervention, setActiveIntervention] = useState(null);
  const [pipelineState, setPipelineState] = useState({ active: false, step: 0 });
  const [postInterventionCheck, setPostInterventionCheck] = useState(false);
  const [postInterventionAttempts, setPostInterventionAttempts] = useState(0);
  const [attemptsBeforeIntervention, setAttemptsBeforeIntervention] = useState(0);
  const [interventionStartedAt, setInterventionStartedAt] = useState(null);
  const [interventionOutcome, setInterventionOutcome] = useState(null);

  // On-demand generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState("");
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [visualSubMode, setVisualSubMode] = useState("media");

  // Speech integration states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micTranscript, setMicTranscript] = useState("");
  const [speechError, setSpeechError] = useState("");

  // Refs for tracking telemetry struggle
  const lastScrollTime = useRef(Date.now());
  const paragraphRef = useRef(null);
  const containerRef = useRef(null);
  const isResolvingStruggle = useRef(false);
  const signAutoTriggered = useRef(false);
  
  // Timer for assessment idleness
  const idleTimerRef = useRef(null);
  const isQuestionActive = useRef(false);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopListening();
    };
  }, []);

  // Initialize modality
  useEffect(() => {
    if (!lesson) return;
    
    // Stop any ongoing speech or voice listening
    stopSpeaking();
    stopListening();
    setIsSpeaking(false);
    setIsListening(false);
    setMicTranscript("");
    setSpeechError("");

    // Always reset to null so the user always sees the choice menu
    if (!lesson.modalities) lesson.modalities = {};
    setActiveModality(null);
    setVisualSubMode("media");
    setIsPlayingVideo(false);
    
    // Reset state
    setLessonComplete(false);
    setShowAssessment(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setScore(null);
    setMicroAnswer(null);
    setMicroAttempts(0);
    setMicroResolved(false);
    setActiveIntervention(null);
    setPipelineState({ active: false, step: 0 });
    setPostInterventionCheck(false);
    setPostInterventionAttempts(0);
    setAttemptsBeforeIntervention(0);
    setInterventionStartedAt(null);
    setInterventionOutcome(null);
    isQuestionActive.current = false;
  }, [lessonId, studentProfile.primary, studentProfile.deafOrHoh]);

  // (Auto-sign generation removed — user must explicitly choose via LessonChoice)

  // 1. STRUGGLE DETECTION: Re-reading scroll check
  useEffect(() => {
    if (isCalculatedOrAdapted() || !containerRef.current) return;

    const handleScroll = () => {
      const now = Date.now();
      const timeDelta = now - lastScrollTime.current;
      
      // If user scrolls up quickly and stays, count as re-reading
      if (timeDelta > 500 && timeDelta < 2500) {
        const scrollTop = containerRef.current.scrollTop;
        if (scrollTop < 30) {
          triggerStruggle("re-reading", "scrolled back to top paragraph within 2s");
        }
      }
      lastScrollTime.current = now;
    };

    const container = containerRef.current;
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [activeModality, activeIntervention]);

  // 2. STRUGGLE DETECTION: Idle timer on assessments only
  useEffect(() => {
    if (isCalculatedOrAdapted()) return;

    const resetIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (!isQuestionActive.current) return;

      idleTimerRef.current = setTimeout(() => {
        triggerStruggle("idle-timer", "no input on assessment for >15s");
      }, 15000);
    };

    const handleUserInteraction = () => {
      resetIdleTimer();
    };

    window.addEventListener("click", handleUserInteraction);
    window.addEventListener("mousemove", handleUserInteraction);
    window.addEventListener("keypress", handleUserInteraction);

    // Initial trigger
    resetIdleTimer();

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("mousemove", handleUserInteraction);
      window.removeEventListener("keypress", handleUserInteraction);
    };
  }, [showAssessment, currentQuestionIndex, activeIntervention]);

  const isCalculatedOrAdapted = () => {
    return !!activeIntervention;
  };

  const ensureModalityReady = async (modality, adaptedSnippet) => {
    if (!lesson.modalities) lesson.modalities = {};
    if (lesson.modalities[modality]) return;

    if (modality === "narrative") {
      setGenerationStatus("Generating narrative adaptation...");
      lesson.modalities.narrative = await generateStoryMode(lesson);
    } else if (modality === "sign") {
      setGenerationStatus("Translating full syllabus to SgSL signs...");
      lesson.modalities.sign = await generateFullSignStudy(lesson);
    } else if (modality === "shorter") {
      setGenerationStatus("Compressing explanation...");
      lesson.modalities.shorter = await generateShorterMode(lesson);
    } else if (modality === "visual") {
      setGenerationStatus("Fetching visual resources & diagrams...");
      lesson.modalities.visual = await generateVisualMode(lesson);
    } else if (modality === "kinesthetic") {
      lesson.modalities.kinesthetic = {
        instructions:
          adaptedSnippet ||
          "Interact with the simulation below to explore how forces and variables relate to this concept.",
      };
    }

    saveGeneratedLesson(lesson);
  };

  // Trigger Intervention Pipeline — calls Gemini agent when configured
  const triggerStruggle = async (type, details) => {
    if (activeIntervention || isResolvingStruggle.current) return;
    isResolvingStruggle.current = true;

    setPipelineState({ active: true, step: 0 });

    const pause = (ms) => new Promise((r) => setTimeout(r, ms));
    const currentModality = activeModality || studentProfile.primary || "visual";

    await pause(300);
    setPipelineState({ active: true, step: 1 });

    let resolution;
    try {
      resolution = await resolveStruggle({
        struggleType: type,
        struggleDetails: details,
        currentModality,
        studentProfile,
        lesson: {
          title: lesson.title,
          subject: lesson.subject,
          description: lesson.description,
        },
        microAttempts,
      });
    } catch (err) {
      console.warn("[Lesson] resolveStruggle failed:", err);
      resolution = {
        recommendedModality:
          currentModality === "visual"
            ? "narrative"
            : currentModality === "narrative"
              ? "kinesthetic"
              : currentModality === "kinesthetic"
                ? "sign"
                : "visual",
        interventionMessage: getInterventionMessage("visual"),
        adaptedSnippet: null,
        profileAnalysis: null,
        modalityRationale: null,
        teacherNote: null,
        source: "fallback",
      };
    }

    setPipelineState({ active: true, step: 2 });
    await pause(400);
    setPipelineState({ active: true, step: 3 });

    const nextModality = resolution.recommendedModality;
    try {
      setIsGenerating(true);
      await ensureModalityReady(nextModality, resolution.adaptedSnippet);
    } catch (err) {
      console.warn("[Lesson] modality generation failed:", err);
      setIsGenerating(false);
      setGenerationStatus("");
      setPipelineState({ active: false, step: 0 });
      isResolvingStruggle.current = false;
      alert("Failed to generate adaptation. The AI API quota may have been exceeded. Please wait a minute and try again.");
      return;
    } finally {
      setIsGenerating(false);
      setGenerationStatus("");
    }

    triggerStruggleIntervention("current_user", lesson.title, type, nextModality, {
      modalityRationale: resolution.modalityRationale,
      teacherNote: resolution.teacherNote,
      source: resolution.source,
      interventionMessage: resolution.interventionMessage,
      adaptedSnippet: resolution.adaptedSnippet,
    });

    setAttemptsBeforeIntervention(microAttempts);
    setPostInterventionCheck(true);
    setPostInterventionAttempts(0);
    setInterventionStartedAt(Date.now());
    setMicroAnswer(null);
    setMicroResolved(false);

    if (nextModality === "sign") {
      setActiveModality("visual");
      setVisualSubMode("sign");
    } else {
      setActiveModality(nextModality);
    }
    setActiveIntervention({
      type,
      details,
      message:
        resolution.interventionMessage || getInterventionMessage(nextModality),
      adaptedSnippet: resolution.adaptedSnippet,
      profileAnalysis: resolution.profileAnalysis,
      modalityRationale: resolution.modalityRationale,
      source: resolution.source,
    });

    setPipelineState({ active: false, step: 4 });
    isResolvingStruggle.current = false;
  };

  const getInterventionMessage = (modality) => {
    switch (modality) {
      case "visual":
        return "Visual representation unlocked: trace the diagram nodes to see relationships.";
      case "narrative":
        return "Narrative story unlocked: we translated this concept into an analogy to help your brain map it.";
      case "kinesthetic":
        return "Kinesthetic sandbox unlocked: interact with the adjusters to feel how variables respond.";
      case "sign":
        return "3D sign explanations generated: watch the avatar's movements and check the gloss tokens below.";
      default:
        return "Adapted explanation delivered.";
    }
  };

  // Handle micro-check submissions
  const handleMicroCheck = (index) => {
    if (microResolved) return;
    setMicroAnswer(index);

    if (index === lesson.microCheck.answerIndex) {
      setMicroResolved(true);

      if (postInterventionCheck) {
        const durationSec = interventionStartedAt
          ? Math.round((Date.now() - interventionStartedAt) / 1000)
          : 0;
        const outcome = {
          attemptsBefore: attemptsBeforeIntervention,
          attemptsAfter: postInterventionAttempts + 1,
          durationSec,
          modality: activeModality,
        };
        setInterventionOutcome(outcome);
        confirmInterventionOutcome("current_user", lesson.title, outcome);
      } else if (microAttempts > 0) {
        triggerStruggle("wrong-then-correct", "corrected check answer immediately");
      }
    } else if (postInterventionCheck) {
      setPostInterventionAttempts((prev) => prev + 1);
    } else {
      setMicroAttempts((prev) => prev + 1);
    }
  };

  // Start final assessment
  const handleStartAssessment = () => {
    setShowAssessment(true);
    isQuestionActive.current = true;
  };

  // Submit assessment answer
  const handleAnswerSubmit = (optionIndex) => {
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: optionIndex }));
    
    if (currentQuestionIndex < lesson.assessment.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Finished
      isQuestionActive.current = false;
      const finalAnswers = { ...answers, [currentQuestionIndex]: optionIndex };
      let correctCount = 0;
      lesson.assessment.forEach((q, idx) => {
        if (finalAnswers[idx] === q.answerIndex) correctCount++;
      });
      const finalScore = Math.round((correctCount / lesson.assessment.length) * 100);
      setScore(finalScore);
      setLessonComplete(true);

      // Save session logs to database fallback
      dbService.saveSession({
        lessonId,
        lessonTitle: lesson.title,
        score: finalScore,
        duration: 300,
        date: new Date().toISOString().split("T")[0],
        adapted: !!activeIntervention,
        interventionOutcome: interventionOutcome || null,
      });
    }
  };

  // Handle user's on-demand choice
  const handleChoice = async (modality, subType = null) => {
    if (modality === "visual") {
      if (subType === "sign") {
        setVisualSubMode("sign");
        if (!lesson.modalities?.sign) {
          setIsGenerating(true);
          setGenerationStatus("Translating full syllabus to SgSL signs...");
          try {
            if (!lesson.modalities) lesson.modalities = {};
            lesson.modalities.sign = await generateFullSignStudy(lesson);
            saveGeneratedLesson(lesson);
          } catch (e) {
            console.error(e);
            alert("Failed to generate sign mode. The AI API quota may have been exceeded.");
            return;
          } finally {
            setIsGenerating(false);
            setGenerationStatus("");
          }
        }
      } else {
        setVisualSubMode("media");
        if (!lesson.modalities?.visual) {
          setIsGenerating(true);
          setGenerationStatus("Fetching visual resources & diagrams...");
          try {
            if (!lesson.modalities) lesson.modalities = {};
            lesson.modalities.visual = await generateVisualMode(lesson);
            saveGeneratedLesson(lesson);
          } catch (e) {
            console.error(e);
            alert("Failed to generate visual mode. The AI API quota may have been exceeded.");
            return;
          } finally {
            setIsGenerating(false);
            setGenerationStatus("");
          }
        }
      }
      setActiveModality("visual");
      return;
    }

    if (lesson.modalities[modality]) {
      setActiveModality(modality);
      return;
    }

    setIsGenerating(true);
    try {
      let content;
      if (modality === "narrative") {
        setGenerationStatus("Generating relatable story analogy...");
        content = await generateStoryMode(lesson);
        lesson.modalities.narrative = content;
      } else if (modality === "shorter") {
        setGenerationStatus("Compressing to concise facts...");
        content = await generateShorterMode(lesson);
        lesson.modalities.shorter = content;
      }

      saveGeneratedLesson(lesson);
      setActiveModality(modality);
    } catch (e) {
      console.error(e);
      alert("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSpeakModality = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    let textToSpeak = "";
    if (activeModality === "visual") {
      textToSpeak = lesson.modalities?.visual?.content || "";
    } else if (activeModality === "narrative") {
      textToSpeak = `${lesson.modalities?.narrative?.storyTitle || ""}. ${lesson.modalities?.narrative?.content || ""}`;
    } else if (activeModality === "kinesthetic") {
      textToSpeak = lesson.modalities?.kinesthetic?.instructions || "";
    } else if (activeModality === "shorter") {
      textToSpeak = lesson.modalities?.shorter?.content || "";
    } else {
      textToSpeak = lesson.description || lesson.originalText || "";
    }

    if (!textToSpeak) return;

    speakText(
      textToSpeak,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      (err) => {
        setIsSpeaking(false);
        setSpeechError(err);
      }
    );
  };

  const handleVoiceAnswer = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
      return;
    }

    setSpeechError("");
    setMicTranscript("");
    setIsListening(true);

    startListening(
      (transcript) => {
        setMicTranscript(transcript);
        setIsListening(false);

        // Process transcription to find the matching choice
        if (lesson.microCheck && lesson.microCheck.options) {
          const spoken = transcript.toLowerCase();
          let matchedIndex = -1;

          // Strategy 1: Match option contents
          lesson.microCheck.options.forEach((opt, idx) => {
            const cleanOpt = opt.toLowerCase();
            if (spoken.includes(cleanOpt) || cleanOpt.includes(spoken)) {
              matchedIndex = idx;
            }
          });

          // Strategy 2: Numeric/ordinal clues
          if (matchedIndex === -1) {
            if (spoken.includes("first") || spoken.includes("one") || spoken.includes("1")) {
              matchedIndex = 0;
            } else if (spoken.includes("second") || spoken.includes("two") || spoken.includes("2")) {
              matchedIndex = 1;
            } else if (spoken.includes("third") || spoken.includes("three") || spoken.includes("3")) {
              matchedIndex = 2;
            }
          }

          if (matchedIndex !== -1 && matchedIndex < lesson.microCheck.options.length) {
            handleMicroCheck(matchedIndex);
          } else {
            setSpeechError(`Could not match "${transcript}" to any option.`);
          }
        }
      },
      (err) => {
        setIsListening(false);
        setSpeechError(err || "Microphone error");
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const progressPercent = lessonComplete 
    ? 100 
    : showAssessment 
      ? 50 + Math.round((currentQuestionIndex / lesson.assessment.length) * 50) 
      : microResolved 
        ? 50 
        : 25;

  const getTextSizeClass = () => {
    if (fontSize === "large") return "text-base md:text-lg leading-relaxed";
    if (fontSize === "larger") return "text-lg md:text-xl leading-loose";
    return "text-sm leading-relaxed";
  };

  const getHighContrastClass = (type) => {
    if (mode !== ACCESSIBILITY_MODES.HIGH_CONTRAST) return "";
    switch (type) {
      case "panel":
        return "bg-black border-2 border-white text-white shadow-none";
      case "text":
        return "text-white opacity-100";
      case "button":
        return "bg-black border-2 border-white text-white hover:bg-white hover:text-black transition-none shadow-none";
      default:
        return "";
    }
  };

  if (!lesson) {
    return (
      <div className="pt-32 text-center">
        <h2 className="text-xl">Lesson not found.</h2>
        <Link to="/" className="text-accent-pink hover:underline mt-4 inline-block">Back home</Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto pt-28 pb-20 px-6 md:px-16 flex flex-col items-center">
      
      {/* Back button */}
      <div className="w-full flex justify-start mb-6">
        <Link to="/" className="text-xs font-mono text-text-faint hover:text-accent-pink transition-colors flex items-center gap-1">
          ← Back to Curriculum
        </Link>
      </div>

      {/* Lesson Header Telemetry Overlay */}
      <LessonPlayerHeader
        lesson={lesson}
        progress={progressPercent}
        activeModality={activeModality}
        activeIntervention={activeIntervention}
        interventions={[]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
        
        {/* Left Side: Lesson Viewer */}
        <div ref={containerRef} className={`lg:col-span-8 glass-panel rounded-[28px] border border-white/10 p-6 md:p-8 text-left min-h-[460px] flex flex-col justify-between max-h-[75vh] overflow-y-auto relative ${getHighContrastClass("panel")}`}>
          
          {isGenerating ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10 rounded-[28px]">
              <Loader2 className="animate-spin text-accent-blue mb-4" size={32} />
              <p className="text-text-primary font-medium">{generationStatus}</p>
            </div>
          ) : (!activeModality || (activeModality !== "visual" && !lesson.modalities?.[activeModality])) && mode === ACCESSIBILITY_MODES.STANDARD ? (
            <LessonChoice onChoice={handleChoice} />
          ) : !showAssessment ? (
            // ============ LESSON CONTENT VIEW ============
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-xs text-accent-pinkLight bg-accent-pink/10 border border-accent-pink/20 px-3 py-1 rounded-full uppercase ${getHighContrastClass("text")}`}>
                    {lesson.subject}
                  </span>
                  {activeModality && activeModality !== "sign" && (
                    <button
                      onClick={handleSpeakModality}
                      className={`flex items-center gap-1.5 font-mono text-[10px] text-text-dim hover:text-accent-pink border border-white/10 hover:border-accent-pink/30 px-3 py-1 rounded-full transition-colors cursor-pointer ${
                        isSpeaking ? "bg-accent-pink/15 border-accent-pink/50 text-accent-pinkLight" : ""
                      }`}
                      title={isSpeaking ? "Stop Narration" : "Listen to Explanation"}
                    >
                      {isSpeaking ? <VolumeX size={11} /> : <Volume2 size={11} />}
                      {isSpeaking ? "Stop Voice" : "Listen"}
                    </button>
                  )}
                </div>
                {mode === ACCESSIBILITY_MODES.STANDARD && (
                  <button 
                    onClick={() => setActiveModality(null)}
                    className={`font-mono text-[10px] text-text-faint hover:text-white border border-white/10 hover:border-white/30 px-2 py-1 rounded uppercase transition-colors cursor-pointer ${getHighContrastClass("button")}`}
                    title="Click to switch learning modality"
                  >
                    Rendering: {activeModality} mode ▾
                  </button>
                )}
              </div>
              
              <h2 className={`font-display font-bold text-2xl md:text-3xl text-text-primary mb-5 ${getHighContrastClass("text")}`}>
                {lesson.title}
              </h2>

              {/* Dynamic Modality Renderer or Accessibility view */}
              <div className="space-y-6">
                
                {mode !== ACCESSIBILITY_MODES.STANDARD ? (
                  <AccessibilityLessonView 
                    lesson={lesson} 
                    onAdaptation={(msg) => {
                      if (triggerStruggleIntervention) {
                        triggerStruggleIntervention("accessibility-adaptation", msg);
                      }
                    }}
                  />
                ) : (
                  <>
                    {/* 1. VISUAL */}
                    {activeModality === "visual" && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                        {/* Visual Mode Sub-tabs */}
                        <div className="flex gap-4 border-b border-white/10 mb-6">
                          <button
                            onClick={() => setVisualSubMode("media")}
                            className={`pb-2.5 font-mono text-xs uppercase tracking-wider relative transition-all border-b-2 cursor-pointer ${
                              visualSubMode === "media"
                                ? "border-accent-pink text-text-primary font-bold"
                                : "border-transparent text-text-faint hover:text-text-dim"
                            }`}
                          >
                            Media & Diagrams
                          </button>
                          <button
                            onClick={async () => {
                              setVisualSubMode("sign");
                              if (!lesson.modalities?.sign) {
                                setIsGenerating(true);
                                setGenerationStatus("Translating full syllabus to SgSL signs...");
                                try {
                                  if (!lesson.modalities) lesson.modalities = {};
                                  lesson.modalities.sign = await generateFullSignStudy(lesson);
                                  saveGeneratedLesson(lesson);
                                } catch (err) {
                                  console.error(err);
                                } finally {
                                  setIsGenerating(false);
                                  setGenerationStatus("");
                                }
                              }
                            }}
                            className={`pb-2.5 font-mono text-xs uppercase tracking-wider relative transition-all border-b-2 cursor-pointer ${
                              visualSubMode === "sign"
                                ? "border-accent-pink text-text-primary font-bold"
                                : "border-transparent text-text-faint hover:text-text-dim"
                            }`}
                          >
                            3D Sign Study
                          </button>
                        </div>

                        {visualSubMode === "media" ? (
                          <div className="space-y-5">
                            <p ref={paragraphRef} className={`text-text-dim ${getTextSizeClass()} ${getHighContrastClass("text")}`}>
                              {lesson.modalities.visual.content}
                            </p>
                            {lessonId === "newtons-first-law" ? (
                              <ForceDiagram lessonId={lessonId} />
                            ) : lessonId === "cellular-respiration" ? (
                              <MoleculeBuilder lessonId={lessonId} />
                            ) : (
                              <WikiImageFetcher 
                                topic={lesson.modalities.visual.wikiTopic || lesson.title} 
                                searchQuery={lesson.modalities.visual.searchQuery}
                              />
                            )}

                            {/* Video Resources */}
                            {lesson.modalities.visual.videos?.length > 0 && (
                              <div className="mt-6 space-y-3">
                                <h4 className={`font-display font-semibold text-sm text-text-primary mb-3 flex items-center gap-2 ${getHighContrastClass("text")}`}>
                                  <PlayCircle size={16} className="text-accent-blue" />
                                  Recommended Video Resources
                                </h4>
                                
                                {lesson.modalities.visual.videos.map((vid, i) => {
                                  const ytLink = vid.url || `https://www.youtube.com/results?search_query=${encodeURIComponent(vid.searchQuery || vid.title)}`;
                                  return (
                                    <a key={i} href={ytLink} target="_blank" rel="noreferrer" className={`block p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-accent-blue/40 transition-all group ${getHighContrastClass("panel")}`}>
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <div className={`text-[13px] font-semibold text-text-primary group-hover:text-accent-blue transition-colors ${getHighContrastClass("text")}`}>{vid.title}</div>
                                          <div className="text-[11px] text-text-faint mt-1">{vid.channel} • {vid.duration}</div>
                                        </div>
                                        <ExternalLink size={14} className="text-text-faint group-hover:text-accent-blue" />
                                      </div>
                                    </a>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-5">
                            {lesson.modalities.sign?.summaryGloss && (
                              <p className="font-mono text-[11px] text-accent-mint/80 uppercase tracking-wider text-center">
                                {lesson.modalities.sign.summaryGloss}
                              </p>
                            )}
                            {lesson.modalities.sign ? (
                              <SignStudyPlayer
                                signData={lesson.modalities.sign}
                                signSystem={lesson.modalities.sign.signSystem || "SgSL"}
                              />
                            ) : (
                              <div className="text-center py-8 text-text-faint text-xs font-mono">
                                Sign translation not loaded. Click "3D Sign Study" to generate.
                              </div>
                            )}
                            <p className="text-[11px] text-text-faint font-mono text-center">
                              Visual-only mode — study the full syllabus through 3D signs without reading the text.
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* 2. NARRATIVE */}
                    {activeModality === "narrative" && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                        <h4 className={`font-display font-semibold text-text-primary text-md ${getHighContrastClass("text")}`}>
                          {lesson.modalities.narrative.storyTitle}
                        </h4>
                        <ReadAndTranslate 
                          originalText={lesson.modalities.narrative.content} 
                          className={`text-text-dim ${getTextSizeClass()} whitespace-pre-line bg-white/[0.01] border border-white/5 p-4 rounded-2xl italic ${getHighContrastClass("panel")} ${getHighContrastClass("text")}`} 
                        />
                      </motion.div>
                    )}

                    {/* 3. KINESTHETIC */}
                    {activeModality === "kinesthetic" && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                        <p ref={paragraphRef} className={`text-text-dim ${getTextSizeClass()} ${getHighContrastClass("text")}`}>
                          {lesson.modalities.kinesthetic.instructions}
                        </p>
                        <MoleculeBuilder lessonId={lessonId} />
                      </motion.div>
                    )}

                    {/* SHORTER */}
                    {activeModality === "shorter" && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                        <div className="bg-accent-mint/10 border border-accent-mint/20 p-5 rounded-2xl">
                          <ReadAndTranslate 
                            originalText={lesson.modalities.shorter.content} 
                            className={`text-text-dim ${getTextSizeClass()} whitespace-pre-line ${getHighContrastClass("text")}`} 
                          />
                        </div>
                      </motion.div>
                    )}
                  </>
                )}

              </div>

              {/* Dynamic synchronized captions overlay */}
              <CaptionsRenderer text={lesson.description || lesson.originalText} />

              {/* Inline concept checkpoint */}
              {lesson.microCheck && (
                <div className="mt-8 pt-6 border-t border-dashed border-white/10 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-display font-semibold text-sm text-text-primary ${getHighContrastClass("text")}`}>
                      {postInterventionCheck ? "Post-Adaptation Check" : "Concept Checkpoint"}
                    </h4>
                    {!microResolved && (
                      <button
                        onClick={handleVoiceAnswer}
                        className={`flex items-center gap-1.5 font-mono text-[10px] text-text-dim hover:text-accent-pink border border-white/10 hover:border-accent-pink/30 px-3 py-1 rounded-full transition-colors cursor-pointer ${
                          isListening ? "bg-accent-pink/15 border-accent-pink/50 text-accent-pinkLight animate-pulse" : ""
                        }`}
                        title={isListening ? "Stop listening" : "Answer using your voice"}
                      >
                        {isListening ? <MicOff size={11} /> : <Mic size={11} />}
                        {isListening ? "Listening..." : "Answer with Voice"}
                      </button>
                    )}
                  </div>
                  {postInterventionCheck && !interventionOutcome && (
                    <p className="text-[11px] text-accent-amber font-mono mb-3">
                      Review the adapted {activeModality} explanation above, then verify your understanding.
                    </p>
                  )}
                  {micTranscript && (
                    <p className="text-[10px] text-accent-mint font-mono mb-2 bg-accent-mint/5 border border-accent-mint/15 px-3 py-1.5 rounded-lg">
                      Transcribed: "{micTranscript}"
                    </p>
                  )}
                  {speechError && (
                    <p className="text-[10px] text-accent-pink font-mono mb-2 bg-accent-pink/5 border border-accent-pink/15 px-3 py-1.5 rounded-lg">
                      {speechError}
                    </p>
                  )}
                  <p className={`text-xs text-text-dim mb-4 ${getHighContrastClass("text")}`}>{lesson.microCheck.question}</p>
                  <div className="space-y-2">
                    {lesson.microCheck.options && lesson.microCheck.options.map((opt, index) => (
                      <button
                        key={index}
                        onClick={() => handleMicroCheck(index)}
                        className={`w-full p-3 rounded-xl border text-left text-[12.5px] transition-colors cursor-pointer ${
                          microAnswer === index 
                            ? index === lesson.microCheck.answerIndex
                              ? "bg-accent-mint/15 border-accent-mint text-accent-mint"
                              : "bg-accent-pink/15 border-accent-pink text-accent-pink"
                            : "bg-white/[0.02] border-white/5 text-text-dim hover:bg-white/5"
                        } ${getHighContrastClass("button")}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  
                  {microResolved && interventionOutcome && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-4 p-4 bg-accent-violet/10 border border-accent-violet/30 rounded-xl text-xs ${getHighContrastClass("panel")}`}
                    >
                      <div className="font-mono text-[10px] text-accent-violetLight font-bold uppercase tracking-wider mb-2">
                        Adaptation verified
                      </div>
                      <p className={`text-text-dim leading-relaxed ${getHighContrastClass("text")}`}>
                        Cleared in <strong className="text-accent-mint">{interventionOutcome.attemptsAfter} attempt{interventionOutcome.attemptsAfter !== 1 ? "s" : ""}</strong> after{" "}
                        <strong className="text-text-primary">{activeModality}</strong> intervention
                        {interventionOutcome.attemptsBefore > 0 && (
                          <> (was {interventionOutcome.attemptsBefore} before adaptation)</>
                        )}
                        {interventionOutcome.durationSec > 0 && (
                          <> · resolved in {interventionOutcome.durationSec}s</>
                        )}
                        .
                      </p>
                    </motion.div>
                  )}

                  {microResolved && !interventionOutcome && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 bg-accent-mint/5 border border-accent-mint/20 rounded-xl text-xs text-accent-mint">
                      <strong>Correct!</strong> {lesson.microCheck.explanation}
                    </motion.div>
                  )}
                </div>
              )}

            </div>
          ) : (
            // ============ FINAL ASSESSMENT VIEW ============
            <div>
              <span className={`font-mono text-xs text-accent-pinkLight bg-accent-pink/10 border border-accent-pink/20 px-3 py-1 rounded-full uppercase mb-4 inline-block ${getHighContrastClass("text")}`}>
                Final Check
              </span>
              
              {!lessonComplete ? (
                <div>
                  <h3 className={`font-display font-semibold text-[17px] text-text-primary mb-4 text-left ${getHighContrastClass("text")}`}>
                    Question {currentQuestionIndex + 1} of {lesson.assessment.length}
                  </h3>
                  <p className={`text-[14.5px] text-text-dim mb-5 text-left ${getHighContrastClass("text")}`}>
                    {lesson.assessment[currentQuestionIndex].question}
                  </p>
                  
                  <div className="space-y-3">
                    {lesson.assessment[currentQuestionIndex].options.map((opt, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSubmit(index)}
                        className={`w-full p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/20 text-left text-sm text-text-dim hover:text-text-primary transition-all cursor-pointer ${getHighContrastClass("button")}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 flex flex-col items-center">
                  <Award size={48} className="text-accent-mint mb-4" />
                  <h3 className={`font-display font-bold text-2xl text-text-primary mb-2 ${getHighContrastClass("text")}`}>Lesson Complete!</h3>
                  <p className={`text-text-dim text-sm max-w-sm mb-6 ${getHighContrastClass("text")}`}>
                    You scored <strong className="text-accent-mint">{score}%</strong>. Your adaptive telemetry log has been updated in the teacher panel.
                  </p>
                  <div className="flex gap-4">
                    <button onClick={() => navigate("/")} className={`px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:border-white/20 text-text-dim hover:text-text-primary transition-all text-xs font-bold uppercase tracking-wider ${getHighContrastClass("button")}`}>
                      Home
                    </button>
                    <button 
                      onClick={() => navigate("/dashboard")} 
                      className={`px-6 py-3 rounded-full bg-gradient-to-r from-accent-pink to-[#C2127F] text-white transition-all text-xs font-bold uppercase tracking-wider shadow-glowPink ${getHighContrastClass("button")}`}
                    >
                      View in Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer controls */}
          {!showAssessment && (
            <div className="mt-8 pt-5 border-t border-white/5 flex items-center justify-between">
              <div className="text-xs text-text-faint font-mono">
                {!microResolved ? "Solve checkpoint to unlock quiz" : "Checkpoint clear ✓"}
              </div>
              <button
                disabled={!microResolved}
                onClick={handleStartAssessment}
                className={`px-6 py-3 rounded-full bg-gradient-to-r from-accent-pink to-[#C2127F] text-white font-semibold text-xs uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-glowPink transition-all flex items-center gap-1.5 ${getHighContrastClass("button")}`}
              >
                Take Assessment
                <ChevronRight size={14} />
              </button>
            </div>
          )}

        </div>

        {/* Right Side: Telemetry Status & Intervention Pipe */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Active Adaptive pipeline */}
          <div className={`glass-panel rounded-2xl p-6 text-left border border-white/10 ${getHighContrastClass("panel")}`}>
            <h3 className="font-display font-bold text-[15px] mb-3 text-text-primary flex items-center justify-between gap-2">
              <span className={`flex items-center gap-2 ${getHighContrastClass("text")}`}>
                <Activity className="text-accent-pink" size={16} />
                Struggle Resolution Pipeline
              </span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-text-faint">
                {isAgentConfigured() ? (isUsingProxy() ? "Gemini proxy" : "Gemini agent") : "Rule fallback"}
              </span>
            </h3>
            
            <div className="space-y-4 mt-5">
              <div className={`flex items-center gap-3 text-xs ${pipelineState.active && pipelineState.step >= 0 ? "text-accent-pink font-semibold" : "text-text-faint"}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${pipelineState.active && pipelineState.step >= 0 ? "bg-accent-pink shadow-[0_0_8px_var(--pink)]" : "bg-white/10"}`} />
                Confusion signal scanned
              </div>
              <div className={`flex items-center gap-3 text-xs ${pipelineState.active && pipelineState.step >= 1 ? "text-accent-pink font-semibold" : "text-text-faint"}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${pipelineState.active && pipelineState.step >= 1 ? "bg-accent-pink shadow-[0_0_8px_var(--pink)]" : "bg-white/10"}`} />
                Cognitive profile queried
              </div>
              <div className={`flex items-center gap-3 text-xs ${pipelineState.active && pipelineState.step >= 2 ? "text-accent-pink font-semibold" : "text-text-faint"}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${pipelineState.active && pipelineState.step >= 2 ? "bg-accent-pink shadow-[0_0_8px_var(--pink)]" : "bg-white/10"}`} />
                Modality shift calculated
              </div>
              <div className={`flex items-center gap-3 text-xs ${pipelineState.active && pipelineState.step >= 3 ? "text-accent-pink font-semibold" : "text-text-faint"}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${pipelineState.active && pipelineState.step >= 3 ? "bg-accent-pink shadow-[0_0_8px_var(--pink)]" : "bg-white/10"}`} />
                Adaptation content translation
              </div>
              <div className={`flex items-center gap-3 text-xs ${pipelineState.step === 4 ? "text-accent-mint font-semibold animate-pulse" : "text-text-faint"}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${pipelineState.step === 4 ? "bg-accent-mint shadow-[0_0_8px_var(--mint)]" : "bg-white/10"}`} />
                Delivered inline (complete)
              </div>
            </div>
          </div>

          {/* Intervention banner */}
          <AnimatePresence>
            {activeIntervention && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`glass-panel border-accent-amber/35 bg-accent-amber/5 rounded-2xl p-6 text-left border relative overflow-hidden ${getHighContrastClass("panel")}`}
              >
                <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-accent-amber/10 blur-xl" />
                <h4 className="font-mono text-[10.5px] text-accent-amber font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                  <AlertCircle size={12} />
                  Micro-Intervention Fired
                </h4>
                <p className="text-xs text-text-faint font-mono mb-3">
                  Reason:{" "}
                  {activeIntervention.type === "re-reading"
                    ? "Gaze re-reading patterns"
                    : activeIntervention.type === "idle-timer"
                      ? "Assessment response delay"
                      : activeIntervention.type === "wrong-then-correct"
                        ? "Wrong answer, then self-corrected"
                        : "Correction sequence"}
                </p>
                {activeIntervention.profileAnalysis && (
                  <p className="text-[11px] text-accent-violetLight/90 font-mono mb-2">
                    Profile: {activeIntervention.profileAnalysis}
                  </p>
                )}
                {activeIntervention.modalityRationale && (
                  <p className="text-[11px] text-text-faint mb-3 leading-relaxed">
                    {activeIntervention.modalityRationale}
                  </p>
                )}
                <p className={`text-[13px] text-text-dim leading-relaxed font-body ${getHighContrastClass("text")}`}>
                  {activeIntervention.message}
                </p>
                {activeIntervention.adaptedSnippet && (
                  <p className="mt-3 pt-3 border-t border-accent-amber/20 text-[12.5px] text-text-dim leading-relaxed italic">
                    {activeIntervention.adaptedSnippet}
                  </p>
                )}
                <p className="mt-3 font-mono text-[9px] uppercase tracking-wider text-text-faint">
                  Source: {activeIntervention.source === "gemini" ? "Gemini 2.5 Flash" : "Profile rotation fallback"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
