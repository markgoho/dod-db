import { describe, expect, test } from "bun:test";
import path from "node:path";
import { focusAt, LENS_GAIN, LENS_WIDTH, lens } from "./timeline-lens.js";

const foci = [0, 0.05, 0.25, 0.5, 0.7272, 0.8, 0.9255, 1];
const xs = Array.from({ length: 1001 }, (_, i) => i / 1000);
const read = (p: string) =>
  Bun.file(path.join(import.meta.dir, "../../hugo", p)).text();
/** The lens's local scale at x: how much a short span there grows. */
const scale = (x: number, focus: number, h = 1e-6) =>
  (lens(x + h, focus) - lens(x - h, focus)) / (2 * h);

describe("the minimap lens", () => {
  test("keeps the strip's ends where they are, wherever the focus", () => {
    for (const f of foci) {
      expect(lens(0, f)).toBeCloseTo(0, 12);
      expect(lens(1, f)).toBeCloseTo(1, 12);
    }
  });

  test("never changes the order of two years: strictly increasing", () => {
    for (const f of foci) {
      const ys = xs.map(x => lens(x, f));
      for (let i = 1; i < ys.length; i++)
        expect(ys[i]!).toBeGreaterThan(ys[i - 1]!);
    }
  });

  test("magnifies at the focus, about 2.5–3×", () => {
    for (const f of foci.filter(focus => focus > 0.1 && focus < 0.9)) {
      expect(scale(f, f)).toBeGreaterThan(2.5);
      expect(scale(f, f)).toBeLessThan(3.2);
    }
  });

  test("moves the year at the focus only a little, and focusAt() undoes that: its focus lands where asked", () => {
    for (const f of foci) expect(Math.abs(lens(f, f) - f)).toBeLessThan(0.06);
    for (const at of xs.filter((_, i) => i % 50 === 0)) {
      const f = focusAt(at);
      expect(lens(f, f)).toBeCloseTo(at, 9);
      // The magnified spot is there, not somewhere else.
      expect(scale(f, f)).toBeGreaterThan(2.5);
    }
  });

  test("shrinks the rest only a little, so the whole strip still fits", () => {
    for (const f of foci)
      for (const x of xs.filter(year => Math.abs(year - f) > 0.25))
        expect(scale(x, f)).toBeGreaterThan(0.7);
  });

  test("is the to-scale strip with no gain", () => {
    for (const f of foci)
      for (const x of xs) expect(lens(x, f, 0)).toBeCloseTo(x, 12);
  });

  test("keeps a dot inside its band: band edges and the years between them bend alike", () => {
    // 1000–500 BCE on a strip from 5000 BCE to 500 CE, focused in it.
    const [start, end] = [4000 / 5500, 4500 / 5500];
    for (const f of foci)
      for (const x of xs.filter(year => year >= start && year < end)) {
        expect(lens(x, f)).toBeGreaterThanOrEqual(lens(start, f));
        expect(lens(x, f)).toBeLessThan(lens(end, f));
      }
  });

  test("the stylesheet's lens and the template's hover foci use the same gain and width", async () => {
    const css = await read("assets/css/timeline-minimap.css");
    expect(css).toContain(`--lens-max-gain: ${LENS_GAIN};`);
    expect(css).toContain(`--lens-width: ${LENS_WIDTH};`);
    const html = await read("layouts/partials/timeline-minimap.html");
    expect(html).toContain(`{{- $lensGain := ${LENS_GAIN} -}}`);
    expect(html).toContain(`{{- $lensWidth := ${LENS_WIDTH} -}}`);
  });
});
