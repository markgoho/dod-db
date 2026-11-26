/**
 * Copy-link and share buttons, shared by Scholarship Page statements and
 * Timeline Entries (.scholarship-question__actions).
 *
 * - Copy link: copies the button's data-url, with a role="status" tip as both
 *   visible and announced feedback. Wired with Invoker Commands, with a click
 *   fallback.
 * - Share: the native share sheet, where there is one.
 *
 * The buttons start [hidden]; each init reveals them where they work.
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

export function initCopy(): void {
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

export function initShare(): void {
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
