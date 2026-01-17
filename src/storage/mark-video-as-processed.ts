import { computeEpisodeNumbers } from "./compute-episode-numbers.js";
import { loadProcessedVideos } from "./load-processed-videos.js";
import type { ProcessedVideo } from "./processed-videos.js";
import { saveProcessedVideos } from "./save-processed-videos.js";

/**
 * Add video to processed list with computed episode number.
 */
export async function markVideoAsProcessed(
  video: ProcessedVideo,
): Promise<number | undefined> {
  const videos = await loadProcessedVideos();

  // Check if already exists
  const exists = videos.some(v => v.videoId === video.videoId);
  if (exists) {
    console.warn(`Video ${video.videoId} already marked as processed`);
    return undefined;
  }

  videos.push(video);

  // Recompute episode numbers for entire list
  const withNumbers = computeEpisodeNumbers(videos);

  await saveProcessedVideos(withNumbers);

  // Log assigned episode number and return it
  const newVideo = withNumbers.find(v => v.videoId === video.videoId);
  if (newVideo?.episodeNumber) {
    console.log(`✓ Assigned episode number: ${newVideo.episodeNumber}`);
    return newVideo.episodeNumber;
  }
  return undefined;
}
