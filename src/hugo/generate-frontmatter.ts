/**
 * Generate YAML frontmatter for Hugo episode pages.
 */

import type { ProcessedVideo } from "../storage/processed-videos.js";
import { formatSegmentsForFrontmatter } from "./format-segments-for-frontmatter.js";
import { getGuestSpeakers } from "./get-guest-speakers.js";

/**
 * Generate YAML frontmatter for an episode using Bun.YAML.
 */
export function generateFrontmatter(
  video: ProcessedVideo,
  cleanTitle: string,
): string {
  const tags = video.tags?.map(t => t.tag) ?? [];
  const books = video.scriptures?.map(s => s.book) ?? [];
  const guests = getGuestSpeakers(video.speakers);
  const { segments, segmentData } = formatSegmentsForFrontmatter(
    video.segments,
  );

  // Build frontmatter object
  // Convert date string to ISO format for consistent YAML output
  const frontmatter: Record<string, unknown> = {
    title: cleanTitle,
    date: new Date(video.publishedAt).toISOString(),
    episodeNumber: video.episodeNumber,
    videoId: video.videoId,
    aliases: [`/episodes/${video.episodeNumber}/`],
  };

  // Add optional fields only if they have values
  if (tags.length > 0) {
    frontmatter.tags = tags;
  }

  if (books.length > 0) {
    frontmatter.books = books;
  }

  if (guests.length > 0) {
    frontmatter.guests = guests;
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
