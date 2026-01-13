/**
 * Tag extraction orchestrator using hybrid deterministic + LLM approach.
 *
 * Tier 1: Deterministic matching of known vocabulary (instant, free)
 * Tier 2: LLM discovery of new high-value tags (5+ mentions)
 * Tier 3: Manual learning loop (promote discoveries to vocabulary)
 */

import { extractTagsDeterministic } from './extract-tags-deterministic.js';
import { extractTagsLlm } from './extract-tags-llm.js';
import type { EpisodeTag } from '../storage/processed-videos.js';

/**
 * Extract tags from corrected transcript using hybrid approach.
 *
 * @param correctedTranscript - The corrected transcript text
 * @param options - Optional configuration
 * @param options.skipLlm - If true, skip LLM discovery (only use deterministic matching)
 * @param options.enableLlmVerification - If true, use LLM to verify ambiguous tag matches
 * @returns Array of Episode Tag objects with canonical names and mention counts
 */
export async function extractTags(
	correctedTranscript: string,
	options: { skipLlm?: boolean; enableLlmVerification?: boolean } = {},
): Promise<EpisodeTag[]> {
	console.log('Extracting tags from transcript...');

	// Tier 1: Deterministic matching (all known vocabulary)
	console.log('  Phase 1: Deterministic vocabulary matching...');
	const deterministicTags = await extractTagsDeterministic(correctedTranscript, {
		enableLlmVerification: options.enableLlmVerification,
	});
	console.log(`  ✓ Found ${deterministicTags.length} known tags`);

	// Tier 2: LLM discovery (new terms with 5+ mentions) - optional
	let discoveredTags: EpisodeTag[] = [];
	if (!options.skipLlm) {
		console.log('  Phase 2: LLM discovery of new tags (5+ mentions)...');
		discoveredTags = await extractTagsLlm(correctedTranscript, deterministicTags);
		console.log(`  ✓ Discovered ${discoveredTags.length} new potential tags`);

		// Report discovered tags as vocabulary suggestions
		if (discoveredTags.length > 0) {
			console.log('\n📋 NEW TAG SUGGESTIONS (not in vocabulary):');
			console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
			for (const tag of discoveredTags.sort((a, b) => b.mentions - a.mentions)) {
				console.log(`  • ${tag.tag} (${tag.mentions} mentions)`);
			}
			console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
			console.log('💡 Consider adding these to src/config/tag-vocabulary.ts');
			console.log('   or use the Web UI: bun run src/scripts/tag-vocabulary-ui.ts\n');
		}
	} else {
		console.log('  Phase 2: Skipped (skipLlm option enabled)');
	}

	// Merge results
	const allTags = mergeTags(deterministicTags, discoveredTags);

	// Sort by mention count (descending)
	allTags.sort((a, b) => b.mentions - a.mentions);

	console.log(`✓ Tag extraction complete: ${allTags.length} total tags`);

	return allTags;
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

	// Add deterministic tags (preserve canonical case)
	for (const tag of deterministic) {
		merged.set(tag.tag, tag.mentions);
	}

	// Add discovered tags (shouldn't overlap, but handle just in case)
	for (const tag of discovered) {
		const existing = merged.get(tag.tag) || 0;
		merged.set(tag.tag, existing + tag.mentions);
	}

	return Array.from(merged.entries()).map(([tag, mentions]) => ({
		tag,
		mentions,
	}));
}
