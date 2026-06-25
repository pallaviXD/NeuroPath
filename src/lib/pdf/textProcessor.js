/**
 * Utility for cleaning and partitioning raw text extracted from files
 */

/**
 * Cleans extracted text by removing redundant white spaces, header/footer patterns, and numbering
 * @param {string} text 
 * @returns {string}
 */
export function cleanText(text) {
  if (!text) return "";

  return text
    // Replace carriage returns
    .replace(/\r/g, "")
    // Remove typical PDF header/footer artifacts like page numbering e.g., "Page 1 of 12"
    .replace(/Page\s+\d+\s+of\s+\d+/gi, "")
    // Remove single line numbers or page numbers on their own line
    .replace(/^\s*\d+\s*$/gm, "")
    // Replace multiple consecutive spaces with a single space
    .replace(/[ \t]+/g, " ")
    // Replace 3 or more consecutive newlines with 2 newlines
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Partitions a long text into logical chunks of roughly equal size,
 * respecting sentence boundaries where possible.
 * @param {string} text 
 * @param {number} maxChunkSize (default 4000 characters)
 * @returns {Array<string>}
 */
export function partitionText(text, maxChunkSize = 4000) {
  const cleaned = cleanText(text);
  if (cleaned.length <= maxChunkSize) {
    return [cleaned];
  }

  // Split into sentences using a regex that handles abbreviations reasonably
  const sentences = cleaned.split(/(?<=[.!?])\s+/);
  const chunks = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxChunkSize) {
      currentChunk += (currentChunk ? " " : "") + sentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      // If a single sentence exceeds the chunk limit, split it anyway or place it on its own
      if (sentence.length > maxChunkSize) {
        // Break long sentence by character chunks
        let remaining = sentence;
        while (remaining.length > 0) {
          chunks.push(remaining.slice(0, maxChunkSize).trim());
          remaining = remaining.slice(maxChunkSize);
        }
        currentChunk = "";
      } else {
        currentChunk = sentence;
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Builds standard system/user prompt structures
 * @param {string} text 
 * @returns {string}
 */
export function prepareGeminiPayload(text) {
  return cleanText(text).slice(0, 4500);
}
