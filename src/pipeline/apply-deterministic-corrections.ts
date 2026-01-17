import type { CorrectionRule } from "../config/corrections.js";

/**
 * Escapes special regex characters in a string
 */
function escapeRegex(string_: string): string {
  return string_.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
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
      const pattern = new RegExp(
        String.raw`\b${escapeRegex(variation)}\b`,
        "gi",
      );
      const matches = correctedText.match(pattern);
      if (matches) {
        correctedText = correctedText.replaceAll(pattern, correction);
        count += matches.length;
      }
    }
  }

  return { correctedText, count };
}
