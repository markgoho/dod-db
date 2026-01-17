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
