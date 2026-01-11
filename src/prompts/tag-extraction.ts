/**
 * LLM prompt and schema for tag discovery.
 * Used to identify NEW high-value tags (5+ mentions) that aren't in the vocabulary yet.
 */

import { z } from 'zod';

/**
 * Zod schema for structured tag discovery output from LLM.
 * Each discovered tag includes its name, mention count, and category.
 */
export const TagDiscoverySchema = z.object({
	tags: z.array(
		z.object({
			tag: z.string(),
			mentions: z.number(),
			category: z.enum([
				'biblical-character',
				'biblical-place',
				'biblical-text',
				'theological-concept',
				'scholarly-term',
				'other',
			]),
		}),
	),
});

export type TagDiscovery = z.infer<typeof TagDiscoverySchema>;

/**
 * Generate prompt for LLM tag discovery.
 * Instructs the model to identify significant tags mentioned 5+ times,
 * excluding tags already identified by deterministic matching.
 *
 * @param transcript - The corrected transcript to analyze
 * @param excludeTags - List of tags already identified (lowercase) to exclude
 * @returns Formatted prompt string for LLM
 */
export function tagExtractionPrompt(transcript: string, excludeTags: string[]): string {
	const exclusionList =
		excludeTags.length > 0
			? `\n\n<exclude-tags>\nDO NOT include these tags (already identified):\n${excludeTags.map((t) => `- ${t}`).join('\n')}\n</exclude-tags>`
			: '';

	return `You are an expert in biblical scholarship and theological terminology. Extract significant tags from this podcast transcript.

<podcast-context>
This is "Data Over Dogma" - a biblical scholarship podcast with hosts Dan McClellan and Dan Beecher.
Topics include ancient Near Eastern history, biblical texts, theological concepts, and scholarly methodology.
</podcast-context>

<extraction-rules>
1. ONLY extract tags that appear 5+ times in the transcript
2. Focus on high-value content:
   - Biblical characters (Moses, Abraham, Jesus, Peter, Isaiah)
   - Biblical places (Jerusalem, Babylon, Egypt, Sinai)
   - Biblical texts (Torah, Gospel of Mark, Dead Sea Scrolls, Septuagint)
   - Theological concepts (univocality, atonement, incarnation, divine council)
   - Scholarly terms (redaction criticism, textual variants, source criticism)
3. Use canonical forms (not variations):
   - "Septuagint" not "LXX"
   - "Moses" not "Moses'" or "Moshe"
   - "Torah" not "Tora"
4. Skip generic terms unless they're specific concepts:
   - Skip: "Bible", "scripture", "God" (too generic)
   - Include: "Hebrew Bible", "biblical canon", "divine council" (specific concepts)
5. Skip host names (Dan McClellan, Dan Beecher)
6. Count accurately across the full transcript (case-insensitive)
</extraction-rules>
${exclusionList}

<example-input>
Transcript discussing the Septuagint translation, mentioning Moses 12 times,
Torah 8 times, LXX 3 times, and textual criticism 6 times.
</example-input>

<example-output>
{
  "tags": [
    {"tag": "Moses", "mentions": 12, "category": "biblical-character"},
    {"tag": "Torah", "mentions": 8, "category": "biblical-text"},
    {"tag": "textual criticism", "mentions": 6, "category": "scholarly-term"}
  ]
}
</example-output>

Note: LXX was only mentioned 3 times (below threshold) so it's excluded.

Transcript to analyze:
---
${transcript.slice(0, 50000)}
---`;
}
