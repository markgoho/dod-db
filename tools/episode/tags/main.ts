import {
  addTagWithPolling,
  API_BASE_URL,
  escapeHtml,
  fetchEpisodeProposedTags,
  fetchVocabulary,
  getEpisode,
  getTagCategory,
  getTagVocabEntry,
  getVideoIdFromUrl,
  reprocessEpisodeTags,
  reprocessTag as reprocessTagShared,
  startJobPollingWithUI,
  toggleDescriptionField,
  type Episode,
  type TagVocabularyEntry,
} from "../../shared/utilities.js";

const videoId = getVideoIdFromUrl();
let episode: Episode | undefined;
let vocabulary: TagVocabularyEntry[] = [];
let proposedTags: TagVocabularyEntry[] = [];
let currentCategory = "all";
let selectedTag: string | undefined;

async function init(): Promise<void> {
  const tagsContainer = document.querySelector("#tags-container");

  if (!videoId) {
    if (tagsContainer) {
      tagsContainer.innerHTML =
        '<div class="empty-state"><div class="empty-state-text">Invalid episode URL</div></div>';
    }
    return;
  }

  try {
    const [episodeData, vocabData, proposedTagData] = await Promise.all([
      getEpisode(videoId),
      fetchVocabulary(),
      fetchEpisodeProposedTags(videoId),
    ]);

    episode = episodeData;
    vocabulary = vocabData;
    proposedTags = proposedTagData;

    if (!episode) {
      if (tagsContainer) {
        tagsContainer.innerHTML =
          '<div class="empty-state"><div class="empty-state-text">Episode not found</div></div>';
      }
      return;
    }

    // Update breadcrumb
    const breadcrumbEpisode = document.querySelector(
      "#breadcrumb-episode",
    ) as HTMLAnchorElement;
    if (breadcrumbEpisode) {
      breadcrumbEpisode.href = `/episode/index?id=${videoId}`;
      breadcrumbEpisode.textContent = `Episode ${episode.episodeNumber || "?"}`;
    }

    const pageTitle = document.querySelector("#page-title");
    if (pageTitle) {
      pageTitle.textContent = `Episode ${episode.episodeNumber || "?"}: Tags`;
    }
    document.title = `Tags - Episode ${episode.episodeNumber || "?"} - DoD Tools`;

    updateStats();
    renderProposedTags();
    renderTags();
    setupEventListeners();
  } catch (error) {
    console.error("Failed to load tags:", error);
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
  const categories = new Set(
    tags.map(t => getTagCategory({ tagName: t.tag, vocabulary })),
  );

  const totalTagsElement = document.querySelector("#total-tags");
  const totalMentionsElement = document.querySelector("#total-mentions");
  const categoriesCountElement = document.querySelector("#categories-count");

  if (totalTagsElement) totalTagsElement.textContent = String(tags.length);
  if (totalMentionsElement)
    totalMentionsElement.textContent = String(totalMentions);
  if (categoriesCountElement)
    categoriesCountElement.textContent = String(categories.size);
}

function setupEventListeners(): void {
  // Category tabs
  for (const tab of document.querySelectorAll(".category-tab")) {
    tab.addEventListener("click", () => {
      for (const t of document.querySelectorAll(".category-tab")) {
        t.classList.remove("active");
      }
      tab.classList.add("active");
      const tabElement = tab as HTMLElement;
      currentCategory = tabElement.dataset.category || "all";
      renderTags();
    });
  }

  // Add tag form
  const addTagForm = document.querySelector("#add-tag-form");
  addTagForm?.addEventListener("submit", addTag);
}

function getCategoryOptions(selectedCategory: string): string {
  const categories = [
    "character",
    "person",
    "place",
    "people",
    "literature",
    "theology",
    "scholarship",
    "religion",
    "event",
    "other",
  ];

  return categories
    .map(
      category =>
        `<option value="${category}" ${category === selectedCategory ? "selected" : ""}>${escapeHtml(category)}</option>`,
    )
    .join("");
}

function renderProposedTags(): void {
  const section = document.querySelector("#proposed-tags-section");
  const container = document.querySelector("#proposed-tags-container");
  if (!section || !container) return;

  if (proposedTags.length === 0) {
    section.setAttribute("hidden", "");
    container.innerHTML = "";
    return;
  }

  section.removeAttribute("hidden");
  container.innerHTML = proposedTags
    .map((tag, index) => {
      const category = tag.category || "other";
      const variationsString = tag.variations.join(", ");
      const description = tag.description || "";
      const isLlmVerify = tag.llmVerify === true;
      const duplicateHint = tag.duplicateOf
        ? `
            <div class="proposed-tag-duplicate">
              Possible duplicate of <strong>${escapeHtml(tag.duplicateOf)}</strong>
            </div>
          `
        : "";
      const mergeButton = tag.duplicateOf
        ? `<button class="btn btn-secondary" onclick="mergeEpisodeProposedTag(${index})">Merge into ${escapeHtml(tag.duplicateOf)}</button>`
        : "";
      const approveLabel = tag.duplicateOf ? "Approve Anyway" : "Approve";

      return `
        <div class="proposed-tag-card" id="episode-proposed-card-${index}" data-original="${escapeHtml(tag.canonical)}" data-duplicate-of="${tag.duplicateOf ? escapeHtml(tag.duplicateOf) : ""}">
          <div class="proposed-tag-meta">
            <div>
              <div class="proposed-tag-name">${escapeHtml(tag.canonical)}</div>
              <div class="proposed-tag-category">${escapeHtml(category)}</div>
            </div>
            <div class="proposed-tag-status">Proposed</div>
          </div>
          ${duplicateHint}
          <div class="proposed-tag-form-row">
            <label class="proposed-tag-field-label" for="episode-proposed-canonical-${index}">Canonical</label>
            <input id="episode-proposed-canonical-${index}" class="form-input" value="${escapeHtml(tag.canonical)}" />
          </div>
          <div class="proposed-tag-form-row">
            <label class="proposed-tag-field-label" for="episode-proposed-variations-${index}">Variations</label>
            <input id="episode-proposed-variations-${index}" class="form-input" value="${escapeHtml(variationsString)}" placeholder="Comma-separated variations" />
          </div>
          <div class="proposed-tag-form-row">
            <label class="proposed-tag-field-label" for="episode-proposed-category-${index}">Category</label>
            <select id="episode-proposed-category-${index}" class="form-select">${getCategoryOptions(category)}</select>
          </div>
          <div class="checkbox-group proposed-tag-checkbox-row">
            <input type="checkbox" id="episode-proposed-llmVerify-${index}" ${isLlmVerify ? "checked" : ""} onchange="toggleEpisodeProposedDescription(${index})" />
            <label for="episode-proposed-llmVerify-${index}">Use LLM verification</label>
          </div>
          <div class="form-hint proposed-tag-hint">For ambiguous names like David or John.</div>
          <div class="checkbox-group proposed-tag-checkbox-row">
            <input type="checkbox" id="episode-proposed-caseSensitive-${index}" ${tag.caseSensitive ? "checked" : ""} />
            <label for="episode-proposed-caseSensitive-${index}">Case-sensitive matching</label>
          </div>
          <div class="form-hint proposed-tag-hint">Use when capitalization distinguishes the tag from common words.</div>
          <div class="proposed-tag-detail">
            <label class="proposed-tag-field-label" for="episode-proposed-description-${index}">Description<span id="episode-proposed-required-${index}">${isLlmVerify ? " *" : ""}</span></label>
            <textarea id="episode-proposed-description-${index}" class="form-input proposed-tag-textarea" rows="3" placeholder="Brief description for AI context">${escapeHtml(description)}</textarea>
          </div>
          <div class="proposed-tag-actions">
            <button class="btn btn-primary" onclick="approveEpisodeProposedTag(${index})">${approveLabel}</button>
            ${mergeButton}
            <button class="btn btn-secondary" onclick="dismissEpisodeProposedTag(${index})">Dismiss</button>
            <button class="btn btn-secondary" onclick="rejectEpisodeProposedTag(${index})">Reject</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderTags(): void {
  if (!episode) return;
  const container = document.querySelector("#tags-container");
  if (!container) return;

  let tags = episode.tags || [];

  if (currentCategory !== "all") {
    tags = tags.filter(
      t => getTagCategory({ tagName: t.tag, vocabulary }) === currentCategory,
    );
  }

  if (tags.length === 0) {
    container.innerHTML =
      '<div class="empty-state" style="grid-column: 1 / -1;"><div class="empty-state-text">No tags in this category</div></div>';
    return;
  }

  // Sort by mentions
  tags = [...tags].toSorted((a, b) => b.mentions - a.mentions);

  container.innerHTML = tags
    .map(tag => {
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
    .join("");
}

(globalThis as typeof globalThis & Window).showTagDetail = function (
  tagName: string,
): void {
  if (!episode) return;
  const tag = episode.tags?.find(t => t.tag === tagName);
  const vocabEntry = getTagVocabEntry({ tagName, vocabulary });
  selectedTag = tagName;

  const modalTitle = document.querySelector("#modal-title");
  if (modalTitle) modalTitle.textContent = tagName;

  let html = `
    <div class="detail-row">
      <div class="detail-label">Mentions in Episode</div>
      <div class="detail-value">${tag?.mentions || 0}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Category</div>
      <div class="detail-value">${vocabEntry?.category || "Unknown"}</div>
    </div>
  `;

  if (vocabEntry && vocabEntry.variations && vocabEntry.variations.length > 0) {
    html += `
      <div class="detail-row">
        <div class="detail-label">Variations</div>
        <div class="variations-list">
          ${vocabEntry.variations.map(v => `<span class="variation-badge">${escapeHtml(v)}</span>`).join("")}
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

  const modalContent = document.querySelector("#modal-content");
  const tagModalElement = document.querySelector("#tag-modal");

  if (modalContent) modalContent.innerHTML = html;
  tagModalElement?.classList.add("show");
};

(globalThis as typeof globalThis & Window).toggleDescription =
  function (): void {
    toggleDescriptionField();
  };

async function addTag(event: Event): Promise<void> {
  event.preventDefault();

  await addTagWithPolling({
    pollingConfig: {
      statusContainerSelector: "#add-tag-status",
      statusBadgeSelector: "#add-tag-status-badge",
      logsContainerSelector: "#add-tag-logs",
      onComplete: async () => {
        await refreshEpisode();
      },
    },
  });
}

(globalThis as typeof globalThis & Window).reprocessTag =
  async function (): Promise<void> {
    if (!selectedTag) return;

    // Close modal before starting reprocessing
    const closeModalFunction = (globalThis as { closeModal?: () => void })
      .closeModal;
    closeModalFunction?.();

    await reprocessTagShared({
      canonical: selectedTag,
      pollingConfig: {
        statusContainerSelector: "#reprocess-status",
        statusBadgeSelector: "#reprocess-status-badge",
        logsContainerSelector: "#reprocess-logs",
        onComplete: async () => {
          await refreshEpisode();
        },
      },
    });
  };

(globalThis as typeof globalThis & Window).reprocessEpisode =
  async function (): Promise<void> {
    if (!videoId) return;

    await reprocessEpisodeTags({
      videoId,
      pollingConfig: {
        statusContainerSelector: "#reprocess-status",
        statusBadgeSelector: "#reprocess-status-badge",
        logsContainerSelector: "#reprocess-logs",
        onComplete: async () => {
          await refreshEpisode();
        },
      },
    });
  };

function getEpisodeProposedTagFormData(index: number): {
  originalCanonical: string;
  duplicateOf?: string;
  canonical: string;
  variations: string[];
  category: string;
  llmVerify: boolean;
  caseSensitive: boolean;
  description?: string;
} | null {
  const card = document.querySelector(
    `#episode-proposed-card-${index}`,
  ) as HTMLElement | null;
  if (!card) return null;

  const originalCanonical = card.dataset.original;
  if (!originalCanonical) return null;

  const canonical = (
    document.querySelector(
      `#episode-proposed-canonical-${index}`,
    ) as HTMLInputElement
  ).value.trim();
  const variationsInput = (
    document.querySelector(
      `#episode-proposed-variations-${index}`,
    ) as HTMLInputElement
  ).value.trim();
  const category = (
    document.querySelector(
      `#episode-proposed-category-${index}`,
    ) as HTMLSelectElement
  ).value;
  const llmVerify = (
    document.querySelector(
      `#episode-proposed-llmVerify-${index}`,
    ) as HTMLInputElement
  ).checked;
  const caseSensitive = (
    document.querySelector(
      `#episode-proposed-caseSensitive-${index}`,
    ) as HTMLInputElement
  ).checked;
  const description = (
    document.querySelector(
      `#episode-proposed-description-${index}`,
    ) as HTMLTextAreaElement
  ).value.trim();

  if (llmVerify && !description) {
    alert("Description is required when using LLM verification");
    return null;
  }

  return {
    originalCanonical,
    duplicateOf: card.dataset.duplicateOf || undefined,
    canonical,
    variations: variationsInput
      ? variationsInput
          .split(",")
          .map(variation => variation.trim())
          .filter(variation => variation.length > 0)
      : [],
    category,
    llmVerify,
    caseSensitive,
    description: description || undefined,
  };
}

function showEpisodeProposalStatus(label: string, message: string): void {
  const statusContainer = document.querySelector("#reprocess-status");
  const statusBadge = document.querySelector("#reprocess-status-badge");
  const logsContainer = document.querySelector("#reprocess-logs");

  if (!statusContainer || !statusBadge || !logsContainer) {
    return;
  }

  statusContainer.classList.add("show");
  statusBadge.textContent = label;
  statusBadge.className = "status-badge completed";
  logsContainer.textContent = message;
}

(globalThis as typeof globalThis & Window).toggleEpisodeProposedDescription =
  function (index: number): void {
    const llmVerify = (
      document.querySelector(
        `#episode-proposed-llmVerify-${index}`,
      ) as HTMLInputElement
    ).checked;
    const requiredMarker = document.querySelector(
      `#episode-proposed-required-${index}`,
    );

    if (!requiredMarker) return;
    requiredMarker.textContent = llmVerify ? " *" : "";
  };

(globalThis as typeof globalThis & Window).approveEpisodeProposedTag =
  async function (index: number): Promise<void> {
    const data = getEpisodeProposedTagFormData(index);
    if (!data) return;

    if (
      data.duplicateOf &&
      !confirm(
        `"${data.originalCanonical}" was flagged as possibly duplicate of "${data.duplicateOf}".\n\nApprove anyway as a distinct tag?`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/tag-vocabulary/vocabulary/update/${encodeURIComponent(data.originalCanonical)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            canonical: data.canonical,
            variations: data.variations,
            category: data.category,
            status: "accepted",
            llmVerify: data.llmVerify,
            caseSensitive: data.caseSensitive,
            description: data.description,
          }),
        },
      );

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || "Failed to approve tag");
      }

      await refreshEpisode();
      vocabulary = await fetchVocabulary();
      showEpisodeProposalStatus(
        "✓ Tag Approved",
        `Approved "${data.canonical}".`,
      );

      if (responseData.jobId) {
        startJobPollingWithUI({
          jobId: responseData.jobId,
          statusContainerSelector: "#reprocess-status",
          statusBadgeSelector: "#reprocess-status-badge",
          logsContainerSelector: "#reprocess-logs",
          initialMessage: `Reprocessing episodes for "${data.canonical}"...`,
          completedMessage: "✓ Tag Approved & Episodes Reprocessed",
          onComplete: async () => {
            await refreshEpisode();
            vocabulary = await fetchVocabulary();
          },
        });
      }
    } catch (error) {
      alert(
        `Error approving tag: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

(globalThis as typeof globalThis & Window).dismissEpisodeProposedTag =
  async function (index: number): Promise<void> {
    const data = getEpisodeProposedTagFormData(index);
    if (!data) return;

    if (
      !confirm(
        `Dismiss tag "${data.originalCanonical}"? This removes it from the review queue only and allows future rediscovery.`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/tag-vocabulary/vocabulary/dismiss/${encodeURIComponent(data.originalCanonical)}`,
        {
          method: "POST",
        },
      );
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || "Failed to dismiss tag");
      }

      await refreshEpisode();
      vocabulary = await fetchVocabulary();
      showEpisodeProposalStatus(
        "✓ Tag Dismissed",
        `Dismissed "${data.originalCanonical}" from the review queue.`,
      );
    } catch (error) {
      alert(
        `Error dismissing tag: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

(globalThis as typeof globalThis & Window).rejectEpisodeProposedTag =
  async function (index: number): Promise<void> {
    const data = getEpisodeProposedTagFormData(index);
    if (!data) return;

    if (
      !confirm(
        `Reject tag "${data.originalCanonical}"? This blacklists it from future discovery. Use Dismiss instead to just remove it from the queue.`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/tag-vocabulary/vocabulary/reject/${encodeURIComponent(data.originalCanonical)}`,
        {
          method: "POST",
        },
      );
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || "Failed to reject tag");
      }

      await refreshEpisode();
      vocabulary = await fetchVocabulary();
      showEpisodeProposalStatus(
        "✓ Tag Rejected",
        `Rejected "${data.originalCanonical}".`,
      );
    } catch (error) {
      alert(
        `Error rejecting tag: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

(globalThis as typeof globalThis & Window).mergeEpisodeProposedTag =
  async function (index: number): Promise<void> {
    const data = getEpisodeProposedTagFormData(index);
    if (!data?.duplicateOf) return;

    if (
      !confirm(
        `Merge proposed tag "${data.originalCanonical}" into accepted tag "${data.duplicateOf}"? Useful variations will be added and the proposal will be removed.`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/tag-vocabulary/vocabulary/merge`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            proposedCanonical: data.originalCanonical,
            acceptedCanonical: data.duplicateOf,
          }),
        },
      );
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || "Failed to merge tag");
      }

      await refreshEpisode();
      vocabulary = await fetchVocabulary();
      showEpisodeProposalStatus(
        "✓ Tag Merged",
        responseData.message ||
          `Merged "${data.originalCanonical}" into "${data.duplicateOf}".`,
      );
    } catch (error) {
      alert(
        `Error merging tag: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

async function refreshEpisode(): Promise<void> {
  if (!videoId) return;
  try {
    const [episodeData, proposedTagData] = await Promise.all([
      getEpisode(videoId),
      fetchEpisodeProposedTags(videoId),
    ]);
    episode = episodeData;
    proposedTags = proposedTagData;
    updateStats();
    renderProposedTags();
    renderTags();
  } catch (error) {
    console.error("Refresh error:", error);
  }
}

(globalThis as typeof globalThis & Window).closeModal = function (): void {
  const modal = document.querySelector("#tag-modal");
  modal?.classList.remove("show");
  selectedTag = undefined;
};

// Close modal on escape
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    const closeModalFunction = (globalThis as { closeModal?: () => void })
      .closeModal;
    closeModalFunction?.();
  }
});

// Close modal on backdrop click
const tagModal = document.querySelector("#tag-modal");
tagModal?.addEventListener("click", event => {
  if ((event.target as HTMLElement).id === "tag-modal") {
    const closeModalFunction = (globalThis as { closeModal?: () => void })
      .closeModal;
    closeModalFunction?.();
  }
});

// Declare global functions for onclick handlers
declare global {
  interface Window {
    showTagDetail: (tagName: string) => void;
    closeModal: () => void;
    toggleDescription: () => void;
    toggleEpisodeProposedDescription: (index: number) => void;
    approveEpisodeProposedTag: (index: number) => Promise<void>;
    dismissEpisodeProposedTag: (index: number) => Promise<void>;
    rejectEpisodeProposedTag: (index: number) => Promise<void>;
    mergeEpisodeProposedTag: (index: number) => Promise<void>;
    reprocessTag: () => Promise<void>;
    reprocessEpisode: () => Promise<void>;
  }
}

init();
