/**
 * Timeline minimap (#167 §1): the only script. CSS shows where the reader is
 * (scroll-target-group and :target-current), but that state is not exposed to
 * assistive technology, so when scrolling ends this mirrors the current entry
 * into aria-current on its tick and its era link. Browsers without
 * scroll-target-group get no current highlight, and that part never runs.
 *
 * One deliberate addition to "only the scrollend sync": a jump from the open
 * Contents popover closes it, so the popover never covers the target it just
 * scrolled to (WCAG 2.4.11).
 *
 * And a fallback for Sources used (#173), a closed <details>: Chrome opens it
 * for a #source-<id> link to a row inside; elsewhere this does.
 */

function syncAriaCurrent(minimap: Element): void {
  const current = minimap.querySelector<HTMLAnchorElement>(
    ".timeline-minimap__spy a:target-current",
  );
  const entry = current?.hash.slice(1);
  const era = current?.dataset.entryEra;
  for (const tick of minimap.querySelectorAll<HTMLElement>("[data-tick]")) {
    if (tick.dataset.tick === entry)
      tick.setAttribute("aria-current", "location");
    else tick.removeAttribute("aria-current");
  }
  for (const link of minimap.querySelectorAll<HTMLAnchorElement>(
    ".timeline-minimap__era",
  )) {
    if (era !== undefined && link.hash === `#${era}`)
      link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }
}

const minimap = document.querySelector(".timeline-minimap");

// Any browser with popovers: close the open Contents popover after a jump.
// On wide screens the nav is the rail, a popover never opened, so it stays.
const map = minimap?.querySelector<HTMLElement>("[popover]");
map?.addEventListener("click", event => {
  if (
    event.target instanceof Element &&
    event.target.closest("a[href^='#']") &&
    map.matches(":popover-open")
  )
    map.hidePopover();
});

if (minimap && CSS.supports("scroll-target-group", "auto")) {
  // Chrome updates :target-current two animation frames after the one that
  // fires scrollend (measured), so read it then.
  const syncSoon = () =>
    requestAnimationFrame(() =>
      requestAnimationFrame(() => syncAriaCurrent(minimap)),
    );
  syncSoon();
  document.addEventListener("scrollend", syncSoon);
}

/**
 * The strip's window (#253): the part of the Timeline on screen, following
 * the scroll frame by frame. Each era's top and each row's node are control
 * points, a page position paired with its share of the strip (the era's
 * start, the tick's year, both written by the template); the viewport's top
 * and bottom are mapped between the points either side of them, so the
 * window glides as the page does. The points are measured again whenever the
 * axis changes size (packing, a disclosure, the width). Off the axis, no
 * window.
 */
const share = (el: HTMLElement, name: string): number =>
  Number.parseFloat(el.style.getPropertyValue(name));

type Point = { y: number; at: number };

function shareAt(points: Point[], y: number): number {
  const first = points[0];
  const last = points.at(-1);
  if (!first || !last) return 0;
  if (y <= first.y) return first.at;
  if (y >= last.y) return last.at;
  let lo = 0;
  let hi = points.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if ((points[mid]?.y ?? 0) <= y) lo = mid;
    else hi = mid;
  }
  const a = points[lo]!;
  const b = points[hi]!;
  return b.y === a.y ? a.at : a.at + ((b.at - a.at) * (y - a.y)) / (b.y - a.y);
}

function trackViewport(root: Element): void {
  const view = root.querySelector<HTMLElement>(".timeline-minimap__view");
  const axis = document.querySelector<HTMLElement>(".timeline-axis");
  if (!view || !axis) return;

  const tickAt = new Map<string, number>();
  for (const tick of root.querySelectorAll<HTMLElement>("[data-tick]"))
    tickAt.set(tick.dataset.tick ?? "", share(tick, "--tick-at"));
  const eraStart = new Map<string, number>();
  for (const band of root.querySelectorAll<HTMLElement>("[data-era]"))
    eraStart.set(band.dataset.era ?? "", share(band, "--era-start"));

  let points: Point[] = [];
  let axisTop = 0;
  let axisBottom = 0;
  const measure = () => {
    const scroll = globalThis.scrollY;
    const box = axis.getBoundingClientRect();
    axisTop = box.top + scroll;
    axisBottom = box.bottom + scroll;
    points = [];
    for (const row of axis.querySelectorAll<HTMLElement>(
      ".timeline-era, .timeline-entry",
    )) {
      const isEra = row.classList.contains("timeline-era");
      const at = isEra ? eraStart.get(row.id) : tickAt.get(row.id);
      const mark = isEra
        ? row
        : (row.querySelector(".timeline-entry__node") ?? row);
      if (at !== undefined)
        points.push({ y: mark.getBoundingClientRect().top + scroll, at });
    }
    // Page order is date order; keep the shares from ever running back.
    points.sort((a, b) => a.y - b.y);
    for (let i = 1; i < points.length; i++)
      points[i]!.at = Math.max(points[i]!.at, points[i - 1]!.at);
    // The axis's end is the strip's.
    points.push({ y: axisBottom, at: 1 });
  };

  let frame = 0;
  const draw = () => {
    frame = 0;
    const top = globalThis.scrollY;
    const bottom = top + globalThis.innerHeight;
    view.hidden = bottom <= axisTop || top >= axisBottom;
    if (view.hidden) return;
    view.style.setProperty("--view-start", String(shareAt(points, top)));
    view.style.setProperty("--view-end", String(shareAt(points, bottom)));
  };
  const schedule = () => {
    frame ||= requestAnimationFrame(draw);
  };
  new ResizeObserver(() => {
    measure();
    schedule();
  }).observe(axis);
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule);
}

if (minimap) trackViewport(minimap);

// Browsers without beforematch do not reveal a fragment target inside a
// closed <details> either (Safari): open it, then go to the target.
function revealTarget(): void {
  const target = document.getElementById(
    decodeURIComponent(location.hash.slice(1)),
  );
  const closed = target?.closest("details:not([open])");
  if (!target || !(closed instanceof HTMLDetailsElement)) return;
  closed.open = true;
  target.scrollIntoView();
}

if (!("onbeforematch" in HTMLElement.prototype)) {
  revealTarget();
  addEventListener("hashchange", revealTarget);
}
