import { GoogleGenAI } from "@google/genai";
import { SGSL_PROMPT_PREFIX, enrichGlossSequence } from "../data/sgslGloss.js";
import { enrichToken, flattenSignSections } from "./signPoseMap.js";

const MODEL = "gemini-2.5-flash";
const MODALITIES = ["visual", "narrative", "kinesthetic", "sign"];

function getApiKey() {
  return (import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY || "").trim();
}

function shouldUseProxy() {
  return (
    import.meta.env.DEV ||
    import.meta.env.VITE_USE_GEMINI_PROXY === "true" ||
    (!getApiKey() && import.meta.env.PROD)
  );
}

let client = null;

function getClient() {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  if (!client) client = new GoogleGenAI({ apiKey });
  return client;
}

export function isAgentConfigured() {
  return !!getApiKey() || import.meta.env.VITE_USE_GEMINI_PROXY === "true";
}

export function isUsingProxy() {
  return shouldUseProxy() && !getApiKey();
}

function parseJson(text) {
  if (!text) throw new Error("Empty model response");
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Could not parse JSON from model response");
  }
}

async function generateViaProxy(prompt, schemaHint) {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, schemaHint }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Gemini proxy failed (${res.status})`);
  }

  const data = await res.json();
  return parseJson(data.text);
}

// Parse "retry in Xs" from rate limit error messages
function parseRetryDelay(errMsg) {
  const match = errMsg?.match(/retry in ([0-9.]+)s/i);
  return match ? Math.ceil(parseFloat(match[1]) * 1000) : 12000;
}

function isRateLimitError(err) {
  return err?.message?.includes("quota") || err?.message?.includes("429") || err?.message?.includes("RESOURCE_EXHAUSTED");
}

// Exposed so UI can subscribe
export let onRetryCountdown = null;

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function generateJson(prompt, schemaHint, _attempt = 0, onStatus = null) {
  const MAX_RETRIES = 3;

  const doRetry = async (err) => {
    if (isRateLimitError(err) && _attempt < MAX_RETRIES) {
      const delayMs = parseRetryDelay(err.message);
      const secs = Math.ceil(delayMs / 1000);
      for (let s = secs; s > 0; s--) {
        if (onStatus) onStatus(`Rate limit hit — retrying in ${s}s (attempt ${_attempt + 1}/${MAX_RETRIES})...`, true);
        await sleep(1000);
      }
      if (onStatus) onStatus("Retrying now...");
      return generateJson(prompt, schemaHint, _attempt + 1, onStatus);
    }
    throw err;
  };

  // --- proxy path ---
  if (shouldUseProxy()) {
    try {
      return await generateViaProxy(prompt, schemaHint);
    } catch (err) {
      try {
        return await doRetry(err);
      } catch {
        console.warn("[NeuroPath Agent] proxy failed after retries:", err);
        return null;
      }
    }
  }

  // --- direct API path ---
  const ai = getClient();
  if (!ai) {
    try {
      return await generateViaProxy(prompt, schemaHint);
    } catch {
      return null;
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `${prompt}\n\nRespond with valid JSON only. Schema:\n${schemaHint}`,
      config: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });
    return parseJson(response.text);
  } catch (err) {
    try {
      return await doRetry(err);
    } catch {
      console.warn("[NeuroPath Agent] direct generateContent failed after retries:", err);
      return null;
    }
  }
}

function nextModalityFallback(current) {
  const order = ["visual", "narrative", "kinesthetic", "sign"];
  const idx = order.indexOf(current);
  return order[(idx + 1) % order.length];
}

function fallbackStruggleResolution({
  struggleType,
  struggleDetails,
  currentModality,
  studentProfile,
  lesson,
}) {
  const recommendedModality = nextModalityFallback(currentModality);
  const profileSummary = studentProfile.deafOrHoh
    ? "Deaf/HoH profile — sign language is primary."
    : `Primary modality: ${studentProfile.primary || "unknown"} (${studentProfile.confidence || 0}% confidence).`;

  let adaptedSnippet = null;
  const title = lesson.title || "the concept";
  if (recommendedModality === "narrative") {
    adaptedSnippet = `Let's use a story analogy for "${title}": Imagine a busy harbor where ships can only dock when the tides are high. If a storm rises (an unbalanced change), the ships are forced to adjust their course. Similarly, this concept states that changes only occur when an external force shifts the system.`;
  } else if (recommendedModality === "shorter") {
    adaptedSnippet = `Key takeaway for "${title}": Focus on the primary rule. The system remains in its current state until an external variable or force acts directly on it.`;
  } else if (recommendedModality === "visual") {
    adaptedSnippet = `Visual breakdown for "${title}": Trace the balance between forces. If they are equal, there is no movement; if one side becomes larger, the balance shifts in that direction.`;
  }

  return {
    recommendedModality,
    profileAnalysis: profileSummary,
    modalityRationale: `Current ${currentModality} format did not resolve ${struggleType}. Rotating to ${recommendedModality} as the next best representation.`,
    interventionMessage: getDefaultInterventionMessage(recommendedModality),
    adaptedSnippet,
    teacherNote: `Student showed ${struggleType} on "${lesson.title}". Switched from ${currentModality} to ${recommendedModality}.`,
    source: "fallback",
  };
}

function getDefaultInterventionMessage(modality) {
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
}

/**
 * Autonomous tutor agent: analyzes struggle signals + learner profile and selects intervention.
 */
export async function resolveStruggle({
  struggleType,
  struggleDetails,
  currentModality,
  studentProfile,
  lesson,
  microAttempts = 0,
}) {
  const fallback = () =>
    fallbackStruggleResolution({
      struggleType,
      struggleDetails,
      currentModality,
      studentProfile,
      lesson,
    });

  if (!getClient()) return fallback();

  try {
    const result = await generateJson(
      `You are NeuroPath, an autonomous tutoring agent for inclusive adaptive learning.

A student is struggling during a lesson. Decide the best intervention.

LESSON:
- Title: ${lesson.title}
- Subject: ${lesson.subject}
- Description: ${lesson.description}
- Current modality being shown: ${currentModality}

STRUGGLE SIGNAL:
- Type: ${struggleType}
- Details: ${struggleDetails}
- Micro-check wrong attempts: ${microAttempts}

LEARNER PROFILE:
${JSON.stringify(
  {
    primary: studentProfile.primary,
    confidence: studentProfile.confidence,
    breakdown: studentProfile.breakdown,
    deafOrHoh: studentProfile.deafOrHoh,
    cognitiveStyle: studentProfile.cognitiveStyle,
    processingSpeed: studentProfile.processingSpeed,
    effort: studentProfile.effort,
  },
  null,
  2
)}

RULES:
- recommendedModality must be one of: ${MODALITIES.join(", ")}
- Prefer a modality DIFFERENT from currentModality unless deafOrHoh is true (then prefer "sign" when appropriate)
- profileAnalysis: 1 sentence explaining what the profile implies
- modalityRationale: 1-2 sentences explaining WHY this modality will help THIS struggle
- interventionMessage: friendly 1-2 sentences for the student
- adaptedSnippet: optional 2-4 sentence re-explanation tailored to recommendedModality (null if not needed)
- teacherNote: 1 sentence for the teacher dashboard`,
      `{
  "recommendedModality": "visual|narrative|kinesthetic|sign",
  "profileAnalysis": "string",
  "modalityRationale": "string",
  "interventionMessage": "string",
  "adaptedSnippet": "string|null",
  "teacherNote": "string"
}`
    );

    if (!MODALITIES.includes(result.recommendedModality)) {
      result.recommendedModality = nextModalityFallback(currentModality);
    }

    return { ...result, source: "gemini" };
  } catch (err) {
    console.warn("[NeuroPath Agent] resolveStruggle failed, using fallback:", err);
    return fallback();
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function normalizeGloss(gloss) {
  if (!Array.isArray(gloss)) return [];
  return gloss.map((item) => {
    if (typeof item === "string") return { gloss: item.toUpperCase(), duration: 700 };
    return {
      gloss: String(item.gloss || item).toUpperCase(),
      duration: item.duration || 700,
    };
  });
}

export async function translateText(text, targetLang) {
  if (!getClient()) {
    throw new Error("Missing API Key. Please click the key icon to configure Gemini.");
  }
  const prompt = `Translate the following educational text into ${targetLang}. Preserve all formatting, tone, and spacing exactly as it appears. DO NOT add any extra commentary.

TEXT TO TRANSLATE:
"""
${text}
"""`;
  const schema = `{ "translated_text": "string" }`;
  const res = await generateJson(prompt, schema);
  return res.translated_text;
}

export async function generateLessonFoundation(sourceText, fileName = "upload", onStatus = null) {
  const trimmed = sourceText.trim().slice(0, 4000);
  if (!trimmed) throw new Error("No readable text found in the file.");

  if (!getClient()) {
    throw new Error(
      "Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file."
    );
  }

  const result = await generateJson(
    `You are NeuroPath's content ingestion agent. Extract the core foundation and a shared quiz from this material. Do NOT generate full explanations yet.

SOURCE FILE: ${fileName}

CONTENT:
"""
${trimmed}
"""

Create a base title, subject, and description.
Include 1 microCheck (3 options) and 2 assessment questions. These questions must test the original facts.`,
    `{
  "title": "string",
  "subject": "string",
  "description": "string",
  "microCheck": {
    "question": "string",
    "options": ["string", "string", "string"],
    "answerIndex": 0,
    "explanation": "string"
  },
  "assessment": [
    { "id": "q1", "question": "string", "options": ["string", "string", "string"], "answerIndex": 0 }
  ]
}`,
    0,
    onStatus
  );

  if (!result) {
    const rawTitle = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") || "Uploaded Lesson";
    const cleanTitle = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);
    return {
      id: `${slugify(cleanTitle)}-${Date.now().toString(36)}`,
      title: cleanTitle,
      subject: "Custom Study",
      description: trimmed.slice(0, 220) + "...",
      originalText: trimmed,
      generated: true,
      microCheck: {
        question: `Based on the text about "${cleanTitle}", what is the core concept being discussed?`,
        options: [
          `The key principles and mechanics of ${cleanTitle}.`,
          "An unrelated historical debate.",
          "A description of unrelated events."
        ],
        answerIndex: 0,
        explanation: `Correct! The uploaded text directly explains the principles of ${cleanTitle}.`
      },
      assessment: [
        { 
          id: "q1", 
          question: `What is the primary topic covered in the study of ${cleanTitle}?`, 
          options: [
            `Understanding the structures and behaviors of ${cleanTitle}.`, 
            "The history of unrelated scientific discoveries.", 
            "A creative writing story."
          ], 
          answerIndex: 0 
        },
        { 
          id: "q2", 
          question: `Which of the following statements is supported by the text of ${cleanTitle}?`, 
          options: [
            "The concepts follow consistent, definable rules.", 
            "The behaviors are completely random and unpredictable.", 
            "The system described has no practical application."
          ], 
          answerIndex: 0 
        }
      ],
      modalities: {}
    };
  }

  const id = `${slugify(result.title || "lesson")}-${Date.now().toString(36)}`;

  return {
    id,
    title: result.title || "Generated Lesson",
    subject: result.subject || "General",
    description: result.description || trimmed.slice(0, 200),
    originalText: trimmed,
    generated: true,
    microCheck: result.microCheck || {
      question: "What is the main idea of this lesson?",
      options: ["Option A", "Option B", "Option C"],
      answerIndex: 1,
      explanation: "Review the lesson content and try again.",
    },
    assessment: result.assessment || [],
    modalities: {}
  };
}

export async function generateStoryMode(foundation) {
  const result = await generateJson(
    `You are NeuroPath's narrative tutor. Rewrite the following educational content as a short narrative with relatable characters or analogies. Stay factually accurate to the source.

CONTENT:
"""
${foundation.originalText}
"""`,
    `{
  "storyTitle": "string",
  "content": "string",
  "illustration": "string"
}`
  );

  if (!result) {
    const title = foundation.title || "the Concept";
    const text = foundation.originalText || foundation.description || "";
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15);
    const keyPoint = sentences.length > 0 ? sentences[0] : "the principles described in the material";
    
    return {
      storyTitle: `The Analogy of ${title}`,
      content: `To understand ${title}, let's look at a simple story analogy:\n\nImagine a busy workshop where every tool has a specific job. If one part is changed, the rest must adapt. Similarly, the concept of ${title} states that: "${keyPoint}."\n\nHistorically, when scientists first analyzed these patterns, they realized they behave just like a chain reaction. By tracing how these elements connect, we can visualize the relationships clearly.`,
      illustration: `A visual metaphor illustrating ${title}.`
    };
  }

  return result;
}

export async function generateShorterMode(foundation) {
  const result = await generateJson(
    `You are NeuroPath's direct tutor. Compress the following educational content into a straightforward, plain-language explanation without fluff. Each section/heading should be a 2-4 sentence paragraph.

CONTENT:
"""
${foundation.originalText}
"""`,
    `{
  "content": "string"
}`
  );

  if (!result) {
    const text = foundation.originalText || foundation.description || "";
    const paragraphs = text
      .split(/\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 30);
    
    let content = paragraphs.slice(0, 3).map(p => `• ${p}`).join("\n\n");
    if (!content) {
      content = `• Core Fact: ${foundation.title || "The Concept"} represents a key system in this field.\n\n• Key Takeaway: ${foundation.description || "The core interaction defines how the system behaves."}`;
    }
    
    return {
      content: content
    };
  }

  return result;
}

export async function generateVisualMode(foundation) {
  const result = await generateJson(
    `You are NeuroPath's visual tutor. Explain the educational content with a concise paragraph.
Instead of generating a diagram yourself, provide an exact Wikipedia article title that best matches this concept so we can fetch its main educational diagram. Also provide 3 highly relevant YouTube video search queries for this topic.

CONTENT:
"""
${foundation.originalText}
"""`,
    `{
  "content": "string",
  "wikiTopic": "string (e.g. 'Photosynthesis' or 'Computer_architecture')",
  "searchQuery": "string (e.g. 'Photosynthesis diagram flowchart')",
  "videos": [
    { "title": "string", "channel": "string", "duration": "string", "searchQuery": "string" }
  ]
}`
  );

  if (!result) {
    return {
      content: `${foundation.title}: ${foundation.description || "Core ideas and how they connect."}`,
      wikiTopic: (foundation.title || "science").replace(/\s+/g, "_"),
      searchQuery: foundation.title || "science",
      videos: [
        { title: (foundation.title || "Topic") + " Tutorial", channel: "Educational Video", duration: "10:00", searchQuery: (foundation.title || "Topic") + " crash course" }
      ]
    };
  }

  if (!result.videos || result.videos.length === 0) {
    result.videos = [
      { title: foundation.title + " Tutorial", channel: "Educational Video", duration: "10:00", searchQuery: foundation.title + " crash course" }
    ];
  }
  
  return result;
}

function buildFallbackSignStudy(foundation) {
  const source = foundation.originalText || foundation.description || "";
  const sentences = source
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8)
    .slice(0, 6);

  const sections = sentences.map((sentence, i) => {
    const words = sentence
      .split(/\s+/)
      .map((w) => w.replace(/[^a-zA-Z'-]/g, ""))
      .filter((w) => w.length > 2 && !["the", "and", "for", "that", "with"].includes(w.toLowerCase()));

    const tokens = words.map((word) =>
      enrichToken({ gloss: word.toUpperCase(), word, duration: 600 })
    );

    return {
      title: `Part ${i + 1}`,
      sentences: [{ tokens }],
    };
  });

  const fullSequence = flattenSignSections(sections);

  return {
    signSystem: "SgSL",
    mode: "full-study",
    text: foundation.description || source.slice(0, 300),
    summaryGloss: foundation.title || "Lesson overview",
    sections,
    fullSequence,
    gloss: fullSequence,
    tokenCount: fullSequence.length,
  };
}

function normalizeSignStudyResult(result, foundation) {
  result.signSystem = result.signSystem || "SgSL";
  result.mode = "full-study";

  if (result.sections?.length) {
    result.sections = result.sections.map((section) => ({
      ...section,
      sentences: (section.sentences || []).map((sentence) => ({
        ...sentence,
        tokens: (sentence.tokens || []).map(enrichToken),
      })),
    }));
    result.fullSequence = flattenSignSections(result.sections);
  } else if (result.gloss?.length) {
    result.fullSequence = result.gloss.map(enrichToken);
    result.sections = [
      {
        title: "Overview",
        sentences: [{ tokens: result.fullSequence }],
      },
    ];
  } else {
    return buildFallbackSignStudy(foundation);
  }

  result.gloss = result.fullSequence;
  result.tokenCount = result.fullSequence.length;
  return result;
}

/**
 * Full syllabus → word-by-word SgSL gloss sequence for 3D sign study (Deaf/HoH learners).
 */
export async function generateFullSignStudy(foundation) {
  const source = (foundation.originalText || foundation.description || "").slice(0, 10000);

  if (!getClient() && !shouldUseProxy()) {
    return buildFallbackSignStudy(foundation);
  }

  try {
    const result = await generateJson(
      `${SGSL_PROMPT_PREFIX}

You are building a COMPLETE sign-language study version of educational material for Deaf/HoH students who prefer learning through signs over reading text.

TASK:
1. Summarize the content into 3-6 teachable sections (short section titles).
2. For EACH section, break content into simple sentences.
3. For EACH sentence, provide EVERY meaningful word as a separate gloss token (skip only: a, an, the, is, are, was, of, to, in).
4. Each token needs: gloss (UPPERCASE SgSL label), word (English), duration (500-900ms), pose (one of: OBJECT, STAY, SAME, UNTIL, PUSH, CHANGES, WATER, SUNLIGHT, MAKE, HELP, YES, NO, GAS, ABSORB, RELEASE, OXYGEN, SUGAR).

This will drive a 3D avatar that signs the entire summarized syllabus word-by-word.

SOURCE:
"""
${source}
"""`,
      `{
  "text": "one sentence plain summary for teachers",
  "summaryGloss": "short gloss title of lesson",
  "signSystem": "SgSL",
  "sections": [
    {
      "title": "string",
      "sentences": [
        {
          "tokens": [
            { "gloss": "WORD", "word": "word", "duration": 650, "pose": "OBJECT" }
          ]
        }
      ]
    }
  ]
}`
    );

    return normalizeSignStudyResult(result, foundation);
  } catch (err) {
    console.warn("[NeuroPath Agent] generateFullSignStudy failed, using fallback:", err);
    return buildFallbackSignStudy(foundation);
  }
}

/** Generates full word-by-word 3D sign study from PDF/notes content */
export async function generateSignMode(foundation) {
  return generateFullSignStudy(foundation);
}
