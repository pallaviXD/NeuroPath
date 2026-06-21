/** Singapore Sign Language (SgSL) gloss reference — aligned with Unmute-style token sequencing */

export const SGSL_SIGN_SYSTEM = "SgSL";

export const SGSL_CORE_GLOSS = [
  { gloss: "OBJECT", duration: 800, note: "Both hands outline the entity" },
  { gloss: "STAY", duration: 600, note: "Flat hands press downward — persistence" },
  { gloss: "SAME", duration: 800, note: "Index fingers meet in center — unchanged state" },
  { gloss: "UNTIL", duration: 500, note: "Forward point — temporal boundary" },
  { gloss: "PUSH", duration: 900, note: "Force applied outward" },
  { gloss: "CHANGES", duration: 700, note: "Morphing handshape — transformation" },
  { gloss: "FORCE", duration: 750, note: "Fist pushes against resistance" },
  { gloss: "MOVE", duration: 650, note: "Flat hand travels in direction" },
  { gloss: "STOP", duration: 550, note: "Chopping motion — halt" },
  { gloss: "IDEA", duration: 700, note: "Finger to temple — concept" },
];

export const SGSL_PROMPT_PREFIX = `You are NeuroPath's Singapore Sign Language (SgSL) translation engine.
Use SgSL gloss conventions (not ASL). Gloss tokens are uppercase English labels used in Singapore Deaf education.
Prefer spatial grammar and classifiers where appropriate.`;

export function enrichGlossSequence(gloss) {
  if (!Array.isArray(gloss)) return [];
  const lookup = Object.fromEntries(SGSL_CORE_GLOSS.map((g) => [g.gloss, g]));
  return gloss.map((item) => {
    const token = typeof item === "string" ? item.toUpperCase() : String(item.gloss || item).toUpperCase();
    const ref = lookup[token];
    return {
      gloss: token,
      duration: item.duration || ref?.duration || 700,
      note: ref?.note || null,
    };
  });
}
