/**
 * Short cites (source-short-cites.html, #224), tested at the built page: Hugo
 * builds the site from __fixtures__/short-cites, one Timeline Entry that cites
 * a source of each author-line shape, and the test reads each row's key in
 * the Timeline's Sources used table. Sources come from hugo/data.
 */
import { beforeAll, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const HUGO_DIR = path.join(import.meta.dir, "../../hugo");
const CONTENT_DIR = path.join(import.meta.dir, "__fixtures__/short-cites");
const hasHugo = Bun.which("hugo") !== null;
if (!hasHugo) {
  console.warn(
    "⚠ short-cites.test.ts: hugo is not on PATH, so the short cite tests are SKIPPED. Install Hugo to run them.",
  );
}

async function buildTimeline(): Promise<string> {
  const out = await mkdtemp(path.join(tmpdir(), "short-cites-"));
  const proc = Bun.spawn(
    ["hugo", "--quiet", "--contentDir", CONTENT_DIR, "--destination", out],
    { cwd: HUGO_DIR, stderr: "pipe", stdout: "pipe" },
  );
  if ((await proc.exited) !== 0)
    throw new Error(`hugo failed: ${await new Response(proc.stderr).text()}`);
  const html = await Bun.file(path.join(out, "timeline/index.html")).text();
  await rm(out, { force: true, recursive: true });
  return html;
}

/** Each Sources used row's External Source id → its short cite. */
function shortCites(html: string): Record<string, string> {
  const cites: Record<string, string> = {};
  let id = "";
  new HTMLRewriter()
    .on("tr.scholarship-source", {
      element(e) {
        id = (e.getAttribute("id") ?? "").replace(/^source-/, "");
        cites[id] = "";
      },
    })
    .on(".scholarship-source__key", {
      text(t) {
        cites[id] += t.text;
      },
    })
    .transform(html);
  return Object.fromEntries(
    Object.entries(cites).map(([k, v]) => [
      k,
      v.replaceAll(/\s+/g, " ").trim(),
    ]),
  );
}

describe.skipIf(!hasHugo)("short cites", () => {
  let cites: Record<string, string>;
  beforeAll(async () => {
    cites = shortCites(await buildTimeline());
  });

  test.each([
    // Three or more names: first surname, then et al.
    ["garfinkel-2012-khirbet-qeiyafa", "Garfinkel et al. 2012"],
    ["krause-sergi-weingart-2020-saul-benjamin", "Krause et al. 2020"],
    ["yanko-hombach-2006-black-sea", "Yanko-Hombach et al. 2006"],
    ["casabianca-2019-raw-data", "Casabianca et al. 2019"],
    ["kee-2007-cambridge-companion-greek-roman", "Kee et al. 2007"],
    // A particle stays with the surname.
    ["dilazzaro-2020-radiocarbon-shroud", "Di Lazzaro et al. 2020"],
    ["de-caro-2022-xray-dating", "De Caro et al. 2022"],
    ["van-deventer-2003-daniel-structure", "van Deventer 2003"],
    // "et al." in the author line is kept after the first surname.
    ["damon-1989-radiocarbon-shroud", "Damon et al. 1989"],
    ["popovic-2025-dating-scrolls", "Popović et al. 2025"],
    // Two names, editors, one name, a suffix, letter suffixes.
    ["henze-werline-2020-ejmi", "Henze and Werline 2020"],
    ["magness-2012-archaeology-holy-land-intro", "Magness 2012"],
    ["mccarter-2008-hebrew", "McCarter 2008"],
    ["coogan-brief-4e-summary-ch4", "Coogan and Chapman 2019a"],
    ["coogan-brief-4e-summary-ch5", "Coogan and Chapman 2019b"],
    // A registry shortAuthor replaces the derived name (#225).
    ["john-paul-ii-1998-turin-address", "John Paul II 1998"],
    ["davis-bledsoe-2015-editions", "Davis Bledsoe 2015"],
    ["merrill-willis-bo-daniel", "Merrill Willis 2015"],
    // No author: the title, never split on its " and ".
    [
      "gotquestions-kings-israel-judah",
      "Who were the kings of Israel and Judah?",
    ],
  ])("%s → %s", (id, cite) => {
    expect(cites[id]).toBe(cite);
  });
});
