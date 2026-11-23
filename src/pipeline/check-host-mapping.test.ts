import { describe, expect, test } from "bun:test";
import path from "node:path";
import { addSpeakerLabels } from "../prompts/add-speaker-labels.js";
import type { SpeakerLabels } from "../prompts/speaker-labels.js";
import { checkHostMapping } from "./check-host-mapping.js";

const fixtures = path.join(import.meta.dir, "__fixtures__", "speaker-id");

/**
 * Fixtures are excerpts of committed raw Transcripts (named labels).
 * Turn them back into what identifySpeakers sees: Speaker letters plus the
 * mapping the model returned.
 */
async function loadAsModelInput(name: string): Promise<{
  transcript: string;
  speakers: SpeakerLabels;
}> {
  const named = await Bun.file(path.join(fixtures, name)).text();
  const letters = ["A", "B", "C"];
  const speakers: Record<string, string> = {};
  const letterFor = (speakerName: string): string => {
    const existing = Object.entries(speakers).find(
      ([, value]) => value === speakerName,
    );
    if (existing) return existing[0];
    const label = `Speaker ${letters[Object.keys(speakers).length]}`;
    speakers[label] = speakerName;
    return label;
  };
  // Hosts present take the first letters, McClellan before Beecher
  for (const host of ["Dan McClellan", "Dan Beecher"]) {
    if (named.includes(`] ${host}:`)) letterFor(host);
  }
  const transcript = named.replaceAll(
    /^(\[[^\]]+\]) ([^:]+):/gm,
    (_match, timestamp: string, speakerName: string) =>
      `${timestamp} ${letterFor(speakerName)}:`,
  );
  // Every fixture has a Speaker A and B, so this matches the model schema
  return { transcript, speakers: speakers as SpeakerLabels };
}

describe("checkHostMapping", () => {
  test("swaps the hosts when the intro tagline is in the mapped Beecher's turn (Ep 144 as first processed)", async () => {
    const { transcript, speakers } =
      await loadAsModelInput("ep144-swapped.txt");

    const result = checkHostMapping(transcript, speakers);

    expect(result.swapped).toBe(true);
    expect(result.speakers).toEqual({
      "Speaker A": "Dan Beecher",
      "Speaker B": "Dan McClellan",
    });
    expect(result.flags).toEqual([
      "Swapped Dan McClellan and Dan Beecher: the intro contradicts the model's mapping (tagline in Dan Beecher's turn).",
    ]);
  });

  test("keeps a correct mapping (Ep 144 after the fix)", async () => {
    const { transcript, speakers } =
      await loadAsModelInput("ep144-correct.txt");

    expect(checkHostMapping(transcript, speakers)).toEqual({
      speakers: { "Speaker A": "Dan McClellan", "Speaker B": "Dan Beecher" },
      swapped: false,
      beecherShare: expect.any(Number),
      flags: [],
    });
  });

  test("does not trust a turn holding both hosts' self-introductions (Ep 145 after the fix)", async () => {
    // Beecher's cold-open turn ends "I'm Dan McClellan. And I'm Dan Beecher."
    // A first-name-wins rule would invert this correct mapping.
    const { transcript, speakers } =
      await loadAsModelInput("ep145-correct.txt");

    const result = checkHostMapping(transcript, speakers);

    expect(result.swapped).toBe(false);
    expect(result.flags).toEqual([]);
  });

  test("swaps on separate self-introduction turns when there is no tagline (Ep 8, mapping inverted)", async () => {
    // Ep 8 opens "I'm Dan McLellen." / "And I'm Dan Beecher." in two turns;
    // the excerpt has no tagline line.
    const { transcript } = await loadAsModelInput("ep8-correct.txt");
    const inverted = {
      "Speaker A": "Dan Beecher",
      "Speaker B": "Dan McClellan",
      "Speaker C": "Aaron Higashi",
    };

    const result = checkHostMapping(transcript, inverted);

    expect(result.swapped).toBe(true);
    expect(result.speakers).toEqual({
      "Speaker A": "Dan McClellan",
      "Speaker B": "Dan Beecher",
      "Speaker C": "Aaron Higashi",
    });
  });

  test("flags but keeps the mapping when only the word share is suspect (Ep 145 as first processed, past the intro)", async () => {
    const { transcript, speakers } = await loadAsModelInput(
      "ep145-swapped-no-intro.txt",
    );

    const result = checkHostMapping(transcript, speakers);

    expect(result.swapped).toBe(false);
    expect(result.speakers).toEqual(speakers);
    expect(result.flags).toEqual([
      "Dan Beecher has 79% of host words (Dan McClellan usually has about 70%). Mapping kept; check for swapped hosts.",
    ]);
  });

  test("flags but keeps the mapping when the intro anchors disagree", () => {
    const transcript = [
      "[00:00:10.000] Speaker A: Hey everybody, I'm Dan McClellan.",
      "[00:00:12.000] Speaker B: And this is Data Over Dogma, where we increase public access to the academic study of the Bible.",
      "[00:00:20.000] Speaker A: How are things today, Dan? Today we are going to talk about the divine council in Deuteronomy and the Psalms, and what the evidence tells us.",
    ].join("\n");
    const speakers = {
      "Speaker A": "Dan McClellan",
      "Speaker B": "Dan Beecher",
    };

    const result = checkHostMapping(transcript, speakers);

    expect(result.swapped).toBe(false);
    expect(result.speakers).toEqual(speakers);
    expect(result.flags).toEqual([
      "Intro anchors disagree about which speaker is Dan McClellan. Mapping kept; check by hand.",
    ]);
  });

  test("leaves an Episode without McClellan alone, though Beecher reads the tagline", async () => {
    const { transcript, speakers } = await loadAsModelInput(
      "ethnicity-no-mcclellan.txt",
    );

    expect(checkHostMapping(transcript, speakers)).toEqual({
      speakers: { "Speaker A": "Dan Beecher", "Speaker B": "Aaron Higashi" },
      swapped: false,
      beecherShare: undefined,
      flags: [],
    });
  });

  test("swaps Ep 145 as first processed, from the tagline turn", async () => {
    const { transcript, speakers } =
      await loadAsModelInput("ep145-swapped.txt");

    const result = checkHostMapping(transcript, speakers);

    expect(result.swapped).toBe(true);
    expect(result.speakers).toEqual({
      "Speaker A": "Dan Beecher",
      "Speaker B": "Dan McClellan",
    });
  });

  test("relabels Ep 144 as first processed into the hand-fixed Transcript", async () => {
    const { transcript, speakers } =
      await loadAsModelInput("ep144-swapped.txt");
    const expected = await Bun.file(
      path.join(fixtures, "ep144-correct.txt"),
    ).text();

    const result = checkHostMapping(transcript, speakers);

    expect(addSpeakerLabels(result.speakers, transcript)).toBe(expected);
  });

  test("names every contradicting anchor when it swaps (Ep 85, mapping inverted)", async () => {
    const { transcript } = await loadAsModelInput("ep85-correct.txt");
    const inverted = {
      "Speaker A": "Dan Beecher",
      "Speaker B": "Dan McClellan",
      "Speaker C": "Logan Williams",
    };

    expect(checkHostMapping(transcript, inverted)).toEqual({
      speakers: {
        "Speaker A": "Dan McClellan",
        "Speaker B": "Dan Beecher",
        "Speaker C": "Logan Williams",
      },
      swapped: true,
      beecherShare: expect.any(Number),
      flags: [
        "Swapped Dan McClellan and Dan Beecher: the intro contradicts the model's mapping (2 self-introduction(s) by the other host, tagline in Dan Beecher's turn).",
      ],
    });
  });

  test("still flags a high Beecher share after a swap, without claiming the mapping was kept", () => {
    const transcript = [
      "[00:00:10.000] Speaker A: Hey everybody, I'm Dan Beecher, and this is a long turn from Beecher that goes on and on about many things in the Bible.",
      "[00:00:12.000] Speaker B: Hi.",
    ].join("\n");
    const speakers = {
      "Speaker A": "Dan McClellan",
      "Speaker B": "Dan Beecher",
    };

    const result = checkHostMapping(transcript, speakers);

    expect(result.swapped).toBe(true);
    expect(result.flags).toEqual([
      "Swapped Dan McClellan and Dan Beecher: the intro contradicts the model's mapping (1 self-introduction(s) by the other host).",
      "Dan Beecher has 96% of host words (Dan McClellan usually has about 70%). Check for swapped hosts.",
    ]);
  });
});
