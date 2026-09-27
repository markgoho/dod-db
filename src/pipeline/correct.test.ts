import {
  afterEach,
  beforeEach,
  describe,
  expect,
  mock,
  spyOn,
  test,
} from "bun:test";

const generateContentMock = mock(
  async (_request: { contents: string }) => ({ text: "" }) as { text: string },
);

mock.module("../ai.js", () => ({
  ai: { models: { generateContent: generateContentMock } },
}));

const { correctTranscript } = await import("./correct.js");

// Two lines fit in each 130-character chunk. "Zork" and "Frob" stand in for
// mistranscriptions so no deterministic correction rule touches them.
const maxLength = 130;
const lines = [
  "[00:00:01.000] Dan McClellan: We talk about zork today.",
  "[00:00:05.000] Dan Beecher: And frob too.",
  "[00:00:09.000] Dan McClellan: Both are fine examples, sort of.",
  "[00:00:14.000] Dan Beecher: Close enough.",
];
const transcript = lines.join("\n");

/** Extract the chunk text that correctTranscript embedded in the prompt. */
function chunkFromPrompt(prompt: string): string {
  const match = /---\n([\s\S]*)\n---/.exec(prompt);
  return match?.[1] ?? "";
}

let logSpy: ReturnType<typeof spyOn>;
let warnSpy: ReturnType<typeof spyOn>;

beforeEach(() => {
  generateContentMock.mockReset();
  logSpy = spyOn(console, "log").mockImplementation(mock(() => {}));
  warnSpy = spyOn(console, "warn").mockImplementation(mock(() => {}));
});

afterEach(() => {
  logSpy.mockRestore();
  warnSpy.mockRestore();
});

describe("correctTranscript", () => {
  test("keeps every line when chunks are returned unchanged", async () => {
    generateContentMock.mockImplementation(async ({ contents }) => ({
      text: chunkFromPrompt(contents),
    }));

    expect(await correctTranscript(transcript, maxLength)).toBe(transcript);
    expect(generateContentMock.mock.calls.length).toBeGreaterThan(1);
  });

  test("joins corrected chunks in order", async () => {
    generateContentMock.mockImplementation(async ({ contents }) => ({
      text: chunkFromPrompt(contents)
        .replace("zork", "Zork")
        .replace("frob", "Frob"),
    }));

    expect(await correctTranscript(transcript, maxLength)).toBe(
      transcript.replace("zork", "Zork").replace("frob", "Frob"),
    );
  });

  test("keeps the uncorrected chunk when the model drops a line", async () => {
    generateContentMock.mockImplementation(async ({ contents }) => {
      const chunk = chunkFromPrompt(contents);
      return {
        text: chunk.includes("zork")
          ? chunk.split("\n")[0]!.replace("zork", "Zork")
          : chunk,
      };
    });

    expect(await correctTranscript(transcript, maxLength)).toBe(transcript);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});
