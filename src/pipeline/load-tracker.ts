import type { CorrectionTracker } from "./correction-tracker.js";
import { TRACKER_PATH } from "./correction-tracker.js";

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
