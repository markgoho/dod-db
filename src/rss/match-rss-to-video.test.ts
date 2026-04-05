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

  test("falls back to date matching for numbered episode posts", () => {
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
        title: "Episode 114: Patreon Main Episode Title",
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
        title: "Episode 114: Patreon Main Episode Title",
        pubDate: "Sun, 01 Jun 2025 15:12:05 GMT",
        guid: "130431711",
      },
      videos,
    );

    expect(matched).toBeUndefined();
  });

  test("does not fall back to date matching for non-episode Patreon posts", () => {
    const videos: ProcessedVideo[] = [
      {
        ...baseVideo,
        videoId: "q5Yw6xPCS6U",
        title: 'Episode 31 (November 6, 2023), "The Ten (ish) Commandments"',
        publishedAt: "2023-11-06T00:00:00Z",
      },
    ];

    const matched = matchRssItemToVideo(
      {
        title: "Members PLUS Content",
        pubDate: "Sun, 05 Nov 2023 18:20:43 GMT",
        guid: "bonus-post",
      },
      videos,
    );

    expect(matched).toBeUndefined();
  });
});
