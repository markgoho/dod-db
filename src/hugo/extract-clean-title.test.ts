/**
 * Unit tests for extractCleanTitle.
 */

import { describe, expect, test } from "bun:test";
import { extractCleanTitle } from "./extract-clean-title.js";

describe("extractCleanTitle", () => {
  test("extracts quoted title", () => {
    const input = 'Episode 1 (April 8, 2023), "In the Beginning"';
    expect(extractCleanTitle(input)).toBe("In the Beginning");
  });

  test("extracts quoted title with colon format", () => {
    const input = 'Episode 10 (June 12, 2023): "Adam and Steve..."';
    expect(extractCleanTitle(input)).toBe("Adam and Steve...");
  });

  test("handles title without quotes", () => {
    const input = "Apostlepalooza!";
    expect(extractCleanTitle(input)).toBe("Apostlepalooza!");
  });

  test('removes "Episode N," prefix', () => {
    const input = "Episode 47, Introducing History Daily";
    expect(extractCleanTitle(input)).toBe("Introducing History Daily");
  });

  test('removes trailing "with Guest" pattern', () => {
    const input =
      "Christian Nationalism Ain't Christian: With Andrew Whitehead";
    expect(extractCleanTitle(input)).toBe(
      "Christian Nationalism Ain't Christian",
    );
  });
});
