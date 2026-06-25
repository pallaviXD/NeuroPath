import { AVAILABLE_WORDS } from "./wordIndex";
import { AVAILABLE_LETTERS } from "./letterIndex";

class SVGSignEngine {
  constructor() {
    this.assetBase = "/signs";
    this.wordCache = new Map();
    this.letterCache = new Map();
  }

  /**
   * Check if a specific file exists on the server using static indexes
   * fallback to HEAD request only if not found in cache.
   */
  async wordExists(word) {
    const wordLower = word.toLowerCase().trim();
    if (AVAILABLE_WORDS.has(wordLower)) {
      return true;
    }
    // Fallback: check if the asset actually exists via HEAD check
    try {
      const response = await fetch(`${this.assetBase}/words/${wordLower}.svg`, { method: "HEAD" });
      return response.ok;
    } catch {
      return false;
    }
  }

  async letterExists(letter) {
    const char = letter.toUpperCase().trim();
    if (AVAILABLE_LETTERS.has(char)) {
      return true;
    }
    try {
      const response = await fetch(`${this.assetBase}/alphabet/${char}.svg`, { method: "HEAD" });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Look up if a word sign SVG is available
   * @param {string} word 
   * @returns {Promise<string|null>}
   */
  async getWordSign(word) {
    if (!word) return null;
    const wordLower = word.toLowerCase().trim();

    if (this.wordCache.has(wordLower)) {
      return this.wordCache.get(wordLower);
    }

    const exists = await this.wordExists(wordLower);
    const path = `${this.assetBase}/words/${wordLower}.svg`;

    if (exists) {
      this.wordCache.set(wordLower, path);
      return path;
    }

    this.wordCache.set(wordLower, null);
    return null;
  }

  /**
   * Look up if a letter sign SVG is available
   * @param {string} letter 
   * @returns {Promise<string>}
   */
  async getLetterSign(letter) {
    const char = letter.toUpperCase().trim();

    if (this.letterCache.has(char)) {
      return this.letterCache.get(char);
    }

    const exists = await this.letterExists(char);
    const path = `${this.assetBase}/alphabet/${char}.svg`;

    if (exists) {
      this.letterCache.set(char, path);
      return path;
    }

    // Default fallback to A if letter SVG is missing
    const fallbackPath = `${this.assetBase}/alphabet/A.svg`;
    return fallbackPath;
  }

  /**
   * Translates a word to rendering paths
   * @param {string} word 
   * @returns {Promise<Object>} { type: 'word'|'letters', paths: Array, fallback: boolean }
   */
  async renderWord(word) {
    const wordSign = await this.getWordSign(word);

    if (wordSign) {
      return {
        type: "word",
        paths: [wordSign],
        fallback: false,
      };
    }

    // Fallback: letters fingerspelling
    const letters = word.toUpperCase().split("").filter(c => c >= "A" && c <= "Z");
    const paths = await Promise.all(
      letters.map((char) => this.getLetterSign(char))
    );

    return {
      type: "letters",
      paths,
      fallback: true,
    };
  }
}

export const svgSignEngine = new SVGSignEngine();
export default svgSignEngine;
