/**
 * Tag Vocabulary Management UI
 * Client-side TypeScript for the tag vocabulary tool
 */

import type { TagCategory } from "../../src/config/tag-vocabulary.js";
import {
  addTagWithPolling,
  API_BASE_URL,
  CATEGORY_LABELS,
  escapeHtml,
  getTagFormData,
  reprocessAllEpisodes,
  reprocessTag as reprocessTagShared,
  startJobPollingWithUI,
  updateFormButtonState,
} from "../shared/utilities.js";

// Available tag categories (loaded from API)
let availableCategories: TagCategory[] = [];

interface TagDefinition {
  canonical: string;
  variations: string[];
  category: string;
  llmVerify?: boolean;
  caseSensitive?: boolean;
  description?: string;
  status?: string;
  addedInEpisode?: number;
  episodes?: number[];
  duplicateOf?: string;
}

function formatSuggestedEpisode(addedInEpisode?: number): string {
  if (!addedInEpisode) {
    return "Source episode: unknown";
  }

  return `Source episode: ${addedInEpisode}`;
}

function sortVocabularyNewestFirst(a: TagDefinition, b: TagDefinition): number {
  const aEpisode = a.addedInEpisode ?? -1;
  const bEpisode = b.addedInEpisode ?? -1;

  if (aEpisode !== bEpisode) {
    return bEpisode - aEpisode;
  }

  return a.canonical.localeCompare(b.canonical);
}

// Load and display vocabulary
let allVocabulary: TagDefinition[] = [];
let currentCategory = "all";
let proposedCategory = "all";

// Load available categories from API
async function loadCategories(): Promise<void> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/tag-vocabulary/categories`,
    );
    if (!response.ok) {
      throw new Error("Failed to load categories");
    }
    availableCategories = await response.json();

    // Render category tabs
    renderCategoryTabs();

    // Populate category select dropdowns
    populateCategorySelects();
  } catch (error) {
    console.error("Error loading categories:", error);
    // Fallback to hardcoded categories if API fails
    availableCategories = [
      "character",
      "person",
      "place",
      "people",
      "literature",
      "theology",
      "scholarship",
      "religion",
      "event",
      "miscellaneous",
    ];
    renderCategoryTabs();
    populateCategorySelects();
  }
}

// Render category tabs dynamically
function renderCategoryTabs(): void {
  const tabsContainer = document.querySelector("#category-tabs");
  if (!tabsContainer) return;

  tabsContainer.innerHTML = `
    <div class="category-tab active" onclick="filterVocabulary('all')">All</div>
    ${availableCategories
      .map(
        cat => `
      <div class="category-tab" onclick="filterVocabulary('${cat}')">
        ${CATEGORY_LABELS[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)}
      </div>
    `,
      )
      .join("")}
  `;
}

// Populate category select dropdowns
function populateCategorySelects(): void {
  const tagCategorySelect = document.querySelector("#tag-category");
  if (tagCategorySelect) {
    tagCategorySelect.innerHTML = `
      <option value="">Select a category...</option>
      ${availableCategories
        .map(
          cat => `
        <option value="${cat}">${CATEGORY_LABELS[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
      `,
        )
        .join("")}
    `;
  }

  const proposedCategorySelect = document.querySelector(
    "#proposed-category-filter",
  ) as HTMLSelectElement | null;
  if (proposedCategorySelect) {
    proposedCategorySelect.innerHTML = `
      <option value="all">All categories</option>
      ${availableCategories
        .map(
          cat => `
        <option value="${cat}">${CATEGORY_LABELS[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
      `,
        )
        .join("")}
    `;
    proposedCategorySelect.value = proposedCategory;
  }
}

async function loadVocabulary(): Promise<void> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/tag-vocabulary/vocabulary`,
    );
    if (!response.ok) {
      throw new Error("Failed to load vocabulary");
    }

    // Show only approved/accepted tags in the main vocabulary section.
    const vocab = await response.json();
    allVocabulary = vocab
      .filter((tag: TagDefinition) => tag.status === "accepted" || !tag.status)
      .sort(sortVocabularyNewestFirst);
    renderVocabulary(currentCategory);
  } catch (error) {
    console.error("Error loading vocabulary:", error);
    const container = document.querySelector("#vocabulary-container");
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <div class="empty-state-text">Error loading vocabulary: ${error instanceof Error ? error.message : "Unknown error"}</div>
        </div>
      `;
    }
  }
}

// Render vocabulary filtered by category
function renderVocabulary(category: string): void {
  currentCategory = category;

  // Update active tab
  for (const tab of document.querySelectorAll(".category-tab")) {
    tab.classList.remove("active");
  }
  const activeTab = [...document.querySelectorAll(".category-tab")].find(tab =>
    tab.textContent?.toLowerCase().includes(category),
  );
  activeTab?.classList.add("active");

  // Filter vocabulary
  const filtered =
    category === "all"
      ? allVocabulary
      : allVocabulary.filter(term => term.category === category);

  // Render cards
  const container = document.querySelector("#vocabulary-container");
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
      ${filtered.map((term, index) => renderAcceptedCard(term, index)).join("")}
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
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Generate category options for select dropdown with selected value
function getCategoryOptions(selectedCategory: string): string {
  return availableCategories
    .map(
      cat =>
        `<option value="${cat}" ${cat === selectedCategory ? "selected" : ""}>
          ${CATEGORY_LABELS[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)}
        </option>`,
    )
    .join("");
}

function renderAcceptedCard(term: TagDefinition, index: number): string {
  const variationsString = term.variations.join(", ");
  const escapedCanonical = escapeHtml(term.canonical);
  const isLlmVerify = term.llmVerify === true;
  const description = term.description || "";

  return `
    <div class="vocab-card" id="accepted-card-${index}" data-original="${escapedCanonical}">
      <div class="vocab-summary">
        <div class="vocab-canonical">
          ${escapedCanonical}
          ${term.llmVerify ? '<span class="llm-verify-badge" title="Uses LLM verification for context">🤖 LLM</span>' : ""}
          ${term.caseSensitive ? '<span class="case-sensitive-badge" title="Case-sensitive matching">Aa</span>' : ""}
        </div>
        <div class="vocab-variations">
          ${term.variations.length > 0 ? `Variations: ${term.variations.join(", ")}` : "No variations"}
        </div>
        <div class="vocab-suggested-episode">
          ${formatSuggestedEpisode(term.addedInEpisode)}
        </div>
        ${
          term.description
            ? `
          <div class="vocab-description">
            <strong>Context:</strong> ${escapeHtml(term.description)}
          </div>
        `
            : ""
        }
      </div>
      <div class="vocab-edit-panel" id="accepted-edit-panel-${index}" hidden>
        <div class="proposed-form">
          <div class="proposed-row">
            <label class="proposed-label">Canonical:</label>
            <input type="text" class="proposed-input" id="accepted-canonical-${index}"
                   value="${escapedCanonical}" />
          </div>
          <div class="proposed-row">
            <label class="proposed-label">Variations:</label>
            <input type="text" class="proposed-input" id="accepted-variations-${index}"
                   value="${escapeHtml(variationsString)}"
                   placeholder="Comma-separated variations" />
          </div>
          <div class="proposed-row">
            <label class="proposed-label">Category:</label>
            <select class="proposed-select" id="accepted-category-${index}">
              ${getCategoryOptions(term.category)}
            </select>
          </div>
          <div class="proposed-checkbox-row">
            <input type="checkbox" class="proposed-checkbox" id="accepted-llmVerify-${index}"
                   ${isLlmVerify ? "checked" : ""}
                   onchange="toggleAcceptedDescription(${index})" />
            <label class="proposed-checkbox-label" for="accepted-llmVerify-${index}">
              Use LLM context verification
            </label>
          </div>
          <div class="proposed-hint">
            For ambiguous names (like "David" or "John"), use AI to verify each match based on context
          </div>
          <div class="proposed-checkbox-row">
            <input type="checkbox" class="proposed-checkbox" id="accepted-caseSensitive-${index}"
                   ${term.caseSensitive ? "checked" : ""} />
            <label class="proposed-checkbox-label" for="accepted-caseSensitive-${index}">
              Case-sensitive matching
            </label>
          </div>
          <div class="proposed-hint">
            Match only exact case (e.g., "Lot" won't match "lot"). Use for words that are also common English words.
          </div>
          <div class="proposed-description-group" id="accepted-description-group-${index}">
            <div class="proposed-row">
              <label class="proposed-label">Description<span class="proposed-required" id="accepted-required-${index}">${isLlmVerify ? " *" : ""}</span>:</label>
              <textarea class="proposed-textarea" id="accepted-description-${index}" rows="3"
                        placeholder="e.g., King David of Israel, second king, son of Jesse, defeated Goliath"
              >${escapeHtml(description)}</textarea>
            </div>
            <div class="proposed-hint">
              Brief description to help AI identify correct matches (required when using LLM verification)
            </div>
          </div>
        </div>
      </div>
      <div class="vocab-card-actions">
        <span class="vocab-category-badge ${term.category}">
          ${formatCategoryName(term.category)}
        </span>
        <button
          class="vocab-reprocess-btn"
          onclick="toggleAcceptedEdit(${index})"
          id="accepted-edit-btn-${index}"
          title="Edit this tag">
          Edit
        </button>
        <button
          class="vocab-reprocess-btn"
          onclick="saveTag(${index})"
          id="accepted-save-btn-${index}"
          title="Save changes to this tag"
          hidden>
          Save
        </button>
        <button
          class="vocab-reprocess-btn"
          onclick="cancelTagEdit(${index})"
          id="accepted-cancel-btn-${index}"
          title="Hide tag editor"
          hidden>
          Cancel
        </button>
        <button
          class="vocab-reprocess-btn"
          onclick="reprocessSingleTag('${term.canonical.replaceAll("'", String.raw`\'`)}')"
          title="Reprocess all episodes for this tag${term.llmVerify ? " (uses LLM verification)" : ""}">
          🔄 Reprocess
        </button>
        <button
          class="vocab-delete-btn"
          onclick="deleteTag('${term.canonical.replaceAll("'", String.raw`\'`)}')"
          title="Delete this tag from vocabulary">
          🗑️ Delete
        </button>
      </div>
    </div>
  `;
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
    const response = await fetch(
      `${API_BASE_URL}/api/tag-vocabulary/tag-stats`,
    );
    if (!response.ok) {
      throw new Error("Failed to load analytics");
    }

    const stats: TagStats[] = await response.json();
    renderAnalytics(stats);
  } catch (error) {
    console.error("Error loading analytics:", error);
    const container = document.querySelector("#analytics-container");
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <div class="empty-state-text">Error loading analytics: ${error instanceof Error ? error.message : "Unknown error"}</div>
        </div>
      `;
    }
  }
}

// Render analytics dashboard
function renderAnalytics(stats: TagStats[]): void {
  const container = document.querySelector("#analytics-container");
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

  const sortedByEpisodeCount = [...stats].sort(
    (a, b) => b.episodeCount - a.episodeCount,
  );
  const topTagsByEpisodeCount = sortedByEpisodeCount.slice(0, 15);
  const maxEpisodeCount = Math.max(
    ...topTagsByEpisodeCount.map(t => t.episodeCount),
  );

  const sortedByMentions = [...stats].sort(
    (a, b) => b.totalMentions - a.totalMentions,
  );
  const topTagsByMentions = sortedByMentions.slice(0, 15);
  const maxMentions = Math.max(...topTagsByMentions.map(t => t.totalMentions));

  // Find underused vocabulary terms (in vocabulary but < 3 episodes)
  const underused = stats.filter(s => s.episodeCount < 3 && s.episodeCount > 0);

  container.innerHTML = `
    <div class="analytics-grid">
      <div class="analytics-card">
        <div class="analytics-title">Top 15 Tags by Episode Count</div>
        ${topTagsByEpisodeCount
          .map(tag => {
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
          .join("")}
      </div>

      <div class="analytics-card">
        <div class="analytics-title">Top 15 Tags by Total Mentions</div>
        ${topTagsByMentions
          .map(tag => {
            const percentage = (tag.totalMentions / maxMentions) * 100;
            return `
            <div class="chart-bar">
              <div class="chart-label">${tag.canonical}</div>
              <div class="chart-bar-container">
                <div class="chart-bar-fill" style="width: ${percentage}%"></div>
              </div>
              <div class="chart-value">${tag.totalMentions}</div>
            </div>
          `;
          })
          .join("")}
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
              tag => `
            <span class="underused-tag">${tag.canonical} (${tag.episodeCount})</span>
          `,
            )
            .join("")}
        </div>
      </div>
    `
        : ""
    }
  `;
}

// Migration management
async function startMigration(): Promise<void> {
  const button = document.querySelector("#migrate-btn") as HTMLButtonElement;

  if (!button) return;

  // Disable button
  button.disabled = true;
  button.textContent = "Starting...";

  await reprocessAllEpisodes({
    pollingConfig: {
      statusContainerSelector: "#migration-status",
      statusBadgeSelector: "#migration-status-badge",
      logsContainerSelector: "#migration-logs",
      onComplete: () => {
        button.disabled = false;
        button.textContent = "Run Migration";
        // Reload data
        setTimeout(() => {
          loadAnalytics();
        }, 1000);
      },
    },
  });

  // Re-enable button if validation/confirmation failed
  button.disabled = false;
  button.textContent = "Run Migration";
}

// Add tag form management
function toggleDescription(): void {
  // Description field is now always visible, just update required marker
  const llmVerify = (
    document.querySelector("#tag-llm-verify") as HTMLInputElement
  ).checked;
  const requiredMarker = document.querySelector("#description-required");

  if (requiredMarker) {
    requiredMarker.textContent = llmVerify ? "*" : "";
  }

  validateForm();
}

function validateForm(): void {
  const formData = getTagFormData();
  updateFormButtonState({
    buttonSelector: "#add-tag-btn",
    formData,
  });
}

// Scroll to top functionality
function scrollToTop(): void {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

// Show/hide go-to-top button based on scroll position
function handleScroll(): void {
  const goToTopButton = document.querySelector("#go-to-top");
  if (!goToTopButton) return;

  goToTopButton.classList.toggle("show", window.scrollY > 300);
}

// Add scroll event listener
window.addEventListener("scroll", handleScroll);

async function addTag(event: Event): Promise<void> {
  event.preventDefault();

  const button = document.querySelector("#add-tag-btn") as HTMLButtonElement;
  const successMessage = document.querySelector("#add-tag-success");
  const errorMessage = document.querySelector("#add-tag-error");

  if (!button || !successMessage || !errorMessage) return;

  // Hide previous messages
  successMessage.classList.remove("show");
  errorMessage.classList.remove("show");

  // Disable button
  button.disabled = true;
  button.textContent = "Adding...";

  await addTagWithPolling({
    pollingConfig: {
      statusContainerSelector: "#add-tag-status",
      statusBadgeSelector: "#add-tag-status-badge",
      logsContainerSelector: "#add-tag-logs",
      onComplete: () => {
        button.disabled = false;
        button.textContent = "Add Tag & Reprocess Episodes";
        successMessage.textContent = "Tag added successfully!";
        successMessage.classList.add("show");
        // Reload all data
        setTimeout(() => {
          loadVocabulary();
          loadAnalytics();
        }, 1000);
      },
    },
  });

  // Re-enable button if validation failed (addTagWithPolling returns early)
  button.disabled = false;
  button.textContent = "Add Tag & Reprocess Episodes";
}

// Reprocess a single tag across all episodes
async function reprocessSingleTag(canonical: string): Promise<void> {
  await reprocessTagShared({
    canonical,
    pollingConfig: {
      statusContainerSelector: "#migration-status",
      statusBadgeSelector: "#migration-status-badge",
      logsContainerSelector: "#migration-logs",
      onComplete: () => {
        // Reload all data
        setTimeout(() => {
          loadVocabulary();
          loadAnalytics();
        }, 1000);
      },
    },
  });
}

// Delete a tag from the vocabulary
async function deleteTag(canonical: string): Promise<void> {
  if (
    !confirm(
      `Delete tag "${canonical}" from vocabulary?\n\nThis will:\n• Remove it from the vocabulary file\n• Remove it from all episodes\n\nThis action cannot be undone.`,
    )
  ) {
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/tag-vocabulary/vocabulary/delete/${encodeURIComponent(canonical)}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete tag");
    }

    // Show success message
    const statusContainer = document.querySelector("#migration-status");
    const statusBadge = document.querySelector("#migration-status-badge");
    const logsContainer = document.querySelector("#migration-logs");

    if (statusContainer && statusBadge && logsContainer) {
      statusContainer.classList.add("show");
      statusBadge.textContent = "✓ Tag Deleted";
      statusBadge.className = "status-badge completed";
      logsContainer.textContent = `Successfully deleted "${canonical}" from vocabulary.`;

      // Auto-hide after 3 seconds
      setTimeout(() => {
        statusContainer.classList.remove("show");
      }, 3000);
    }

    // Reload all data
    setTimeout(() => {
      loadVocabulary();
      loadAnalytics();
    }, 500);
  } catch (error) {
    alert(
      `Error deleting tag: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// ============================================
// PROPOSED TAGS REVIEW
// ============================================

let proposedTags: TagDefinition[] = [];

// Load proposed tags from vocabulary
async function loadProposedTags(): Promise<void> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/tag-vocabulary/vocabulary`,
    );
    if (!response.ok) {
      throw new Error("Failed to load vocabulary");
    }

    const vocabulary: TagDefinition[] = await response.json();
    proposedTags = vocabulary
      .filter(tag => tag.status === "proposed")
      .sort(sortVocabularyNewestFirst);

    renderProposedTags();
  } catch (error) {
    console.error("Error loading proposed tags:", error);
    const container = document.querySelector("#proposed-container");
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <div class="empty-state-text">Error loading proposed tags: ${error instanceof Error ? error.message : "Unknown error"}</div>
        </div>
      `;
    }
  }
}

// Render proposed tags for review
function renderProposedTags(): void {
  const section = document.querySelector("#proposed-section") as HTMLElement;
  const container = document.querySelector(
    "#proposed-container",
  ) as HTMLElement;

  if (!section || !container) return;

  if (proposedTags.length === 0) {
    section.style.display = "none";
    return;
  }

  section.style.display = "block";

  const filteredTags =
    proposedCategory === "all"
      ? proposedTags
      : proposedTags.filter(tag => tag.category === proposedCategory);

  if (filteredTags.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <div class="empty-state-text">No proposed tags in this category</div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="proposed-grid">
      ${filteredTags.map(tag => renderProposedCard(tag, proposedTags.indexOf(tag))).join("")}
    </div>
  `;
}

// Render a single proposed tag card
function renderProposedCard(tag: TagDefinition, index: number): string {
  const variationsString = tag.variations ? tag.variations.join(", ") : "";
  const escapedCanonical = escapeHtml(tag.canonical);
  const isLlmVerify = tag.llmVerify === true;
  const description = tag.description || "";
  const duplicateOf = tag.duplicateOf;
  const duplicateNotice = duplicateOf
    ? `
        <div class="proposed-hint" style="margin-bottom: 12px; color: #92400e; font-weight: 600;">
          Matches existing accepted tag: <strong>${escapeHtml(duplicateOf)}</strong>
        </div>
      `
    : "";
  const actionButtons = duplicateOf
    ? `
        <button class="btn btn-approve" onclick="mergeTag(${index})">
          ⇄ Merge into ${escapeHtml(duplicateOf)}
        </button>
        <button class="btn btn-override" onclick="approveTag(${index})"
                title="Approve as a distinct tag despite the similarity warning">
          ✓ Approve Anyway
        </button>
        <button class="btn" onclick="dismissTag(${index})">
          Dismiss
        </button>
        <button class="btn btn-reject" onclick="rejectTag(${index})">
          ✗ Reject
        </button>
      `
    : `
        <button class="btn btn-approve" onclick="approveTag(${index})">
          ✓ Approve
        </button>
        <button class="btn" onclick="dismissTag(${index})">
          Dismiss
        </button>
        <button class="btn btn-reject" onclick="rejectTag(${index})">
          ✗ Reject
        </button>
      `;

  return `
    <div class="proposed-card" id="proposed-card-${index}" data-original="${escapedCanonical}" data-duplicate-of="${duplicateOf ? escapeHtml(duplicateOf) : ""}">
      <div class="proposed-header">
        <span class="proposed-status">Proposed</span>
        <span class="proposed-source-episode">${formatSuggestedEpisode(tag.addedInEpisode)}</span>
      </div>
      <div class="proposed-form">
        ${duplicateNotice}
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
                 ${isLlmVerify ? "checked" : ""}
                 onchange="toggleProposedDescription(${index})" />
          <label class="proposed-checkbox-label" for="proposed-llmVerify-${index}">
            Use LLM context verification
          </label>
        </div>
        <div class="proposed-hint">
          For ambiguous names (like "David" or "John"), use AI to verify each match based on context
        </div>
        <div class="proposed-checkbox-row">
          <input type="checkbox" class="proposed-checkbox" id="proposed-caseSensitive-${index}"
                 ${tag.caseSensitive ? "checked" : ""} />
          <label class="proposed-checkbox-label" for="proposed-caseSensitive-${index}">
            Case-sensitive matching
          </label>
        </div>
        <div class="proposed-hint">
          Match only exact case (e.g., "Lot" won't match "lot"). Use for words that are also common English words.
        </div>
        <div class="proposed-description-group" id="proposed-description-group-${index}">
          <div class="proposed-row">
            <label class="proposed-label">Description<span class="proposed-required" id="proposed-required-${index}">${isLlmVerify ? " *" : ""}</span>:</label>
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
        ${actionButtons}
      </div>
    </div>
  `;
}

// Toggle description field required marker for proposed tags
function toggleProposedDescription(index: number): void {
  const llmVerify = (
    document.querySelector(`#proposed-llmVerify-${index}`) as HTMLInputElement
  ).checked;
  const requiredMarker = document.querySelector(`#proposed-required-${index}`);

  if (!requiredMarker) return;

  requiredMarker.textContent = llmVerify ? " *" : "";
}

function toggleAcceptedDescription(index: number): void {
  const llmVerify = (
    document.querySelector(`#accepted-llmVerify-${index}`) as HTMLInputElement
  ).checked;
  const requiredMarker = document.querySelector(`#accepted-required-${index}`);

  if (!requiredMarker) return;

  requiredMarker.textContent = llmVerify ? " *" : "";
}

function toggleAcceptedEdit(index: number): void {
  const editPanel = document.querySelector(
    `#accepted-edit-panel-${index}`,
  ) as HTMLElement | null;
  const editButton = document.querySelector(
    `#accepted-edit-btn-${index}`,
  ) as HTMLButtonElement | null;
  const saveButton = document.querySelector(
    `#accepted-save-btn-${index}`,
  ) as HTMLButtonElement | null;
  const cancelButton = document.querySelector(
    `#accepted-cancel-btn-${index}`,
  ) as HTMLButtonElement | null;

  if (!editPanel || !editButton || !saveButton || !cancelButton) return;

  const isOpen = !editPanel.hidden;
  editPanel.hidden = isOpen;
  editButton.hidden = !isOpen;
  saveButton.hidden = isOpen;
  cancelButton.hidden = isOpen;
}

function cancelTagEdit(index: number): void {
  const editPanel = document.querySelector(
    `#accepted-edit-panel-${index}`,
  ) as HTMLElement | null;
  const editButton = document.querySelector(
    `#accepted-edit-btn-${index}`,
  ) as HTMLButtonElement | null;
  const saveButton = document.querySelector(
    `#accepted-save-btn-${index}`,
  ) as HTMLButtonElement | null;
  const cancelButton = document.querySelector(
    `#accepted-cancel-btn-${index}`,
  ) as HTMLButtonElement | null;

  if (!editPanel || !editButton || !saveButton || !cancelButton) return;

  editPanel.hidden = true;
  editButton.hidden = false;
  saveButton.hidden = true;
  cancelButton.hidden = true;
}

async function saveTag(index: number): Promise<void> {
  const card = document.querySelector(`#accepted-card-${index}`) as HTMLElement;
  if (!card) return;

  const originalCanonical = card.dataset.original;
  if (!originalCanonical) return;

  const newCanonical = (
    document.querySelector(`#accepted-canonical-${index}`) as HTMLInputElement
  ).value.trim();
  const variationsInput = (
    document.querySelector(`#accepted-variations-${index}`) as HTMLInputElement
  ).value.trim();
  const category = (
    document.querySelector(`#accepted-category-${index}`) as HTMLSelectElement
  ).value;
  const llmVerify = (
    document.querySelector(`#accepted-llmVerify-${index}`) as HTMLInputElement
  ).checked;
  const caseSensitive = (
    document.querySelector(
      `#accepted-caseSensitive-${index}`,
    ) as HTMLInputElement
  ).checked;
  const description = (
    document.querySelector(
      `#accepted-description-${index}`,
    ) as HTMLTextAreaElement
  ).value.trim();

  if (llmVerify && !description) {
    alert("Description is required when using LLM verification");
    return;
  }

  const variations = variationsInput
    ? variationsInput
        .split(",")
        .map(v => v.trim())
        .filter(v => v.length > 0)
    : [];

  card.classList.add("saving");

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/tag-vocabulary/vocabulary/update/${encodeURIComponent(originalCanonical)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canonical: newCanonical,
          variations,
          category,
          llmVerify,
          caseSensitive,
          description: description || undefined,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to save tag");
    }

    const statusContainer = document.querySelector("#migration-status");
    const statusBadge = document.querySelector("#migration-status-badge");
    const logsContainer = document.querySelector("#migration-logs");

    if (statusContainer && statusBadge && logsContainer) {
      statusContainer.classList.add("show");
      statusBadge.textContent = "✓ Tag Saved";
      statusBadge.className = "status-badge completed";
      logsContainer.textContent = `Saved changes to "${newCanonical}".`;

      setTimeout(() => {
        statusContainer.classList.remove("show");
      }, 3000);
    }

    cancelTagEdit(index);
    loadVocabulary();
    loadAnalytics();
  } catch (error) {
    alert(
      `Error saving tag: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    card.classList.remove("saving");
  }
}

// Approve a proposed tag
async function approveTag(index: number): Promise<void> {
  const card = document.querySelector(`#proposed-card-${index}`) as HTMLElement;
  if (!card) return;

  const originalCanonical = card.dataset.original;
  if (!originalCanonical) return;

  const duplicateOf = card.dataset.duplicateOf;
  if (
    duplicateOf &&
    !confirm(
      `"${originalCanonical}" was flagged as possibly duplicate of "${duplicateOf}".\n\nApprove anyway as a distinct tag?`,
    )
  ) {
    return;
  }

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
    alert("Description is required when using LLM verification");
    return;
  }

  // Parse variations
  const variations = variationsInput
    ? variationsInput
        .split(",")
        .map(v => v.trim())
        .filter(v => v.length > 0)
    : [];

  card.classList.add("saving");

  try {
    const updateBody = {
      canonical: newCanonical,
      variations,
      category,
      status: "accepted",
      llmVerify,
      caseSensitive,
      description: description || undefined,
    };

    // First update the tag with any changes
    const updateResponse = await fetch(
      `${API_BASE_URL}/api/tag-vocabulary/vocabulary/update/${encodeURIComponent(originalCanonical)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateBody),
      },
    );

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      throw new Error(error.error || "Failed to approve tag");
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
        statusContainerSelector: "#migration-status",
        statusBadgeSelector: "#migration-status-badge",
        logsContainerSelector: "#migration-logs",
        initialMessage: `Reprocessing episodes for "${newCanonical}"...`,
        completedMessage: "✓ Tag Approved & Episodes Reprocessed",
        onComplete: () => {
          // Reload all data
          setTimeout(() => {
            loadVocabulary();
            loadAnalytics();
          }, 1000);
        },
      });
    }
  } catch (error) {
    alert(
      `Error approving tag: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    card.classList.remove("saving");
  }
}

async function dismissTag(index: number): Promise<void> {
  const card = document.querySelector(`#proposed-card-${index}`) as HTMLElement;
  if (!card) return;

  const originalCanonical = card.dataset.original;
  if (!originalCanonical) return;

  if (
    !confirm(
      `Dismiss tag "${originalCanonical}"? This removes it from the review queue only and allows future rediscovery.`,
    )
  ) {
    return;
  }

  card.classList.add("saving");

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/tag-vocabulary/vocabulary/dismiss/${encodeURIComponent(originalCanonical)}`,
      {
        method: "POST",
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to dismiss tag");
    }

    proposedTags.splice(index, 1);
    renderProposedTags();
    loadVocabulary();
    loadAnalytics();
  } catch (error) {
    alert(
      `Error dismissing tag: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    card.classList.remove("saving");
  }
}

function showMergeStatus(message: string): void {
  const statusContainer = document.querySelector("#migration-status");
  const statusBadge = document.querySelector("#migration-status-badge");
  const logsContainer = document.querySelector("#migration-logs");

  if (!statusContainer || !statusBadge || !logsContainer) {
    return;
  }

  statusContainer.classList.add("show");
  statusBadge.textContent = "✓ Tag Merged";
  statusBadge.className = "status-badge completed";

  const existingText = logsContainer.textContent?.trim();
  logsContainer.textContent = existingText
    ? `${existingText}\n${message}`
    : message;
}

function showMergeResult(data: {
  message?: string;
  addedVariationCount?: number;
  mergeSource?: string;
  mergeTarget?: string;
}): void {
  if (data.message) {
    showMergeStatus(data.message);
    return;
  }

  const source = data.mergeSource ?? "proposal";
  const target = data.mergeTarget ?? "accepted tag";
  const count = data.addedVariationCount ?? 0;
  const fallbackMessage =
    count === 0
      ? `Merged "${source}" into "${target}". No new variations were added.`
      : `Merged "${source}" into "${target}" and added ${count} new variation${count === 1 ? "" : "s"}.`;
  showMergeStatus(fallbackMessage);
}

async function mergeTag(index: number): Promise<void> {
  const card = document.querySelector(`#proposed-card-${index}`) as HTMLElement;
  if (!card) return;

  const originalCanonical = card.dataset.original;
  const duplicateOf = card.dataset.duplicateOf;
  if (!originalCanonical || !duplicateOf) return;

  if (
    !confirm(
      `Merge proposed tag "${originalCanonical}" into accepted tag "${duplicateOf}"? Useful variations will be added to the accepted tag and the proposal will be removed.`,
    )
  ) {
    return;
  }

  card.classList.add("saving");

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/tag-vocabulary/vocabulary/merge`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposedCanonical: originalCanonical,
          acceptedCanonical: duplicateOf,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to merge tag");
    }

    proposedTags.splice(index, 1);
    renderProposedTags();
    loadVocabulary();
    loadAnalytics();
    showMergeResult(data);
  } catch (error) {
    alert(
      `Error merging tag: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    card.classList.remove("saving");
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
      `Reject tag "${originalCanonical}"? This blacklists it by marking it rejected and excluding it from future discovery. Use Dismiss instead to just remove it from the queue.`,
    )
  ) {
    return;
  }

  card.classList.add("saving");

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/tag-vocabulary/vocabulary/reject/${encodeURIComponent(originalCanonical)}`,
      {
        method: "POST",
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to reject tag");
    }

    // Remove from proposed list and re-render
    proposedTags.splice(index, 1);
    renderProposedTags();

    // Reload vocabulary
    loadVocabulary();
  } catch (error) {
    alert(
      `Error rejecting tag: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    card.classList.remove("saving");
  }
}

const proposedCategoryFilter = document.querySelector(
  "#proposed-category-filter",
) as HTMLSelectElement | null;
proposedCategoryFilter?.addEventListener("change", event => {
  proposedCategory = (event.target as HTMLSelectElement).value;
  renderProposedTags();
});

// Initialize on page load
(async () => {
  await loadCategories(); // Load categories first
  loadProposedTags();
  loadVocabulary();
  loadAnalytics();
})();

// Make functions available globally for onclick handlers
declare global {
  interface Window {
    filterVocabulary: typeof filterVocabulary;
    reprocessSingleTag: typeof reprocessSingleTag;
    deleteTag: typeof deleteTag;
    startMigration: typeof startMigration;
    toggleDescription: typeof toggleDescription;
    validateForm: typeof validateForm;
    addTag: typeof addTag;
    toggleProposedDescription: typeof toggleProposedDescription;
    toggleAcceptedDescription: typeof toggleAcceptedDescription;
    toggleAcceptedEdit: typeof toggleAcceptedEdit;
    cancelTagEdit: typeof cancelTagEdit;
    saveTag: typeof saveTag;
    approveTag: typeof approveTag;
    dismissTag: typeof dismissTag;
    mergeTag: typeof mergeTag;
    rejectTag: typeof rejectTag;
    scrollToTop: typeof scrollToTop;
  }
}

(globalThis as unknown as Window).filterVocabulary = filterVocabulary;
(globalThis as unknown as Window).reprocessSingleTag = reprocessSingleTag;
(globalThis as unknown as Window).deleteTag = deleteTag;
(globalThis as unknown as Window).startMigration = startMigration;
(globalThis as unknown as Window).toggleDescription = toggleDescription;
(globalThis as unknown as Window).validateForm = validateForm;
(globalThis as unknown as Window).addTag = addTag;
(globalThis as unknown as Window).toggleProposedDescription =
  toggleProposedDescription;
(globalThis as unknown as Window).toggleAcceptedDescription =
  toggleAcceptedDescription;
(globalThis as unknown as Window).toggleAcceptedEdit = toggleAcceptedEdit;
(globalThis as unknown as Window).cancelTagEdit = cancelTagEdit;
(globalThis as unknown as Window).saveTag = saveTag;
(globalThis as unknown as Window).approveTag = approveTag;
(globalThis as unknown as Window).dismissTag = dismissTag;
(globalThis as unknown as Window).mergeTag = mergeTag;
(globalThis as unknown as Window).rejectTag = rejectTag;
(globalThis as unknown as Window).scrollToTop = scrollToTop;
