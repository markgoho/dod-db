/**
 * Extract a single tag from transcript.
 * Used when adding a new tag to vocabulary - only processes that one tag.
 */

import { tagVocabulary } from '../config/tag-vocabulary.js';
import { verifyTagMatches } from './verify-tag-matches.js';
import type { EpisodeTag } from '../storage/processed-videos.js';
import type { TagDefinition } from '../config/tag-vocabulary.js';

/**
 * Extract mentions of a single tag from transcript.
 * More efficient than full extraction when you only need one tag.
 *
 * @param transcript - The transcript text to analyze
 * @param canonical - The canonical tag name to search for
 * @param enableLlmVerification - If true, use LLM to verify ambiguous matches
 * @returns EpisodeTag object with mention count, or null if no matches
 */
export async function extractSingleTag(
	transcript: string,
	canonical: string,
	enableLlmVerification = true,
): Promise<EpisodeTag | null> {
	// Find tag definition
	const tagDef = tagVocabulary.find((t) => t.canonical === canonical);
	if (!tagDef) {
		throw new Error(`Tag "${canonical}" not found in vocabulary`);
	}

	// Build search terms (canonical + variations)
	const searchTerms = [tagDef.canonical, ...tagDef.variations];

	// Sort by length (longest first) to handle overlaps
	searchTerms.sort((a, b) => b.length - a.length);

	// Escape special regex characters
	const escapeRegex = (string_: string): string => {
		return string_.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
	};

	// Find all speaker label regions to exclude from matching
	// Pattern: [HH:MM:SS.mmm] Speaker Name:
	const speakerLabelRanges: Array<{ start: number; end: number }> = [];
	const speakerLabelPattern = /\[\d{2}:\d{2}:\d{2}(?:\.\d{3})?\]\s+([^:]+):/g;
	let speakerMatch;
	while ((speakerMatch = speakerLabelPattern.exec(transcript)) !== null) {
		// Only exclude the speaker name portion (not the timestamp or colon)
		const fullMatch = speakerMatch[0]; // e.g., "[00:00:09.120] Aaron Adair:"
		const speakerName = speakerMatch[1]; // e.g., "Aaron Adair"
		if (!speakerName) continue; // Skip if no capture group match
		const speakerNameStart = speakerMatch.index + fullMatch.indexOf(speakerName);
		const speakerNameEnd = speakerNameStart + speakerName.length;
		speakerLabelRanges.push({ start: speakerNameStart, end: speakerNameEnd });
	}

	// Track matched positions to avoid double-counting
	const matchedRanges: Array<{ start: number; end: number }> = [];
	const matches: Array<{ start: number; end: number; text: string }> = [];

	const isOverlapping = (start: number, end: number): boolean => {
		return matchedRanges.some(
			(range) => !(end <= range.start || start >= range.end),
		);
	};

	// Check if a range falls within a speaker label
	const isInSpeakerLabel = (start: number, end: number): boolean => {
		return speakerLabelRanges.some(
			(range) => start >= range.start && end <= range.end,
		);
	};

	// Determine case sensitivity
	const caseSensitive = tagDef.caseSensitive ?? false;
	const flags = caseSensitive ? 'g' : 'gi';

	// Find all matches
	for (const searchTerm of searchTerms) {
		const pattern = new RegExp(String.raw`\b${escapeRegex(searchTerm)}\b`, flags);
		let match;

		while ((match = pattern.exec(transcript)) !== null) {
			const start = match.index;
			const end = start + match[0].length;

			// Skip if this match overlaps with an already-matched region
			if (isOverlapping(start, end)) {
				continue;
			}

			// Skip if this match falls within a speaker label
			if (isInSpeakerLabel(start, end)) {
				continue;
			}

			matchedRanges.push({ start, end });
			matches.push({ start, end, text: match[0] });
		}
	}

	// If no matches found, return null
	if (matches.length === 0) {
		return null;
	}

	// Check if LLM verification is needed
	const needsVerification =
		enableLlmVerification &&
		'llmVerify' in tagDef &&
		tagDef.llmVerify;

	let verifiedCount = matches.length;

	if (needsVerification) {
		console.log(`    Verifying ${matches.length} matches for "${canonical}"...`);
		const verifiedIndices = await verifyTagMatches(
			transcript,
			matches,
			tagDef as TagDefinition & { llmVerify: true },
		);
		verifiedCount = verifiedIndices.length;
		console.log(
			`    ✓ ${verifiedIndices.length}/${matches.length} verified`,
		);
	}

	// Return null if no verified matches
	if (verifiedCount === 0) {
		return null;
	}

	return {
		tag: canonical,
		mentions: verifiedCount,
	};
}
