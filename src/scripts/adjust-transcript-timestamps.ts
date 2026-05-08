import { getEpisodeByNumber } from "../catalog/episode-catalog.js";
import { generateHugoEpisode } from "../pipeline/generate-hugo-episode.js";

interface Options {
  file?: string;
  episode?: number;
  replacements: Map<string, string>;
  offsetFrom?: string;
  offsetThrough?: string;
  offsetMs?: number;
  regenerate: boolean;
}

function printUsage(): void {
  console.error("Usage:");
  console.error(
    "  bun run src/scripts/adjust-transcript-timestamps.ts --file <path> --set 00:01:55.425=00:02:08.000",
  );
  console.error(
    "  bun run src/scripts/adjust-transcript-timestamps.ts --episode 160 --set 00:01:55.425=00:02:08.000 --regenerate",
  );
  console.error(
    "  bun run src/scripts/adjust-transcript-timestamps.ts --episode 160 --from 00:01:55.425 --offset-ms 12575 --regenerate",
  );
  console.error(
    "  bun run src/scripts/adjust-transcript-timestamps.ts --episode 160 --from 00:01:55.425 --through 00:02:07.505 --offset-ms 12575 --regenerate",
  );
}

function parseTimestampMs(timestamp: string): number {
  const trimmed = timestamp.trim();
  const match = /^\[?(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?\]?$/.exec(trimmed);
  if (!match) {
    throw new Error(`Invalid timestamp: ${timestamp}`);
  }

  const hours = Number.parseInt(match[1] ?? "0", 10);
  const minutes = Number.parseInt(match[2] ?? "0", 10);
  const seconds = Number.parseInt(match[3] ?? "0", 10);
  const milliseconds = Number.parseInt((match[4] ?? "0").padEnd(3, "0"), 10);

  if (minutes > 59 || seconds > 59) {
    throw new Error(`Invalid timestamp: ${timestamp}`);
  }

  return hours * 3_600_000 + minutes * 60_000 + seconds * 1000 + milliseconds;
}

function formatTimestampMs(milliseconds: number): string {
  if (milliseconds < 0) {
    throw new Error(`Cannot format negative timestamp: ${milliseconds}`);
  }

  const hours = Math.floor(milliseconds / 3_600_000)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((milliseconds % 3_600_000) / 60_000)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor((milliseconds % 60_000) / 1000)
    .toString()
    .padStart(2, "0");
  const ms = (milliseconds % 1000).toString().padStart(3, "0");

  return `[${hours}:${minutes}:${seconds}.${ms}]`;
}

function normalizeTimestamp(timestamp: string): string {
  return formatTimestampMs(parseTimestampMs(timestamp));
}

function parseOptions(args: string[]): Options {
  const options: Options = {
    replacements: new Map(),
    regenerate: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (argument === "--file") {
      options.file = args[index + 1];
      index += 1;
      continue;
    }

    if (argument === "--episode") {
      const value = Number.parseInt(args[index + 1] ?? "", 10);
      if (Number.isNaN(value)) {
        throw new Error("--episode requires a number");
      }
      options.episode = value;
      index += 1;
      continue;
    }

    if (argument === "--set") {
      const value = args[index + 1];
      const separatorIndex = value?.indexOf("=") ?? -1;
      if (!value || separatorIndex === -1) {
        throw new Error("--set requires old=new");
      }
      const oldTimestamp = normalizeTimestamp(value.slice(0, separatorIndex));
      const newTimestamp = normalizeTimestamp(value.slice(separatorIndex + 1));
      options.replacements.set(oldTimestamp, newTimestamp);
      index += 1;
      continue;
    }

    if (argument === "--from") {
      options.offsetFrom = normalizeTimestamp(args[index + 1] ?? "");
      index += 1;
      continue;
    }

    if (argument === "--through") {
      options.offsetThrough = normalizeTimestamp(args[index + 1] ?? "");
      index += 1;
      continue;
    }

    if (argument === "--offset-ms") {
      const value = Number.parseInt(args[index + 1] ?? "", 10);
      if (Number.isNaN(value)) {
        throw new Error("--offset-ms requires a number");
      }
      options.offsetMs = value;
      index += 1;
      continue;
    }

    if (argument === "--regenerate") {
      options.regenerate = true;
      continue;
    }

    throw new Error(`Unexpected argument: ${argument}`);
  }

  if (!options.file && options.episode === undefined) {
    throw new Error("Provide --file or --episode");
  }

  if (options.file && options.episode !== undefined) {
    throw new Error("Use only one of --file or --episode");
  }

  if ((options.offsetFrom === undefined) !== (options.offsetMs === undefined)) {
    throw new Error("Use --from and --offset-ms together");
  }

  if (options.offsetThrough !== undefined && options.offsetFrom === undefined) {
    throw new Error("Use --through with --from and --offset-ms");
  }

  if (
    options.offsetFrom !== undefined &&
    options.offsetThrough !== undefined &&
    parseTimestampMs(options.offsetThrough) <
      parseTimestampMs(options.offsetFrom)
  ) {
    throw new Error("--through must be at or after --from");
  }

  if (options.replacements.size === 0 && options.offsetMs === undefined) {
    throw new Error(
      "Provide at least one --set old=new mapping or --from with --offset-ms",
    );
  }

  return options;
}

async function resolveTranscriptPath(options: Options): Promise<{
  path: string;
  episodeVideo?: Awaited<ReturnType<typeof getEpisodeByNumber>>;
}> {
  if (options.file) {
    return { path: options.file };
  }

  const episodeVideo = await getEpisodeByNumber(options.episode!);
  if (!episodeVideo) {
    throw new Error(`Episode ${options.episode} not found`);
  }

  return { path: episodeVideo.transcriptPath, episodeVideo };
}

async function adjustTranscript(options: Options): Promise<void> {
  const { path, episodeVideo } = await resolveTranscriptPath(options);
  const file = Bun.file(path);
  if (!(await file.exists())) {
    throw new Error(`Transcript not found: ${path}`);
  }

  const lines = (await file.text()).split("\n");
  const seen = new Set<string>();
  const offsetFromMs =
    options.offsetFrom === undefined
      ? undefined
      : parseTimestampMs(options.offsetFrom);
  const offsetThroughMs =
    options.offsetThrough === undefined
      ? undefined
      : parseTimestampMs(options.offsetThrough);
  let offsetCount = 0;

  const updated = lines.map(line => {
    const match = /^\[(\d{2}:\d{2}:\d{2}\.\d{3})\]/.exec(line);
    if (!match) {
      return line;
    }

    const currentTimestamp = `[${match[1]}]`;
    const directReplacement = options.replacements.get(currentTimestamp);
    if (directReplacement) {
      seen.add(currentTimestamp);
      return line.replace(currentTimestamp, directReplacement);
    }

    if (offsetFromMs !== undefined && options.offsetMs !== undefined) {
      const currentMs = parseTimestampMs(currentTimestamp);
      const isWithinOffsetRange =
        currentMs >= offsetFromMs &&
        (offsetThroughMs === undefined || currentMs <= offsetThroughMs);
      if (isWithinOffsetRange) {
        offsetCount += 1;
        return line.replace(
          currentTimestamp,
          formatTimestampMs(currentMs + options.offsetMs),
        );
      }
    }

    return line;
  });

  const missing = [...options.replacements.keys()].filter(
    key => !seen.has(key),
  );
  if (missing.length > 0) {
    throw new Error(
      `Timestamp(s) not found in transcript: ${missing.join(", ")}`,
    );
  }

  await Bun.write(path, updated.join("\n"));
  console.log(
    `Updated ${options.replacements.size + offsetCount} timestamp(s) in ${path}`,
  );

  if (options.regenerate) {
    if (!episodeVideo) {
      throw new Error("--regenerate requires --episode");
    }
    await generateHugoEpisode(episodeVideo);
  }
}

async function main(): Promise<void> {
  try {
    const options = parseOptions(process.argv.slice(2));
    await adjustTranscript(options);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    console.error("");
    printUsage();
    process.exit(1);
  }
}

await main();
