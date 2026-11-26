/**
 * The Timeline minimap (#167 §1–§3), tested at the built page: Hugo builds the
 * site to a temporary directory, with and without drafts, and the tests read
 * the Timeline's HTML. The build reads a frozen set of entries from
 * __fixtures__/timeline-minimap (copies of published entries; Isaiah 56–66 is
 * a draft there), not hugo/content, so publishing an entry never moves a
 * tick, slot or band the tests expect (#204). Sources and Trigger Claims
 * still come from hugo/data. Browser behaviour (scrollspy, fixed rail, popover) is
 * checked in Chrome, not here.
 */
import { beforeAll, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const HUGO_DIR = path.join(import.meta.dir, "../../hugo");
const CONTENT_DIR = path.join(import.meta.dir, "__fixtures__/timeline-minimap");
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
    [
      "hugo",
      "--quiet",
      "--contentDir",
      CONTENT_DIR,
      "--destination",
      out,
      ...(drafts ? ["-D"] : []),
    ],
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
          // Hugo escapes "+" in a style attribute; the browser reads it back as "+".
          attrs: Object.fromEntries(
            [...e.attributes].map(([k, v]) => [k, v.replaceAll("&#43;", "+")]),
          ),
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
const squash = (t: string | undefined) => t?.replaceAll(/\s+/g, " ").trim();
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
    // Two site builds: well past Bun's 5s default on a busy machine.
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

  test("each tick shows its entry's title and date in a hint popover on interest, and the hint holds nothing to Tab to", () => {
    const ticks = select(page, ".timeline-minimap__tick");
    const tips = select(page, ".timeline-minimap__tip");
    expect(tips.map(t => t.attrs.popover)).toEqual(ticks.map(() => "hint"));
    expect(ticks.map(t => t.attrs.interestfor)).toEqual(ids(tips));
    expect(ids(tips)).toEqual(
      ticks.map(t => `timeline-minimap-tip-${t.attrs["data-tick"]}`),
    );
    const text = (id: string) =>
      select(page, `[id="timeline-minimap-tip-${id}"]`)[0]
        ?.text.replaceAll(/\s+/g, " ")
        .trim();
    expect(text("daniel")).toBe("Daniel 167–164 BCE");
    expect(text("creation")).toMatch(
      /^Creation .+ \(placed by a tradition’s date\)$/,
    );
    for (const focusable of ["a", "button", "[tabindex]"])
      expect(select(page, `.timeline-minimap__tip ${focusable}`)).toHaveLength(
        0,
      );
  });

  test("ticks closer than a dot apart share a row: each stays at its year and takes the lowest slot inward none of them has", () => {
    // A dot's pitch is under 0.04 of any strip, 200 years: Creation and Adam
    // (4004, 4000 BCE) once drew as one tick, and three entries share 587 BCE.
    const ticks = select(page, ".timeline-minimap__tick");
    expect(
      ticks.map(t => [t.attrs["data-tick"], vars(t)["tick-slot"]]),
    ).toEqual([
      ["creation", 0],
      ["adam", 1],
      ["jericho", 0],
      // Tradition Dates at their own years (#214) take slots like any tick.
      ["deuteronomy-tradition", 1],
      ["jericho-tradition", 2],
      ["david-and-solomon", 0],
      // Within a dot of David and Solomon (1000 BCE), so slot 1.
      ["deuteronomy", 1],
      // Clear of David and Solomon, and Deuteronomy holds 1, so slot 0.
      ["judges-dtr", 0],
      ["fall-of-jerusalem", 1],
      ["lamentations", 2],
      ["priestly-genesis-1", 3],
      ["daniel-tradition", 4],
      ["isaiah-56-66", 5],
      ["daniel", 0],
    ]);
    // Nothing moves a dot off its year.
    for (const t of ticks) expect(t.attrs.style).not.toContain("--tick-stack");
  });

  test("each band is placed by its era's years on the same scale as the ticks, so every tick falls in its own band", () => {
    const bands = select(page, ".timeline-minimap__band");
    // The strip runs 5000 BCE to 0 in 1000- and 500-year eras.
    expect(bands.map(b => [vars(b)["era-start"], vars(b)["era-end"]])).toEqual([
      [0, 0.2],
      [0.2, 0.4],
      [0.4, 0.6],
      [0.6, 0.7],
      [0.7, 0.8],
      [0.8, 0.9],
      [0.9, 1],
    ]);
    const byEra = new Map(bands.map(b => [b.attrs["data-era"], vars(b)]));
    for (const a of select(page, ".timeline-minimap__spy a")) {
      const band = byEra.get(a.attrs["data-entry-era"])!;
      const at = vars(
        select(page, `[data-tick="${a.attrs.href?.slice(1)}"]`)[0],
      )["tick-at"]!;
      expect(at).toBeGreaterThanOrEqual(band["era-start"]!);
      expect(at).toBeLessThan(band["era-end"]!);
    }
  });

  test("under the strip, a three-item legend names the three dots, in the Timeline's own labels", () => {
    const items = select(page, ".timeline-minimap__legend > li");
    expect(items.map(i => squash(i.text))).toEqual([
      "Placed by a scholarly date",
      "Placed by a tradition’s date",
      "A tradition’s date for an entry scholars date elsewhere",
    ]);
    // The diamond's words are the main legend's moved heading.
    expect(squash(select(page, ".timeline-legend strong")[1]?.text)).toBe(
      `${squash(items[2]?.text)}:`,
    );
    // The hollow dot's words are the main legend's placed heading.
    expect(squash(select(page, ".timeline-legend strong")[0]?.text)).toBe(
      `${squash(items[1]?.text)}:`,
    );
    const dots = select(
      page,
      ".timeline-minimap__legend .timeline-minimap__dot",
    );
    expect(dots.map(d => [d.attrs.class, d.attrs["aria-hidden"]])).toEqual([
      ["timeline-minimap__dot", "true"],
      ["timeline-minimap__dot timeline-minimap__dot--placed", "true"],
      ["timeline-minimap__dot timeline-minimap__dot--moved", "true"],
    ]);
  });

  test("a Tradition Date 30 or more years from the Critical Date sits at its own year, as its own row and diamond tick; a closer one stays beside its entry (#214)", () => {
    const moved = select(page, ".timeline-axis .timeline-entry--moved");
    expect(ids(moved)).toEqual([
      "deuteronomy-tradition",
      "jericho-tradition",
      "daniel-tradition",
    ]);
    expect(hrefs(select(page, ".timeline-minimap__tick--moved"))).toEqual(
      ids(moved),
    );
    // Each moved row holds only its tradition card; its entry keeps no copy.
    for (const id of ids(moved)) {
      const entry = id.replace(/-tradition$/, "");
      expect(select(page, `[id="${id}"] .timeline-entry__card`)).toHaveLength(
        0,
      );
      expect(
        select(page, `[id="${entry}"] .timeline-entry__tradition`),
      ).toHaveLength(0);
    }
    // David and Solomon: 10th century BCE (1000–901) against 1009–931 BCE,
    // middles 20 years apart: beside the entry, no link.
    expect(
      select(page, '[id="david-and-solomon"] .timeline-entry__tradition'),
    ).toHaveLength(1);
    expect(
      select(page, '[id="david-and-solomon"] .timeline-entry__jump'),
    ).toHaveLength(0);
    expect(select(page, '[id="david-and-solomon-tradition"]')).toHaveLength(0);
  });

  test("an entry and its moved Tradition Date link to each other, naming the tradition, the gap and its direction", () => {
    const link = (id: string) =>
      select(page, `[id="${id}"] .timeline-entry__jump a`).map(a => [
        a.attrs.href,
        squash(a.text),
      ]);
    // Its own page is the link to share (#219), apart from the jump.
    expect(
      select(page, '[id="daniel"] .timeline-entry__share a').map(
        a => a.attrs.href,
      ),
    ).toEqual(["/timeline/daniel/"]);
    expect(link("daniel")).toEqual([
      [
        "#daniel-tradition",
        "↑ Got Questions Ministries, an evangelical ministry, holds 540–530 BCE, roughly 370 years earlier",
      ],
    ]);
    expect(link("daniel-tradition")).toEqual([
      [
        "#daniel",
        "↓ Scholarly and reference sources: 167–164 BCE, roughly 370 years later",
      ],
    ]);
    // Jericho's tradition is later than the scholars' date.
    expect(link("jericho")).toEqual([
      [
        "#jericho-tradition",
        "↓ Associates for Biblical Research, an evangelical apologetics ministry, holds about 1400 BCE, roughly 140 years later",
      ],
    ]);
    expect(link("jericho-tradition")).toEqual([
      [
        "#jericho",
        "↑ Scholarly and reference sources: 1550–1520 BCE, roughly 140 years earlier",
      ],
    ]);
    expect(
      select(page, '[id="daniel-tradition"]')[0]?.attrs["aria-label"],
    ).toBe(
      "Daniel. Got Questions Ministries, an evangelical ministry, holds 540 to 530 BCE. A tradition’s date for an entry scholars date elsewhere.",
    );
  });

  test("a moved Tradition Date is not an entry of its own in the structured data", () => {
    const jsonLd = select(page, 'script[type="application/ld+json"]')
      .map(s => s.text)
      .join("");
    expect(jsonLd).toContain("Daniel");
    expect(jsonLd).not.toContain("-tradition");
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

  test("the era pill has a label per era, in axis order, each shown by its era's generated rule", () => {
    const pill = select(page, ".timeline-minimap__era-pill");
    expect(pill).toHaveLength(1);
    expect(pill[0]?.attrs["aria-hidden"]).toBe("true");

    const labels = select(page, ".timeline-minimap__era-pill [data-now]");
    const eras = select(page, ".timeline-axis > .timeline-era");
    expect(labels.map(l => l.attrs["data-now"])).toEqual(ids(eras));
    expect(labels.map(l => l.text.trim())).toEqual(
      select(page, ".timeline-axis > .timeline-era > .timeline-era__label").map(
        h => h.text.trim(),
      ),
    );

    const selectors = parseRules(
      select(page, ".timeline-minimap style")[0]?.text ?? "",
    ).flatMap(r => r.selectors);
    for (const id of ids(eras))
      expect(selectors).toContain(
        `${on("data-entry-era", id)} [data-now="${id}"]`,
      );
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
    expect(line.map(e => squash(e.text))).toEqual([
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

    // The arc joins the span's middle to Daniel's dot: at its year, and in
    // its slot, which the setting carries too.
    const arc = vars(
      select(page, '[data-setting="daniel"] .timeline-minimap__setting-arc')[0],
    );
    const tick = vars(select(page, '[data-tick="daniel"]')[0]);
    expect(arc["arc-mid"]).toBeCloseTo((4400 + 4499) / 2 / 5000, 4);
    expect(vars(settings[0])).toEqual({
      "tick-at": tick["tick-at"]!,
      "tick-slot": tick["tick-slot"]!,
    });
  });

  test("the minimap script loads once, from the footer scripts, not inside the minimap", () => {
    const script = '[src*="timeline-minimap"]';
    expect(select(page, `script${script}`)).toHaveLength(1);
    expect(select(page, `.timeline-minimap script`)).toHaveLength(0);
    expect(select(page, `body > script${script}`)).toHaveLength(1);
  });

  test("Sources used is a closed disclosure whose summary counts its rows, and every source link lands on a row inside it", () => {
    const sources = select(page, "details.timeline-sources");
    expect(sources).toHaveLength(1);
    expect(sources[0]?.attrs.open).toBeUndefined();

    const rows = ids(
      select(page, "details.timeline-sources .scholarship-source"),
    );
    const summary = select(page, "details.timeline-sources > summary")[0];
    expect(summary?.text.replaceAll(/\s+/g, " ").trim()).toBe(
      `Sources used ${rows.length} sources`,
    );

    const linked = new Set(
      select(page, 'a[href^="#source-"]').map(a => a.attrs.href!.slice(1)),
    );
    expect(linked.size).toBeGreaterThan(0);
    expect([...linked].filter(id => !rows.includes(id))).toEqual([]);
  });

  test("without drafts, the published entries get the notice, the minimap and its script, and a draft gets no tick", () => {
    expect(hrefs(select(page, ".timeline-minimap__tick"))).toContain(
      "isaiah-56-66",
    );
    expect(hrefs(select(published, ".timeline-minimap__tick"))).not.toContain(
      "isaiah-56-66",
    );
    expect(select(published, ".timeline-minimap")).toHaveLength(1);
    expect(select(published, 'script[src*="timeline-minimap"]')).toHaveLength(
      1,
    );
    expect(select(published, ".scholarship-notice")).toHaveLength(1);
  });
});
