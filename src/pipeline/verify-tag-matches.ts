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
	verifications: z.array(z.object({
		index: z.number(),
		isMatch: z.boolean(),
		reasoning: z.string(),
	})),
});

/**
 * Extract context around a match position using complete timestamped lines.
 *
 * @param transcript - Full transcript text
 * @param start - Start position of match
 * @param end - End position of match
 * @param contextLines - Number of complete lines to include before/after (default: 2)
 * @returns Context before and after the match
 */
function extractContext(
	transcript: string,
	start: number,
	end: number,
	contextLines = 2,
): { before: string; after: string } {
	// Split transcript into lines (preserving timestamps)
	const lines = transcript.split('\n');

	// Find which line contains the match
	let charCount = 0;
	let matchLineIndex = -1;

	for (const [index, line] of lines.entries()) {
		if (!line) continue;
		const lineLength = line.length + 1; // +1 for the newline
		if (charCount <= start && start < charCount + lineLength) {
			matchLineIndex = index;
			break;
		}
		charCount += lineLength;
	}

	if (matchLineIndex === -1) {
		// Fallback to word-based context if line detection fails
		const before = transcript.slice(0, start);
		const beforeWords = before.split(/\s+/).slice(-15).join(' ');
		const after = transcript.slice(end);
		const afterWords = after.split(/\s+/).slice(0, 15).join(' ');
		return { before: beforeWords, after: afterWords };
	}

	// Get contextLines before the match line
	const startLine = Math.max(0, matchLineIndex - contextLines);
	const beforeLines = lines.slice(startLine, matchLineIndex);

	// Get contextLines after the match line
	const endLine = Math.min(lines.length, matchLineIndex + contextLines + 1);
	const afterLines = lines.slice(matchLineIndex + 1, endLine);

	return {
		before: beforeLines.join('\n'),
		after: afterLines.join('\n'),
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

		// Log detailed results for debugging
		console.log(`\n  📋 LLM Verification Results for "${tag.canonical}":`);
		let acceptedCount = 0;
		let rejectedCount = 0;

		for (const verification of result.verifications) {
			const match = matches[verification.index];
			if (!match) continue;
			const symbol = verification.isMatch ? '✓' : '✗';
			const color = verification.isMatch ? '\u001B[32m' : '\u001B[31m'; // green : red
			const reset = '\u001B[0m';

			console.log(`${color}  ${symbol}${reset} [${verification.index}] "${match.text}"`);
			console.log(`     Reasoning: ${verification.reasoning}`);

			if (verification.isMatch) {
				acceptedCount++;
			} else {
				rejectedCount++;
			}
		}

		console.log(`  Summary: ${acceptedCount} accepted, ${rejectedCount} rejected\n`);

		// Return only the indices of accepted matches
		return result.verifications
			.filter(v => v.isMatch)
			.map(v => v.index);
	} catch (error) {
		// Check if it's a rate limit error (429)
		const errorMessage = error instanceof Error ? error.message : String(error);
		if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
			console.error(`  ⚠️  Rate limit hit for "${tag.canonical}" - waiting 60s before retry...`);
			// Wait 60 seconds and retry once
			await new Promise(resolve => setTimeout(resolve, 60_000));
			try {
				console.log(`  🔄 Retrying verification for "${tag.canonical}"...`);
				const retryResponse = await ai.models.generateContent({
					model: speakerIdModel,
					contents: prompt,
					config: {
						responseMimeType: 'application/json',
						responseSchema: z.toJSONSchema(VerificationResultSchema),
					},
				});

				const retryResponseText = retryResponse.text;
				if (!retryResponseText) {
					console.warn(`  ⚠ Retry returned empty response for "${tag.canonical}"`);
					return [];
				}

				const retryResult = VerificationResultSchema.parse(JSON.parse(retryResponseText));
				const verifiedIndices = retryResult.verifications
					.filter(v => v.isMatch)
					.map(v => v.index);

				console.log(`  ✅ Retry successful: ${verifiedIndices.length}/${matches.length} verified`);
				return verifiedIndices;
			} catch (retryError) {
				console.error(`  ❌ Retry failed for "${tag.canonical}":`, retryError);
				return [];
			}
		}

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
		(context) =>
			`[${context.index}] "${context.contextBefore} **${context.matchedText}** ${context.contextAfter}"`,
	)
	.join('\n')}

STRICT RULES:
- ONLY include matches that clearly refer to ${tag.canonical} as described: ${tag.description}
- REJECT modern people (e.g., mentions of technology, contemporary events, modern locations)
- REJECT if context suggests a different person with the same name
- REJECT if you're uncertain - be conservative
- When in doubt, exclude it

OUTPUT:
For EACH of the ${contexts.length} contexts above, return a verification object with:
- "index": the context number [0-${contexts.length - 1}]
- "isMatch": true if it's a definite match for ${tag.canonical}, false otherwise
- "reasoning": brief explanation (1-2 sentences) of why you accepted or rejected it

Example format:
{
  "verifications": [
    {"index": 0, "isMatch": true, "reasoning": "Context mentions Persian Empire and dates to 550 BC, clearly referring to Cyrus the Great."},
    {"index": 1, "isMatch": false, "reasoning": "Appears in modern discussion without historical context, likely a person's name today."},
    {"index": 2, "isMatch": true, "reasoning": "Biblical reference to the king who freed the Israelites, matches the historical figure."}
  ]
}`;
}
