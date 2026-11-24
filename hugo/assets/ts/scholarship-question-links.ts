/**
 * Statement links on Scholarship Pages and Question Pages.
 *
 * - Copy link: copies the Question Page URL (the one whose link preview shows
 *   this question), with a role="status" tip as both visible and announced
 *   feedback. Wired with Invoker Commands, with a click fallback.
 * - Share: the native share sheet, where there is one.
 * - Deep links: Chrome opens a <details> the URL fragment targets; Firefox and
 *   Safari don't, so open it on load and on hashchange. Opening a question
 *   also writes its #id to the address bar.
 */

const FEEDBACK_MS = 2000;
const timers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();
let lastMessage = "";

function report(button: HTMLElement, ok: boolean): void {
  const tip = button.nextElementSibling;
  if (!(tip instanceof HTMLElement)) return;
  clearTimeout(timers.get(button));
  button.removeAttribute("data-copied");
  button.removeAttribute("data-failed");
  tip.textContent = "";
  let message = ok ? "Copied" : "Copy failed";
  // VoiceOver skips a repeat of the last message; a no-break space makes it differ.
  if (message === lastMessage) message += " ";
  lastMessage = message;
  button.setAttribute(ok ? "data-copied" : "data-failed", "");
  requestAnimationFrame(() => {
    tip.textContent = message;
  });
  timers.set(
    button,
    setTimeout(() => {
      button.removeAttribute("data-copied");
      button.removeAttribute("data-failed");
      tip.textContent = "";
    }, FEEDBACK_MS),
  );
}

async function copyLink(button: HTMLElement): Promise<void> {
  const url = button.dataset["url"];
  if (!url) return;
  try {
    await globalThis.navigator.clipboard.writeText(url);
    report(button, true);
  } catch {
    report(button, false);
  }
}

function initCopy(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>(
    ".scholarship-question__copy-button",
  );
  if (buttons.length === 0 || !("clipboard" in globalThis.navigator)) return;
  for (const button of buttons) button.hidden = false;

  if ("CommandEvent" in globalThis) {
    // `command` events don't bubble: listen in the capture phase.
    document.addEventListener(
      "command",
      event => {
        const { command, source } = event as Event & {
          command: string;
          source: Element | null;
        };
        if (command === "--copy-link" && source instanceof HTMLElement) {
          void copyLink(source);
        }
      },
      true,
    );
  } else {
    document.addEventListener("click", event => {
      if (event.defaultPrevented) return;
      const button = (event.target as Element | null)?.closest<HTMLElement>(
        'button[command="--copy-link"]',
      );
      if (button) void copyLink(button);
    });
  }
}

function initShare(): void {
  if (!("share" in globalThis.navigator)) return;
  const buttons = document.querySelectorAll<HTMLButtonElement>(
    ".scholarship-question__share-button",
  );
  for (const button of buttons) {
    button.hidden = false;
    button.addEventListener("click", () => {
      const { url, title } = button.dataset;
      if (!url) return;
      globalThis.navigator.share({ url, title }).catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        throw error;
      });
    });
  }
}

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
