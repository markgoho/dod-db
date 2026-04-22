/**
 * Unit tests for scripture reference wrapping.
 */

import { describe, expect, test } from "bun:test";
import { buildBibleGatewayUrl } from "./build-bible-gateway-url.js";
import { findScriptureMatches } from "./find-scripture-matches.js";
import { wrapScriptureReferences } from "./wrap-scripture-references-function.js";

describe("buildBibleGatewayUrl", () => {
  test("builds URL for simple reference", () => {
    const url = buildBibleGatewayUrl("Genesis 1:1");
    expect(url).toBe(
      "https://www.biblegateway.com/passage/?search=Genesis%201%3A1&version=NRSVUE",
    );
  });

  test("builds URL for verse range", () => {
    const url = buildBibleGatewayUrl("Genesis 1:1-10");
    expect(url).toBe(
      "https://www.biblegateway.com/passage/?search=Genesis%201%3A1-10&version=NRSVUE",
    );
  });

  test("builds URL for chapter only", () => {
    const url = buildBibleGatewayUrl("Romans 8");
    expect(url).toBe(
      "https://www.biblegateway.com/passage/?search=Romans%208&version=NRSVUE",
    );
  });

  test("builds URL for numbered book", () => {
    const url = buildBibleGatewayUrl("1 Corinthians 13:4-7");
    expect(url).toBe(
      "https://www.biblegateway.com/passage/?search=1%20Corinthians%2013%3A4-7&version=NRSVUE",
    );
  });
});

describe("findScriptureMatches", () => {
  test("finds simple reference", () => {
    const text = "In Genesis 1:1, we read about creation.";
    const matches = findScriptureMatches(text);

    expect(matches).toHaveLength(1);
    const match = matches[0];
    expect(match).toBeDefined();
    expect(match?.originalText).toBe("Genesis 1:1");
    expect(match?.normalizedReference).toBe("Genesis 1:1");
    expect(match?.book).toBe("Genesis");
    expect(match?.start).toBe(3);
    expect(match?.end).toBe(14);
  });

  test("finds abbreviation with period", () => {
    const text = "See Gen. 1:1 for the creation account.";
    const matches = findScriptureMatches(text);

    expect(matches).toHaveLength(1);
    const match = matches[0];
    expect(match).toBeDefined();
    expect(match?.originalText).toBe("Gen. 1:1");
    expect(match?.normalizedReference).toBe("Genesis 1:1");
    expect(match?.book).toBe("Genesis");
  });

  test("finds abbreviation without period", () => {
    const text = "See Gen 1:1 for details.";
    const matches = findScriptureMatches(text);

    expect(matches).toHaveLength(1);
    const match = matches[0];
    expect(match).toBeDefined();
    expect(match?.originalText).toBe("Gen 1:1");
    expect(match?.normalizedReference).toBe("Genesis 1:1");
  });

  test("finds verse range", () => {
    const text = "Read Genesis 1:1-10 for the full passage.";
    const matches = findScriptureMatches(text);

    expect(matches).toHaveLength(1);
    const match = matches[0];
    expect(match).toBeDefined();
    expect(match?.originalText).toBe("Genesis 1:1-10");
    expect(match?.normalizedReference).toBe("Genesis 1:1-10");
  });

  test("finds chapter-only reference", () => {
    const text = "Paul discusses this in Romans 8.";
    const matches = findScriptureMatches(text);

    expect(matches).toHaveLength(1);
    const match = matches[0];
    expect(match).toBeDefined();
    expect(match?.originalText).toBe("Romans 8");
    expect(match?.normalizedReference).toBe("Romans 8");
  });

  test("finds numbered book", () => {
    const text = "The famous love chapter is 1 Corinthians 13:4-7.";
    const matches = findScriptureMatches(text);

    expect(matches).toHaveLength(1);
    const match = matches[0];
    expect(match).toBeDefined();
    expect(match?.originalText).toBe("1 Corinthians 13:4-7");
    expect(match?.normalizedReference).toBe("1 Corinthians 13:4-7");
    expect(match?.book).toBe("1 Corinthians");
  });

  test("finds whole-book reference", () => {
    const text = "Book of Esther is what we're reading today.";
    const matches = findScriptureMatches(text);

    expect(matches).toHaveLength(1);
    const match = matches[0];
    expect(match).toBeDefined();
    expect(match?.originalText).toBe("Book of Esther");
    expect(match?.normalizedReference).toBe("Esther");
    expect(match?.book).toBe("Esther");
  });

  test("finds variant forms of numbered books", () => {
    const text = "See First Corinthians 13:1 for context.";
    const matches = findScriptureMatches(text);

    expect(matches).toHaveLength(1);
    const match = matches[0];
    expect(match).toBeDefined();
    expect(match?.normalizedReference).toBe("1 Corinthians 13:1");
    expect(match?.book).toBe("1 Corinthians");
  });

  test("finds multiple non-overlapping references", () => {
    const text = "Compare Genesis 1:1 with John 1:1.";
    const matches = findScriptureMatches(text);

    expect(matches).toHaveLength(2);
    expect(matches[0]?.normalizedReference).toBe("Genesis 1:1");
    expect(matches[1]?.normalizedReference).toBe("John 1:1");
  });

  test("resolves overlap keeping longest match", () => {
    // "1 Corinthians" and "Corinthians" could both match, but 1 Corinthians is longer
    const text = "Read 1 Corinthians 13:1 for the context.";
    const matches = findScriptureMatches(text);

    // Should only have one match (1 Corinthians, not also Corinthians)
    expect(matches).toHaveLength(1);
    expect(matches[0]?.book).toBe("1 Corinthians");
  });

  test("returns empty array for text with no matches", () => {
    const text = "This text contains no scripture references.";
    const matches = findScriptureMatches(text);

    expect(matches).toHaveLength(0);
  });

  test("handles reference at beginning of text", () => {
    const text = "Genesis 1:1 is the first verse.";
    const matches = findScriptureMatches(text);

    expect(matches).toHaveLength(1);
    expect(matches[0]?.start).toBe(0);
  });

  test("handles reference at end of text", () => {
    const text = "The story is in Genesis 1:1";
    const matches = findScriptureMatches(text);

    expect(matches).toHaveLength(1);
    const match = matches[0];
    expect(match).toBeDefined();
    expect(match?.end).toBe(text.length);
  });

  test("finds Psalm variant", () => {
    const text = "Psalm 23:1 is a well-known verse.";
    const matches = findScriptureMatches(text);

    expect(matches).toHaveLength(1);
    expect(matches[0]?.book).toBe("Psalms");
    expect(matches[0]?.normalizedReference).toBe("Psalms 23:1");
  });

  test("finds Song of Solomon variants", () => {
    const text = "Song of Songs 1:1 is beautiful poetry.";
    const matches = findScriptureMatches(text);

    expect(matches).toHaveLength(1);
    expect(matches[0]?.book).toBe("Song of Solomon");
    expect(matches[0]?.normalizedReference).toBe("Song of Solomon 1:1");
  });

  test("skips lowercase matches to avoid false positives", () => {
    // "is 1" should NOT match Isaiah when lowercase
    const text = "The chapter is 1 of the best.";
    const matches = findScriptureMatches(text);

    expect(matches).toHaveLength(0);
  });

  test("matches uppercase abbreviation", () => {
    // "Is 1" SHOULD match Isaiah when capitalized
    const text = "See Is 1:1 for the prophecy.";
    const matches = findScriptureMatches(text);

    expect(matches).toHaveLength(1);
    expect(matches[0]?.book).toBe("Isaiah");
    expect(matches[0]?.normalizedReference).toBe("Isaiah 1:1");
  });

  test("finds spoken 'Book chapter N' form", () => {
    const text = "Open your books to Acts chapter 7.";
    const matches = findScriptureMatches(text);

    expect(matches).toHaveLength(1);
    expect(matches[0]?.originalText).toBe("Acts chapter 7");
    expect(matches[0]?.normalizedReference).toBe("Acts 7");
  });

  test("finds spoken 'Book chapter N verse V' form", () => {
    const text = "We're looking at Acts chapter 7 verse 43.";
    const matches = findScriptureMatches(text);

    expect(matches).toHaveLength(1);
    expect(matches[0]?.originalText).toBe("Acts chapter 7 verse 43");
    expect(matches[0]?.normalizedReference).toBe("Acts 7:43");
  });

  test("finds spoken 'Book chapter N, verses M-N' form", () => {
    const text = "Turn to Acts chapter 7, verses 42-43 please.";
    const matches = findScriptureMatches(text);

    expect(matches).toHaveLength(1);
    expect(matches[0]?.normalizedReference).toBe("Acts 7:42-43");
  });

  test("finds spoken range with 'to'", () => {
    const text = "Read Genesis chapter 1 verses 1 to 10.";
    const matches = findScriptureMatches(text);

    expect(matches).toHaveLength(1);
    expect(matches[0]?.normalizedReference).toBe("Genesis 1:1-10");
  });
});

describe("wrapScriptureReferences", () => {
  test("wraps simple reference with shortcode", () => {
    const text = "In Genesis 1:1, we read about creation.";
    const result = wrapScriptureReferences(text);

    expect(result).toBe(
      'In {{< scripture ref="Genesis 1:1" >}}, we read about creation.',
    );
  });

  test("normalizes abbreviations to canonical form", () => {
    const text = "See Gen. 1:1 for details.";
    const result = wrapScriptureReferences(text);

    // Abbreviations are normalized to canonical form in shortcode
    expect(result).toBe('See {{< scripture ref="Genesis 1:1" >}} for details.');
  });

  test("wraps multiple references independently", () => {
    const text = "Compare Genesis 1:1 with John 1:1.";
    const result = wrapScriptureReferences(text);

    expect(result).toContain('{{< scripture ref="Genesis 1:1" >}}');
    expect(result).toContain('{{< scripture ref="John 1:1" >}}');
  });

  test("returns original text when no matches", () => {
    const text = "This text contains no scripture references.";
    const result = wrapScriptureReferences(text);

    expect(result).toBe(text);
  });

  test("preserves surrounding text", () => {
    const text = "Before Genesis 1:1 and after.";
    const result = wrapScriptureReferences(text);

    expect(result).toBe(
      'Before {{< scripture ref="Genesis 1:1" >}} and after.',
    );
  });

  test("handles reference at beginning of text", () => {
    const text = "Genesis 1:1 is the first verse.";
    const result = wrapScriptureReferences(text);

    expect(result).toBe(
      '{{< scripture ref="Genesis 1:1" >}} is the first verse.',
    );
  });

  test("handles reference at end of text", () => {
    const text = "The story is in Genesis 1:1";
    const result = wrapScriptureReferences(text);

    expect(result).toBe('The story is in {{< scripture ref="Genesis 1:1" >}}');
  });

  test("wraps verse range correctly", () => {
    const text = "Read Genesis 1:1-10 for context.";
    const result = wrapScriptureReferences(text);

    expect(result).toBe(
      'Read {{< scripture ref="Genesis 1:1-10" >}} for context.',
    );
  });

  test("wraps chapter-only reference", () => {
    const text = "See Romans 8 for encouragement.";
    const result = wrapScriptureReferences(text);

    expect(result).toBe(
      'See {{< scripture ref="Romans 8" >}} for encouragement.',
    );
  });

  test("normalizes numbered book reference", () => {
    const text = "1 Corinthians 13:4-7 describes love.";
    const result = wrapScriptureReferences(text);

    expect(result).toBe(
      '{{< scripture ref="1 Corinthians 13:4-7" >}} describes love.',
    );
  });

  test("wraps whole-book reference with canonical book ref", () => {
    const text = "Book of Esther is what we're reading today.";
    const result = wrapScriptureReferences(text);

    expect(result).toBe(
      '{{< scripture ref="Esther" display="Book of Esther" >}} is what we\'re reading today.',
    );
  });
});
