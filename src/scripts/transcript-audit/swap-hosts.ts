/**
 * Swap the two hosts' labels on every turn in one or more time ranges, in
 * both the raw and final Transcript (a local diarization swap, as in #130).
 *
 * Usage: bun run src/scripts/transcript-audit/swap-hosts.ts <episode-or-stem> <from> <to> [<from> <to> ...]
 *
 * Timestamps are inclusive and compared as strings (HH:MM:SS.mmm). Read
 * the range with context.ts first; regenerate the Episode Page afterwards.
 */

import {
  finalPath,
  HOSTS,
  otherHost,
  parseTurns,
  rawPath,
  relabel,
  resolveStem,
} from "./transcripts.js";

const [target, ...bounds] = process.argv.slice(2);
if (!target || bounds.length === 0 || bounds.length % 2 !== 0) {
  throw new Error(
    "usage: swap-hosts.ts <episode-or-stem> <from> <to> [<from> <to> ...]",
  );
}
const stem = await resolveStem(target);
const ranges: [string, string][] = [];
for (let i = 0; i < bounds.length; i += 2)
  ranges.push([bounds[i] ?? "", bounds[i + 1] ?? ""]);

for (const filePath of [rawPath(stem), finalPath(stem)]) {
  const lines = (await Bun.file(filePath).text()).split("\n");
  let swapped = 0;
  for (const turn of parseTurns(lines.join("\n"))) {
    if (!HOSTS.has(turn.speaker)) continue;
    if (
      !ranges.some(
        ([from, to]) => turn.timestamp >= from && turn.timestamp <= to,
      )
    )
      continue;
    lines[turn.index] = relabel(
      lines[turn.index] ?? "",
      otherHost(turn.speaker),
    );
    swapped++;
  }
  await Bun.write(filePath, lines.join("\n"));
  console.log(`${filePath}: swapped ${swapped}`);
}
