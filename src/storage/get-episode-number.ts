import { getProcessedVideosWithNumbers } from "./get-processed-videos-with-numbers.js";

/**
 * Get episode number for a video ID.
 * Returns undefined if video not found or has no episode number.
 */
export async function getEpisodeNumber(
  videoId: string,
): Promise<number | undefined> {
  const videos = await getProcessedVideosWithNumbers();
  const video = videos.find(v => v.videoId === videoId);
  return video?.episodeNumber;
}
