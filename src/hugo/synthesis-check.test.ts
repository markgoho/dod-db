import { describe, expect, test } from "bun:test";
import { duplicateTopLevelKeys } from "./synthesis-check.js";

describe("duplicateTopLevelKeys", () => {
  test("passes distinct keys, ignoring comments, nested keys and markers", () => {
    const text = `# a: comment\n---\na:\n  title: x\nb:\n  a: nested\n`;
    expect(duplicateTopLevelKeys("f.yaml", text)).toEqual([]);
  });

  test("names a repeated key, quoted or not, with its lines", () => {
    const text = `a:\n  title: x\nb: 1\n"a":\n  title: y\n`;
    expect(duplicateTopLevelKeys("f.yaml", text)).toEqual([
      `f.yaml: source "a" is defined more than once (lines 1, 4); keep one block`,
    ]);
  });
});
