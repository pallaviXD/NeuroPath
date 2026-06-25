import { enrichToken } from "../../lib/signPoseMap";

const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "of", "to", "in", "on", "at", "by", "for", "with", "about", "against", "during", "before", "after", "above", "below"
]);

export class IslTranslator {
  constructor() {
    this.language = "ISL";
  }

  /**
   * Translates text into ISL gloss tokens
   * @param {string} text 
   * @returns {Promise<Array>}
   */
  async translate(text) {
    if (!text) return [];

    // Clean and split text into sentences
    const sentences = text
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2);

    const glossSequence = [];

    sentences.forEach((sentence) => {
      // Split into words, remove punctuation, filter stop words
      const words = sentence
        .split(/\s+/)
        .map((w) => w.replace(/[^a-zA-Z'-]/g, ""))
        .filter((w) => w.length > 1 && !STOP_WORDS.has(w.toLowerCase()));

      words.forEach((word) => {
        const gloss = word.toUpperCase();
        // Enrich using our standard signPoseMap
        const token = enrichToken({
          gloss,
          word,
          duration: 700,
        });
        glossSequence.push(token);
      });
    });

    return glossSequence;
  }
}
