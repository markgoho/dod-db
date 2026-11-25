import { describe, expect, test } from "bun:test";
import {
  findTargetHits,
  parseTranscript,
  relatedTerms,
  sweep,
  type EpisodeTerms,
  type Target,
} from "./synthesis-candidates.js";

const transcript = [
  "[00:00:10.000] Dan McClellan: Welcome back.",
  "[00:01:00.000] Dan Beecher: So Tatian made one Gospel out of four.",
  "[00:02:00.000] Dan McClellan: Most scholars date Mark to around 70.",
  "[00:10:00.000] Dan McClellan: Genesis 1 is probably 6th century BCE.",
  "not a transcript line",
  "[00:20:00.000] Dan Beecher: The Deutero-Isaiah stuff again.",
].join("\n");

const lines = parseTranscript(transcript);

const episode: EpisodeTerms = {
  tags: [
    { tag: "Deutero-Isaiah", mentions: 4 },
    { tag: "Tatian", mentions: 1 },
  ],
  scriptures: [{ book: "Genesis", mentions: 2 }],
};

const univocality: Target = {
  kind: "page",
  id: "univocality",
  watch: ["Tatian"],
  related: { books: ["genesis"], tags: [], topics: [] },
};
const isaiah: Target = {
  kind: "entry",
  id: "isaiah-56-66",
  watch: [],
  related: { books: [], tags: ["deutero-isaiah"], topics: [] },
};

describe("synthesis candidates", () => {
  test("keeps file line numbers and skips non-transcript lines", () => {
    expect(lines.map(l => l.line)).toEqual([1, 2, 3, 4, 6]);
  });

  test("related terms need the minimum mention count", () => {
    expect(relatedTerms(univocality, episode)).toEqual([]);
    expect(relatedTerms(univocality, episode, 2)).toEqual(["Genesis"]);
    expect(relatedTerms(isaiah, episode)).toEqual(["Deutero-Isaiah"]);
  });

  test("reports watch and related hits per target", () => {
    expect(findTargetHits(lines, episode, [univocality, isaiah])).toEqual([
      {
        kind: "page",
        id: "univocality",
        hits: [
          {
            line: 2,
            timestamp: "00:01:00",
            speaker: "Dan Beecher",
            via: "watch",
            term: "Tatian",
          },
        ],
      },
      {
        kind: "entry",
        id: "isaiah-56-66",
        hits: [
          {
            line: 6,
            timestamp: "00:20:00",
            speaker: "Dan Beecher",
            via: "related",
            term: "Deutero-Isaiah",
          },
        ],
      },
    ]);
  });

  test("sweeps consensus and date wording, marking lines a target read covers", () => {
    const hits = findTargetHits(lines, episode, [univocality, isaiah]);
    expect(
      sweep(lines, hits).map(({ line, matches, near }) => ({
        line,
        matches,
        near,
      })),
    ).toEqual([
      { line: 3, matches: ["consensus"], near: ["page:univocality"] },
      { line: 4, matches: ["date"], near: [] },
    ]);
  });
});

test("matches watch terms at a word start only", () => {
  const adam: Target = {
    kind: "entry",
    id: "adam",
    watch: ["Adam", "harmoniz"],
  };
  const text = [
    "[00:00:01.000] Dan Beecher: Madam, I'm Adam.",
    "[00:00:02.000] Dan Beecher: No madam here.",
    "[00:00:03.000] Dan McClellan: Tatian harmonized them.",
  ].join("\n");
  const found = findTargetHits(
    parseTranscript(text),
    { tags: [], scriptures: [] },
    [adam],
  );
  expect(found[0]?.hits.map(h => `${h.line}:${h.term}`)).toEqual([
    "1:Adam",
    "3:harmoniz",
  ]);
});
