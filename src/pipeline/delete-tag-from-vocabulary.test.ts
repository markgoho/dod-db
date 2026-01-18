/**
 * Unit tests for tag vocabulary deletion regex patterns.
 * Tests the regex patterns that match single-line and multi-line tag definitions for deletion.
 */

import { describe, expect, test } from "bun:test";

/**
 * Build regex to find a tag entry (same logic as deleteTagFromVocabulary)
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

describe("tag vocabulary deletion regex patterns", () => {
  test("deletes single-line tag", () => {
    const content = `  { canonical: "Torah", variations: ["Pentateuch"], category: "literature", status: "accepted" },
  { canonical: "David", variations: [], category: "character", status: "accepted" },
`;
    const regex = buildTagRegex("Torah");
    const result = content.replace(regex, "");

    expect(result).not.toContain("Torah");
    expect(result).not.toContain("Pentateuch");
    // Other tags should remain
    expect(result).toContain("David");
  });

  test("deletes multi-line tag with description", () => {
    const content = `  { canonical: "Torah", variations: [], category: "literature", status: "accepted" },
  {
    canonical: "Exodus 28",
    variations: ["Exodus"],
    category: "literature",
    description:
      "Chapter 28 of the Book of Exodus, detailing instructions for priestly garments.",
    status: "proposed",
    addedInEpisode: 74,
  },
  { canonical: "David", variations: [], category: "character", status: "accepted" },
`;
    const regex = buildTagRegex("Exodus 28");
    const result = content.replace(regex, "");

    expect(result).not.toContain("Exodus 28");
    expect(result).not.toContain("priestly garments");
    expect(result).not.toContain("addedInEpisode: 74");
    // Other tags should remain
    expect(result).toContain("Torah");
    expect(result).toContain("David");
  });

  test("deletes only the target tag, not similar names", () => {
    const content = `  { canonical: "Exodus", variations: [], category: "literature", status: "accepted" },
  {
    canonical: "Exodus 28",
    variations: ["Exodus"],
    category: "literature",
    description: "Chapter 28",
    status: "proposed",
  },
`;
    const regex = buildTagRegex("Exodus 28");
    const result = content.replace(regex, "");

    expect(result).not.toContain("Exodus 28");
    expect(result).not.toContain("Chapter 28");
    // The general "Exodus" tag should remain
    expect(result).toContain('canonical: "Exodus"');
  });

  test("preserves array structure after deletion", () => {
    const content = `export const tagVocabulary: TagDefinition[] = [
  { canonical: "Torah", variations: [], category: "literature", status: "accepted" },
  { canonical: "Delete Me", variations: [], category: "theology", status: "proposed" },
  { canonical: "David", variations: [], category: "character", status: "accepted" },
];
`;
    const regex = buildTagRegex("Delete Me");
    const result = content.replace(regex, "");

    expect(result).not.toContain("Delete Me");
    // Array structure should remain valid
    expect(result).toContain("export const tagVocabulary");
    expect(result).toContain("Torah");
    expect(result).toContain("David");
    // Should still have proper array structure
    expect(result).toMatch(/\[\s*{.*Torah.*},\s*{.*David.*},?\s*\]/s);
  });

  test("handles last tag in array", () => {
    const content = `  { canonical: "Torah", variations: [], category: "literature", status: "accepted" },
  { canonical: "Last Tag", variations: [], category: "theology", status: "proposed" },
];
`;
    const regex = buildTagRegex("Last Tag");
    const result = content.replace(regex, "");

    expect(result).not.toContain("Last Tag");
    expect(result).toContain("Torah");
    // Should still have closing bracket
    expect(result).toContain("];");
  });

  test("handles tag with special regex characters", () => {
    const content = `  { canonical: "Question Mark?", variations: [], category: "theology", status: "proposed" },
  { canonical: "David", variations: [], category: "character", status: "accepted" },
`;
    const regex = buildTagRegex("Question Mark?");
    const result = content.replace(regex, "");

    expect(result).not.toContain("Question Mark?");
    expect(result).toContain("David");
  });

  test("regression: deletes multi-line tag that previously failed", () => {
    // This is the exact format that was failing before the fix
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

    // The regex should match
    expect(match).not.toBeNull();
    expect(match?.[0]).toContain("Exodus 28");

    // And deletion should work
    const result = content.replace(regex, "");
    expect(result).toBe("");
  });
});
