import { describe, expect, test } from "bun:test";
import path from "node:path";
import {
  buildScriptureLinks,
  checkScriptureLinks,
  linkScripture,
} from "./scholarship-scripture-links.js";

const repoRoot = path.resolve(import.meta.dir, "../..");

/** [linked reference, text shown] for each link in the HTML. */
function linked(html: string): [string, string | undefined][] {
  return [...html.matchAll(/search=([^&]+)&amp;[^>]*>([^<]+)<\/a>/g)].map(
    ([, search, shown]) => [decodeURIComponent(search ?? ""), shown],
  );
}

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

  describe("continuation references carry the book forward", () => {
    test("Book C:V and C:V", () => {
      expect(
        linked(linkScripture("Leviticus 18:22 and 20:13 inspired it.") ?? ""),
      ).toEqual([
        ["Leviticus 18:22", "Leviticus 18:22"],
        ["Leviticus 20:13", "20:13"],
      ]);
    });

    test("Book C:V, C:V", () => {
      expect(linked(linkScripture("Mark 9:44, 9:46 repeat") ?? "")).toEqual([
        ["Mark 9:44", "Mark 9:44"],
        ["Mark 9:46", "9:46"],
      ]);
    });

    test("Book C:V–V and C:V", () => {
      expect(linked(linkScripture("Gen 19:1–11 and 20:2.") ?? "")).toEqual([
        ["Genesis 19:1-11", "Gen 19:1–11"],
        ["Genesis 20:2", "20:2"],
      ]);
    });

    test("Book C:V; C:V; C:V–V chains through a list", () => {
      expect(
        linked(linkScripture("(Lev 18:22; 20:13; 2:1–7) and more") ?? ""),
      ).toEqual([
        ["Leviticus 18:22", "Lev 18:22"],
        ["Leviticus 20:13", "20:13"],
        ["Leviticus 2:1-7", "2:1–7"],
      ]);
    });

    test("a new book in the list takes over", () => {
      expect(linked(linkScripture("Matt 5:3; Luke 6:20; 7:1") ?? "")).toEqual([
        ["Matthew 5:3", "Matt 5:3"],
        ["Luke 6:20", "Luke 6:20"],
        ["Luke 7:1", "7:1"],
      ]);
    });

    test("a bare C:V with no book before it stays plain", () => {
      expect(linkScripture("See 3:16 and 20:13.")).toBe(undefined);
    });

    test("does not carry the book across a sentence or other text", () => {
      expect(
        linked(
          linkScripture("Read John 3:16. 4:2 is later; John 3:16 at 4:00") ??
            "",
        ),
      ).toEqual([
        ["John 3:16", "John 3:16"],
        ["John 3:16", "John 3:16"],
      ]);
    });

    test("does not carry from a bare book name", () => {
      expect(linkScripture("Genesis and 2:4 differ")).toBe(undefined);
    });

    test("leaves a partial verse (6b) plain rather than truncating it", () => {
      expect(linked(linkScripture("Exod 15:34 and 24:6b–8a") ?? "")).toEqual([
        ["Exodus 15:34", "Exod 15:34"],
      ]);
    });
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
