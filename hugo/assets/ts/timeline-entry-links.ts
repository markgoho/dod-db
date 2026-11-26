/**
 * Timeline Entry links (#219).
 *
 * - Copy link and Share (link-buttons.ts): the entry's own URL
 *   (/timeline/<id>), the one whose link preview shows this entry.
 * - Arrival at an entry's URL: it serves the whole Timeline, so go to the
 *   entry and mark it ([data-arrived], styled as :target is). The address is
 *   left exactly as the reader gave it; a /timeline/#<id> link stays as
 *   typed too.
 * - A jump inside the Timeline: a #<id> link has no link preview of its own,
 *   because a crawler never receives the fragment. So when a jump lands on an
 *   entry, the address bar takes the entry's URL in the same step, without the
 *   fragment the path already names. Any other target takes the Timeline's
 *   own URL back and keeps its fragment. replaceState, so no extra history
 *   entry, no load and no scroll. The tab's title follows.
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

function onJump(): void {
  for (const entry of document.querySelectorAll("[data-arrived]"))
    entry.removeAttribute("data-arrived");
  syncAddressBar();
}

function arrive(): void {
  const id = document.querySelector<HTMLElement>("[data-timeline-arrive]")
    ?.dataset["timelineArrive"];
  const entry = id ? document.getElementById(id) : null;
  if (!entry || globalThis.location.hash) return;
  entry.dataset["arrived"] = "";
  // A reload or back/forward keeps the place the browser restores.
  const [navigation] = performance.getEntriesByType("navigation");
  if (
    navigation instanceof PerformanceNavigationTiming &&
    ["reload", "back_forward"].includes(navigation.type)
  )
    return;
  // As a fragment would: scroll there and move focus to the entry.
  entry.scrollIntoView();
  entry.focus({ preventScroll: true });
  if (document.readyState === "complete") return;
  // The page is still laying out: go again at load, unless the reader has
  // moved on by then.
  const controller = new AbortController();
  const options = { signal: controller.signal, passive: true };
  for (const type of ["wheel", "touchstart", "keydown", "pointerdown"])
    globalThis.addEventListener(type, () => controller.abort(), options);
  globalThis.addEventListener(
    "load",
    () => {
      entry.scrollIntoView();
      controller.abort();
    },
    options,
  );
}

initCopy();
initShare();
arrive();
globalThis.addEventListener("hashchange", onJump);
globalThis.addEventListener("popstate", syncTitleToPath);
