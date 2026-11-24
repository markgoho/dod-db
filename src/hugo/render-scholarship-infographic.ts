/**
 * Photograph a Scholarship Page's infographic: the page's custom block in its
 * poster view (`#share`, see scholarship.css), saved as a PNG that is committed
 * and served from /assets/scholarship/<slug>.png.
 *
 * Needs a running Hugo server and a local Chrome. The poster is 1080 by 1350
 * CSS pixels, photographed at 2x.
 *
 * Usage: bun run scholarship:infographic <slug> [--base=http://localhost:1313]
 */

import path from "node:path";

const WIDTH = 1080;
const HEIGHT = 1350;
const CHROME_NAMES = [
  "google-chrome",
  "google-chrome-stable",
  "chromium",
  "chromium-browser",
];

function findChrome(): string {
  const chrome =
    process.env["CHROME_BIN"] ??
    CHROME_NAMES.map(name => Bun.which(name)).find(Boolean);
  if (!chrome) {
    throw new Error("No Chrome found. Set CHROME_BIN to a Chrome binary.");
  }
  return chrome;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const slug = args.find(arg => !arg.startsWith("--"));
  const base =
    args.find(arg => arg.startsWith("--base="))?.slice("--base=".length) ??
    "http://localhost:1313";
  if (!slug) {
    throw new Error(
      "Usage: bun run scholarship:infographic <slug> [--base=http://localhost:1313]",
    );
  }

  const url = `${base.replace(/\/$/, "")}/scholarship/${slug}/`;
  const page = await fetch(url);
  if (!page.ok) {
    throw new Error(`${url} returned ${page.status}. Is the Hugo server up?`);
  }
  if (!(await page.text()).includes('id="share"')) {
    throw new Error(`${url} has no infographic (no #share block).`);
  }

  const out = path.join("hugo/static/assets/scholarship", `${slug}.png`);
  const chrome = Bun.spawn(
    [
      findChrome(),
      "--headless=new",
      "--hide-scrollbars",
      "--force-device-scale-factor=2",
      `--window-size=${WIDTH},${HEIGHT}`,
      "--virtual-time-budget=5000",
      `--screenshot=${path.resolve(out)}`,
      `${url}#share`,
    ],
    { stdout: "ignore", stderr: "pipe" },
  );
  if ((await chrome.exited) !== 0 || !(await Bun.file(out).exists())) {
    throw new Error(
      `Chrome did not write ${out}:\n${await new Response(chrome.stderr).text()}`,
    );
  }
  console.log(`✓ ${out} (${WIDTH}×${HEIGHT} at 2x)`);
}

await main();
