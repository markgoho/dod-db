import { describe, expect, test } from "bun:test";
import path from "node:path";
import {
  buildScriptureLinks,
  checkScriptureLinks,
  linkScripture,
} from "./scholarship-scripture-links.js";

const repoRoot = path.resolve(import.meta.dir, "../..");

describe("linkScripture", () => {
  test("links a verse range written with an en dash", () => {
    expect(linkScripture("See Romans 1:26–27.")).toBe(
      'See <a href="https://www.biblegateway.com/passage/?search=Romans%201%3A26-27&amp;version=NRSVUE" class="scripture-reference" target="_blank" rel="noopener noreferrer" title="Read Romans 1:26-27 (NRSVUE)">Romans 1:26–27</a>.',
    );
  });

  test("keeps an abbreviation as written and links the canonical book", () => {
    const html = linkScripture("(e.g., Gen 19:1–11; Lev 18:22)") ?? "";
    expect(html).toContain("search=Genesis%2019%3A1-11");
    expect(html).toContain(">Gen 19:1–11</a>");
    expect(html).toContain(">Lev 18:22</a>");
  });

  test("leaves bare book names plain", () => {
    expect(linkScripture("2 Thessalonians and the book of Joshua")).toBe(
      undefined,
    );
  });

  test("escapes the text around a link", () => {
    expect(linkScripture(`“Q” & <em> 'in' Genesis 1`)).toStartWith(
      "“Q” &amp; &lt;em&gt; &#39;in&#39; <a ",
    );
  });

  test("maps only strings that link something", () => {
    expect(buildScriptureLinks(["No verse here.", "Genesis 2"])).toEqual({
      "Genesis 2": linkScripture("Genesis 2") ?? "",
    });
  });
});

test("the committed map is current", async () => {
  expect(await checkScriptureLinks(repoRoot)).toEqual([]);
});
