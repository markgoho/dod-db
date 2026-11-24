/**
 * Fix an Episode whose speaker ID inverted the two hosts (as in #127).
 *
 * Usage: bun run src/scripts/transcript-audit/fix-inverted-episode.ts <episode-or-stem>
 *
 * Flips every host turn in the raw Transcript. In the final, flips each
 * host turn whose label still matches the old raw label, and keeps the ones
 * the correction pass had already flipped back. Regenerate the Episode
 * Page afterwards.
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

const target = process.argv[2];
if (!target)
  throw new Error("usage: fix-inverted-episode.ts <episode-or-stem>");
const stem = await resolveStem(target);

const rawLines = (await Bun.file(rawPath(stem)).text()).split("\n");
const oldRaw = new Map<string, string>();
for (const turn of parseTurns(rawLines.join("\n"))) {
  if (!HOSTS.has(turn.speaker)) continue;
  oldRaw.set(turn.timestamp, turn.speaker);
  rawLines[turn.index] = relabel(
    rawLines[turn.index] ?? "",
    otherHost(turn.speaker),
  );
}

const finalLines = (await Bun.file(finalPath(stem)).text()).split("\n");
let flipped = 0;
let kept = 0;
const unmatched: string[] = [];
for (const turn of parseTurns(finalLines.join("\n"))) {
  if (!HOSTS.has(turn.speaker)) continue;
  const label = oldRaw.get(turn.timestamp);
  if (!label) {
    unmatched.push(turn.timestamp);
  } else if (label === turn.speaker) {
    finalLines[turn.index] = relabel(
      finalLines[turn.index] ?? "",
      otherHost(turn.speaker),
    );
    flipped++;
  } else {
    kept++;
  }
}

await Bun.write(rawPath(stem), rawLines.join("\n"));
await Bun.write(finalPath(stem), finalLines.join("\n"));
console.log({
  stem,
  rawFlipped: oldRaw.size,
  finalFlipped: flipped,
  finalKept: kept,
  unmatched,
});
