/**
 * Helpers for repairing transcript lines that lost their tail during
 * chunked correction (see chunk-transcript-lines.ts for the fixed chunker).
 */

export type TranscriptLine = {
  timestamp: string;
  speaker: string;
  text: string;
};

const linePattern = /^(\[\d{2}:\d{2}:\d{2}\.\d{3}\])\s+([^:]+):\s?(.*)$/;

export function parseTranscriptLines(transcript: string): TranscriptLine[] {
  const lines: TranscriptLine[] = [];
  for (const line of transcript.split("\n")) {
    const match = linePattern.exec(line);
    if (match) {
      lines.push({ timestamp: match[1]!, speaker: match[2]!, text: match[3]! });
    }
  }
  return lines;
}

export function timestampToMs(timestamp: string): number {
  const [h, m, s] = timestamp.slice(1, -1).split(":");
  return (
    (Number(h) * 3600 + Number(m) * 60) * 1000 + Math.round(Number(s) * 1000)
  );
}

function wordSpans(text: string): Array<{ word: string; start: number }> {
  return [...text.matchAll(/\S+/g)]
    .map(m => ({
      word: m[0].toLowerCase().replaceAll(/[^\p{L}\p{N}']/gu, ""),
      start: m.index,
    }))
    .filter(w => w.word.length > 0);
}

const anchorLength = 3;
const minMissingWords = 5;
const maxSkippedFinalWords = 2;

/**
 * If `finalText` is a (possibly lightly corrected) prefix of `rawText`,
 * return the raw text that follows it. Returns undefined when the final line
 * is complete, differs only in a few trailing words, or cannot be aligned.
 */
export function findTruncatedTail(
  rawText: string,
  finalText: string,
): string | undefined {
  const raw = wordSpans(rawText);
  const final = wordSpans(finalText).map(w => w.word);

  // Anchor on the last few words of the final line, allowing a corrected
  // final word or two to be skipped.
  for (let skip = 0; skip <= maxSkippedFinalWords; skip++) {
    const end = final.length - skip;
    const anchor = final.slice(end - anchorLength, end);
    if (anchor.length < anchorLength) return undefined;

    for (let index = raw.length - anchorLength; index >= 0; index--) {
      const matches = anchor.every((word, k) => raw[index + k]?.word === word);
      if (!matches) continue;

      const tailStart = index + anchorLength + skip;
      if (raw.length - tailStart < minMissingWords) return undefined;
      return rawText.slice(raw[tailStart]!.start).trim();
    }
  }
  return undefined;
}

const leadingWordCount = 6;

/**
 * True when the first few words of `text` already appear, in order, somewhere
 * in `transcript` (ignoring case and punctuation). Used to skip "missing"
 * tails that are really just grouped into the next line.
 */
export function containsLeadingWords(
  transcript: string,
  text: string,
): boolean {
  const needle = wordSpans(text)
    .slice(0, leadingWordCount)
    .map(w => w.word)
    .join(" ");
  const haystack = ` ${wordSpans(transcript)
    .map(w => w.word)
    .join(" ")} `;
  return needle.length > 0 && haystack.includes(` ${needle} `);
}

/**
 * Rebuild raw lines that share the final transcript's timestamps by joining
 * the raw sentences that start inside each line's time window.
 */
export function groupSentencesByLines(
  sentences: Array<{ start: number; text: string }>,
  lines: TranscriptLine[],
): string[] {
  const starts = lines.map(line => timestampToMs(line.timestamp));
  return lines.map((line, index) => {
    const from = starts[index]!;
    const to = starts[index + 1] ?? Number.POSITIVE_INFINITY;
    const text = sentences
      .filter(s => s.start >= from && s.start < to)
      .map(s => s.text)
      .join(" ");
    return `${line.timestamp} ${line.speaker}: ${text}`;
  });
}
