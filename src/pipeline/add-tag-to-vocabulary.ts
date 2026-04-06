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
import { withTagVocabularyWriteLock } from "./tag-vocabulary-write-lock.js";

function formatTagEntry(tag: TagDefinition): string {
  const lines = [
    "\t{",
    `\t\tcanonical: '${escapeForTsString(tag.canonical)}',`,
    `\t\tvariations: [${tag.variations.map(v => `'${escapeForTsString(v)}'`).join(", ")}],`,
    `\t\tcategory: '${tag.category}',`,
  ];

  if ("llmVerify" in tag && tag.llmVerify) {
    lines.push("\t\tllmVerify: true,");
  }

  if ("description" in tag && tag.description) {
    lines.push(`\t\tdescription: '${escapeForTsString(tag.description)}',`);
  }

  lines.push(`\t\tstatus: '${tag.status}',`);

  if (tag.caseSensitive) {
    lines.push("\t\tcaseSensitive: true,");
  }

  if (tag.addedInEpisode !== undefined) {
    lines.push(`\t\taddedInEpisode: ${tag.addedInEpisode},`);
  }

  if (tag.episodes && tag.episodes.length > 0) {
    lines.push(`\t\tepisodes: [${tag.episodes.join(", ")}],`);
  }

  lines.push("\t},");
  return `${lines.join("\n")}\n`;
}

function normalizeEpisodes(episodes?: number[]): number[] | undefined {
  const normalized = episodes
    ? [...new Set(episodes)].sort((a, b) => a - b)
    : undefined;
  return normalized && normalized.length > 0 ? normalized : undefined;
}

function buildTagDefinition(
  parameters: AddTagParams,
  status: TagStatus,
): TagDefinition {
  const baseTag = {
    canonical: parameters.canonical,
    variations: parameters.variations,
    category: parameters.category,
    status,
    caseSensitive: parameters.caseSensitive,
    addedInEpisode: parameters.addedInEpisode,
    episodes: normalizeEpisodes(parameters.episodes),
  };

  if ("llmVerify" in parameters && parameters.llmVerify) {
    return {
      ...baseTag,
      llmVerify: true,
      description: parameters.description,
    } as TagDefinition;
  }

  return parameters.description
    ? { ...baseTag, description: parameters.description }
    : (baseTag as TagDefinition);
}

export { buildTagDefinition, formatTagEntry, normalizeEpisodes };

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
  const { canonical } = parameters;

  await withTagVocabularyWriteLock(async () => {
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

    const status = parameters.status || "accepted";
    const newTag = buildTagDefinition(parameters, status);
    const newEntry = formatTagEntry(newTag);

    // Insert the new entry before the closing bracket
    const beforeClosing = content.slice(0, closingBracketIndex);
    const afterClosing = content.slice(closingBracketIndex);

    const newContent = beforeClosing + newEntry + afterClosing;

    // Write back to file
    await Bun.write(filePath, newContent);

    // Also update the in-memory vocabulary array so reprocessing can use it immediately
    tagVocabulary.push(newTag);

    const statusLabel = status === "proposed" ? " (proposed)" : "";
    console.log(`✓ Added tag "${canonical}" to vocabulary${statusLabel}`);
  });
}
