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
