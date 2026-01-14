/**
 * Tag vocabulary utilities for DoD Tools
 */

import { API_BASE_URL } from './constants.js';
import type { TagVocabularyEntry } from './types.js';

// Find vocabulary entry for a tag
export function getTagVocabEntry({
  tagName,
  vocabulary,
}: {
  tagName: string;
  vocabulary: TagVocabularyEntry[];
}): TagVocabularyEntry | undefined {
  return vocabulary.find(
    (v) => v.canonical.toLowerCase() === tagName.toLowerCase(),
  );
}

// Get category for a tag
export function getTagCategory({
  tagName,
  vocabulary,
}: {
  tagName: string;
  vocabulary: TagVocabularyEntry[];
}): string {
  const vocabEntry = getTagVocabEntry({ tagName, vocabulary });
  return vocabEntry?.category || 'other';
}

// Fetch vocabulary from API
export async function fetchVocabulary(): Promise<TagVocabularyEntry[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tag-vocabulary/vocabulary`);
    if (!response.ok) {
      throw new Error('Failed to load vocabulary');
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading vocabulary:', error);
    return [];
  }
}
