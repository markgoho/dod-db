import { describe, expect, test } from "bun:test";
import type { ProcessedVideo } from "../storage/processed-videos.js";
import { matchRssItemToVideo } from "./match-rss-to-video.js";

const baseVideo = {
  processedAt: "2026-01-01T00:00:00Z",
  transcriptPath: "data/transcripts/example.txt",
} satisfies Pick<ProcessedVideo, "processedAt" | "transcriptPath">;

describe("matchRssItemToVideo", () => {
  test("matches by normalized title", () => {
    const videos: ProcessedVideo[] = [
      {
        ...baseVideo,
        videoId: "29tvdRjwlJI",
        title: 'Episode 113, "Bibliomancy! The Biblical Dance with the Devil?"',
        publishedAt: "2025-06-02T00:00:00Z",
      },
    ];

    const matched = matchRssItemToVideo(
      {
        title: "Bibliomancy! The Biblical Dance with the Devil?",
        pubDate: "Sun, 01 Jun 2025 15:12:05 GMT",
        guid: "130431711",
      },
      videos,
    );

    expect(matched?.videoId).toBe("29tvdRjwlJI");
  });

  test("falls back to date matching when title does not normalize equally", () => {
    const videos: ProcessedVideo[] = [
      {
        ...baseVideo,
        videoId: "abc123xyz89",
        title: "Completely Different YouTube Title",
        publishedAt: "2025-06-02T00:00:00Z",
      },
    ];

    const matched = matchRssItemToVideo(
      {
        title: "Patreon Main Episode Title",
        pubDate: "Sun, 01 Jun 2025 15:12:05 GMT",
        guid: "130431711",
      },
      videos,
    );

    expect(matched?.videoId).toBe("abc123xyz89");
  });

  test("returns undefined for ambiguous date matches", () => {
    const videos: ProcessedVideo[] = [
      {
        ...baseVideo,
        videoId: "abc123xyz89",
        title: "Video One",
        publishedAt: "2025-06-02T00:00:00Z",
      },
      {
        ...baseVideo,
        videoId: "def456uvw00",
        title: "Video Two",
        publishedAt: "2025-06-03T00:00:00Z",
      },
    ];

    const matched = matchRssItemToVideo(
      {
        title: "Patreon Main Episode Title",
        pubDate: "Sun, 01 Jun 2025 15:12:05 GMT",
        guid: "130431711",
      },
      videos,
    );

    expect(matched).toBeUndefined();
  });
});
