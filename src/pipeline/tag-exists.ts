import { tagVocabulary } from "../config/tag-vocabulary.js";

/**
 * Check if a tag already exists in the vocabulary.
 *
 * @param canonical - The canonical name to check
 * @returns true if tag exists (case-insensitive), false otherwise
 */
export function tagExists(canonical: string): boolean {
  const lowerCanonical = canonical.toLowerCase();
  return tagVocabulary.some(
    tag => tag.canonical.toLowerCase() === lowerCanonical,
  );
}
