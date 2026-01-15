/**
 * Minimal YouTube video player with facade pattern and timestamp seeking.
 * ~40 lines following "rule of least power".
 */

function init(): void {
  const player = document.querySelector<HTMLElement>('.video-player');
  const facade = player?.querySelector<HTMLAnchorElement>('.video-facade');
  if (!player || !facade) return;

  const videoId = player.dataset['videoId'];
  if (!videoId) return;

  // Replace facade with iframe on click
  facade.addEventListener('click', (event) => {
    event.preventDefault();
    loadIframe(player, videoId);
  });

  // Timestamp clicks: load iframe if needed, then seek
  for (const link of document.querySelectorAll<HTMLAnchorElement>('.timestamp')) {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const seconds = link.dataset['seconds'];
      if (!seconds) return;

      const iframe = player.querySelector<HTMLIFrameElement>('iframe');
      if (iframe) {
        // Iframe exists - seek to time
        const url = new URL(iframe.src);
        url.searchParams.set('start', seconds);
        url.searchParams.set('autoplay', '1');
        iframe.src = url.toString();
      } else {
        // Load iframe starting at this time
        loadIframe(player, videoId, seconds);
      }
    });
  }
}

function loadIframe(container: HTMLElement, videoId: string, startSeconds?: string): void {
  const iframe = document.createElement('iframe');
  const params = new URLSearchParams({ autoplay: '1', rel: '0' });
  if (startSeconds) {
    params.set('start', startSeconds);
  }
  iframe.src = `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;

  const facade = container.querySelector('.video-facade');
  facade?.replaceWith(iframe);
}

// Script in footer-scripts block runs after DOM is ready
init();
