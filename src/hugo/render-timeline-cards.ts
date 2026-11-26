/**
 * Photograph the link-preview card of each Timeline Entry Page
 * (/timeline/<id>/, #219) and of the Timeline itself: the page's #card view,
 * 1200 by 630, saved to hugo/static/assets/timeline/<id>.png (the Timeline's:
 * hugo/static/assets/timeline-card.png) and recorded in
 * data/timeline-cards.json so check:timeline can tell when a card no longer
 * matches its entry. Draft entries have no page, so no card.
 *
 * Needs a running Hugo server (serving this checkout) and a local Chrome.
 *
 * Usage: bun run timeline:cards [<id>...] [--base=http://localhost:1313] [--stale]
 *   no ids    every published entry, and the Timeline's own card
 *   --stale   only cards that are missing or out of date
 */

import { Glob } from "bun";
import path from "node:path";
import { EntrySchema, IndexSchema } from "./check-timeline.js";
import { baseUrl, renderCards, type CardJob } from "./render-cards.js";
import { readFrontmatter } from "./synthesis-check.js";
import {
  entryCardKey,
  INDEX,
  indexCardKey,
  readTimelineCardManifest,
  TIMELINE_CARD_MANIFEST,
  timelineCardPath,
} from "./timeline-cards.js";

async function main(): Promise<void> {
  const root = path.resolve(import.meta.dir, "../..");
  const args = process.argv.slice(2);
  const base = baseUrl(args);
  const staleOnly = args.includes("--stale");
  const contentDir = path.join(root, "hugo/content/timeline");

  let ids = args.filter(arg => !arg.startsWith("--"));
  if (ids.length === 0) {
    ids = [
      INDEX,
      ...(await Array.fromAsync(new Glob("*.md").scan({ cwd: contentDir })))
        .filter(f => f !== "_index.md")
        .map(f => f.replace(/\.md$/, ""))
        .toSorted(),
    ];
  }

  const manifest = await readTimelineCardManifest(root);
  const jobs: CardJob[] = [];
  for (const id of ids) {
    const frontmatter = await readFrontmatter(
      path.join(contentDir, `${id}.md`),
    );
    let key: string;
    if (id === INDEX) {
      key = indexCardKey(IndexSchema.parse(frontmatter));
    } else {
      const entry = EntrySchema.parse(frontmatter);
      if (entry.draft) {
        console.log(`- ${id}: draft, no card`);
        continue;
      }
      key = entryCardKey(entry);
    }
    const out = timelineCardPath(root, id);
    const current = manifest[id] === key && (await Bun.file(out).exists());
    if (!staleOnly || !current) {
      const url = `${base}/timeline/${id === INDEX ? "" : `${id}/`}`;
      jobs.push({ name: id, key, url, out });
    }
  }

  await renderCards(root, TIMELINE_CARD_MANIFEST, manifest, jobs);
}

await main();
