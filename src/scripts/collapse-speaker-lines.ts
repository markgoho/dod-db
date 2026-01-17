/**
 * Collapses consecutive transcript lines from the same speaker into single lines.
 *
 * Before:
 * [00:00:18.320] Dan McClellan: Hey, everybody.
 * [00:00:19.520] Dan Beecher: Hi, friends, and welcome to the Data Over Dogma podcast where we bring you.
 * [00:00:24.120] Dan McClellan: The latest in biblical scholarship and do.
 * [00:00:26.920] Dan Beecher: Our best to combat the spread of misinformation.
 * [00:00:29.440] Dan Beecher: With me is Dr. Dan McClellan, biblical scholar and TikTok star.
 *
 * After:
 * [00:00:18.320] Dan McClellan: Hey, everybody.
 * [00:00:19.520] Dan Beecher: Hi, friends, and welcome to the Data Over Dogma podcast where we bring you.
 * [00:00:24.120] Dan McClellan: The latest in biblical scholarship and do.
 * [00:00:26.920] Dan Beecher: Our best to combat the spread of misinformation. With me is Dr. Dan McClellan, biblical scholar and TikTok star.
 */

import { Glob } from "bun";
import path from "node:path";
import { parseArgs } from "node:util";
import { MAX_DURATION_SECONDS } from "../utils/collapse-transcript-constants.js";
import { parseTimestampToSeconds } from "../utils/parse-timestamp-to-seconds.js";

// Regex to parse: [HH:MM:SS.mmm] or [HH:MM:SS] Speaker Name: text
// Milliseconds are optional since some older transcripts don't have them
const LINE_REGEX = /^\[(\d{2}:\d{2}:\d{2}(?:\.\d{3})?)\] (.+?): (.+)$/;

interface TranscriptLine {
  timestamp: string;
  timestampSeconds: number;
  speaker: string;
  text: string;
}

function collapseLines(content: string): string {
  const lines = content.split("\n");
  const groups: TranscriptLine[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = trimmed.match(LINE_REGEX);
    if (!match) {
      // Non-matching line - could be malformed, preserve as-is by starting new "group"
      // Actually, let's just warn and skip
      console.warn(
        `  Warning: Line does not match expected format: ${trimmed.slice(0, 60)}...`,
      );
      continue;
    }

    const timestamp = match[1];
    const speaker = match[2];
    const text = match[3];

    // These should always be defined since the regex matched, but satisfy TypeScript
    if (
      timestamp === undefined ||
      speaker === undefined ||
      text === undefined
    ) {
      console.warn(
        `  Warning: Unexpected match structure: ${trimmed.slice(0, 60)}...`,
      );
      continue;
    }

    const timestampSeconds = parseTimestampToSeconds(timestamp);
    const lastGroup = groups.at(-1);

    // Check if we can append to the last group
    const canAppend =
      lastGroup &&
      lastGroup.speaker === speaker &&
      timestampSeconds - lastGroup.timestampSeconds <= MAX_DURATION_SECONDS;

    if (canAppend) {
      // Same speaker within time limit - append text with a space
      lastGroup.text += " " + text;
    } else {
      // New speaker OR exceeded time limit - start new group
      groups.push({ timestamp, timestampSeconds, speaker, text });
    }
  }

  return groups.map(g => `[${g.timestamp}] ${g.speaker}: ${g.text}`).join("\n");
}

async function processFile(
  filePath: string,
  dryRun: boolean,
): Promise<{ before: number; after: number }> {
  const content = await Bun.file(filePath).text();
  const linesBefore = content.split("\n").filter(l => l.trim()).length;

  const collapsed = collapseLines(content);
  const linesAfter = collapsed.split("\n").filter(l => l.trim()).length;

  if (!dryRun) {
    await Bun.write(filePath, collapsed);
  }

  return { before: linesBefore, after: linesAfter };
}

async function main() {
  const { values, positionals } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      "dry-run": { type: "boolean", default: false },
      all: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: true,
  });

  if (values.help) {
    console.log(`
Usage: bun run src/scripts/collapse-speaker-lines.ts [options] [files...]

Collapses consecutive transcript lines from the same speaker into single lines,
keeping only the first timestamp.

Options:
  --dry-run    Show what would change without modifying files
  --all        Process all transcripts (excluding -raw.txt files)
  -h, --help   Show this help

Examples:
  # Dry run on first 3 transcripts
  bun run src/scripts/collapse-speaker-lines.ts --dry-run data/transcripts/2023-04-08*.txt data/transcripts/2023-04-17*.txt data/transcripts/2023-04-24*.txt

  # Process specific files
  bun run src/scripts/collapse-speaker-lines.ts data/transcripts/2023-04-08-episode-1*.txt

  # Process all transcripts
  bun run src/scripts/collapse-speaker-lines.ts --all
`);
    process.exit(0);
  }

  const dryRun = values["dry-run"] ?? false;
  let files: string[] = [];

  if (values.all) {
    // Get all .txt files excluding -raw.txt
    const transcriptsDir = path.join(process.cwd(), "data/transcripts");
    const glob = new Glob("*.txt");
    for await (const file of glob.scan(transcriptsDir)) {
      if (!file.endsWith("-raw.txt")) {
        files.push(path.join(transcriptsDir, file));
      }
    }
    files.sort(); // Sort for consistent ordering
  } else if (positionals.length > 0) {
    files = positionals.map(f =>
      path.isAbsolute(f) ? f : path.join(process.cwd(), f),
    );
  } else {
    console.error("Error: Specify files to process or use --all");
    console.error("Run with --help for usage information");
    process.exit(1);
  }

  if (files.length === 0) {
    console.log("No files found to process");
    process.exit(0);
  }

  console.log(
    `${dryRun ? "[DRY RUN] " : ""}Processing ${files.length} file(s)...\n`,
  );

  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    const basename = path.basename(file);
    console.log(`Processing: ${basename}`);

    const { before, after } = await processFile(file, dryRun);
    totalBefore += before;
    totalAfter += after;

    const reduction = before - after;
    const percent = ((reduction / before) * 100).toFixed(1);
    console.log(
      `  ${before} lines → ${after} lines (${reduction} lines collapsed, ${percent}% reduction)\n`,
    );
  }

  console.log("---");
  console.log(`Total: ${totalBefore} lines → ${totalAfter} lines`);
  console.log(
    `Collapsed: ${totalBefore - totalAfter} lines (${(((totalBefore - totalAfter) / totalBefore) * 100).toFixed(1)}% reduction)`,
  );

  if (dryRun) {
    console.log(
      "\n[DRY RUN] No files were modified. Remove --dry-run to apply changes.",
    );
  }
}

main();
