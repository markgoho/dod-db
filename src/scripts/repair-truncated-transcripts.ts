/**
 * Repair final transcript lines that lost their tail during chunked
 * correction. Compares each final line with the raw line at the same
 * timestamp, corrects only the missing tail, and appends it. Every other
 * line is left exactly as it is.
 *
 * Requires raw transcripts (run recover-raw-transcripts.ts first).
 *
 * Usage:
 *   bun run src/scripts/repair-truncated-transcripts.ts                 # dry run
 *   bun run src/scripts/repair-truncated-transcripts.ts --samples=5     # dry run with examples
 *   bun run src/scripts/repair-truncated-transcripts.ts --episode=179   # one episode
 *   bun run src/scripts/repair-truncated-transcripts.ts --write         # apply repairs
 */

import { correctTranscript } from "../pipeline/correct.js";
import {
  containsLeadingWords,
  findTruncatedTail,
  parseTranscriptLines,
} from "../pipeline/repair-transcript-lines.js";
import { loadProcessedVideos } from "../storage/load-processed-videos.js";

const write = process.argv.includes("--write");
const argument = (name: string) =>
  process.argv.find(a => a.startsWith(`--${name}=`))?.split("=")[1];
const onlyEpisode = argument("episode");
const sampleCount = Number(argument("samples") ?? 0);

type Repair = {
  lineIndex: number;
  timestamp: string;
  speaker: string;
  tail: string;
};

async function findRepairs(transcriptPath: string): Promise<
  | {
      repairs: Repair[];
      missingLines: number;
      alreadyPresent: number;
      ambiguous: string[];
    }
  | undefined
> {
  const rawPath = transcriptPath.replace(/\.txt$/, "-raw.txt");
  if (!(await Bun.file(rawPath).exists())) return undefined;

  const rawLines = parseTranscriptLines(await Bun.file(rawPath).text());
  const raw = new Map(rawLines.map(l => [l.timestamp, l]));
  const finalText = await Bun.file(transcriptPath).text();
  const final = finalText
    .split("\n")
    .map(line => parseTranscriptLines(line)[0]);
  const finalStamps = new Set(final.flatMap(l => (l ? [l.timestamp] : [])));

  // A timestamp on more than one line can't be matched to its raw line safely.
  const counts = new Map<string, number>();
  for (const l of [...rawLines, ...final]) {
    if (l) counts.set(l.timestamp, (counts.get(l.timestamp) ?? 0) + 1);
  }

  const repairs: Repair[] = [];
  const ambiguous: string[] = [];
  let alreadyPresent = 0;
  for (const [lineIndex, line] of final.entries()) {
    if (!line) continue;
    const rawLine = raw.get(line.timestamp);
    if (!rawLine) continue;
    const tail = findTruncatedTail(rawLine.text, line.text);
    if (!tail) continue;
    if (containsLeadingWords(finalText, tail)) {
      alreadyPresent++;
      continue;
    }
    if ((counts.get(line.timestamp) ?? 0) > 2) {
      ambiguous.push(line.timestamp);
      continue;
    }
    repairs.push({ lineIndex, ...line, tail });
  }
  const missingLines = [...raw.keys()].filter(t => !finalStamps.has(t)).length;
  return { repairs, missingLines, alreadyPresent, ambiguous };
}

async function applyRepairs(transcriptPath: string, repairs: Repair[]) {
  const tails = repairs.map(r => `${r.timestamp} ${r.speaker}: ${r.tail}`);
  // correctTranscript keeps line order and timestamps (or returns the input
  // unchanged), so corrected tails line up with repairs by position.
  const corrected = parseTranscriptLines(
    await correctTranscript(tails.join("\n")),
  );

  const lines = (await Bun.file(transcriptPath).text()).split("\n");
  for (const [index, repair] of repairs.entries()) {
    const tail = corrected[index]?.text ?? repair.tail;
    lines[repair.lineIndex] = `${lines[repair.lineIndex]!.trimEnd()} ${tail}`;
  }
  await Bun.write(transcriptPath, lines.join("\n"));
}

async function main() {
  const videos = (await loadProcessedVideos())
    .filter(v => v.transcriptPath)
    .filter(v => !onlyEpisode || String(v.episodeNumber) === onlyEpisode)
    .toSorted((a, b) => (a.episodeNumber ?? 0) - (b.episodeNumber ?? 0));

  let totalLines = 0;
  let totalSkipped = 0;
  let totalChars = 0;
  const repaired: number[] = [];
  const noRaw: string[] = [];
  let samplesShown = 0;

  for (const video of videos) {
    const label = `#${video.episodeNumber ?? "?"} ${video.title}`;
    const result = await findRepairs(video.transcriptPath);
    if (!result) {
      noRaw.push(label);
      continue;
    }
    const { repairs, missingLines, alreadyPresent, ambiguous } = result;
    if (ambiguous.length > 0) {
      console.log(
        `${label}: skipped duplicated timestamp(s) ${ambiguous.join(", ")}; check by hand`,
      );
    }
    totalSkipped += alreadyPresent;
    if (repairs.length === 0 && missingLines === 0) continue;

    const chars = repairs.reduce((sum, r) => sum + r.tail.length, 0);
    totalLines += repairs.length;
    totalChars += chars;
    console.log(
      `${label}: ${repairs.length} truncated line(s), ${chars} chars missing` +
        (missingLines > 0 ? `, ${missingLines} raw line(s) absent` : ""),
    );

    for (const r of repairs) {
      if (samplesShown >= sampleCount) break;
      samplesShown++;
      console.log(`    ${r.timestamp} + "${r.tail.slice(0, 160)}…"`);
    }

    if (write && repairs.length > 0) {
      await applyRepairs(video.transcriptPath, repairs);
      repaired.push(video.episodeNumber ?? 0);
    }
  }

  console.log(
    `\nTotal: ${totalLines} truncated lines, ${totalChars.toLocaleString()} chars missing` +
      ` (${totalSkipped} candidate tails skipped: already in transcript)`,
  );
  if (noRaw.length > 0) console.log(`No raw transcript: ${noRaw.join("; ")}`);
  if (write) {
    console.log(`Repaired episodes: ${repaired.join(", ")}`);
  } else {
    console.log("Dry run only. Re-run with --write to apply.");
  }
}

await main();
