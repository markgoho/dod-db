import { extractCleanTitle } from "../hugo/extract-clean-title.js";
import { slugifyTitle } from "../hugo/slugify-title.js";
import type { ProcessedVideo } from "../storage/processed-videos.js";
import type { PatreonRssItem } from "./patreon-rss-item.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MAX_DATE_DISTANCE_DAYS = 3;
const EPISODE_IN_TITLE_PATTERN = /episode\s+\d+/i;

function hasEpisodeNumberInTitle(title: string): boolean {
  return EPISODE_IN_TITLE_PATTERN.test(title);
}

function canUseDateFallback(item: PatreonRssItem): boolean {
  return hasEpisodeNumberInTitle(item.title);
}

function normalizeTitle(title: string): string {
  return slugifyTitle(extractCleanTitle(title));
}

function toUtcDay(value: string): number {
  const date = new Date(value);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function isWithinDateWindow(a: string, b: string): boolean {
  return (
    Math.abs(toUtcDay(a) - toUtcDay(b)) <= MAX_DATE_DISTANCE_DAYS * MS_PER_DAY
  );
}

export function matchRssItemToVideo(
  item: PatreonRssItem,
  videos: ProcessedVideo[],
): ProcessedVideo | undefined {
  const normalizedItemTitle = normalizeTitle(item.title);
  const exactTitleMatches = videos.filter(
    video => normalizeTitle(video.title) === normalizedItemTitle,
  );

  if (exactTitleMatches.length === 1) {
    return exactTitleMatches[0];
  }

  if (exactTitleMatches.length > 1 || !canUseDateFallback(item)) {
    return undefined;
  }

  const dateMatches = videos.filter(video =>
    isWithinDateWindow(video.publishedAt, item.pubDate),
  );

  if (dateMatches.length === 1) {
    return dateMatches[0];
  }

  return undefined;
}
