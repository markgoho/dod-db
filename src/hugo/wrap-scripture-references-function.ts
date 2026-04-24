import { findScriptureMatches } from "./find-scripture-matches.js";

/**
 * Wrap scripture references in the given text with Hugo shortcodes.
 * The shortcode renders as a link to Bible Gateway (NRSVUE translation).
 *
 * @param text - The transcript text to process
 * @returns Text with scripture references wrapped in shortcodes
 */
export function wrapScriptureReferences(text: string): string {
  const matches = findScriptureMatches(text);

  if (matches.length === 0) {
    return text;
  }

  // Sort matches by position descending (process from end to preserve indices)
  const sortedMatches = [...matches].toSorted((a, b) => b.start - a.start);

  let result = text;

  for (const match of sortedMatches) {
    const isWholeBookReference = !/\d/.test(match.normalizedReference);
    const displayAttribute =
      isWholeBookReference && match.originalText !== match.normalizedReference
        ? ` display="${match.originalText}"`
        : "";
    const shortcode = `{{< scripture ref="${match.normalizedReference}"${displayAttribute} >}}`;

    result = result.slice(0, match.start) + shortcode + result.slice(match.end);
  }

  return result;
}
