import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { youtubeConfig } from "../config/youtube.js";
import { renameTagInAllEpisodes } from "./rename-tag-in-episodes.js";

const originalProcessedVideosFile = youtubeConfig.processedVideosFile;
let temporaryDir: string;

beforeEach(async () => {
  temporaryDir = await mkdtemp(join(tmpdir(), "rename-tag-test-"));
  await mkdir(join(temporaryDir, "data"), { recursive: true });
  youtubeConfig.processedVideosFile = join(
    temporaryDir,
    "data",
    "processed-videos.json",
  );
});

afterEach(async () => {
  youtubeConfig.processedVideosFile = originalProcessedVideosFile;
  await rm(temporaryDir, { recursive: true, force: true });
});

describe("renameTagInAllEpisodes", () => {
  test("renames matching tags across stored episodes", async () => {
    await Bun.write(
      youtubeConfig.processedVideosFile,
      JSON.stringify(
        [
          {
            videoId: "a",
            title: "Episode A",
            publishedAt: "2024-01-01T00:00:00Z",
            processedAt: "2024-01-01T00:00:00Z",
            transcriptPath: "a.txt",
            episodeNumber: 1,
            tags: [
              { tag: "King James Version", mentions: 4 },
              { tag: "Paul", mentions: 2 },
            ],
          },
        ],
        undefined,
        2,
      ),
    );

    const affected = await renameTagInAllEpisodes(
      "King James Version",
      "King James Bible",
    );

    const saved = JSON.parse(
      await readFile(youtubeConfig.processedVideosFile, "utf8"),
    );

    expect(affected).toBe(1);
    expect(saved).toEqual([
      {
        videoId: "a",
        title: "Episode A",
        publishedAt: "2024-01-01T00:00:00Z",
        processedAt: "2024-01-01T00:00:00Z",
        transcriptPath: "a.txt",
        episodeNumber: 1,
        tags: [
          { tag: "King James Bible", mentions: 4 },
          { tag: "Paul", mentions: 2 },
        ],
      },
    ]);
  });

  test("drops the old tag when the canonical tag already exists", async () => {
    await Bun.write(
      youtubeConfig.processedVideosFile,
      JSON.stringify(
        [
          {
            videoId: "a",
            title: "Episode A",
            publishedAt: "2024-01-01T00:00:00Z",
            processedAt: "2024-01-01T00:00:00Z",
            transcriptPath: "a.txt",
            episodeNumber: 1,
            tags: [
              { tag: "King James Version", mentions: 4 },
              { tag: "King James Bible", mentions: 4 },
              { tag: "Paul", mentions: 2 },
            ],
          },
        ],
        undefined,
        2,
      ),
    );

    const affected = await renameTagInAllEpisodes(
      "King James Version",
      "King James Bible",
    );

    const saved = JSON.parse(
      await readFile(youtubeConfig.processedVideosFile, "utf8"),
    );

    expect(affected).toBe(1);
    expect(saved).toEqual([
      {
        videoId: "a",
        title: "Episode A",
        publishedAt: "2024-01-01T00:00:00Z",
        processedAt: "2024-01-01T00:00:00Z",
        transcriptPath: "a.txt",
        episodeNumber: 1,
        tags: [
          { tag: "King James Bible", mentions: 4 },
          { tag: "Paul", mentions: 2 },
        ],
      },
    ]);
  });

  test("does nothing when only letter case changes", async () => {
    await Bun.write(
      youtubeConfig.processedVideosFile,
      JSON.stringify(
        [
          {
            videoId: "a",
            title: "Episode A",
            publishedAt: "2024-01-01T00:00:00Z",
            processedAt: "2024-01-01T00:00:00Z",
            transcriptPath: "a.txt",
            episodeNumber: 1,
            tags: [{ tag: "Torah", mentions: 4 }],
          },
        ],
        undefined,
        2,
      ),
    );

    const affected = await renameTagInAllEpisodes("Torah", "torah");

    const saved = JSON.parse(
      await readFile(youtubeConfig.processedVideosFile, "utf8"),
    );

    expect(affected).toBe(0);
    expect(saved).toEqual([
      {
        videoId: "a",
        title: "Episode A",
        publishedAt: "2024-01-01T00:00:00Z",
        processedAt: "2024-01-01T00:00:00Z",
        transcriptPath: "a.txt",
        episodeNumber: 1,
        tags: [{ tag: "Torah", mentions: 4 }],
      },
    ]);
  });
});
