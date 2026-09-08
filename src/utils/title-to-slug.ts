import slugifyLib from "slugify";

// Handle CommonJS default export with Node16 resolution
const slugify =
  (slugifyLib as { default?: typeof slugifyLib }).default || slugifyLib;

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

/**
 * Slug for a Hugo taxonomy term's content bundle folder (e.g.
 * hugo/content/topics/<slug>/, hugo/content/tags/<slug>/).
 *
 * Hugo auto-generates a term page for every distinct taxonomy value, keyed by
 * the raw term string with only whitespace collapsed to hyphens and lowercased
 * -- punctuation like apostrophes is kept. A hand-authored content bundle only
 * fuses with that auto page (picking up its aggregated episode list) when its
 * folder name matches that raw key exactly. Naming the folder with titleToSlug
 * instead (which strips apostrophes) still produces the same *published* URL,
 * but as a separate, unfused page that silently shows zero episodes.
 */
export function taxonomyFolderSlug(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, "-");
}
