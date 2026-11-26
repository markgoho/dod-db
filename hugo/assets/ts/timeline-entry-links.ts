/**
 * Timeline Entry links (#219).
 *
 * - Copy link and Share (link-buttons.ts): the entry's own URL
 *   (/timeline/<id>/), the one whose link preview shows this entry.
 * - Address bar: a #<id> link has no link preview of its own, because a
 *   crawler never receives the fragment. So whenever an entry is the target,
 *   the address bar takes the entry's URL (/timeline/<id>/#<id>), which serves
 *   this same Timeline: the URL a reader copies from the address bar previews
 *   the entry. Any other target takes the Timeline's own URL back.
 *   replaceState, so no history entry, no load, and :target stays as it is.
 *   The tab's title follows.
 */

import { initCopy, initShare } from "./link-buttons.js";

function syncAddressBar(): void {
  const timeline = document.querySelector<HTMLElement>("[data-timeline-url]");
  const { hash, pathname, search } = globalThis.location;
  const target = document.getElementById(decodeURIComponent(hash.slice(1)));
  // Not on the Timeline, no target, or a target outside it (#card).
  if (!timeline || !target || !timeline.contains(target)) return;
  const entryUrl = target.dataset["entryUrl"];
  const path = entryUrl ?? timeline.dataset["timelineUrl"];
  if (!path || path === pathname) return;
  globalThis.history.replaceState(
    globalThis.history.state,
    "",
    `${path}${search}${hash}`,
  );
  // The tab's title follows the URL: the entry's, or the Timeline's.
  const title = entryUrl
    ? target.querySelector(
        ".timeline-entry__title, .timeline-entry__moved-title",
      )?.textContent
    : timeline.dataset["timelineTitle"];
  if (title) document.title = title.trim();
}

initCopy();
initShare();
syncAddressBar();
globalThis.addEventListener("hashchange", syncAddressBar);
