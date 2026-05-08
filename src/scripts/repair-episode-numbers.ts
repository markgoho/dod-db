import { listEpisodes } from "../catalog/episode-catalog.js";
import type { ProcessedVideo } from "../catalog/episode-catalog.js";
import { transact } from "../catalog/episode-catalog.js";
import { youtubeConfig } from "../config/youtube.js";
import { computeEpisodeNumbersFromRss } from "../rss/compute-episode-numbers-from-rss.js";
import { computeEpisodeNumbers } from "../rss/compute-episode-numbers.js";
import { fetchPodcastRss } from "../rss/fetch-patreon-rss.js";
import { parsePodcastRss } from "../rss/parse-patreon-rss.js";

export interface EpisodeNumberMismatch {
  videoId: string;
  title: string;
  storedEpisodeNumber: number | undefined;
  canonicalEpisodeNumber: number | undefined;
}

export function findEpisodeNumberMismatches(
  storedVideos: ProcessedVideo[],
  canonicalVideos: ProcessedVideo[],
): EpisodeNumberMismatch[] {
  const canonicalById = new Map(
    canonicalVideos.map(video => [video.videoId, video.episodeNumber] as const),
  );

  return storedVideos.flatMap(video => {
    const canonicalEpisodeNumber = canonicalById.get(video.videoId);
    if (video.episodeNumber === canonicalEpisodeNumber) {
      return [];
    }

    return [
      {
        videoId: video.videoId,
        title: video.title,
        storedEpisodeNumber: video.episodeNumber,
        canonicalEpisodeNumber,
      },
    ];
  });
}

async function computeCanonicalEpisodeNumbers(
  videos: ProcessedVideo[],
): Promise<ProcessedVideo[]> {
  try {
    const rssXml = await fetchPodcastRss(youtubeConfig.canonicalRssUrl);
    const rssItems = rssXml ? parsePodcastRss(rssXml) : [];
    return computeEpisodeNumbersFromRss(videos, rssItems);
  } catch (error) {
    console.warn(
      "Failed to compute episode numbers from canonical RSS:",
      error,
    );
    return computeEpisodeNumbers(videos);
  }
}

export async function repairEpisodeNumbers(): Promise<void> {
  const videos = await listEpisodes();
  const canonicalVideos = await computeCanonicalEpisodeNumbers(videos);
  const mismatches = findEpisodeNumberMismatches(videos, canonicalVideos);

  if (mismatches.length === 0) {
    console.log("✅ Episode numbers already match canonical numbering");
    return;
  }

  console.log(`Found ${mismatches.length} episode number mismatch(es):\n`);
  for (const mismatch of mismatches) {
    console.log(
      `${mismatch.videoId}: stored=${mismatch.storedEpisodeNumber ?? "?"}, canonical=${mismatch.canonicalEpisodeNumber ?? "?"} — ${mismatch.title}`,
    );
  }

  console.log("\nSaving corrected processed-videos.json...");
  await transact(() => canonicalVideos);
  console.log("✅ Episode numbers repaired");
}

if (import.meta.main) {
  await repairEpisodeNumbers();
}
