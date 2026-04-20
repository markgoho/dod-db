import { describe, expect, test } from "bun:test";
import {
  parseExplicitScriptureReference,
  parseSpokenScriptureReference,
} from "./parse-spoken-scripture-reference.js";

describe("parse-spoken-scripture-reference", () => {
  test("parses apocryphal spoken chapter references", () => {
    expect(parseSpokenScriptureReference("it's 1 Esdras chapter 3")).toBe(
      "1 Esdras 3",
    );
  });

  test("parses explicit apocryphal chapter references", () => {
    expect(
      parseExplicitScriptureReference("today's passage is 1 Esdras chapter 3"),
    ).toBe("1 Esdras 3");
  });
});
