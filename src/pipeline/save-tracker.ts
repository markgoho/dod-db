import type { CorrectionTracker } from "./correction-tracker.js";
import { TRACKER_PATH } from "./correction-tracker.js";

/**
 * Save correction tracker to disk.
 */
export async function saveTracker(tracker: CorrectionTracker): Promise<void> {
  tracker.lastUpdated = new Date().toISOString();
  await Bun.write(TRACKER_PATH, JSON.stringify(tracker, undefined, 2));
}
