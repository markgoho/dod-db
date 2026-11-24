/**
 * Set the final Transcript's host labels back to the raw labels within a
 * time range (when the correction pass mislabelled turns the raw had right).
 *
 * Usage: bun run src/scripts/transcript-audit/restore-raw-labels.ts <episode-or-stem> <from> <to>
 */

import {
  finalPath,
  HOSTS,
  parseTurns,
  rawPath,
  readTurns,
  relabel,
  resolveStem,
} from "./transcripts.js";

const [target, from, to] = process.argv.slice(2);
if (!target || !from || !to)
  throw new Error("usage: restore-raw-labels.ts <episode-or-stem> <from> <to>");
const stem = await resolveStem(target);

const rawLabel = new Map(
  ((await readTurns(rawPath(stem))) ?? []).map(turn => [
    turn.timestamp,
    turn.speaker,
  ]),
);
const lines = (await Bun.file(finalPath(stem)).text()).split("\n");
let restored = 0;
for (const turn of parseTurns(lines.join("\n"))) {
  if (!HOSTS.has(turn.speaker) || turn.timestamp < from || turn.timestamp > to)
    continue;
  const label = rawLabel.get(turn.timestamp);
  if (!label || !HOSTS.has(label) || label === turn.speaker) continue;
  lines[turn.index] = relabel(lines[turn.index] ?? "", label);
  restored++;
}
await Bun.write(finalPath(stem), lines.join("\n"));
console.log(`restored ${restored}`);
