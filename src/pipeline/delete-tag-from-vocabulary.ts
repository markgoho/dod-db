import { tagVocabulary } from "../config/tag-vocabulary.js";
import { findTag } from "./find-tag.js";

/**
 * Delete a tag from the vocabulary file.
 *
 * @param canonical - The canonical name of the tag to delete
 * @throws Error if tag doesn't exist or file operation fails
 */
export async function deleteTagFromVocabulary(
  canonical: string,
): Promise<void> {
  const existingTag = findTag(canonical);
  if (!existingTag) {
    throw new Error(`Tag "${canonical}" not found in vocabulary`);
  }

  // Read the existing file
  const filePath = "src/config/tag-vocabulary.ts";
  const file = Bun.file(filePath);
  const content = await file.text();

  // Build regex to find the existing tag entry
  const escapedCanonical = canonical.replaceAll(
    /[.*+?^${}()|[\]\\]/g,
    String.raw`\$&`,
  );
  const tagRegex = new RegExp(
    String.raw`\s+\{\s*canonical:\s*['"]${escapedCanonical}['"][\s\S]+?\},?\n`,
    "i",
  );

  const newContent = content.replace(tagRegex, "");

  // Write back to file
  await Bun.write(filePath, newContent);

  // Remove from in-memory array
  const index = tagVocabulary.findIndex(
    t => t.canonical.toLowerCase() === canonical.toLowerCase(),
  );
  if (index !== -1) {
    tagVocabulary.splice(index, 1);
  }

  console.log(`✓ Deleted tag "${canonical}" from vocabulary`);
}
