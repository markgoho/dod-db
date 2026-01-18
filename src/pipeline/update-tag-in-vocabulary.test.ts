/**
 * Unit tests for tag vocabulary regex patterns.
 * Tests the regex patterns that match single-line and multi-line tag definitions.
 */

import { describe, expect, test } from "bun:test";

/**
 * Build regex to find a tag entry (same logic as updateTagInVocabulary)
 */
function buildTagRegex(canonical: string): RegExp {
  const escapedCanonical = canonical.replaceAll(
    /[.*+?^${}()|[\]\\]/g,
    String.raw`\$&`,
  );
  return new RegExp(
    String.raw`\s+\{\s*canonical:\s*['"]${escapedCanonical}['"][\s\S]+?\},?\n`,
    "i",
  );
}

describe("tag vocabulary regex patterns", () => {
  test("matches single-line tag without description", () => {
    const content = `  { canonical: "Torah", variations: ["Pentateuch"], category: "literature", status: "accepted" },\n`;
    const regex = buildTagRegex("Torah");
    const match = content.match(regex);

    expect(match).not.toBeNull();
    expect(match?.[0]).toContain("Torah");
    expect(match?.[0]).toContain("Pentateuch");
  });

  test("matches multi-line tag with description", () => {
    const content = `  {
    canonical: "Exodus 28",
    variations: ["Exodus"],
    category: "literature",
    description:
      "Chapter 28 of the Book of Exodus, detailing instructions for priestly garments.",
    status: "proposed",
    addedInEpisode: 74,
  },
`;
    const regex = buildTagRegex("Exodus 28");
    const match = content.match(regex);

    expect(match).not.toBeNull();
    expect(match?.[0]).toContain("Exodus 28");
    expect(match?.[0]).toContain("priestly garments");
    expect(match?.[0]).toContain("addedInEpisode: 74");
  });

  test("matches tag with llmVerify and description", () => {
    const content = `  { canonical: "David", variations: [], category: "character", llmVerify: true, description: "King David of Israel", status: "accepted" },\n`;
    const regex = buildTagRegex("David");
    const match = content.match(regex);

    expect(match).not.toBeNull();
    expect(match?.[0]).toContain("llmVerify: true");
    expect(match?.[0]).toContain("King David");
  });

  test("does not match similar tag names", () => {
    const content = `  { canonical: "Exodus", variations: [], category: "literature", status: "accepted" },
  { canonical: "Exodus 28", variations: ["Exodus"], category: "literature", description: "Chapter 28", status: "proposed" },
`;
    const regex = buildTagRegex("Exodus 28");
    const match = content.match(regex);

    expect(match).not.toBeNull();
    // Should match "Exodus 28", not "Exodus"
    expect(match?.[0]).toContain("Exodus 28");
    expect(match?.[0]).toContain("Chapter 28");
    // Should not include the "Exodus" line
    expect(match?.[0]).not.toMatch(/canonical: "Exodus",/);
  });

  test("handles case-insensitive matching", () => {
    const content = `  { canonical: "Torah", variations: [], category: "literature", status: "accepted" },\n`;
    const regex = buildTagRegex("torah"); // lowercase
    const match = content.match(regex);

    expect(match).not.toBeNull();
    expect(match?.[0]).toContain("Torah");
  });

  test("matches tag with complex multi-line description", () => {
    const content = `  {
    canonical: "Septuagint",
    variations: ["LXX", "Greek Old Testament"],
    category: "literature",
    description:
      "Ancient Greek translation of Hebrew Bible created in Alexandria. " +
      "Commissioned by Ptolemy II Philadelphus for the Library of Alexandria. " +
      "Name means 'seventy' referring to the legendary 70 (or 72) translators.",
    status: "accepted",
  },
`;
    const regex = buildTagRegex("Septuagint");
    const match = content.match(regex);

    expect(match).not.toBeNull();
    expect(match?.[0]).toContain("Septuagint");
    expect(match?.[0]).toContain("LXX");
    expect(match?.[0]).toContain("Library of Alexandria");
    expect(match?.[0]).toContain("70 (or 72) translators");
  });

  test("matches tag at beginning of array", () => {
    const content = `export const tagVocabulary: TagDefinition[] = [
  { canonical: "Torah", variations: [], category: "literature", status: "accepted" },
  { canonical: "David", variations: [], category: "character", status: "accepted" },
];
`;
    const regex = buildTagRegex("Torah");
    const match = content.match(regex);

    expect(match).not.toBeNull();
    expect(match?.[0]).toContain("Torah");
    // Should not include the "David" line
    expect(match?.[0]).not.toContain("David");
  });

  test("matches tag at end of array", () => {
    const content = `export const tagVocabulary: TagDefinition[] = [
  { canonical: "Torah", variations: [], category: "literature", status: "accepted" },
  { canonical: "David", variations: [], category: "character", status: "accepted" },
];
`;
    const regex = buildTagRegex("David");
    const match = content.match(regex);

    expect(match).not.toBeNull();
    expect(match?.[0]).toContain("David");
    // Should not include the "Torah" line
    expect(match?.[0]).not.toContain("Torah");
  });

  test("matches tag with addedInEpisode field", () => {
    const content = `  {
    canonical: "soul",
    variations: ["souls", "nephesh"],
    category: "theology",
    description:
      "In biblical contexts, the essence of a person that continues to exist after death, sometimes used synonymously with spirit; related to the Hebrew 'nephesh'",
    status: "proposed",
    addedInEpisode: 53,
  },
`;
    const regex = buildTagRegex("soul");
    const match = content.match(regex);

    expect(match).not.toBeNull();
    expect(match?.[0]).toContain("soul");
    expect(match?.[0]).toContain("addedInEpisode: 53");
  });
});
