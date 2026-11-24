import { $ } from "bun";
import { afterAll, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { checkQuoteCitations } from "./check-quote-citations.js";

const fixture = path.join(import.meta.dir, "__fixtures__", "quote-citations");
const scratch = await mkdtemp(path.join(tmpdir(), "check-quote-citations-"));
let cases = 0;

afterAll(async () => {
  await rm(scratch, { recursive: true, force: true });
});

interface Quote {
  text: string;
  speaker: string;
  episode: number;
  timestamp: string;
}

/** Check a fixture repo whose one topic page carries these quotes. */
async function check(...quotes: Quote[]): Promise<string[]> {
  const root = path.join(scratch, String(cases++));
  await $`cp -R ${fixture} ${root}`.quiet();
  const items = quotes.map(
    q =>
      `  - text: ${JSON.stringify(q.text)}\n    speaker: ${q.speaker}\n    episode: ${q.episode}\n    timestamp: "${q.timestamp}"`,
  );
  await Bun.write(
    path.join(root, "hugo/content/topics/test/_index.md"),
    `---\ntitle: Test\nquotes:\n${items.join("\n")}\n---\n\nBody.\n`,
  );
  return checkQuoteCitations(root);
}

const at = "hugo/content/topics/test/_index.md";

describe("checkQuoteCitations", () => {
  test("a quote that matches its Transcript line passes", async () => {
    expect(
      await check({
        text: "The Hebrew Bible is not a monotheistic text.",
        speaker: "Dan McClellan",
        episode: 1,
        timestamp: "00:00:05.250",
      }),
    ).toEqual([]);
  });

  test("fails when the cited Episode has no Transcript", async () => {
    expect(
      await check({
        text: "Anything.",
        speaker: "Dan McClellan",
        episode: 99,
        timestamp: "00:00:05.250",
      }),
    ).toEqual([`${at} quote 1: Episode 99 has no Transcript`]);
  });

  test("fails when no Transcript line starts at the timestamp, naming the nearest and where the text is", async () => {
    expect(
      await check({
        text: "The Hebrew Bible is not a monotheistic text.",
        speaker: "Dan McClellan",
        episode: 1,
        timestamp: "00:00:11.000",
      }),
    ).toEqual([
      `${at} quote 1: Episode 1 has no line at 00:00:11.000 (nearest 00:00:12.000; text found at 00:00:05.250)`,
    ]);
  });

  test("fails when the timestamp is not HH:MM:SS.mmm", async () => {
    expect(
      await check({
        text: "The Hebrew Bible is not a monotheistic text.",
        speaker: "Dan McClellan",
        episode: 1,
        timestamp: "00:00:5.25",
      }),
    ).toEqual([
      `${at} quote 1: timestamp 00:00:5.25 is not HH:MM:SS.mmm (text found at 00:00:05.250)`,
    ]);
  });

  test("ignores case, punctuation and accents, and runs on into the next line", async () => {
    expect(
      await check({
        text: "and deuteronomy borrows from the neo assyrian vassal treaties — which is a fascinating bit",
        speaker: "Dan McClellan",
        episode: 1,
        timestamp: "00:00:13.120",
      }),
    ).toEqual([]);
  });

  test("matches each part of a quote cut with an ellipsis or a bracketed insertion", async () => {
    expect(
      await check({
        text: "[The Bible] is not a monotheistic text… a polytheistic anthology",
        speaker: "Dan McClellan",
        episode: 1,
        timestamp: "00:00:05.250",
      }),
    ).toEqual([]);
  });

  test("fails when the text is elsewhere in the Episode, naming where", async () => {
    expect(
      await check({
        text: "which is a fascinating bit of history",
        speaker: "Dan McClellan",
        episode: 1,
        timestamp: "00:00:01.500",
      }),
    ).toEqual([
      `${at} quote 1: text not at Episode 1 00:00:01.500 (found at 00:00:18.400)`,
    ]);
  });

  test("fails when the text is in another Episode, naming it", async () => {
    expect(
      await check({
        text: "Goddesses were absolutely part and parcel",
        speaker: "Francesca Stavrakopoulou",
        episode: 1,
        timestamp: "00:00:05.250",
      }),
    ).toEqual([
      `${at} quote 1: text not at Episode 1 00:00:05.250 (found in Episode 2 at 00:01:04.330)`,
    ]);
  });

  test("fails when the text is in no Transcript", async () => {
    expect(
      await check({
        text: "Words nobody said.",
        speaker: "Dan McClellan",
        episode: 1,
        timestamp: "00:00:05.250",
      }),
    ).toEqual([
      `${at} quote 1: text not at Episode 1 00:00:05.250 (not found in any Transcript)`,
    ]);
  });

  test("cites an older Transcript line without milliseconds as .000", async () => {
    expect(
      await check({
        text: "renders them as dot zero zero zero",
        speaker: "Dan McClellan",
        episode: 3,
        timestamp: "00:00:09.000",
      }),
    ).toEqual([]);
  });

  test("reads an indented Transcript line, as the Episode Page does", async () => {
    expect(
      await check({
        text: "Some correction passes indent a line",
        speaker: "Dan Beecher",
        episode: 3,
        timestamp: "00:00:15.000",
      }),
    ).toEqual([]);
  });

  test("lets a quote start a line early, run on, and skip another Speaker's interjection", async () => {
    expect(
      await check({
        text: "The word Antichrist occurs, I think, four times. All of them in 1 John or 2 John. And they are used to describe anyone who is opposed to Christ.",
        speaker: "Dan McClellan",
        episode: 2,
        timestamp: "00:01:15.200",
      }),
    ).toEqual([]);
  });

  test("tolerates a quote cleaned of fillers and false starts", async () => {
    expect(
      await check({
        text: "So a lot of scholars will suggest that the reference is a late addition to the text.",
        speaker: "Dan McClellan",
        episode: 3,
        timestamp: "00:00:20.000",
      }),
    ).toEqual([]);
  });

  test("tolerates a filler right after the quote's first word", async () => {
    expect(
      await check({
        text: "So a lot of",
        speaker: "Dan McClellan",
        episode: 3,
        timestamp: "00:00:20.000",
      }),
    ).toEqual([]);
  });

  test("fails when the quote rewords the Transcript", async () => {
    expect(
      await check({
        text: "Many scholars think the reference was added to the text later.",
        speaker: "Dan McClellan",
        episode: 3,
        timestamp: "00:00:20.000",
      }),
    ).toEqual([
      `${at} quote 1: text not at Episode 3 00:00:20.000 (not found in any Transcript)`,
    ]);
  });

  test("fails when the line that says the text has another Speaker", async () => {
    expect(
      await check({
        text: "Wow, okay.",
        speaker: "Dan McClellan",
        episode: 1,
        timestamp: "00:00:05.250",
      }),
    ).toEqual([
      `${at} quote 1: cited Dan McClellan, but Episode 1 00:00:12.000 is Dan Beecher`,
    ]);
  });

  test("fails when the cited line has another Speaker, even if the next line says the text", async () => {
    expect(
      await check({
        text: "Goddesses were absolutely part and parcel of ancient YHWH religion.",
        speaker: "Francesca Stavrakopoulou",
        episode: 2,
        timestamp: "00:01:00.000",
      }),
    ).toEqual([
      `${at} quote 1: cited Francesca Stavrakopoulou, but Episode 2 00:01:00.000 is Dan Beecher (text starts at 00:01:04.330)`,
    ]);
  });

  test("checks quotes on tag and book pages and Scholarship Trigger Claims", async () => {
    const root = path.join(scratch, "kinds");
    await $`cp -R ${fixture} ${root}`.quiet();
    const wrong = `  - text: "Wow, okay."\n    speaker: Dan McClellan\n    episode: 1\n    timestamp: "00:00:12.000"\n`;
    await Bun.write(
      path.join(root, "hugo/content/tags/t/_index.md"),
      `---\nquotes:\n${wrong}---\n`,
    );
    await Bun.write(
      path.join(root, "hugo/content/books/b/_index.md"),
      `---\nquotes:\n${wrong}---\n`,
    );
    await Bun.write(
      path.join(root, "hugo/data/scholarship/triggers/s.yaml"),
      wrong.replaceAll(/^  /gm, ""),
    );
    const said =
      "cited Dan McClellan, but Episode 1 00:00:12.000 is Dan Beecher";
    expect(await checkQuoteCitations(root)).toEqual([
      `hugo/content/books/b/_index.md quote 1: ${said}`,
      `hugo/content/tags/t/_index.md quote 1: ${said}`,
      `hugo/data/scholarship/triggers/s.yaml quote 1: ${said}`,
    ]);
  });
});
