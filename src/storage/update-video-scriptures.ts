import { loadProcessedVideos } from "./load-processed-videos.js";
import type { EpisodeScripture } from "./processed-videos.js";
import { saveProcessedVideos } from "./save-processed-videos.js";

/**
 * Update scripture references for a specific video by videoId.
 */
export async function updateVideoScriptures(
  videoId: string,
  scriptures: EpisodeScripture[],
): Promise<void> {
  const videos = await loadProcessedVideos();

  const videoIndex = videos.findIndex(v => v.videoId === videoId);

  if (videoIndex === -1) {
    throw new Error(`Video ${videoId} not found in processed videos`);
  }

  const video = videos[videoIndex];
  if (!video) {
    throw new Error(`Video ${videoId} not found in processed videos`);
  }

  video.scriptures = scriptures;
  await saveProcessedVideos(videos);
}
