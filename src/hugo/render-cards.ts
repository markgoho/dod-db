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

/** The value of `--base=`, else the local Hugo server. */
export function baseUrl(args: readonly string[]): string {
  return (
    args.find(arg => arg.startsWith("--base="))?.slice("--base=".length) ??
    "http://localhost:1313"
  ).replace(/\/$/, "");
}

export async function renderCards(
  root: string,
  manifestPath: string,
  manifest: CardManifest,
  jobs: readonly CardJob[],
): Promise<void> {
  // Fail fast when the server is down or serves another checkout.
  if (jobs[0]) {
    const probe = jobs[0].url;
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
