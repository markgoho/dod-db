/**
 * Add a tag to the vocabulary file programmatically.
 */

import type {
  TagCategory,
  TagDefinition,
  TagStatus,
} from "../config/tag-vocabulary.js";
import { tagVocabulary } from "../config/tag-vocabulary.js";
import { isScriptureTag } from "../utils/is-scripture-tag.js";
import { escapeForTsString } from "./escape-for-ts-string.js";
import { tagExists } from "./tag-exists.js";

export type AddTagParams =
  | {
      canonical: string;
      variations: string[];
      category: TagCategory;
      llmVerify: true;
      description: string;
      status?: TagStatus;
      caseSensitive?: boolean;
      addedInEpisode?: number;
      episodes?: number[];
    }
  | {
      canonical: string;
      variations: string[];
      category: TagCategory;
      llmVerify?: false;
      description?: string;
      status?: TagStatus;
      caseSensitive?: boolean;
      addedInEpisode?: number;
      episodes?: number[];
    };

/**
 * Add a new tag to tag-vocabulary.ts file and update in-memory array.
 * Appends to the end of the tagVocabulary array.
 *
 * @param params - Tag parameters
 * @throws Error if tag already exists or file operation fails
 */
export async function addTagToVocabulary(
  parameters: AddTagParams,
): Promise<void> {
  const { canonical, variations, category } = parameters;

  // Block scripture references/books - handled by separate extraction
  if (isScriptureTag(canonical)) {
    throw new Error(
      `Tag "${canonical}" is a scripture reference or Bible book`,
    );
  }

  // Check for duplicates
  if (tagExists(canonical)) {
    throw new Error(`Tag "${canonical}" already exists in vocabulary`);
  }

  // Read the existing file
  const filePath = "src/config/tag-vocabulary.ts";
  const file = Bun.file(filePath);
  const content = await file.text();

  // Find the last entry before the closing ];
  const closingBracketIndex = content.lastIndexOf("];");
  if (closingBracketIndex === -1) {
    throw new Error("Could not find closing bracket in tag-vocabulary.ts");
  }

  // Format the new tag entry (with proper escaping)
  const variationsString =
    variations.length > 0
      ? `[${variations.map(v => `'${escapeForTsString(v)}'`).join(", ")}]`
      : "[]";

  // Build entry based on options (llmVerify, caseSensitive, status, addedInEpisode, description)
  const status = parameters.status || "accepted";
  const statusString = `, status: '${status}'`;
  const caseSensitiveString = parameters.caseSensitive
    ? ", caseSensitive: true"
    : "";
  const addedInEpisodeString = parameters.addedInEpisode
    ? `, addedInEpisode: ${parameters.addedInEpisode}`
    : "";
  const descriptionString = parameters.description
    ? `, description: '${escapeForTsString(parameters.description)}'`
    : "";
  const episodes = parameters.episodes
    ? [...new Set(parameters.episodes)].sort((a, b) => a - b)
    : undefined;
  const episodesString =
    episodes && episodes.length > 0
      ? `, episodes: [${episodes.join(", ")}]`
      : "";

  const newEntry =
    "llmVerify" in parameters && parameters.llmVerify
      ? `\t{ canonical: '${escapeForTsString(canonical)}', variations: ${variationsString}, category: '${category}', llmVerify: true, description: '${escapeForTsString(parameters.description)}'${statusString}${caseSensitiveString}${addedInEpisodeString}${episodesString} },\n`
      : `\t{ canonical: '${escapeForTsString(canonical)}', variations: ${variationsString}, category: '${category}'${descriptionString}${statusString}${caseSensitiveString}${addedInEpisodeString}${episodesString} },\n`;

  // Insert the new entry before the closing bracket
  const beforeClosing = content.slice(0, closingBracketIndex);
  const afterClosing = content.slice(closingBracketIndex);

  const newContent = beforeClosing + newEntry + afterClosing;

  // Write back to file
  await Bun.write(filePath, newContent);

  // Also update the in-memory vocabulary array so reprocessing can use it immediately
  if ("llmVerify" in parameters && parameters.llmVerify) {
    tagVocabulary.push({
      canonical,
      variations,
      category,
      llmVerify: true,
      description: parameters.description,
      status,
      caseSensitive: parameters.caseSensitive,
      addedInEpisode: parameters.addedInEpisode,
      episodes,
    } as TagDefinition);
  } else {
    // Build tag with description if provided
    const baseTag = {
      canonical,
      variations,
      category,
      status,
      caseSensitive: parameters.caseSensitive,
      addedInEpisode: parameters.addedInEpisode,
      episodes,
    };

    tagVocabulary.push(
      parameters.description
        ? { ...baseTag, description: parameters.description }
        : baseTag,
    );
  }

  const statusLabel = status === "proposed" ? " (proposed)" : "";
  console.log(`✓ Added tag "${canonical}" to vocabulary${statusLabel}`);
}
