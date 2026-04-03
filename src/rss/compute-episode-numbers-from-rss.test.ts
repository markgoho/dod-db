import { describe, expect, mock, spyOn, test } from "bun:test";
import type { ProcessedVideo } from "../storage/processed-videos.js";
import { computeEpisodeNumbersFromRss } from "./compute-episode-numbers-from-rss.js";

const baseVideo = {
  processedAt: "2026-01-01T00:00:00Z",
  transcriptPath: "data/transcripts/example.txt",
} satisfies Pick<ProcessedVideo, "processedAt" | "transcriptPath">;

describe("computeEpisodeNumbersFromRss", () => {
  test("preserves early numbered episodes before RSS-only titles appear", () => {
    const videos: ProcessedVideo[] = [
      {
        ...baseVideo,
        videoId: "ep1aaaaaaaa",
        title: 'Episode 1 (April 8, 2023), "In the Beginning"',
        publishedAt: "2023-04-08T00:00:00Z",
      },
      {
        ...baseVideo,
        videoId: "ep2bbbbbbbb",
        title: 'Episode 2 (April 17, 2023), "God\'s Wife"',
        publishedAt: "2023-04-17T00:00:00Z",
      },
      {
        ...baseVideo,
        videoId: "ep112cccccc",
        title: 'Episode 112 (May 26, 2025), "Wash Your Own Feet!"',
        publishedAt: "2025-05-26T00:00:00Z",
      },
      {
        ...baseVideo,
        videoId: "ep113dddddd",
        title: "Bibliomancy! The Biblical Dance with the Devil?",
        publishedAt: "2025-06-02T00:00:00Z",
      },
    ];

    const result = computeEpisodeNumbersFromRss(videos, [
      {
        title: "Episode 112: Wash Your Own Feet!",
        pubDate: "Sun, 25 May 2025 15:12:05 GMT",
        guid: "112",
      },
      {
        title: "Episode 113 After Party",
        pubDate: "Sun, 01 Jun 2025 15:14:58 GMT",
        guid: "113-ap",
      },
      {
        title: "Bibliomancy! The Biblical Dance with the Devil?",
        pubDate: "Sun, 01 Jun 2025 15:12:05 GMT",
        guid: "113",
        itunesEpisode: 116,
      },
    ]);

    expect(result.map(video => [video.videoId, video.episodeNumber])).toEqual([
      ["ep1aaaaaaaa", 1],
      ["ep2bbbbbbbb", 2],
      ["ep112cccccc", 112],
      ["ep113dddddd", 113],
    ]);
  });

  test("uses Patreon main episode order and excludes After Party items", () => {
    const warnSpy = spyOn(console, "warn").mockImplementation(mock(() => {}));

    const videos: ProcessedVideo[] = [
      {
        ...baseVideo,
        videoId: "kiOlyxiorow",
        title: 'Episode 112 (May 26, 2025), "Wash Your Own Feet!"',
        publishedAt: "2025-05-26T00:00:00Z",
      },
      {
        ...baseVideo,
        videoId: "29tvdRjwlJI",
        title: "Bibliomancy! The Biblical Dance with the Devil?",
        publishedAt: "2025-06-02T00:00:00Z",
      },
      {
        ...baseVideo,
        videoId: "future114aa1",
        title: "Pride Month vs. the Bible!",
        publishedAt: "2025-06-09T00:00:00Z",
      },
      {
        ...baseVideo,
        videoId: "future115bb2",
        title: "Did the Bible Steal its Stories?",
        publishedAt: "2025-06-16T00:00:00Z",
      },
    ];

    const result = computeEpisodeNumbersFromRss(videos, [
      {
        title: "Episode 112: Wash Your Own Feet!",
        pubDate: "Sun, 25 May 2025 15:12:05 GMT",
        guid: "112",
      },
      {
        title: "Episode 113 After Party",
        pubDate: "Sun, 01 Jun 2025 15:14:58 GMT",
        guid: "113-ap",
      },
      {
        title: "Bibliomancy! The Biblical Dance with the Devil?",
        pubDate: "Sun, 01 Jun 2025 15:12:05 GMT",
        guid: "113",
        itunesEpisode: 116,
      },
      {
        title: "Pride Month vs. the Bible!",
        pubDate: "Sun, 08 Jun 2025 16:02:44 GMT",
        guid: "114",
        itunesEpisode: 114,
      },
      {
        title: "Did the Bible Steal its Stories?",
        pubDate: "Sun, 15 Jun 2025 11:00:12 GMT",
        guid: "115",
        itunesEpisode: 115,
      },
    ]);

    expect(result.map(video => [video.videoId, video.episodeNumber])).toEqual([
      ["kiOlyxiorow", 112],
      ["29tvdRjwlJI", 113],
      ["future114aa1", 114],
      ["future115bb2", 115],
    ]);
    expect(warnSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  test("warns on mismatches that are not covered by overrides", () => {
    const warnSpy = spyOn(console, "warn").mockImplementation(mock(() => {}));

    computeEpisodeNumbersFromRss(
      [
        {
          ...baseVideo,
          videoId: "ep113aaaaaa",
          title: "Bibliomancy! The Biblical Dance with the Devil?",
          publishedAt: "2025-06-02T00:00:00Z",
        },
        {
          ...baseVideo,
          videoId: "future114aa1",
          title: "Pride Month vs. the Bible!",
          publishedAt: "2025-06-09T00:00:00Z",
        },
      ],
      [
        {
          title: "Bibliomancy! The Biblical Dance with the Devil?",
          pubDate: "Sun, 01 Jun 2025 15:12:05 GMT",
          guid: "113",
        },
        {
          title: "Pride Month vs. the Bible!",
          pubDate: "Sun, 08 Jun 2025 16:02:44 GMT",
          guid: "114",
          itunesEpisode: 999,
        },
      ],
    );

    expect(warnSpy).toHaveBeenCalledWith(
      'Patreon RSS episode mismatch for "Pride Month vs. the Bible!": itunes:episode=999, assigned=114',
    );

    warnSpy.mockRestore();
  });

  test("warns when title-anchored numbering disagrees with metadata", () => {
    const warnSpy = spyOn(console, "warn").mockImplementation(mock(() => {}));

    computeEpisodeNumbersFromRss(
      [
        {
          ...baseVideo,
          videoId: "video114aaaa",
          title: 'Episode 114, "Pride Month vs. the Bible!"',
          publishedAt: "2025-06-09T00:00:00Z",
        },
      ],
      [
        {
          title: "Episode 114: Pride Month vs. the Bible!",
          pubDate: "Sun, 08 Jun 2025 16:02:44 GMT",
          guid: "114",
          itunesEpisode: 999,
        },
      ],
    );

    expect(warnSpy).toHaveBeenCalledWith(
      'Patreon RSS episode mismatch for "Episode 114: Pride Month vs. the Bible!": itunes:episode=999, assigned=114',
    );

    warnSpy.mockRestore();
  });

  test("suppresses warnings for explicit override mismatches", () => {
    const warnSpy = spyOn(console, "warn").mockImplementation(mock(() => {}));

    computeEpisodeNumbersFromRss(
      [
        {
          ...baseVideo,
          videoId: "29tvdRjwlJI",
          title: "Bibliomancy! The Biblical Dance with the Devil?",
          publishedAt: "2025-06-02T00:00:00Z",
        },
      ],
      [
        {
          title: "Bibliomancy! The Biblical Dance with the Devil?",
          pubDate: "Sun, 01 Jun 2025 15:12:05 GMT",
          guid: "113",
          itunesEpisode: 116,
        },
      ],
    );

    expect(warnSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  test("does not warn when metadata matches the assigned number", () => {
    const warnSpy = spyOn(console, "warn").mockImplementation(mock(() => {}));

    computeEpisodeNumbersFromRss(
      [
        {
          ...baseVideo,
          videoId: "future114aa1",
          title: "Pride Month vs. the Bible!",
          publishedAt: "2025-06-09T00:00:00Z",
        },
      ],
      [
        {
          title: "Pride Month vs. the Bible!",
          pubDate: "Sun, 08 Jun 2025 16:02:44 GMT",
          guid: "114",
          itunesEpisode: 114,
        },
      ],
    );

    expect(warnSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  test("does not warn when metadata is missing", () => {
    const warnSpy = spyOn(console, "warn").mockImplementation(mock(() => {}));

    computeEpisodeNumbersFromRss(
      [
        {
          ...baseVideo,
          videoId: "future114aa1",
          title: "Pride Month vs. the Bible!",
          publishedAt: "2025-06-09T00:00:00Z",
        },
      ],
      [
        {
          title: "Pride Month vs. the Bible!",
          pubDate: "Sun, 08 Jun 2025 16:02:44 GMT",
          guid: "114",
        },
      ],
    );

    expect(warnSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  test("does not warn when RSS item does not match a video", () => {
    const warnSpy = spyOn(console, "warn").mockImplementation(mock(() => {}));

    computeEpisodeNumbersFromRss(
      [
        {
          ...baseVideo,
          videoId: "future114aa1",
          title: "Pride Month vs. the Bible!",
          publishedAt: "2025-06-09T00:00:00Z",
        },
      ],
      [
        {
          title: "Completely Different Episode",
          pubDate: "Sun, 08 Jun 2025 16:02:44 GMT",
          guid: "114",
          itunesEpisode: 999,
        },
      ],
    );

    expect(warnSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  test("does not warn when no episode number could be assigned", () => {
    const warnSpy = spyOn(console, "warn").mockImplementation(mock(() => {}));

    computeEpisodeNumbersFromRss(
      [
        {
          ...baseVideo,
          videoId: "unknown111111",
          title: "Untitled Episode",
          publishedAt: "2025-06-09T00:00:00Z",
        },
      ],
      [
        {
          title: "Untitled Episode",
          pubDate: "Sun, 08 Jun 2025 16:02:44 GMT",
          guid: "114",
          itunesEpisode: 999,
        },
      ],
    );

    expect(warnSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  test("falls back to the existing numbering algorithm when RSS items are empty", () => {
    const videos: ProcessedVideo[] = [
      {
        ...baseVideo,
        videoId: "video1aaaaaa",
        title: 'Episode 1, "In the Beginning"',
        publishedAt: "2023-04-08T00:00:00Z",
      },
      {
        ...baseVideo,
        videoId: "video2bbbbbb",
        title: "Apostlepalooza!",
        publishedAt: "2023-04-15T00:00:00Z",
      },
    ];

    const result = computeEpisodeNumbersFromRss(videos, []);
    expect(result.map(video => video.episodeNumber)).toEqual([1, 2]);
  });
});
