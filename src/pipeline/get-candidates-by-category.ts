import type {
  CorrectionCandidate,
  CorrectionTracker,
} from "./correction-tracker.js";

/**
 * Get candidates by category.
 */
export function getCandidatesByCategory(
  tracker: CorrectionTracker,
  category: CorrectionCandidate["category"],
): CorrectionCandidate[] {
  return Object.values(tracker.candidates)
    .filter(c => c.category === category)
    .toSorted((a, b) => b.confidence - a.confidence);
}
