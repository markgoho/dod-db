import { describe, expect, test } from "bun:test";
import {
  extractPrimaryScriptureCandidate,
  extractScriptureCandidates,
  normalizeScriptureTopicLabel,
} from "./extract-scripture-candidates.js";

describe("extract-scripture-candidates", () => {
  test("extracts repeated scripture candidates in frequency order", () => {
    const transcript = [
      "We're looking at Genesis 1 today.",
      "Genesis 1 matters here.",
      "Compare that with Exodus 3.",
    ].join(" ");

    expect(extractScriptureCandidates(transcript)).toEqual([
      "Genesis 1",
      "Exodus 3",
    ]);
  });

  test("prioritizes cue-adjacent primary scripture candidates", () => {
    const transcript = [
      "Today we're looking at Psalm 23.",
      "We'll compare it with Genesis 1 later.",
    ].join(" ");

    expect(extractPrimaryScriptureCandidate(transcript)).toBe("Psalms 23");
  });

  test("preserves canonical scripture book names in topic labels", () => {
    expect(normalizeScriptureTopicLabel("1 Esdras")).toBe("1 Esdras");
    expect(normalizeScriptureTopicLabel("Book of 1 Esdras")).toBe("1 Esdras");
  });
});
