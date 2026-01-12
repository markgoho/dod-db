/**
 * Segment detection using deterministic pattern matching.
 * Detects recurring podcast segments by matching verbal markers in transcripts.
 */

import { join } from 'node:path';
import {
  SEGMENT_PATTERNS,
  INTRO_END_PATTERNS,
  type SegmentType,
} from '../config/segment-patterns.js';

/**
 * Get audio duration in seconds using ffprobe.
 * Returns null if the file doesn't exist or ffprobe fails.
 */
export async function getAudioDuration(videoId: string): Promise<number | null> {
  const audioDir = join(process.cwd(), 'data', 'audio');

  // Try common audio extensions
  const extensions = ['.m4a', '.webm', '.mp3', '.wav'];

  for (const ext of extensions) {
    const audioPath = join(audioDir, `${videoId}${ext}`);
    const file = Bun.file(audioPath);

    if (await file.exists()) {
      try {
        const proc = Bun.spawn([
          'ffprobe',
          '-v',
          'quiet',
          '-show_entries',
          'format=duration',
          '-of',
          'csv=p=0',
          audioPath,
        ]);

        const output = await new Response(proc.stdout).text();
        const duration = Number.parseFloat(output.trim());

        if (!Number.isNaN(duration)) {
          return duration;
        }
      } catch {
        // ffprobe failed, try next extension
      }
    }
  }

  return null;
}

/**
 * A detected segment in an episode.
 */
export interface Segment {
  type: SegmentType;
  startTimestamp: string; // "[HH:MM:SS.mmm]" format
  endTimestamp: string | null; // null if segment extends to end of episode
  confidence: 'auto' | 'verified';
  detectionMethod: 'pattern' | 'llm' | 'manual';
  matchedPattern?: string; // The pattern that triggered detection (for debugging)
}

/**
 * A line from the transcript with parsed timestamp.
 */
interface TranscriptLine {
  timestamp: string; // Original format: "[HH:MM:SS.mmm]"
  speaker: string;
  text: string;
  lineNumber: number;
}

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
 * Parse a transcript into structured lines.
 */
function parseTranscript(transcript: string): TranscriptLine[] {
  const lines = transcript.split('\n');
  const parsed: TranscriptLine[] = [];

  // Pattern: [HH:MM:SS] or [HH:MM:SS.mmm] Speaker Name: text
  // Milliseconds are optional
  const linePattern = /^\s*\[(\d{2}:\d{2}:\d{2}(?:\.\d{3})?)\]\s*([^:]+):\s*(.*)$/;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine) continue;
    const line = rawLine.trim();
    if (!line) continue;

    const match = linePattern.exec(line);
    if (match && match[1] && match[2] && match[3]) {
      // Normalize timestamp to always include milliseconds
      let timestamp = match[1];
      if (!timestamp.includes('.')) {
        timestamp += '.000';
      }
      parsed.push({
        timestamp: `[${timestamp}]`,
        speaker: match[2].trim(),
        text: match[3].trim(),
        lineNumber: i + 1,
      });
    }
  }

  return parsed;
}

/**
 * Convert timestamp string to seconds for comparison.
 */
function timestampToSeconds(timestamp: string): number {
  // Remove brackets: "[00:01:23.456]" -> "00:01:23.456"
  const clean = timestamp.replace(/[[\]]/g, '');
  const parts = clean.split(':');
  const hours = Number.parseInt(parts[0] ?? '0', 10);
  const minutes = Number.parseInt(parts[1] ?? '0', 10);
  const seconds = Number.parseFloat(parts[2] ?? '0');
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Convert seconds to timestamp string format.
 */
export function secondsToTimestamp(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const ms = Math.floor((seconds % 1) * 1000);
  const wholeSeconds = Math.floor(seconds);

  return `[${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${wholeSeconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}]`;
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
  return matches.sort(
    (a, b) => timestampToSeconds(a.timestamp) - timestampToSeconds(b.timestamp),
  );
}

/**
 * Find the intro end timestamp.
 * Intro runs from start until the podcast tagline/welcome message.
 */
function findIntroEnd(lines: TranscriptLine[]): string | null {
  for (const line of lines) {
    for (const pattern of INTRO_END_PATTERNS) {
      if (pattern.test(line.text)) {
        return line.timestamp;
      }
    }
  }
  return null;
}

/**
 * Detect segments in a transcript.
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
  const lastLine = lines[lines.length - 1]!;
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
    type: 'intro',
    startTimestamp: '[00:00:00.000]',
    endTimestamp: introEndTime,
    confidence: 'auto',
    detectionMethod: 'pattern',
    matchedPattern: 'start-of-episode',
  });

  // Process segment matches
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    if (!match) continue;
    const nextMatch = matches[i + 1];

    // Determine end timestamp
    let endTimestamp: string | null = null;
    if (nextMatch) {
      endTimestamp = nextMatch.timestamp;
    }
    // Note: last segment's endTimestamp will be set below

    segments.push({
      type: match.type,
      startTimestamp: match.timestamp,
      endTimestamp,
      confidence: 'auto',
      detectionMethod: 'pattern',
      matchedPattern: match.matchedPattern,
    });
  }

  // Ensure the last segment ends at the episode's end
  if (segments.length > 0) {
    const lastSegment = segments[segments.length - 1]!;
    if (!lastSegment.endTimestamp) {
      lastSegment.endTimestamp = episodeEndTimestamp;
    }
  }

  return segments;
}

/**
 * Get detection statistics for a set of segments.
 */
export function getSegmentStats(segments: Segment[]): {
  total: number;
  byType: Record<SegmentType, number>;
  autoDetected: number;
  verified: number;
} {
  const byType: Record<string, number> = {};
  let autoDetected = 0;
  let verified = 0;

  for (const segment of segments) {
    byType[segment.type] = (byType[segment.type] || 0) + 1;
    if (segment.confidence === 'auto') {
      autoDetected++;
    } else {
      verified++;
    }
  }

  return {
    total: segments.length,
    byType: byType as Record<SegmentType, number>,
    autoDetected,
    verified,
  };
}

/**
 * Format timestamp for display (remove milliseconds).
 */
export function formatTimestamp(timestamp: string): string {
  // "[00:01:23.456]" -> "00:01:23"
  return timestamp.replace(/\.\d{3}/, '').replace(/[[\]]/g, '');
}
