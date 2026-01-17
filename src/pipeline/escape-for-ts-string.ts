/**
 * Escape special characters for TypeScript string literals.
 * Handles apostrophes, quotes, and backslashes.
 */
export function escapeForTsString(string_: string): string {
  return string_
    .replaceAll("\\", "\\\\") // Escape backslashes first
    .replaceAll("'", String.raw`\'`); // Escape single quotes
}
