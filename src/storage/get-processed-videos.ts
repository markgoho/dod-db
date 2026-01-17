import { loadProcessedVideos } from "./load-processed-videos.js";
import type { ProcessedVideo } from "./processed-videos.js";

/**
 * Alias for loadProcessedVideos for consistency with other functions.
 */
export async function getProcessedVideos(): Promise<ProcessedVideo[]> {
  return loadProcessedVideos();
}
