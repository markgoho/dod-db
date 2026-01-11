/**
 * Tag extraction pipeline using hybrid deterministic + LLM approach.
 *
 * Tier 1: Deterministic matching of known vocabulary (instant, free)
 * Tier 2: LLM discovery of new high-value tags (5+ mentions)
 * Tier 3: Manual learning loop (promote discoveries to vocabulary)
 */

import { z } from 'zod';
import { ai } from '../ai.js';
import { getAllSearchableTerms, tagVocabulary } from '../config/tag-vocabulary.js';
import { speakerIdModel } from '../config/models.js';
import { TagDiscoverySchema, tagExtractionPrompt } from '../prompts/tag-extraction.js';
import type { EpisodeTag } from '../storage/processed-videos.js';

/**
 * Extract tags from corrected transcript using hybrid approach.
 *
 * @param correctedTranscript - The corrected transcript text
 * @returns Array of Episode Tag objects with canonical names and mention counts
 */
export async function extractTags(correctedTranscript: string): Promise<EpisodeTag[]> {
	console.log('Extracting tags from transcript...');

	// Tier 1: Deterministic matching (all known vocabulary)
	console.log('  Phase 1: Deterministic vocabulary matching...');
	const deterministicTags = extractDeterministicTags(correctedTranscript);
	console.log(`  ✓ Found ${deterministicTags.length} known tags`);

	// Tier 2: LLM discovery (new terms with 5+ mentions)
	console.log('  Phase 2: LLM discovery of new tags (5+ mentions)...');
	const discoveredTags = await discoverNewTags(correctedTranscript, deterministicTags);
	console.log(`  ✓ Discovered ${discoveredTags.length} new potential tags`);

	// Merge results
	const allTags = mergeTags(deterministicTags, discoveredTags);

	// Sort by mention count (descending)
	allTags.sort((a, b) => b.mentions - a.mentions);

	console.log(`✓ Tag extraction complete: ${allTags.length} total tags`);

	return allTags;
}

/**
 * Extract tags using deterministic pattern matching.
 * Matches all known vocabulary terms (canonical + variations) using regex.
 *
 * @param transcript - The transcript text to analyze
 * @returns Array of tags with mention counts
 */
function extractDeterministicTags(transcript: string): EpisodeTag[] {
	const termMap = getAllSearchableTerms(tagVocabulary);
	const tagCounts = new Map<string, number>(); // canonical -> count
	const lowerTranscript = transcript.toLowerCase();

	for (const [searchTerm, canonical] of termMap.entries()) {
		// Whole-word matching with regex (case-insensitive)
		const pattern = new RegExp(`\\b${escapeRegex(searchTerm)}\\b`, 'gi');
		const matches = lowerTranscript.match(pattern);

		if (matches) {
			const currentCount = tagCounts.get(canonical) || 0;
			tagCounts.set(canonical, currentCount + matches.length);
		}
	}

	// Convert to EpisodeTag array
	return Array.from(tagCounts.entries()).map(([tag, mentions]) => ({
		tag,
		mentions,
	}));
}

/**
 * Use LLM to discover new tags not in vocabulary.
 * Only extracts tags with 5+ mentions to minimize noise.
 *
 * @param transcript - The transcript text to analyze
 * @param existingTags - Tags already found by deterministic matching
 * @returns Array of newly discovered tags
 */
async function discoverNewTags(
	transcript: string,
	existingTags: EpisodeTag[],
): Promise<EpisodeTag[]> {
	// Create exclusion list from existing tags
	const knownTags = new Set(existingTags.map((t) => t.tag.toLowerCase()));

	try {
		const response = await ai.models.generateContent({
			model: speakerIdModel, // gemini-2.0-flash (fast, cheap)
			contents: tagExtractionPrompt(transcript, Array.from(knownTags)),
			config: {
				responseMimeType: 'application/json',
				responseSchema: z.toJSONSchema(TagDiscoverySchema),
			},
		});

		const responseText = response.text;
		if (!responseText) {
			console.warn('  ⚠ Tag discovery returned empty response');
			return [];
		}

		const output = TagDiscoverySchema.parse(JSON.parse(responseText));

		// Filter to only tags with 5+ mentions
		return output.tags.filter((t) => t.mentions >= 5);
	} catch (error) {
		console.error('  ⚠ Tag discovery failed:', error);
		return [];
	}
}

/**
 * Merge deterministic and discovered tags, summing mention counts for duplicates.
 *
 * @param deterministic - Tags from vocabulary matching
 * @param discovered - Tags from LLM discovery
 * @returns Merged array of unique tags with combined counts
 */
function mergeTags(deterministic: EpisodeTag[], discovered: EpisodeTag[]): EpisodeTag[] {
	const merged = new Map<string, number>();

	// Add deterministic tags
	for (const tag of deterministic) {
		merged.set(tag.tag.toLowerCase(), tag.mentions);
	}

	// Add discovered tags (shouldn't overlap, but handle just in case)
	for (const tag of discovered) {
		const key = tag.tag.toLowerCase();
		const existing = merged.get(key) || 0;
		merged.set(key, existing + tag.mentions);
	}

	return Array.from(merged.entries()).map(([tag, mentions]) => ({
		tag,
		mentions,
	}));
}

/**
 * Escape special regex characters in search term.
 *
 * @param str - String to escape
 * @returns Escaped string safe for use in RegExp
 */
function escapeRegex(str: string): string {
	return str.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
