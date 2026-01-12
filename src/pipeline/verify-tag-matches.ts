/**
 * LLM-based verification of tag matches using context.
 * Used for ambiguous tags where regex matching needs additional validation.
 */

import { z } from 'zod';
import { ai } from '../ai.js';
import { speakerIdModel } from '../config/models.js';
import type { TagDefinition } from '../config/tag-vocabulary.js';

interface MatchContext {
	index: number;
	matchedText: string;
	contextBefore: string;
	contextAfter: string;
}

const VerificationResultSchema = z.object({
	matches: z.array(z.number()), // Array of indices that are valid matches
});

/**
 * Extract context around a match position.
 *
 * @param transcript - Full transcript text
 * @param start - Start position of match
 * @param end - End position of match
 * @param contextWords - Number of words to include before/after
 * @returns Context before and after the match
 */
function extractContext(
	transcript: string,
	start: number,
	end: number,
	contextWords = 15,
): { before: string; after: string } {
	// Get text before match
	const before = transcript.slice(0, start);
	const beforeWords = before.split(/\s+/).slice(-contextWords).join(' ');

	// Get text after match
	const after = transcript.slice(end);
	const afterWords = after.split(/\s+/).slice(0, contextWords).join(' ');

	return {
		before: beforeWords,
		after: afterWords,
	};
}

/**
 * Verify tag matches using LLM context analysis.
 * Makes a single batched API call to verify all matches at once.
 *
 * @param transcript - Full transcript text
 * @param matches - Array of match positions from regex
 * @param tag - Tag definition with description for LLM context
 * @returns Array of indices (into matches array) that are valid matches
 */
export async function verifyTagMatches(
	transcript: string,
	matches: Array<{ start: number; end: number; text: string }>,
	tag: TagDefinition & { llmVerify: true },
): Promise<number[]> {
	if (matches.length === 0) {
		return [];
	}

	// Extract context for each match
	const contexts: MatchContext[] = matches.map((match, index) => {
		const { before, after } = extractContext(transcript, match.start, match.end);
		return {
			index,
			matchedText: match.text,
			contextBefore: before,
			contextAfter: after,
		};
	});

	// Build verification prompt
	const prompt = buildVerificationPrompt(tag, contexts);

	try {
		const response = await ai.models.generateContent({
			model: speakerIdModel, // gemini-2.0-flash (fast, cheap)
			contents: prompt,
			config: {
				responseMimeType: 'application/json',
				responseSchema: z.toJSONSchema(VerificationResultSchema),
			},
		});

		const responseText = response.text;
		if (!responseText) {
			console.warn(`  ⚠ Verification returned empty response for "${tag.canonical}"`);
			return [];
		}

		const result = VerificationResultSchema.parse(JSON.parse(responseText));
		return result.matches;
	} catch (error) {
		console.error(`  ⚠ Verification failed for "${tag.canonical}":`, error);
		// On error, accept no matches rather than all (conservative)
		return [];
	}
}

/**
 * Build LLM prompt for context verification.
 *
 * @param tag - Tag definition with description
 * @param contexts - Array of match contexts to verify
 * @returns Formatted prompt string
 */
function buildVerificationPrompt(
	tag: TagDefinition & { llmVerify: true },
	contexts: MatchContext[],
): string {
	const variationsText =
		tag.variations.length > 0 ? `Also known as: ${tag.variations.join(', ')}` : '';

	return `You are a strict entity verification system. Your job is to identify which text mentions refer to a SPECIFIC historical/biblical entity.

TARGET ENTITY:
Name: "${tag.canonical}"
Category: ${tag.category}
Description: ${tag.description}
${variationsText}

TASK:
Below are ${contexts.length} potential matches. For each, determine if it refers to the SPECIFIC entity described above, NOT any other person/thing with the same name.

CONTEXTS:
${contexts
	.map(
		(ctx) =>
			`[${ctx.index}] "${ctx.contextBefore} **${ctx.matchedText}** ${ctx.contextAfter}"`,
	)
	.join('\n')}

STRICT RULES:
- ONLY include matches that clearly refer to ${tag.canonical} as described: ${tag.description}
- REJECT modern people (e.g., mentions of technology, contemporary events, modern locations)
- REJECT if context suggests a different person with the same name
- REJECT if you're uncertain - be conservative
- When in doubt, exclude it

OUTPUT:
Return JSON with "matches" array containing ONLY the indices of definite matches.

Examples:
- Valid matches at 0, 2, 5: {"matches": [0, 2, 5]}
- No valid matches: {"matches": []}
- All valid: {"matches": [${contexts.map((_, i) => i).join(', ')}]}`;
}
