import { describe, expect, test } from "bun:test";
import type { ProcessedVideo } from "../storage/processed-videos.js";
import { findEpisodeNumberMismatches } from "./repair-episode-numbers.js";

const baseVideo = {
  processedAt: "2026-01-01T00:00:00Z",
  transcriptPath: "data/transcripts/example.txt",
} satisfies Pick<ProcessedVideo, "processedAt" | "transcriptPath">;

describe("findEpisodeNumberMismatches", () => {
  test("detects stored episode numbers that differ from canonical numbers", () => {
    const storedVideos: ProcessedVideo[] = [
      {
        ...baseVideo,
        videoId: "q5Yw6xPCS6U",
        title: 'Episode 31 (November 6, 2023), "The Ten (ish) Commandments"',
        publishedAt: "2023-11-06T00:00:00Z",
        episodeNumber: 33,
      },
      {
        ...baseVideo,
        videoId: "1qbh8bFGfvg",
        title:
          'Episode 33 (November 20, 2023), "The Bible and Disability" with Isaac Soon',
        publishedAt: "2023-11-20T00:00:00Z",
        episodeNumber: 33,
      },
    ];

    const canonicalVideos: ProcessedVideo[] = [
      {
        ...baseVideo,
        videoId: "q5Yw6xPCS6U",
        title: 'Episode 31 (November 6, 2023), "The Ten (ish) Commandments"',
        publishedAt: "2023-11-06T00:00:00Z",
        episodeNumber: 31,
      },
      {
        ...baseVideo,
        videoId: "1qbh8bFGfvg",
        title:
          'Episode 33 (November 20, 2023), "The Bible and Disability" with Isaac Soon',
        publishedAt: "2023-11-20T00:00:00Z",
        episodeNumber: 33,
      },
    ];

    expect(findEpisodeNumberMismatches(storedVideos, canonicalVideos)).toEqual([
      {
        videoId: "q5Yw6xPCS6U",
        title: 'Episode 31 (November 6, 2023), "The Ten (ish) Commandments"',
        storedEpisodeNumber: 33,
        canonicalEpisodeNumber: 31,
      },
    ]);
  });
});
