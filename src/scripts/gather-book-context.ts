import { listEpisodes } from "../catalog/episode-catalog.js";
import {
  scriptureBooks,
  type BookDefinition,
} from "../config/scripture-books.js";
import { getGuestSpeakers } from "../hugo/get-guest-speakers.js";
import type { SegmentData, StoredSegment } from "../hugo/shared.js";
import { buildBookNamePatterns } from "../pipeline/build-book-name-patterns.js";
import type { TranscriptLine } from "../pipeline/detect-segments-types.js";
import { parseSpokenScriptureReference } from "../pipeline/parse-spoken-scripture-reference.js";
import { parseTranscript } from "../pipeline/parse-transcript.js";
import { timestampToSeconds } from "../pipeline/timestamp-to-seconds.js";
import { parseHugoFile } from "../utils/parse-hugo-file.js";
import { titleToSlug } from "../utils/title-to-slug.js";

interface ParsedArguments {
  bookName: string;
}

interface TranscriptExcerpt {
  startLine: number;
  lines: string[];
}

interface SegmentCandidate {
  type: string;
  episodeNumber: number;
  anchor?: string;
  label?: string;
  topicLabel?: string;
  summary?: string;
  startSeconds?: number;
  confidence: "auto" | "verified";
}

interface EpisodeContext {
  episodeNumber: number;
  title: string;
  slug: string;
  guests: string[];
  transcriptExcerpts: TranscriptExcerpt[];
}

interface ExistingPage {
  path: string;
  frontmatter: Record<string, unknown>;
  body: string;
}

interface GatheredBookContext {
  requestedBookName: string;
  canonicalName: string;
  bookSlug: string;
  testament: BookDefinition["testament"];
  abbreviations: string[];
  variants: string[];
  nrsvueUrl: string;
  chapterAndVerseMatches: SegmentCandidate[];
  otherSegmentMentions: SegmentCandidate[];
  episodes: EpisodeContext[];
  existingPage?: ExistingPage;
}

const EXCERPT_RADIUS = 10;
const MAX_EXCERPTS_PER_EPISODE = 5;
const MAX_TRANSCRIPT_EPISODES = 5;

function parseArguments(argv: string[]): ParsedArguments {
  const bookName = argv.find(argument => !argument.startsWith("--"))?.trim();

  if (!bookName) {
    throw new TypeError(
      "Usage: bun run src/scripts/gather-book-context.ts <book-name>",
    );
  }

  return { bookName };
}

function normalizeForMatching(value: string): string {
  return value.trim().toLowerCase();
}

function findCanonicalBook(bookName: string): BookDefinition {
  const requested = normalizeForMatching(bookName);

  for (const book of scriptureBooks) {
    if (normalizeForMatching(book.canonical) === requested) {
      return book;
    }
  }

  for (const book of scriptureBooks) {
    if (
      book.abbreviations.some(
        abbreviation =>
          normalizeForMatching(abbreviation).replaceAll(".", "") ===
          requested.replaceAll(".", ""),
      )
    ) {
      return book;
    }

    if (
      book.variants.some(variant => normalizeForMatching(variant) === requested)
    ) {
      return book;
    }
  }

  throw new Error(`Scripture book "${bookName}" not found`);
}

function buildBookSearchPattern(book: BookDefinition): RegExp {
  const patterns = buildBookNamePatterns(book).toSorted(
    (left, right) => right.length - left.length,
  );
  return new RegExp(String.raw`\b(?:${patterns.join("|")})\b`, "i");
}

function formatTranscriptLine(line: TranscriptLine): string {
  return `${line.timestamp} ${line.speaker}: ${line.text}`;
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

async function loadEpisodeFiles(): Promise<string[]> {
  return Array.fromAsync(
    new Bun.Glob("hugo/content/episodes/*/index.md").scan("."),
  );
}

async function loadFrontmatterSegments(
  episodeNumber: number,
): Promise<SegmentData[]> {
  const entries = await Array.fromAsync(
    new Bun.Glob(`hugo/content/episodes/${episodeNumber}-*/index.md`).scan("."),
  );

  if (entries.length === 0) {
    return [];
  }

  const path = entries[0];
  if (!path) {
    return [];
  }

  const { frontmatter } = await parseHugoFile(path);
  return (frontmatter as { segmentData?: SegmentData[] }).segmentData ?? [];
}

function mergeSegmentData(
  episodeNumber: number,
  processedSegments: StoredSegment[],
  frontmatterSegments: SegmentData[],
): SegmentCandidate[] {
  const frontmatterByKey = new Map(
    frontmatterSegments.map(segment => [
      `${segment.type}:${segment.startSeconds}`,
      segment,
    ]),
  );

  const processed = processedSegments.map(segment => {
    const startSeconds = timestampToSeconds(segment.startTimestamp);
    const frontmatter = frontmatterByKey.get(`${segment.type}:${startSeconds}`);

    return {
      type: segment.type,
      episodeNumber,
      anchor: frontmatter?.anchor,
      label: frontmatter?.label,
      topicLabel: frontmatter?.topicLabel ?? segment.topicLabel,
      summary: frontmatter?.summary ?? segment.summary,
      startSeconds: frontmatter?.startSeconds ?? startSeconds,
      confidence: segment.confidence,
    } satisfies SegmentCandidate;
  });

  const knownKeys = new Set(
    processed.map(segment => `${segment.type}:${segment.startSeconds ?? -1}`),
  );

  const frontmatterOnly = frontmatterSegments
    .filter(
      segment => !knownKeys.has(`${segment.type}:${segment.startSeconds}`),
    )
    .map(segment => ({
      type: segment.type,
      episodeNumber,
      anchor: segment.anchor,
      label: segment.label,
      topicLabel: segment.topicLabel,
      summary: segment.summary,
      startSeconds: segment.startSeconds,
      confidence: "verified" as const,
    }));

  return [...processed, ...frontmatterOnly].toSorted((left, right) => {
    if (left.confidence !== right.confidence) {
      return left.confidence === "verified" ? -1 : 1;
    }
    return (left.startSeconds ?? 0) - (right.startSeconds ?? 0);
  });
}

function matchesBookMention(
  segment: Pick<SegmentCandidate, "topicLabel" | "summary">,
  pattern: RegExp,
): boolean {
  return [segment.topicLabel, segment.summary]
    .filter(Boolean)
    .some(field => pattern.test(field as string));
}

function matchesChapterAndVerseBook(
  segment: Pick<SegmentCandidate, "type" | "topicLabel">,
  canonicalName: string,
  pattern: RegExp,
): boolean {
  if (segment.type !== "chapter-and-verse" || !segment.topicLabel) {
    return false;
  }

  const parsed =
    parseSpokenScriptureReference(segment.topicLabel) ?? segment.topicLabel;

  return (
    normalizeForMatching(parsed).startsWith(
      `${normalizeForMatching(canonicalName)} `,
    ) || pattern.test(segment.topicLabel)
  );
}

async function loadExistingPage(
  bookSlug: string,
): Promise<ExistingPage | undefined> {
  const path = `hugo/content/books/${bookSlug}/_index.md`;

  try {
    const parsedPage = await parseHugoFile(path);
    const { frontmatter, content } = parsedPage;
    return {
      path,
      frontmatter: frontmatter as unknown as Record<string, unknown>,
      body: content.trim(),
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("ENOENT")) {
      return undefined;
    }
    throw error;
  }
}

function buildNrsvueUrl(canonicalName: string): string {
  const params = new URLSearchParams({
    search: canonicalName,
    version: "NRSVUE",
  });
  return `https://www.biblegateway.com/passage/?${params.toString()}`;
}

async function buildEpisodeContexts(
  canonicalName: string,
): Promise<EpisodeContext[]> {
  const episodeFiles = await loadEpisodeFiles();
  const episodes: EpisodeContext[] = [];

  for (const filePath of episodeFiles) {
    const { frontmatter } = await parseHugoFile(filePath);
    const episodeFrontmatter = frontmatter as typeof frontmatter & {
      books?: string[];
      speakers?: string[];
    };
    const books = Array.isArray(episodeFrontmatter.books)
      ? episodeFrontmatter.books
      : [];
    if (!books.includes(canonicalName)) {
      continue;
    }

    const episodeNumber = Number(episodeFrontmatter.episodeNumber);
    const slug = filePath
      .replace(/^hugo\/content\/episodes\//, "")
      .replace(/\/index\.md$/, "");

    episodes.push({
      episodeNumber,
      title: String(episodeFrontmatter.title),
      slug,
      guests: getGuestSpeakers(episodeFrontmatter.speakers ?? []),
      transcriptExcerpts: [],
    });
  }

  return episodes.toSorted(
    (left, right) => right.episodeNumber - left.episodeNumber,
  );
}

async function main(): Promise<void> {
  try {
    const args = parseArguments(process.argv.slice(2));
    const book = findCanonicalBook(args.bookName);
    const bookSlug = titleToSlug(book.canonical);
    const pattern = buildBookSearchPattern(book);
    const [videos, episodes] = await Promise.all([
      listEpisodes(),
      buildEpisodeContexts(book.canonical),
    ]);

    const segmentGroups = await Promise.all(
      videos
        .filter(video => video.episodeNumber !== undefined)
        .map(async video =>
          mergeSegmentData(
            video.episodeNumber as number,
            video.segments ?? [],
            await loadFrontmatterSegments(video.episodeNumber as number),
          ),
        ),
    );
    const mergedSegments = segmentGroups.flat();

    const chapterAndVerseMatches = mergedSegments.filter(segment =>
      matchesChapterAndVerseBook(segment, book.canonical, pattern),
    );
    const otherSegmentMentions = mergedSegments.filter(
      segment =>
        segment.type !== "chapter-and-verse" &&
        matchesBookMention(segment, pattern),
    );

    const segmentCounts = new Map<number, number>();
    for (const segment of [
      ...chapterAndVerseMatches,
      ...otherSegmentMentions,
    ]) {
      segmentCounts.set(
        segment.episodeNumber,
        (segmentCounts.get(segment.episodeNumber) ?? 0) + 1,
      );
    }

    const transcriptEpisodes = [...episodes]
      .toSorted((left, right) => {
        const leftCount = segmentCounts.get(left.episodeNumber) ?? 0;
        const rightCount = segmentCounts.get(right.episodeNumber) ?? 0;
        if (leftCount !== rightCount) {
          return rightCount - leftCount;
        }
        return right.episodeNumber - left.episodeNumber;
      })
      .slice(0, MAX_TRANSCRIPT_EPISODES);

    const videosByEpisodeNumber = new Map(
      videos
        .filter(video => video.episodeNumber !== undefined)
        .map(video => [video.episodeNumber as number, video]),
    );

    for (const episode of transcriptEpisodes) {
      const video = videosByEpisodeNumber.get(episode.episodeNumber);
      if (!video?.transcriptPath) {
        continue;
      }

      const transcript = await Bun.file(video.transcriptPath).text();
      episode.transcriptExcerpts = extractTranscriptExcerpts(
        transcript,
        pattern,
      );
    }

    const result: GatheredBookContext = {
      requestedBookName: args.bookName,
      canonicalName: book.canonical,
      bookSlug,
      testament: book.testament,
      abbreviations: book.abbreviations,
      variants: book.variants,
      nrsvueUrl: buildNrsvueUrl(book.canonical),
      chapterAndVerseMatches,
      otherSegmentMentions,
      episodes,
      existingPage: await loadExistingPage(bookSlug),
    };

    console.log(JSON.stringify(result, undefined, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

await main();
