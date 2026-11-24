/**
 * Print final Transcript lines in a time range, marking each turn whose raw
 * label differs. For reading Speaker cues before changing labels.
 *
 * Usage: bun run src/scripts/transcript-audit/context.ts <episode-or-stem> <from> [to] [--width=N]
 *
 * `to` defaults to two minutes after `from`. Timestamps are prefixes, so
 * "00:16" and "00:16:12.560" both work.
 */

import { finalPath, rawPath, readTurns, resolveStem } from "./transcripts.js";

const args = process.argv.slice(2).filter(arg => !arg.startsWith("--"));
const width = Number(
  process.argv.find(arg => arg.startsWith("--width="))?.split("=")[1] ?? 240,
);
const [target, from, toArg] = args;
if (!target || !from)
  throw new Error(
    "usage: context.ts <episode-or-stem> <from> [to] [--width=N]",
  );
const stem = await resolveStem(target);

const pad = (n: number) => String(n).padStart(2, "0");

function plusTwoMinutes(timestamp: string): string {
  const [h = 0, m = 0, s = 0] = timestamp.split(":").map(Number);
  const total = h * 3600 + m * 60 + Math.floor(s) + 120;
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor(total / 60) % 60)}:${pad(total % 60)}`;
}
const to = toArg ?? plusTwoMinutes(from);

const rawLabel = new Map(
  ((await readTurns(rawPath(stem))) ?? []).map(turn => [
    turn.timestamp,
    turn.speaker,
  ]),
);
console.log(finalPath(stem));
for (const turn of (await readTurns(finalPath(stem))) ?? []) {
  if (turn.timestamp < from || turn.timestamp.slice(0, to.length) > to)
    continue;
  const raw = rawLabel.get(turn.timestamp);
  const mark =
    raw === undefined
      ? "raw? "
      : raw === turn.speaker
        ? "     "
        : `raw=${raw.split(" ").at(-1)} `;
  console.log(
    `${mark}[${turn.timestamp}] ${turn.speaker}: ${turn.text.slice(0, width)}`,
  );
}
