import { $ } from "bun";
import { describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { buildChecklist, timestampAnchor } from "./scholarship-checklist.js";

const fixture = path.join(
  import.meta.dir,
  "__fixtures__",
  "scholarship-checklist",
);

describe("timestampAnchor", () => {
  test("matches the quote-card anchor: total seconds and milliseconds", () => {
    expect(timestampAnchor("00:25:18.080")).toBe("t-1518-080");
  });

  test("counts hours", () => {
    expect(timestampAnchor("01:02:03.4")).toBe("t-3723-004");
  });

  test("treats a missing fraction as zero milliseconds", () => {
    expect(timestampAnchor("00:00:09")).toBe("t-9-000");
  });
});

describe("buildChecklist", () => {
  test("renders the owner checklist for a page", async () => {
    const expected = await Bun.file(path.join(fixture, "expected.md")).text();
    expect(await buildChecklist(fixture, "test-page", "abc1234")).toBe(
      expected,
    );
  });

  test("says when the owner delegated the review", async () => {
    const delegated = `${fixture}-delegated`;
    const root = await mkdtemp(path.join(tmpdir(), "scholarship-checklist-"));
    try {
      await $`cp -R ${fixture}/. ${root}`.quiet();
      await $`cp -R ${delegated}/data/. ${root}/data`.quiet();
      const expected = await Bun.file(
        path.join(delegated, "expected.md"),
      ).text();
      expect(await buildChecklist(root, "test-page", "abc1234")).toBe(expected);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  test("names a page with no front matter file", async () => {
    await expect(
      buildChecklist(fixture, "no-such-page", "abc1234"),
    ).rejects.toThrow("hugo/content/scholarship/no-such-page.md");
  });
});
