import { listEpisodes } from "../catalog/episode-catalog.js";
import type { ProcessedVideo } from "../catalog/episode-catalog.js";
import { tagVocabulary } from "../config/tag-vocabulary.js";
import { getGuestSpeakers } from "../hugo/get-guest-speakers.js";
import type { SegmentData, StoredSegment } from "../hugo/shared.js";
import type { TranscriptLine } from "../pipeline/detect-segments-types.js";
import { parseTranscript } from "../pipeline/parse-transcript.js";
import { timestampToSeconds } from "../pipeline/timestamp-to-seconds.js";
import { parseHugoFile } from "../utils/parse-hugo-file.js";
import { titleToSlug } from "../utils/title-to-slug.js";

interface ParsedArguments {
  topicName: string;
}

interface CanonicalVariant {
  name: string;
  isAliasCandidate: boolean;
}

interface CanonicalTopicContext {
  name: string;
  category: string;
  variations: CanonicalVariant[];
  status: string;
}

interface EpisodeIndexEntry {
  ep: number;
  m: number;
  title: string;
}

interface TranscriptExcerpt {
  startLine: number;
  lines: string[];
}

interface GatheredSegment {
  type: string;
  anchor?: string;
  label?: string;
  topicLabel?: string;
  summary?: string;
  startSeconds?: number;
  confidence: "auto" | "verified";
}

interface TopEpisodeContext {
  episodeNumber: number;
  title: string;
  mentions: number;
  speakers: string[];
  guests: string[];
  segments: GatheredSegment[];
  transcriptExcerpts: TranscriptExcerpt[];
}

interface ExistingPage {
  path: string;
  title?: string;
}

interface SegmentMatchable {
  topicLabel?: string;
  summary?: string;
}

interface GatheredTopicContext {
  topicName: string;
  canonical: CanonicalTopicContext;
  topEpisodes: TopEpisodeContext[];
  existingPage?: ExistingPage;
}

const MAX_TOP_EPISODES = 6;
const MAX_TRANSCRIPT_EPISODES = 5;
const EXCERPT_RADIUS = 10;
const MAX_EXCERPTS_PER_EPISODE = 8;

function parseArguments(argv: string[]): ParsedArguments {
  const topicName = argv.find(argument => !argument.startsWith("--"))?.trim();

  if (!topicName) {
    throw new TypeError(
      "Usage: bun run src/scripts/gather-topic-context.ts <tag-name>",
    );
  }

  return { topicName };
}

function escapeRegExp(value: string): string {
  return value.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\\$&`);
}

function normalizeForMatching(value: string): string {
  return value.trim().toLowerCase();
}

function isAliasCandidate(canonical: string, variation: string): boolean {
  const normalizedCanonical = normalizeForMatching(canonical);
  const normalizedVariation = normalizeForMatching(variation);

  if (normalizedCanonical === normalizedVariation) {
    return false;
  }

  for (const suffix of ["'", "'s", "s"]) {
    if (normalizedVariation === `${normalizedCanonical}${suffix}`) {
      return false;
    }
  }

  return true;
}

function buildSearchTerms(canonical: CanonicalTopicContext): string[] {
  return [
    ...new Set([
      canonical.name,
      ...canonical.variations.map(variation => variation.name),
    ]),
  ].filter(Boolean);
}

function buildSearchPattern(canonical: CanonicalTopicContext): RegExp {
  const terms = buildSearchTerms(canonical)
    .map(escapeRegExp)
    .toSorted((left, right) => right.length - left.length);

  return new RegExp(String.raw`\b(?:${terms.join("|")})\b`, "i");
}

function toCanonicalTopicContext(
  entry: (typeof tagVocabulary)[number],
): CanonicalTopicContext {
  return {
    name: entry.canonical,
    category: entry.category,
    variations: entry.variations.map(variation => ({
      name: variation,
      isAliasCandidate: isAliasCandidate(entry.canonical, variation),
    })),
    status: entry.status,
  };
}

function findCanonicalTopic(topicName: string): CanonicalTopicContext {
  const requested = normalizeForMatching(topicName);

  for (const entry of tagVocabulary) {
    if (normalizeForMatching(entry.canonical) === requested) {
      return toCanonicalTopicContext(entry);
    }
  }

  for (const entry of tagVocabulary) {
    if (
      entry.variations.some(
        variation => normalizeForMatching(variation) === requested,
      )
    ) {
      return toCanonicalTopicContext(entry);
    }
  }

  throw new Error(`Topic "${topicName}" not found in tag vocabulary`);
}

async function loadTagEpisodeIndex(): Promise<
  Record<string, EpisodeIndexEntry[]>
> {
  return Bun.file("hugo/data/tag-episode-index.json").json();
}

function buildTagEpisodeLookup(
  index: Record<string, EpisodeIndexEntry[]>,
): Map<string, EpisodeIndexEntry[]> {
  return new Map(
    Object.entries(index).map(([topicName, episodes]) => [
      normalizeForMatching(topicName),
      episodes,
    ]),
  );
}

function findTagEpisodes(
  index: Map<string, EpisodeIndexEntry[]>,
  canonical: CanonicalTopicContext,
): EpisodeIndexEntry[] {
  const entry = index.get(normalizeForMatching(canonical.name));

  if (!entry) {
    throw new Error(`Topic "${canonical.name}" not found in tag episode index`);
  }

  return [...entry]
    .toSorted((left, right) => right.m - left.m)
    .slice(0, MAX_TOP_EPISODES);
}

function matchesTopicContext(
  segment: SegmentMatchable,
  pattern: RegExp,
): boolean {
  const fields = [segment.topicLabel, segment.summary].filter(
    Boolean,
  ) as string[];
  return fields.some(field => pattern.test(field));
}

function mergeSegmentData(
  processedSegments: StoredSegment[],
  frontmatterSegments: SegmentData[],
  pattern: RegExp,
): GatheredSegment[] {
  const frontmatterByKey = new Map(
    frontmatterSegments.map(segment => [
      `${segment.type}:${segment.startSeconds}`,
      segment,
    ]),
  );

  const gathered = processedSegments
    .filter(segment => matchesTopicContext(segment, pattern))
    .map(segment => {
      const startSeconds = timestampToSeconds(segment.startTimestamp);
      const frontmatter = frontmatterByKey.get(
        `${segment.type}:${startSeconds}`,
      );

      return {
        type: segment.type,
        anchor: frontmatter?.anchor,
        label: frontmatter?.label,
        topicLabel: frontmatter?.topicLabel ?? segment.topicLabel,
        summary: frontmatter?.summary ?? segment.summary,
        startSeconds: frontmatter?.startSeconds ?? startSeconds,
        confidence: segment.confidence,
      } satisfies GatheredSegment;
    });

  const knownKeys = new Set(
    gathered.map(segment => `${segment.type}:${segment.startSeconds ?? -1}`),
  );

  const frontmatterOnly = frontmatterSegments
    .filter(segment => matchesTopicContext(segment, pattern))
    .filter(
      segment => !knownKeys.has(`${segment.type}:${segment.startSeconds}`),
    )
    .map(segment => ({
      type: segment.type,
      anchor: segment.anchor,
      label: segment.label,
      topicLabel: segment.topicLabel,
      summary: segment.summary,
      startSeconds: segment.startSeconds,
      confidence: "verified" as const,
    }));

  return [...gathered, ...frontmatterOnly].toSorted((left, right) => {
    if (left.confidence !== right.confidence) {
      return left.confidence === "verified" ? -1 : 1;
    }
    return (left.startSeconds ?? 0) - (right.startSeconds ?? 0);
  });
}

function mergeWindows(
  indexes: number[],
  lineCount: number,
): Array<{ start: number; end: number }> {
  const windows = indexes
    .toSorted((left, right) => left - right)
    .map(index => ({
      start: Math.max(0, index - EXCERPT_RADIUS),
      end: Math.min(lineCount - 1, index + EXCERPT_RADIUS),
    }));

  const merged: Array<{ start: number; end: number }> = [];

  for (const window of windows) {
    const previous = merged.at(-1);
    if (!previous || window.start > previous.end + 1) {
      merged.push(window);
      continue;
    }

    previous.end = Math.max(previous.end, window.end);
  }

  return merged;
}

function formatTranscriptLine(line: TranscriptLine): string {
  return `${line.timestamp} ${line.speaker}: ${line.text}`;
}

function extractTranscriptExcerpts(
  transcript: string,
  pattern: RegExp,
): TranscriptExcerpt[] {
  const lines = parseTranscript(transcript);
  const matchingIndexes = lines.flatMap((line, index) =>
    pattern.test(`${line.speaker}: ${line.text}`) ? [index] : [],
  );

  const windows = mergeWindows(matchingIndexes, lines.length).slice(
    0,
    MAX_EXCERPTS_PER_EPISODE,
  );

  return windows.map(window => ({
    startLine: lines[window.start]?.lineNumber ?? window.start + 1,
    lines: lines.slice(window.start, window.end + 1).map(formatTranscriptLine),
  }));
}

async function loadFrontmatterSegments(
  episodeNumber: number,
): Promise<SegmentData[]> {
  const episodePath = `hugo/content/episodes/${episodeNumber}`;
  const entries = await Array.fromAsync(
    new Bun.Glob(`${episodePath}-*/index.md`).scan("."),
  );

  if (entries.length === 0) {
    return [];
  }

  if (entries.length > 1) {
    throw new Error(
      `Multiple Hugo episode files found for episode ${episodeNumber}`,
    );
  }

  const path = entries[0];
  if (!path) {
    throw new Error(`Missing Hugo episode file for episode ${episodeNumber}`);
  }

  const { frontmatter } = await parseHugoFile(path);
  const segmentData = (frontmatter as { segmentData?: SegmentData[] })
    .segmentData;
  return segmentData ?? [];
}

async function loadExistingPage(
  tagSlug: string,
): Promise<ExistingPage | undefined> {
  const path = `hugo/content/topics/${tagSlug}/_index.md`;

  try {
    const { frontmatter } = await parseHugoFile(path);
    return {
      path,
      title: frontmatter.title,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("ENOENT")) {
      return undefined;
    }

    return { path };
  }
}

function getTopEpisodeContextBase(
  episode: EpisodeIndexEntry,
  video: ProcessedVideo,
  segments: GatheredSegment[],
): TopEpisodeContext {
  return {
    episodeNumber: episode.ep,
    title: video.title,
    mentions: episode.m,
    speakers: video.speakers ?? [],
    guests: getGuestSpeakers(video.speakers),
    segments,
    transcriptExcerpts: [],
  };
}

async function buildEpisodeContext(
  episode: EpisodeIndexEntry,
  video: ProcessedVideo,
  pattern: RegExp,
  includeTranscriptExcerpts: boolean,
): Promise<TopEpisodeContext> {
  const frontmatterSegments = await loadFrontmatterSegments(episode.ep);
  const segments = mergeSegmentData(
    video.segments ?? [],
    frontmatterSegments,
    pattern,
  );
  const base = getTopEpisodeContextBase(episode, video, segments);

  if (!includeTranscriptExcerpts) {
    return base;
  }

  const transcript = await Bun.file(video.transcriptPath).text();
  return {
    ...base,
    transcriptExcerpts: extractTranscriptExcerpts(transcript, pattern),
  };
}

async function main(): Promise<void> {
  try {
    const args = parseArguments(process.argv.slice(2));
    const canonical = findCanonicalTopic(args.topicName);
    const [tagIndex, videos] = await Promise.all([
      loadTagEpisodeIndex(),
      listEpisodes(),
    ]);
    const tagLookup = buildTagEpisodeLookup(tagIndex);
    const pattern = buildSearchPattern(canonical);
    const topEpisodes = findTagEpisodes(tagLookup, canonical);
    const videosByEpisodeNumber = new Map(
      videos
        .filter(video => video.episodeNumber !== undefined)
        .map(video => [video.episodeNumber as number, video]),
    );

    const episodeContexts = await Promise.all(
      topEpisodes.map((episode, index) => {
        const video = videosByEpisodeNumber.get(episode.ep);
        if (!video) {
          throw new Error(
            `Episode ${episode.ep} not found in processed videos`,
          );
        }

        return buildEpisodeContext(
          episode,
          video,
          pattern,
          index < MAX_TRANSCRIPT_EPISODES,
        );
      }),
    );

    const result: GatheredTopicContext = {
      topicName: args.topicName,
      canonical,
      topEpisodes: episodeContexts,
      existingPage: await loadExistingPage(titleToSlug(canonical.name)),
    };

    console.log(JSON.stringify(result, undefined, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

await main();
