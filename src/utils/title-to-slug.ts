import slugifyLib from "slugify";

// Handle CommonJS default export with Node16 resolution
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const slugify = (slugifyLib as any).default || slugifyLib;

/**
 * Convert title to URL-safe slug.
 * Example: "Song of Songs & Stuff!" → "song-of-songs-stuff"
 */
export function titleToSlug(title: string): string {
  return slugify(title, {
    lower: true,
    strict: true, // Remove special characters
    remove: /[*+~.()'"!:@]/g,
  });
}
