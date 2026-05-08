/**
 * Generate YAML frontmatter for Hugo episode pages.
 */

import type { ProcessedVideo } from "../catalog/episode-catalog.js";
import { getBookByAnyName } from "../config/get-book-by-any-name.js";
import type { TagDefinition } from "../config/tag-vocabulary.js";
import { tagVocabulary } from "../config/tag-vocabulary.js";
import { titleToSlug } from "../utils/title-to-slug.js";
import { formatSegmentsForFrontmatter } from "./format-segments-for-frontmatter.js";
import { getGuestSpeakers } from "./get-guest-speakers.js";

/**
 * Reload the vocabulary module from disk. The tools-server runs long enough
 * that out-of-band edits (topic-creation skills, git pulls, manual edits)
 * can leave the statically-imported `tagVocabulary` stale — so we re-import
 * with a cache-busting query each time frontmatter is generated.
 */
async function loadFreshTagVocabulary(): Promise<readonly TagDefinition[]> {
  try {
    const url = new URL("../config/tag-vocabulary.ts", import.meta.url);
    url.searchParams.set("t", Date.now().toString());
    const module = (await import(url.href)) as {
      tagVocabulary: readonly TagDefinition[];
    };
    return module.tagVocabulary;
  } catch {
    return tagVocabulary;
  }
}

function buildCanonicalNameBySlug(
  vocabulary: readonly TagDefinition[],
): Map<string, string> {
  return new Map(
    vocabulary.map(entry => [titleToSlug(entry.canonical), entry.canonical]),
  );
}

function loadTopicSlugs(): Set<string> {
  const topicSlugs = [
    ...new Bun.Glob("*/_index.md").scanSync({
      cwd: new URL("../../hugo/content/topics/", import.meta.url).pathname,
    }),
  ]
    .map(path => path.split("/")[0])
    .filter(Boolean) as string[];

  return new Set(topicSlugs);
}

export async function generateFrontmatter(
  video: ProcessedVideo,
  cleanTitle: string,
): Promise<string> {
  const topicSlugs = loadTopicSlugs();
  const vocabulary = await loadFreshTagVocabulary();
  const canonicalNameBySlug = buildCanonicalNameBySlug(vocabulary);
  const extractedTags = video.tags?.map(t => t.tag) ?? [];
  const topics = extractedTags.flatMap(tag => {
    const slug = titleToSlug(tag);
    if (!topicSlugs.has(slug)) {
      return [];
    }
    return [canonicalNameBySlug.get(slug) ?? tag];
  });
  const tags = extractedTags.filter(tag => !topicSlugs.has(titleToSlug(tag)));
  const guests = getGuestSpeakers(video.speakers);
  const { segments, segmentData } = formatSegmentsForFrontmatter(
    video.segments,
  );
  const books = [
    ...(video.scriptures?.map(s => s.book) ?? []),
    ...segmentData.flatMap(segment => {
      if (!segment.topicLabel) {
        return [];
      }

      const book = getBookByAnyName(segment.topicLabel);
      return book ? [book.canonical] : [];
    }),
  ].filter((book, index, list) => list.indexOf(book) === index);

  // Build frontmatter object
  // Convert date string to ISO format for consistent YAML output
  const frontmatter: Record<string, unknown> = {
    title: cleanTitle,
    date: new Date(video.publishedAt).toISOString(),
    episodeNumber: video.episodeNumber,
    videoId: video.videoId,
    aliases: [`/episodes/${video.episodeNumber}/`],
  };

  if (video.audioUrl) {
    frontmatter.audioUrl = video.audioUrl;
  }

  // Add optional fields only if they have values
  if (topics.length > 0) {
    frontmatter.topics = topics;
  }

  if (tags.length > 0) {
    frontmatter.tags = tags;
  }

  if (books.length > 0) {
    frontmatter.books = books;
  }

  if (guests.length > 0) {
    frontmatter.guests = guests;
  }

  if (video.episodeTopic) {
    frontmatter.episodeTopic = video.episodeTopic;
  }

  if (segments.length > 0) {
    frontmatter.segments = segments;
  }

  if (segmentData.length > 0) {
    frontmatter.segmentData = segmentData;
  }

  frontmatter.draft = false;

  // Use Bun.YAML to serialize (with 2-space indentation for block-style output)
  // Remove trailing whitespace from each line (Bun.YAML adds trailing spaces after block-style array keys)
  const frontmatterYaml = Bun.YAML.stringify(frontmatter, null, 2).replaceAll(
    / +\n/g,
    "\n",
  );

  return `---\n${frontmatterYaml}\n---`;
}
