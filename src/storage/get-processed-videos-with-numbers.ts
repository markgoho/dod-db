import { computeEpisodeNumbers } from "./compute-episode-numbers.js";
import { loadProcessedVideos } from "./load-processed-videos.js";
import type { ProcessedVideo } from "./processed-videos.js";

/**
 * Get all processed videos with episode numbers computed.
 */
export async function getProcessedVideosWithNumbers(): Promise<
  ProcessedVideo[]
> {
  const videos = await loadProcessedVideos();
  return computeEpisodeNumbers(videos);
}
