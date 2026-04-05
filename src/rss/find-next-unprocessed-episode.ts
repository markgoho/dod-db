import { youtubeConfig } from "../config/youtube.js";
import { loadProcessedVideos } from "../storage/load-processed-videos.js";
import { fetchPodcastRss } from "./fetch-patreon-rss.js";
import { isAfterPartyItem } from "./is-after-party-item.js";
import { matchRssItemToVideo } from "./match-rss-to-video.js";
import { parsePodcastRss } from "./parse-patreon-rss.js";
import type { PodcastRssItem } from "./patreon-rss-item.js";

export interface NextUnprocessedEpisodeResult {
  rssItem: PodcastRssItem;
  audioUrl: string;
}

export async function findNextUnprocessedEpisode(
  rssUrlOverride?: string,
): Promise<NextUnprocessedEpisodeResult | undefined> {
  const canonicalRssUrl = rssUrlOverride ?? youtubeConfig.canonicalRssUrl;

  if (!canonicalRssUrl) {
    throw new Error("Canonical RSS URL is not set");
  }

  const [rssXml, processedVideos] = await Promise.all([
    fetchPodcastRss(canonicalRssUrl),
    loadProcessedVideos(),
  ]);

  if (!rssXml) {
    throw new Error("Failed to load canonical RSS");
  }

  const canonicalItems = parsePodcastRss(rssXml)
    .filter(item => !isAfterPartyItem(item))
    .sort(
      (a, b) => new Date(a.pubDate).getTime() - new Date(b.pubDate).getTime(),
    );

  const nextItem = canonicalItems.find(
    item => matchRssItemToVideo(item, processedVideos) === undefined,
  );

  if (!nextItem) {
    return undefined;
  }

  if (!nextItem.enclosureUrl) {
    throw new Error(
      `Next unprocessed RSS episode is missing enclosure URL: ${nextItem.title}`,
    );
  }

  return {
    rssItem: nextItem,
    audioUrl: nextItem.enclosureUrl,
  };
}
