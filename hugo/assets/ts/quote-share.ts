const SHARE_BUTTON =
  '<button class="tag-quote__share" type="button" aria-label="Share this quote"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true" focusable="false"><path d="M228.24,108.24l-48,48a6,6,0,0,1-8.48-8.48L209.51,110H165a89.94,89.94,0,0,0-87.17,67.5,6,6,0,0,1-11.62-3A101.94,101.94,0,0,1,165,98h44.53L171.76,60.24a6,6,0,0,1,8.48-8.48l48,48A6,6,0,0,1,228.24,108.24ZM192,210H38V88a6,6,0,0,0-12,0V216a6,6,0,0,0,6,6H192a6,6,0,0,0,0-12Z"></path></svg></button>';

function init(): void {
  if (!("share" in globalThis.navigator)) {
    return;
  }

  const quotes = document.querySelectorAll<HTMLElement>(".tag-quote");
  for (const quote of quotes) {
    const episode = quote.querySelector<HTMLElement>(".tag-quote__episode");
    const url = episode?.dataset["shareUrl"]?.trim();

    if (!episode || !url) {
      continue;
    }

    quote.dataset["shareUrl"] = url;
    episode.insertAdjacentHTML("afterend", SHARE_BUTTON);
    episode.parentElement?.classList.add("tag-quote__actions");
    quote
      .querySelector<HTMLElement>(".tag-quote__meta")
      ?.classList.add("tag-quote__meta--actions");
  }

  document
    .querySelector<HTMLElement>(".tag-quotes")
    ?.addEventListener("click", event => {
      const button = (
        event.target as Element | null
      )?.closest<HTMLButtonElement>(".tag-quote__share");
      const quote = button?.closest<HTMLElement>(".tag-quote");
      const url = quote?.dataset["shareUrl"];
      if (!button || !quote || !url) {
        return;
      }

      void globalThis.navigator.share({ url }).catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        throw error;
      });
    });
}

init();
