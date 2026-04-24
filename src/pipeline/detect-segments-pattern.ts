import {
  INTRO_END_PATTERNS,
  SEGMENT_PATTERNS,
  type SegmentType,
} from "../config/segment-patterns.js";
import type { Segment, TranscriptLine } from "./detect-segments-types.js";
import { parseTranscript } from "./parse-transcript.js";
import { secondsToTimestamp } from "./seconds-to-timestamp.js";
import { timestampToSeconds } from "./timestamp-to-seconds.js";

/**
 * Detection result for a single segment match.
 */
interface SegmentMatch {
  type: SegmentType;
  timestamp: string;
  lineNumber: number;
  matchedPattern: string;
}

/**
 * Find all segment matches in a transcript.
 */
function findSegmentMatches(lines: TranscriptLine[]): SegmentMatch[] {
  const matches: SegmentMatch[] = [];

  for (const line of lines) {
    // Check each segment type's patterns
    for (const [segmentType, patterns] of Object.entries(SEGMENT_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(line.text)) {
          matches.push({
            type: segmentType as SegmentType,
            timestamp: line.timestamp,
            lineNumber: line.lineNumber,
            matchedPattern: pattern.source,
          });
          // Only match first pattern for each line
          break;
        }
      }
    }
  }

  // Sort by timestamp
  return matches.toSorted(
    (a, b) => timestampToSeconds(a.timestamp) - timestampToSeconds(b.timestamp),
  );
}

/**
 * Find the intro end timestamp.
 * Intro runs from start until the podcast tagline/welcome message.
 */
function findIntroEnd(lines: TranscriptLine[]): string | undefined {
  for (const line of lines) {
    for (const pattern of INTRO_END_PATTERNS) {
      if (pattern.test(line.text)) {
        return line.timestamp;
      }
    }
  }
  return undefined;
}

/**
 * Detect segments in a transcript using pattern matching (legacy/fallback).
 *
 * @param transcript - Raw transcript text
 * @param durationSeconds - Optional episode duration in seconds (for accurate end timestamp)
 * @returns Array of detected segments
 */
export function detectSegments(
  transcript: string,
  durationSeconds?: number,
): Segment[] {
  const lines = parseTranscript(transcript);
  if (lines.length === 0) {
    return [];
  }

  const segments: Segment[] = [];
  const matches = findSegmentMatches(lines);

  // Get last timestamp - use actual duration if provided, otherwise fall back to last transcript line
  const lastLine = lines.at(-1)!;
  const episodeEndTimestamp = durationSeconds
    ? secondsToTimestamp(durationSeconds)
    : lastLine.timestamp;

  // Find intro end
  const introEnd = findIntroEnd(lines);

  // Always add intro segment (from 00:00:00 to intro end or first segment match)
  const firstMatch = matches[0];
  const introEndTime =
    introEnd ?? (firstMatch ? firstMatch.timestamp : episodeEndTimestamp);
  segments.push({
    type: "intro",
    startTimestamp: "[00:00:00.000]",
    endTimestamp: introEndTime,
    confidence: "auto",
    detectionMethod: "pattern",
    matchedPattern: "start-of-episode",
  });

  // Process segment matches
  for (let index = 0; index < matches.length; index++) {
    const match = matches[index];
    if (!match) continue;
    const nextMatch = matches[index + 1];

    // Determine end timestamp
    let endTimestamp: string | undefined; // Will be assigned if next match exists
    if (nextMatch) {
      endTimestamp = nextMatch.timestamp;
    }
    // Note: last segment's endTimestamp will be set below

    segments.push({
      type: match.type,
      startTimestamp: match.timestamp,
      endTimestamp,
      confidence: "auto",
      detectionMethod: "pattern",
      matchedPattern: match.matchedPattern,
    });
  }

  // Ensure the last segment ends at the episode's end
  if (segments.length > 0) {
    const lastSegment = segments.at(-1)!;
    if (!lastSegment.endTimestamp) {
      lastSegment.endTimestamp = episodeEndTimestamp;
    }
  }

  return segments;
}
