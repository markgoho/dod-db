/**
 * The Timeline minimap (#167 §1–§3), tested at the built page: Hugo builds the
 * site to a temporary directory, with and without drafts, and the tests read
 * the Timeline's HTML. Browser behaviour (scrollspy, fixed rail, popover) is
 * checked in Chrome, not here.
 */
import { beforeAll, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const HUGO_DIR = path.join(import.meta.dir, "../../hugo");
const hasHugo = Bun.which("hugo") !== null;
if (!hasHugo) {
  console.warn(
    "\u26A0 timeline-minimap.test.ts: hugo is not on PATH, so the Timeline minimap tests are SKIPPED. Install Hugo to run them.",
  );
}

interface El {
  tag: string;
  attrs: Record<string, string>;
  text: string;
}

async function buildTimeline(drafts: boolean): Promise<string> {
  const out = await mkdtemp(path.join(tmpdir(), "timeline-minimap-"));
  const proc = Bun.spawn(
    ["hugo", "--quiet", "--destination", out, ...(drafts ? ["-D"] : [])],
    { cwd: HUGO_DIR, stderr: "pipe", stdout: "pipe" },
  );
  if ((await proc.exited) !== 0)
    throw new Error(`hugo failed: ${await new Response(proc.stderr).text()}`);
  const html = await Bun.file(path.join(out, "timeline/index.html")).text();
  await rm(out, { force: true, recursive: true });
  return html;
}

/** Every element matching `selector`, with its attributes and text. */
function select(html: string, selector: string): El[] {
  const found: El[] = [];
  new HTMLRewriter()
    .on(selector, {
      element(e) {
        const el: El = {
          attrs: Object.fromEntries(e.attributes),
          tag: e.tagName,
          text: "",
        };
        found.push(el);
        e.onEndTag(() => {});
      },
      text(t) {
        const el = found.at(-1);
        if (el) el.text += t.text;
      },
    })
    .transform(html);
  return found;
}

const ids = (els: El[]) => els.map(e => e.attrs.id ?? "");
const hrefs = (els: El[]) => els.map(e => e.attrs.href?.replace(/^#/, ""));
/** The numeric custom properties in an element's style attribute. */
const vars = (el: El | undefined): Record<string, number> =>
  Object.fromEntries(
    [...(el?.attrs.style ?? "").matchAll(/--([\w-]+): (-?[\d.e-]+)/g)].map(
      m => [m[1], Number(m[2])],
    ),
  );

/** The generated selector for "the scrollspy link with this attribute is current". */
const on = (attr: string, value: string) =>
  `.timeline-minimap:has(.timeline-minimap__spy [${attr}="${value}"]:is(:target-current, .target-current))`;

/** A stylesheet's rules: each one's comma-split selectors and its trimmed body. */
function parseRules(css: string): { selectors: string[]; body: string }[] {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m => ({
    body: m[2]!.trim().replace(/;$/, ""),
    selectors: m[1]!.split(/,(?![^()]*\))/).map(s => s.trim()),
  }));
}

describe.skipIf(!hasHugo)("Timeline minimap", () => {
  let page = "";
  let published = "";

  beforeAll(async () => {
    [page, published] = await Promise.all([
      buildTimeline(true),
      buildTimeline(false),
    ]);
    // Two full site builds: well past Bun's 5s default on a busy machine.
  }, 60_000);

  test("each era is a link to its axis band, which takes focus", () => {
    const bands = select(page, ".timeline-axis > .timeline-era");
    const eraLinks = select(page, ".timeline-minimap__era");
    expect(bands.length).toBeGreaterThan(1);
    expect(hrefs(eraLinks)).toEqual(ids(bands));
    for (const b of bands) expect(b.attrs.tabindex).toBe("-1");
    for (const a of eraLinks) expect(a.attrs.tabindex).toBeUndefined();
  });

  test("each axis entry is a tick at its year, a link skipped by Tab", () => {
    const entries = select(page, ".timeline-axis .timeline-entry");
    const ticks = select(page, ".timeline-minimap__tick");
    expect(hrefs(ticks)).toEqual(ids(entries));
    for (const e of entries) expect(e.attrs.tabindex).toBe("-1");
    for (const t of ticks) expect(t.attrs.tabindex).toBe("-1");

    const at = ticks.map(t => vars(t)["tick-at"]!);
    expect(at.every(p => p >= 0 && p < 1)).toBe(true);
    expect(at).toEqual(at.toSorted((a, b) => a - b));
  });

  test("ticks closer than a hit apart take different sideways steps, the lowest free one", () => {
    // --tick-hit-share: one hit as a share of the shortest strip.
    const hit = vars(select(page, ".timeline-minimap__ticks")[0])[
      "tick-hit-share"
    ]!;
    expect(hit).toBeGreaterThan(0);
    const ticks = select(page, ".timeline-minimap__tick").map(t => ({
      at: vars(t)["tick-at"]!,
      id: t.attrs["data-tick"]!,
      step: vars(t)["tick-step"]!,
    }));
    for (const [i, t] of ticks.entries()) {
      const near = ticks
        .slice(0, i)
        .filter(u => t.at - u.at < hit)
        .map(u => u.step);
      expect(near).not.toContain(t.step);
    }

    const step = Object.fromEntries(ticks.map(t => [t.id, t.step]));
    // Creation (4004 BCE) and Adam (4000 BCE) once drew as one tick.
    expect([step.creation, step.adam]).toEqual([0, 1]);
    // Three entries at 587 BCE.
    expect([
      step["fall-of-jerusalem"],
      step.lamentations,
      step["priestly-genesis-1"],
    ]).toEqual([1, 2, 3]);
    // Far from any other tick.
    expect(step.flood).toBe(0);
  });

  test("a tick placed by a tradition's date is marked as one", () => {
    const placed = ids(
      select(page, ".timeline-axis .timeline-entry--by-tradition"),
    );
    const ticks = hrefs(select(page, ".timeline-minimap__tick--placed"));
    expect(placed.length).toBeGreaterThan(0);
    expect(ticks).toEqual(placed);
  });

  test("the scrollspy targets entries only, each tagged with its era", () => {
    const spy = select(page, ".timeline-minimap__spy a");
    expect(hrefs(spy)).toEqual(
      ids(select(page, ".timeline-axis .timeline-entry")),
    );
    for (const a of spy) {
      const era = select(
        page,
        `#${a.attrs["data-entry-era"]} [id="${a.attrs.href?.slice(1)}"]`,
      );
      expect(era).toHaveLength(1);
    }
  });

  test("the caption has a label per entry, shown by a generated :has() rule", () => {
    const daniel = select(
      page,
      '.timeline-minimap__caption [data-now="daniel"]',
    );
    expect(daniel.map(e => e.text.replaceAll(/\s+/g, " ").trim())).toEqual([
      "Daniel 167–164 BCE",
    ]);
  });

  test("the generated rules set only the --is-current flag, one selector per entry and era", () => {
    const rules = parseRules(
      select(page, ".timeline-minimap style")[0]?.text ?? "",
    );
    for (const r of rules) expect(r.body).toBe("--is-current: 1");

    const entries = ids(select(page, ".timeline-axis .timeline-entry"));
    const eras = ids(select(page, ".timeline-axis > .timeline-era"));
    expect(rules.flatMap(r => r.selectors)).toEqual([
      ...entries.map(id => `${on("href", `#${id}`)} [data-now="${id}"]`),
      ...eras.map(id => `${on("data-entry-era", id)} [data-now="${id}"]`),
      ...eras.map(id => `${on("data-entry-era", id)} [data-era="${id}"]`),
      ...entries.map(id => `${on("href", `#${id}`)} [data-tick="${id}"]`),
      `${on("href", "#daniel")} [data-setting="daniel"]`,
    ]);
  });

  test('a card\'s setting line reads "Set in" and its display', () => {
    const line = select(page, '[id="daniel"] .timeline-entry__setting');
    expect(line.map(e => e.text.trim())).toEqual([
      "Set in the Babylonian exile, in the sixth century BCE",
    ]);
  });

  test("a narrated setting with years is a span at its years, arced to its tick, shown only while its entry is current", () => {
    // Only Daniel's setting has years; Deuteronomy's and Judges' have none.
    const settings = select(page, ".timeline-minimap__setting");
    expect(settings.map(s => s.attrs["data-setting"])).toEqual(["daniel"]);
    expect(settings[0]?.attrs["aria-hidden"]).toBe("true");

    // The strip runs 5000 BCE to 0; Daniel is set 600–501 BCE.
    const span = vars(
      select(
        page,
        '[data-setting="daniel"] .timeline-minimap__setting-span',
      )[0],
    );
    expect(span["setting-start"]).toBeCloseTo(4400 / 5000, 4);
    expect(span["setting-end"]).toBeCloseTo(4499 / 5000, 4);

    // The arc joins the span's middle to Daniel's tick.
    const tick = vars(select(page, '[data-tick="daniel"]')[0]);
    const arc = vars(
      select(page, '[data-setting="daniel"] .timeline-minimap__setting-arc')[0],
    );
    expect(arc["arc-start"]).toBeCloseTo((4400 + 4499) / 2 / 5000, 4);
    expect(arc["arc-end"]).toBeCloseTo(tick["tick-at"]!, 4);
  });

  test("the minimap script loads once, from the footer scripts, not inside the minimap", () => {
    const script = '[src*="timeline-minimap"]';
    expect(select(page, `script${script}`)).toHaveLength(1);
    expect(select(page, `.timeline-minimap script`)).toHaveLength(0);
    expect(select(page, `body > script${script}`)).toHaveLength(1);
  });

  test("without drafts, the page shows the notice and no minimap or its script", () => {
    expect(select(published, ".timeline-minimap")).toHaveLength(0);
    expect(select(published, 'script[src*="timeline-minimap"]')).toHaveLength(
      0,
    );
    expect(select(published, ".scholarship-notice")).toHaveLength(1);
  });
});
