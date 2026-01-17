import type { TagDefinition } from "../config/tag-vocabulary.js";
import { tagVocabulary } from "../config/tag-vocabulary.js";

/**
 * Find a tag in the vocabulary by canonical name.
 *
 * @param canonical - The canonical name to find
 * @returns The tag definition if found, undefined otherwise
 */
export function findTag(canonical: string): TagDefinition | undefined {
  const lowerCanonical = canonical.toLowerCase();
  return tagVocabulary.find(
    tag => tag.canonical.toLowerCase() === lowerCanonical,
  );
}
