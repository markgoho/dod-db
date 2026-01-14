import {
  getVideoIdFromUrl,
  getEpisode,
  escapeHtml,
  fetchVocabulary,
  getTagCategory,
  getTagVocabEntry,
  toggleDescriptionField,
  addTagWithPolling,
  reprocessTag as reprocessTagShared,
  reprocessAllEpisodes,
  type Episode,
  type TagVocabularyEntry,
} from '../../shared/utilities.js';

const videoId = getVideoIdFromUrl();
let episode: Episode | undefined;
let vocabulary: TagVocabularyEntry[] = [];
let currentCategory = 'all';
let selectedTag: string | undefined;

async function init(): Promise<void> {
  const tagsContainer = document.querySelector('#tags-container');

  if (!videoId) {
    if (tagsContainer) {
      tagsContainer.innerHTML =
        '<div class="empty-state"><div class="empty-state-text">Invalid episode URL</div></div>';
    }
    return;
  }

  try {
    const [episodeData, vocabData] = await Promise.all([
      getEpisode(videoId),
      fetchVocabulary(),
    ]);

    episode = episodeData;
    vocabulary = vocabData;

    if (!episode) {
      if (tagsContainer) {
        tagsContainer.innerHTML =
          '<div class="empty-state"><div class="empty-state-text">Episode not found</div></div>';
      }
      return;
    }

    // Update breadcrumb
    const breadcrumbEpisode = document.querySelector('#breadcrumb-episode') as HTMLAnchorElement;
    if (breadcrumbEpisode) {
      breadcrumbEpisode.href = `/episode/${videoId}`;
      breadcrumbEpisode.textContent = `Episode ${episode.episodeNumber || '?'}`;
    }

    const pageTitle = document.querySelector('#page-title');
    if (pageTitle) {
      pageTitle.textContent = `Episode ${episode.episodeNumber || '?'}: Tags`;
    }
    document.title = `Tags - Episode ${episode.episodeNumber || '?'} - DoD Tools`;

    updateStats();
    renderTags();
    setupEventListeners();
  } catch (error) {
    console.error('Failed to load tags:', error);
    if (tagsContainer) {
      tagsContainer.innerHTML =
        '<div class="empty-state"><div class="empty-state-text">Failed to load tags</div></div>';
    }
  }
}

function updateStats(): void {
  if (!episode) return;
  const tags = episode.tags || [];
  const totalMentions = tags.reduce((sum, t) => sum + t.mentions, 0);
  const categories = new Set(tags.map((t) => getTagCategory({ tagName: t.tag, vocabulary })));

  const totalTagsElement = document.querySelector('#total-tags');
  const totalMentionsElement = document.querySelector('#total-mentions');
  const categoriesCountElement = document.querySelector('#categories-count');

  if (totalTagsElement) totalTagsElement.textContent = String(tags.length);
  if (totalMentionsElement) totalMentionsElement.textContent = String(totalMentions);
  if (categoriesCountElement) categoriesCountElement.textContent = String(categories.size);
}

function setupEventListeners(): void {
  // Category tabs
  for (const tab of document.querySelectorAll('.category-tab')) {
    tab.addEventListener('click', () => {
      for (const t of document.querySelectorAll('.category-tab')) {
        t.classList.remove('active');
      }
      tab.classList.add('active');
      const tabElement = tab as HTMLElement;
      currentCategory = tabElement.dataset.category || 'all';
      renderTags();
    });
  }

  // Add tag form
  const addTagForm = document.querySelector('#add-tag-form');
  addTagForm?.addEventListener('submit', addTag);
}

function renderTags(): void {
  if (!episode) return;
  const container = document.querySelector('#tags-container');
  if (!container) return;

  let tags = episode.tags || [];

  if (currentCategory !== 'all') {
    tags = tags.filter((t) => getTagCategory({ tagName: t.tag, vocabulary }) === currentCategory);
  }

  if (tags.length === 0) {
    container.innerHTML =
      '<div class="empty-state" style="grid-column: 1 / -1;"><div class="empty-state-text">No tags in this category</div></div>';
    return;
  }

  // Sort by mentions
  tags = [...tags].sort((a, b) => b.mentions - a.mentions);

  container.innerHTML = tags
    .map((tag) => {
      const category = getTagCategory({ tagName: tag.tag, vocabulary });
      return `
      <div class="tag-card ${category}" onclick="showTagDetail('${escapeHtml(tag.tag)}')">
        <div class="tag-info">
          <div class="tag-name">${escapeHtml(tag.tag)}</div>
          <div class="tag-category-label">${category}</div>
        </div>
        <div class="tag-mentions">${tag.mentions}</div>
      </div>
    `;
    })
    .join('');
}

(globalThis as typeof globalThis & Window).showTagDetail = function (tagName: string): void {
  if (!episode) return;
  const tag = episode.tags?.find((t) => t.tag === tagName);
  const vocabEntry = getTagVocabEntry({ tagName, vocabulary });
  selectedTag = tagName;

  const modalTitle = document.querySelector('#modal-title');
  if (modalTitle) modalTitle.textContent = tagName;

  let html = `
    <div class="detail-row">
      <div class="detail-label">Mentions in Episode</div>
      <div class="detail-value">${tag?.mentions || 0}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Category</div>
      <div class="detail-value">${vocabEntry?.category || 'Unknown'}</div>
    </div>
  `;

  if (vocabEntry && vocabEntry.variations && vocabEntry.variations.length > 0) {
    html += `
      <div class="detail-row">
        <div class="detail-label">Variations</div>
        <div class="variations-list">
          ${vocabEntry.variations.map((v) => `<span class="variation-badge">${escapeHtml(v)}</span>`).join('')}
        </div>
      </div>
    `;
  }

  if (vocabEntry?.description) {
    html += `
      <div class="detail-row">
        <div class="detail-label">Description</div>
        <div class="detail-value">${escapeHtml(vocabEntry.description)}</div>
      </div>
    `;
  }

  if (vocabEntry?.llmVerify) {
    html += `
      <div class="detail-row">
        <div class="detail-value" style="color: var(--color-primary); font-size: 14px;">
          LLM verification enabled for this tag
        </div>
      </div>
    `;
  }

  const modalContent = document.querySelector('#modal-content');
  const tagModalElement = document.querySelector('#tag-modal');

  if (modalContent) modalContent.innerHTML = html;
  tagModalElement?.classList.add('show');
};

(globalThis as typeof globalThis & Window).toggleDescription = function (): void {
  toggleDescriptionField();
};

async function addTag(event: Event): Promise<void> {
  event.preventDefault();

  await addTagWithPolling({
    pollingConfig: {
      statusContainerSelector: '#add-tag-status',
      statusBadgeSelector: '#add-tag-status-badge',
      logsContainerSelector: '#add-tag-logs',
      onComplete: async () => {
        await refreshEpisode();
      },
    },
  });
}

(globalThis as typeof globalThis & Window).reprocessTag = async function (): Promise<void> {
  if (!selectedTag) return;

  // Close modal before starting reprocessing
  const closeModalFunction = (globalThis as { closeModal?: () => void }).closeModal;
  closeModalFunction?.();

  await reprocessTagShared({
    canonical: selectedTag,
    pollingConfig: {
      statusContainerSelector: '#reprocess-status',
      statusBadgeSelector: '#reprocess-status-badge',
      logsContainerSelector: '#reprocess-logs',
      onComplete: async () => {
        await refreshEpisode();
      },
    },
  });
};

(globalThis as typeof globalThis & Window).reprocessEpisode = async function (): Promise<void> {
  await reprocessAllEpisodes({
    pollingConfig: {
      statusContainerSelector: '#reprocess-status',
      statusBadgeSelector: '#reprocess-status-badge',
      logsContainerSelector: '#reprocess-logs',
      onComplete: async () => {
        await refreshEpisode();
      },
    },
  });
};

async function refreshEpisode(): Promise<void> {
  if (!videoId) return;
  try {
    episode = await getEpisode(videoId);
    updateStats();
    renderTags();
  } catch (error) {
    console.error('Refresh error:', error);
  }
}

(globalThis as typeof globalThis & Window).closeModal = function (): void {
  const modal = document.querySelector('#tag-modal');
  modal?.classList.remove('show');
  selectedTag = undefined;
};

// Close modal on escape
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    const closeModalFunction = (globalThis as { closeModal?: () => void }).closeModal;
    closeModalFunction?.();
  }
});

// Close modal on backdrop click
const tagModal = document.querySelector('#tag-modal');
tagModal?.addEventListener('click', (event) => {
  if ((event.target as HTMLElement).id === 'tag-modal') {
    const closeModalFunction = (globalThis as { closeModal?: () => void }).closeModal;
    closeModalFunction?.();
  }
});

// Declare global functions for onclick handlers
declare global {
  interface Window {
    showTagDetail: (tagName: string) => void;
    closeModal: () => void;
    toggleDescription: () => void;
    reprocessTag: () => Promise<void>;
    reprocessEpisode: () => Promise<void>;
  }
}

init();
