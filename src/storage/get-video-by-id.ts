import { loadProcessedVideos } from "./load-processed-videos.js";
import type { ProcessedVideo } from "./processed-videos.js";

/**
 * Get video by video ID.
 * Returns undefined if not found.
 */
export async function getVideoById(
  videoId: string,
): Promise<ProcessedVideo | undefined> {
  const videos = await loadProcessedVideos();
  return videos.find(v => v.videoId === videoId);
}
