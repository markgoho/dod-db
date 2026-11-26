/**
 * Timeline Entry links (#219).
 *
 * - Copy link and Share (link-buttons.ts): the entry's own URL
 *   (/timeline/<id>/), the one whose link preview shows this entry.
 * - Address bar: a #<id> link has no link preview of its own, because a
 *   crawler never receives the fragment. So whenever an entry is the target,
 *   the address bar takes the entry's URL (/timeline/<id>/), which serves
 *   this same Timeline: the URL a reader copies from the address bar previews
 *   the entry. The fragment is dropped once the browser has gone to the
 *   entry, since the path already names it. Any other target takes the
 *   Timeline's own URL back and keeps its fragment.
 *   replaceState, so no history entry, no load and no scroll.
 *   The tab's title follows.
 */

import { initCopy, initShare } from "./link-buttons.js";

function timelineRoot(): HTMLElement | null {
  return document.querySelector<HTMLElement>("[data-timeline-url]");
}

/** The tab's title follows the URL: the entry's, or the Timeline's. */
function syncTitle(timeline: HTMLElement, entry: Element | null): void {
  const title = entry
    ? entry.querySelector(
        ".timeline-entry__title, .timeline-entry__moved-title",
      )?.textContent
    : timeline.dataset["timelineTitle"];
  if (title) document.title = title.trim();
}

function syncAddressBar(): void {
  const timeline = timelineRoot();
  const { hash, pathname, search } = globalThis.location;
  const target = document.getElementById(decodeURIComponent(hash.slice(1)));
  // Not on the Timeline, no target, or a target outside it (#card).
  if (!timeline || !target || !timeline.contains(target)) return;
  const entryUrl = target.dataset["entryUrl"];
  const path = entryUrl ?? timeline.dataset["timelineUrl"];
  if (!path) return;
  const url = `${path}${search}${entryUrl ? "" : hash}`;
  if (url === `${pathname}${search}${hash}`) return;
  globalThis.history.replaceState(globalThis.history.state, "", url);
  syncTitle(timeline, entryUrl ? target : null);
}

/** Back and forward move between entry URLs without a load or a hashchange. */
function syncTitleToPath(): void {
  const timeline = timelineRoot();
  if (!timeline) return;
  const { pathname } = globalThis.location;
  const entry = [
    ...timeline.querySelectorAll<HTMLElement>("[data-entry-url]"),
  ].find(item => item.dataset["entryUrl"] === pathname);
  if (entry || pathname === timeline.dataset["timelineUrl"])
    syncTitle(timeline, entry ?? null);
}

function start(): void {
  syncAddressBar();
  globalThis.addEventListener("hashchange", syncAddressBar);
  globalThis.addEventListener("popstate", syncTitleToPath);
}

initCopy();
initShare();
// On arrival the browser goes to the fragment as the page lays out, up to
// load: dropping the fragment before then would leave the reader at the top.
if (document.readyState === "complete") start();
else globalThis.addEventListener("load", start, { once: true });
