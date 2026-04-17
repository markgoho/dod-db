import type { TagCategory, TagStatus } from "../config/tag-vocabulary.js";
import { tagVocabulary } from "../config/tag-vocabulary.js";
import { removeTagFromAllEpisodes } from "../utils/remove-tag-from-episodes.js";
import { renameTagInAllEpisodes } from "../utils/rename-tag-in-episodes.js";
import {
  buildTagDefinition,
  formatTagEntry,
  normalizeEpisodes,
} from "./add-tag-to-vocabulary.js";
import { findTag } from "./find-tag.js";
import { tagExists } from "./tag-exists.js";
import { withTagVocabularyWriteLock } from "./tag-vocabulary-write-lock.js";

export type UpdateTagParams = {
  canonical?: string; // New canonical name (if changing)
  variations?: string[];
  category?: TagCategory;
  status?: TagStatus;
  llmVerify?: boolean;
  caseSensitive?: boolean;
  description?: string;
  episodes?: number[];
};

/**
 * Update an existing tag in the vocabulary file.
 *
 * @param originalCanonical - The current canonical name of the tag to update
 * @param updates - The fields to update
 * @throws Error if tag doesn't exist or file operation fails
 */
export async function updateTagInVocabulary(
  originalCanonical: string,
  updates: UpdateTagParams,
): Promise<void> {
  await withTagVocabularyWriteLock(async () => {
    const existingTag = findTag(originalCanonical);
    if (!existingTag) {
      throw new Error(`Tag "${originalCanonical}" not found in vocabulary`);
    }

    // If changing canonical name, check for conflicts
    if (
      updates.canonical &&
      updates.canonical.toLowerCase() !== originalCanonical.toLowerCase() &&
      tagExists(updates.canonical)
    ) {
      throw new Error(
        `Tag "${updates.canonical}" already exists in vocabulary`,
      );
    }

    // Read the existing file
    const filePath = "src/config/tag-vocabulary.ts";
    const file = Bun.file(filePath);
    const content = await file.text();

    // Build regex to find the existing tag entry
    const escapedCanonical = originalCanonical.replaceAll(
      /[.*+?^${}()|[\]\\]/g,
      String.raw`\$&`,
    );
    const tagRegex = new RegExp(
      String.raw`\s+\{\s*canonical:\s*['"]${escapedCanonical}['"][\s\S]+?\},?\n`,
      "i",
    );

    const match = content.match(tagRegex);
    if (!match) {
      throw new Error(
        `Could not find tag "${originalCanonical}" in vocabulary file`,
      );
    }

    // Build the updated tag
    const newCanonical = updates.canonical || existingTag.canonical;
    const newVariations = updates.variations ?? existingTag.variations;
    const newCategory = updates.category || existingTag.category;
    const newStatus = updates.status || existingTag.status;
    const newLlmVerify =
      updates.llmVerify ??
      ("llmVerify" in existingTag ? existingTag.llmVerify : false);
    const newCaseSensitive =
      updates.caseSensitive ??
      ("caseSensitive" in existingTag ? existingTag.caseSensitive : false);
    const newDescription =
      updates.description ??
      ("description" in existingTag ? existingTag.description : undefined);
    const newAddedInEpisode =
      "addedInEpisode" in existingTag ? existingTag.addedInEpisode : undefined;
    const newEpisodes =
      updates.episodes ??
      ("episodes" in existingTag ? existingTag.episodes : undefined);

    const episodes = normalizeEpisodes(newEpisodes);
    const updatedTag = buildTagDefinition(
      newLlmVerify && newDescription
        ? {
            canonical: newCanonical,
            variations: newVariations,
            category: newCategory,
            llmVerify: true,
            description: newDescription,
            status: newStatus,
            caseSensitive: newCaseSensitive,
            addedInEpisode: newAddedInEpisode,
            episodes,
          }
        : {
            canonical: newCanonical,
            variations: newVariations,
            category: newCategory,
            description: newDescription,
            status: newStatus,
            caseSensitive: newCaseSensitive,
            addedInEpisode: newAddedInEpisode,
            episodes,
          },
      newStatus,
    );
    const newEntry = formatTagEntry(updatedTag);

    // Replace the old entry with the new one
    const newContent = content.replace(tagRegex, newEntry);

    // Write back to file
    await Bun.write(filePath, newContent);

    // Update in-memory array
    const index = tagVocabulary.findIndex(
      t => t.canonical.toLowerCase() === originalCanonical.toLowerCase(),
    );
    if (index !== -1) {
      tagVocabulary[index] = updatedTag;
    }

    console.log(
      `✓ Updated tag "${originalCanonical}"${newCanonical === originalCanonical ? "" : ` → "${newCanonical}"`}`,
    );

    if (newCanonical.toLowerCase() !== originalCanonical.toLowerCase()) {
      const renamedCount = await renameTagInAllEpisodes(
        originalCanonical,
        newCanonical,
      );
      if (renamedCount > 0) {
        console.log(
          `  Renamed stored episode tags in ${renamedCount} episode(s)`,
        );
      }
    }

    // If status changed to 'rejected', remove from all episodes
    if (updates.status === "rejected" && existingTag.status !== "rejected") {
      console.log(`  Removing tag from all episodes...`);
      const removedCount = await removeTagFromAllEpisodes(newCanonical);
      if (removedCount === 0) {
        console.log(`  (Tag was not found in any episodes)`);
      }
    }
  });
}
