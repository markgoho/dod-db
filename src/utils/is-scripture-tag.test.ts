import { describe, expect, test } from "bun:test";
import { isScriptureTag } from "./is-scripture-tag.js";

describe("isScriptureTag", () => {
  test("matches bare Bible book names", () => {
    expect(isScriptureTag("Genesis")).toBe(true);
    expect(isScriptureTag("Luke")).toBe(true);
    expect(isScriptureTag("Romans")).toBe(true);
  });

  test("matches chapter and verse references", () => {
    expect(isScriptureTag("Luke 6")).toBe(true);
    expect(isScriptureTag("Revelation 21:4")).toBe(true);
    expect(isScriptureTag("1 Corinthians 13:4-7")).toBe(true);
  });

  test("matches abbreviations and variants", () => {
    expect(isScriptureTag("Gen")).toBe(true);
    expect(isScriptureTag("Song of Songs")).toBe(true);
    expect(isScriptureTag("First Kings")).toBe(true);
  });

  test("matches prefixed book titles", () => {
    expect(isScriptureTag("Gospel of Matthew")).toBe(true);
    expect(isScriptureTag("Book of Acts")).toBe(true);
  });

  test("ignores non-scripture tags", () => {
    expect(isScriptureTag("Torah")).toBe(false);
    expect(isScriptureTag("Bart Ehrman")).toBe(false);
    expect(isScriptureTag("divine council")).toBe(false);
    expect(isScriptureTag("")).toBe(false);
  });
});
