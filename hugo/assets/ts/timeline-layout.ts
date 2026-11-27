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

function packList(list: HTMLElement, pack: boolean): void {
  const rows = [...list.children].filter(
    (el): el is HTMLElement =>
      el instanceof HTMLElement && el.classList.contains("timeline-entry"),
  );
  for (const row of rows) row.style.removeProperty("--pack-pull");
  list.style.removeProperty("--pack-tail");
  if (!pack || rows.length === 0) return;

  const gap = Number.parseFloat(getComputedStyle(list).rowGap) || 0;
  const node = rows[0]?.querySelector<HTMLElement>(".timeline-entry__node");
  const step = (node?.offsetHeight ?? 16) * 2.5;
  const heights = rows.map(row => row.offsetHeight);

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
    row.classList.toggle(END, side === "end");
    const top = Math.max(0, previousTop + step, bottom[side] + gap);
    // Laid out plainly, the row would start a gap below the one before it.
    const natural = index === 0 ? 0 : previousEnd + gap;
    if (top !== natural)
      row.style.setProperty("--pack-pull", `${Math.round(top - natural)}px`);
    bottom[side] = top + height;
    previousTop = top;
    previousEnd = top + height;
    previousSide = side;
  }
  const tail = Math.max(bottom.start, bottom.end) - previousEnd;
  if (tail > 0) list.style.setProperty("--pack-tail", `${Math.round(tail)}px`);
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
  const packAll = () => {
    frame = 0;
    const pack =
      getComputedStyle(axis).getPropertyValue("--timeline-pack").trim() === "1";
    for (const list of lists) packList(list, pack);
    keepArrival(axis);
  };
  // Once now, before timeline-entry-links.ts scrolls to an entry's URL, so
  // it scrolls to the packed place; then whenever a row changes size.
  packAll();
  const schedule = () => {
    frame ||= requestAnimationFrame(packAll);
  };
  // A row's height changes with the width and when its sources open; the
  // pull never changes a row's own size, so this never feeds itself.
  const observer = new ResizeObserver(schedule);
  for (const row of axis.querySelectorAll(".timeline-entry"))
    observer.observe(row);
  observer.observe(axis);
}
