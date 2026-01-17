import { getProcessedVideosWithNumbers } from "./get-processed-videos-with-numbers.js";
import type { ProcessedVideo } from "./processed-videos.js";

/**
 * Get video by episode number.
 * Returns undefined if not found.
 */
export async function getVideoByEpisodeNumber(
  episodeNumber: number,
): Promise<ProcessedVideo | undefined> {
  const videos = await getProcessedVideosWithNumbers();
  return videos.find(v => v.episodeNumber === episodeNumber);
}
