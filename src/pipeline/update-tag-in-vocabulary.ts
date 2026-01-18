import type {
  TagCategory,
  TagDefinition,
  TagStatus,
} from "../config/tag-vocabulary.js";
import { tagVocabulary } from "../config/tag-vocabulary.js";
import { removeTagFromAllEpisodes } from "../utils/remove-tag-from-episodes.js";
import { escapeForTsString } from "./escape-for-ts-string.js";
import { findTag } from "./find-tag.js";
import { tagExists } from "./tag-exists.js";

export type UpdateTagParams = {
  canonical?: string; // New canonical name (if changing)
  variations?: string[];
  category?: TagCategory;
  status?: TagStatus;
  llmVerify?: boolean;
  caseSensitive?: boolean;
  description?: string;
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
    throw new Error(`Tag "${updates.canonical}" already exists in vocabulary`);
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

  // Format the new entry (with proper escaping)
  const variationsString =
    newVariations.length > 0
      ? `[${newVariations.map(v => `'${escapeForTsString(v)}'`).join(", ")}]`
      : "[]";
  const statusString = `, status: '${newStatus}'`;
  const caseSensitiveString = newCaseSensitive ? ", caseSensitive: true" : "";
  const addedInEpisodeString =
    newAddedInEpisode === undefined
      ? ""
      : `, addedInEpisode: ${newAddedInEpisode}`;

  const newEntry =
    newLlmVerify && newDescription
      ? `\t{ canonical: '${escapeForTsString(newCanonical)}', variations: ${variationsString}, category: '${newCategory}', llmVerify: true, description: '${escapeForTsString(newDescription)}'${statusString}${caseSensitiveString}${addedInEpisodeString} },\n`
      : `\t{ canonical: '${escapeForTsString(newCanonical)}', variations: ${variationsString}, category: '${newCategory}'${statusString}${caseSensitiveString}${addedInEpisodeString} },\n`;

  // Replace the old entry with the new one
  const newContent = content.replace(tagRegex, newEntry);

  // Write back to file
  await Bun.write(filePath, newContent);

  // Update in-memory array
  const index = tagVocabulary.findIndex(
    t => t.canonical.toLowerCase() === originalCanonical.toLowerCase(),
  );
  if (index !== -1) {
    const updatedTag: TagDefinition =
      newLlmVerify && newDescription
        ? {
            canonical: newCanonical,
            variations: newVariations,
            category: newCategory,
            llmVerify: true,
            description: newDescription,
            status: newStatus,
            caseSensitive: newCaseSensitive,
            ...(newAddedInEpisode !== undefined && {
              addedInEpisode: newAddedInEpisode,
            }),
          }
        : {
            canonical: newCanonical,
            variations: newVariations,
            category: newCategory,
            status: newStatus,
            caseSensitive: newCaseSensitive,
            ...(newAddedInEpisode !== undefined && {
              addedInEpisode: newAddedInEpisode,
            }),
          };
    tagVocabulary[index] = updatedTag;
  }

  console.log(
    `✓ Updated tag "${originalCanonical}"${newCanonical === originalCanonical ? "" : ` → "${newCanonical}"`}`,
  );

  // If status changed to 'rejected', remove from all episodes
  if (updates.status === "rejected" && existingTag.status !== "rejected") {
    console.log(`  Removing tag from all episodes...`);
    const removedCount = await removeTagFromAllEpisodes(newCanonical);
    if (removedCount === 0) {
      console.log(`  (Tag was not found in any episodes)`);
    }
  }
}
