/**
 * Timeline minimap (#167 §1): the one piece of script. CSS shows where the
 * reader is (scroll-target-group and :target-current), but that state is not
 * exposed to assistive technology, so when scrolling ends this mirrors the
 * current entry into aria-current on its tick and its era link.
 *
 * Browsers without scroll-target-group get no current highlight, and nothing
 * here runs.
 */

function syncAriaCurrent(minimap: Element): void {
  const current = minimap.querySelector<HTMLAnchorElement>(
    ".timeline-minimap__spy a:target-current",
  );
  const entry = current?.hash.slice(1);
  const era = current?.dataset.in;
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
