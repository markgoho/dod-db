/**
 * Escape special regex characters in a string.
 */
export function escapeRegex(string_: string): string {
  return string_.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}
