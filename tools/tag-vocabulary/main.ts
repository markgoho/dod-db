/**
 * Tag Vocabulary Management UI
 * Client-side TypeScript for the tag vocabulary tool
 */

import {
  API_BASE_URL,
  CATEGORY_LABELS,
  formatDate,
  escapeHtml,
  toggleDescriptionField,
  updateFormButtonState,
  addTagWithPolling,
  reprocessTag as reprocessTagShared,
  reprocessAllEpisodes,
  startJobPollingWithUI,
  getTagFormData,
} from '../shared/utilities.js';

// Available tag categories (loaded from API)
let availableCategories: string[] = [];

// Get tag category class
function getTagCategoryClass(_tagName: string): string {
  // For now, return default; will be enhanced in Phase 2 with vocabulary data
  return '';
}

interface Episode {
  videoId: string;
  title: string;
  publishedAt: string;
  episodeNumber?: number;
  tags?: Array<{ tag: string; mentions: number }>;
}

// Render episode card
function renderEpisodeCard(episode: Episode): string {
  const tagCount = episode.tags?.length || 0;
  const tagsPreview = episode.tags?.slice(0, 5) || [];
  const moreCount = tagCount > 5 ? tagCount - 5 : 0;

  return `
    <div class="episode-card" onclick="toggleEpisodeDetail('${episode.videoId}')">
      <div class="episode-header">
        <div class="episode-number">Episode ${episode.episodeNumber || '?'}</div>
        <div class="episode-title">${episode.title}</div>
      </div>
      <div class="episode-meta">
        <span>📅 ${formatDate(episode.publishedAt)}</span>
        <span>🏷️ ${tagCount} tags</span>
      </div>
      <div class="episode-tags">
        ${tagsPreview
          .map(
            (tag) => `
          <span class="tag-badge ${getTagCategoryClass(tag.tag)}">
            ${tag.tag} (${tag.mentions})
          </span>
        `,
          )
          .join('')}
        ${moreCount > 0 ? `<span class="tag-badge">+${moreCount} more</span>` : ''}
      </div>
      <div class="episode-detail" id="detail-${episode.videoId}">
        <div class="tag-list">
          ${(episode.tags || [])
            .map(
              (tag) => `
            <div class="tag-detail">
              <span class="tag-name">${tag.tag}</span>
              <span class="tag-mentions">${tag.mentions} mentions</span>
            </div>
          `,
            )
            .join('')}
        </div>
      </div>
    </div>
  `;
}

// Toggle episode detail expansion
function toggleEpisodeDetail(videoId: string): void {
  const detail = document.querySelector(`#detail-${videoId}`);
  if (detail) {
    detail.classList.toggle('show');
  }
}

// Store all episodes for filtering
let allEpisodes: Episode[] = [];

// Load and display episodes
async function loadEpisodes(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tag-vocabulary/episodes`);
    if (!response.ok) {
      throw new Error('Failed to load episodes');
    }

    allEpisodes = await response.json();

    // Update stats
    const totalEpisodes = allEpisodes.length;
    const totalTags = allEpisodes.reduce(
      (sum, ep) => sum + (ep.tags?.length || 0),
      0,
    );
    const avgTags =
      totalEpisodes > 0 ? (totalTags / totalEpisodes).toFixed(1) : '0';

    const totalEpisodesElement = document.querySelector('#total-episodes');
    const totalTagsElement = document.querySelector('#total-tags');
    const avgTagsElement = document.querySelector('#avg-tags');

    if (totalEpisodesElement) totalEpisodesElement.textContent = totalEpisodes.toString();
    if (totalTagsElement) totalTagsElement.textContent = totalTags.toString();
    if (avgTagsElement) avgTagsElement.textContent = avgTags;

    // Populate tag filter dropdown
    populateTagFilter(allEpisodes);

    // Render episodes with initial filter
    filterEpisodes();
  } catch (error) {
    console.error('Error loading episodes:', error);
    const container = document.querySelector('#episodes-container');
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <div class="empty-state-text">Error loading episodes: ${error instanceof Error ? error.message : 'Unknown error'}</div>
        </div>
      `;
    }
  }
}

// Populate tag filter dropdown with all unique tags
function populateTagFilter(episodes: Episode[]): void {
  const allTags = new Set<string>();
  for (const episode of episodes) {
    if (episode.tags) {
      for (const tag of episode.tags) {
        allTags.add(tag.tag);
      }
    }
  }

  const tagFilter = document.querySelector('#tag-filter') as HTMLSelectElement;
  if (!tagFilter) return;

  const sortedTags = [...allTags].sort();

  // Keep "All tags" option and add all unique tags
  tagFilter.innerHTML =
    '<option value="">All tags</option>' +
    sortedTags.map((tag) => `<option value="${tag}">${tag}</option>`).join('');
}

// Filter and sort episodes based on user input
function filterEpisodes(): void {
  const searchInput = document.querySelector(
    '#episode-search',
  ) as HTMLInputElement;
  const tagFilterElement = document.querySelector(
    '#tag-filter',
  ) as HTMLSelectElement;
  const sortSelect = document.querySelector('#sort-select') as HTMLSelectElement;

  if (!searchInput || !tagFilterElement || !sortSelect) return;

  const searchTerm = searchInput.value.toLowerCase();
  const selectedTag = tagFilterElement.value;
  const sortOption = sortSelect.value;

  // Filter episodes
  const filtered = allEpisodes.filter((episode) => {
    // Search filter
    const matchesSearch =
      !searchTerm || episode.title.toLowerCase().includes(searchTerm);

    // Tag filter
    const matchesTag =
      !selectedTag ||
      (episode.tags && episode.tags.some((t) => t.tag === selectedTag));

    return matchesSearch && matchesTag;
  });

  // Sort episodes
  filtered.sort((a, b) => {
    switch (sortOption) {
      case 'episode-desc': {
        return (b.episodeNumber || 0) - (a.episodeNumber || 0);
      }
      case 'episode-asc': {
        return (a.episodeNumber || 0) - (b.episodeNumber || 0);
      }
      case 'date-desc': {
        return b.publishedAt.localeCompare(a.publishedAt);
      }
      case 'date-asc': {
        return a.publishedAt.localeCompare(b.publishedAt);
      }
      case 'tags-desc': {
        return (b.tags?.length || 0) - (a.tags?.length || 0);
      }
      case 'tags-asc': {
        return (a.tags?.length || 0) - (b.tags?.length || 0);
      }
      default: {
        return 0;
      }
    }
  });

  // Render filtered episodes
  renderEpisodesGrid(filtered);
}

// Render episodes grid
function renderEpisodesGrid(episodes: Episode[]): void {
  const container = document.querySelector('#episodes-container');
  if (!container) return;

  if (episodes.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <div class="empty-state-text">No episodes match your filters</div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="episodes-grid">
      ${episodes.map(renderEpisodeCard).join('')}
    </div>
  `;
}

interface TagDefinition {
  canonical: string;
  variations: string[];
  category: string;
  llmVerify?: boolean;
  caseSensitive?: boolean;
  description?: string;
  status?: string;
}

// Load and display vocabulary
let allVocabulary: TagDefinition[] = [];
let currentCategory = 'all';

// Load available categories from API
async function loadCategories(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tag-vocabulary/categories`);
    if (!response.ok) {
      throw new Error('Failed to load categories');
    }
    availableCategories = await response.json();

    // Render category tabs
    renderCategoryTabs();

    // Populate category select dropdowns
    populateCategorySelects();
  } catch (error) {
    console.error('Error loading categories:', error);
    // Fallback to hardcoded categories if API fails
    availableCategories = [
      'character',
      'person',
      'place',
      'people',
      'literature',
      'theology',
      'scholarship',
      'religion',
    ];
    renderCategoryTabs();
    populateCategorySelects();
  }
}

// Render category tabs dynamically
function renderCategoryTabs(): void {
  const tabsContainer = document.querySelector('#category-tabs');
  if (!tabsContainer) return;

  tabsContainer.innerHTML = `
    <div class="category-tab active" onclick="filterVocabulary('all')">All</div>
    ${availableCategories
      .map(
        (cat) => `
      <div class="category-tab" onclick="filterVocabulary('${cat}')">
        ${CATEGORY_LABELS[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)}
      </div>
    `,
      )
      .join('')}
  `;
}

// Populate category select dropdowns
function populateCategorySelects(): void {
  const selects = [document.querySelector('#tag-category')];

  for (const select of selects) {
    if (select) {
      select.innerHTML = `
        <option value="">Select a category...</option>
        ${availableCategories
          .map(
            (cat) => `
          <option value="${cat}">${CATEGORY_LABELS[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
        `,
          )
          .join('')}
      `;
    }
  }
}

async function loadVocabulary(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tag-vocabulary/vocabulary`);
    if (!response.ok) {
      throw new Error('Failed to load vocabulary');
    }

    // Filter out rejected tags
    const vocab = await response.json();
    allVocabulary = vocab.filter(
      (tag: TagDefinition) => tag.status !== 'rejected',
    );
    renderVocabulary(currentCategory);
  } catch (error) {
    console.error('Error loading vocabulary:', error);
    const container = document.querySelector('#vocabulary-container');
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <div class="empty-state-text">Error loading vocabulary: ${error instanceof Error ? error.message : 'Unknown error'}</div>
        </div>
      `;
    }
  }
}

// Render vocabulary filtered by category
function renderVocabulary(category: string): void {
  currentCategory = category;

  // Update active tab
  for (const tab of document.querySelectorAll('.category-tab')) {
    tab.classList.remove('active');
  }
  const activeTab = [...document.querySelectorAll('.category-tab')].find((tab) => tab.textContent?.toLowerCase().includes(category));
  activeTab?.classList.add('active');

  // Filter vocabulary
  const filtered =
    category === 'all'
      ? allVocabulary
      : allVocabulary.filter((term) => term.category === category);

  // Render cards
  const container = document.querySelector('#vocabulary-container');
  if (!container) return;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <div class="empty-state-text">No vocabulary terms found for this category</div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="vocab-grid">
      ${filtered
        .map(
          (term) => `
        <div class="vocab-card">
          <div class="vocab-canonical">
            ${term.canonical}
            ${term.llmVerify ? '<span class="llm-verify-badge" title="Uses LLM verification for context">🤖 LLM</span>' : ''}
            ${term.caseSensitive ? '<span class="case-sensitive-badge" title="Case-sensitive matching">Aa</span>' : ''}
          </div>
          <div class="vocab-variations">
            ${term.variations.length > 0 ? `Variations: ${term.variations.join(', ')}` : 'No variations'}
          </div>
          ${
            term.description
              ? `
            <div class="vocab-description">
              <strong>Context:</strong> ${term.description}
            </div>
          `
              : ''
          }
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
            <span class="vocab-category-badge ${term.category}">
              ${formatCategoryName(term.category)}
            </span>
            ${
              term.status === 'accepted' || !term.status
                ? `
              <button
                class="vocab-reprocess-btn"
                onclick="reprocessSingleTag('${term.canonical.replaceAll('\'', String.raw`\'`)}')"
                title="Reprocess all episodes for this tag${term.llmVerify ? ' (uses LLM verification)' : ''}">
                🔄 Reprocess
              </button>
            `
                : ''
            }
          </div>
        </div>
      `,
        )
        .join('')}
    </div>
  `;
}

// Filter vocabulary by category (called from onclick)
function filterVocabulary(category: string): void {
  renderVocabulary(category);
}

// Format category name for display
function formatCategoryName(category: string): string {
  return category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Generate category options for select dropdown with selected value
function getCategoryOptions(selectedCategory: string): string {
  return availableCategories
    .map(
      (cat) =>
        `<option value="${cat}" ${cat === selectedCategory ? 'selected' : ''}>
          ${CATEGORY_LABELS[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)}
        </option>`,
    )
    .join('');
}

interface TagStats {
  canonical: string;
  category: string;
  episodeCount: number;
  totalMentions: number;
  variations: string[];
}

// Load and display analytics
async function loadAnalytics(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tag-vocabulary/tag-stats`);
    if (!response.ok) {
      throw new Error('Failed to load analytics');
    }

    const stats: TagStats[] = await response.json();
    renderAnalytics(stats);
  } catch (error) {
    console.error('Error loading analytics:', error);
    const container = document.querySelector('#analytics-container');
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <div class="empty-state-text">Error loading analytics: ${error instanceof Error ? error.message : 'Unknown error'}</div>
        </div>
      `;
    }
  }
}

// Render analytics dashboard
function renderAnalytics(stats: TagStats[]): void {
  const container = document.querySelector('#analytics-container');
  if (!container) return;

  if (stats.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <div class="empty-state-text">No tag statistics available</div>
      </div>
    `;
    return;
  }

  // Top 15 most used tags (sort by episode count)
  const sortedByEpisodeCount = [...stats].sort(
    (a, b) => b.episodeCount - a.episodeCount,
  );
  const topTags = sortedByEpisodeCount.slice(0, 15);
  const maxEpisodeCount = Math.max(...topTags.map((t) => t.episodeCount));

  // Find underused vocabulary terms (in vocabulary but < 3 episodes)
  const underused = stats.filter(
    (s) => s.episodeCount < 3 && s.episodeCount > 0,
  );

  // Category distribution
  const categoryCount: Record<string, number> = {};
  for (const stat of stats) {
    categoryCount[stat.category] = (categoryCount[stat.category] || 0) + 1;
  }

  container.innerHTML = `
    <div class="analytics-grid">
      <div class="analytics-card">
        <div class="analytics-title">Top 15 Most Used Tags</div>
        ${topTags
          .map((tag) => {
            const percentage = (tag.episodeCount / maxEpisodeCount) * 100;
            return `
            <div class="chart-bar">
              <div class="chart-label">${tag.canonical}</div>
              <div class="chart-bar-container">
                <div class="chart-bar-fill" style="width: ${percentage}%"></div>
              </div>
              <div class="chart-value">${tag.episodeCount}</div>
            </div>
          `;
          })
          .join('')}
      </div>

      <div class="analytics-card">
        <div class="analytics-title">Category Distribution</div>
        ${Object.entries(categoryCount)
          .sort((a, b) => b[1] - a[1])
          .map(([category, count]) => {
            const percentage = (count / stats.length) * 100;
            return `
              <div class="chart-bar">
                <div class="chart-label">${formatCategoryName(category)}</div>
                <div class="chart-bar-container">
                  <div class="chart-bar-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="chart-value">${count}</div>
              </div>
            `;
          })
          .join('')}
      </div>
    </div>

    ${
      underused.length > 0
        ? `
      <div class="analytics-card">
        <div class="analytics-title">Underused Vocabulary (< 3 episodes)</div>
        <div class="underused-list">
          ${underused
            .map(
              (tag) => `
            <span class="underused-tag">${tag.canonical} (${tag.episodeCount})</span>
          `,
            )
            .join('')}
        </div>
      </div>
    `
        : ''
    }
  `;
}

// Migration management
async function startMigration(): Promise<void> {
  const button = document.querySelector('#migrate-btn') as HTMLButtonElement;

  if (!button) return;

  // Disable button
  button.disabled = true;
  button.textContent = 'Starting...';

  await reprocessAllEpisodes({
    pollingConfig: {
      statusContainerSelector: '#migration-status',
      statusBadgeSelector: '#migration-status-badge',
      logsContainerSelector: '#migration-logs',
      onComplete: () => {
        button.disabled = false;
        button.textContent = 'Run Migration';
        // Reload data
        setTimeout(() => {
          loadEpisodes();
          loadAnalytics();
        }, 1000);
      },
    },
  });

  // Re-enable button if validation/confirmation failed
  button.disabled = false;
  button.textContent = 'Run Migration';
}

// Add tag form management
function toggleDescription(): void {
  toggleDescriptionField();
  validateForm();
}

function validateForm(): void {
  const formData = getTagFormData();
  updateFormButtonState({
    buttonSelector: '#add-tag-btn',
    formData,
  });
}


async function addTag(event: Event): Promise<void> {
  event.preventDefault();

  const button = document.querySelector('#add-tag-btn') as HTMLButtonElement;
  const successMessage = document.querySelector('#add-tag-success');
  const errorMessage = document.querySelector('#add-tag-error');

  if (!button || !successMessage || !errorMessage) return;

  // Hide previous messages
  successMessage.classList.remove('show');
  errorMessage.classList.remove('show');

  // Disable button
  button.disabled = true;
  button.textContent = 'Adding...';

  await addTagWithPolling({
    pollingConfig: {
      statusContainerSelector: '#add-tag-status',
      statusBadgeSelector: '#add-tag-status-badge',
      logsContainerSelector: '#add-tag-logs',
      onComplete: () => {
        button.disabled = false;
        button.textContent = 'Add Tag & Reprocess Episodes';
        successMessage.textContent = 'Tag added successfully!';
        successMessage.classList.add('show');
        // Reload all data
        setTimeout(() => {
          loadEpisodes();
          loadVocabulary();
          loadAnalytics();
        }, 1000);
      },
    },
  });

  // Re-enable button if validation failed (addTagWithPolling returns early)
  button.disabled = false;
  button.textContent = 'Add Tag & Reprocess Episodes';
}

// Reprocess a single tag across all episodes
async function reprocessSingleTag(canonical: string): Promise<void> {
  await reprocessTagShared({
    canonical,
    pollingConfig: {
      statusContainerSelector: '#migration-status',
      statusBadgeSelector: '#migration-status-badge',
      logsContainerSelector: '#migration-logs',
      onComplete: () => {
        // Reload all data
        setTimeout(() => {
          loadEpisodes();
          loadVocabulary();
          loadAnalytics();
        }, 1000);
      },
    },
  });
}

// ============================================
// PROPOSED TAGS REVIEW
// ============================================

let proposedTags: TagDefinition[] = [];

// Load proposed tags from vocabulary
async function loadProposedTags(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tag-vocabulary/vocabulary`);
    if (!response.ok) {
      throw new Error('Failed to load vocabulary');
    }

    const vocabulary: TagDefinition[] = await response.json();
    proposedTags = vocabulary.filter((tag) => tag.status === 'proposed');

    renderProposedTags();
  } catch (error) {
    console.error('Error loading proposed tags:', error);
    const container = document.querySelector('#proposed-container');
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <div class="empty-state-text">Error loading proposed tags: ${error instanceof Error ? error.message : 'Unknown error'}</div>
        </div>
      `;
    }
  }
}

// Render proposed tags for review
function renderProposedTags(): void {
  const section = document.querySelector('#proposed-section') as HTMLElement;
  const container = document.querySelector('#proposed-container') as HTMLElement;

  if (!section || !container) return;

  if (proposedTags.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';

  container.innerHTML = `
    <div class="proposed-grid">
      ${proposedTags.map((tag, index) => renderProposedCard(tag, index)).join('')}
    </div>
  `;
}

// Render a single proposed tag card
function renderProposedCard(tag: TagDefinition, index: number): string {
  const variationsString = tag.variations ? tag.variations.join(', ') : '';
  const escapedCanonical = escapeHtml(tag.canonical);
  const isLlmVerify = tag.llmVerify === true;
  const description = tag.description || '';

  return `
    <div class="proposed-card" id="proposed-card-${index}" data-original="${escapedCanonical}">
      <div class="proposed-header">
        <span class="proposed-status">Proposed</span>
      </div>
      <div class="proposed-form">
        <div class="proposed-row">
          <label class="proposed-label">Canonical:</label>
          <input type="text" class="proposed-input" id="proposed-canonical-${index}"
                 value="${escapedCanonical}" />
        </div>
        <div class="proposed-row">
          <label class="proposed-label">Variations:</label>
          <input type="text" class="proposed-input" id="proposed-variations-${index}"
                 value="${escapeHtml(variationsString)}"
                 placeholder="Comma-separated variations" />
        </div>
        <div class="proposed-row">
          <label class="proposed-label">Category:</label>
          <select class="proposed-select" id="proposed-category-${index}">
            ${getCategoryOptions(tag.category)}
          </select>
        </div>
        <div class="proposed-checkbox-row">
          <input type="checkbox" class="proposed-checkbox" id="proposed-llmVerify-${index}"
                 ${isLlmVerify ? 'checked' : ''}
                 onchange="toggleProposedDescription(${index})" />
          <label class="proposed-checkbox-label" for="proposed-llmVerify-${index}">
            Use LLM context verification
          </label>
        </div>
        <div class="proposed-hint">
          For ambiguous names (like "David" or "John"), use AI to verify each match based on context
        </div>
        <div class="proposed-checkbox-row">
          <input type="checkbox" class="proposed-checkbox" id="proposed-caseSensitive-${index}" />
          <label class="proposed-checkbox-label" for="proposed-caseSensitive-${index}">
            Case-sensitive matching
          </label>
        </div>
        <div class="proposed-hint">
          Match only exact case (e.g., "Lot" won't match "lot"). Use for words that are also common English words.
        </div>
        <div class="proposed-description-group ${isLlmVerify ? 'show' : ''}" id="proposed-description-group-${index}">
          <div class="proposed-row">
            <label class="proposed-label">Description:</label>
            <textarea class="proposed-textarea" id="proposed-description-${index}" rows="3"
                      placeholder="e.g., King David of Israel, second king, son of Jesse, defeated Goliath"
            >${escapeHtml(description)}</textarea>
          </div>
          <div class="proposed-hint">
            Brief description to help AI identify correct matches (required when using LLM verification)
          </div>
        </div>
      </div>
      <div class="proposed-actions">
        <button class="btn btn-approve" onclick="approveTag(${index})">
          ✓ Approve
        </button>
        <button class="btn btn-reject" onclick="rejectTag(${index})">
          ✗ Reject
        </button>
      </div>
    </div>
  `;
}

// Toggle description field visibility for proposed tags
function toggleProposedDescription(index: number): void {
  const llmVerify = (
    document.querySelector(`#proposed-llmVerify-${index}`) as HTMLInputElement
  ).checked;
  const descriptionGroup = document.querySelector(
    `#proposed-description-group-${index}`,
  );

  if (!descriptionGroup) return;

  descriptionGroup.classList.toggle('show', llmVerify);
}

// Approve a proposed tag
async function approveTag(index: number): Promise<void> {
  const card = document.querySelector(`#proposed-card-${index}`) as HTMLElement;
  if (!card) return;

  const originalCanonical = card.dataset.original;
  if (!originalCanonical) return;

  // Get updated values from form
  const newCanonical = (
    document.querySelector(`#proposed-canonical-${index}`) as HTMLInputElement
  ).value.trim();
  const variationsInput = (
    document.querySelector(`#proposed-variations-${index}`) as HTMLInputElement
  ).value.trim();
  const category = (
    document.querySelector(`#proposed-category-${index}`) as HTMLSelectElement
  ).value;
  const llmVerify = (
    document.querySelector(`#proposed-llmVerify-${index}`) as HTMLInputElement
  ).checked;
  const caseSensitive = (
    document.querySelector(
      `#proposed-caseSensitive-${index}`,
    ) as HTMLInputElement
  ).checked;
  const description = (
    document.querySelector(
      `#proposed-description-${index}`,
    ) as HTMLTextAreaElement
  ).value.trim();

  // Validate: if llmVerify is checked, description is required
  if (llmVerify && !description) {
    alert('Description is required when using LLM verification');
    return;
  }

  // Parse variations
  const variations = variationsInput
    ? variationsInput
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v.length > 0)
    : [];

  card.classList.add('saving');

  try {
    // Build update body based on llmVerify
    const updateBody = {
      canonical: newCanonical,
      variations,
      category,
      status: 'accepted',
      llmVerify,
      caseSensitive,
      description: llmVerify ? description : undefined,
    };

    // First update the tag with any changes
    const updateResponse = await fetch(
      `${API_BASE_URL}/api/tag-vocabulary/vocabulary/update/${encodeURIComponent(originalCanonical)}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateBody),
      },
    );

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      throw new Error(error.error || 'Failed to approve tag');
    }

    const data = await updateResponse.json();

    // Remove from proposed list and re-render
    proposedTags.splice(index, 1);
    renderProposedTags();

    // Reload vocabulary to show updated data
    loadVocabulary();
    loadAnalytics();

    // If reprocessing was triggered, show status and poll for updates using shared utility
    if (data.jobId) {
      startJobPollingWithUI({
        jobId: data.jobId,
        statusContainerSelector: '#migration-status',
        statusBadgeSelector: '#migration-status-badge',
        logsContainerSelector: '#migration-logs',
        initialMessage: `Reprocessing episodes for "${newCanonical}"...`,
        completedMessage: '✓ Tag Approved & Episodes Reprocessed',
        onComplete: () => {
          // Reload all data
          setTimeout(() => {
            loadEpisodes();
            loadVocabulary();
            loadAnalytics();
          }, 1000);
        },
      });
    }
  } catch (error) {
    alert(
      `Error approving tag: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    card.classList.remove('saving');
  }
}

// Reject a proposed tag
async function rejectTag(index: number): Promise<void> {
  const card = document.querySelector(`#proposed-card-${index}`) as HTMLElement;
  if (!card) return;

  const originalCanonical = card.dataset.original;
  if (!originalCanonical) return;

  if (
    !confirm(
      `Reject tag "${originalCanonical}"? It will be marked as rejected and excluded from future discovery.`,
    )
  ) {
    return;
  }

  card.classList.add('saving');

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/tag-vocabulary/vocabulary/reject/${encodeURIComponent(originalCanonical)}`,
      {
        method: 'POST',
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reject tag');
    }

    // Remove from proposed list and re-render
    proposedTags.splice(index, 1);
    renderProposedTags();

    // Reload vocabulary
    loadVocabulary();
  } catch (error) {
    alert(
      `Error rejecting tag: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    card.classList.remove('saving');
  }
}

// Initialize on page load
(async () => {
  await loadCategories(); // Load categories first
  loadProposedTags();
  loadEpisodes();
  loadVocabulary();
  loadAnalytics();
})();

// Make functions available globally for onclick handlers
declare global {
  interface Window {
    toggleEpisodeDetail: typeof toggleEpisodeDetail;
    filterVocabulary: typeof filterVocabulary;
    reprocessSingleTag: typeof reprocessSingleTag;
    filterEpisodes: typeof filterEpisodes;
    startMigration: typeof startMigration;
    toggleDescription: typeof toggleDescription;
    validateForm: typeof validateForm;
    addTag: typeof addTag;
    toggleProposedDescription: typeof toggleProposedDescription;
    approveTag: typeof approveTag;
    rejectTag: typeof rejectTag;
  }
}

(globalThis as unknown as Window).toggleEpisodeDetail = toggleEpisodeDetail;
(globalThis as unknown as Window).filterVocabulary = filterVocabulary;
(globalThis as unknown as Window).reprocessSingleTag = reprocessSingleTag;
(globalThis as unknown as Window).filterEpisodes = filterEpisodes;
(globalThis as unknown as Window).startMigration = startMigration;
(globalThis as unknown as Window).toggleDescription = toggleDescription;
(globalThis as unknown as Window).validateForm = validateForm;
(globalThis as unknown as Window).addTag = addTag;
(globalThis as unknown as Window).toggleProposedDescription = toggleProposedDescription;
(globalThis as unknown as Window).approveTag = approveTag;
(globalThis as unknown as Window).rejectTag = rejectTag;
