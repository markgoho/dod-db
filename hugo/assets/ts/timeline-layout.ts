/**
 * Timeline packing (#254): the axis runs down the middle with rows on both
 * sides. Laid out one row under another, each row would leave the other side
 * empty beside it, so this pulls each row up beside the one before it:
 *
 * - a row goes on the side that frees up first (the one whose last card ends
 *   higher), so long cards on one side let the other side fill in;
 * - a row never starts above the row before it, and starts at least a node
 *   step below it, so the nodes on the axis stay in date order and apart;
 * - a row clears the last card on its own side by the list's gap.
 *
 * Each era's list is packed on its own, so an era label never sits beside a
 * card. The pull is a negative margin (--pack-pull) and the era keeps its
 * tallest row inside it (--pack-tail). Where the axis is at the left edge
 * (timeline.css sets --timeline-pack: 0) nothing is pulled. Without this
 * script rows simply alternate sides, as the template writes them.
 */

const END = "timeline-entry--end";

interface Measured {
  list: HTMLElement;
  rows: HTMLElement[];
  heights: number[];
  gap: number;
  step: number;
}

function rowsOf(list: HTMLElement): HTMLElement[] {
  return [...list.children].filter(
    (el): el is HTMLElement =>
      el instanceof HTMLElement && el.classList.contains("timeline-entry"),
  );
}

/**
 * Reads only. A row's height doesn't depend on its pull or its side (both
 * columns are the same width), so the current pulls can stay while measuring:
 * every list is read in one layout, then written (packList), never
 * interleaved, which would force a whole-page layout per list.
 */
function measure(list: HTMLElement): Measured {
  const rows = rowsOf(list);
  const node = rows[0]?.querySelector<HTMLElement>(".timeline-entry__node");
  return {
    list,
    rows,
    heights: rows.map(row => row.offsetHeight),
    gap: Number.parseFloat(getComputedStyle(list).rowGap) || 0,
    step: (node?.offsetHeight ?? 16) * 2.5,
  };
}

/** Writes only: sets a property only when its value changes. */
function setPx(el: HTMLElement, name: string, px: number): void {
  const value = px === 0 ? "" : `${Math.round(px)}px`;
  if (el.style.getPropertyValue(name) === value) return;
  if (value) el.style.setProperty(name, value);
  else el.style.removeProperty(name);
}

function packList(
  { list, rows, heights, gap, step }: Measured,
  pack: boolean,
): void {
  if (!pack || rows.length === 0) {
    for (const row of rows) setPx(row, "--pack-pull", 0);
    setPx(list, "--pack-tail", 0);
    return;
  }

  // Where each side's last card ends, from the list's top.
  const bottom = {
    start: Number.NEGATIVE_INFINITY,
    end: Number.NEGATIVE_INFINITY,
  };
  let previousTop = Number.NEGATIVE_INFINITY;
  let previousEnd = 0;
  let previousSide: "start" | "end" = "end";
  for (const [index, row] of rows.entries()) {
    const height = heights[index] ?? 0;
    const side: "start" | "end" =
      bottom.start === bottom.end
        ? previousSide === "start"
          ? "end"
          : "start"
        : bottom.start < bottom.end
          ? "start"
          : "end";
    if (row.classList.contains(END) !== (side === "end"))
      row.classList.toggle(END, side === "end");
    const top = Math.max(0, previousTop + step, bottom[side] + gap);
    // Laid out plainly, the row would start a gap below the one before it.
    const natural = index === 0 ? 0 : previousEnd + gap;
    setPx(row, "--pack-pull", Math.round(top - natural));
    bottom[side] = top + height;
    previousTop = top;
    previousEnd = top + height;
    previousSide = side;
  }
  setPx(
    list,
    "--pack-tail",
    Math.max(0, Math.max(bottom.start, bottom.end) - previousEnd),
  );
}

/**
 * Packing pulls rows up by up to thousands of pixels, so a reader who
 * arrived at an entry (#<id>, or an entry's own URL, [data-arrived]) would
 * be left looking at a later one. Until they scroll themselves, each pack
 * brings the entry they came for back into view, as the fragment did.
 */
let readerScrolled = false;
for (const type of ["wheel", "touchstart", "keydown", "mousedown"])
  addEventListener(
    type,
    () => {
      readerScrolled = true;
    },
    { once: true, passive: true },
  );

function keepArrival(axis: HTMLElement): void {
  if (readerScrolled) return;
  const id = decodeURIComponent(globalThis.location.hash.slice(1));
  const target =
    axis.querySelector("[data-arrived]") ??
    (id ? document.getElementById(id) : null);
  if (target && axis.contains(target)) target.scrollIntoView();
}

const axis = document.querySelector<HTMLElement>(".timeline-axis");
if (axis) {
  const lists = [
    ...axis.querySelectorAll<HTMLElement>(".timeline-era__entries"),
  ];
  let frame = 0;
  // The lists to pack on the next frame: all of them after a width change,
  // otherwise only those whose rows changed size (a card's sources opening
  // animates its height, so this runs every frame of that animation).
  const dirty = new Set<HTMLElement>(lists);
  const packDirty = () => {
    frame = 0;
    const pack =
      getComputedStyle(axis).getPropertyValue("--timeline-pack").trim() === "1";
    const measured = [...dirty].map(list => measure(list));
    dirty.clear();
    for (const m of measured) packList(m, pack);
    keepArrival(axis);
  };
  // Once now, before timeline-entry-links.ts scrolls to an entry's URL, so
  // it scrolls to the packed place; then whenever a row changes size.
  packDirty();
  // A row's height changes with the width and when its sources open; the
  // pull never changes a row's own size, so this never feeds itself.
  const observer = new ResizeObserver(entries => {
    for (const { target } of entries) {
      if (target === axis) for (const list of lists) dirty.add(list);
      else {
        const list = target.parentElement;
        if (list && lists.includes(list)) dirty.add(list);
      }
    }
    frame ||= requestAnimationFrame(packDirty);
  });
  for (const row of axis.querySelectorAll(".timeline-entry"))
    observer.observe(row);
  observer.observe(axis);
}
