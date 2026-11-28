/**
 * Find where a new Episode's Transcript may hold Trigger Claims for Synthesis
 * Pages, Timeline Entries and candidate subjects (process-next-episode Step 5).
 *
 * Two signals point at a target:
 * - `watch`: a target's watch term appears on a Transcript line (see
 *   `watchPattern`).
 * - `related`: the Episode has a tag or topic from the target's `related`
 *   field at least MIN_MENTIONS times; the lines naming it are hits. Books are
 *   not matched: a book name (Genesis, John) is on nearly every Transcript.
 * Hits merge into read windows per target. A sweep then lists consensus and
 * date wording anywhere in the Transcript, the source for new subjects and
 * new Timeline Entries.
 *
 * Backtest (2026-11-28, #270, 397 accepted Trigger Claims): watch or related
 * lands within two minutes of 388, as before. Eps 170+ average 18 targets,
 * 87 hit lines and 30 read windows each; matching books and watch terms at a
 * word start gave 26, 189 and 54.
 */

import { taxonomyFolderSlug } from "../utils/title-to-slug.js";
import { parseTranscriptLine } from "./parse-transcript-line.js";

export const MIN_MENTIONS = 3;

/** Seconds either side of a hit that the reader checks (the skill's "about two minutes"). */
export const WINDOW_SECONDS = 120;

export const CONSENSUS_PATTERN =
  /\b(scholars|scholarship|consensus|critical scholar|historians|archaeolog)/i;

export const DATE_PATTERN =
  /\b(BCE|B\.C\.|\d+(st|nd|rd|th) century|(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth) century|written (around|in the|after|before|during)|dates? (to|from) )/i;

export type TargetKind = "page" | "entry" | "subject";

export interface Target {
  kind: TargetKind;
  id: string;
  watch: string[];
  related?: { books: string[]; tags: string[]; topics: string[] };
}

export interface EpisodeTerms {
  tags: { tag: string; mentions: number }[];
}

export interface TranscriptLine {
  /** 1-based line number in the Transcript file. */
  line: number;
  timestamp: string;
  totalSeconds: number;
  speaker: string;
  text: string;
}

export interface Hit {
  line: number;
  timestamp: string;
  speaker: string;
  via: "watch" | "related";
  term: string;
}

export interface TargetHits {
  kind: TargetKind;
  id: string;
  hits: Hit[];
}

/** Hits on one target close enough to read as one Transcript passage. */
export interface ReadWindow {
  from: string;
  to: string;
  firstLine: number;
  lastLine: number;
  terms: { term: string; via: Hit["via"] }[];
}

export interface TargetWindows {
  kind: TargetKind;
  id: string;
  windows: ReadWindow[];
}

export interface SweepLine {
  line: number;
  timestamp: string;
  speaker: string;
  matches: ("consensus" | "date")[];
  /** Targets with a hit within WINDOW_SECONDS; that read already covers the line. */
  near: string[];
  text: string;
}

export function parseTranscript(text: string): TranscriptLine[] {
  return text.split("\n").flatMap((raw, index) => {
    const parsed = parseTranscriptLine(raw);
    return parsed ? [{ line: index + 1, ...parsed }] : [];
  });
}

/** Tags and topics from `related` that the Episode mentions at least `minMentions` times. */
export function relatedTerms(
  target: Target,
  episode: EpisodeTerms,
  minMentions = MIN_MENTIONS,
): string[] {
  if (!target.related) return [];
  const tags = new Set(
    [...target.related.tags, ...target.related.topics].map(taxonomyFolderSlug),
  );
  return episode.tags
    .filter(t => t.mentions >= minMentions)
    .filter(t => tags.has(taxonomyFolderSlug(t.tag)))
    .map(t => t.tag);
}

/**
 * A watch term matches a whole word, plus a plural or possessive ending:
 * "Eve" skips "even", "angel" matches "angels". A trailing `*` matches any
 * word continuation instead: "harmoniz*" matches "harmonized".
 */
export function watchPattern(term: string): RegExp {
  if (term.endsWith("*")) {
    return new RegExp(String.raw`\b${RegExp.escape(term.slice(0, -1))}`, "i");
  }
  const end = /\w$/.test(term) ? String.raw`(?:s|es|'s|’s)?\b` : "";
  return new RegExp(String.raw`\b${RegExp.escape(term)}${end}`, "i");
}

/** Every target with at least one hit, hits in Transcript order. */
export function findTargetHits(
  lines: TranscriptLine[],
  episode: EpisodeTerms,
  targets: Target[],
  minMentions = MIN_MENTIONS,
): TargetHits[] {
  return targets.flatMap(target => {
    const terms: { term: string; via: Hit["via"] }[] = [
      ...target.watch.map(term => ({ term, via: "watch" as const })),
      ...relatedTerms(target, episode, minMentions).map(term => ({
        term,
        via: "related" as const,
      })),
    ];
    const patterns = terms.map(t => ({ ...t, pattern: watchPattern(t.term) }));
    const hits = lines.flatMap(l => {
      const match = patterns.find(t => t.pattern.test(l.text));
      const found = match && { term: match.term, via: match.via };
      return found
        ? [
            {
              line: l.line,
              timestamp: l.timestamp,
              speaker: l.speaker,
              ...found,
            },
          ]
        : [];
    });
    return hits.length > 0 ? [{ kind: target.kind, id: target.id, hits }] : [];
  });
}

/** Merge each target's hits into windows: a hit within 2 × WINDOW_SECONDS of the last joins its window. */
export function readWindows(
  lines: TranscriptLine[],
  targetHits: TargetHits[],
): TargetWindows[] {
  const seconds = new Map(lines.map(l => [l.line, l.totalSeconds]));
  return targetHits.map(({ kind, id, hits }) => {
    const windows: (ReadWindow & { end: number })[] = [];
    for (const hit of hits) {
      const at = seconds.get(hit.line) ?? 0;
      const last = windows.at(-1);
      if (last && at - last.end <= 2 * WINDOW_SECONDS) {
        last.to = hit.timestamp;
        last.lastLine = hit.line;
        last.end = at;
        if (!last.terms.some(t => t.term === hit.term && t.via === hit.via)) {
          last.terms.push({ term: hit.term, via: hit.via });
        }
      } else {
        windows.push({
          from: hit.timestamp,
          to: hit.timestamp,
          firstLine: hit.line,
          lastLine: hit.line,
          terms: [{ term: hit.term, via: hit.via }],
          end: at,
        });
      }
    }
    return { kind, id, windows: windows.map(({ end: _end, ...w }) => w) };
  });
}

/** Lines with consensus or date wording, each marked with the targets already read around it. */
export function sweep(
  lines: TranscriptLine[],
  targetHits: TargetHits[],
): SweepLine[] {
  const seconds = new Map(lines.map(l => [l.line, l.totalSeconds]));
  return lines.flatMap(l => {
    const matches: SweepLine["matches"] = [];
    if (CONSENSUS_PATTERN.test(l.text)) matches.push("consensus");
    if (DATE_PATTERN.test(l.text)) matches.push("date");
    if (matches.length === 0) return [];
    const near = targetHits
      .filter(t =>
        t.hits.some(
          h =>
            Math.abs((seconds.get(h.line) ?? 0) - l.totalSeconds) <=
            WINDOW_SECONDS,
        ),
      )
      .map(t => `${t.kind}:${t.id}`);
    return [
      {
        line: l.line,
        timestamp: l.timestamp,
        speaker: l.speaker,
        matches,
        near,
        text: l.text,
      },
    ];
  });
}
