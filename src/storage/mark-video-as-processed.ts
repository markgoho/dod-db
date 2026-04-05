import { youtubeConfig } from "../config/youtube.js";
import {
  computeEpisodeNumbersFromRss,
  fetchPodcastRss,
  parsePodcastRss,
} from "../rss/index.js";
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
  let withNumbers: ProcessedVideo[];

  try {
    const rssXml = await fetchPodcastRss(youtubeConfig.canonicalRssUrl);
    const rssItems = rssXml ? parsePodcastRss(rssXml) : [];
    withNumbers = computeEpisodeNumbersFromRss(videos, rssItems);
  } catch (error) {
    console.warn(
      "Failed to compute episode numbers from canonical RSS:",
      error,
    );
    withNumbers = computeEpisodeNumbers(videos);
  }

  await saveProcessedVideos(withNumbers);

  // Log assigned episode number and return it
  const newVideo = withNumbers.find(v => v.videoId === video.videoId);
  if (newVideo?.episodeNumber) {
    console.log(`✓ Assigned episode number: ${newVideo.episodeNumber}`);
    return newVideo.episodeNumber;
  }
  return undefined;
}
