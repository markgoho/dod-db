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
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { PageSchema } from "./check-scholarship.js";
import { screenshot } from "./chrome.js";
import {
  CARD_MANIFEST,
  cardKey,
  cardPath,
  readCardManifest,
} from "./question-cards.js";
import { readFrontmatter } from "./synthesis-check.js";

const CARD = { width: 1200, height: 630, scale: 1 };
const PARALLEL = 4;

async function main(): Promise<void> {
  const root = path.resolve(import.meta.dir, "../..");
  const args = process.argv.slice(2);
  const base = (
    args.find(arg => arg.startsWith("--base="))?.slice("--base=".length) ??
    "http://localhost:1313"
  ).replace(/\/$/, "");
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
  const jobs: { slug: string; id: string; key: string }[] = [];
  for (const slug of slugs) {
    const page = PageSchema.parse(
      await readFrontmatter(path.join(contentDir, `${slug}.md`)),
    );
    for (const statement of page.statements) {
      const key = cardKey(page.title, statement);
      const current =
        manifest[`${slug}/${statement.id}`] === key &&
        (await Bun.file(cardPath(root, slug, statement.id)).exists());
      if (!staleOnly || !current) jobs.push({ slug, id: statement.id, key });
    }
  }

  // Fail fast when the server is down or serves another checkout.
  if (jobs[0]) {
    const probe = `${base}/scholarship/${jobs[0].slug}/${jobs[0].id}/`;
    const response = await fetch(probe);
    if (!response.ok || !(await response.text()).includes('id="card"')) {
      throw new Error(
        `${probe} has no #card (status ${response.status}). Is a Hugo server for this checkout up?`,
      );
    }
  }

  // Saved after every card, so a stalled run keeps what it finished.
  async function saveManifest(): Promise<void> {
    const sorted = Object.fromEntries(
      Object.entries(manifest).toSorted(([a], [b]) => a.localeCompare(b)),
    );
    await Bun.write(
      path.join(root, CARD_MANIFEST),
      `${JSON.stringify(sorted, undefined, 2)}\n`,
    );
  }

  const queue = [...jobs];
  async function worker(): Promise<void> {
    for (let job = queue.shift(); job; job = queue.shift()) {
      const out = cardPath(root, job.slug, job.id);
      await mkdir(path.dirname(out), { recursive: true });
      await screenshot(
        `${base}/scholarship/${job.slug}/${job.id}/#card`,
        out,
        CARD,
      );
      manifest[`${job.slug}/${job.id}`] = job.key;
      await saveManifest();
      console.log(`✓ ${path.relative(root, out)}`);
    }
  }
  await Promise.all(Array.from({ length: PARALLEL }, () => worker()));

  await saveManifest();
  console.log(`${jobs.length} card(s) written; ${CARD_MANIFEST} updated`);
}

await main();
