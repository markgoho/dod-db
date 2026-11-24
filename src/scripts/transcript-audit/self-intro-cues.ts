/**
 * Check host labels against turns that name their own speaker.
 *
 * Usage: bun run src/scripts/transcript-audit/self-intro-cues.ts [--raw] [--all]
 *
 * "I'm Dan McClellan" / "I'm Dan Beecher" intros, and Beecher's outro lines
 * (the network credit and the editing thanks), say who is talking. Prints
 * each Transcript where a cue's label disagrees or no cue is found, or
 * (with --all) every one.
 */

import {
  BEECHER,
  finalPath,
  finalStems,
  HOSTS,
  MCCLELLAN,
  rawPath,
  readTurns,
} from "./transcripts.js";

const useRaw = process.argv.includes("--raw");
const all = process.argv.includes("--all");

const outroCues: [RegExp, string][] = [
  [
    /Data Over Dogma is a member of the Airwave|production of Data Over Dogma Media/i,
    BEECHER,
  ],
  [/Thanks so much to Roger Gowdy|thanks to .* for editing/i, BEECHER],
];

function cueSpeaker(text: string): string | undefined {
  const mcclellan = text.search(/\b(I'?m|I am|this is) Dan McClellan\b/i);
  const beecher = text.search(/\b(I'?m|I am|this is) Dan Beecher\b/i);
  // "I'm Dan Beecher, and with me is ... this is Dan McClellan": the first
  // self-intro is the speaker's own.
  if (mcclellan >= 0 && (beecher < 0 || mcclellan < beecher)) return MCCLELLAN;
  if (beecher >= 0) return BEECHER;
  return outroCues.find(([cue]) => cue.test(text))?.[1];
}

for (const stem of await finalStems()) {
  const turns = await readTurns(useRaw ? rawPath(stem) : finalPath(stem));
  if (!turns) continue;
  let agree = 0;
  const disagree: string[] = [];
  for (const turn of turns) {
    if (!HOSTS.has(turn.speaker)) continue;
    const expected = cueSpeaker(turn.text);
    if (!expected) continue;
    if (expected === turn.speaker) agree++;
    else
      disagree.push(
        `${turn.timestamp} labelled ${turn.speaker}, cue says ${expected}`,
      );
  }
  if (all || disagree.length > 0 || agree === 0) {
    console.log(
      `${stem}: ${agree} agree, ${disagree.length} disagree ${disagree.slice(0, 4).join("; ")}`,
    );
  }
}
