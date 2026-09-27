import { describe, expect, test } from "bun:test";
import { chunkTranscriptLines } from "./chunk-transcript-lines.js";

const transcript = [
  "[00:00:02.080] Dan McClellan: And a lot of guys look at a married woman.",
  "[00:00:20.000] Dan Beecher: And.",
  "[00:09:57.050] Dan McClellan: Deuteronomy 22, 28 and 29, where we have. Well, actually verse 22 all the way through 29.",
  "[00:11:09.240] Dan Beecher: Right.",
  "",
].join("\n");

describe("chunkTranscriptLines", () => {
  test("rejoining chunks with newlines reproduces the transcript exactly", () => {
    const chunks = chunkTranscriptLines(transcript, 120);
    expect(chunks.join("\n")).toBe(transcript);
  });

  test("never splits a line, even mid-sentence at the size limit", () => {
    const chunks = chunkTranscriptLines(transcript, 120);
    expect(chunks).toEqual([
      "[00:00:02.080] Dan McClellan: And a lot of guys look at a married woman.\n[00:00:20.000] Dan Beecher: And.",
      "[00:09:57.050] Dan McClellan: Deuteronomy 22, 28 and 29, where we have. Well, actually verse 22 all the way through 29.",
      "[00:11:09.240] Dan Beecher: Right.\n",
    ]);
  });

  test("keeps chunks within the size limit", () => {
    for (const chunk of chunkTranscriptLines(transcript, 120)) {
      expect(chunk.length).toBeLessThanOrEqual(120);
    }
  });

  test("puts a line longer than the limit in its own chunk", () => {
    const long = `[00:00:01.000] Dan McClellan: ${"word ".repeat(40).trim()}`;
    const text = `[00:00:00.500] Dan Beecher: Hi.\n${long}\n[00:00:09.000] Dan Beecher: Bye.`;
    expect(chunkTranscriptLines(text, 50)).toEqual([
      "[00:00:00.500] Dan Beecher: Hi.",
      long,
      "[00:00:09.000] Dan Beecher: Bye.",
    ]);
  });

  test("returns one chunk when the transcript fits", () => {
    expect(chunkTranscriptLines(transcript, 10_000)).toEqual([transcript]);
  });

  test("returns no chunks for an empty transcript", () => {
    expect(chunkTranscriptLines("", 100)).toEqual([]);
  });
});
