/**
 * API data fetching utilities for DoD Tools
 */

import { API_BASE_URL } from "./constants.js";
import { timestampToSeconds } from "./timestamp.js";
import type {
  Episode,
  EpisodeSegment,
  EpisodeWithAudio,
  ParsedLine,
  SegmentMetadata,
} from "./types.js";
import { showToast } from "./ui.js";

// Fetch single episode data
export async function getEpisode(
  videoId: string,
): Promise<EpisodeWithAudio | undefined> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/episode/${videoId}`);
    if (!response.ok) return undefined;
    return await response.json();
  } catch {
    return undefined;
  }
}

// Fetch all episodes
export async function getAllEpisodes(): Promise<Episode[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tag-vocabulary/episodes`);
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

// Fetch transcript for an episode
export async function getTranscript(
  videoId: string,
): Promise<string | undefined> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/segment-verification/transcript/${videoId}`,
    );
    if (!response.ok) return undefined;
    const data = await response.json();
    return data.transcript || undefined;
  } catch {
    return undefined;
  }
}

// Parse transcript content into structured lines
export function parseTranscript(content: string): ParsedLine[] {
  const lines: ParsedLine[] = [];
  const regex = /^\[(\d{2}:\d{2}:\d{2}\.\d{3})\]\s+([^:]+):\s*(.*)$/;

  let index = 0;
  for (const line of content.split("\n")) {
    const match = regex.exec(line.trim());
    if (match && match[1] && match[2] && match[3]) {
      lines.push({
        index,
        timestamp: `[${match[1]}]`,
        speaker: match[2].trim(),
        text: match[3].trim(),
        seconds: timestampToSeconds(`[${match[1]}]`),
      });
      index++;
    }
  }

  return lines;
}

// Fetch segment metadata (types, colors, labels)
export async function fetchSegmentMetadata(): Promise<
  SegmentMetadata | undefined
> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/segment-verification/segment-metadata`,
    );
    if (!response.ok) return undefined;
    return await response.json();
  } catch {
    return undefined;
  }
}

// Save segments for an episode
export async function saveSegments({
  videoId,
  segments,
}: {
  videoId: string;
  segments: EpisodeSegment[];
}): Promise<boolean> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/segment-verification/segments/${videoId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segments }),
      },
    );

    if (response.ok) {
      showToast("Segments saved successfully", "success");
      return true;
    }

    const error = await response.json();
    showToast(error.error || "Failed to save segments", "error");
    return false;
  } catch (error) {
    console.error("Error saving segments:", error);
    showToast("Failed to save segments", "error");
    return false;
  }
}

export async function addScriptureBook({
  videoId,
  bookName,
}: {
  videoId: string;
  bookName: string;
}): Promise<{
  success: boolean;
  wasManual?: boolean;
}> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/episode/${videoId}/scriptures/add`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookName }),
      },
    );

    const result = (await response.json()) as {
      success?: boolean;
      alreadyPresent?: boolean;
      error?: string;
      book?: string;
      wasManual?: boolean;
    };

    if (response.ok && result.success) {
      showToast(
        result.wasManual
          ? `Added ${result.book || bookName} as a manual override`
          : `Added ${result.book || bookName}`,
        "success",
      );
      return { success: true, wasManual: result.wasManual };
    }

    if (response.ok && result.alreadyPresent) {
      showToast(
        `${result.book || bookName} is already on this episode`,
        "info",
      );
      return { success: false };
    }

    showToast(result.error || "Failed to add scripture book", "error");
    return { success: false };
  } catch (error) {
    console.error("Error adding scripture book:", error);
    showToast("Failed to add scripture book", "error");
    return { success: false };
  }
}

export async function rescanEpisodeScriptures({
  videoId,
}: {
  videoId: string;
}): Promise<string | undefined> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/episode/${videoId}/scriptures/rescan`,
      {
        method: "POST",
      },
    );

    const result = (await response.json()) as {
      success?: boolean;
      jobId?: string;
      error?: string;
    };

    if (!response.ok || !result.jobId) {
      showToast(result.error || "Failed to start scripture rescan", "error");
      return undefined;
    }

    showToast("Started scripture rescan", "success");
    return result.jobId;
  } catch (error) {
    console.error("Error rescanning scripture references:", error);
    showToast("Failed to start scripture rescan", "error");
    return undefined;
  }
}
