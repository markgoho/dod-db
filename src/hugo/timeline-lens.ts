/**
 * The Timeline minimap's lens (timeline-minimap.css, "The lens"): the same
 * fisheye the CSS computes per tick, as a function, so its maths can be
 * tested. Keep the two in step; the defaults are the CSS's --lens-max-gain
 * and --lens-width, and timeline-lens.test.ts checks the stylesheet still
 * says so.
 *
 * x and focus are shares of the strip (0 at its top, 1 at its bottom). The
 * strip's density is 1 + gain·width² / (width + |x − focus|)²: a bump at the
 * focus, gain + 1 times the rest, half gone about width·0.4 away. Its
 * integral, scaled so the ends stay at 0 and 1, is the map.
 */
export const LENS_GAIN = 2.5;
export const LENS_WIDTH = 0.06;

export function lens(
  x: number,
  focus: number,
  gain = LENS_GAIN,
  width = LENS_WIDTH,
): number {
  const aw = gain * width;
  const c0 = (aw * focus) / (width + focus);
  const n =
    1 + aw * ((1 - focus) / (width + 1 - focus) + focus / (width + focus));
  return (x + (aw * (x - focus)) / (width + Math.abs(x - focus)) + c0) / n;
}

/**
 * The focus that puts its own year at `at` on the strip: the lens moves the
 * year at its focus a little towards the middle, so a hover slice focuses
 * this, and the bulge is centred under the pointer. Bisection, as
 * timeline-minimap.html does it.
 */
export function focusAt(
  at: number,
  gain = LENS_GAIN,
  width = LENS_WIDTH,
): number {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 50; i++) {
    const f = (lo + hi) / 2;
    if (lens(f, f, gain, width) < at) lo = f;
    else hi = f;
  }
  return (lo + hi) / 2;
}
