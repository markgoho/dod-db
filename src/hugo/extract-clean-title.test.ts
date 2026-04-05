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

  test('removes trailing "w/ Guest" pattern', () => {
    const input = "The Blessing of the Magdalene w/ Elizabeth Schrader Polczer";
    expect(extractCleanTitle(input)).toBe("The Blessing of the Magdalene");
  });

  test('removes trailing "With Guest" after punctuation', () => {
    const input = "John! With Hugo Méndez";
    expect(extractCleanTitle(input)).toBe("John");
  });

  test('removes trailing bare "with Guest" when it looks like a name', () => {
    const input = "God's Wife with Francesca Stavrakopoulou";
    expect(extractCleanTitle(input)).toBe("God's Wife");
  });

  test('removes trailing bare "with Prof. Guest" when it looks like a name', () => {
    const input = "God's Wife with Prof. Francesca Stavrakopoulou";
    expect(extractCleanTitle(input)).toBe("God's Wife");
  });

  test('keeps title words that include "With"', () => {
    const input = "Connecting With Source";
    expect(extractCleanTitle(input)).toBe("Connecting With Source");
  });
});
