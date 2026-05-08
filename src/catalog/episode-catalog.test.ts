import { afterAll, beforeEach, describe, expect, test } from "bun:test";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { youtubeConfig } from "../config/youtube.js";
import {
  type Episode,
  getEpisodeById,
  getEpisodeByNumber,
  getEpisodeNumber,
  isProcessed,
  listEpisodes,
  listEpisodesWithNumbers,
  recordScriptures,
  recordSegments,
  recordTags,
  registerEpisode,
  removeTagFromAllEpisodes,
  renameTagInAllEpisodes,
  resetCatalogCache,
  setEpisodeTopic,
  transact,
  updateSegmentDescription,
} from "./episode-catalog.js";

const originalFile = youtubeConfig.processedVideosFile;
const originalRss = youtubeConfig.canonicalRssUrl;

type MutableConfig = {
  processedVideosFile: string;
  canonicalRssUrl: string | undefined;
};

function setConfig(file: string): void {
  (youtubeConfig as unknown as MutableConfig).processedVideosFile = file;
  (youtubeConfig as unknown as MutableConfig).canonicalRssUrl = undefined;
}

function restoreConfig(): void {
  (youtubeConfig as unknown as MutableConfig).processedVideosFile =
    originalFile;
  (youtubeConfig as unknown as MutableConfig).canonicalRssUrl = originalRss;
}

let tmpFile: string;

function makeEpisode(overrides: Partial<Episode> = {}): Episode {
  return {
    videoId: "vid-1",
    title: "Some Title",
    publishedAt: "2024-01-15T10:00:00Z",
    processedAt: "2024-01-15T12:00:00Z",
    transcriptPath: "data/transcripts/2024-01-15-some-title.txt",
    ...overrides,
  };
}

async function seed(episodes: Episode[]): Promise<void> {
  await Bun.write(tmpFile, JSON.stringify(episodes, undefined, 2));
}

beforeEach(async () => {
  tmpFile = join(tmpdir(), `episode-catalog-test-${crypto.randomUUID()}.json`);
  setConfig(tmpFile);
  resetCatalogCache();
});

afterAll(() => {
  restoreConfig();
});

describe("episode-catalog reads", () => {
  test("listEpisodes returns empty when file does not exist", async () => {
    expect(await listEpisodes()).toEqual([]);
  });

  test("getEpisodeById finds existing episode", async () => {
    const ep = makeEpisode({ videoId: "abc" });
    await seed([ep]);
    expect(await getEpisodeById("abc")).toEqual(ep);
  });

  test("getEpisodeById returns undefined for unknown id", async () => {
    await seed([makeEpisode({ videoId: "abc" })]);
    expect(await getEpisodeById("xyz")).toBeUndefined();
  });

  test("isProcessed reports presence", async () => {
    await seed([makeEpisode({ videoId: "abc" })]);
    expect(await isProcessed("abc")).toBe(true);
    expect(await isProcessed("nope")).toBe(false);
  });

  test("getEpisodeByNumber and getEpisodeNumber resolve via title-based numbering", async () => {
    await seed([
      makeEpisode({ videoId: "a", title: 'Episode 5, "Foo"' }),
      makeEpisode({
        videoId: "b",
        title: 'Episode 7, "Bar"',
        publishedAt: "2024-02-15T10:00:00Z",
      }),
    ]);
    expect((await getEpisodeByNumber(5))?.videoId).toBe("a");
    expect(await getEpisodeNumber("b")).toBe(7);
  });
});

describe("registerEpisode", () => {
  test("appends new episode and assigns title-derived number", async () => {
    await seed([]);
    const assigned = await registerEpisode(
      makeEpisode({ videoId: "v1", title: 'Episode 42, "Hello"' }),
    );
    expect(assigned).toBe(42);

    const all = await listEpisodes();
    expect(all).toHaveLength(1);
    expect(all[0]?.episodeNumber).toBe(42);
  });

  test("assigns sequential gap-fill number when title has none", async () => {
    await seed([]);
    await registerEpisode(
      makeEpisode({ videoId: "v1", title: 'Episode 2, "First"' }),
    );
    const second = await registerEpisode(
      makeEpisode({
        videoId: "v2",
        title: "Special",
        publishedAt: "2024-02-01T00:00:00Z",
      }),
    );
    expect(second).toBe(1);
  });

  test("is a no-op (returns undefined) on duplicate id", async () => {
    await seed([makeEpisode({ videoId: "v1", episodeNumber: 1 })]);
    const result = await registerEpisode(makeEpisode({ videoId: "v1" }));
    expect(result).toBeUndefined();
    expect(await listEpisodes()).toHaveLength(1);
  });

  test("persists to disk", async () => {
    await seed([]);
    await registerEpisode(
      makeEpisode({ videoId: "v1", title: 'Episode 5, "Foo"' }),
    );
    resetCatalogCache();
    const reloaded = await listEpisodes();
    expect(reloaded).toHaveLength(1);
    expect(reloaded[0]?.episodeNumber).toBe(5);
  });
});

describe("per-episode writes", () => {
  test("recordTags overwrites tags array", async () => {
    await seed([
      makeEpisode({
        videoId: "v1",
        tags: [{ tag: "old", mentions: 1 }],
      }),
    ]);
    await recordTags("v1", [{ tag: "new", mentions: 3 }]);
    expect((await getEpisodeById("v1"))?.tags).toEqual([
      { tag: "new", mentions: 3 },
    ]);
  });

  test("recordTags is idempotent across repeated calls", async () => {
    await seed([makeEpisode({ videoId: "v1" })]);
    const tags = [{ tag: "a", mentions: 2 }];
    await recordTags("v1", tags);
    await recordTags("v1", tags);
    expect((await getEpisodeById("v1"))?.tags).toEqual(tags);
  });

  test("recordScriptures stores references", async () => {
    await seed([makeEpisode({ videoId: "v1" })]);
    await recordScriptures("v1", [
      { book: "Genesis", references: ["1:1"], mentions: 1 },
    ]);
    expect((await getEpisodeById("v1"))?.scriptures).toEqual([
      { book: "Genesis", references: ["1:1"], mentions: 1 },
    ]);
  });

  test("recordSegments stores segments", async () => {
    await seed([makeEpisode({ videoId: "v1" })]);
    await recordSegments("v1", [
      {
        type: "intro",
        startTimestamp: "00:00",
        confidence: "auto",
        detectionMethod: "audio",
      },
    ]);
    expect((await getEpisodeById("v1"))?.segments).toHaveLength(1);
  });

  test("setEpisodeTopic stores topic", async () => {
    await seed([makeEpisode({ videoId: "v1" })]);
    await setEpisodeTopic("v1", "Hellfire");
    expect((await getEpisodeById("v1"))?.episodeTopic).toBe("Hellfire");
  });

  test("recordTags throws on missing id", async () => {
    await seed([]);
    await expect(recordTags("nope", [])).rejects.toThrow(/not found/);
  });

  test("recordScriptures throws on missing id", async () => {
    await seed([]);
    await expect(recordScriptures("nope", [])).rejects.toThrow(/not found/);
  });

  test("recordSegments throws on missing id", async () => {
    await seed([]);
    await expect(recordSegments("nope", [])).rejects.toThrow(/not found/);
  });

  test("setEpisodeTopic throws on missing id", async () => {
    await seed([]);
    await expect(setEpisodeTopic("nope", "x")).rejects.toThrow(/not found/);
  });
});

describe("updateSegmentDescription", () => {
  test("updates topicLabel and summary by startTimestamp", async () => {
    await seed([
      makeEpisode({
        videoId: "v1",
        segments: [
          {
            type: "interview",
            startTimestamp: "10:00",
            confidence: "auto",
            detectionMethod: "audio",
          },
          {
            type: "interview",
            startTimestamp: "20:00",
            confidence: "auto",
            detectionMethod: "audio",
          },
        ],
      }),
    ]);
    await updateSegmentDescription("v1", "20:00", {
      topicLabel: "Topic",
      summary: "Summary",
    });
    const updated = await getEpisodeById("v1");
    expect(updated?.segments?.[0]?.topicLabel).toBeUndefined();
    expect(updated?.segments?.[1]?.topicLabel).toBe("Topic");
    expect(updated?.segments?.[1]?.summary).toBe("Summary");
  });

  test("throws when episode has no segments", async () => {
    await seed([makeEpisode({ videoId: "v1" })]);
    await expect(
      updateSegmentDescription("v1", "00:00", {
        topicLabel: "x",
        summary: "y",
      }),
    ).rejects.toThrow(/no segments/);
  });

  test("throws when segment timestamp not found", async () => {
    await seed([
      makeEpisode({
        videoId: "v1",
        segments: [
          {
            type: "interview",
            startTimestamp: "10:00",
            confidence: "auto",
            detectionMethod: "audio",
          },
        ],
      }),
    ]);
    await expect(
      updateSegmentDescription("v1", "99:99", {
        topicLabel: "x",
        summary: "y",
      }),
    ).rejects.toThrow(/Segment 99:99 not found/);
  });
});

describe("bulk operations", () => {
  test("removeTagFromAllEpisodes removes case-insensitively, returns count", async () => {
    await seed([
      makeEpisode({
        videoId: "v1",
        tags: [
          { tag: "Torah", mentions: 3 },
          { tag: "other", mentions: 1 },
        ],
      }),
      makeEpisode({
        videoId: "v2",
        tags: [{ tag: "TORAH", mentions: 5 }],
      }),
      makeEpisode({ videoId: "v3", tags: [{ tag: "other", mentions: 1 }] }),
    ]);
    const affected = await removeTagFromAllEpisodes("torah");
    expect(affected).toBe(2);
    expect((await getEpisodeById("v1"))?.tags).toEqual([
      { tag: "other", mentions: 1 },
    ]);
    expect((await getEpisodeById("v2"))?.tags).toEqual([]);
    expect((await getEpisodeById("v3"))?.tags).toEqual([
      { tag: "other", mentions: 1 },
    ]);
  });

  test("removeTagFromAllEpisodes returns 0 when nothing matches", async () => {
    await seed([
      makeEpisode({
        videoId: "v1",
        tags: [{ tag: "other", mentions: 1 }],
      }),
    ]);
    expect(await removeTagFromAllEpisodes("missing")).toBe(0);
  });

  test("renameTagInAllEpisodes renames where source exists", async () => {
    await seed([
      makeEpisode({
        videoId: "v1",
        tags: [{ tag: "Old", mentions: 4 }],
      }),
      makeEpisode({ videoId: "v2", tags: [{ tag: "other", mentions: 1 }] }),
    ]);
    const affected = await renameTagInAllEpisodes("old", "New");
    expect(affected).toBe(1);
    expect((await getEpisodeById("v1"))?.tags).toEqual([
      { tag: "New", mentions: 4 },
    ]);
    expect((await getEpisodeById("v2"))?.tags).toEqual([
      { tag: "other", mentions: 1 },
    ]);
  });

  test("renameTagInAllEpisodes merges when both source and target exist (first occurrence wins)", async () => {
    await seed([
      makeEpisode({
        videoId: "v1",
        tags: [
          { tag: "Old", mentions: 3 },
          { tag: "New", mentions: 7 },
        ],
      }),
    ]);
    const affected = await renameTagInAllEpisodes("Old", "New");
    expect(affected).toBe(1);
    expect((await getEpisodeById("v1"))?.tags).toEqual([
      { tag: "New", mentions: 3 },
    ]);
  });

  test("renameTagInAllEpisodes returns 0 for case-equal rename", async () => {
    await seed([
      makeEpisode({ videoId: "v1", tags: [{ tag: "X", mentions: 1 }] }),
    ]);
    expect(await renameTagInAllEpisodes("x", "X")).toBe(0);
  });
});

describe("transact", () => {
  test("applies mutator and persists", async () => {
    await seed([
      makeEpisode({ videoId: "v1" }),
      makeEpisode({ videoId: "v2", publishedAt: "2024-02-01T00:00:00Z" }),
    ]);
    await transact(episodes =>
      episodes.map(ep => ({ ...ep, processedAt: "2026-01-01T00:00:00Z" })),
    );
    const all = await listEpisodes();
    expect(all.every(e => e.processedAt === "2026-01-01T00:00:00Z")).toBe(true);
  });

  test("supports async mutators", async () => {
    await seed([makeEpisode({ videoId: "v1" })]);
    await transact(async episodes => {
      await Promise.resolve();
      return episodes.filter(e => e.videoId !== "v1");
    });
    expect(await listEpisodes()).toEqual([]);
  });
});

describe("listEpisodesWithNumbers fallback", () => {
  test("uses title-based numbering when RSS unavailable", async () => {
    await seed([
      makeEpisode({ videoId: "a", title: 'Episode 5, "Foo"' }),
      makeEpisode({
        videoId: "b",
        title: 'Episode 7, "Bar"',
        publishedAt: "2024-02-15T10:00:00Z",
      }),
      makeEpisode({
        videoId: "c",
        title: "Special unnumbered",
        publishedAt: "2024-03-01T00:00:00Z",
      }),
    ]);
    const numbered = await listEpisodesWithNumbers();
    const byId = Object.fromEntries(numbered.map(e => [e.videoId, e]));
    expect(byId.a?.episodeNumber).toBe(5);
    expect(byId.b?.episodeNumber).toBe(7);
    expect(byId.c?.episodeNumber).toBeGreaterThan(0);
  });
});
