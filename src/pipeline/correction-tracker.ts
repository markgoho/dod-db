/**
 * Tracks correction candidates across episodes to identify high-confidence
 * additions to the deterministic corrections list.
 */

import * as path from "node:path";

export interface CorrectionCandidate {
  original: string;
  corrected: string;
  category: "capitalization" | "spelling" | "proper-noun" | "biblical-term";
  totalOccurrences: number;
  episodeCount: number;
  episodes: string[]; // Episode IDs where this correction appeared
  examples: string[]; // Raw text example contexts (up to 3)
  correctedExamples?: string[]; // Corrected text examples (parallel to examples)
  timestamps?: string[]; // Timestamps for examples (e.g., ["00:28:53", "00:45:37"])
  episodeIds?: string[]; // Episode ID for each timestamp (parallel array to timestamps)
  confidence: number; // 0-100 score
  firstSeen: string; // ISO date
  lastSeen: string; // ISO date
  status: "pending" | "approved" | "rejected"; // Review status
  reviewedAt?: string; // ISO date when reviewed
  reviewedBy?: string; // Who reviewed it (optional)
}

export interface CorrectionTracker {
  candidates: Record<string, CorrectionCandidate>; // key: "original→corrected"
  lastUpdated: string;
}

const TRACKER_PATH = path.join(
  process.cwd(),
  "data",
  "correction-candidates.json",
);

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
 * Load existing correction tracker from disk.
 */
export async function loadTracker(): Promise<CorrectionTracker> {
  try {
    const file = Bun.file(TRACKER_PATH);
    const exists = await file.exists();

    if (exists) {
      const data = await file.json();
      return data as CorrectionTracker;
    }
  } catch {
    console.warn("Could not load correction tracker, starting fresh");
  }

  return {
    candidates: {},
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Save correction tracker to disk.
 */
export async function saveTracker(tracker: CorrectionTracker): Promise<void> {
  tracker.lastUpdated = new Date().toISOString();
  await Bun.write(TRACKER_PATH, JSON.stringify(tracker, undefined, 2));
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

/**
 * Get high-confidence candidates (score >= threshold).
 */
export function getHighConfidenceCandidates(
  tracker: CorrectionTracker,
  threshold = 50,
): CorrectionCandidate[] {
  return Object.values(tracker.candidates)
    .filter(c => c.confidence >= threshold)
    .sort((a, b) => b.confidence - a.confidence);
}

/**
 * Get candidates by category.
 */
export function getCandidatesByCategory(
  tracker: CorrectionTracker,
  category: CorrectionCandidate["category"],
): CorrectionCandidate[] {
  return Object.values(tracker.candidates)
    .filter(c => c.category === category)
    .sort((a, b) => b.confidence - a.confidence);
}

/**
 * Get pending candidates (not yet reviewed).
 */
export function getPendingCandidates(
  tracker: CorrectionTracker,
): CorrectionCandidate[] {
  return Object.values(tracker.candidates)
    .filter(c => c.status === "pending")
    .sort((a, b) => b.confidence - a.confidence);
}

/**
 * Approve a candidate and mark as reviewed.
 */
export function approveCandidate(
  tracker: CorrectionTracker,
  key: string,
  reviewedBy?: string,
): void {
  const candidate = tracker.candidates[key];
  if (candidate) {
    candidate.status = "approved";
    candidate.reviewedAt = new Date().toISOString();
    if (reviewedBy) {
      candidate.reviewedBy = reviewedBy;
    }
  }
}

/**
 * Reject a candidate and mark as reviewed.
 */
export function rejectCandidate(
  tracker: CorrectionTracker,
  key: string,
  reviewedBy?: string,
): void {
  const candidate = tracker.candidates[key];
  if (candidate) {
    candidate.status = "rejected";
    candidate.reviewedAt = new Date().toISOString();
    if (reviewedBy) {
      candidate.reviewedBy = reviewedBy;
    }
  }
}
