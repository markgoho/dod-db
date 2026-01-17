/**
 * Convert a title to a URL-safe slug.
 * Examples:
 * - "The End(s) of Monotheism" -> "the-ends-of-monotheism"
 * - "God's Wife" -> "gods-wife"
 * - "Ehrmageddon!" -> "ehrmageddon"
 */
export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replaceAll(/[()'"!?]/g, "") // Remove punctuation
    .replaceAll(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replaceAll(/-+/g, "-") // Collapse multiple hyphens
    .replaceAll(/^-|-$/g, ""); // Remove leading/trailing hyphens
}
