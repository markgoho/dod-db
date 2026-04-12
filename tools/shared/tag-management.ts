/**
 * Tag management utilities for DoD Tools
 * Shared logic for adding and reprocessing tags
 */

import { API_BASE_URL } from "./constants.js";
import { clearTagForm, getTagFormData, validateTagForm } from "./form-utils.js";
import { startJobPolling } from "./job-polling.js";
import { showToast } from "./ui.js";

// Options for job polling UI
export interface JobPollingUIConfig {
  statusContainerSelector: string;
  statusBadgeSelector: string;
  logsContainerSelector: string;
  onComplete?: () => void;
}

// Start job polling with UI updates
export function startJobPollingWithUI({
  jobId,
  statusContainerSelector,
  statusBadgeSelector,
  logsContainerSelector,
  initialMessage,
  completedMessage,
  onComplete,
}: {
  jobId: string;
  initialMessage: string;
  completedMessage: string;
} & JobPollingUIConfig): (() => void) | undefined {
  const statusContainer = document.querySelector(statusContainerSelector);
  const statusBadge = document.querySelector(
    statusBadgeSelector,
  ) as HTMLElement;
  const logsContainer = document.querySelector(
    logsContainerSelector,
  ) as HTMLElement;

  if (!statusContainer || !statusBadge || !logsContainer) {
    console.error("Job polling UI elements not found");
    return undefined;
  }

  statusContainer.classList.add("show");
  statusBadge.innerHTML = `<span class="status-badge running">${initialMessage}</span>`;
  logsContainer.textContent = "Starting...\n";

  return startJobPolling({
    jobId,
    statusBadge,
    logsContainer,
    completedMessage,
    onComplete,
    onFailed: () => {
      // Error already shown in status badge
    },
  });
}

// Add a new tag with validation and job polling
export async function addTagWithPolling({
  formSelectors,
  pollingConfig,
  onComplete,
}: {
  formSelectors?: {
    canonicalSelector?: string;
    variationsSelector?: string;
    categorySelector?: string;
    llmVerifySelector?: string;
    caseSensitiveSelector?: string;
    descriptionSelector?: string;
    formSelector?: string;
    descriptionGroupSelector?: string;
  };
  pollingConfig: JobPollingUIConfig;
  onComplete?: () => void;
}): Promise<void> {
  // Get form data
  const formData = getTagFormData(formSelectors || {});

  // Validate
  const validation = validateTagForm(formData);
  if (!validation.valid) {
    showToast(validation.error || "Invalid form data", "error");
    return;
  }

  try {
    // Submit to API
    const response = await fetch(
      `${API_BASE_URL}/api/tag-vocabulary/vocabulary/add`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canonical: formData.canonical,
          variations: formData.variations,
          category: formData.category,
          llmVerify: formData.llmVerify,
          caseSensitive: formData.caseSensitive,
          ...(formData.llmVerify &&
            formData.description && { description: formData.description }),
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to add tag");
    }

    // Show success
    showToast(`Tag "${formData.canonical}" added`, "success");

    // Start job polling
    startJobPollingWithUI({
      jobId: data.jobId,
      initialMessage: "Reprocessing episodes...",
      completedMessage: "✓ Tag Added & Episodes Reprocessed",
      onComplete,
      ...pollingConfig,
    });

    // Clear form
    clearTagForm({
      formSelector: formSelectors?.formSelector,
      descriptionGroupSelector: formSelectors?.descriptionGroupSelector,
    });
  } catch (error) {
    console.error("Add tag error:", error);
    showToast(
      error instanceof Error ? error.message : "Failed to add tag",
      "error",
    );
  }
}

// Reprocess a single tag across all episodes
export async function reprocessTag({
  canonical,
  pollingConfig,
  onComplete,
  skipConfirmation = false,
}: {
  canonical: string;
  pollingConfig: JobPollingUIConfig;
  onComplete?: () => void;
  skipConfirmation?: boolean;
}): Promise<void> {
  if (
    !skipConfirmation &&
    !confirm(
      `Reprocess all episodes for tag "${canonical}"?\n\nThis will update tag counts across all episodes.`,
    )
  ) {
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/tag-vocabulary/reprocess-tag/${encodeURIComponent(canonical)}`,
      {
        method: "POST",
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to start reprocessing");
    }

    const data = await response.json();

    showToast(`Reprocessing "${canonical}"`, "success");

    // Start job polling
    startJobPollingWithUI({
      jobId: data.jobId,
      initialMessage: `Reprocessing "${canonical}"...`,
      completedMessage: "✓ Tag Reprocessed",
      onComplete,
      ...pollingConfig,
    });
  } catch (error) {
    showToast(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      "error",
    );
  }
}

// Reprocess tags for a single episode
export async function reprocessEpisodeTags({
  videoId,
  pollingConfig,
  onComplete,
  skipConfirmation = false,
}: {
  videoId: string;
  pollingConfig: JobPollingUIConfig;
  onComplete?: () => void;
  skipConfirmation?: boolean;
}): Promise<void> {
  if (
    !skipConfirmation &&
    !confirm("Reprocess tags for this episode using the current vocabulary?")
  ) {
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/episode/${encodeURIComponent(videoId)}/tags/reprocess`,
      {
        method: "POST",
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to start episode reprocessing");
    }

    const data = await response.json();

    showToast("Reprocessing episode tags...", "success");

    startJobPollingWithUI({
      jobId: data.jobId,
      initialMessage: "Reprocessing this episode...",
      completedMessage: "✓ Episode Reprocessed",
      onComplete,
      ...pollingConfig,
    });
  } catch (error) {
    showToast(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      "error",
    );
  }
}

// Reprocess all episodes (migrate)
export async function reprocessAllEpisodes({
  pollingConfig,
  onComplete,
  skipConfirmation = false,
}: {
  pollingConfig: JobPollingUIConfig;
  onComplete?: () => void;
  skipConfirmation?: boolean;
}): Promise<void> {
  if (
    !skipConfirmation &&
    !confirm(
      "This will reprocess all episodes with the current vocabulary. Continue?",
    )
  ) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/tag-vocabulary/migrate`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to start migration");
    }

    const data = await response.json();

    showToast("Reprocessing all episodes...", "success");

    // Start job polling
    startJobPollingWithUI({
      jobId: data.jobId,
      initialMessage: "Reprocessing all episodes...",
      completedMessage: "✓ All Episodes Reprocessed",
      onComplete,
      ...pollingConfig,
    });
  } catch (error) {
    showToast(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      "error",
    );
  }
}
