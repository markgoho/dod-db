import { DoDTools } from "./shared/utilities.js";

// Types
interface Episode {
  videoId: string;
  episodeNumber?: number;
  title: string;
  publishedAt: string;
  tags?: Array<{ tag: string; mentions: number }>;
  segments?: Array<{ type: string }>;
}

// State
let allEpisodes: Episode[] = [];

async function init(): Promise<void> {
  try {
    allEpisodes = await DoDTools.getAllEpisodes();
    updateStats();
    renderEpisodes();
  } catch (error) {
    console.error("Failed to load episodes:", error);
    const container = document.querySelector("#episodes-container");
    if (container) {
      container.innerHTML =
        '<div class="empty-state"><div class="empty-state-icon">Error</div><div class="empty-state-text">Failed to load episodes</div></div>';
    }
  }
}

function updateStats(): void {
  const totalTags = allEpisodes.reduce(
    (sum, ep) => sum + (ep.tags?.length || 0),
    0,
  );
  const totalSegments = allEpisodes.reduce(
    (sum, ep) => sum + (ep.segments?.length || 0),
    0,
  );

  const totalEpisodesElement = document.querySelector("#total-episodes");
  const totalTagsElement = document.querySelector("#total-tags");
  const totalSegmentsElement = document.querySelector("#total-segments");

  if (totalEpisodesElement)
    totalEpisodesElement.textContent = String(allEpisodes.length);
  if (totalTagsElement) totalTagsElement.textContent = String(totalTags);
  if (totalSegmentsElement)
    totalSegmentsElement.textContent = String(totalSegments);
}

function getFilteredAndSortedEpisodes(): Episode[] {
  const searchInput = document.querySelector(
    "#search-input",
  ) as HTMLInputElement;
  const sortSelect = document.querySelector(
    "#sort-select",
  ) as HTMLSelectElement;

  if (!searchInput || !sortSelect) return [];

  const searchTerm = searchInput.value.toLowerCase();
  const sortValue = sortSelect.value;

  let filtered = allEpisodes;

  // Filter by search term
  if (searchTerm) {
    filtered = filtered.filter(
      ep =>
        ep.title.toLowerCase().includes(searchTerm) ||
        ep.tags?.some(t => t.tag.toLowerCase().includes(searchTerm)),
    );
  }

  // Sort
  const sorted = [...filtered];
  switch (sortValue) {
    case "episode-desc": {
      sorted.sort((a, b) => (b.episodeNumber || 0) - (a.episodeNumber || 0));
      break;
    }
    case "episode-asc": {
      sorted.sort((a, b) => (a.episodeNumber || 0) - (b.episodeNumber || 0));
      break;
    }
    case "date-desc": {
      sorted.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );
      break;
    }
    case "date-asc": {
      sorted.sort(
        (a, b) =>
          new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
      );
      break;
    }
    case "tags-desc": {
      sorted.sort((a, b) => (b.tags?.length || 0) - (a.tags?.length || 0));
      break;
    }
    case "tags-asc": {
      sorted.sort((a, b) => (a.tags?.length || 0) - (b.tags?.length || 0));
      break;
    }
  }

  return sorted;
}

function renderEpisodes(): void {
  const episodes = getFilteredAndSortedEpisodes();
  const container = document.querySelector("#episodes-container");
  const countElement = document.querySelector("#episodes-count");

  if (!container || !countElement) return;

  countElement.textContent = `Showing ${episodes.length} of ${allEpisodes.length} episodes`;

  if (episodes.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">No Episodes</div>
        <div class="empty-state-text">No episodes match your search</div>
      </div>
    `;
    return;
  }

  container.innerHTML = episodes
    .map(episode => {
      const tagCount = episode.tags?.length || 0;
      const segmentCount = episode.segments?.length || 0;
      const tagsPreview = episode.tags?.slice(0, 4) || [];
      const moreCount = tagCount > 4 ? tagCount - 4 : 0;

      return `
      <a href="/episode/index?id=${episode.videoId}" class="episode-card">
        <div class="episode-header">
          <div class="episode-number">Episode ${episode.episodeNumber || "?"}</div>
          <div class="episode-title">${DoDTools.escapeHtml(episode.title)}</div>
        </div>
        <div class="episode-meta">
          <span>${DoDTools.formatDate(episode.publishedAt)}</span>
          <span>${tagCount} tags</span>
          <span>${segmentCount} segments</span>
        </div>
        ${
          tagsPreview.length > 0
            ? `
          <div class="episode-tags">
            ${tagsPreview.map(tag => `<span class="tag-badge">${DoDTools.escapeHtml(tag.tag)} (${tag.mentions})</span>`).join("")}
            ${moreCount > 0 ? `<span class="tag-badge">+${moreCount} more</span>` : ""}
          </div>
        `
            : ""
        }
      </a>
    `;
    })
    .join("");
}

// Event listeners
const searchInput = document.querySelector("#search-input");
const sortSelect = document.querySelector("#sort-select");

if (searchInput) {
  searchInput.addEventListener("input", DoDTools.debounce(renderEpisodes, 200));
}

if (sortSelect) {
  sortSelect.addEventListener("change", renderEpisodes);
}

// Initialize
init();
