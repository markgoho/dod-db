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
 * The strip's window (#253): the part of the Timeline on screen. An
 * IntersectionObserver keeps the axis rows in view; the window runs from the
 * earliest of their ticks to the latest. With no entry in view (an empty era
 * fills the screen), it covers the eras in view instead. Positions are the
 * shares the template already wrote on each tick and band.
 */
const share = (el: HTMLElement, name: string): number =>
  Number.parseFloat(el.style.getPropertyValue(name));

function trackViewport(root: Element): void {
  const view = root.querySelector<HTMLElement>(".timeline-minimap__view");
  const axis = document.querySelector(".timeline-axis");
  if (!view || !axis) return;

  const tickAt = new Map<string, number>();
  for (const tick of root.querySelectorAll<HTMLElement>("[data-tick]"))
    tickAt.set(tick.dataset.tick ?? "", share(tick, "--tick-at"));
  const eraSpan = new Map<string, [number, number]>();
  for (const band of root.querySelectorAll<HTMLElement>("[data-era]"))
    eraSpan.set(band.dataset.era ?? "", [
      share(band, "--era-start"),
      share(band, "--era-end"),
    ]);

  const entries = new Set<string>();
  const eras = new Set<string>();
  let frame = 0;
  const draw = () => {
    frame = 0;
    let spans = [...entries].flatMap(id => {
      const at = tickAt.get(id);
      return at === undefined ? [] : [[at, at] as [number, number]];
    });
    if (spans.length === 0)
      spans = [...eras].flatMap(id => {
        const span = eraSpan.get(id);
        return span ? [span] : [];
      });
    view.hidden = spans.length === 0;
    if (view.hidden) return;
    view.style.setProperty(
      "--view-start",
      String(Math.min(...spans.map(s => s[0]))),
    );
    view.style.setProperty(
      "--view-end",
      String(Math.max(...spans.map(s => s[1]))),
    );
  };

  const observer = new IntersectionObserver(records => {
    for (const { target, isIntersecting } of records) {
      const set = target.classList.contains("timeline-era") ? eras : entries;
      if (isIntersecting) set.add(target.id);
      else set.delete(target.id);
    }
    frame ||= requestAnimationFrame(draw);
  });
  for (const row of axis.querySelectorAll(".timeline-era, .timeline-entry"))
    observer.observe(row);
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
