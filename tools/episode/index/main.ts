import { DoDTools } from "../../shared/utilities.js";

const videoId = DoDTools.getVideoIdFromUrl();

async function init(): Promise<void> {
  if (!videoId) {
    const heroElement = document.querySelector("#episode-hero");
    if (heroElement) {
      heroElement.innerHTML =
        '<div class="empty-state"><div class="empty-state-text">Invalid episode URL</div></div>';
    }
    return;
  }

  try {
    const episode = await DoDTools.getEpisode(videoId);

    if (!episode) {
      const heroElement = document.querySelector("#episode-hero");
      if (heroElement) {
        heroElement.innerHTML =
          '<div class="empty-state"><div class="empty-state-text">Episode not found</div></div>';
      }
      return;
    }

    renderEpisode(episode);
    renderTools(episode);

    if (episode.hasAudio) {
      renderAudio();
    }

    // Update page title
    document.title = `Episode ${episode.episodeNumber || "?"} - DoD Tools`;
  } catch (error) {
    console.error("Failed to load episode:", error);
    const heroElement = document.querySelector("#episode-hero");
    if (heroElement) {
      heroElement.innerHTML =
        '<div class="empty-state"><div class="empty-state-text">Failed to load episode</div></div>';
    }
  }
}

function renderEpisode(
  episode: Awaited<ReturnType<typeof DoDTools.getEpisode>>,
): void {
  if (!episode) return;

  const heroElement = document.querySelector("#episode-hero");
  const breadcrumbTitle = document.querySelector("#breadcrumb-title");

  if (breadcrumbTitle) {
    breadcrumbTitle.textContent = `Episode ${episode.episodeNumber || "?"}`;
  }

  const tagCount = episode.tags?.length || 0;
  const scriptureCount = episode.scriptures?.length || 0;
  const segmentCount = episode.segments?.length || 0;
  const totalMentions =
    episode.tags?.reduce((sum, t) => sum + t.mentions, 0) || 0;

  if (heroElement) {
    heroElement.innerHTML = `
      <div>
        <span class="episode-badge">Episode ${episode.episodeNumber || "?"}</span>
        <h1>${DoDTools.escapeHtml(episode.title)}</h1>
        <div class="episode-date">${DoDTools.formatDate(episode.publishedAt)}</div>
      </div>
      <div class="quick-info">
        <div class="quick-info-item">
          <div class="quick-info-value">${tagCount}</div>
          <div class="quick-info-label">Tags</div>
        </div>
        <div class="quick-info-item">
          <div class="quick-info-value">${totalMentions}</div>
          <div class="quick-info-label">Tag Mentions</div>
        </div>
        <div class="quick-info-item">
          <div class="quick-info-value">${scriptureCount}</div>
          <div class="quick-info-label">Books</div>
        </div>
        <div class="quick-info-item">
          <div class="quick-info-value">${segmentCount}</div>
          <div class="quick-info-label">Segments</div>
        </div>
      </div>
    `;
  }
}

function renderTools(
  episode: Awaited<ReturnType<typeof DoDTools.getEpisode>>,
): void {
  if (!episode) return;

  const toolsGrid = document.querySelector("#tools-grid");
  const tagCount = episode.tags?.length || 0;
  const scriptureCount = episode.scriptures?.length || 0;
  const segmentCount = episode.segments?.length || 0;

  if (toolsGrid) {
    toolsGrid.innerHTML = `
      <a href="/episode/segments?id=${videoId}" class="tool-nav-card">
        <span class="tool-nav-icon">📊</span>
        <div class="tool-nav-title">Segments</div>
        <div class="tool-nav-description">
          View and edit segment boundaries. Verify timestamps and segment types.
        </div>
        <div class="tool-nav-stat">${segmentCount} segments detected</div>
      </a>

      <a href="/episode/tags?id=${videoId}" class="tool-nav-card">
        <span class="tool-nav-icon">🏷️</span>
        <div class="tool-nav-title">Tags</div>
        <div class="tool-nav-description">
          Browse all tags extracted from this episode, organized by category.
        </div>
        <div class="tool-nav-stat">${tagCount} tags found</div>
      </a>

      <a href="/episode/scriptures?id=${videoId}" class="tool-nav-card">
        <span class="tool-nav-icon">📖</span>
        <div class="tool-nav-title">Scriptures</div>
        <div class="tool-nav-description">
          Review detected Bible books and add a book when the transcript supports it.
        </div>
        <div class="tool-nav-stat">${scriptureCount} books indexed</div>
      </a>
    `;
  }
}

function renderAudio(): void {
  if (!videoId) return;

  const audioSection = document.querySelector("#audio-section") as HTMLElement;
  if (audioSection) {
    audioSection.style.display = "block";
  }

  DoDTools.createAudioPlayer("audio-container", videoId);
}

init();
