/**
 * Utility functions for tag operations.
 */

import type { EpisodeTag } from "../storage/processed-videos.js";

/**
 * Sort tags by mention count (descending), then alphabetically.
 * This ensures stable, predictable ordering across reprocessing runs.
 *
 * @param tags - Array of tags to sort (modified in place)
 * @returns The sorted array (same reference)
 */
export function sortTags(tags: EpisodeTag[]): EpisodeTag[] {
  return tags.toSorted((a, b) => {
    // Primary sort: mentions descending (highest first)
    if (b.mentions !== a.mentions) {
      return b.mentions - a.mentions;
    }
    // Secondary sort: alphabetical ascending (A to Z)
    return a.tag.localeCompare(b.tag);
  });
}
