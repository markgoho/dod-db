/**
 * Generate an instance-specific topic label and summary for a segment.
 */

import { z } from "zod";
import { ai } from "../ai.js";
import { speakerIdModel } from "../config/models.js";
import {
  SEGMENT_DESCRIPTIONS,
  SEGMENT_LABELS,
  type SegmentType,
} from "../config/segment-patterns.js";
import { segmentDescriptionPrompt } from "../prompts/segment-description-prompt.js";
import {
  SegmentDescriptionSchema,
  type SegmentDescriptionResult,
} from "../prompts/segment-description.js";
import type { TranscriptLine } from "./detect-segments-types.js";
import { timestampToSeconds } from "./detect-segments.js";
import {
  extractPrimaryScriptureCandidate,
  extractPrimaryScriptureCandidateFromLines,
  extractScriptureCandidates,
  normalizeScriptureTopicLabel,
  shortenScriptureReference,
} from "./extract-scripture-candidates.js";
import {
  parseExplicitScriptureReference,
  parseSpokenScriptureReference,
} from "./parse-spoken-scripture-reference.js";
import {
  extractTranscriptLinesAround,
  findClosestTranscriptLineIndex,
  findNearestTranscriptLineIndex,
  formatTranscriptContext,
  parseTranscript,
} from "./parse-transcript.js";

const DESCRIPTION_CONTEXT_CONFIG = {
  linesBefore: 10,
  linesAfter: 40,
  timestampTolerance: 5,
};

function extractForwardTranscriptLines(
  lines: TranscriptLine[],
  startIndex: number,
  count: number,
): TranscriptLine[] {
  return lines.slice(startIndex, Math.min(lines.length, startIndex + count));
}

interface DescribeSegmentInput {
  episodeTitle: string;
  segmentType: SegmentType;
  startTimestamp: string;
  transcript: string;
}

export async function describeSegment(
  input: DescribeSegmentInput,
): Promise<SegmentDescriptionResult> {
  const transcriptLines = parseTranscript(input.transcript);
  const targetSeconds = timestampToSeconds(input.startTimestamp);
  const closestIndex = findClosestTranscriptLineIndex(
    transcriptLines,
    targetSeconds,
    DESCRIPTION_CONTEXT_CONFIG.timestampTolerance,
  );
  const targetIndex =
    closestIndex === -1
      ? findNearestTranscriptLineIndex(transcriptLines, targetSeconds)
      : closestIndex;

  if (targetIndex === -1) {
    throw new Error(
      `Could not find transcript context near ${input.startTimestamp}`,
    );
  }

  const contextLines = extractTranscriptLinesAround(
    transcriptLines,
    targetIndex,
    DESCRIPTION_CONTEXT_CONFIG.linesBefore,
    DESCRIPTION_CONTEXT_CONFIG.linesAfter,
  );
  const contextText = formatTranscriptContext(contextLines.all);
  const scriptureCandidates = extractScriptureCandidates(contextText);
  const forwardContextLines = extractForwardTranscriptLines(
    transcriptLines,
    targetIndex,
    DESCRIPTION_CONTEXT_CONFIG.linesAfter,
  );
  const forwardContextText = formatTranscriptContext(forwardContextLines);
  const forwardScriptureCandidate =
    extractScriptureCandidates(forwardContextText)[0];
  const spokenScriptureCandidate = contextLines.all
    .map(line => parseSpokenScriptureReference(line.text))
    .find(candidate => candidate !== undefined);
  const explicitScriptureCandidate = contextLines.all
    .map((line, index) => {
      const trimmed = line.text.trim();
      const hasIntroCue =
        /(we('re| are) (here )?in|we('re| are) looking at|let'?s look at|today('s)? (passage|text)|today we('re| are) (in|looking at)|the passage is|we('re| are) going to talk about|we('re| are) heading to|we finally made it to|we made it to)/i.test(
          trimmed,
        );
      if (!hasIntroCue) {
        return;
      }

      const explicitReference = parseExplicitScriptureReference(trimmed);
      if (explicitReference) {
        return explicitReference;
      }

      const nextLineText = contextLines.all[index + 1]?.text;
      return nextLineText
        ? parseExplicitScriptureReference(`${trimmed} ${nextLineText}`)
        : undefined;
    })
    .find(candidate => candidate !== undefined);
  const primaryScriptureCandidate =
    explicitScriptureCandidate ??
    spokenScriptureCandidate ??
    extractPrimaryScriptureCandidateFromLines(contextLines.all) ??
    extractPrimaryScriptureCandidate(contextText);

  const prompt = segmentDescriptionPrompt({
    episodeTitle: input.episodeTitle,
    segmentType: input.segmentType,
    segmentLabel: SEGMENT_LABELS[input.segmentType],
    segmentDescription: SEGMENT_DESCRIPTIONS[input.segmentType],
    timestamp: input.startTimestamp,
    contextText,
    scriptureCandidates,
    primaryScriptureCandidate,
  });

  const response = await ai.models.generateContent({
    model: speakerIdModel,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: z.toJSONSchema(SegmentDescriptionSchema),
    },
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error("LLM returned empty response for segment description");
  }

  const parsed = SegmentDescriptionSchema.parse(JSON.parse(responseText));

  if (input.segmentType === "chapter-and-verse") {
    const fallbackScriptureCandidate =
      forwardScriptureCandidate ?? scriptureCandidates[0];
    const scriptureTopicLabel =
      primaryScriptureCandidate ?? fallbackScriptureCandidate;

    if (scriptureTopicLabel) {
      const normalizedTopicLabel =
        shortenScriptureReference(scriptureTopicLabel);
      const looksLikeScriptureReference =
        /^[1-3]?\s?[A-Za-z]+(?:\s+[A-Za-z]+)?\s+\d+(?::\d+(?:-\d+)?)?$/.test(
          parsed.description.topicLabel,
        );

      return {
        ...parsed.description,
        topicLabel: normalizedTopicLabel,
        summary: looksLikeScriptureReference
          ? parsed.description.summary.replaceAll(
              /\b(Psalm|Psalms|Genesis|Gen|Exodus|Exod|Joshua|Josh|Matthew|Matt|Mark|Luke|John|Acts|Romans|Rom|Corinthians|Cor|Timothy|Tim|Samuel|Sam|Kings|Chronicles|Chron)\s+\d+(?::\d+(?:-\d+)?)?/gi,
              normalizedTopicLabel,
            )
          : parsed.description.summary,
      };
    }
  }

  return {
    ...parsed.description,
    topicLabel: normalizeScriptureTopicLabel(parsed.description.topicLabel),
  };
}
