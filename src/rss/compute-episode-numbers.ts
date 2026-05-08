import type { ProcessedVideo } from "../catalog/episode-catalog.js";

/**
 * Extract episode number from video title if present.
 * Matches patterns like "Episode 69" or "Episode 1".
 * Returns undefined if no episode number found in title.
 */
function extractEpisodeNumberFromTitle(title: string): number | undefined {
  const match = title.match(/Episode\s+(\d+)/i);
  return match?.[1] ? Number.parseInt(match[1], 10) : undefined;
}

/**
 * Compute episode numbers for videos.
 * Prioritizes episode numbers from titles, then fills gaps sequentially.
 *
 * Algorithm:
 * 1. Extract episode numbers from titles (e.g., "Episode 69" → 69)
 * 2. For episodes without title numbers, assign sequential numbers filling gaps
 * 3. Respect manually-set episodeNumber fields (don't override)
 * 4. Sort by publishedAt for chronological ordering
 *
 * This handles cases where:
 * - Episodes are processed out of order
 * - Some episodes lack numbers in titles (special episodes)
 * - Episode numbers in titles are the authoritative source
 */
export function computeEpisodeNumbers(
  videos: ProcessedVideo[],
): ProcessedVideo[] {
  // Sort by publishedAt (ascending), then videoId for determinism
  const sorted = [...videos].toSorted((a, b) => {
    const dateCompare = a.publishedAt.localeCompare(b.publishedAt);
    if (dateCompare !== 0) return dateCompare;
    return a.videoId.localeCompare(b.videoId); // Tiebreaker
  });

  // First pass: Extract episode numbers from titles (authoritative source)
  const withTitleNumbers = sorted.map(video => {
    // If video already has a manually-set episodeNumber, respect it
    if (video.episodeNumber !== undefined) {
      return video;
    }

    // Try to extract episode number from title
    const titleNumber = extractEpisodeNumberFromTitle(video.title);
    if (titleNumber !== undefined) {
      return {
        ...video,
        episodeNumber: titleNumber,
      };
    }

    // No number in title yet - will assign in second pass
    return video;
  });

  // Find which episode numbers are already taken
  const takenNumbers = new Set(
    withTitleNumbers
      .map(v => v.episodeNumber)
      .filter((n): n is number => n !== undefined),
  );

  // Second pass: Assign sequential numbers to episodes without title numbers
  // Fill gaps in the sequence (e.g., if we have 1-15, 17-20, assign 16 to next unnumbered)
  let nextSequential = 1;
  const result = withTitleNumbers.map(video => {
    if (video.episodeNumber !== undefined) {
      return video;
    }

    // Find next available sequential number
    while (takenNumbers.has(nextSequential)) {
      nextSequential++;
    }

    const assignedNumber = nextSequential;
    takenNumbers.add(assignedNumber);
    nextSequential++;

    return {
      ...video,
      episodeNumber: assignedNumber,
    };
  });

  return result;
}
