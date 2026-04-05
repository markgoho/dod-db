import { EPISODE_NUMBER_OVERRIDES } from "../config/episode-overrides.js";
import { extractCleanTitle } from "../hugo/extract-clean-title.js";
import { slugifyTitle } from "../hugo/slugify-title.js";
import { computeEpisodeNumbers } from "../storage/compute-episode-numbers.js";
import type { ProcessedVideo } from "../storage/processed-videos.js";
import { isAfterPartyItem } from "./is-after-party-item.js";
import { matchRssItemToVideo } from "./match-rss-to-video.js";
import type { PodcastRssItem } from "./patreon-rss-item.js";

function extractEpisodeNumberFromTitle(title: string): number | undefined {
  const match = title.match(/Episode\s+(\d+)/i);
  return match?.[1] ? Number.parseInt(match[1], 10) : undefined;
}

function getExplicitOverrideEpisodeNumber(
  item: PodcastRssItem,
): number | undefined {
  const normalizedTitle = slugifyTitle(extractCleanTitle(item.title));
  return EPISODE_NUMBER_OVERRIDES[normalizedTitle];
}

function getAnchoredEpisodeNumber(item: PodcastRssItem): number | undefined {
  return (
    getExplicitOverrideEpisodeNumber(item) ??
    extractEpisodeNumberFromTitle(item.title) ??
    item.itunesEpisode
  );
}

function fillEpisodeNumbers(
  items: PodcastRssItem[],
): Array<number | undefined> {
  const assigned = items.map(item => getAnchoredEpisodeNumber(item));

  for (const [index, value] of assigned.entries()) {
    if (value !== undefined) {
      continue;
    }

    let previousIndex = index - 1;
    while (previousIndex >= 0 && assigned[previousIndex] === undefined) {
      previousIndex--;
    }

    let nextIndex = index + 1;
    while (nextIndex < assigned.length && assigned[nextIndex] === undefined) {
      nextIndex++;
    }

    const previousValue =
      previousIndex >= 0 ? assigned[previousIndex] : undefined;
    const nextValue =
      nextIndex < assigned.length ? assigned[nextIndex] : undefined;

    if (
      previousValue !== undefined &&
      nextValue !== undefined &&
      nextValue - previousValue === nextIndex - previousIndex
    ) {
      assigned[index] = previousValue + (index - previousIndex);
      continue;
    }

    if (previousValue !== undefined) {
      assigned[index] = previousValue + (index - previousIndex);
      continue;
    }
  }

  return assigned;
}

function getFallbackEpisodeNumbers(
  videos: ProcessedVideo[],
): Map<string, number> {
  const videosWithoutNumbers = videos.map(video => ({
    ...video,
    episodeNumber: undefined,
  }));
  const fallbackNumbers = computeEpisodeNumbers(videosWithoutNumbers);
  return new Map(
    fallbackNumbers.flatMap(video =>
      video.episodeNumber === undefined
        ? []
        : [[video.videoId, video.episodeNumber] as const],
    ),
  );
}

function warnOnMetadataMismatch(
  item: PodcastRssItem,
  assignedEpisodeNumber: number,
): void {
  if (
    item.itunesEpisode === undefined ||
    item.itunesEpisode === assignedEpisodeNumber
  ) {
    return;
  }

  if (getExplicitOverrideEpisodeNumber(item) === assignedEpisodeNumber) {
    return;
  }

  console.warn(
    `Canonical RSS episode mismatch for "${item.title}": itunes:episode=${item.itunesEpisode}, assigned=${assignedEpisodeNumber}`,
  );
}

export function computeEpisodeNumbersFromRss(
  videos: ProcessedVideo[],
  rssItems: PodcastRssItem[],
): ProcessedVideo[] {
  if (rssItems.length === 0) {
    return computeEpisodeNumbers(videos);
  }

  const canonicalItems = rssItems
    .filter(item => !isAfterPartyItem(item))
    .sort(
      (a, b) => new Date(a.pubDate).getTime() - new Date(b.pubDate).getTime(),
    );

  const assignedNumbers = fillEpisodeNumbers(canonicalItems);
  const rssAssignedNumbers = new Map<string, number>();

  for (const [index, item] of canonicalItems.entries()) {
    const matchedVideo = matchRssItemToVideo(item, videos);
    const assignedEpisodeNumber = assignedNumbers[index];

    if (!matchedVideo || assignedEpisodeNumber === undefined) {
      continue;
    }

    warnOnMetadataMismatch(item, assignedEpisodeNumber);
    rssAssignedNumbers.set(matchedVideo.videoId, assignedEpisodeNumber);
  }

  const fallbackNumbers = getFallbackEpisodeNumbers(videos);

  return videos.map(video => ({
    ...video,
    episodeNumber:
      rssAssignedNumbers.get(video.videoId) ??
      fallbackNumbers.get(video.videoId),
  }));
}
