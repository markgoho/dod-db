import { $ } from "bun";
import { afterAll, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { checkTimeline } from "./check-timeline.js";

const repoRoot = path.resolve(import.meta.dir, "../..");
const fixtures = path.join(import.meta.dir, "__fixtures__", "timeline");
const scratch = await mkdtemp(path.join(tmpdir(), "check-timeline-"));

afterAll(async () => {
  await rm(scratch, { recursive: true, force: true });
});

/**
 * Build a repo root from the `published` fixture (two non-draft entries that
 * meet every rule: `fall`, and `book` anchored to it with a Tradition Date)
 * with the named fixture's files laid over it.
 */
async function check(
  name: string,
  { cards = false }: { cards?: boolean } = {},
): Promise<string[]> {
  const root = path.join(scratch, name);
  await $`cp -R ${path.join(fixtures, "published")} ${root}`.quiet();
  if (name !== "published") {
    await $`cp -R ${path.join(fixtures, name)}/. ${root}`.quiet();
  }
  return checkTimeline(root, { cards });
}

const triggers = "hugo/data/timeline/triggers.yaml";

describe("checkTimeline", () => {
  test("the repo's Timeline Entries pass", async () => {
    expect(await checkTimeline(repoRoot)).toEqual([]);
  });

  test("published entries that meet every rule pass", async () => {
    expect(await check("published")).toEqual([]);
  });

  test("fails an entry that still has render: never", async () => {
    expect(await check("render-never")).toEqual([
      "timeline/fall: build has render: never; drop the build line, an entry has its own page",
    ]);
  });

  test("published entries whose cards match their text pass", async () => {
    expect(await check("cards-current", { cards: true })).toEqual([]);
  });

  test("fails a missing card and a stale card", async () => {
    const fix = "run bun run timeline:cards --stale";
    expect(await check("cards-stale", { cards: true })).toEqual([
      `timeline: no card image; ${fix}`,
      `timeline/fall: card image is stale (its text changed); ${fix}`,
    ]);
  });

  test("fails when a citation names a source missing from the registry", async () => {
    expect(await check("unknown-source")).toEqual([
      `timeline/book: citation critical/2 names unknown source "no-such-source"`,
    ]);
  });

  test("fails a source id the registry defines twice", async () => {
    expect(await check("registry-duplicate-key")).toEqual([
      `hugo/data/external-sources.yaml: source "scholarly-book" is defined more than once (lines 1, 43); keep one block`,
    ]);
  });

  test("fails when a setting citation names a source missing from the registry", async () => {
    expect(await check("setting-unknown-source")).toEqual([
      `timeline/book: citation setting/1 names unknown source "no-such-source"`,
    ]);
  });

  test("fails a published setting whose citations and sources the review omits", async () => {
    expect(await check("setting-unreviewed")).toEqual([
      `timeline/book: review has no citations.setting/1 entry`,
      `timeline/book: review has no sources.scholarly-book entry`,
    ]);
  });

  test("a published setting the review covers passes", async () => {
    expect(await check("setting-reviewed")).toEqual([]);
  });

  test("a setting with no years (display and cites only) passes", async () => {
    expect(await check("setting-no-from")).toEqual([]);
  });

  test("fails a setting cite that isn't a Scholarly or Reference source", async () => {
    expect(await check("setting-tradition-cite")).toEqual([
      `timeline/book: citation setting/2 cites "tradition-page", a Tradition source; a setting cites Scholarly or Reference sources only`,
    ]);
  });

  test("fails a setting with to but no from", async () => {
    expect(await check("setting-to-without-from")).toEqual([
      `timeline/book: setting has to but no from; give from with to`,
    ]);
  });

  test("fails a setting on an event entry", async () => {
    expect(await check("setting-on-event")).toEqual([
      `timeline/fall: has a setting but entryKind event; a setting is for composition entries only`,
      `timeline/fall: review has no citations.setting/1 entry`,
    ]);
  });

  test("fails a setting with no citations", async () => {
    expect(await check("setting-no-cites")).toEqual([
      `timeline/book: setting cites no Scholarly or Reference source`,
    ]);
  });

  test("fails when a Trigger Claim names no entry", async () => {
    expect(await check("trigger-unknown-entry")).toEqual([
      `${triggers}: Trigger Claim 32@00:01:00 names entry "no-such-entry", not in hugo/content/timeline`,
    ]);
  });

  test("fails when a Trigger Claim names an Episode missing from processed-videos", async () => {
    expect(await check("trigger-unknown-episode")).toEqual([
      `${triggers}: Trigger Claim 999@00:24:33 names Episode 999, not in data/processed-videos.json`,
    ]);
  });

  test("fails when a related term has no term page", async () => {
    expect(await check("related-unknown-term")).toEqual([
      `timeline/book: related books "no-such-book" names no term page`,
    ]);
  });

  test("fails a related tag that only redirects to a topic the entry doesn't list", async () => {
    expect(await check("related-tag-redirects-to-topic")).toEqual([
      `timeline/book: related tag "lxx" only redirects to topic "septuagint"; add "septuagint" to related topics`,
    ]);
  });

  test("fails an entry with both critical and undated", async () => {
    expect(await check("critical-and-undated")).toEqual([
      `timeline/book: has both critical and undated; give one`,
    ]);
  });

  test("fails an entry with neither critical nor undated", async () => {
    expect(await check("neither-critical-nor-undated")).toEqual([
      `timeline/book: has neither critical nor undated; give one`,
    ]);
  });

  test("fails when anchor or seeAlso names no entry", async () => {
    expect(await check("unknown-anchor-and-see-also")).toEqual([
      `timeline/book: anchor "no-such-anchor" names no entry`,
      `timeline/book: seeAlso "no-such-entry" names no entry`,
    ]);
  });

  test("fails an entry id ending in -tradition, the anchor of a Tradition Date at its own year", async () => {
    expect(await check("id-tradition-suffix")).toEqual([
      `timeline/fall-tradition: an entry id can't end in "-tradition"; that anchor belongs to an entry's Tradition Date`,
    ]);
  });

  test("fails a Tradition Date with no Trigger Claim stating the tradition", async () => {
    expect(await check("tradition-no-trigger")).toEqual([
      `timeline/book: has a Tradition Date but no Trigger Claim with states: tradition or both`,
    ]);
  });

  test("fails a tradition cite that isn't a Tradition source", async () => {
    expect(await check("tradition-cite-not-tradition")).toEqual([
      `timeline/book: citation tradition/1 cites "reference-lecture", a Reference source; a Tradition Date cites Tradition sources only`,
    ]);
  });

  test("fails a holder that doesn't name the registry's tradition", async () => {
    expect(await check("holder-unnamed")).toEqual([
      `timeline/book: holder "Conservative scholars" doesn't contain "Example Ministries, an evangelical ministry", the tradition of "tradition-page"`,
    ]);
  });

  test("fails a Critical Date with no Scholarly or Reference cite", async () => {
    expect(await check("no-scholarly-or-reference")).toEqual([
      `timeline/book: critical cites no Scholarly or Reference source`,
    ]);
  });

  test("a published undated entry with one Scholarly cite passes", async () => {
    expect(await check("published-undated")).toEqual([]);
  });

  test("a Critical Date with no precision passes", async () => {
    expect(await check("critical-no-precision")).toEqual([]);
  });

  test("an undated entry with verdict not-historical passes", async () => {
    expect(await check("undated-verdict")).toEqual([]);
  });

  test("fails an undated verdict outside no-firm-date and not-historical", async () => {
    expect(await check("undated-verdict-unknown")).toEqual([
      `hugo/content/timeline/fall.md: undated.verdict: Invalid option: expected one of "no-firm-date"|"not-historical"`,
    ]);
  });

  test("fails a non-draft entry with no Trigger Claim", async () => {
    expect(await check("no-trigger")).toEqual([
      `timeline/fall: has no Trigger Claim; a published entry needs one`,
    ]);
  });

  test("fails a non-draft entry with an empty owner field and no delegation", async () => {
    expect(await check("empty-owner")).toEqual([
      `timeline/fall: review citations.critical/1 has owner "", not pass`,
    ]);
  });

  test("fails a non-draft entry whose review omits an entry rule", async () => {
    expect(await check("missing-rule")).toEqual([
      `timeline/fall: review has no rules.split-shown entry`,
    ]);
  });

  test("a delegated review with every item agent: pass and no owner check passes", async () => {
    expect(await check("delegated")).toEqual([]);
  });

  test("fails a delegated review with an item not agent: pass", async () => {
    expect(await check("delegated-flag")).toEqual([
      `timeline/fall: review citations.critical/1 has agent "flag", not pass`,
    ]);
  });

  test("fails a review whose owner holds text instead of a verdict (#223)", async () => {
    expect(await check("delegated-owner-text")).toEqual([
      `data/timeline-reviews/fall.yaml: citations.critical/1.owner: owner must be "", pass or fail; put notes in note (#223)`,
    ]);
  });

  test("fails a delegated review whose date doesn't match the entry's sourcesRead", async () => {
    expect(await check("delegated-sources-read-mismatch")).toEqual([
      `timeline/fall: sourcesRead "2026-11-23" doesn't match review date 2026-12-03`,
    ]);
  });

  test("fails a delegated review whose secondPass doesn't match the entry's sourcesRead", async () => {
    expect(await check("delegated-second-pass-mismatch")).toEqual([
      `timeline/fall: sourcesRead "2026-11-23" doesn't match review delegation secondPass 2026-11-25`,
    ]);
  });

  test("fails a non-draft entry anchored to, or seeing also, a draft entry", async () => {
    expect(await check("links-to-draft")).toEqual([
      `timeline/book: anchor "fall" names a draft entry; an entry can't publish before the entries it links to`,
      `timeline/book: seeAlso "fall" names a draft entry; an entry can't publish before the entries it links to`,
    ]);
  });
});
