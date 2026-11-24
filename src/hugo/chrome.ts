/** Headless Chrome screenshots for the Scholarship image renderers. */

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const CHROME_NAMES = [
  "google-chrome",
  "google-chrome-stable",
  "chromium",
  "chromium-browser",
];

const TIMEOUT_MS = 30_000;

export function findChrome(): string {
  const chrome =
    process.env["CHROME_BIN"] ??
    CHROME_NAMES.map(name => Bun.which(name)).find(Boolean);
  if (!chrome) {
    throw new Error("No Chrome found. Set CHROME_BIN to a Chrome binary.");
  }
  return chrome;
}

/**
 * Photograph `url` at width by height CSS px, at `scale` device px per CSS px.
 * Headless Chrome sometimes writes the screenshot and then never exits, so a
 * run past the timeout is killed: kept if it wrote the file, else retried once.
 */
export async function screenshot(
  url: string,
  out: string,
  size: { width: number; height: number; scale: number },
  attempt = 1,
): Promise<void> {
  await rm(out, { force: true });
  // Its own profile, so parallel runs don't wait on one another's profile lock.
  const profile = await mkdtemp(path.join(tmpdir(), "scholarship-chrome-"));
  const chrome = Bun.spawn(
    [
      findChrome(),
      `--user-data-dir=${profile}`,
      "--headless=new",
      "--hide-scrollbars",
      `--force-device-scale-factor=${size.scale}`,
      `--window-size=${size.width},${size.height}`,
      "--virtual-time-budget=5000",
      `--screenshot=${out}`,
      url,
    ],
    { stdout: "ignore", stderr: "pipe", timeout: TIMEOUT_MS },
  );
  const exitCode = await chrome.exited;
  await rm(profile, { recursive: true, force: true });
  const file = Bun.file(out);
  if ((await file.exists()) && file.size > 0) return;
  if (attempt < 2) return screenshot(url, out, size, attempt + 1);
  throw new Error(
    `Chrome (exit ${exitCode}) did not write ${out}:\n${await new Response(chrome.stderr).text()}`,
  );
}
