import { describe, expect, test } from "bun:test";
import {
  containsLeadingWords,
  findTruncatedTail,
  groupSentencesByLines,
  parseTranscriptLines,
  timestampToMs,
} from "./repair-transcript-lines.js";

describe("parseTranscriptLines", () => {
  test("parses timestamp, speaker, and text", () => {
    expect(
      parseTranscriptLines(
        "[00:09:57.050] Dan McClellan: Where we have.\n[00:11:09.240] Dan Beecher: Right.\n",
      ),
    ).toEqual([
      {
        timestamp: "[00:09:57.050]",
        speaker: "Dan McClellan",
        text: "Where we have.",
      },
      { timestamp: "[00:11:09.240]", speaker: "Dan Beecher", text: "Right." },
    ]);
  });
});

describe("timestampToMs", () => {
  test("converts a bracketed timestamp to milliseconds", () => {
    expect(timestampToMs("[01:02:03.456]")).toBe(3_723_456);
  });
});

describe("findTruncatedTail", () => {
  const raw =
    "I'm pretty sure we've talked about it on the program Deuteronomy 22, 28 and 29, where we have. Well, actually verse 22 all the way through 29, we've got these laws.";

  test("returns the raw text after the point where the final line stops", () => {
    expect(
      findTruncatedTail(
        raw,
        "I'm pretty sure we've talked about it on the program Deuteronomy 22, 28 and 29, where we have.",
      ),
    ).toBe(
      "Well, actually verse 22 all the way through 29, we've got these laws.",
    );
  });

  test("tolerates corrections to the last words of the final line", () => {
    expect(
      findTruncatedTail(
        "We talk about William Tyndall and the rest. Then we move on to Erasmus and his Greek text.",
        "We talk about William Tyndale and the rest.",
      ),
    ).toBe("Then we move on to Erasmus and his Greek text.");
  });

  test("returns undefined when the final line is complete", () => {
    expect(
      findTruncatedTail(raw, raw.replace("Deuteronomy 22, 28", "Deut 22:28")),
    ).toBeUndefined();
  });

  test("returns undefined when only a few trailing words differ", () => {
    expect(
      findTruncatedTail(
        "That is the whole point, you know, you know.",
        "That is the whole point, you know.",
      ),
    ).toBeUndefined();
  });

  test("returns undefined when the final line cannot be aligned", () => {
    expect(findTruncatedTail(raw, "Something else entirely.")).toBeUndefined();
  });
});

describe("groupSentencesByLines", () => {
  test("joins sentences that start inside each line's time window", () => {
    const lines = parseTranscriptLines(
      "[00:00:01.000] Dan McClellan: A.\n[00:00:10.000] Dan Beecher: B.",
    );
    const sentences = [
      { start: 1000, text: "First." },
      { start: 4000, text: "Second." },
      { start: 10_000, text: "Third." },
      { start: 12_000, text: "Fourth." },
    ];
    expect(groupSentencesByLines(sentences, lines)).toEqual([
      "[00:00:01.000] Dan McClellan: First. Second.",
      "[00:00:10.000] Dan Beecher: Third. Fourth.",
    ]);
  });
});

describe("containsLeadingWords", () => {
  const transcript =
    "[00:13:42.850] Dan Beecher: What is this us?\n[00:13:47.250] Dan McClellan: So this is what's called a cohortative verb in Hebrew.";

  test("finds a tail whose opening words already appear in the transcript", () => {
    expect(
      containsLeadingWords(
        transcript,
        "So this is what's called a cohortative verb in Hebrew.",
      ),
    ).toBe(true);
  });

  test("ignores punctuation and case differences", () => {
    expect(
      containsLeadingWords(
        transcript,
        "so, this is WHAT'S called a cohortative",
      ),
    ).toBe(true);
  });

  test("returns false for text the transcript lost", () => {
    expect(
      containsLeadingWords(
        transcript,
        "Well, actually verse 22 all the way through 29.",
      ),
    ).toBe(false);
  });
});
