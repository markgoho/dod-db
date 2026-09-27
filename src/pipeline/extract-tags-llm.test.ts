import { beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import type { TagDefinition } from "../config/tag-vocabulary.js";

const generateContentMock = mock(async () => ({ text: "" }));
const addTagToVocabularyMock = mock(async () => {});
const updateTagInVocabularyMock = mock(async () => {});
const tagExistsMock = mock(() => false);

mock.module("../ai.js", () => ({
  ai: {
    models: {
      generateContent: generateContentMock,
    },
  },
}));

mock.module("./add-tag-to-vocabulary.js", () => ({
  addTagToVocabulary: addTagToVocabularyMock,
}));

mock.module("./update-tag-in-vocabulary.js", () => ({
  updateTagInVocabulary: updateTagInVocabularyMock,
}));

mock.module("./tag-exists.js", () => ({
  tagExists: tagExistsMock,
}));

const { countMentions, dedupeVariations, extractTagsLlm } =
  await import("./extract-tags-llm.js");

const vocabulary: TagDefinition[] = [
  {
    canonical: "Septuagint",
    variations: ["LXX"],
    category: "literature",
    status: "accepted",
  },
  {
    canonical: "Textual criticism",
    variations: ["text criticism"],
    category: "scholarship",
    status: "proposed",
    addedInEpisode: 174,
  },
  {
    canonical: "Patrons",
    variations: ["Patreon"],
    category: "miscellaneous",
    status: "rejected",
  },
];

function llmReturns(tags: object[]): void {
  generateContentMock.mockImplementation(async () => ({
    text: JSON.stringify({ tags }),
  }));
}

const bridePrice = {
  tag: "Bride Price",
  category: "theology",
  description: "Payment to the bride's father in ancient Israelite law.",
  reason: "Evidence that women were treated as property.",
  variations: ["mohar"],
};

beforeEach(() => {
  generateContentMock.mockReset();
  addTagToVocabularyMock.mockReset();
  updateTagInVocabularyMock.mockReset();
  tagExistsMock.mockReset();
  tagExistsMock.mockImplementation(() => false);
  spyOn(console, "log").mockImplementation(mock(() => {}));
});

describe("countMentions", () => {
  test("counts variations without double-counting overlaps", () => {
    expect(
      countMentions("The help meet, a helpmeet, the Help Meet idea", [
        "help meet",
        "helpmeet",
        "help",
      ]),
    ).toBe(3);
  });

  test("respects case sensitivity", () => {
    expect(countMentions("Lot fled. A lot of people.", ["Lot"], true)).toBe(1);
  });
});

describe("dedupeVariations", () => {
  test("drops case-insensitive repeats of the canonical and of each other", () => {
    expect(
      dedupeVariations("Church Fathers", [
        "Church fathers",
        "church fathers",
        "patristic authors",
        " Patristic Authors ",
        "patristic",
        "",
      ]),
    ).toEqual(["patristic authors", "patristic"]);
  });
});

describe("extractTagsLlm", () => {
  test("proposes a single-mention subject with a computed mention count", async () => {
    llmReturns([bridePrice]);

    const result = await extractTagsLlm(
      "The father received the bride price.",
      [],
      undefined,
      179,
      vocabulary,
    );

    expect(result).toEqual([{ tag: "Bride Price", mentions: 1 }]);
    expect(addTagToVocabularyMock).toHaveBeenCalledWith({
      canonical: "Bride Price",
      variations: ["mohar"],
      category: "theology",
      status: "proposed",
      description: "Payment to the bride's father in ancient Israelite law.",
      caseSensitive: undefined,
      addedInEpisode: 179,
      episodes: [179],
    });
  });

  test("drops a suggestion that does not appear verbatim", async () => {
    llmReturns([bridePrice]);

    const result = await extractTagsLlm(
      "Nothing relevant here.",
      [],
      undefined,
      179,
      vocabulary,
    );

    expect(result).toEqual([]);
    expect(addTagToVocabularyMock).not.toHaveBeenCalled();
  });

  test("drops accepted and rejected terms, including by variation", async () => {
    llmReturns([
      { ...bridePrice, tag: "LXX", variations: [] },
      { ...bridePrice, tag: "Patreon", variations: [] },
    ]);

    const result = await extractTagsLlm(
      "The LXX differs. Join us on Patreon.",
      [],
      undefined,
      179,
      vocabulary,
    );

    expect(result).toEqual([]);
    expect(addTagToVocabularyMock).not.toHaveBeenCalled();
  });

  test("records recurrence of a pending proposal instead of re-adding it", async () => {
    llmReturns([{ ...bridePrice, tag: "Textual Criticism", variations: [] }]);

    const result = await extractTagsLlm(
      "Textual criticism tells us about scribes.",
      [],
      undefined,
      179,
      vocabulary,
    );

    expect(result).toEqual([]);
    expect(addTagToVocabularyMock).not.toHaveBeenCalled();
    expect(updateTagInVocabularyMock).toHaveBeenCalledWith(
      "Textual criticism",
      {
        episodes: [174, 179],
      },
    );
  });

  test("respects the category restriction", async () => {
    llmReturns([bridePrice]);

    const result = await extractTagsLlm(
      "The bride price.",
      [],
      ["person"],
      179,
      vocabulary,
    );

    expect(result).toEqual([]);
    expect(addTagToVocabularyMock).not.toHaveBeenCalled();
  });
});
