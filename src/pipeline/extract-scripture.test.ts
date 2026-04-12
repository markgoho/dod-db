import { describe, expect, test } from "bun:test";
import { extractScripture } from "./extract-scripture.js";

describe("extractScripture", () => {
  describe("basic reference detection", () => {
    test("detects chapter-only reference", async () => {
      const transcript = "Let's look at Genesis 1 today.";
      const results = await extractScripture(transcript);

      const genesis = results.find(result => result.book === "Genesis");
      expect(genesis).toBeDefined();
      expect(genesis?.references).toContain("Genesis 1");
    });

    test("detects chapter:verse reference", async () => {
      const transcript = "Genesis 1:25 is interesting.";
      const results = await extractScripture(transcript);

      const genesis = results.find(result => result.book === "Genesis");
      expect(genesis).toBeDefined();
      expect(genesis?.references).toContain("Genesis 1:25");
    });

    test("detects verse range reference", async () => {
      const transcript = "Genesis 1:1-10 covers creation.";
      const results = await extractScripture(transcript);

      const genesis = results.find(result => result.book === "Genesis");
      expect(genesis).toBeDefined();
      expect(genesis?.references).toContain("Genesis 1:1-10");
    });
  });

  describe("abbreviation handling", () => {
    test("detects Gen abbreviation", async () => {
      const transcript = "See Gen 1:1 for the beginning.";
      const results = await extractScripture(transcript);

      const genesis = results.find(result => result.book === "Genesis");
      expect(genesis).toBeDefined();
      expect(genesis?.references).toContain("Genesis 1:1");
    });

    test("detects Matt abbreviation", async () => {
      const transcript = "Matt 5:3 says blessed are the poor.";
      const results = await extractScripture(transcript);

      const matthew = results.find(result => result.book === "Matthew");
      expect(matthew).toBeDefined();
      expect(matthew?.references).toContain("Matthew 5:3");
    });

    test("detects abbreviation with period", async () => {
      const transcript = "Gen. 1:1 says in the beginning.";
      const results = await extractScripture(transcript);

      const genesis = results.find(result => result.book === "Genesis");
      expect(genesis).toBeDefined();
      expect(genesis?.references).toContain("Genesis 1:1");
    });
  });

  describe("variant normalization", () => {
    test("normalizes Song of Songs to Song of Solomon", async () => {
      const transcript = "Song of Songs 1:1 is beautiful.";
      const results = await extractScripture(transcript);

      const song = results.find(result => result.book === "Song of Solomon");
      expect(song).toBeDefined();
      expect(song?.references).toContain("Song of Solomon 1:1");
    });

    test("normalizes Psalm to Psalms", async () => {
      const transcript = "Psalm 23 is the shepherd psalm.";
      const results = await extractScripture(transcript);

      const psalms = results.find(result => result.book === "Psalms");
      expect(psalms).toBeDefined();
      expect(psalms?.references).toContain("Psalms 23");
    });
  });

  describe("numbered books", () => {
    test("detects 1 John reference", async () => {
      const transcript = "1 John 3:16 talks about love.";
      const results = await extractScripture(transcript);

      const firstJohn = results.find(result => result.book === "1 John");
      expect(firstJohn).toBeDefined();
      expect(firstJohn?.references).toContain("1 John 3:16");
    });

    test("detects 2 Corinthians reference", async () => {
      const transcript = "2 Corinthians 5 discusses reconciliation.";
      const results = await extractScripture(transcript);

      const secondCor = results.find(result => result.book === "2 Corinthians");
      expect(secondCor).toBeDefined();
      expect(secondCor?.references).toContain("2 Corinthians 5");
    });

    test("normalizes First Samuel to 1 Samuel", async () => {
      const transcript = "First Samuel 3 is about Samuel's calling.";
      const results = await extractScripture(transcript);

      const firstSam = results.find(result => result.book === "1 Samuel");
      expect(firstSam).toBeDefined();
      expect(firstSam?.references).toContain("1 Samuel 3");
    });

    test("normalizes I Corinthians to 1 Corinthians", async () => {
      const transcript = "I Corinthians 13 is about love.";
      const results = await extractScripture(transcript);

      const firstCor = results.find(result => result.book === "1 Corinthians");
      expect(firstCor).toBeDefined();
      expect(firstCor?.references).toContain("1 Corinthians 13");
    });
  });

  describe("speaker label exclusion", () => {
    test("excludes speaker names from matches", async () => {
      const transcript = `[00:00:01.000] Mark Johnson: Let me read from Mark 1:1.`;
      const results = await extractScripture(transcript, {
        enableLlmVerification: false,
      });

      // Should detect Mark 1:1 reference but not "Mark Johnson"
      const mark = results.find(result => result.book === "Mark");
      expect(mark).toBeDefined();
      expect(mark?.references).toContain("Mark 1:1");
      expect(mark?.mentions).toBe(1); // Only the scripture reference, not the speaker name
    });

    test("excludes Ruth from speaker label", async () => {
      const transcript = `[00:00:01.000] Ruth Williams: Ruth 1:16 is beautiful.`;
      const results = await extractScripture(transcript, {
        enableLlmVerification: false,
      });

      const ruth = results.find(result => result.book === "Ruth");
      expect(ruth).toBeDefined();
      expect(ruth?.mentions).toBe(1);
    });
  });

  describe("whole-book references", () => {
    test("detects Book of Esther as whole-book reference", async () => {
      const transcript = "Today we're talking about the Book of Esther.";
      const results = await extractScripture(transcript);

      const esther = results.find(result => result.book === "Esther");
      expect(esther).toBeDefined();
      expect(esther?.references).toEqual(["Esther"]);
      expect(esther?.mentions).toBe(1);
    });

    test("sorts whole-book reference before chapter references", async () => {
      const transcript =
        "Today we're talking about the Book of Esther and Esther 4:14.";
      const results = await extractScripture(transcript);

      const esther = results.find(result => result.book === "Esther");
      expect(esther).toBeDefined();
      expect(esther?.references).toEqual(["Esther", "Esther 4:14"]);
      expect(esther?.mentions).toBe(2);
    });
  });

  describe("multiple references", () => {
    test("deduplicates same reference", async () => {
      const transcript = "Genesis 1:1 is important. Yes, Genesis 1:1 again.";
      const results = await extractScripture(transcript);

      const genesis = results.find(result => result.book === "Genesis");
      expect(genesis).toBeDefined();
      expect(genesis?.references).toHaveLength(1);
      expect(genesis?.references).toContain("Genesis 1:1");
      expect(genesis?.mentions).toBe(2); // Mentioned twice
    });

    test("keeps different references from same book", async () => {
      const transcript = "Genesis 1:1 and Genesis 2:4 are both about creation.";
      const results = await extractScripture(transcript);

      const genesis = results.find(result => result.book === "Genesis");
      expect(genesis).toBeDefined();
      expect(genesis?.references).toHaveLength(2);
      expect(genesis?.references).toContain("Genesis 1:1");
      expect(genesis?.references).toContain("Genesis 2:4");
    });

    test("detects references from multiple books", async () => {
      const transcript = "Compare Genesis 1:1 with John 1:1.";
      const results = await extractScripture(transcript);

      expect(results.length).toBeGreaterThanOrEqual(2);

      const genesis = results.find(result => result.book === "Genesis");
      const john = results.find(result => result.book === "John");

      expect(genesis?.references).toContain("Genesis 1:1");
      expect(john?.references).toContain("John 1:1");
    });
  });

  describe("fixture-based tests", () => {
    test("processes simple fixture correctly", async () => {
      const fixture = await Bun.file(
        "src/pipeline/__fixtures__/scripture-simple.txt",
      ).text();
      const results = await extractScripture(fixture);

      // Should find Genesis
      const genesis = results.find(result => result.book === "Genesis");
      expect(genesis).toBeDefined();
      expect(genesis?.references).toContain("Genesis 1");
      expect(genesis?.references).toContain("Genesis 1:25");
      expect(genesis?.references).toContain("Genesis 1:1-10");

      // Should find Matthew
      const matthew = results.find(result => result.book === "Matthew");
      expect(matthew).toBeDefined();
      expect(matthew?.references).toContain("Matthew 5:3");

      // Should find 1 John
      const firstJohn = results.find(result => result.book === "1 John");
      expect(firstJohn).toBeDefined();
      expect(firstJohn?.references).toContain("1 John 3:16");

      // Should find Song of Solomon (normalized from Song of Songs)
      const song = results.find(result => result.book === "Song of Solomon");
      expect(song).toBeDefined();

      // Should find Psalms (including Psalm variant)
      const psalms = results.find(result => result.book === "Psalms");
      expect(psalms).toBeDefined();
    });

    test("excludes speaker names in fixture", async () => {
      const fixture = await Bun.file(
        "src/pipeline/__fixtures__/scripture-speaker-exclusion.txt",
      ).text();
      const results = await extractScripture(fixture, {
        enableLlmVerification: false,
      });

      // Mark 1:1 should be detected, but only once (not the speaker name)
      const mark = results.find(result => result.book === "Mark");
      expect(mark).toBeDefined();
      expect(mark?.references).toContain("Mark 1:1");

      // Ruth 1:16 should be detected
      const ruth = results.find(result => result.book === "Ruth");
      expect(ruth).toBeDefined();
      expect(ruth?.references).toContain("Ruth 1:16");

      // Acts should be detected
      const acts = results.find(result => result.book === "Acts");
      expect(acts).toBeDefined();
      expect(acts?.references).toContain("Acts 2:38");

      // Job should be detected
      const job = results.find(result => result.book === "Job");
      expect(job).toBeDefined();
      expect(job?.references).toContain("Job 1:1");

      // James should be detected
      const james = results.find(result => result.book === "James");
      expect(james).toBeDefined();
      expect(james?.references).toContain("James 1:2");

      // Judges should be detected
      const judges = results.find(result => result.book === "Judges");
      expect(judges).toBeDefined();
      expect(judges?.references).toContain("Judges 4:4");
    });
  });

  describe("edge cases", () => {
    test("handles empty transcript", async () => {
      const results = await extractScripture("");
      expect(results).toHaveLength(0);
    });

    test("handles transcript with no scripture references", async () => {
      const transcript = "Today we discuss philosophy and ethics.";
      const results = await extractScripture(transcript);
      expect(results).toHaveLength(0);
    });

    test("does not match partial book names", async () => {
      const transcript = "The genes in Genesis 1 are fascinating.";
      const results = await extractScripture(transcript);

      // Should only find "Genesis 1", not "genes"
      expect(results.length).toBe(1);
      expect(results[0]?.book).toBe("Genesis");
    });

    test("handles references at end of text", async () => {
      const transcript = "Read Genesis 1:1";
      const results = await extractScripture(transcript);

      const genesis = results.find(result => result.book === "Genesis");
      expect(genesis).toBeDefined();
      expect(genesis?.references).toContain("Genesis 1:1");
    });
  });

  describe("sorting", () => {
    test("sorts results by mention count descending", async () => {
      const transcript =
        "Genesis 1:1. Genesis 1:2. Genesis 1:3. Matthew 5:1. John 3:16.";
      const results = await extractScripture(transcript);

      // Genesis should be first with 3 mentions
      expect(results[0]?.book).toBe("Genesis");
      expect(results[0]?.mentions).toBe(3);
    });

    test("sorts references within book by chapter and verse", async () => {
      const transcript =
        "Genesis 2:4. Genesis 1:10. Genesis 1:1. Genesis 10:5.";
      const results = await extractScripture(transcript);

      const genesis = results.find(result => result.book === "Genesis");
      expect(genesis).toBeDefined();

      // References should be sorted: 1:1, 1:10, 2:4, 10:5
      const references = genesis?.references;
      expect(references?.[0]).toBe("Genesis 1:1");
      expect(references?.[1]).toBe("Genesis 1:10");
      expect(references?.[2]).toBe("Genesis 2:4");
      expect(references?.[3]).toBe("Genesis 10:5");
    });
  });
});
