import { youtubeConfig } from "../config/youtube.js";
import {
  computeEpisodeNumbersFromRss,
  fetchPodcastRss,
  parsePodcastRss,
} from "../rss/index.js";
import { computeEpisodeNumbers } from "../storage/compute-episode-numbers.js";
import { loadProcessedVideos } from "../storage/load-processed-videos.js";
import type { ProcessedVideo } from "../storage/processed-videos.js";
import { saveProcessedVideos } from "../storage/save-processed-videos.js";

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
  const videos = await loadProcessedVideos();
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
  await saveProcessedVideos(canonicalVideos);
  console.log("✅ Episode numbers repaired");
}

if (import.meta.main) {
  await repairEpisodeNumbers();
}
