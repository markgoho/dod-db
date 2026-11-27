/**
 * The Timeline minimap (#167 §1–§3), tested at the built page: Hugo builds the
 * site to a temporary directory, with and without drafts, and the tests read
 * the Timeline's HTML. The build reads a frozen set of entries from
 * __fixtures__/timeline-minimap (copies of published entries; Isaiah 56–66 is
 * a draft there, and Lamentations' setting has years only there, for a setting
 * whose dot sits deep in its row, #175), not hugo/content, so publishing an
 * entry never moves a tick, slot or band the tests expect (#204). Sources and Trigger Claims
 * still come from hugo/data. One more frozen build,
 * __fixtures__/timeline-minimap-overflow, checks the packing at its limits:
 * twelve tradition dates in one year (one more than the row holds), a pair too
 * close to share a place, and an entry in the Common Era. The published
 * Timeline is never built here, so a publish cannot fail the suite; its build
 * warns (warnf) on any overflow or split. Browser behaviour (scrollspy, fixed
 * rail, popover, dot sizes) is checked in Chrome, not here.
 */
import { beforeAll, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const HUGO_DIR = path.join(import.meta.dir, "../../hugo");
const CONTENT_DIR = path.join(import.meta.dir, "__fixtures__/timeline-minimap");
const OVERFLOW_DIR = path.join(
  import.meta.dir,
  "__fixtures__/timeline-minimap-overflow",
);
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

async function buildTimeline(
  drafts: boolean,
  contentDir = CONTENT_DIR,
): Promise<string> {
  const out = await mkdtemp(path.join(tmpdir(), "timeline-minimap-"));
  const proc = Bun.spawn(
    [
      "hugo",
      "--quiet",
      "--contentDir",
      contentDir,
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

/**
 * The packing invariant, read from a built page: two ticks within the
 * strip's window of each other (measured, as the template does, between
 * positions nudged at most the strip's edge share in from their band's edges)
 * never share a place, and every place is inside the row. Overflowing ticks
 * hold no place; they are returned, with the strip's count. So are the pairs
 * (a dot and its moved Tradition Date's diamond) that do not share a place,
 * with the split ticks and the strip's split count, and any tick inside a
 * pair's corridor (its place, from a window before its first end to a window
 * after its last), where the pair's line would cross it.
 */
function packing(html: string) {
  const strip = select(html, ".timeline-minimap__strip")[0];
  const { "tick-window": window, "tick-edge": edge, places } = vars(strip);
  const ticks = select(html, ".timeline-minimap__tick").map(t => {
    const v = vars(t);
    return {
      id: t.attrs["data-tick"]!,
      lane: v["tick-lane"]!,
      overflow: "data-overflow" in t.attrs,
      split: "data-pair-split" in t.attrs,
      y: Math.min(
        Math.max(v["tick-at"]!, v["era-start"]! + edge!),
        v["era-end"]! - edge!,
      ),
    };
  });
  const shared: string[] = [];
  const outside: string[] = [];
  const placed = ticks.filter(t => !t.overflow);
  for (const [i, a] of placed.entries()) {
    if (Math.abs(a.lane) > (places! - 1) / 2) outside.push(a.id);
    for (const b of placed.slice(i + 1))
      if (a.lane === b.lane && Math.abs(a.y - b.y) < window!)
        shared.push(`${a.id} × ${b.id}`);
  }
  const lane = new Map(ticks.map(t => [t.id, t.lane]));
  const byId = new Map(ticks.map(t => [t.id, t]));
  const pairs = ticks
    .filter(t => t.id.endsWith("-tradition") && lane.has(t.id.slice(0, -10)))
    .map(t => t.id.slice(0, -10));
  const crossed: string[] = [];
  for (const id of pairs) {
    const dot = byId.get(id)!;
    const diamond = byId.get(`${id}-tradition`)!;
    if (dot.split) continue;
    const from = Math.min(dot.y, diamond.y) - window!;
    const to = Math.max(dot.y, diamond.y) + window!;
    for (const t of placed)
      if (
        t !== dot &&
        t !== diamond &&
        t.lane === dot.lane &&
        t.y > from &&
        t.y < to
      )
        crossed.push(`${id} × ${t.id}`);
  }
  return {
    crossed,
    outside,
    overflow: ticks.filter(t => t.overflow).map(t => t.id),
    pairs,
    places: places!,
    shared,
    split: ticks.filter(t => t.split).map(t => t.id),
    stripOverflow: Number(strip?.attrs["data-overflow"]),
    stripSplit: Number(strip?.attrs["data-pair-split"]),
    unshared: pairs.filter(id => lane.get(id) !== lane.get(`${id}-tradition`)),
  };
}

/** Where a tick, or a pair's wrapper or line, is placed: its year, place and band. */
const where = (v: Record<string, number>) => ({
  "era-end": v["era-end"]!,
  "era-start": v["era-start"]!,
  "tick-at": v["tick-at"]!,
  "tick-lane": v["tick-lane"]!,
});

/** The generated selector for "this tick, or its hint, is hovered", on the ticks layer. */
const hover = (id: string) =>
  `.timeline-minimap__ticks:has(:is([data-tick="${id}"], [id="timeline-minimap-tip-${id}"]):hover)`;

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
  let crowded = "";

  beforeAll(async () => {
    [page, published, crowded] = await Promise.all([
      buildTimeline(true),
      buildTimeline(false),
      buildTimeline(true, OVERFLOW_DIR),
    ]);
    // Three site builds: well past Bun's 5s default on a busy machine.
  }, 120_000);

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

  test("pairs take their places first, longest first, on the outermost place free of other corridors; every other tick takes the lowest free place outside the corridors, fanning out from the row's centre, and stays at its year", () => {
    // One row for every kind: the shapes tell them apart.
    const ticks = select(page, ".timeline-minimap__tick");
    expect(
      ticks.map(t => [
        t.attrs["data-tick"],
        vars(t)["tick-slot"],
        vars(t)["tick-lane"],
      ]),
    ).toEqual([
      // Creation and Adam (4004, 4000 BCE): one place each, side by side.
      ["creation", 0, 0],
      // Places fan out: 0 on the row's centre line, then 1, -1, 2, -2.
      ["adam", 1, 1],
      // Jericho's pair (1550 and 1400 BCE) is the shortest: its corridor
      // overlaps Deuteronomy's, so it takes the next outermost place, -5.
      ["jericho", 10, -5],
      // Deuteronomy's pair (1406 and 800 BCE), the longest, takes the
      // outermost place, 5.
      ["deuteronomy-tradition", 9, 5],
      ["jericho-tradition", 10, -5],
      ["david-and-solomon", 0, 0],
      ["deuteronomy", 9, 5],
      ["judges-dtr", 0, 0],
      ["fall-of-jerusalem", 1, 1],
      ["lamentations", 2, -1],
      ["priestly-genesis-1", 3, 2],
      // Daniel's pair (540 and 167 BCE) is clear of Deuteronomy's corridor,
      // so it shares place 5.
      ["daniel-tradition", 9, 5],
      // Isaiah 56–66 (515 BCE) is within the window of Judges (622 BCE) and
      // the three at 587 BCE, so it takes the next place, 4.
      ["isaiah-56-66", 4, -2],
      ["daniel", 9, 5],
    ]);
    // No vertical stacking: a dot stays at its year, nudged at most inside its band (CSS).
    for (const t of ticks) expect(t.attrs.style).not.toContain("--tick-stack");
  });

  test("the row's capacity is one template constant, emitted on the strip with the window the CSS sizes the dots by", () => {
    const strip = select(page, ".timeline-minimap__strip")[0];
    expect(vars(strip)).toEqual({
      places: 11,
      "tick-edge": 0.024,
      "tick-window": 0.032,
    });
  });

  test("no two ticks within the window share a place, none overflows, every pair shares a place and no tick sits in a pair's corridor: in the fixture, and in the crowded fixture but for its overflow and split", () => {
    const p = packing(page);
    expect(p.shared).toEqual([]);
    expect(p.outside).toEqual([]);
    expect(p.overflow).toEqual([]);
    expect(p.stripOverflow).toBe(0);
    expect(p.unshared).toEqual([]);
    expect(p.split).toEqual([]);
    expect(p.crossed).toEqual([]);
    expect(p.stripSplit).toBe(0);
    expect(packing(page).pairs).toEqual(["deuteronomy", "jericho", "daniel"]);
    const crowd = packing(crowded);
    expect(crowd.shared).toEqual([]);
    expect(crowd.outside).toEqual([]);
    expect(crowd.crossed).toEqual([]);
  });

  test("a tick with no free place is an overflow: marked, counted on the strip, and holding no place, never a silent collision", () => {
    // Twelve tradition dates at 4004 BCE, one more than the row's places.
    const p = packing(crowded);
    expect(p.places).toBe(11);
    expect(p.overflow).toEqual(["crowded-9"]);
    expect(p.stripOverflow).toBe(1);
    expect(p.shared).toEqual([]);
    expect(p.outside).toEqual([]);
    expect(
      vars(select(crowded, '[data-tick="crowded-9"]')[0])["tick-lane"],
    ).toBe(0);
  });

  test("a pair whose ends are within the window of each other splits: its ends are placed as single ticks, both marked and counted, and no line joins them", () => {
    // 1100 and 1135 BCE: in one place they would meet.
    const p = packing(crowded);
    expect(p.split).toEqual(["close-pair-tradition", "close-pair"]);
    expect(p.stripSplit).toBe(1);
    expect(p.unshared).toEqual(["close-pair"]);
    expect(p.shared).toEqual([]);
    const lane = (id: string) =>
      vars(select(crowded, `[data-tick="${id}"]`)[0])["tick-lane"];
    expect(lane("close-pair-tradition")).toBe(0);
    expect(lane("close-pair")).toBe(1);
    expect(select(crowded, ".timeline-minimap__pair")).toHaveLength(0);
  });

  test("the strip maps years piecewise: everything before 2000 BCE is one band drawn as tall as a 500-year band, its entries spread linearly in it, and the rest is to scale", () => {
    // The fixture's axis runs 5000 BCE to 0: one early band, drawn as 500
    // years, then four 500-year bands, so 2500 drawn years in all.
    const bands = select(page, ".timeline-minimap__band");
    expect(
      bands.map(b => [
        b.attrs["data-era"],
        vars(b)["era-start"],
        vars(b)["era-end"],
        b.attrs.class?.includes("timeline-minimap__band--compressed"),
      ]),
    ).toEqual([
      ["era-5000-bce", 0, 0.2, true],
      ["era-2000-bce", 0.2, 0.4, false],
      ["era-1500-bce", 0.4, 0.6, false],
      ["era-1000-bce", 0.6, 0.8, false],
      ["era-500-bce", 0.8, 1, false],
    ]);
    const at = (id: string) =>
      vars(select(page, `[data-tick="${id}"]`)[0])["tick-at"];
    // Inside the early band, 3000 years in 500 drawn years: (4004 BCE - 5000 BCE) / 3000 × 0.2.
    expect(at("creation")).toBeCloseTo((996 / 3000) * 0.2, 10);
    expect(at("adam")).toBeCloseTo((1000 / 3000) * 0.2, 10);
    // To scale after it: (500 + years after 2000 BCE) / 2500.
    expect(at("jericho")).toBeCloseTo((500 + 450) / 2500, 10);
    expect(at("daniel")).toBeCloseTo((500 + 1833) / 2500, 10);
    // The main Timeline has the one early era too, with its full label.
    expect(
      select(page, ".timeline-axis > .timeline-era > .timeline-era__label").map(
        h => h.text.trim(),
      )[0],
    ).toBe("5000–2000 BCE");
  });

  test("each tick carries its band's edges, on the strip's one mapping, so the CSS keeps its dot inside it (#175)", () => {
    const bands = select(page, ".timeline-minimap__band");
    const byEra = new Map(bands.map(b => [b.attrs["data-era"], vars(b)]));
    for (const a of select(page, ".timeline-minimap__spy a")) {
      const band = byEra.get(a.attrs["data-entry-era"])!;
      const tick = vars(
        select(page, `[data-tick="${a.attrs.href?.slice(1)}"]`)[0],
      );
      expect(tick["tick-at"]).toBeGreaterThanOrEqual(band["era-start"]!);
      expect(tick["tick-at"]).toBeLessThan(band["era-end"]!);
      expect(tick["era-start"]).toBe(band["era-start"]!);
      expect(tick["era-end"]).toBe(band["era-end"]!);
    }
    // Creation (4004 BCE) and Adam (4000 BCE) share the early band.
    const edges = (id: string) => {
      const v = vars(select(page, `[data-tick="${id}"]`)[0]);
      return [v["era-start"], v["era-end"]];
    };
    expect(edges("creation")).toEqual([0, 0.2]);
    expect(edges("adam")).toEqual([0, 0.2]);
  });

  test("on the rail each era's label is its start year, BCE marked above the year-0 line; the link's name and the popover keep the full label", () => {
    const eras = select(page, ".timeline-minimap__era");
    expect(eras.map(e => e.attrs["aria-label"])).toEqual([
      "5000–2000 BCE",
      "2000–1500 BCE",
      "1500–1000 BCE",
      "1000–500 BCE",
      "500–1 BCE",
    ]);
    expect(
      select(page, ".timeline-minimap__era-full").map(e => squash(e.text)),
    ).toEqual([
      "5000–2000 BCE",
      "2000–1500 BCE",
      "1500–1000 BCE",
      "1000–500 BCE",
      "500–1 BCE",
    ]);
    expect(
      select(page, ".timeline-minimap__era-start").map(e => squash(e.text)),
    ).toEqual(["5000", "2000", "1500", "1000", "500"]);
    // The last BCE band ends at year 0, so it carries the BCE mark and the ink line below it.
    expect(
      select(page, ".timeline-minimap__band--bce-end").map(
        b => b.attrs["data-era"],
      ),
    ).toEqual(["era-500-bce"]);
    expect(
      select(page, ".timeline-minimap__era-mark").map(e => squash(e.text)),
    ).toEqual(["BCE"]);
    // An axis that runs into CE: its first CE band starts "1 CE", after the BCE mark.
    expect(
      select(crowded, ".timeline-minimap__era-start").map(e => squash(e.text)),
    ).toEqual(["5000", "2000", "1500", "1000", "500", "1 CE"]);
  });

  test("the minimap has no legend: the strip takes the height, and the Timeline's own legend names the dots", () => {
    expect(select(page, ".timeline-minimap__legend")).toEqual([]);
    expect(select(page, ".timeline-minimap__dot")).toEqual([]);
    expect(select(page, ".timeline-legend")).not.toEqual([]);
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
    // Its own URL is the link to share (#219), apart from the jump.
    expect(
      select(page, '[id="daniel"] .scholarship-question__copy-button').map(
        button => new URL(button.attrs["data-url"] ?? "").pathname,
      ),
    ).toEqual(["/timeline/daniel"]);
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

  test("the generated rules set only flags: --is-current, one selector per entry and era (and per pair's connector), and flag the current entry on the axis", () => {
    const style = select(page, ".timeline-minimap style")[0]?.text ?? "";
    const [current, ...rest] = parseRules(style);
    expect(current?.body).toBe("--is-current: 1");
    for (const r of rest)
      expect(["--is-current: 1", "--is-partner: 1"]).toContain(r.body);

    const entries = ids(select(page, ".timeline-axis .timeline-entry"));
    const eras = ids(select(page, ".timeline-axis > .timeline-era"));
    expect(current?.selectors).toEqual([
      ...entries.map(id => `${on("href", `#${id}`)} [data-now="${id}"]`),
      ...eras.map(id => `${on("data-entry-era", id)} [data-now="${id}"]`),
      ...eras.map(id => `${on("data-entry-era", id)} [data-era="${id}"]`),
      ...entries.map(id => `${on("href", `#${id}`)} [data-tick="${id}"]`),
      `${on("href", "#lamentations")} [data-setting="lamentations"]`,
      `${on("href", "#daniel")} [data-setting="daniel"]`,
      // A pair's connector shows while either of its ticks is current.
      ...["deuteronomy", "jericho", "daniel"].flatMap(id => [
        `${on("href", `#${id}`)} [data-pair="${id}"]`,
        `${on("href", `#${id}-tradition`)} [data-pair="${id}"]`,
      ]),
      // The entry on the axis, a sibling of the minimap, so read from the layout.
      ...entries.map(
        id =>
          `.timeline-minimap-layout:has(.timeline-minimap__spy [href="#${id}"]:is(:target-current, .target-current)) .timeline-axis [id="${id}"]`,
      ),
    ]);
  });

  test("an entry's dot and its moved Tradition Date's diamond are a pair: a line in their shared place from the dot's year to the diamond's, and each marks the other as its partner while current or hovered", () => {
    const pairs = select(page, ".timeline-minimap__pair");
    expect(pairs.map(p => p.attrs["data-pair"])).toEqual([
      "deuteronomy",
      "jericho",
      "daniel",
    ]);
    for (const p of pairs) {
      const id = p.attrs["data-pair"]!;
      const dot = vars(select(page, `[data-tick="${id}"]`)[0]);
      const diamond = vars(select(page, `[data-tick="${id}-tradition"]`)[0]);
      const line = select(
        page,
        `[data-pair="${id}"] > .timeline-minimap__pair-line`,
      )[0];
      expect(p.attrs["aria-hidden"]).toBe("true");
      // The wrapper sits where the dot does; the line where the diamond does: one place, two years.
      expect(vars(p)).toEqual(where(dot));
      expect(vars(line)).toEqual(where(diamond));
      expect(dot["tick-lane"]).toBe(diamond["tick-lane"]!);
    }

    const style = select(page, ".timeline-minimap style")[0]?.text ?? "";
    const rules = parseRules(style);
    const partner = (a: string, b: string) => [
      `${on("href", `#${a}`)} [data-tick="${b}"]`,
      `${on("href", `#${b}`)} [data-tick="${a}"]`,
    ];
    const pairIds = ["deuteronomy", "jericho", "daniel"];
    expect(rules.slice(1).map(r => [r.body, r.selectors])).toEqual([
      [
        "--is-partner: 1",
        pairIds.flatMap(id => partner(id, `${id}-tradition`)),
      ],
      [
        "--is-partner: 1",
        pairIds.flatMap(id => [
          `${hover(id)} [data-tick="${id}-tradition"]`,
          `${hover(`${id}-tradition`)} [data-tick="${id}"]`,
        ]),
      ],
      [
        "--is-current: 1",
        pairIds.flatMap(id => [
          `${hover(id)} [data-pair="${id}"]`,
          `${hover(`${id}-tradition`)} [data-pair="${id}"]`,
        ]),
      ],
    ]);
    // Hover only where a pointer can hover.
    expect(style).toMatch(
      /@media \(hover: hover\) \{\s*\.timeline-minimap__ticks:has/,
    );
  });

  test('a card\'s setting line reads "Set in" and its display', () => {
    const line = select(page, '[id="daniel"] .timeline-entry__setting');
    expect(line.map(e => squash(e.text))).toEqual([
      "Set in the Babylonian exile, in the sixth century BCE",
    ]);
  });

  test("a narrated setting with years is a span at its years, arced to its tick, shown only while its entry is current", () => {
    // Daniel's and Lamentations' settings have years; Deuteronomy's and Judges' have none.
    const settings = select(page, ".timeline-minimap__setting");
    expect(settings.map(s => s.attrs["data-setting"])).toEqual([
      "lamentations",
      "daniel",
    ]);
    for (const s of settings) expect(s.attrs["aria-hidden"]).toBe("true");

    // The strip's to-scale part runs 2000 BCE to 0 after the early band's
    // 500 drawn years; Daniel is set 600–501 BCE.
    const span = vars(
      select(
        page,
        '[data-setting="daniel"] .timeline-minimap__setting-span',
      )[0],
    );
    expect(span["setting-start"]).toBeCloseTo((500 + 1400) / 2500, 4);
    expect(span["setting-end"]).toBeCloseTo((500 + 1499) / 2500, 4);

    // The arc joins the span's middle to the dot: at its year, in its band
    // and in its slot, which the setting carries too, so the span follows a
    // dot shifted along its row (#175): Lamentations' dot is in slot 2.
    const arc = vars(
      select(page, '[data-setting="daniel"] .timeline-minimap__setting-arc')[0],
    );
    expect(arc["arc-mid"]).toBeCloseTo((500 + (1400 + 1499) / 2) / 2500, 4);
    for (const s of settings) {
      const id = s.attrs["data-setting"];
      const {
        "tick-at": at,
        "tick-slot": slot,
        "era-start": start,
        "era-end": end,
      } = vars(select(page, `[data-tick="${id}"]`)[0]);
      const tick = vars(select(page, `[data-tick="${id}"]`)[0]);
      expect(vars(s)).toEqual({
        "era-end": end!,
        "era-start": start!,
        "tick-at": at!,
        "tick-lane": tick["tick-lane"]!,
        "tick-slot": slot!,
      });
    }
    expect(vars(settings[0])["tick-slot"]).toBe(2);
    expect(vars(settings[0])["tick-lane"]).toBe(-1);
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
