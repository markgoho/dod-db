/**
 * Photograph a Scholarship Page's infographic: the page's custom block in its
 * poster view (`#share`, see scholarship.css), saved as a PNG that is committed
 * and served from /assets/scholarship/<slug>.png.
 *
 * Writes two images at 2x: the poster (1080 by 1350, `<slug>.png`) and the
 * link-preview card (1200 by 630, `<slug>-card.png`, used as og:image).
 * Needs a running Hugo server and a local Chrome.
 *
 * Usage: bun run scholarship:infographic <slug> [--base=http://localhost:1313]
 */

import path from "node:path";
import { screenshot } from "./chrome.js";
import { baseUrl } from "./render-cards.js";

/** The poster, for posting as an image; the card, for link previews (og:image). */
const IMAGES = [
  { target: "share", suffix: "", width: 1080, height: 1350 },
  { target: "share-card", suffix: "-card", width: 1200, height: 630 },
];
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const slug = args.find(arg => !arg.startsWith("--"));
  const base = baseUrl(args);
  if (!slug) {
    throw new Error(
      "Usage: bun run scholarship:infographic <slug> [--base=http://localhost:1313]",
    );
  }

  const url = `${base}/scholarship/${slug}/`;
  const page = await fetch(url);
  if (!page.ok) {
    throw new Error(`${url} returned ${page.status}. Is the Hugo server up?`);
  }
  if (!(await page.text()).includes('id="share"')) {
    throw new Error(`${url} has no infographic (no #share block).`);
  }

  for (const image of IMAGES) {
    const out = path.join(
      "hugo/static/assets/scholarship",
      `${slug}${image.suffix}.png`,
    );
    await screenshot(`${url}#${image.target}`, path.resolve(out), {
      width: image.width,
      height: image.height,
      scale: 2,
    });
    console.log(`✓ ${out} (${image.width}×${image.height} at 2x)`);
  }
}

await main();
