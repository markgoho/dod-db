/**
 * LLM prompt and schema for tag discovery.
 * Used to identify the subjects an episode actually discusses that aren't in
 * the accepted vocabulary yet. Mention counts are computed in code, not here.
 */

import { z } from "zod";

/**
 * Zod schema for structured tag discovery output from LLM.
 */
export const TagDiscoverySchema = z.object({
  tags: z.array(
    z.object({
      tag: z.string(),
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
      reason: z.string(), // Which segment focuses on it and why it will recur (1 sentence)
      variations: z.array(z.string()).optional(), // Alternative names, spellings, or abbreviations
      caseSensitive: z.boolean().optional(), // True for short words that match common English (Lot, Job, Mark)
    }),
  ),
});

export type TagDiscovery = z.infer<typeof TagDiscoverySchema>;

export type TagDiscoveryVocabulary = {
  accepted: string[];
  proposed: string[];
  rejected: string[];
};

function listSection(tag: string, intro: string, terms: string[]): string {
  if (terms.length === 0) return "";
  return `\n\n<${tag}>\n${intro}\n${terms.map(t => `- ${t}`).join("\n")}\n</${tag}>`;
}

/**
 * Generate prompt for LLM tag discovery.
 *
 * @param transcript - The corrected transcript to analyze
 * @param vocabulary - Canonical names grouped by review status
 * @param allowedCategories - If provided, only extract tags in these categories
 * @returns Formatted prompt string for LLM
 */
export function tagExtractionPrompt(
  transcript: string,
  vocabulary: TagDiscoveryVocabulary,
  allowedCategories?: string[],
): string {
  const categoryRestriction = allowedCategories
    ? `\n\n<category-restriction>\nONLY return tags in these categories: ${allowedCategories.join(", ")}\n</category-restriction>`
    : "";

  return `You are an expert in biblical scholarship. You maintain the topic index for a podcast archive. Find the subjects this episode discusses that the index does not cover yet.

<podcast-context>
This is "Data Over Dogma", a biblical scholarship podcast with hosts Dan McClellan and Dan Beecher.
Each tag gets a topic page. A listener who is interested in what the show says about a thing opens that thing's page to find the other episodes that talk about it.
</podcast-context>

<what-makes-a-good-tag>
A tag names a thing that a segment or episode is ABOUT, and that the archive will keep coming back to.

Apply both tests to every candidate. Return it only if it passes both.
1. Focus test: Is this thing the focus of a segment or of the episode? Would a listener who wants to hear what the show says about it be glad to find THIS episode on its page?
   - FAIL: evidence, examples, or definitions the hosts use on the way to a different point. A Hebrew term cited to rebut a claim, a divine name cited as one sign of Pentateuch sources, a word defined in an aside, or an apologetic move dismissed in a tangent fails, even when it gets a minute of explanation.
   - PASS: the thing the segment sets out to discuss. A segment about the Letter of Aristeas, the Baal Cycle, or haplography passes.
2. Archive test: Will this thing plausibly be the focus of other episodes too, so that its page collects several episodes? Named things (people, texts, manuscripts, places, artifacts, events, groups) pass more often than technical terms. A specific named thing can pass even when a related tag exists (Asherah Pole alongside Asherah, Baal Cycle alongside Baal); only synonyms of existing tags fail.

Mention counts do not matter. A thing named once can pass. A thing repeated in an ad read or a running joke fails.

Most episodes introduce 0-2 new tags. Returning an empty list is normal when the already-indexed tags cover what the episode is about.
</what-makes-a-good-tag>

<ignore-these-parts-of-the-transcript>
- The cold open, the show intro, and the sign-off
- Patreon, patron, membership, sponsor, merch, and "support the show" pitches
- Promotion of the hosts' books, videos, social media, or other shows
- Banter about the hosts' personal lives, pop culture, or media that is not the subject of analysis
</ignore-these-parts-of-the-transcript>

<never-tag>
- The podcast itself, its hosts, its segments, its patrons, or its audience
- Modern commentators, pastors, pundits, influencers, politicians, and modern scholars. The archive tracks guests separately, and critiques of modern figures are indexed by the idea under discussion, not by the person. Ancient and historical figures (Origen, Erasmus, Tyndale) ARE valid.
- Generic words: "Bible", "scripture", "God", "text", "book", "king", "therapist", "ritual", "good news"
- Bible book names and chapter/verse references (handled separately)
- Modern places, events, and people unrelated to biblical or religious history
</never-tag>

<categories>
- character: Biblical/mythological individuals (Moses, Paul, Lilith, Baal)
- person: Historical individuals who verifiably lived (Athanasius, Cyrus the Great, Desiderius Erasmus)
- people: Collective ethnic or national groups (Israelites, Philistines, Moabites)
- place: Geographic locations (Jerusalem, Babylon, Ugarit)
- literature: Texts, manuscripts, and translations (1 Enoch, Codex Sinaiticus, Latin Vulgate)
- theology: Religious concepts and doctrines (divine council, atonement, headship)
- scholarship: Academic methods and scholarly concepts (textual criticism, source criticism, interpolation)
- religion: Traditions and denominations (Judaism, Zoroastrianism)
- event: Historical events, councils, wars (Council of Nicaea, Babylonian Exile)
- miscellaneous: Only when nothing else fits
</categories>

<formatting>
- Use the canonical form with proper capitalization: "Septuagint" not "LXX", "John the Baptist" not "john the baptist".
- Correct transcription errors in ancient names: "Origen" not "Origin", "Pontius Pilate" not "Pilot".
- description: 1-2 sentences saying what the term is in general, for disambiguation. Do not describe how this episode uses it (that goes in reason).
- reason: 1 sentence naming the segment that focuses on it and why other episodes will return to it.
- variations: every form that appears in the transcript, plus common alternative names, spellings, abbreviations, and derived forms. The canonical name or a variation MUST appear verbatim in the transcript, because future episodes are matched by exact text. Matching ignores case, so do not repeat the canonical name in another case. Every variation must refer ONLY to this subject: never include ordinary English words or inflections that also have everyday meanings (for "Accommodationism", "accommodates" is wrong).
- caseSensitive: true only for short names that are also common English words ("Lot", "Job", "Mark").
</formatting>${listSection(
    "already-indexed",
    "These terms are already in the index. Do NOT return them or their synonyms.",
    vocabulary.accepted,
  )}${listSection(
    "pending-review",
    "These terms were proposed from earlier episodes and are waiting for review. If one is a subject of THIS episode, return it with its exact canonical name so the reviewer sees that it recurs. Otherwise ignore it.",
    vocabulary.proposed,
  )}${listSection(
    "rejected-by-reviewer",
    "A reviewer rejected these exact terms. Do NOT return them.",
    vocabulary.rejected,
  )}${categoryRestriction}

<example-output>
{
  "tags": [
    {
      "tag": "Hesed",
      "category": "theology",
      "description": "Hebrew term for covenant loyalty or steadfast love, often translated 'lovingkindness'.",
      "reason": "The whole segment is about what hesed means, and it is a core term the show returns to in covenant discussions.",
      "variations": ["chesed", "lovingkindness"]
    },
    {
      "tag": "Codex Sinaiticus",
      "category": "literature",
      "description": "Fourth-century Greek manuscript containing the earliest complete New Testament.",
      "reason": "The segment is about this manuscript and its history, and the show cites it in many textual criticism discussions.",
      "variations": ["Sinaiticus"]
    }
  ]
}
</example-output>

Transcript to analyze:
---
${transcript}
---`;
}
