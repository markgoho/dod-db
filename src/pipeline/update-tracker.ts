import type {
  CorrectionCandidate,
  CorrectionTracker,
} from "./correction-tracker.js";

/**
 * Calculate confidence score for a correction candidate.
 * Higher score = higher confidence it should be added to deterministic list.
 */
function calculateConfidence(candidate: CorrectionCandidate): number {
  let score = 0;

  // Episode count (most important factor)
  // 1 episode: 0 points, 2: 20, 3: 35, 4: 47, 5+: 55
  score += Math.min(55, candidate.episodeCount * 20 - 20);

  // Total occurrences within those episodes
  // 3-5: 10 points, 6-9: 15, 10+: 20
  if (candidate.totalOccurrences >= 10) score += 20;
  else if (candidate.totalOccurrences >= 6) score += 15;
  else if (candidate.totalOccurrences >= 3) score += 10;

  // Category weight
  switch (candidate.category) {
    case "biblical-term": {
      score += 15;
      break;
    }
    case "proper-noun": {
      score += 10;
      break;
    }
    case "spelling": {
      {
        score += 5;
        // No default
      }
      break;
    }
  }
  // capitalization gets 0 (lowest priority)

  // Word specificity (longer words are more specific)
  const avgLength =
    (candidate.original.length + candidate.corrected.length) / 2;
  if (avgLength >= 8)
    score += 10; // Long words (e.g., "Septuagint")
  else if (avgLength >= 5) score += 5; // Medium words

  return Math.min(100, score);
}

/**
 * Update tracker with corrections from a new episode.
 */
export function updateTracker(
  tracker: CorrectionTracker,
  episodeId: string,
  corrections: Array<{
    original: string;
    corrected: string;
    category: CorrectionCandidate["category"];
    count: number;
    examples: string[];
    correctedExamples: string[];
    timestamps: string[];
  }>,
): CorrectionTracker {
  const now = new Date().toISOString();

  for (const correction of corrections) {
    const key = `${correction.original}→${correction.corrected}`;

    if (tracker.candidates[key]) {
      // Update existing candidate
      const candidate = tracker.candidates[key];
      candidate.totalOccurrences += correction.count;

      if (!candidate.episodes.includes(episodeId)) {
        candidate.episodeCount++;
        candidate.episodes.push(episodeId);
      }

      // Add new examples, timestamps, and episode IDs (keep max 3)
      for (let index = 0; index < correction.examples.length; index++) {
        const example = correction.examples[index];
        const correctedExample = correction.correctedExamples[index];
        const timestamp = correction.timestamps[index];
        if (
          candidate.examples.length < 3 &&
          example &&
          !candidate.examples.includes(example)
        ) {
          candidate.examples.push(example);
          if (correctedExample) {
            if (candidate.correctedExamples) {
              candidate.correctedExamples.push(correctedExample);
            } else {
              candidate.correctedExamples = [correctedExample];
            }
          }
          if (timestamp) {
            if (candidate.timestamps) {
              candidate.timestamps.push(timestamp);
            } else {
              candidate.timestamps = [timestamp];
            }
            if (candidate.episodeIds) {
              candidate.episodeIds.push(episodeId);
            } else {
              candidate.episodeIds = [episodeId];
            }
          }
        }
      }

      candidate.lastSeen = now;
      candidate.confidence = calculateConfidence(candidate);
    } else {
      // New candidate
      tracker.candidates[key] = {
        original: correction.original,
        corrected: correction.corrected,
        category: correction.category,
        totalOccurrences: correction.count,
        episodeCount: 1,
        episodes: [episodeId],
        examples: correction.examples.slice(0, 3),
        correctedExamples: correction.correctedExamples.slice(0, 3),
        timestamps: correction.timestamps.slice(0, 3),
        episodeIds: correction.timestamps.slice(0, 3).map(() => episodeId), // Same episode for all
        confidence: 0, // Will be calculated below
        firstSeen: now,
        lastSeen: now,
        status: "pending",
      };
      tracker.candidates[key].confidence = calculateConfidence(
        tracker.candidates[key],
      );
    }
  }

  return tracker;
}
