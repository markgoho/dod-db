/**
 * Deterministic tag extraction using vocabulary pattern matching.
 * Fast, free, and deterministic - matches known vocabulary terms via regex.
 * Supports optional LLM verification for ambiguous matches.
 */

import { getAllSearchableTerms, tagVocabulary } from '../config/tag-vocabulary.js';
import { verifyTagMatches } from './verify-tag-matches.js';
import type { EpisodeTag } from '../storage/processed-videos.js';
import type { TagDefinition } from '../config/tag-vocabulary.js';

/**
 * Extract tags using deterministic pattern matching against known vocabulary.
 * Matches all vocabulary terms (canonical + variations) using case-sensitive regex with word boundaries.
 * Handles overlapping patterns by matching longer patterns first and excluding overlapped regions.
 * Optionally uses LLM to verify ambiguous matches based on context.
 *
 * @param transcript - The transcript text to analyze
 * @param options - Optional configuration
 * @param options.enableLlmVerification - If true, use LLM to verify tags with llmVerify: true
 * @returns Array of tags with mention counts
 */
export async function extractTagsDeterministic(
	transcript: string,
	options: { enableLlmVerification?: boolean } = {},
): Promise<EpisodeTag[]> {
	const { enableLlmVerification = false } = options;

	// Filter out rejected tags - only match accepted/proposed tags
	const activeVocabulary = tagVocabulary.filter(t => t.status !== 'rejected');

	// Build term map, but if LLM verification is disabled, skip variations for tags with llmVerify: true
	// (canonical forms like "King David" are usually unambiguous, but variations like "David" are ambiguous)
	const termMap = new Map<string, string>();
	for (const def of activeVocabulary) {
		// Always include canonical form
		termMap.set(def.canonical, def.canonical);

		// Include variations only if:
		// - LLM verification is enabled, OR
		// - Tag doesn't require verification
		const tagNeedsVerification = 'llmVerify' in def && def.llmVerify;
		if (enableLlmVerification || !tagNeedsVerification) {
			for (const variation of def.variations) {
				termMap.set(variation, def.canonical);
			}
		}
	}

	const tagCounts = new Map<string, number>(); // canonical -> count

	// Build array of search patterns sorted by length (longest first)
	const patterns = Array.from(termMap.entries())
		.map(([searchTerm, canonical]) => ({
			searchTerm,
			canonical,
			pattern: new RegExp(`\\b${escapeRegex(searchTerm)}\\b`, 'g'),
		}))
		.sort((a, b) => b.searchTerm.length - a.searchTerm.length);

	// Track matched positions to avoid double-counting overlaps
	const matchedRanges: Array<{ start: number; end: number }> = [];

	// Track matches for tags that need LLM verification
	const matchesNeedingVerification = new Map<
		string,
		Array<{ start: number; end: number; text: string }>
	>();

	// Check if a range overlaps with any already-matched range
	const isOverlapping = (start: number, end: number): boolean => {
		return matchedRanges.some(
			(range) => !(end <= range.start || start >= range.end),
		);
	};

	// Get tag definition for a canonical name (from active vocabulary only)
	const getTagDefinition = (canonical: string): TagDefinition | undefined => {
		return activeVocabulary.find((t) => t.canonical === canonical);
	};

	// Process patterns from longest to shortest
	for (const { searchTerm, canonical, pattern } of patterns) {
		let match;
		// Reset regex lastIndex for each pattern
		pattern.lastIndex = 0;

		const tagDef = getTagDefinition(canonical);
		const needsVerification =
			enableLlmVerification &&
			tagDef &&
			'llmVerify' in tagDef &&
			tagDef.llmVerify;

		while ((match = pattern.exec(transcript)) !== null) {
			const start = match.index;
			const end = start + match[0].length;

			// Skip if this match overlaps with an already-matched region
			if (isOverlapping(start, end)) {
				continue;
			}

			// Record this match
			matchedRanges.push({ start, end });

			if (needsVerification) {
				// Store match for later verification
				if (!matchesNeedingVerification.has(canonical)) {
					matchesNeedingVerification.set(canonical, []);
				}
				matchesNeedingVerification.get(canonical)!.push({
					start,
					end,
					text: match[0],
				});
			} else {
				// Count immediately (no verification needed)
				const currentCount = tagCounts.get(canonical) || 0;
				tagCounts.set(canonical, currentCount + 1);
			}
		}
	}

	// Verify matches for tags that need LLM verification
	if (enableLlmVerification && matchesNeedingVerification.size > 0) {
		console.log(
			`  LLM verification needed for ${matchesNeedingVerification.size} tag(s)`,
		);

		for (const [canonical, matches] of matchesNeedingVerification) {
			const tagDef = getTagDefinition(canonical);
			if (!tagDef || !('llmVerify' in tagDef) || !tagDef.llmVerify) {
				continue;
			}

			console.log(
				`    Verifying ${matches.length} matches for "${canonical}"...`,
			);
			const verifiedIndices = await verifyTagMatches(
				transcript,
				matches,
				tagDef,
			);

			// Count only verified matches (only add if > 0)
			if (verifiedIndices.length > 0) {
				tagCounts.set(canonical, verifiedIndices.length);
			}
			console.log(
				`    ✓ ${verifiedIndices.length}/${matches.length} verified`,
			);
		}
	}

	// Convert to EpisodeTag array
	return Array.from(tagCounts.entries()).map(([tag, mentions]) => ({
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
