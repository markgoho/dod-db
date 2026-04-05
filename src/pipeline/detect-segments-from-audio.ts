import { join } from "node:path";
import type { SegmentType } from "../config/segment-patterns.js";
import type { Segment } from "./detect-segments-types.js";
import { secondsToTimestamp } from "./seconds-to-timestamp.js";

/**
 * Detect segments using audio jingle matching.
 *
 * @param videoId - YouTube video ID
 * @param durationSeconds - Episode duration in seconds
 * @returns Array of detected segments with type='segment'
 */
export async function detectSegmentsFromAudio({
  videoId,
  audioPath,
  durationSeconds,
}: {
  videoId?: string;
  audioPath?: string;
  durationSeconds?: number;
}): Promise<Segment[]> {
  const audioDir = join(process.cwd(), "data", "audio");
  const jinglePath = join(process.cwd(), "data", "jingles", "jingle-pure.wav");

  let resolvedAudioPath = audioPath ?? "";

  if (!resolvedAudioPath && videoId) {
    const extensions = [".m4a", ".webm", ".mp3", ".wav"];

    for (const extension of extensions) {
      const path = join(audioDir, `${videoId}${extension}`);
      const file = Bun.file(path);
      if (await file.exists()) {
        resolvedAudioPath = path;
        break;
      }
    }
  }

  if (!resolvedAudioPath) {
    console.log("Audio file not found, skipping audio detection");
    return [];
  }

  // Check if jingle exists
  const jingleFile = Bun.file(jinglePath);
  if (!(await jingleFile.exists())) {
    console.log("Jingle file not found, skipping audio detection");
    return [];
  }

  // Run Python script to find jingles
  const proc = Bun.spawn(
    [
      "uv",
      "run",
      join(process.cwd(), "scripts", "find_jingles_uv.py"),
      jinglePath,
      resolvedAudioPath,
    ],
    {
      stdout: "pipe",
      stderr: "ignore", // Suppress progress output
    },
  );

  const stdout = await new Response(proc.stdout).text();
  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    console.log("Audio detection failed, skipping");
    return [];
  }

  // Parse results
  interface JingleMatch {
    timestamp: number;
    confidence: number;
  }

  const matches = JSON.parse(stdout) as JingleMatch[];

  // Filter for >80% confidence and sort by timestamp
  const highConfidenceMatches = matches
    .filter(match => match.confidence >= 80)
    .sort((a, b) => a.timestamp - b.timestamp);

  const segments: Segment[] = [];

  // Add intro segment from start to first jingle
  const firstMatch = highConfidenceMatches[0];
  if (firstMatch) {
    segments.push({
      type: "intro",
      startTimestamp: "[00:00:00.000]",
      endTimestamp: secondsToTimestamp(firstMatch.timestamp),
      confidence: "auto",
      detectionMethod: "audio",
      matchedPattern: "start-of-episode",
    });
  }

  // Convert jingle matches to Segment format
  for (const [index, match] of highConfidenceMatches.entries()) {
    const nextMatch = highConfidenceMatches[index + 1];
    const startTimestamp = secondsToTimestamp(match.timestamp);
    let endTimestamp: string | undefined; // Will be assigned if next match or duration exists
    if (nextMatch) {
      endTimestamp = secondsToTimestamp(nextMatch.timestamp);
    } else if (durationSeconds) {
      endTimestamp = secondsToTimestamp(durationSeconds);
    }

    segments.push({
      type: "segment" as SegmentType,
      startTimestamp,
      endTimestamp,
      confidence: "auto" as const,
      detectionMethod: "audio" as const,
      matchedPattern: `audio-jingle-${match.confidence.toFixed(1)}%`,
    });
  }

  return segments;
}
