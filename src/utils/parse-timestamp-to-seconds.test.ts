/**
 * Unit tests for parseTimestampToSeconds.
 */

import { describe, expect, test } from "bun:test";
import { parseTimestampToSeconds } from "./parse-timestamp-to-seconds.js";

describe("parseTimestampToSeconds", () => {
  test("parses timestamp without milliseconds", () => {
    expect(parseTimestampToSeconds("00:02:21")).toBe(141);
  });

  test("parses timestamp with milliseconds", () => {
    expect(parseTimestampToSeconds("00:02:21.362")).toBe(141.362);
  });

  test("parses timestamp with hours", () => {
    expect(parseTimestampToSeconds("01:30:45.500")).toBe(5445.5);
  });

  test("parses zero timestamp", () => {
    expect(parseTimestampToSeconds("00:00:00.000")).toBe(0);
  });

  // These tests will FAIL with current implementation
  // They test the regression where bracketed timestamps return 0
  test("parses bracketed timestamp without milliseconds", () => {
    expect(parseTimestampToSeconds("[00:02:21]")).toBe(141);
  });

  test("parses bracketed timestamp with milliseconds", () => {
    expect(parseTimestampToSeconds("[00:02:21.362]")).toBe(141.362);
  });

  test("parses bracketed timestamp from episode 81 chapter-and-verse", () => {
    expect(parseTimestampToSeconds("[00:02:21.362]")).toBe(141.362);
  });

  test("parses bracketed timestamp from episode 81 watch-your-language", () => {
    expect(parseTimestampToSeconds("[00:28:32.598]")).toBe(1712.598);
  });

  test("returns 0 for invalid format", () => {
    expect(parseTimestampToSeconds("invalid")).toBe(0);
  });

  test("returns 0 for empty string", () => {
    expect(parseTimestampToSeconds("")).toBe(0);
  });
});
