/**
 * Job polling utilities for DoD Tools
 */

import { API_BASE_URL } from "./constants.js";
import type { JobStatus, PollJobOptions } from "./types.js";

// Poll job status once
export async function pollJobStatus({
  jobId,
  statusBadge,
  logsContainer,
  completedMessage,
  failedMessage = "✗ Failed",
  onComplete,
  onFailed,
}: { jobId: string } & PollJobOptions): Promise<JobStatus | undefined> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/tag-vocabulary/migrate-status/${jobId}`,
    );
    if (!response.ok) {
      throw new Error("Failed to get job status");
    }

    const job: JobStatus = await response.json();

    // Update logs
    logsContainer.textContent = job.logs || "Waiting for output...";
    logsContainer.scrollTop = logsContainer.scrollHeight;

    // Update status badge based on job status
    if (job.status === "completed") {
      statusBadge.innerHTML = `<span class="status-badge completed">${completedMessage}</span>`;
      onComplete?.();
    } else if (job.status === "failed") {
      statusBadge.innerHTML = `<span class="status-badge failed">${failedMessage}</span>`;
      onFailed?.();
    } else {
      statusBadge.innerHTML =
        '<span class="status-badge running">Running...</span>';
    }

    return job;
  } catch (error) {
    console.error("Error polling job status:", error);
    return undefined;
  }
}

// Start polling job status at intervals
export function startJobPolling({
  jobId,
  interval = 1000,
  ...options
}: { jobId: string; interval?: number } & PollJobOptions): () => void {
  const pollInterval = setInterval(async () => {
    const job = await pollJobStatus({ jobId, ...options });
    if (job && (job.status === "completed" || job.status === "failed")) {
      clearInterval(pollInterval);
    }
  }, interval);

  // Return cleanup function
  return () => clearInterval(pollInterval);
}
