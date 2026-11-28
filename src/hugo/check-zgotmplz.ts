/**
 * Fail when the built site contains `ZgotmplZ`: the marker Go's html/template
 * writes in place of a value it judges unsafe in context, such as a URL built
 * by concatenation without `safeURL`. The build passes and the link only fails
 * on click, so scan the output instead.
 *
 * Usage: bun run check:zgotmplz   (after a build into hugo/public)
 */

import { Glob } from "bun";
import { stat } from "node:fs/promises";
import path from "node:path";

const MARKER = /#?ZgotmplZ/g;
const PAGES = new Glob("**/*.{html,xml}");

async function exists(dir: string): Promise<boolean> {
  try {
    return (await stat(dir)).isDirectory();
  } catch {
    return false;
  }
}

/** One `file:line: marker` problem per occurrence, by file then line. */
export async function checkZgotmplZ(publicDir: string): Promise<string[]> {
  const files = (await exists(publicDir))
    ? await Array.fromAsync(PAGES.scan({ cwd: publicDir }))
    : [];
  if (files.length === 0) {
    return [`no built pages in ${publicDir}; build the site first`];
  }
  const errors: string[] = [];
  for (const file of files.toSorted()) {
    const text = await Bun.file(path.join(publicDir, file)).text();
    if (!text.includes("ZgotmplZ")) continue;
    for (const [index, line] of text.split("\n").entries()) {
      for (const match of line.matchAll(MARKER)) {
        errors.push(`${file}:${index + 1}: ${match[0]}`);
      }
    }
  }
  return errors;
}

if (import.meta.main) {
  const publicDir = path.resolve(import.meta.dir, "../../hugo/public");
  const errors = await checkZgotmplZ(publicDir);
  if (errors.length > 0) {
    for (const error of errors) console.error(`✗ ${error}`);
    console.error(
      `\ncheck:zgotmplz failed: ${errors.length} unsafe value(s) Hugo replaced with ZgotmplZ.` +
        "\nFor a URL, build it with printf and pipe it through safeURL.",
    );
    process.exit(1);
  }
  console.log("✓ check:zgotmplz passed");
}
