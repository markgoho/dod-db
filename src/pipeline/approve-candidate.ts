import type { CorrectionTracker } from "./correction-tracker.js";

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
