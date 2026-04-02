import { youtubeConfig } from "../config/youtube.js";
import {
  computeEpisodeNumbersFromRss,
  fetchPatreonRss,
  parsePatreonRss,
} from "../rss/index.js";
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

  try {
    const rssXml = await fetchPatreonRss(youtubeConfig.patreonRssUrl);
    const rssItems = rssXml ? parsePatreonRss(rssXml) : [];
    return computeEpisodeNumbersFromRss(videos, rssItems);
  } catch (error) {
    console.warn("Failed to compute episode numbers from Patreon RSS:", error);
    return computeEpisodeNumbers(videos);
  }
}
