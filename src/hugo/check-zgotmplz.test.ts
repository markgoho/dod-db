import { afterAll, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { checkZgotmplZ } from "./check-zgotmplz.js";

const scratch = await mkdtemp(path.join(tmpdir(), "check-zgotmplz-"));
let cases = 0;

afterAll(async () => {
  await rm(scratch, { recursive: true, force: true });
});

/** Write these files under a fresh output directory and check it. */
async function check(files: Record<string, string>): Promise<string[]> {
  const dir = path.join(scratch, String(cases++));
  for (const [name, text] of Object.entries(files)) {
    await Bun.write(path.join(dir, name), text);
  }
  return checkZgotmplZ(dir);
}

describe("checkZgotmplZ", () => {
  test("passes clean output", async () => {
    expect(
      await check({
        "index.html": `<a href="https://www.biblegateway.com/passage/?search=Gen+1">Gen 1</a>`,
      }),
    ).toEqual([]);
  });

  test("names the page and line of each unsafe URL", async () => {
    expect(
      await check({
        "index.html": "<p>ok</p>",
        "scholarship/univocality/index.html": `<ul>\n<li><a href="#ZgotmplZ">Gen 1</a>\n<li><a href="#ZgotmplZ">Gen 2</a>\n</ul>`,
      }),
    ).toEqual([
      "scholarship/univocality/index.html:2: #ZgotmplZ",
      "scholarship/univocality/index.html:3: #ZgotmplZ",
    ]);
  });

  test("catches the bare marker Hugo emits outside URLs", async () => {
    expect(
      await check({ "a/index.html": `<div style="ZgotmplZ"></div>` }),
    ).toEqual(["a/index.html:1: ZgotmplZ"]);
  });

  test("scans feeds and sitemaps too, not other files", async () => {
    expect(
      await check({
        "index.xml": `<link>#ZgotmplZ</link>`,
        "notes.txt": "ZgotmplZ",
      }),
    ).toEqual(["index.xml:1: #ZgotmplZ"]);
  });

  test("fails when the output directory is missing", async () => {
    expect(await checkZgotmplZ(path.join(scratch, "nope"))).toEqual([
      `no built pages in ${path.join(scratch, "nope")}; build the site first`,
    ]);
  });
});
