import { youtubeConfig } from "../config/youtube.js";
import { extractCleanTitle } from "../hugo/extract-clean-title.js";
import { slugifyTitle } from "../hugo/slugify-title.js";
import { fetchRawVideoMetadata } from "../pipeline/fetch-video-metadata.js";
import { loadProcessedVideos } from "../storage/load-processed-videos.js";
import {
  fetchPatreonRss,
  isAfterPartyItem,
  matchRssItemToVideo,
  parsePatreonRss,
} from "./index.js";
import type { PatreonRssItem } from "./patreon-rss-item.js";

const CHANNEL_URL = "https://www.youtube.com/@DataOverDogma/videos";
const RECENT_YOUTUBE_RESULTS = 40;
const EXTENDED_YOUTUBE_RESULTS = 200;
const MAX_CANDIDATES = 5;
const STATIC_IMAGE_MAX_FPS = 6;
const REAL_VIDEO_MIN_FPS = 15;

export type YouTubeCandidateVideoType = "video" | "audio-only" | "unknown";

export interface YouTubeCandidate {
  id: string;
  title: string;
  url: string;
  score: number;
  videoType: YouTubeCandidateVideoType;
}

export interface NextUnprocessedEpisodeResult {
  rssItem: PatreonRssItem;
  candidates: YouTubeCandidate[];
}

interface YouTubeVideo {
  id: string;
  title: string;
}

function normalizeTitle(title: string): string {
  return slugifyTitle(extractCleanTitle(title));
}

function scoreCandidate(item: PatreonRssItem, video: YouTubeVideo): number {
  const normalizedItemTitle = normalizeTitle(item.title);
  const normalizedVideoTitle = normalizeTitle(video.title);

  if (!normalizedItemTitle || !normalizedVideoTitle) {
    return 0;
  }

  if (normalizedItemTitle === normalizedVideoTitle) {
    return 100;
  }

  if (normalizedVideoTitle.includes(normalizedItemTitle)) {
    return 80;
  }

  if (normalizedItemTitle.includes(normalizedVideoTitle)) {
    return 60;
  }

  return 0;
}

function rankCandidates(
  item: PatreonRssItem,
  videos: YouTubeVideo[],
): YouTubeCandidate[] {
  return videos
    .map(video => ({
      id: video.id,
      title: video.title,
      url: `https://www.youtube.com/watch?v=${video.id}`,
      score: scoreCandidate(item, video),
      videoType: "unknown" as const,
    }))
    .filter(candidate => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, MAX_CANDIDATES);
}

function classifyCandidateVideoType(
  fps: number | undefined,
  vcodec: string | undefined,
): YouTubeCandidateVideoType {
  if (vcodec === "none") {
    return "audio-only";
  }

  if (typeof fps !== "number") {
    return "unknown";
  }

  if (fps <= STATIC_IMAGE_MAX_FPS) {
    return "audio-only";
  }

  if (fps >= REAL_VIDEO_MIN_FPS) {
    return "video";
  }

  return "unknown";
}

async function enrichCandidatesWithVideoType(
  candidates: YouTubeCandidate[],
): Promise<YouTubeCandidate[]> {
  const results = await Promise.allSettled(
    candidates.map(async candidate => {
      const metadata = await fetchRawVideoMetadata(candidate.id);

      return {
        ...candidate,
        videoType: classifyCandidateVideoType(metadata.fps, metadata.vcodec),
      };
    }),
  );

  return results.map((result, index) => {
    const candidate = candidates[index]!;

    return result.status === "fulfilled"
      ? result.value
      : { ...candidate, videoType: "unknown" };
  });
}

async function fetchLatestYouTubeVideos(
  maxResults: number = RECENT_YOUTUBE_RESULTS,
): Promise<YouTubeVideo[]> {
  const proc = Bun.spawn([
    "yt-dlp",
    CHANNEL_URL,
    "--flat-playlist",
    "--playlist-end",
    maxResults.toString(),
    "--dump-json",
    "--skip-download",
  ]);

  const output = await new Response(proc.stdout).text();
  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    throw new Error(
      `yt-dlp failed to fetch channel videos: exit code ${exitCode}`,
    );
  }

  return output
    .trim()
    .split("\n")
    .flatMap(line => {
      try {
        const data = JSON.parse(line) as { id?: string; title?: string };
        return data.id && data.title
          ? [{ id: data.id, title: data.title }]
          : [];
      } catch {
        return [];
      }
    });
}

export async function findNextUnprocessedEpisode(): Promise<
  NextUnprocessedEpisodeResult | undefined
> {
  if (!youtubeConfig.patreonRssUrl) {
    throw new Error("PATREON_RSS_URL is not set");
  }

  const [rssXml, processedVideos, recentYouTubeVideos] = await Promise.all([
    fetchPatreonRss(youtubeConfig.patreonRssUrl),
    loadProcessedVideos(),
    fetchLatestYouTubeVideos(),
  ]);

  if (!rssXml) {
    throw new Error("Failed to load Patreon RSS");
  }

  const canonicalItems = parsePatreonRss(rssXml)
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

  const recentCandidates = await enrichCandidatesWithVideoType(
    rankCandidates(nextItem, recentYouTubeVideos),
  );

  if (recentCandidates.length > 0) {
    return {
      rssItem: nextItem,
      candidates: recentCandidates,
    };
  }

  const extendedYouTubeVideos = await fetchLatestYouTubeVideos(
    EXTENDED_YOUTUBE_RESULTS,
  );

  return {
    rssItem: nextItem,
    candidates: await enrichCandidatesWithVideoType(
      rankCandidates(nextItem, extendedYouTubeVideos),
    ),
  };
}

export { rankCandidates };
