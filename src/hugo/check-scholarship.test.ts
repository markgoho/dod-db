import { $ } from "bun";
import { afterAll, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { checkScholarship } from "./check-scholarship.js";

const repoRoot = path.resolve(import.meta.dir, "../..");
const fixtures = path.join(import.meta.dir, "__fixtures__", "scholarship");
const scratch = await mkdtemp(path.join(tmpdir(), "check-scholarship-"));

afterAll(async () => {
  await rm(scratch, { recursive: true, force: true });
});

/**
 * Build a repo root from the `published` fixture (a non-draft page that
 * meets every rule) with the named fixture's files laid over it.
 */
async function check(name: string): Promise<string[]> {
  const root = path.join(scratch, name);
  await $`cp -R ${path.join(fixtures, "published")} ${root}`.quiet();
  if (name !== "published") {
    await $`cp -R ${path.join(fixtures, name)}/. ${root}`.quiet();
  }
  return checkScholarship(root);
}

const page = "scholarship/test-page";

describe("checkScholarship", () => {
  test("the repo's Scholarship Pages pass", async () => {
    expect(await checkScholarship(repoRoot)).toEqual([]);
  });

  test("a published page that meets every rule passes", async () => {
    expect(await check("published")).toEqual([]);
  });

  test("fails when a citation names a source missing from the registry", async () => {
    expect(await check("missing-source")).toEqual([
      `${page}: citation core/1 names unknown source "no-such-source"`,
      `${page}: review has no sources.no-such-source entry`,
    ]);
  });

  test("fails when a Trigger Claim names an Episode missing from processed-videos", async () => {
    expect(await check("missing-episode")).toEqual([
      `${page}: Trigger Claim 999@00:25:18 names Episode 999, not in data/processed-videos.json`,
    ]);
  });

  test("fails when a related entry names no term page", async () => {
    expect(await check("related-unknown-term")).toEqual([
      `${page}: related tags "Aaron's Budding Rod" names no term page`,
    ]);
  });

  test("fails when core names no statement", async () => {
    expect(await check("core-unresolved")).toEqual([
      `${page}: core "nope" names no statement`,
    ]);
  });

  test("fails a non-draft page whose core claim has one source", async () => {
    expect(await check("core-one-source")).toEqual([
      `${page}: publish rule: core claim "core" cites 1 independent source (sources sharing an author count once); needs at least 2`,
    ]);
  });

  test("fails a non-draft page whose core claim rests on two sources by one author", async () => {
    expect(await check("core-same-author")).toEqual([
      `${page}: publish rule: core claim "core" cites 1 independent source (sources sharing an author count once); needs at least 2`,
    ]);
  });

  test("fails when a publisher summary has no author", async () => {
    expect(await check("summary-no-author")).toEqual([
      `hugo/data/external-sources.yaml: source "textbook-summary" is a publisher-summary with no author; give it the summarised book's author`,
    ]);
  });

  test("fails a non-draft page with fewer than 3 statements", async () => {
    expect(await check("two-statements")).toEqual([
      `${page}: publish rule: 2 statements; needs at least 3`,
    ]);
  });

  test("fails a non-draft page whose core claim rests only on Host-authored sources", async () => {
    expect(await check("host-authored-only")).toEqual([
      `${page}: publish rule: core claim "core" cites only Host-authored sources`,
    ]);
  });

  test("fails a non-draft page whose core claim has no Scholarly or Reference source", async () => {
    expect(await check("no-scholarly-or-reference")).toEqual([
      `${page}: publish rule: core claim "core" cites no Scholarly or Reference source`,
      `${page}: statement "second" cites Tradition source "scholarly-book" but doesn't name "Nothing"`,
    ]);
  });

  test("lets a draft page sit below the publish rule", async () => {
    expect(await check("draft-two-statements")).toEqual([]);
  });

  test("fails when a statement cites a Tradition source without naming it", async () => {
    expect(await check("tradition-unnamed")).toEqual([
      `${page}: statement "tradition" cites Tradition source "tradition-guide" but doesn't name "Example Church"`,
    ]);
  });

  test("fails a non-draft page with an empty owner field", async () => {
    expect(await check("empty-owner")).toEqual([
      `${page}: review citations.tradition/1 has owner "", not pass`,
    ]);
  });

  test("fails a non-draft page with a citation missing from the review file", async () => {
    expect(await check("missing-review-entry")).toEqual([
      `${page}: review has no citations.second/1 entry`,
    ]);
  });

  test("fails a non-draft page whose review omits a page rule", async () => {
    expect(await check("missing-rule")).toEqual([
      `${page}: review has no rules.publish-rule entry`,
    ]);
  });

  test("a candidate file with a new subject, a returned page and a proposed statement passes", async () => {
    expect(await check("candidates-valid")).toEqual([]);
  });

  test("fails candidate entries that break the #96 rules", async () => {
    const at = "data/scholarship-candidates.yaml";
    expect(await check("candidates-invalid")).toEqual([
      `${at}: subject "held-subject" is held with no missing`,
      `${at}: subject "held-subject" is listed twice`,
      `${at}: subject "held-subject" is dropped with no reason`,
      `${at}: subject "test-page" is already a page; only a page cut below the publish rule returns, as held`,
      `${at}: statements.0 names page "no-such-page", not in hugo/content/scholarship`,
      `${at}: Trigger Claim 999@00:01:00 names Episode 999, not in data/processed-videos.json`,
    ]);
  });

  test("fails when an uncited entry is not a string", async () => {
    expect(await check("uncited-not-strings")).toEqual([
      "data/scholarship-reviews/test-page.yaml: uncited.0: Invalid input: expected string, received object",
    ]);
  });
});
