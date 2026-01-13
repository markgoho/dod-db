/**
 * LLM prompt and schema for tag discovery.
 * Used to identify NEW high-value tags (3+ mentions) that aren't in the vocabulary yet.
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
				'character',
				'person',
				'place',
				'people',
				'literature',
				'theology',
				'scholarship',
				'religion',
				'event',
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
 * @param allowedCategories - If provided, only extract tags in these categories
 * @returns Formatted prompt string for LLM
 */
export function tagExtractionPrompt(
	transcript: string,
	excludeTags: string[],
	allowedCategories?: string[],
): string {
	const exclusionList =
		excludeTags.length > 0
			? `\n\n<exclude-tags>\nDO NOT include these tags (already identified):\n${excludeTags.map((t) => `- ${t}`).join('\n')}\n</exclude-tags>`
			: '';

	const categoryRestriction = allowedCategories
		? `\n\n<category-restriction>\n⚠️  IMPORTANT: ONLY extract tags in these categories: ${allowedCategories.join(', ')}\nIgnore all other categories completely.\n</category-restriction>`
		: '';

	return `You are an expert in biblical scholarship and theological terminology. Extract significant tags from this podcast transcript.

<podcast-context>
This is "Data Over Dogma" - a biblical scholarship podcast with hosts Dan McClellan and Dan Beecher.
Topics include ancient Near Eastern history, biblical texts, theological concepts, and scholarly methodology.
</podcast-context>

<extraction-rules>
1. Extract tags that appear 3+ times in the transcript (be thorough!)
2. Focus on high-value content and categorize properly:

   CRITICAL DISTINCTION - character vs person vs people:
   - character: Biblical/mythological characters who may not have historically existed (Moses, David, Paul, Lilith, Baal, Asherah)
   - person: Historical people who verifiably lived (Bart Ehrman, Athanasius of Alexandria, Cyrus the Great, Antiochus IV Epiphanes)
   - people: COLLECTIVE ethnic/national GROUPS (Israelites, Canaanites, Amorites, Philistines, Moabites, Egyptians, Romans)

   Other categories:
   - place: Geographic locations (Jerusalem, Babylon, Tigris River, Canaan)
   - literature: Texts/books (1 Enoch, Book of Watchers, Gospel of Mark)
   - theology: Religious concepts (divine council, atonement, Christology)
   - scholarship: Academic methods (form criticism, textual variants)
   - religion: Religious traditions and denominations (Judaism, Christianity, Islam, Zoroastrianism)
   - event: Historical events, councils, wars (Council of Nicaea, Babylonian Exile, exodus event)
   - Use "other" ONLY if truly none of the above fit - prefer assigning a category
3. Use canonical forms (not variations):
   - "Septuagint" not "LXX"
   - "First Enoch" or "1 Enoch" not "Enoch" (the book vs the character)
4. Skip overly generic terms:
   - Skip: "Bible", "scripture", "God", "text", "book" (unless part of specific name)
   - Include: "Hebrew Bible", "Elohim" (specific theological term), "biblical canon"
5. Skip host names (Dan McClellan, Dan Beecher)
6. Count accurately (case-insensitive). AIM FOR 5-15 NEW TAGS per transcript!
</extraction-rules>
${exclusionList}${categoryRestriction}

<example-input>
Transcript discussing the Septuagint translation, mentioning Moses 12 times,
Torah 8 times, LXX 3 times, and textual criticism 6 times.
</example-input>

<example-output>
{
  "tags": [
    {"tag": "Moses", "mentions": 12, "category": "character"},
    {"tag": "Torah", "mentions": 8, "category": "literature"},
    {"tag": "textual criticism", "mentions": 6, "category": "scholarship"}
  ]
}
</example-output>

Note: LXX was only mentioned 3 times (below threshold) so it's excluded.

<category-distinction-example>
✓ CORRECT categorization:
- "Sarah" → character (individual person)
- "Israelites" → people (ethnic group)
- "David" → character (individual king)
- "Philistines" → people (national group)
- "Joseph" → character (individual patriarch)
- "Moabites" → people (tribal group)

✗ WRONG categorization:
- "Sarah" → people (NO! She's an individual)
- "Cain" → people (NO! He's an individual)
- "Israelites" → character (NO! They're a group)
</category-distinction-example>

Transcript to analyze:
---
${transcript}
---`;
}
