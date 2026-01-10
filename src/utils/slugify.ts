import slugify from 'slugify';

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
 * Format ISO 8601 date to YYYY-MM-DD.
 * Example: "2024-01-15T12:00:00Z" → "2024-01-15"
 */
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toISOString().split('T')[0];
}
