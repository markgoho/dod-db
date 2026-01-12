/**
 * LLM-based tag discovery for terms not in vocabulary.
 * Uses Gemini AI to discover new high-value tags (5+ mentions).
 */

import { z } from 'zod';
import { ai } from '../ai.js';
import { speakerIdModel } from '../config/models.js';
import { TagDiscoverySchema, tagExtractionPrompt } from '../prompts/tag-extraction.js';
import type { EpisodeTag } from '../storage/processed-videos.js';

/**
 * Use LLM to discover new tags not in vocabulary.
 * Only extracts tags with 5+ mentions to minimize noise.
 *
 * @param transcript - The transcript text to analyze
 * @param existingTags - Tags already found by deterministic matching (to exclude from LLM search)
 * @returns Array of newly discovered tags
 */
export async function extractTagsLlm(
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
