import { describe, expect, test } from "bun:test";
import {
  getAmbiguousBooks,
  getBookByAnyName,
  getBookByCanonical,
  getNewTestamentBooks,
  getOldTestamentBooks,
  scriptureBooks,
} from "./scripture-books.js";

describe("scripture-books", () => {
  describe("canonical book count", () => {
    test("contains exactly 66 books", () => {
      expect(scriptureBooks.length).toBe(66);
    });

    test("contains 39 Old Testament books", () => {
      const otBooks = getOldTestamentBooks();
      expect(otBooks.length).toBe(39);
    });

    test("contains 27 New Testament books", () => {
      const ntBooks = getNewTestamentBooks();
      expect(ntBooks.length).toBe(27);
    });
  });

  describe("getBookByCanonical", () => {
    test("finds Genesis by canonical name", () => {
      const book = getBookByCanonical("Genesis");
      expect(book).toBeDefined();
      expect(book?.canonical).toBe("Genesis");
      expect(book?.testament).toBe("old");
    });

    test("finds Revelation by canonical name", () => {
      const book = getBookByCanonical("Revelation");
      expect(book).toBeDefined();
      expect(book?.canonical).toBe("Revelation");
      expect(book?.testament).toBe("new");
    });

    test("is case-insensitive", () => {
      const book = getBookByCanonical("GENESIS");
      expect(book).toBeDefined();
      expect(book?.canonical).toBe("Genesis");
    });

    test("returns undefined for non-existent book", () => {
      const book = getBookByCanonical("Apocrypha");
      expect(book).toBeUndefined();
    });
  });

  describe("getBookByAnyName", () => {
    test("finds book by canonical name", () => {
      const book = getBookByAnyName("Genesis");
      expect(book?.canonical).toBe("Genesis");
    });

    test("finds book by abbreviation", () => {
      const book = getBookByAnyName("Gen");
      expect(book?.canonical).toBe("Genesis");
    });

    test("finds book by variant", () => {
      const book = getBookByAnyName("Song of Songs");
      expect(book?.canonical).toBe("Song of Solomon");
    });

    test("finds Matthew by abbreviation Matt", () => {
      const book = getBookByAnyName("Matt");
      expect(book?.canonical).toBe("Matthew");
    });

    test("finds numbered books", () => {
      const book1 = getBookByAnyName("1 Samuel");
      expect(book1?.canonical).toBe("1 Samuel");

      const book2 = getBookByAnyName("1 Sam");
      expect(book2?.canonical).toBe("1 Samuel");

      const book3 = getBookByAnyName("First Samuel");
      expect(book3?.canonical).toBe("1 Samuel");

      const book4 = getBookByAnyName("I Samuel");
      expect(book4?.canonical).toBe("1 Samuel");
    });

    test("is case-insensitive", () => {
      const book = getBookByAnyName("gen");
      expect(book?.canonical).toBe("Genesis");
    });
  });

  describe("ambiguous books", () => {
    test("marks Job as requiring LLM verification", () => {
      const book = getBookByCanonical("Job");
      expect(book).toBeDefined();
      expect("llmVerify" in book! && book.llmVerify).toBe(true);
    });

    test("marks Mark as requiring LLM verification", () => {
      const book = getBookByCanonical("Mark");
      expect(book).toBeDefined();
      expect("llmVerify" in book! && book.llmVerify).toBe(true);
    });

    test("marks Acts as requiring LLM verification", () => {
      const book = getBookByCanonical("Acts");
      expect(book).toBeDefined();
      expect("llmVerify" in book! && book.llmVerify).toBe(true);
    });

    test("marks Ruth as requiring LLM verification", () => {
      const book = getBookByCanonical("Ruth");
      expect(book).toBeDefined();
      expect("llmVerify" in book! && book.llmVerify).toBe(true);
    });

    test("marks James as requiring LLM verification", () => {
      const book = getBookByCanonical("James");
      expect(book).toBeDefined();
      expect("llmVerify" in book! && book.llmVerify).toBe(true);
    });

    test("marks Judges as requiring LLM verification", () => {
      const book = getBookByCanonical("Judges");
      expect(book).toBeDefined();
      expect("llmVerify" in book! && book.llmVerify).toBe(true);
    });

    test("getAmbiguousBooks returns all books with llmVerify", () => {
      const ambiguousBooks = getAmbiguousBooks();
      expect(ambiguousBooks.length).toBeGreaterThanOrEqual(6);

      const canonicalNames = ambiguousBooks.map(book => book.canonical);
      expect(canonicalNames).toContain("Job");
      expect(canonicalNames).toContain("Mark");
      expect(canonicalNames).toContain("Acts");
      expect(canonicalNames).toContain("Ruth");
      expect(canonicalNames).toContain("James");
      expect(canonicalNames).toContain("Judges");
    });

    test("all ambiguous books have descriptions", () => {
      const ambiguousBooks = getAmbiguousBooks();
      for (const book of ambiguousBooks) {
        if ("llmVerify" in book && book.llmVerify) {
          expect(book.description).toBeDefined();
          expect(book.description.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("non-ambiguous books", () => {
    test("Genesis does not require LLM verification", () => {
      const book = getBookByCanonical("Genesis");
      expect(book).toBeDefined();
      expect("llmVerify" in book! && book.llmVerify).toBeFalsy();
    });

    test("Matthew does not require LLM verification", () => {
      const book = getBookByCanonical("Matthew");
      expect(book).toBeDefined();
      expect("llmVerify" in book! && book.llmVerify).toBeFalsy();
    });

    test("Revelation does not require LLM verification", () => {
      const book = getBookByCanonical("Revelation");
      expect(book).toBeDefined();
      expect("llmVerify" in book! && book.llmVerify).toBeFalsy();
    });
  });

  describe("book structure", () => {
    test("all books have required fields", () => {
      for (const book of scriptureBooks) {
        expect(book.canonical).toBeDefined();
        expect(book.canonical.length).toBeGreaterThan(0);
        expect(book.abbreviations).toBeDefined();
        expect(Array.isArray(book.abbreviations)).toBe(true);
        expect(book.variants).toBeDefined();
        expect(Array.isArray(book.variants)).toBe(true);
        expect(["old", "new"]).toContain(book.testament);
      }
    });

    test("no duplicate canonical names", () => {
      const canonicalNames = scriptureBooks.map(book => book.canonical);
      const uniqueNames = new Set(canonicalNames);
      expect(uniqueNames.size).toBe(canonicalNames.length);
    });

    test("no duplicate abbreviations across all books", () => {
      const allAbbreviations: string[] = [];
      for (const book of scriptureBooks) {
        for (const abbreviation of book.abbreviations) {
          allAbbreviations.push(abbreviation.toLowerCase());
        }
      }
      const uniqueAbbreviations = new Set(allAbbreviations);
      expect(uniqueAbbreviations.size).toBe(allAbbreviations.length);
    });
  });

  describe("specific book content", () => {
    test("Psalms includes Psalm variant", () => {
      const book = getBookByCanonical("Psalms");
      expect(book?.variants).toContain("Psalm");
    });

    test("Song of Solomon includes Song of Songs variant", () => {
      const book = getBookByCanonical("Song of Solomon");
      expect(book?.variants).toContain("Song of Songs");
    });

    test("Revelation includes Apocalypse variant", () => {
      const book = getBookByCanonical("Revelation");
      expect(book?.variants).toContain("Apocalypse");
    });

    test("Ecclesiastes includes Qoheleth variant", () => {
      const book = getBookByCanonical("Ecclesiastes");
      expect(book?.variants).toContain("Qoheleth");
    });
  });
});
