/**
 * Add a tag to the vocabulary file programmatically.
 */

import { tagVocabulary } from '../config/tag-vocabulary.js';
import type { TagCategory, TagDefinition } from '../config/tag-vocabulary.js';

export type AddTagParams =
	| {
			canonical: string;
			variations: string[];
			category: TagCategory;
			llmVerify: true;
			description: string;
	  }
	| {
			canonical: string;
			variations: string[];
			category: TagCategory;
			llmVerify?: false;
			description?: string;
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

	// Format the new tag entry
	const variationsStr = variations.length > 0
		? `[${variations.map(v => `'${v}'`).join(', ')}]`
		: '[]';

	// Build entry based on whether llmVerify is enabled
	let newEntry: string;
	if ('llmVerify' in params && params.llmVerify) {
		newEntry = `\t{ canonical: '${canonical}', variations: ${variationsStr}, category: '${category}', llmVerify: true, description: '${params.description}' },\n`;
	} else {
		newEntry = `\t{ canonical: '${canonical}', variations: ${variationsStr}, category: '${category}' },\n`;
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
		} as TagDefinition);
	} else {
		tagVocabulary.push({
			canonical,
			variations,
			category,
		} as TagDefinition);
	}

	console.log(`✓ Added tag "${canonical}" to vocabulary`);
}
