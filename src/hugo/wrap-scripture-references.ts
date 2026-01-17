/**
 * Shared types for scripture reference processing.
 */

/**
 * A scripture match with position information.
 */
export interface ScriptureMatch {
  /** Start index in input string */
  start: number;
  /** End index in input string */
  end: number;
  /** Original text as it appears in the transcript */
  originalText: string;
  /** Normalized reference for URL (e.g., "Genesis 1:1") */
  normalizedReference: string;
  /** Canonical book name */
  book: string;
}
