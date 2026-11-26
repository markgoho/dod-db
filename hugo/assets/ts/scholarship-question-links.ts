/**
 * Statement links on Scholarship Pages and Question Pages.
 *
 * - Copy link and Share (link-buttons.ts): the Question Page URL, the one
 *   whose link preview shows this question.
 * - Deep links: Chrome opens a <details> the URL fragment targets; Firefox and
 *   Safari don't, so open it on load and on hashchange. Opening a question
 *   also writes its #id to the address bar.
 */

import { initCopy, initShare } from "./link-buttons.js";

function openTarget(): void {
  const id = decodeURIComponent(globalThis.location.hash.slice(1));
  if (!id) return;
  const target = document.getElementById(id);
  if (target instanceof HTMLDetailsElement && !target.open) {
    target.open = true;
    target.scrollIntoView();
  }
}

/**
 * Opening a question puts its link in the address bar (#<id>); closing it
 * takes the link away again. replaceState, so no history entry or scroll.
 */
function syncAddressBar(event: Event): void {
  const details = event.target;
  if (
    !(details instanceof HTMLDetailsElement) ||
    !details.classList.contains("scholarship-question")
  ) {
    return;
  }
  const { pathname, search, hash } = globalThis.location;
  if (details.open) {
    globalThis.history.replaceState(undefined, "", `#${details.id}`);
  } else if (hash === `#${details.id}`) {
    globalThis.history.replaceState(undefined, "", `${pathname}${search}`);
  }
}

initCopy();
initShare();
openTarget();
globalThis.addEventListener("hashchange", openTarget);
// `toggle` doesn't bubble: listen in the capture phase.
document.addEventListener("toggle", syncAddressBar, true);
