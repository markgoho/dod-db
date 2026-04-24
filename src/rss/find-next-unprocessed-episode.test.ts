import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { ProcessedVideo } from "../storage/processed-videos.js";

const fetchPodcastRssMock = mock(
  async (_url: string | undefined): Promise<string | undefined> => undefined,
);
const loadProcessedVideosMock = mock(async (): Promise<ProcessedVideo[]> => []);

mock.module("../storage/load-processed-videos.js", () => ({
  loadProcessedVideos: loadProcessedVideosMock,
}));

mock.module("./fetch-patreon-rss.js", () => ({
  fetchPodcastRss: fetchPodcastRssMock,
}));

const { findNextUnprocessedEpisode } =
  await import("./find-next-unprocessed-episode.js");

beforeEach(() => {
  fetchPodcastRssMock.mockReset();
  loadProcessedVideosMock.mockReset();
  fetchPodcastRssMock.mockImplementation(
    async (_url: string | undefined): Promise<string | undefined> => undefined,
  );
  loadProcessedVideosMock.mockImplementation(
    async (): Promise<ProcessedVideo[]> => [],
  );
});

const baseVideo = {
  processedAt: "2026-01-01T00:00:00Z",
  transcriptPath: "data/transcripts/example.txt",
} satisfies Pick<ProcessedVideo, "processedAt" | "transcriptPath">;

describe("findNextUnprocessedEpisode", () => {
  test("returns the oldest unmatched canonical item with its enclosure URL", async () => {
    fetchPodcastRssMock.mockImplementation(
      async () => `<?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <title>Episode 144 After Party</title>
            <pubDate>Sun, 04 Jan 2026 18:00:00 GMT</pubDate>
            <guid>144-ap</guid>
            <enclosure url="https://cdn.example.com/144-ap.mp3" />
          </item>
          <item>
            <title>Bring Me the Head of John the Baptist!</title>
            <pubDate>Sun, 04 Jan 2026 17:50:53 GMT</pubDate>
            <guid>147400629</guid>
            <itunes:episode>144</itunes:episode>
            <enclosure url="https://cdn.example.com/144.mp3" />
          </item>
          <item>
            <title>Shiny Happy People!</title>
            <pubDate>Sun, 28 Dec 2025 17:50:53 GMT</pubDate>
            <guid>143-guid</guid>
            <itunes:episode>143</itunes:episode>
            <enclosure url="https://cdn.example.com/143.mp3" />
          </item>
        </channel>
      </rss>`,
    );
    loadProcessedVideosMock.mockImplementation(async () => [
      {
        ...baseVideo,
        videoId: "processed-143",
        title: "Shiny Happy People!",
        publishedAt: "2025-12-29T10:10:00.000Z",
      },
    ]);

    const result = await findNextUnprocessedEpisode(
      "https://example.com/canonical.xml",
    );

    expect(fetchPodcastRssMock).toHaveBeenCalledWith(
      "https://example.com/canonical.xml",
    );
    expect(result).toEqual({
      rssItem: {
        title: "Bring Me the Head of John the Baptist!",
        pubDate: "Sun, 04 Jan 2026 17:50:53 GMT",
        guid: "147400629",
        itunesEpisode: 144,
        enclosureUrl: "https://cdn.example.com/144.mp3",
      },
      audioUrl: "https://cdn.example.com/144.mp3",
    });
  });

  test("returns undefined when all canonical items are already processed", async () => {
    fetchPodcastRssMock.mockImplementation(
      async () => `<?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <title>Shiny Happy People!</title>
            <pubDate>Sun, 28 Dec 2025 17:50:53 GMT</pubDate>
            <guid>143-guid</guid>
            <itunes:episode>143</itunes:episode>
            <enclosure url="https://cdn.example.com/143.mp3" />
          </item>
        </channel>
      </rss>`,
    );
    loadProcessedVideosMock.mockImplementation(async () => [
      {
        ...baseVideo,
        videoId: "processed-143",
        title: "Shiny Happy People!",
        publishedAt: "2025-12-29T10:10:00.000Z",
      },
    ]);

    await expect(
      findNextUnprocessedEpisode("https://example.com/canonical.xml"),
    ).resolves.toBeUndefined();
  });

  test("throws when the next unmatched canonical item has no enclosure URL", async () => {
    fetchPodcastRssMock.mockImplementation(
      async () => `<?xml version="1.0"?>
      <rss>
        <channel>
          <item>
            <title>Bring Me the Head of John the Baptist!</title>
            <pubDate>Sun, 04 Jan 2026 17:50:53 GMT</pubDate>
            <guid>147400629</guid>
            <itunes:episode>144</itunes:episode>
          </item>
        </channel>
      </rss>`,
    );
    loadProcessedVideosMock.mockImplementation(async () => []);

    await expect(
      findNextUnprocessedEpisode("https://example.com/canonical.xml"),
    ).rejects.toThrow(
      "Next unprocessed RSS episode is missing enclosure URL: Bring Me the Head of John the Baptist!",
    );
  });
});
