/**
 * Add a tag to the vocabulary file programmatically.
 */

import { tagVocabulary } from '../config/tag-vocabulary.js';
import type { TagCategory, TagDefinition, TagStatus } from '../config/tag-vocabulary.js';

/**
 * Escape special characters for TypeScript string literals.
 * Handles apostrophes, quotes, and backslashes.
 */
function escapeForTsString(str: string): string {
	return str
		.replace(/\\/g, '\\\\')  // Escape backslashes first
		.replace(/'/g, "\\'");    // Escape single quotes
}

export type AddTagParams =
	| {
			canonical: string;
			variations: string[];
			category: TagCategory;
			llmVerify: true;
			description: string;
			status?: TagStatus;
	  }
	| {
			canonical: string;
			variations: string[];
			category: TagCategory;
			llmVerify?: false;
			description?: string;
			status?: TagStatus;
	  };

/**
 * Check if a tag already exists in the vocabulary.
 *
 * @param canonical - The canonical name to check
 * @returns true if tag exists (case-insensitive), false otherwise
 */
export function tagExists(canonical: string): boolean {
	const lowerCanonical = canonical.toLowerCase();
	return tagVocabulary.some((tag) => tag.canonical.toLowerCase() === lowerCanonical);
}

/**
 * Add a new tag to tag-vocabulary.ts file and update in-memory array.
 * Appends to the end of the tagVocabulary array.
 *
 * @param params - Tag parameters
 * @throws Error if tag already exists or file operation fails
 */
export async function addTagToVocabulary(params: AddTagParams): Promise<void> {
	const { canonical, variations, category } = params;

	// Check for duplicates
	if (tagExists(canonical)) {
		throw new Error(`Tag "${canonical}" already exists in vocabulary`);
	}

	// Read the existing file
	const filePath = 'src/config/tag-vocabulary.ts';
	const file = Bun.file(filePath);
	const content = await file.text();

	// Find the last entry before the closing ];
	const closingBracketIndex = content.lastIndexOf('];');
	if (closingBracketIndex === -1) {
		throw new Error('Could not find closing bracket in tag-vocabulary.ts');
	}

	// Format the new tag entry (with proper escaping)
	const variationsStr = variations.length > 0
		? `[${variations.map(v => `'${escapeForTsString(v)}'`).join(', ')}]`
		: '[]';

	// Build entry based on options (llmVerify, status)
	const status = params.status || 'accepted';
	const statusStr = status !== 'accepted' ? `, status: '${status}'` : '';

	let newEntry: string;
	if ('llmVerify' in params && params.llmVerify) {
		newEntry = `\t{ canonical: '${escapeForTsString(canonical)}', variations: ${variationsStr}, category: '${category}', llmVerify: true, description: '${escapeForTsString(params.description)}'${statusStr} },\n`;
	} else {
		newEntry = `\t{ canonical: '${escapeForTsString(canonical)}', variations: ${variationsStr}, category: '${category}'${statusStr} },\n`;
	}

	// Insert the new entry before the closing bracket
	const beforeClosing = content.slice(0, closingBracketIndex);
	const afterClosing = content.slice(closingBracketIndex);

	const newContent = beforeClosing + newEntry + afterClosing;

	// Write back to file
	await Bun.write(filePath, newContent);

	// Also update the in-memory vocabulary array so reprocessing can use it immediately
	if ('llmVerify' in params && params.llmVerify) {
		tagVocabulary.push({
			canonical,
			variations,
			category,
			llmVerify: true,
			description: params.description,
			status,
		} as TagDefinition);
	} else {
		tagVocabulary.push({
			canonical,
			variations,
			category,
			status,
		} as TagDefinition);
	}

	const statusLabel = status === 'proposed' ? ' (proposed)' : '';
	console.log(`✓ Added tag "${canonical}" to vocabulary${statusLabel}`);
}

/**
 * Find a tag in the vocabulary by canonical name.
 *
 * @param canonical - The canonical name to find
 * @returns The tag definition if found, undefined otherwise
 */
export function findTag(canonical: string): TagDefinition | undefined {
	const lowerCanonical = canonical.toLowerCase();
	return tagVocabulary.find((tag) => tag.canonical.toLowerCase() === lowerCanonical);
}

export type UpdateTagParams = {
	canonical?: string; // New canonical name (if changing)
	variations?: string[];
	category?: TagCategory;
	status?: TagStatus;
	llmVerify?: boolean;
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
	if (updates.canonical && updates.canonical.toLowerCase() !== originalCanonical.toLowerCase()) {
		if (tagExists(updates.canonical)) {
			throw new Error(`Tag "${updates.canonical}" already exists in vocabulary`);
		}
	}

	// Read the existing file
	const filePath = 'src/config/tag-vocabulary.ts';
	const file = Bun.file(filePath);
	const content = await file.text();

	// Build regex to find the existing tag entry
	const escapedCanonical = originalCanonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const tagRegex = new RegExp(
		`\\t\\{\\s*canonical:\\s*'${escapedCanonical}'[^}]+\\},?\\n`,
		'i',
	);

	const match = content.match(tagRegex);
	if (!match) {
		throw new Error(`Could not find tag "${originalCanonical}" in vocabulary file`);
	}

	// Build the updated tag
	const newCanonical = updates.canonical || existingTag.canonical;
	const newVariations = updates.variations ?? existingTag.variations;
	const newCategory = updates.category || existingTag.category;
	const newStatus = updates.status || existingTag.status;
	const newLlmVerify = updates.llmVerify ?? ('llmVerify' in existingTag ? existingTag.llmVerify : false);
	const newDescription = updates.description ?? ('description' in existingTag ? existingTag.description : undefined);

	// Format the new entry (with proper escaping)
	const variationsStr = newVariations.length > 0
		? `[${newVariations.map(v => `'${escapeForTsString(v)}'`).join(', ')}]`
		: '[]';
	const statusStr = newStatus !== 'accepted' ? `, status: '${newStatus}'` : '';

	let newEntry: string;
	if (newLlmVerify && newDescription) {
		newEntry = `\t{ canonical: '${escapeForTsString(newCanonical)}', variations: ${variationsStr}, category: '${newCategory}', llmVerify: true, description: '${escapeForTsString(newDescription)}', status: '${newStatus}' },\n`;
	} else {
		newEntry = `\t{ canonical: '${escapeForTsString(newCanonical)}', variations: ${variationsStr}, category: '${newCategory}', status: '${newStatus}' },\n`;
	}

	// Replace the old entry with the new one
	const newContent = content.replace(tagRegex, newEntry);

	// Write back to file
	await Bun.write(filePath, newContent);

	// Update in-memory array
	const index = tagVocabulary.findIndex(
		(t) => t.canonical.toLowerCase() === originalCanonical.toLowerCase(),
	);
	if (index !== -1) {
		const updatedTag: TagDefinition = newLlmVerify && newDescription
			? {
					canonical: newCanonical,
					variations: newVariations,
					category: newCategory,
					llmVerify: true,
					description: newDescription,
					status: newStatus,
				}
			: {
					canonical: newCanonical,
					variations: newVariations,
					category: newCategory,
					status: newStatus,
				};
		tagVocabulary[index] = updatedTag;
	}

	console.log(`✓ Updated tag "${originalCanonical}"${newCanonical !== originalCanonical ? ` → "${newCanonical}"` : ''}`);
}

/**
 * Delete a tag from the vocabulary file.
 *
 * @param canonical - The canonical name of the tag to delete
 * @throws Error if tag doesn't exist or file operation fails
 */
export async function deleteTagFromVocabulary(canonical: string): Promise<void> {
	const existingTag = findTag(canonical);
	if (!existingTag) {
		throw new Error(`Tag "${canonical}" not found in vocabulary`);
	}

	// Read the existing file
	const filePath = 'src/config/tag-vocabulary.ts';
	const file = Bun.file(filePath);
	const content = await file.text();

	// Build regex to find the existing tag entry
	const escapedCanonical = canonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const tagRegex = new RegExp(
		`\\t\\{\\s*canonical:\\s*'${escapedCanonical}'[^}]+\\},?\\n`,
		'i',
	);

	const newContent = content.replace(tagRegex, '');

	// Write back to file
	await Bun.write(filePath, newContent);

	// Remove from in-memory array
	const index = tagVocabulary.findIndex(
		(t) => t.canonical.toLowerCase() === canonical.toLowerCase(),
	);
	if (index !== -1) {
		tagVocabulary.splice(index, 1);
	}

	console.log(`✓ Deleted tag "${canonical}" from vocabulary`);
}
