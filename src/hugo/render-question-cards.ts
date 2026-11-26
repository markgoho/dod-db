/**
 * Photograph the link-preview card of each Question Page
 * (/scholarship/<slug>/<id>/, see content/scholarship/_content.gotmpl): its
 * #card view, 1200 by 630, saved to
 * hugo/static/assets/scholarship/<slug>/<id>.png and recorded in
 * data/scholarship-question-cards.json so check:scholarship can tell when a
 * card no longer matches its statement.
 *
 * Needs a running Hugo server (serving this checkout) and a local Chrome.
 *
 * Usage: bun run scholarship:question-cards <slug>... | --all
 *          [--base=http://localhost:1313] [--stale]
 *   --stale   only cards that are missing or out of date
 */

import { Glob } from "bun";
import path from "node:path";
import { PageSchema } from "./check-scholarship.js";
import {
  CARD_MANIFEST,
  cardKey,
  cardPath,
  readCardManifest,
} from "./question-cards.js";
import { baseUrl, renderCards, type CardJob } from "./render-cards.js";
import { readFrontmatter } from "./synthesis-check.js";

async function main(): Promise<void> {
  const root = path.resolve(import.meta.dir, "../..");
  const args = process.argv.slice(2);
  const base = baseUrl(args);
  const staleOnly = args.includes("--stale");
  const contentDir = path.join(root, "hugo/content/scholarship");

  let slugs = args.filter(arg => !arg.startsWith("--"));
  if (args.includes("--all")) {
    slugs = (await Array.fromAsync(new Glob("*.md").scan({ cwd: contentDir })))
      .filter(f => f !== "_index.md")
      .map(f => f.replace(/\.md$/, ""))
      .toSorted();
  }
  if (slugs.length === 0) {
    throw new Error(
      "Usage: bun run scholarship:question-cards <slug>... | --all [--base=http://localhost:1313] [--stale]",
    );
  }

  const manifest = await readCardManifest(root);
  const jobs: CardJob[] = [];
  for (const slug of slugs) {
    const page = PageSchema.parse(
      await readFrontmatter(path.join(contentDir, `${slug}.md`)),
    );
    for (const statement of page.statements) {
      const name = `${slug}/${statement.id}`;
      const key = cardKey(page.title, statement);
      const out = cardPath(root, slug, statement.id);
      const current = manifest[name] === key && (await Bun.file(out).exists());
      if (!staleOnly || !current) {
        jobs.push({ name, key, url: `${base}/scholarship/${name}/`, out });
      }
    }
  }

  await renderCards(root, CARD_MANIFEST, manifest, jobs);
}

await main();
