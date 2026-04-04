import { beforeEach, describe, expect, mock, spyOn, test } from "bun:test";

const generateContentMock = mock(async () => ({ text: "" }));
const addTagToVocabularyMock = mock(async () => {});
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

mock.module("./tag-exists.js", () => ({
  tagExists: tagExistsMock,
}));

const { extractTagsLlm } = await import("./extract-tags-llm.js");

beforeEach(() => {
  generateContentMock.mockClear();
  addTagToVocabularyMock.mockClear();
  tagExistsMock.mockClear();
});

describe("extractTagsLlm", () => {
  test("persists miscellaneous tags as proposed suggestions", async () => {
    generateContentMock.mockImplementation(async () => ({
      text: JSON.stringify({
        tags: [
          {
            tag: "Holy Grail",
            mentions: 4,
            category: "miscellaneous",
            description: "A legendary Christian relic discussed in the episode.",
            variations: ["holy grail"],
          },
        ],
      }),
    }));
    addTagToVocabularyMock.mockImplementation(async () => {});
    tagExistsMock.mockImplementation(() => false);
    const logSpy = spyOn(console, "log").mockImplementation(mock(() => {}));

    const result = await extractTagsLlm(
      "holy grail holy grail holy grail holy grail",
      [],
      undefined,
      127,
    );

    expect(result).toEqual([{ tag: "Holy Grail", mentions: 4 }]);
    expect(addTagToVocabularyMock).toHaveBeenCalledWith({
      canonical: "Holy Grail",
      variations: ["holy grail"],
      category: "miscellaneous",
      status: "proposed",
      description: "A legendary Christian relic discussed in the episode.",
      caseSensitive: undefined,
      addedInEpisode: 127,
    });
    expect(logSpy).not.toHaveBeenCalledWith(
      expect.stringContaining("TAGS NEEDING CATEGORIZATION"),
    );

    logSpy.mockRestore();
  });

  test("does not persist duplicate miscellaneous tags", async () => {
    generateContentMock.mockImplementation(async () => ({
      text: JSON.stringify({
        tags: [
          {
            tag: "Holy Grail",
            mentions: 4,
            category: "miscellaneous",
            description: "A legendary Christian relic discussed in the episode.",
          },
        ],
      }),
    }));
    addTagToVocabularyMock.mockImplementation(async () => {});
    tagExistsMock.mockImplementation(() => true);
    const logSpy = spyOn(console, "log").mockImplementation(mock(() => {}));

    const result = await extractTagsLlm(
      "holy grail holy grail holy grail holy grail",
      [],
    );

    expect(result).toEqual([{ tag: "Holy Grail", mentions: 4 }]);
    expect(addTagToVocabularyMock).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(
      '    "Holy Grail" already exists in vocabulary',
    );

    logSpy.mockRestore();
  });

  test("still filters low-mention miscellaneous tags", async () => {
    generateContentMock.mockImplementation(async () => ({
      text: JSON.stringify({
        tags: [
          {
            tag: "Holy Grail",
            mentions: 2,
            category: "miscellaneous",
            description: "A legendary Christian relic discussed in the episode.",
          },
        ],
      }),
    }));
    addTagToVocabularyMock.mockImplementation(async () => {});
    tagExistsMock.mockImplementation(() => false);
    const logSpy = spyOn(console, "log").mockImplementation(mock(() => {}));

    const result = await extractTagsLlm("holy grail holy grail", []);

    expect(result).toEqual([]);
    expect(addTagToVocabularyMock).not.toHaveBeenCalled();
    expect(logSpy).not.toHaveBeenCalledWith(
      expect.stringContaining("TAGS NEEDING CATEGORIZATION"),
    );

    logSpy.mockRestore();
  });
});
