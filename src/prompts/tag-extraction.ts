/**
 * LLM prompt and schema for tag discovery.
 * Used to identify NEW high-value tags (3+ mentions) that aren't in the vocabulary yet.
 */

import { z } from "zod";

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
        "character",
        "person",
        "place",
        "people",
        "literature",
        "theology",
        "scholarship",
        "religion",
        "event",
        "miscellaneous",
      ]),
      description: z.string(), // Brief context for disambiguation (1-2 sentences)
      variations: z.array(z.string()).optional(), // Alternative names, spellings, or abbreviations
      caseSensitive: z.boolean().optional(), // True for short words that match common English (Lot, Job, Mark)
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
      ? `\n\n<exclude-tags>\nDO NOT include these tags (already identified):\n${excludeTags.map(t => `- ${t}`).join("\n")}\n</exclude-tags>`
      : "";

  const categoryRestriction = allowedCategories
    ? `\n\n<category-restriction>\n⚠️  IMPORTANT: ONLY extract tags in these categories: ${allowedCategories.join(", ")}\nIgnore all other categories completely.\n</category-restriction>`
    : "";

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
   - miscellaneous: Fallback bucket when none of the above fit well
   - Use "miscellaneous" ONLY if truly none of the above fit - prefer assigning a more specific category
3. Use canonical forms (not variations):
   - "Septuagint" not "LXX"
   - "First Enoch" or "1 Enoch" not "Enoch" (the book vs the character)
4. Skip overly generic terms:
   - Skip: "Bible", "scripture", "God", "text", "book", "king", "queen", "senate", "first century", "texts", "documents"
   - Include: "Hebrew Bible", "Elohim" (specific theological term), "biblical canon"
   - Exception: Specific kings like "King Josiah", "Nebuchadnezzar" ARE valid tags
5. Skip host names (Dan McClellan, Dan Beecher)
6. Count accurately (case-insensitive). AIM FOR 5-15 NEW TAGS per transcript!
7. Use PROPER CAPITALIZATION:
   - Proper nouns: "John the Baptist" not "john the baptist"
   - Titles: "Gospel of Thomas" not "gospel of thomas"
   - Names: "Helen Bond" not "helen bond"
   - Places: "Jerusalem" not "jerusalem"
8. Do NOT suggest Bible books, abbreviations, or chapter/verse references as tags:
   - Skip book names like "Genesis", "Isaiah", "Luke", or "Romans"
   - Skip references like "Genesis 1", "Luke 6", or "1 Corinthians 13:4"
   - Scripture references are handled separately from tag extraction
9. Stay focused on ANCIENT WORLD and BIBLICAL SCHOLARSHIP:
   - INCLUDE: Ancient Near East places (Babylon, Ugarit), biblical characters, ancient empires, scholars who study the Bible
   - EXCLUDE: Modern cities mentioned in passing (New Orleans, Paris, Seattle)
   - EXCLUDE: Historical figures unrelated to biblical history (Louis XVI, Marie Antoinette)
   - EXCLUDE: Generic historical terms (French Revolution, World War)
10. Verify spellings for ancient names:
    - "Origen" not "Origin" (early church father)
    - "Tertius" not "Tertus" (mentioned in Romans 16:22)
    - "Pontius Pilate" not "Pilot" or "Pilat"
11. ALWAYS provide a description: Brief context for disambiguation (1-2 sentences explaining who/what this is)
12. Optionally provide variations - include any of these that apply:
    - Shortened names: "Ehrman" for "Bart Ehrman", "Wellhausen" for "Julius Wellhausen"
    - Alternative spellings: "Molech", "Moloch" for "Molek"
    - Adjective/derived forms: "Egyptian" from "Egypt", "Pauline" from "Paul"
    - Abbreviations: "LXX" for "Septuagint"
    - Alternative titles: "John the Revelator" for "John of Patmos"
    - Shortened titles for non-scripture works only when they are not Bible books
    - Different numbering: "1 Corinthians" and "1st Corinthians" for "First Corinthians"
    - Possessive forms: "Moses'", "Abraham's"
    - Plural/singular: "angels" for "angel"
13. Set caseSensitive: true for SHORT WORDS that match common English words:
    - "Lot" (biblical character) vs "lot" (as in "a lot of")
    - "Job" (biblical book/character) vs "job" (employment)
    - "Mark" (gospel) vs "mark" (a sign)
    - NOT needed for longer/unique names like "Moses", "Abraham", "Septuagint"
</extraction-rules>
${exclusionList}${categoryRestriction}

<example-input>
Transcript discussing the Septuagint translation, mentioning Moses 12 times,
Torah 8 times, LXX 3 times, and textual criticism 6 times.
</example-input>

<example-output>
{
  "tags": [
    {
      "tag": "Moses",
      "mentions": 12,
      "category": "character",
      "description": "Hebrew prophet who led the Israelites out of Egypt, central figure in the Torah and Pentateuch",
      "variations": ["Moshe", "Moses'", "Moses's"]
    },
    {
      "tag": "Torah",
      "mentions": 8,
      "category": "literature",
      "description": "The first five books of the Hebrew Bible, traditionally attributed to Moses"
    },
    {
      "tag": "Bart Ehrman",
      "mentions": 5,
      "category": "person",
      "description": "New Testament scholar and professor at UNC Chapel Hill, known for work on textual criticism and early Christianity",
      "variations": ["Ehrman"]
    },
    {
      "tag": "Lot",
      "mentions": 4,
      "category": "character",
      "description": "Abraham's nephew who escaped the destruction of Sodom, appears in Genesis",
      "variations": ["Lot's"],
      "caseSensitive": true
    }
  ]
}
</example-output>

Note: LXX was only mentioned 3 times (below threshold) so it's excluded.
Note: "variations" is optional - only include when there are common alternative names/spellings.
Note: Torah has no variations in this example because common variations like "Tora" weren't used in the transcript.

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
