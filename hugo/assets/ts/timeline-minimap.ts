/**
 * Timeline minimap (#167 §1). The scrollspy is the browser's
 * (scroll-target-group and :target-current); this reads its current link and
 * flags the few elements that show it (--is-current, --is-partner; see
 * timeline-minimap.html) and sets aria-current on the tick and the era link.
 * Read every frame the page scrolls, and two frames after scrollend, when
 * Chrome settles it (measured); written only when it changes, so a change
 * restyles those elements alone. Browsers without scroll-target-group get no
 * current highlight, and that part never runs.
 *
 * Also: a jump from the open Contents popover closes it, so the popover never
 * covers the target it just scrolled to (WCAG 2.4.11); the strip's window
 * (#253); and a fallback for Sources used (#173), a closed <details>: Chrome
 * opens it for a #source-<id> link to a row inside; elsewhere this does.
 */

/** The elements one current entry (and its era) flags, and its pair's partner tick. */
function flagged(
  root: Element,
  axis: Element | null,
  id: string,
  era: string | undefined,
): { current: Element[]; partner: Element[] } {
  const base = id.endsWith("-tradition") ? id.slice(0, -10) : id;
  const tick = root.querySelector<HTMLElement>(
    `[data-tick="${CSS.escape(id)}"]`,
  );
  const at = tick ? share(tick, "--tick-at") : Number.NaN;
  // The periods (#255) its tick's year falls in, [start, end).
  const periods = [
    ...root.querySelectorAll<HTMLElement>("[data-period]"),
  ].filter(p => at >= share(p, "--p-start") && at < share(p, "--p-end"));
  const pair = root.querySelector(`[data-pair="${CSS.escape(base)}"]`);
  const other = id === base ? `${base}-tradition` : base;
  const q = (sel: string) => [...root.querySelectorAll(sel)];
  return {
    current: [
      ...q(`[data-tick="${CSS.escape(id)}"]`),
      ...q(`[data-setting="${CSS.escape(id)}"]`),
      ...(pair ? [pair] : []),
      ...(axis ? [...axis.querySelectorAll(`[id="${CSS.escape(id)}"]`)] : []),
      ...(era
        ? q(`[data-now="${CSS.escape(era)}"], [data-era="${CSS.escape(era)}"]`)
        : []),
      ...periods,
    ],
    partner: pair ? q(`[data-tick="${CSS.escape(other)}"]`) : [],
  };
}

function trackCurrent(root: Element): void {
  const spy = root.querySelector(".timeline-minimap__spy");
  if (!spy) return;
  const axis = document.querySelector(".timeline-axis");
  let entry: string | undefined;
  let previous: { current: Element[]; partner: Element[] } = {
    current: [],
    partner: [],
  };
  const sync = () => {
    const link = spy.querySelector<HTMLAnchorElement>("a:target-current");
    const id = link?.hash.slice(1);
    if (id === entry) return;
    entry = id;
    const era = link?.dataset.entryEra;
    for (const el of previous.current) {
      (el as HTMLElement).style.removeProperty("--is-current");
      el.removeAttribute("aria-current");
    }
    for (const el of previous.partner)
      (el as HTMLElement).style.removeProperty("--is-partner");
    previous =
      id === undefined
        ? { current: [], partner: [] }
        : flagged(root, axis, id, era);
    for (const el of previous.current)
      (el as HTMLElement).style.setProperty("--is-current", "1");
    for (const el of previous.partner)
      (el as HTMLElement).style.setProperty("--is-partner", "1");
    // Assistive technology: the tick and the era link.
    root
      .querySelector(`[data-tick="${CSS.escape(id ?? "")}"]`)
      ?.setAttribute("aria-current", "location");
    for (const eraLink of root.querySelectorAll<HTMLAnchorElement>(
      ".timeline-minimap__era",
    )) {
      if (era !== undefined && eraLink.hash === `#${era}`)
        eraLink.setAttribute("aria-current", "location");
      else eraLink.removeAttribute("aria-current");
    }
  };
  let frame = 0;
  addEventListener(
    "scroll",
    () => {
      frame ||= requestAnimationFrame(() => {
        frame = 0;
        sync();
      });
    },
    { passive: true },
  );
  const settle = () => requestAnimationFrame(() => requestAnimationFrame(sync));
  settle();
  document.addEventListener("scrollend", settle);
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

/**
 * The strip's size in px (--strip-inline, --strip-block, on the strip), for
 * the dots' size (timeline-minimap.css). Written only when it changes size.
 */
function measureStrip(root: Element): void {
  const strip = root.querySelector<HTMLElement>(".timeline-minimap__strip");
  const ticks = strip?.querySelector(".timeline-minimap__ticks");
  if (!strip || !ticks) return;
  new ResizeObserver(([entry]) => {
    if (!entry) return;
    const { width, height } = entry.contentRect;
    strip.style.setProperty("--strip-inline", `${width}px`);
    strip.style.setProperty("--strip-block", `${height}px`);
    // A period's name longer than its period is left out, never cut (#255).
    for (const period of strip.querySelectorAll<HTMLElement>(
      ".timeline-minimap__period--age",
    )) {
      const label = period.querySelector(".timeline-minimap__period-label");
      // Its whole length (it is clipped to the period); sideways on the rail, so height either way.
      if (label)
        period.toggleAttribute(
          "data-unfit",
          label.scrollHeight > period.clientHeight + 0.5,
        );
    }
  }).observe(ticks);
}

if (minimap) measureStrip(minimap);

if (minimap && CSS.supports("scroll-target-group", "auto"))
  trackCurrent(minimap);

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
