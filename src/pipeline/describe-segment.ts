/**
 * Generate an instance-specific topic label and summary for a segment.
 */

import {
  SEGMENT_DESCRIPTIONS,
  SEGMENT_LABELS,
  type SegmentType,
} from "../config/segment-patterns.js";
import {
  type SegmentDescriptionContext,
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
} as const;

const SCRIPTURE_INTRO_CUE_PATTERN =
  /(we('re| are) (here )?in|we('re| are) looking at|let'?s look at|today('s)? (passage|text)|today we('re| are) (in|looking at)|the passage is|we('re| are) going to talk about|we('re| are) heading to|we finally made it to|we made it to)/i;

function extractForwardTranscriptLines(
  lines: TranscriptLine[],
  startIndex: number,
  count: number,
): TranscriptLine[] {
  return lines.slice(startIndex, Math.min(lines.length, startIndex + count));
}

export interface DescribeSegmentInput {
  episodeTitle: string;
  segmentType: SegmentType;
  startTimestamp: string;
  transcript: string;
}

export interface GatheredSegmentContext extends SegmentDescriptionContext {
  forwardScriptureCandidate?: string;
  fallbackScriptureCandidate?: string;
}

export interface SegmentPostProcessContext {
  primaryScriptureCandidate?: string;
  fallbackScriptureCandidate?: string;
}

export function gatherSegmentContext(
  input: DescribeSegmentInput,
): GatheredSegmentContext {
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
      const hasIntroCue = SCRIPTURE_INTRO_CUE_PATTERN.test(trimmed);
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
  const fallbackScriptureCandidate =
    forwardScriptureCandidate ?? scriptureCandidates[0];

  return {
    episodeTitle: input.episodeTitle,
    segmentType: input.segmentType,
    segmentLabel: SEGMENT_LABELS[input.segmentType],
    segmentDescription: SEGMENT_DESCRIPTIONS[input.segmentType],
    timestamp: input.startTimestamp,
    contextText,
    scriptureCandidates,
    primaryScriptureCandidate,
    forwardScriptureCandidate,
    fallbackScriptureCandidate,
  };
}

export function postProcessSegmentDescription(
  segmentType: SegmentType,
  result: SegmentDescriptionResult,
  gathered: SegmentPostProcessContext,
): SegmentDescriptionResult {
  if (segmentType === "chapter-and-verse") {
    const scriptureTopicLabel =
      gathered.primaryScriptureCandidate ?? gathered.fallbackScriptureCandidate;

    if (scriptureTopicLabel) {
      const normalizedTopicLabel =
        shortenScriptureReference(scriptureTopicLabel);
      const looksLikeScriptureReference =
        /^[1-3]?\s?[A-Za-z]+(?:\s+[A-Za-z]+)?\s+\d+(?::\d+(?:-\d+)?)?$/.test(
          result.topicLabel,
        );

      return {
        ...result,
        topicLabel: normalizedTopicLabel,
        summary: looksLikeScriptureReference
          ? result.summary.replaceAll(
              /\b(Psalm|Psalms|Genesis|Gen|Exodus|Exod|Joshua|Josh|Matthew|Matt|Mark|Luke|John|Acts|Romans|Rom|Corinthians|Cor|Timothy|Tim|Samuel|Sam|Kings|Chronicles|Chron)\s+\d+(?::\d+(?:-\d+)?)?/gi,
              normalizedTopicLabel,
            )
          : result.summary,
      };
    }
  }

  return {
    ...result,
    topicLabel: normalizeScriptureTopicLabel(result.topicLabel),
  };
}
