/**
 * Flag final Transcripts whose host labels look swapped.
 *
 * Usage: bun run src/scripts/transcript-audit/speaker-audit.ts [--all]
 *
 * Per Transcript: Beecher's share of host words (McClellan usually talks
 * more, so a high share suggests an inversion), how many host turns the
 * final labels differently from raw and the longest such run, and the
 * 10-minute windows where Beecher's share is above 0.6. Intros, outros,
 * Beecher's story readings and guest Episodes without McClellan also land
 * in that list, so read the flagged windows before changing anything.
 */

import {
  BEECHER,
  finalPath,
  finalStems,
  HOSTS,
  MCCLELLAN,
  minuteOf,
  rawPath,
  readTurns,
  wordCount,
} from "./transcripts.js";

const all = process.argv.includes("--all");

for (const stem of await finalStems()) {
  const final = (await readTurns(finalPath(stem))) ?? [];
  const raw = await readTurns(rawPath(stem));
  let beecher = 0;
  let mcclellan = 0;
  const windows = new Map<number, [number, number]>();
  for (const turn of final) {
    const words = wordCount(turn.text);
    const window = Math.floor(minuteOf(turn.timestamp) / 10) * 10;
    const counts = windows.get(window) ?? [0, 0];
    if (turn.speaker === BEECHER) {
      beecher += words;
      counts[0] += words;
    }
    if (turn.speaker === MCCLELLAN) {
      mcclellan += words;
      counts[1] += words;
    }
    windows.set(window, counts);
  }
  const share =
    beecher + mcclellan > 0 ? beecher / (beecher + mcclellan) : Number.NaN;

  let compared = 0;
  let differ = 0;
  let longest = 0;
  if (raw) {
    const rawLabel = new Map(raw.map(turn => [turn.timestamp, turn.speaker]));
    let run = 0;
    for (const turn of final) {
      const label = rawLabel.get(turn.timestamp);
      if (!label || !HOSTS.has(label) || !HOSTS.has(turn.speaker)) continue;
      compared++;
      if (label === turn.speaker) {
        run = 0;
      } else {
        differ++;
        run++;
        longest = Math.max(longest, run);
      }
    }
  }

  const hot = [...windows]
    .filter(([, [b, m]]) => b + m >= 400 && b / (b + m) > 0.6)
    .map(([window, [b, m]]) => `${window}m:${(b / (b + m)).toFixed(2)}`);
  const flagged =
    Number.isNaN(share) ||
    share > 0.45 ||
    longest >= 3 ||
    hot.length > 0 ||
    (compared > 0 && differ / compared > 0.2);
  if (all || flagged) {
    const rawNote = raw
      ? `raw/final differ ${differ}/${compared}, longest run ${longest}`
      : "no raw";
    const hotNote = hot.length > 0 ? `, hot ${hot.join(" ")}` : "";
    console.log(
      `${stem}: Beecher share ${share.toFixed(2)}, ${rawNote}${hotNote}`,
    );
  }
}
