import { describe, expect, test } from "bun:test";
import { isScriptureTag } from "../utils/is-scripture-tag.js";
import { buildTagDefinition } from "./add-tag-to-vocabulary.js";

describe("add-tag-to-vocabulary category handling", () => {
  test("still recognizes Esther as a scripture tag by name", () => {
    expect(isScriptureTag("Esther")).toBe(true);
  });

  test("allows category to disambiguate Esther as a character", () => {
    const tag = buildTagDefinition(
      {
        canonical: "Esther",
        variations: ["Queen Esther"],
        category: "character",
        llmVerify: true,
        description:
          "Esther, the Jewish queen of Persia in the Book of Esther who becomes queen and saves the Jews from Haman.",
      },
      "accepted",
    );

    expect(tag).toMatchObject({
      canonical: "Esther",
      category: "character",
      llmVerify: true,
    });
  });

  test("preserves literature tags for scripture titles", () => {
    const tag = buildTagDefinition(
      {
        canonical: "Esther",
        variations: [],
        category: "literature",
      },
      "accepted",
    );

    expect(tag.category).toBe("literature");
    expect(tag.canonical).toBe("Esther");
  });
});
