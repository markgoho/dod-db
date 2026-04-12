export function revealTranscript(): void {
  const transcript = document.querySelector<HTMLElement>(".episode-transcript");
  transcript?.classList.add("episode-transcript--revealed");
}

function initTranscriptPreview(): void {
  const transcriptRevealButton = document.querySelector<HTMLButtonElement>(
    ".transcript-reveal-button",
  );

  if (transcriptRevealButton) {
    transcriptRevealButton.addEventListener("click", revealTranscript);
  }

  if (globalThis.location.hash) {
    const hashTarget = document.querySelector(globalThis.location.hash);
    if (
      globalThis.location.hash.startsWith("#t-") ||
      hashTarget?.classList.contains("episode-segment-card")
    ) {
      revealTranscript();
    }
  }

  const mediaPlayer = document.querySelector("audio, .video-player");
  if (!mediaPlayer) {
    return;
  }

  globalThis.addEventListener("play", revealTranscript, true);

  globalThis.addEventListener(
    "click",
    event => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      if (
        target.closest(".video-player") ||
        target.closest(".episode-segment-card")
      ) {
        revealTranscript();
      }
    },
    true,
  );
}

initTranscriptPreview();
