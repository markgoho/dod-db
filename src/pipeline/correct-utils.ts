import type { CorrectionRule } from '../config/corrections.js';

/**
 * Escapes special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Apply deterministic corrections to a transcript.
 * Uses case-insensitive whole-word matching.
 *
 * @param text - The transcript text to correct
 * @param rules - Array of correction rules to apply
 * @returns Corrected text and count of replacements made
 */
export function applyDeterministicCorrections(
  text: string,
  rules: CorrectionRule[],
): { correctedText: string; count: number } {
  let correctedText = text;
  let count = 0;

  for (const [variations, correction] of rules) {
    for (const variation of variations) {
      // Case-insensitive whole-word replacement
      const pattern = new RegExp(`\\b${escapeRegex(variation)}\\b`, 'gi');
      const matches = correctedText.match(pattern);
      if (matches) {
        correctedText = correctedText.replaceAll(pattern, correction);
        count += matches.length;
      }
    }
  }

  return { correctedText, count };
}

/**
 * Deduplicate overlapping text from corrected chunks.
 * Removes overlap characters from the beginning of each chunk (except the first).
 *
 * @param correctedChunks - Array of corrected chunk texts
 * @param overlapSize - Number of characters to remove from start of each chunk
 * @returns Deduplicated concatenated text
 */
export function deduplicateChunks(
  correctedChunks: string[],
  overlapSize: number,
): string {
  if (correctedChunks.length === 0) return '';

  // First chunk has no leading overlap
  let result = correctedChunks[0] ?? '';

  // Remove overlap from subsequent chunks
  for (let i = 1; i < correctedChunks.length; i++) {
    const chunk = correctedChunks[i];
    if (chunk) {
      const trimmed = chunk.slice(overlapSize);
      result += trimmed;
    }
  }

  return result;
}

