import { z } from "zod";
import type { SegmentType } from "../config/segment-patterns.js";
import { youtubeConfig } from "../config/youtube.js";
import {
  DETECTION_METHODS,
  type DetectionMethod,
} from "../pipeline/detect-segments.js";
import {
  computeEpisodeNumbersFromRss,
  fetchPodcastRss,
  parsePodcastRss,
} from "../rss/index.js";

// =============================================================================
// Types and schemas
// =============================================================================

export interface EpisodeTag {
  tag: string;
  mentions: number;
}

export const EpisodeTagSchema = z.object({
  tag: z.string(),
  mentions: z.number().int().positive(),
});

export interface EpisodeScripture {
  book: string;
  references: string[];
  mentions: number;
  source?: "auto" | "manual";
}

export const EpisodeScriptureSchema = z.object({
  book: z.string(),
  references: z.array(z.string()),
  mentions: z.number().int().nonnegative(),
  source: z.enum(["auto", "manual"]).optional(),
});

export interface EpisodeSegment {
  type: SegmentType;
  startTimestamp: string;
  endTimestamp?: string | null;
  confidence: "auto" | "verified";
  detectionMethod: DetectionMethod;
  topicLabel?: string;
  summary?: string;
}

export const EpisodeSegmentSchema = z.object({
  type: z.string(),
  startTimestamp: z.string(),
  endTimestamp: z.string().nullish(),
  confidence: z.enum(["auto", "verified"]),
  detectionMethod: z.enum(DETECTION_METHODS),
  topicLabel: z.string().optional(),
  summary: z.string().optional(),
});

export const VideoChapterSchema = z.object({
  title: z.string(),
  startTime: z.number(),
});

export const EpisodeSchema = z.object({
  videoId: z.string(),
  audioUrl: z.string().url().optional(),
  title: z.string(),
  publishedAt: z.string(),
  processedAt: z.string(),
  transcriptPath: z.string(),
  episodeNumber: z.number().int().positive().optional(),
  tags: z.array(EpisodeTagSchema).optional(),
  segments: z.array(EpisodeSegmentSchema).optional(),
  speakers: z.array(z.string()).optional(),
  chapters: z.array(VideoChapterSchema).optional(),
  scriptures: z.array(EpisodeScriptureSchema).optional(),
  episodeTopic: z.string().optional(),
});

export type Episode = z.infer<typeof EpisodeSchema>;

// Legacy alias retained because the on-disk filename is still
// processed-videos.json and the type is referenced under both names across
// the codebase during migration.
export type ProcessedVideo = Episode;
export const ProcessedVideoSchema = EpisodeSchema;

// =============================================================================
// File I/O
// =============================================================================

let cache: Episode[] | undefined;

async function readFromDisk(): Promise<Episode[]> {
  const file = Bun.file(youtubeConfig.processedVideosFile);
  if (!(await file.exists())) {
    console.log("No processed videos file found. Starting with empty array.");
    return [];
  }
  return (await file.json()) as Episode[];
}

async function load(): Promise<Episode[]> {
  if (cache === undefined) {
    cache = await readFromDisk();
  }
  return cache;
}

async function commit(next: Episode[]): Promise<void> {
  const filePath = youtubeConfig.processedVideosFile;
  await Bun.write(filePath, JSON.stringify(next, undefined, 2));

  const result = Bun.spawnSync(["bunx", "prettier", "--write", filePath]);
  if (result.exitCode !== 0) {
    console.warn(`prettier failed on ${filePath}: ${result.stderr.toString()}`);
  }

  cache = next;
}

/**
 * Drop the in-memory cache. Tests use this to start clean.
 * Production code should not need this — see ADR 0001.
 */
export function resetCatalogCache(): void {
  cache = undefined;
}

// =============================================================================
// Episode-number recomputation
// =============================================================================

function extractEpisodeNumberFromTitle(title: string): number | undefined {
  const match = title.match(/Episode\s+(\d+)/i);
  return match?.[1] ? Number.parseInt(match[1], 10) : undefined;
}

/**
 * Title-based episode-number assignment used by RSS fallback and as the
 * legacy ordering for episodes 1–142.
 */
function computeEpisodeNumbersFromTitles(episodes: Episode[]): Episode[] {
  const sorted = [...episodes].toSorted((a, b) => {
    const dateCompare = a.publishedAt.localeCompare(b.publishedAt);
    if (dateCompare !== 0) return dateCompare;
    return a.videoId.localeCompare(b.videoId);
  });

  const withTitleNumbers = sorted.map(episode => {
    if (episode.episodeNumber !== undefined) return episode;
    const titleNumber = extractEpisodeNumberFromTitle(episode.title);
    if (titleNumber !== undefined) {
      return { ...episode, episodeNumber: titleNumber };
    }
    return episode;
  });

  const taken = new Set(
    withTitleNumbers
      .map(v => v.episodeNumber)
      .filter((n): n is number => n !== undefined),
  );

  let nextSequential = 1;
  return withTitleNumbers.map(episode => {
    if (episode.episodeNumber !== undefined) return episode;
    while (taken.has(nextSequential)) nextSequential++;
    const assigned = nextSequential;
    taken.add(assigned);
    nextSequential++;
    return { ...episode, episodeNumber: assigned };
  });
}

async function applyRssNumbers(episodes: Episode[]): Promise<Episode[]> {
  try {
    const rssXml = await fetchPodcastRss(youtubeConfig.canonicalRssUrl);
    const rssItems = rssXml ? parsePodcastRss(rssXml) : [];
    return computeEpisodeNumbersFromRss(episodes, rssItems);
  } catch (error) {
    console.warn(
      "Failed to compute episode numbers from canonical RSS:",
      error,
    );
    return computeEpisodeNumbersFromTitles(episodes);
  }
}

// =============================================================================
// Reads
// =============================================================================

export async function listEpisodes(): Promise<Episode[]> {
  return load();
}

export async function listEpisodesWithNumbers(): Promise<Episode[]> {
  const episodes = await load();
  return applyRssNumbers(episodes);
}

export async function getEpisodeById(
  videoId: string,
): Promise<Episode | undefined> {
  const episodes = await load();
  return episodes.find(e => e.videoId === videoId);
}

export async function getEpisodeByNumber(
  episodeNumber: number,
): Promise<Episode | undefined> {
  const episodes = await listEpisodesWithNumbers();
  return episodes.find(e => e.episodeNumber === episodeNumber);
}

export async function getEpisodeNumber(
  videoId: string,
): Promise<number | undefined> {
  const episodes = await listEpisodesWithNumbers();
  return episodes.find(e => e.videoId === videoId)?.episodeNumber;
}

export async function isProcessed(videoId: string): Promise<boolean> {
  const episodes = await load();
  return episodes.some(e => e.videoId === videoId);
}

// =============================================================================
// Per-episode writes
// =============================================================================

/**
 * Add a new episode to the catalog and recompute episode numbers via RSS.
 * Returns the assigned episode number.
 *
 * If the episode already exists, this is a no-op: warns and returns undefined.
 * (Matches the pre-deepening behaviour of registerEpisode.)
 */
export async function registerEpisode(
  episode: Episode,
): Promise<number | undefined> {
  const episodes = await load();
  if (episodes.some(e => e.videoId === episode.videoId)) {
    console.warn(`Episode ${episode.videoId} already registered`);
    return undefined;
  }

  const next = await applyRssNumbers([...episodes, episode]);
  await commit(next);

  const assigned = next.find(e => e.videoId === episode.videoId)?.episodeNumber;
  if (assigned !== undefined) {
    console.log(`✓ Assigned episode number: ${assigned}`);
  }
  return assigned;
}

function requireEpisodeIndex(episodes: Episode[], videoId: string): number {
  const index = episodes.findIndex(e => e.videoId === videoId);
  if (index === -1) {
    throw new Error(`Episode ${videoId} not found in catalog`);
  }
  return index;
}

async function mutateOne(
  videoId: string,
  mutate: (episode: Episode) => Episode,
): Promise<void> {
  const episodes = [...(await load())];
  const index = requireEpisodeIndex(episodes, videoId);
  episodes[index] = mutate(episodes[index] as Episode);
  await commit(episodes);
}

export async function recordTags(
  videoId: string,
  tags: EpisodeTag[],
): Promise<void> {
  await mutateOne(videoId, episode => ({ ...episode, tags }));
}

export async function recordScriptures(
  videoId: string,
  scriptures: EpisodeScripture[],
): Promise<void> {
  await mutateOne(videoId, episode => ({ ...episode, scriptures }));
}

export async function recordSegments(
  videoId: string,
  segments: EpisodeSegment[],
): Promise<void> {
  await mutateOne(videoId, episode => ({ ...episode, segments }));
}

export async function setEpisodeTopic(
  videoId: string,
  episodeTopic: string,
): Promise<void> {
  await mutateOne(videoId, episode => ({ ...episode, episodeTopic }));
}

export async function updateSegmentDescription(
  videoId: string,
  startTimestamp: string,
  updates: { topicLabel: string; summary: string },
): Promise<void> {
  await mutateOne(videoId, episode => {
    if (!episode.segments) {
      throw new Error(`Episode ${videoId} has no segments`);
    }
    const segments = episode.segments.map(segment =>
      segment.startTimestamp === startTimestamp
        ? {
            ...segment,
            topicLabel: updates.topicLabel,
            summary: updates.summary,
          }
        : segment,
    );
    if (segments.every(s => s.startTimestamp !== startTimestamp)) {
      throw new Error(
        `Segment ${startTimestamp} not found for episode ${videoId}`,
      );
    }
    return { ...episode, segments };
  });
}

// =============================================================================
// Generic transactional primitive
// =============================================================================

/**
 * Run a mutator against a snapshot of the catalog. The mutator may return a
 * new array (or mutate in place and return it). The result is committed.
 *
 * Reserved for callers that legitimately need to inspect or mutate many
 * episodes — bulk processing scripts, multi-step migrations. Prefer the
 * named domain operations above for everything else.
 */
export async function transact(
  mutator: (episodes: Episode[]) => Episode[] | Promise<Episode[]>,
): Promise<void> {
  const snapshot = [...(await load())];
  const next = await mutator(snapshot);
  await commit(next);
}

// =============================================================================
// Bulk domain operations
// =============================================================================

/**
 * Remove a tag from every episode that carries it.
 * Returns the number of episodes affected.
 */
export async function removeTagFromAllEpisodes(
  tagName: string,
): Promise<number> {
  const lower = tagName.toLowerCase();
  let affected = 0;

  await transact(episodes =>
    episodes.map(episode => {
      const original = episode.tags ?? [];
      const filtered = original.filter(t => t.tag.toLowerCase() !== lower);
      if (filtered.length === original.length) return episode;
      affected++;
      return { ...episode, tags: filtered };
    }),
  );

  return affected;
}

/**
 * Rename a tag everywhere it appears. If both source and target already exist
 * on the same episode, the first occurrence (in iteration order) keeps its
 * mentions and the second is dropped — preserves pre-deepening behaviour.
 * Returns the number of episodes affected.
 */
export async function renameTagInAllEpisodes(
  fromTag: string,
  toTag: string,
): Promise<number> {
  const fromLower = fromTag.toLowerCase();
  const toLower = toTag.toLowerCase();
  if (fromLower === toLower) return 0;

  let affected = 0;

  await transact(episodes =>
    episodes.map(episode => {
      const original = episode.tags ?? [];
      const hasSource = original.some(t => t.tag.toLowerCase() === fromLower);
      if (!hasSource) return episode;
      affected++;

      const renamed: EpisodeTag[] = [];
      for (const tag of original) {
        const tagLower = tag.tag.toLowerCase();
        if (tagLower === fromLower) {
          if (!renamed.some(r => r.tag.toLowerCase() === toLower)) {
            renamed.push({ tag: toTag, mentions: tag.mentions });
          }
          continue;
        }
        if (!renamed.some(r => r.tag.toLowerCase() === tagLower)) {
          renamed.push(tag);
        }
      }

      return { ...episode, tags: renamed };
    }),
  );

  return affected;
}
