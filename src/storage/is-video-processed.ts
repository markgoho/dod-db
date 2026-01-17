import { loadProcessedVideos } from "./load-processed-videos.js";

/**
 * Check if video has been processed.
 */
export async function isVideoProcessed(videoId: string): Promise<boolean> {
  const videos = await loadProcessedVideos();
  return videos.some(v => v.videoId === videoId);
}
