import { formatDate } from "../utils/format-date.js";
import { titleToSlug } from "../utils/title-to-slug.js";

/**
 * Generate transcript filename from title and publish date.
 * Format: YYYY-MM-DD-title-slug.txt
 * Example: "2024-01-15-episode-1-the-beginning.txt"
 */
export function generateTranscriptFilename(
  title: string,
  publishedAt: string,
): string {
  const date = formatDate(publishedAt);
  const slug = titleToSlug(title);
  return `${date}-${slug}.txt`;
}
