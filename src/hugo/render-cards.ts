/**
 * Photograph link-preview cards: each a page's #card view, 1200 by 630, with
 * what it was rendered from recorded in a manifest, so a check can tell when
 * a card no longer matches its text. Shared by the Question Page and Timeline
 * card renderers.
 */

import { mkdir } from "node:fs/promises";
import path from "node:path";
import { screenshot } from "./chrome.js";
import type { CardManifest } from "./question-cards.js";

const CARD = { width: 1200, height: 630, scale: 1 };
const PARALLEL = 4;

export interface CardJob {
  /** The card's manifest entry. */
  name: string;
  /** What the card is rendered from; see the manifest's check. */
  key: string;
  /** The page, without its #card. */
  url: string;
  /** The image file to write. */
  out: string;
}

/** Whether this checkout is a linked git worktree, not the main checkout. */
export function isLinkedWorktree(cwd = import.meta.dir): boolean {
  const { stdout, success } = Bun.spawnSync(
    [
      "git",
      "rev-parse",
      "--path-format=absolute",
      "--git-dir",
      "--git-common-dir",
    ],
    { cwd },
  );
  const [gitDir, commonDir] = stdout.toString().trim().split("\n");
  return success && gitDir !== commonDir;
}

/**
 * The value of `--base=`, else the local Hugo server on 1313. A worktree must
 * name its own server: 1313 is the main checkout's, and photographing it
 * gives new pages a "Page not found" image and changed ones their old text.
 */
export function baseUrl(
  args: readonly string[],
  inWorktree = isLinkedWorktree(),
): string {
  const base = args
    .find(arg => arg.startsWith("--base="))
    ?.slice("--base=".length);
  if (base === undefined && inWorktree) {
    throw new Error(
      "This is a git worktree: run `hugo server -p <port>` from its hugo/ and pass --base=http://localhost:<port>.",
    );
  }
  return (base ?? "http://localhost:1313").replace(/\/$/, "");
}

// Every page must exist and have its card, or the image would be a
// "Page not found" (server down, or serving another checkout).
async function probe(url: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok || !(await response.text()).includes('id="card"')) {
    throw new Error(
      `${url} has no #card (status ${response.status}). Is a Hugo server for this checkout up?`,
    );
  }
}

export async function renderCards(
  root: string,
  manifestPath: string,
  manifest: CardManifest,
  jobs: readonly CardJob[],
): Promise<void> {
  await Promise.all(jobs.map(job => probe(job.url)));

  // Saved after every card, so a stalled run keeps what it finished.
  async function saveManifest(): Promise<void> {
    const sorted = Object.fromEntries(
      Object.entries(manifest).toSorted(([a], [b]) => a.localeCompare(b)),
    );
    await Bun.write(
      path.join(root, manifestPath),
      `${JSON.stringify(sorted, undefined, 2)}\n`,
    );
  }

  const queue = [...jobs];
  async function worker(): Promise<void> {
    for (let job = queue.shift(); job; job = queue.shift()) {
      await mkdir(path.dirname(job.out), { recursive: true });
      await screenshot(`${job.url}#card`, job.out, CARD);
      manifest[job.name] = job.key;
      await saveManifest();
      console.log(`✓ ${path.relative(root, job.out)}`);
    }
  }
  await Promise.all(Array.from({ length: PARALLEL }, () => worker()));

  await saveManifest();
  console.log(`${jobs.length} card(s) written; ${manifestPath} updated`);
}
