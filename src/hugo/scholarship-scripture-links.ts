/**
 * BibleGateway links for Scholarship Page statements, added at render time.
 *
 * Front matter keeps each statement's `text` and every cited `quote` verbatim:
 * quotes are script-matched against their sources, so a link can't be written
 * into them. Instead this module maps each string that names a chapter or
 * verse to its linked HTML, and `hugo/layouts/partials/scripture-linked.html`
 * swaps the string for that HTML. A string missing from the map renders as
 * plain text, so an edited statement never shows a stale link;
 * `check:scholarship` fails until the map is regenerated.
 *
 * Usage: bun run generate:scholarship-scripture
 */

import { Glob } from "bun";
import path from "node:path";
import { buildBibleGatewayUrl } from "./build-bible-gateway-url.js";
import { PageSchema, readFrontmatter } from "./check-scholarship.js";
import { findScriptureMatches } from "./find-scripture-matches.js";

export const LINKS_PATH = "hugo/data/scripture-links.json";

export type ScriptureLinks = Record<string, string>;

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&#34;")
    .replaceAll("'", "&#39;");
}

/**
 * The text as HTML with each chapter- or verse-level Scripture Reference
 * linked to BibleGateway (NRSVUE), as the `scripture` shortcode links them.
 * Bare book names ("2 Timothy") stay plain: a page on authorship names every
 * letter, and a book-level link only opens chapter 1. Returns undefined when
 * nothing is linked.
 */
export function linkScripture(text: string): string | undefined {
  const matches = findScriptureMatches(text)
    .filter(match => match.normalizedReference !== match.book)
    .toSorted((a, b) => a.start - b.start);
  if (matches.length === 0) return undefined;

  let html = "";
  let at = 0;
  for (const match of matches) {
    const reference = escapeHtml(match.normalizedReference);
    html += escapeHtml(text.slice(at, match.start));
    html += `<a href="${escapeHtml(buildBibleGatewayUrl(match.normalizedReference))}" class="scripture-reference" target="_blank" rel="noopener noreferrer" title="Read ${reference} (NRSVUE)">${escapeHtml(match.originalText)}</a>`;
    at = match.end;
  }
  return html + escapeHtml(text.slice(at));
}

/** Every statement `text` and cited `quote` across the Scholarship Pages. */
export async function scholarshipStrings(root: string): Promise<string[]> {
  const contentDir = path.join(root, "hugo/content/scholarship");
  const files = (
    await Array.fromAsync(new Glob("*.md").scan({ cwd: contentDir }))
  )
    .filter(file => file !== "_index.md")
    .toSorted();

  const strings: string[] = [];
  for (const file of files) {
    const parsed = PageSchema.safeParse(
      await readFrontmatter(path.join(contentDir, file)),
    );
    if (!parsed.success) continue; // check:scholarship reports it
    for (const statement of parsed.data.statements) {
      strings.push(statement.text, ...statement.cites.map(cite => cite.quote));
    }
  }
  return strings;
}

export function buildScriptureLinks(strings: string[]): ScriptureLinks {
  const links: ScriptureLinks = {};
  for (const text of strings.toSorted()) {
    const html = linkScripture(text);
    if (html !== undefined) links[text] = html;
  }
  return links;
}

/** Problems with the committed map: a linkable string missing or stale. */
export async function checkScriptureLinks(root: string): Promise<string[]> {
  const file = Bun.file(path.join(root, LINKS_PATH));
  const committed: ScriptureLinks = (await file.exists())
    ? ((await file.json()) as ScriptureLinks)
    : {};
  const expected = buildScriptureLinks(await scholarshipStrings(root));
  const stale = Object.keys(expected).filter(
    text => committed[text] !== expected[text],
  ).length;
  return stale === 0
    ? []
    : [
        `${LINKS_PATH}: ${stale} statement text(s) or quote(s) lack current scripture links; run \`bun run generate:scholarship-scripture\``,
      ];
}

if (import.meta.main) {
  const root = path.resolve(import.meta.dir, "../..");
  const links = buildScriptureLinks(await scholarshipStrings(root));
  await Bun.write(
    path.join(root, LINKS_PATH),
    `${JSON.stringify(links, undefined, 2)}\n`,
  );
  console.log(
    `✓ ${LINKS_PATH}: ${Object.keys(links).length} strings with scripture links`,
  );
}
