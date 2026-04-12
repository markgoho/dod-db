/**
 * LLM prompt for describing a specific segment instance.
 */

import type { SegmentType } from "../config/segment-patterns.js";
import type { SegmentDescriptionContext } from "./segment-description.js";

function getSegmentSpecificInstructions(segmentType: SegmentType): string {
  switch (segmentType) {
    case "chapter-and-verse": {
      return `- For Chapter and Verse, prefer the single most central scripture reference as the topic label when one is clearly central.
- Treat the provided primary scripture candidate as the definitive main passage when present. Use it as the topic label unless the transcript explicitly introduces a different main book and chapter.
- Next prefer a reference from the provided scripture candidates if it is explicitly introduced as the verse or passage the hosts are looking at.
- Give strong preference to references introduced with phrases like we're in, we're here in, we're looking at, let's look at, to be specific, this verse, or the NIV/NRSV rendering.
- Deprioritize references that are only examples, comparisons, side mentions, or supporting illustrations.
- If a scripture reference is used as the topic label, the summary should explain the interpretive issue or claim being discussed about that passage.`;
    }
    case "what-does-that-mean": {
      return `- For What Does That Mean?, prefer the key term or concept being defined as the topic label.
- The summary should explain what that term means or why it matters.`;
    }
    case "conspiracy-watch": {
      return `- For Conspiracy Watch, prefer a compact, recognizable shorthand for the conspiracy claim, symbol, or entity being debunked.
- Be creative when needed to fit within 1-2 words, as long as the result stays immediately recognizable.
- Avoid vague labels; prefer the most salient token people would recognize (for example, 666 instead of Mark).
- Do not repeat generic framing already implied by the segment name, such as conspiracy or conspiracies; prefer the underlying subject itself (for example, Eclipse instead of Eclipse conspiracies).`;
    }
    case "archaeology-of-israel": {
      return `- For Archaeology of Israel, prefer the most specific archaeological site, inscription, artifact, or excavation under discussion.
- Avoid generic labels like Archaeology or Israel when a more concrete place/object name is available.
- If multiple sites are discussed, choose the most central one rather than listing several.`;
    }
    case "watch-your-language": {
      return `- For Watch Your Language, prefer the word, phrase, or language issue under discussion as the topic label.`;
    }
    case "what-is-that": {
      return `- For What is That?, prefer the object, artifact, or item being explained as the topic label.`;
    }
    case "whos-that":
    case "who-dat": {
      return `- For character-profile segments, prefer the person or figure's name as the topic label.`;
    }
    default: {
      return `- Prefer the most concrete focal concept, term, text, figure, or artifact named in the transcript.`;
    }
  }
}

export function segmentDescriptionPrompt(
  context: SegmentDescriptionContext,
): string {
  return `You are describing a specific segment instance from the "Data Over Dogma" podcast.

<podcast-context>
The "Data Over Dogma" podcast is about biblical scholarship hosted by Dan McClellan and Dan Beecher.
Recurring segment types have generic names, but your task is to describe what this specific segment instance is actually about.
</podcast-context>

<segment>
Episode title: ${context.episodeTitle}
Segment type slug: ${context.segmentType}
Segment type label: ${context.segmentLabel}
Generic segment purpose: ${context.segmentDescription}
Segment timestamp: ${context.timestamp}
</segment>

<scripture-candidates>
${context.scriptureCandidates.length > 0 ? context.scriptureCandidates.join("\n") : "None found"}
</scripture-candidates>

<primary-scripture-candidate>
${context.primaryScriptureCandidate ?? "None identified"}
</primary-scripture-candidate>

<transcript-context>
${context.contextText}
</transcript-context>

<task>
Based on the transcript context, produce:
1. A topic label of 1-2 words for the specific topic being discussed in this segment.
2. A summary of 5-10 words describing what the segment discusses.

Requirements:
- Be specific to this segment instance, not the generic recurring segment type.
- Prefer concrete concepts or terms stated in the transcript.
- Do not use quotation marks.
- Do not repeat the generic segment label unless that is genuinely the topic.
- Keep the topic label to 1-2 words maximum.
- Keep the summary to 5-10 words maximum.

Segment-specific guidance:
${getSegmentSpecificInstructions(context.segmentType)}
</task>

<output-format>
Return JSON with:
- "topicLabel": string
- "summary": string
- "confidence": number from 0 to 100
- "reasoning": 1-2 sentence explanation
</output-format>`;
}
