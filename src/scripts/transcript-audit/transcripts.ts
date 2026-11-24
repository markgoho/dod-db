/**
 * Shared helpers for the Speaker-label audit scripts in this folder (built
 * for #127 and #130). Each script's usage is at its top.
 */

import { Glob } from "bun";
import path from "node:path";

export const repoRoot = path.resolve(import.meta.dir, "../../..");
export const transcriptDir = path.join(repoRoot, "data/transcripts");

export const BEECHER = "Dan Beecher";
export const MCCLELLAN = "Dan McClellan";
export const HOSTS = new Set([BEECHER, MCCLELLAN]);

export function otherHost(speaker: string): string {
  return speaker === BEECHER ? MCCLELLAN : BEECHER;
}

export interface Turn {
  /** Index of the line in the file, for rewriting it. */
  index: number;
  timestamp: string;
  speaker: string;
  text: string;
}

/** Older Transcripts have no milliseconds, and some lines are indented. */
const LINE = /^\s*\[(\d{2}:\d{2}:\d{2}(?:\.\d{3})?)\] ([^:]+): (.*)$/;

export function parseTurns(text: string): Turn[] {
  const turns: Turn[] = [];
  for (const [index, line] of text.split("\n").entries()) {
    const match = LINE.exec(line);
    if (match?.[1] && match[2] && match[3] !== undefined) {
      turns.push({
        index,
        timestamp: match[1],
        speaker: match[2],
        text: match[3],
      });
    }
  }
  return turns;
}

/** Relabel one host line, keeping its indentation, timestamp and text. */
export function relabel(line: string, speaker: string): string {
  return line.replace(
    /^(\s*\[[^\]]+\] )(Dan Beecher|Dan McClellan): /,
    `$1${speaker}: `,
  );
}

export function minuteOf(timestamp: string): number {
  const [hours = 0, minutes = 0] = timestamp.split(":").map(Number);
  return hours * 60 + minutes;
}

export function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/** Final Transcript stems (file names without `.txt`), sorted. */
export async function finalStems(): Promise<string[]> {
  const files = await Array.fromAsync(new Glob("*.txt").scan(transcriptDir));
  return files
    .filter(file => !file.endsWith("-raw.txt"))
    .map(file => file.slice(0, -".txt".length))
    .toSorted();
}

export function finalPath(stem: string): string {
  return path.join(transcriptDir, `${stem}.txt`);
}

export function rawPath(stem: string): string {
  return path.join(transcriptDir, `${stem}-raw.txt`);
}

/** Resolve an Episode number or a Transcript stem to a stem. */
export async function resolveStem(episodeOrStem: string): Promise<string> {
  if (!/^\d+$/.test(episodeOrStem)) return episodeOrStem;
  const videos = (await Bun.file(
    path.join(repoRoot, "data/processed-videos.json"),
  ).json()) as {
    episodeNumber?: number;
    transcriptPath?: string;
  }[];
  const video = videos.find(v => v.episodeNumber === Number(episodeOrStem));
  if (!video?.transcriptPath)
    throw new Error(`Episode ${episodeOrStem} has no Transcript`);
  return path.basename(video.transcriptPath, ".txt");
}

export async function readTurns(filePath: string): Promise<Turn[] | undefined> {
  const file = Bun.file(filePath);
  return (await file.exists()) ? parseTurns(await file.text()) : undefined;
}
