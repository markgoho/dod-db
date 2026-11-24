/**
 * Scripture reader (prototype). Opens BibleGateway passage links in a floating,
 * non-modal window so the reader can check a passage without leaving the page.
 *
 * Progressive enhancement: links keep their real href, so modified clicks
 * (new tab / window) and no-JS still go to BibleGateway. The framed view uses
 * BibleGateway's print interface, which shows only the passage text.
 */

const LINK_SELECTOR = 'a[href*="biblegateway.com/passage"]';

function framedUrl(href: string): string {
  const url = new URL(href);
  url.searchParams.set("interface", "print");
  return url.toString();
}

function passageLabel(link: HTMLAnchorElement): string {
  const search = new URL(link.href).searchParams.get("search");
  return search ?? (link.textContent ?? "").trim();
}

function buildReader(): {
  dialog: HTMLDialogElement;
  open: (link: HTMLAnchorElement) => void;
} {
  const dialog = document.createElement("dialog");
  dialog.className = "scripture-reader panel";
  dialog.setAttribute("popover", "manual");
  dialog.setAttribute("aria-labelledby", "scripture-reader-title");
  dialog.innerHTML = `
    <header class="scripture-reader__header">
      <h2 class="scripture-reader__title type-eyebrow" id="scripture-reader-title"></h2>
      <a class="scripture-reader__external" target="_blank" rel="noopener noreferrer">Open on BibleGateway</a>
      <button type="button" class="scripture-reader__close" aria-label="Close passage">✕</button>
    </header>
    <iframe class="scripture-reader__frame" title="Passage text"></iframe>`;
  document.body.append(dialog);

  const title = dialog.querySelector<HTMLElement>(".scripture-reader__title")!;
  const external = dialog.querySelector<HTMLAnchorElement>(
    ".scripture-reader__external",
  )!;
  const frame = dialog.querySelector<HTMLIFrameElement>(
    ".scripture-reader__frame",
  )!;
  const close = dialog.querySelector<HTMLButtonElement>(
    ".scripture-reader__close",
  )!;

  let invoker: HTMLAnchorElement | undefined;

  const hide = (): void => {
    if (!dialog.matches(":popover-open")) return;
    const hadFocus = dialog.contains(document.activeElement);
    dialog.hidePopover();
    if (hadFocus) invoker?.focus();
  };

  close.addEventListener("click", hide);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") hide();
  });

  const open = (link: HTMLAnchorElement): void => {
    invoker?.removeAttribute("aria-current");
    invoker = link;
    link.setAttribute("aria-current", "true");
    const label = passageLabel(link);
    title.textContent = `${label} · NRSVue`;
    external.href = link.href;
    frame.src = framedUrl(link.href);
    if (!dialog.matches(":popover-open")) dialog.showPopover();
  };

  dialog.addEventListener("toggle", event => {
    if ((event as ToggleEvent).newState === "closed") {
      invoker?.removeAttribute("aria-current");
      frame.removeAttribute("src");
    }
  });

  return { dialog, open };
}

function init(): void {
  if (!Object.hasOwn(HTMLElement.prototype, "popover")) return;
  if (!document.querySelector(LINK_SELECTOR)) return;

  let reader: ReturnType<typeof buildReader> | undefined;

  document.addEventListener("click", event => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    const link = (event.target as Element).closest<HTMLAnchorElement>(
      LINK_SELECTOR,
    );
    if (!link) return;
    event.preventDefault();
    reader ??= buildReader();
    reader.open(link);
  });
}

init();
