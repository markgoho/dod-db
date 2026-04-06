import { describe, expect, test } from "bun:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { parseHugoFile } from "./parse-hugo-file.js";
import { writeHugoFile } from "./write-hugo-file.js";

describe("writeHugoFile", () => {
  test("preserves frontmatter formatting and date when rewriting parsed frontmatter", async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), "write-hugo-file-"));
    const filePath = path.join(tempDir, "index.md");
    const original = `---
title: Test Episode
date: 2024-01-15T10:00:00.000Z
episodeNumber: 1
videoId: abc123
aliases:
  - /episodes/1/
tags:
  - James McGrath
  - theology
draft: false
---

Body content.
`;
    const expected = `---
title: Test Episode
date: 2024-01-15T10:00:00.000Z
episodeNumber: 1
videoId: abc123
aliases:
  - /episodes/1/
tags:
  - theology
draft: false
---

Body content.
`;

    try {
      await Bun.write(filePath, original);

      const { frontmatter, content } = await parseHugoFile(filePath);
      frontmatter.tags = frontmatter.tags.filter(
        tag => tag !== "James McGrath",
      );

      await writeHugoFile({ filePath, frontmatter, content });

      const rewritten = await readFile(filePath, "utf8");
      expect(rewritten).toBe(expected);
      expect(rewritten).not.toContain("date:\n  {}");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});
