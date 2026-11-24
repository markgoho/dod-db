/**
 * Check every hand-authored quote on topic, tag and book pages, and every
 * Scholarship Trigger Claim, against the final Transcript it cites.
 *
 * Usage: bun run check:quotes
 */

import { Glob } from "bun";
import path from "node:path";

interface Quote {
  text?: unknown;
  speaker?: unknown;
  episode?: unknown;
  timestamp?: unknown;
}

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n/;

async function transcriptPaths(root: string): Promise<Map<number, string>> {
  const videos = (await Bun.file(
    path.join(root, "data/processed-videos.json"),
  ).json()) as { episodeNumber?: number; transcriptPath?: string }[];
  const byEpisode = new Map<number, string>();
  for (const video of videos) {
    if (video.episodeNumber !== undefined && video.transcriptPath) {
      byEpisode.set(video.episodeNumber, video.transcriptPath);
    }
  }
  return byEpisode;
}

async function pageQuotes(filePath: string): Promise<Quote[]> {
  const match = FRONTMATTER.exec(await Bun.file(filePath).text());
  if (!match?.[1]) return [];
  const frontmatter = Bun.YAML.parse(match[1]) as { quotes?: Quote[] } | null;
  return frontmatter?.quotes ?? [];
}

async function triggerClaims(filePath: string): Promise<Quote[]> {
  const claims = Bun.YAML.parse(await Bun.file(filePath).text()) as
    | Quote[]
    | null;
  return claims ?? [];
}

interface Line {
  timestamp: string;
  seconds: number;
  speaker: string;
  text: string;
}

const TIMESTAMP = /^(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/;
/** Older Transcripts have no milliseconds; Episode Pages render those as .000. */
const LINE = /^\[(\d{2}:\d{2}:\d{2})(\.\d{3})?\] ([^:]+): (.*)$/;

function toSeconds(timestamp: string): number {
  const [, h, m, s, ms] = TIMESTAMP.exec(timestamp) ?? [];
  return Number(h) * 3600 + Number(m) * 60 + Number(s) + Number(ms) / 1000;
}

function parseTranscript(text: string): Line[] {
  const lines: Line[] = [];
  for (const raw of text.split("\n")) {
    const match = LINE.exec(raw);
    if (!match?.[1] || !match[3] || match[4] === undefined) continue;
    const timestamp = `${match[1]}${match[2] ?? ".000"}`;
    lines.push({
      timestamp,
      seconds: toSeconds(timestamp),
      speaker: match[3],
      text: match[4],
    });
  }
  return lines;
}

/** Lowercase words only: no accents, punctuation or extra spaces. */
function normalize(text: string): string {
  return text
    .normalize("NFKD")
    .replaceAll(/\p{M}/gu, "")
    .toLowerCase()
    .replaceAll(/['’‘]/g, "")
    .replaceAll(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/**
 * The quote's words, with the indexes of words that follow an ellipsis or a
 * bracketed insertion (where any amount of Transcript may be left out).
 */
interface Words {
  words: string[];
  cuts: Set<number>;
}

function quoteWords(text: string): Words {
  const words: string[] = [];
  const cuts = new Set<number>();
  for (const part of text.split(/\.\.\.|…|\[[^\]]*\]/)) {
    if (words.length > 0) cuts.add(words.length);
    words.push(...normalize(part).split(" ").filter(Boolean));
  }
  return { words, cuts };
}

/** Cost of a Transcript word the quote leaves out, such as "uh" or a false start. */
const SKIP = 0.25;
/** Cost of a quote word the Transcript doesn't have. */
const MISSING = 1;
/** Most cost a quote may carry per word and still count as said. */
const PER_WORD = 0.1;
const SLACK = 0.5;

/**
 * The index of the line where the quote starts, or -1 when no stretch of
 * the lines says it. A quote may drop fillers, false starts and another
 * Speaker's interjection, but may not reword: each dropped Transcript word
 * costs SKIP, each quote word the Transcript lacks costs MISSING.
 */
function locate(lines: Line[], quote: Words): number {
  const said: string[] = [];
  const lineOf: number[] = [];
  for (const [index, line] of lines.entries()) {
    for (const word of normalize(line.text).split(" ").filter(Boolean)) {
      said.push(word);
      lineOf.push(index);
    }
  }
  const { words, cuts } = quote;
  if (words.length === 0) return -1;
  // cost[j] / start[j]: best alignment of the first i quote words ending
  // before Transcript word j, and the Transcript word it starts at.
  let cost = Array.from({ length: said.length + 1 }, () => 0);
  let start = Array.from({ length: said.length + 1 }, (_, j) => j);
  for (let i = 1; i <= words.length; i++) {
    const skip = cuts.has(i) ? 0 : SKIP;
    const nextCost = Array.from({ length: said.length + 1 }, () => 0);
    const nextStart = Array.from({ length: said.length + 1 }, () => 0);
    nextCost[0] = (cost[0] ?? 0) + MISSING;
    nextStart[0] = start[0] ?? 0;
    for (let j = 1; j <= said.length; j++) {
      let best = (cost[j] ?? 0) + MISSING;
      let from = start[j] ?? 0;
      if (words[i - 1] === said[j - 1] && (cost[j - 1] ?? 0) <= best) {
        best = cost[j - 1] ?? 0;
        from = start[j - 1] ?? 0;
      }
      if (i > 1 && (nextCost[j - 1] ?? 0) + skip < best) {
        best = (nextCost[j - 1] ?? 0) + skip;
        from = nextStart[j - 1] ?? 0;
      }
      nextCost[j] = best;
      nextStart[j] = from;
    }
    cost = nextCost;
    start = nextStart;
  }
  let end = 0;
  for (let j = 1; j <= said.length; j++) {
    if ((cost[j] ?? 0) < (cost[end] ?? 0)) end = j;
  }
  if ((cost[end] ?? 0) > PER_WORD * words.length + SLACK) return -1;
  return lineOf[start[end] ?? 0] ?? -1;
}

/** How far past the cited line a quote may run on. */
const RUN_ON = 8;

function nearest(lines: Line[], seconds: number): Line | undefined {
  let best: Line | undefined;
  for (const line of lines) {
    if (
      !best ||
      Math.abs(line.seconds - seconds) < Math.abs(best.seconds - seconds)
    ) {
      best = line;
    }
  }
  return best;
}

export async function checkQuoteCitations(root: string): Promise<string[]> {
  const failures: string[] = [];
  const transcripts = await transcriptPaths(root);
  const parsed = new Map<number, Line[]>();
  const linesOf = async (episode: number): Promise<Line[]> => {
    let lines = parsed.get(episode);
    if (!lines) {
      const file = path.join(root, transcripts.get(episode) ?? "");
      lines = parseTranscript(await Bun.file(file).text());
      parsed.set(episode, lines);
    }
    return lines;
  };
  const findElsewhere = async (
    episode: number,
    quote: Words,
  ): Promise<string> => {
    const own = await linesOf(episode);
    const here = locate(own, quote);
    if (here !== -1) return `found at ${own[here]?.timestamp}`;
    // Other Episodes: only near lines that share the quote's opening words.
    const opening = ` ${quote.words.slice(0, 4).join(" ")} `;
    for (const other of transcripts.keys()) {
      if (other === episode) continue;
      const lines = await linesOf(other);
      for (const [index, line] of lines.entries()) {
        if (!` ${normalize(line.text)} `.includes(opening)) continue;
        const there = locate(lines.slice(index, index + RUN_ON), quote);
        if (there !== -1)
          return `found in Episode ${other} at ${lines[index + there]?.timestamp}`;
      }
    }
    return "not found in any Transcript";
  };
  const pages = new Glob("hugo/content/{topics,tags,books}/**/_index.md");
  const triggers = new Glob("hugo/data/scholarship/triggers/*.yaml");
  const files = [
    ...(await Array.fromAsync(pages.scan(root))),
    ...(await Array.fromAsync(triggers.scan(root))),
  ].toSorted();
  for (const file of files) {
    const quotes = file.endsWith(".yaml")
      ? await triggerClaims(path.join(root, file))
      : await pageQuotes(path.join(root, file));
    for (const [index, quote] of quotes.entries()) {
      const where = `${file} quote ${index + 1}`;
      const episode = Number(quote.episode);
      if (!transcripts.has(episode)) {
        failures.push(
          `${where}: Episode ${String(quote.episode)} has no Transcript`,
        );
        continue;
      }
      const timestamp = String(quote.timestamp);
      if (!TIMESTAMP.test(timestamp)) {
        failures.push(`${where}: timestamp ${timestamp} is not HH:MM:SS.mmm`);
        continue;
      }
      const lines = await linesOf(episode);
      const cited = lines.findIndex(line => line.timestamp === timestamp);
      if (cited === -1) {
        const near = nearest(lines, toSeconds(timestamp));
        failures.push(
          `${where}: Episode ${episode} has no line at ${timestamp} (nearest ${near?.timestamp ?? "none"})`,
        );
        continue;
      }
      const parts = quoteWords(String(quote.text));
      // The quote starts on the cited line or one either side of it.
      const from = Math.max(0, cited - 1);
      const start = locate(lines.slice(from, cited + RUN_ON), parts);
      const said = start === -1 || from + start > cited + 1 ? -1 : from + start;
      if (said === -1) {
        failures.push(
          `${where}: text not at Episode ${episode} ${timestamp} (${await findElsewhere(episode, parts)})`,
        );
        continue;
      }
      // Both the linked line and the line that says the text must be the cited Speaker.
      const citedLine = lines[cited];
      const saidLine = lines[said];
      const cites = `${where}: cited ${String(quote.speaker)}, but Episode ${episode}`;
      if (citedLine && citedLine.speaker !== quote.speaker) {
        const starts =
          said === cited ? "" : ` (text starts at ${saidLine?.timestamp})`;
        failures.push(
          `${cites} ${citedLine.timestamp} is ${citedLine.speaker}${starts}`,
        );
      } else if (saidLine && saidLine.speaker !== quote.speaker) {
        failures.push(`${cites} ${saidLine.timestamp} is ${saidLine.speaker}`);
      }
    }
  }
  return failures;
}

if (import.meta.main) {
  const root = path.resolve(import.meta.dir, "../..");
  const failures = await checkQuoteCitations(root);
  if (failures.length > 0) {
    for (const failure of failures) console.error(`✗ ${failure}`);
    console.error(`\ncheck:quotes failed: ${failures.length} problem(s)`);
    process.exit(1);
  }
  console.log("✓ check:quotes passed");
}
