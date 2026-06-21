/** Maps any gloss token to a 3D animation pose understood by SigningAvatar */

export const ANIMATION_POSES = [
  "OBJECT",
  "STAY",
  "SAME",
  "UNTIL",
  "PUSH",
  "CHANGES",
  "SUNLIGHT",
  "ABSORB",
  "WATER",
  "GAS",
  "MAKE",
  "SUGAR",
  "RELEASE",
  "OXYGEN",
  "HELP",
  "YES",
  "NO",
];

const POSE_ALIASES = {
  FORCE: "PUSH",
  MOVE: "PUSH",
  STOP: "STAY",
  IDEA: "OBJECT",
  LEARN: "HELP",
  STUDY: "HELP",
  READ: "SAME",
  WRITE: "MAKE",
  PLANT: "OBJECT",
  FOOD: "SUGAR",
  ENERGY: "GAS",
  LIGHT: "SUNLIGHT",
  HEAT: "GAS",
  COLD: "WATER",
  BIG: "OBJECT",
  SMALL: "SAME",
  FAST: "PUSH",
  SLOW: "STAY",
  GOOD: "YES",
  BAD: "NO",
  MORE: "PUSH",
  LESS: "SAME",
  START: "PUSH",
  FINISH: "STAY",
  WHY: "HELP",
  HOW: "HELP",
  WHAT: "OBJECT",
  WHEN: "UNTIL",
  WHERE: "UNTIL",
};

export function resolvePose(gloss, explicitPose) {
  if (explicitPose && ANIMATION_POSES.includes(explicitPose.toUpperCase())) {
    return explicitPose.toUpperCase();
  }

  const upper = String(gloss || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  if (!upper) return "OBJECT";
  if (ANIMATION_POSES.includes(upper)) return upper;
  if (POSE_ALIASES[upper]) return POSE_ALIASES[upper];

  let hash = 0;
  for (let i = 0; i < upper.length; i++) {
    hash = (hash + upper.charCodeAt(i) * (i + 1)) % ANIMATION_POSES.length;
  }
  return ANIMATION_POSES[hash];
}

export function enrichToken(token) {
  const gloss =
    typeof token === "string"
      ? token.toUpperCase()
      : String(token.gloss || token.word || "").toUpperCase();

  return {
    gloss,
    word: token.word || gloss,
    duration: token.duration || 650,
    pose: resolvePose(gloss, token.pose),
    note: token.note || null,
  };
}

export function flattenSignSections(sections = []) {
  const sequence = [];
  sections.forEach((section) => {
    section.sentences?.forEach((sentence) => {
      sentence.tokens?.forEach((t) => sequence.push(enrichToken(t)));
    });
  });
  return sequence;
}

const STOP_WORDS = new Set([
  "the", "and", "for", "that", "with", "from", "this", "they", "their", "have", "has", "are", "was", "were", "into", "which", "when", "where", "what", "how", "why", "can", "will", "its", "it's", "a", "an", "to", "of", "in", "on", "at", "by", "or", "as", "is", "be", "if", "not", "but",
]);

/** Offline word-by-word sign study from plain syllabus text (no Gemini required). */
export function buildLocalSignStudyFromText(text, sectionTitle = "Overview", keywordGloss = []) {
  const sentences = String(text || "")
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);

  const sections = (sentences.length ? sentences : [String(text || sectionTitle)]).map((sentence, i) => {
    const words = sentence
      .split(/\s+/)
      .map((w) => w.replace(/[^a-zA-Z'-]/g, ""))
      .filter((w) => w.length > 1 && !STOP_WORDS.has(w.toLowerCase()));

    const tokens = words.map((word) =>
      enrichToken({ gloss: word.toUpperCase(), word, duration: 650 })
    );

    return {
      title: sentences.length > 1 ? `Part ${i + 1}` : sectionTitle,
      sentences: [{ tokens }],
    };
  });

  const fullSequence = flattenSignSections(sections);
  const summaryFromKeywords = keywordGloss
    .map((k) => (typeof k === "string" ? k : k.gloss))
    .filter(Boolean)
    .join(" → ");

  return {
    signSystem: "SgSL",
    mode: "full-study",
    text: String(text || "").slice(0, 400),
    summaryGloss:
      summaryFromKeywords ||
      fullSequence
        .slice(0, 8)
        .map((t) => t.gloss)
        .join(" → "),
    sections,
    fullSequence,
    gloss: fullSequence,
    tokenCount: fullSequence.length,
  };
}
