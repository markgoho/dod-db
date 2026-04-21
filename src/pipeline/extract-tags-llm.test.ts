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
  generateContentMock.mockReset();
  addTagToVocabularyMock.mockReset();
  tagExistsMock.mockReset();
});

describe("extractTagsLlm", () => {
  test("persists miscellaneous tags as proposed suggestions", async () => {
    generateContentMock.mockImplementation(async () => ({
      text: JSON.stringify({
        tags: [
          {
            tag: "Crystal Skull",
            mentions: 4,
            category: "miscellaneous",
            description:
              "A recurring pop-culture artifact discussed in the episode.",
            variations: ["crystal skull"],
          },
        ],
      }),
    }));
    addTagToVocabularyMock.mockImplementation(async () => {});
    tagExistsMock.mockImplementation(() => false);
    const logSpy = spyOn(console, "log").mockImplementation(mock(() => {}));

    const result = await extractTagsLlm(
      "crystal skull crystal skull crystal skull crystal skull",
      [],
      ["miscellaneous"],
      127,
    );

    expect(result).toEqual([{ tag: "Crystal Skull", mentions: 4 }]);
    expect(addTagToVocabularyMock).toHaveBeenCalledWith({
      canonical: "Crystal Skull",
      variations: ["crystal skull"],
      category: "miscellaneous",
      status: "proposed",
      description: "A recurring pop-culture artifact discussed in the episode.",
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
            tag: "Crystal Skull",
            mentions: 4,
            category: "miscellaneous",
            description:
              "A recurring pop-culture artifact discussed in the episode.",
            variations: ["crystal skull"],
          },
        ],
      }),
    }));
    addTagToVocabularyMock.mockImplementation(async () => {});
    tagExistsMock.mockImplementation(() => true);
    const logSpy = spyOn(console, "log").mockImplementation(mock(() => {}));

    const result = await extractTagsLlm(
      "crystal skull crystal skull crystal skull crystal skull",
      [],
      ["miscellaneous"],
    );

    expect(result).toEqual([{ tag: "Crystal Skull", mentions: 4 }]);
    expect(addTagToVocabularyMock).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(
      '    "Crystal Skull" already exists in vocabulary',
    );

    logSpy.mockRestore();
  });

  test("still filters low-mention miscellaneous tags", async () => {
    generateContentMock.mockImplementation(async () => ({
      text: JSON.stringify({
        tags: [
          {
            tag: "Crystal Skull",
            mentions: 2,
            category: "miscellaneous",
            description:
              "A recurring pop-culture artifact discussed in the episode.",
          },
        ],
      }),
    }));
    addTagToVocabularyMock.mockImplementation(async () => {});
    tagExistsMock.mockImplementation(() => false);
    const logSpy = spyOn(console, "log").mockImplementation(mock(() => {}));

    const result = await extractTagsLlm(
      "crystal skull crystal skull",
      [],
      ["miscellaneous"],
    );

    expect(result).toEqual([]);
    expect(addTagToVocabularyMock).not.toHaveBeenCalled();
    expect(logSpy).not.toHaveBeenCalledWith(
      expect.stringContaining("TAGS NEEDING CATEGORIZATION"),
    );

    logSpy.mockRestore();
  });
});
