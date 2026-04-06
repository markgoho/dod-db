/**
 * Unit tests for generateFrontmatter.
 */

import { describe, expect, test } from "bun:test";
import type { ProcessedVideo } from "../storage/processed-videos.js";
import { generateFrontmatter } from "./generate-frontmatter.js";

async function readFixture(path: string): Promise<string> {
  return (await Bun.file(path).text()).replace(/\n$/, "");
}

describe("generateFrontmatter", () => {
  test("generates complete YAML frontmatter with all fields", async () => {
    const video: ProcessedVideo = {
      videoId: "abc123",
      title: 'Episode 1, "Test Episode"',
      publishedAt: "2024-01-15T10:00:00Z",
      processedAt: "2024-01-15T12:00:00Z",
      transcriptPath: "data/transcripts/2024-01-15-test-episode.txt",
      episodeNumber: 1,
      tags: [
        { tag: "theology", mentions: 5 },
        { tag: "Torah", mentions: 10 },
      ],
      speakers: ["Dan McClellan", "Dan Beecher"],
    };

    const cleanTitle = "Test Episode";
    const actual = generateFrontmatter(video, cleanTitle);

    const expected = await readFixture(
      "src/hugo/__fixtures__/frontmatter-complete.md",
    );
    expect(actual).toBe(expected);
  });

  test("omits optional fields when empty", async () => {
    const video: ProcessedVideo = {
      videoId: "xyz789",
      title: "Episode 42",
      publishedAt: "2024-03-20T14:30:00Z",
      processedAt: "2024-03-20T16:00:00Z",
      transcriptPath: "data/transcripts/2024-03-20-episode-42.txt",
      episodeNumber: 42,
      // No tags
      speakers: ["Dan McClellan"], // Only hosts, no guests
    };

    const cleanTitle = "Solo Episode";
    const actual = generateFrontmatter(video, cleanTitle);

    const expected = await readFixture(
      "src/hugo/__fixtures__/frontmatter-minimal.md",
    );
    expect(actual).toBe(expected);
  });

  test("includes guests when present", async () => {
    const video: ProcessedVideo = {
      videoId: "guest456",
      title: "Episode 99",
      publishedAt: "2024-06-10T09:00:00Z",
      processedAt: "2024-06-10T11:00:00Z",
      transcriptPath: "data/transcripts/2024-06-10-episode-99.txt",
      episodeNumber: 99,
      speakers: ["Dan McClellan", "Andrew Whitehead", "Dan Beecher"],
    };

    const cleanTitle = "Guest Episode";
    const actual = generateFrontmatter(video, cleanTitle);

    const expected = await readFixture(
      "src/hugo/__fixtures__/frontmatter-with-guests.md",
    );
    expect(actual).toBe(expected);
  });

  test("canonicalizes guest aliases in frontmatter", async () => {
    const video: ProcessedVideo = {
      videoId: "guest789",
      title: "Episode 19",
      publishedAt: "2023-08-14T00:00:00Z",
      processedAt: "2023-08-14T01:00:00Z",
      transcriptPath: "data/transcripts/2023-08-14-episode-19.txt",
      episodeNumber: 19,
      speakers: ["Dan McClellan", "David Burnett", "Dan Beecher"],
    };

    const cleanTitle = "Canonical Guest Episode";
    const actual = generateFrontmatter(video, cleanTitle);

    const expected = await readFixture(
      "src/hugo/__fixtures__/frontmatter-with-canonical-guest.md",
    );
    expect(actual).toBe(expected);
  });

  test("includes segments when present", async () => {
    const video: ProcessedVideo = {
      videoId: "seg123",
      title: "Episode 50",
      publishedAt: "2024-05-01T12:00:00Z",
      processedAt: "2024-05-01T14:00:00Z",
      transcriptPath: "data/transcripts/2024-05-01-episode-50.txt",
      episodeNumber: 50,
      speakers: ["Dan McClellan", "Dan Beecher"],
      segments: [
        {
          type: "chapter-and-verse",
          startTimestamp: "[00:10:00.000]",
          confidence: "verified",
          detectionMethod: "manual",
        },
        {
          type: "getting-academic",
          startTimestamp: "[00:25:00.000]",
          confidence: "verified",
          detectionMethod: "manual",
        },
      ],
    };

    const cleanTitle = "Segmented Episode";
    const actual = generateFrontmatter(video, cleanTitle);

    const expected = await readFixture(
      "src/hugo/__fixtures__/frontmatter-with-segments.md",
    );
    expect(actual).toBe(expected);
  });

  test("includes books when scriptures present", async () => {
    const video: ProcessedVideo = {
      videoId: "book789",
      title: "Episode 75",
      publishedAt: "2024-07-15T10:00:00Z",
      processedAt: "2024-07-15T12:00:00Z",
      transcriptPath: "data/transcripts/2024-07-15-episode-75.txt",
      episodeNumber: 75,
      tags: [{ tag: "theology", mentions: 3 }],
      speakers: ["Dan McClellan", "Dan Beecher"],
      scriptures: [
        {
          book: "Genesis",
          references: ["Genesis 1:1", "Genesis 2:4"],
          mentions: 5,
        },
        {
          book: "Exodus",
          references: ["Exodus 20:1"],
          mentions: 2,
        },
        {
          book: "Matthew",
          references: ["Matthew 5:3"],
          mentions: 1,
        },
      ],
    };

    const cleanTitle = "Scripture Episode";
    const actual = generateFrontmatter(video, cleanTitle);

    const expected = await readFixture(
      "src/hugo/__fixtures__/frontmatter-with-books.md",
    );
    expect(actual).toBe(expected);
  });

  test("includes audioUrl when present", async () => {
    const video: ProcessedVideo = {
      videoId: "audio123",
      audioUrl: "https://cdn.example.com/audio.mp3",
      title: "Episode 143",
      publishedAt: "2024-08-01T10:00:00Z",
      processedAt: "2024-08-01T12:00:00Z",
      transcriptPath: "data/transcripts/2024-08-01-episode-143.txt",
      episodeNumber: 143,
      speakers: ["Dan McClellan", "Dan Beecher"],
    };

    const cleanTitle = "Audio Episode";
    const actual = generateFrontmatter(video, cleanTitle);

    const expected = await readFixture(
      "src/hugo/__fixtures__/frontmatter-with-audio.md",
    );
    expect(actual).toBe(expected);
  });
});
