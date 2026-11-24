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

const ids = (els: El[]) => els.map(e => e.attrs.id);
const hrefs = (els: El[]) => els.map(e => e.attrs.href?.replace(/^#/, ""));
/** The numeric custom properties in an element's style attribute. */
const vars = (el: El | undefined): Record<string, number> =>
  Object.fromEntries(
    [...(el?.attrs.style ?? "").matchAll(/--([\w-]+): ([\d.e-]+)/g)].map(m => [
      m[1],
      Number(m[2]),
    ]),
  );

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

    const pos = ticks.map(t =>
      Number(/--pos: ([\d.e-]+)/.exec(t.attrs.style ?? "")?.[1]),
    );
    expect(pos.every(p => p >= 0 && p < 1)).toBe(true);
    expect(pos).toEqual(pos.toSorted((a, b) => a - b));
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
        `#${a.attrs["data-in"]} [id="${a.attrs.href?.slice(1)}"]`,
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
    const style = select(page, ".timeline-minimap style")[0]?.text ?? "";
    for (const id of ids(select(page, ".timeline-axis .timeline-entry")))
      expect(style).toContain(
        `.timeline-minimap:has(.timeline-minimap__spy [href="#${id}"]:is(:target-current, .target-current)) [data-now="${id}"]`,
      );
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
    expect(span.from).toBeCloseTo(4400 / 5000, 4);
    expect(span.to).toBeCloseTo(4499 / 5000, 4);

    // The arc joins the span's middle to Daniel's tick.
    const tick = vars(select(page, '[data-tick="daniel"]')[0]);
    const arc = vars(
      select(page, '[data-setting="daniel"] .timeline-minimap__setting-arc')[0],
    );
    expect(arc.from).toBeCloseTo((4400 + 4499) / 2 / 5000, 4);
    expect(arc.to).toBeCloseTo(tick.pos!, 4);

    const style = select(page, ".timeline-minimap style")[0]?.text ?? "";
    expect(style).toContain(
      `.timeline-minimap:has(.timeline-minimap__spy [href="#daniel"]:is(:target-current, .target-current)) [data-setting="daniel"]`,
    );
    expect(style).not.toContain(`[data-setting="deuteronomy"]`);
  });

  test("without drafts, the page shows the notice and no minimap", () => {
    expect(select(published, ".timeline-minimap")).toHaveLength(0);
    expect(select(published, ".scholarship-notice")).toHaveLength(1);
  });
});
