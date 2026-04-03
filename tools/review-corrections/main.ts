import { API_BASE_URL, escapeHtml, showToast } from "../shared/utilities.js";

// Types
interface Candidate {
  key: string;
  original: string;
  corrected: string;
  confidence: number;
  category: string;
  status: string;
  episodeCount: number;
  totalOccurrences: number;
  episodes: string[];
  examples: string[];
  correctedExamples?: string[];
  timestamps?: string[];
  episodeIds?: string[];
}

// State
let allCandidates: Candidate[] = [];
const audioPlayer = document.querySelector("#audioPlayer") as HTMLAudioElement;

// Safe encoding for IDs (handles Unicode)
function safeEncode(str: string): string {
  return encodeURIComponent(str).replaceAll(
    /[!'()*]/g,
    c => `%${c.codePointAt(0)?.toString(16).toUpperCase()}`,
  );
}

// Parse timestamp string to seconds (supports HH:MM:SS or HH:MM:SS.mmm)
function parseTimestamp(timestamp: string): number {
  const parts = timestamp.split(":");
  const hours = Number.parseInt(parts[0] || "0", 10);
  const minutes = Number.parseInt(parts[1] || "0", 10);
  const secondsParts = (parts[2] || "0").split(".");
  const seconds = Number.parseInt(secondsParts[0] || "0", 10);
  const milliseconds = Number.parseInt(secondsParts[1] || "0", 10);
  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
}

// Jump to timestamp in audio (with auto-switching episode if needed)
let currentEpisodeId: string | null = null;

async function jumpToTimestamp(
  timestamp: string,
  episodeId: string,
): Promise<void> {
  const audioStatusElement = document.querySelector("#audioStatus");

  // Check if we need to switch audio files
  if (currentEpisodeId !== episodeId) {
    if (audioStatusElement) {
      audioStatusElement.textContent = `Loading audio for episode ${episodeId}...`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/audio/${episodeId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        audioPlayer.src = url;
        audioPlayer.style.display = "block";
        currentEpisodeId = episodeId;
        if (audioStatusElement) {
          audioStatusElement.textContent = `✅ Audio loaded for episode ${episodeId}`;
        }
      } else {
        alert(
          `Audio file not found for episode ${episodeId}. Please upload manually.`,
        );
        return;
      }
    } catch (error) {
      console.error("Failed to load audio:", error);
      alert("Failed to load audio. Please upload manually.");
      return;
    }
  }

  // Jump to timestamp
  const seconds = parseTimestamp(timestamp);
  audioPlayer.currentTime = seconds;
  audioPlayer.play();

  // Scroll audio player into view
  audioPlayer.scrollIntoView({ behavior: "smooth", block: "center" });
}

// Handle audio file upload (manual fallback)
const audioFileInput = document.querySelector("#audioFile");
if (audioFileInput) {
  audioFileInput.addEventListener("change", e => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      audioPlayer.src = url;
      audioPlayer.style.display = "block";
      const audioStatusElement = document.querySelector("#audioStatus");
      if (audioStatusElement) {
        audioStatusElement.textContent = `✅ Audio loaded: ${file.name}`;
      }
      console.log("Audio loaded:", file.name);
    }
  });
}

// Auto-load audio for a candidate
async function loadAudioForCandidate(candidate: Candidate): Promise<void> {
  const audioStatusElement = document.querySelector("#audioStatus");

  if (!candidate.episodes || candidate.episodes.length === 0) {
    if (audioStatusElement) {
      audioStatusElement.textContent = "No episodes linked to this candidate";
    }
    return;
  }

  const firstEpisodeId = candidate.episodes[0];
  if (!firstEpisodeId) return;

  if (audioStatusElement) {
    audioStatusElement.textContent = `Loading audio for episode ${firstEpisodeId}...`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/audio/${firstEpisodeId}`);
    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      audioPlayer.src = url;
      audioPlayer.style.display = "block";
      currentEpisodeId = firstEpisodeId; // Track which episode is loaded
      if (audioStatusElement) {
        audioStatusElement.textContent = `✅ Audio loaded for episode ${firstEpisodeId}`;
      }
    } else if (audioStatusElement) {
      audioStatusElement.textContent =
        "⚠️ Audio not found. Use manual upload below.";
    }
  } catch (error) {
    console.error("Failed to load audio:", error);
    if (audioStatusElement) {
      audioStatusElement.textContent =
        "⚠️ Failed to load audio. Use manual upload below.";
    }
  }
}

async function loadCandidates(): Promise<void> {
  try {
    // Load candidates from API
    const response = await fetch(
      `${API_BASE_URL}/api/review-corrections/candidates`,
    );
    const data = await response.json();

    // API returns array of candidates, create keys from original->corrected
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allCandidates = data.map((candidate: any) => ({
      key: `${candidate.original}→${candidate.corrected}`,
      ...candidate,
    }));

    // Show pending candidates with 20%+ confidence
    const MIN_CONFIDENCE = 20;
    const pending = allCandidates.filter(
      c => c.status === "pending" && c.confidence >= MIN_CONFIDENCE,
    );
    const reviewed = allCandidates.filter(c => c.status !== "pending");

    const pendingCountElement = document.querySelector("#pending-count");
    const reviewedCountElement = document.querySelector("#reviewed-count");
    const totalCountElement = document.querySelector("#total-count");

    if (pendingCountElement)
      pendingCountElement.textContent = String(pending.length);
    if (reviewedCountElement)
      reviewedCountElement.textContent = String(reviewed.length);
    if (totalCountElement)
      totalCountElement.textContent = String(allCandidates.length);

    const container = document.querySelector("#candidates");
    if (!container) return;

    const audioStatusElement = document.querySelector("#audioStatus");

    if (pending.length === 0) {
      if (audioStatusElement) {
        audioStatusElement.textContent = "No candidates to review";
      }
      container.innerHTML =
        '<div class="empty">' +
        '<div class="empty-icon">✨</div>' +
        "<h2>All Caught Up!</h2>" +
        "<p>No pending corrections to review. Process more episodes to find patterns.</p>" +
        "</div>";
      return;
    }

    // Sort by confidence (highest first)
    pending.sort((a, b) => b.confidence - a.confidence);

    // Auto-load audio for the first candidate
    if (pending.length > 0 && pending[0]) {
      await loadAudioForCandidate(pending[0]);
    } else if (audioStatusElement) {
      audioStatusElement.textContent = "No candidates to review";
    }

    container.innerHTML = pending
      .map(candidate => {
        let confidenceClass = "low";
        if (candidate.confidence >= 70) {
          confidenceClass = "high";
        } else if (candidate.confidence >= 50) {
          confidenceClass = "medium";
        }

        const categoryIcon: Record<string, string> = {
          "biblical-term": "📖",
          "proper-noun": "📛",
          spelling: "✏️",
          capitalization: "🔤",
        };

        const examplesHtml = candidate.examples
          .map((ex, index) => {
            const correctedEx =
              candidate.correctedExamples && candidate.correctedExamples[index];
            const timestamp =
              candidate.timestamps && candidate.timestamps[index];
            const episodeId =
              candidate.episodeIds && candidate.episodeIds[index];
            const timestampBadge = timestamp
              ? `<span onclick="jumpToTimestamp('${timestamp}', '${episodeId || candidate.episodes[0]}')" style="display: inline-block; background: #667eea; color: white; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; margin-left: 8px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#5568d3'" onmouseout="this.style.background='#667eea'" title="Click to jump to ${timestamp} (Episode: ${episodeId || candidate.episodes[0]})">🎧 [${timestamp}]</span>`
              : "";

            return (
              '<div class="example-pair">' +
              '<div class="example-label">Original (Transcribed):</div>' +
              `<div class="example raw">${escapeHtml(ex)}${timestampBadge}</div>` +
              (correctedEx
                ? '<div class="example-label" style="margin-top: 8px;">Corrected:</div>' +
                  `<div class="example corrected">${escapeHtml(correctedEx)}</div>`
                : "") +
              "</div>"
            );
          })
          .join("");

        return (
          `<div class="candidate" id="candidate-${safeEncode(candidate.key)}">` +
          '<div class="candidate-header">' +
          '<div class="correction">' +
          `<span class="original">${escapeHtml(candidate.original)}</span>` +
          '<span class="arrow">→</span>' +
          `<span class="corrected">${escapeHtml(candidate.corrected)}</span>` +
          "</div>" +
          '<div class="confidence">' +
          `<span class="confidence-badge ${confidenceClass}">` +
          `${candidate.confidence}%` +
          "</span>" +
          "</div>" +
          "</div>" +
          '<div class="meta">' +
          `<span class="category-badge ${candidate.category}">` +
          `${categoryIcon[candidate.category] || ""} ${candidate.category}` +
          "</span>" +
          '<span class="meta-item">' +
          `📊 ${candidate.episodeCount} episode(s)` +
          "</span>" +
          '<span class="meta-item">' +
          `🔢 ${candidate.totalOccurrences} occurrence(s)` +
          "</span>" +
          (candidate.episodes.length > 1
            ? `<span class="meta-item" style="cursor: pointer;" onclick='showEpisodeInfo("${candidate.key.replaceAll('"', "&quot;")}")' title="Click to see episodes">📺 Episodes: ${candidate.episodes.join(", ")}</span>`
            : `<span class="meta-item">📺 Episode: ${candidate.episodes[0] || ""}</span>`) +
          "</div>" +
          '<div class="examples">' +
          '<div class="examples-title">Context Examples</div>' +
          examplesHtml +
          "</div>" +
          `<div class="rule-code" id="rule-${safeEncode(candidate.key)}">` +
          `[[<span class="editable-value" contenteditable="true" data-field="original" data-key="${safeEncode(candidate.key)}">"${escapeHtml(candidate.original)}"</span>, <span class="editable-value" contenteditable="true" data-field="corrected" data-key="${safeEncode(candidate.key)}">"${escapeHtml(candidate.corrected)}"</span>],` +
          "</div>" +
          '<div class="edit-hint">💡 Click values above to edit before approving</div>' +
          '<div class="actions" style="margin-top: 20px">' +
          `<button class="approve" onclick='approve("${candidate.key.replaceAll('"', "&quot;")}")'>` +
          "✅ Approve" +
          "</button>" +
          `<button class="reject" onclick='reject("${candidate.key.replaceAll('"', "&quot;")}")'>` +
          "❌ Reject" +
          "</button>" +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  } catch (error) {
    console.error("Failed to load candidates:", error);
    const audioStatusElement = document.querySelector("#audioStatus");
    if (audioStatusElement) {
      audioStatusElement.textContent = "Error loading data";
    }
    const candidatesElement = document.querySelector("#candidates");
    if (candidatesElement) {
      candidatesElement.innerHTML =
        '<div class="empty">' +
        '<div class="empty-icon">⚠️</div>' +
        "<h2>Error Loading Candidates</h2>" +
        "<p>Make sure you're running the tools server with bun run tools</p>" +
        "</div>";
    }
  }
}

async function approve(key: string): Promise<void> {
  // Get edited values from the contenteditable spans
  const encodedKey = safeEncode(key);
  const originalElement = document.querySelector(
    `[data-field="original"][data-key="${encodedKey}"]`,
  ) as HTMLElement;
  const correctedElement = document.querySelector(
    `[data-field="corrected"][data-key="${encodedKey}"]`,
  ) as HTMLElement;

  // Extract the text content (remove quotes)
  const original = originalElement
    ? originalElement.textContent?.replaceAll(/^"|"$/g, "") ||
      key.split("→")[0] ||
      ""
    : key.split("→")[0] || "";
  const corrected = correctedElement
    ? correctedElement.textContent?.replaceAll(/^"|"$/g, "") ||
      key.split("→")[1] ||
      ""
    : key.split("→")[1] || "";

  if (!confirm(`Add [["${original}"], "${corrected}"],\nto corrections.ts?`))
    return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/review-corrections/approve/${encodeURIComponent(key)}?original=${encodeURIComponent(original)}&corrected=${encodeURIComponent(corrected)}`,
      {
        method: "POST",
      },
    );

    let data: { error?: string; warning?: string; wasAdded?: boolean } = {};
    try {
      data = (await response.json()) as typeof data;
    } catch (error) {
      console.error("Failed to parse approve response:", error);
    }

    if (response.ok) {
      removeCandidate(
        key,
        data.wasAdded === false
          ? "✅ Approved (already present in corrections.ts)"
          : "✅ Approved and added to corrections.ts!",
      );
      if (data.warning) {
        showToast(data.warning, "warning");
      }
    } else {
      alert(`Error: ${data.error || `Request failed (${response.status})`}`);
    }
  } catch (error) {
    console.error("Failed to approve correction:", error);
    alert("Network error — could not reach the API server on port 3001.");
  }
}

async function reject(key: string): Promise<void> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/review-corrections/reject/${encodeURIComponent(key)}`,
      {
        method: "POST",
      },
    );

    let data: { error?: string } = {};
    try {
      data = (await response.json()) as typeof data;
    } catch (error) {
      console.error("Failed to parse reject response:", error);
    }

    if (response.ok) {
      removeCandidate(key, "❌ Rejected");
    } else {
      alert(`Error: ${data.error || `Request failed (${response.status})`}`);
    }
  } catch (error) {
    console.error("Failed to reject correction:", error);
    alert("Network error — could not reach the API server on port 3001.");
  }
}

function removeCandidate(key: string, message: string): void {
  const candidateSelector = `#${CSS.escape(`candidate-${safeEncode(key)}`)}`;
  const candidateElement = document.querySelector(candidateSelector);
  if (!candidateElement) return;

  candidateElement.classList.add("removing");

  setTimeout(() => {
    candidateElement.remove();
    const remaining = document.querySelectorAll(".candidate").length;
    const pendingCountElement = document.querySelector("#pending-count");
    if (pendingCountElement) {
      pendingCountElement.textContent = String(remaining);
    }

    if (remaining === 0) {
      loadCandidates();
    } else {
      // Show success message briefly
      const toast = document.createElement("div");
      toast.style.cssText =
        "position: fixed;" +
        "top: 20px;" +
        "right: 20px;" +
        "background: #1f2937;" +
        "color: white;" +
        "padding: 16px 24px;" +
        "border-radius: 8px;" +
        "box-shadow: 0 4px 12px rgba(0,0,0,0.3);" +
        "z-index: 1000;";
      toast.textContent = message;
      document.body.append(toast);
      setTimeout(() => toast.remove(), 2000);
    }
  }, 300);
}

function showEpisodeInfo(key: string): void {
  const candidate = allCandidates.find(c => c.key === key);
  if (!candidate) return;
  alert(
    `This correction appears in:\n\n${candidate.episodes.map((ep, index) => `Episode ${index + 1}: ${ep}`).join("\n")}`,
  );
}

// Keyboard shortcuts
document.addEventListener("keydown", e => {
  const target = e.target as HTMLElement;
  // Ignore if typing in input
  if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
    return;
  }

  // Audio controls
  if (audioPlayer.src) {
    // Space = play/pause
    if (e.key === " ") {
      e.preventDefault();
      if (audioPlayer.paused) {
        audioPlayer.play();
      } else {
        audioPlayer.pause();
      }
      return;
    }
    // Left arrow = seek backward 5s
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 5);
      return;
    }
    // Right arrow = seek forward 5s
    if (e.key === "ArrowRight") {
      e.preventDefault();
      audioPlayer.currentTime = Math.min(
        audioPlayer.duration,
        audioPlayer.currentTime + 5,
      );
      return;
    }
  }

  // Review shortcuts
  const candidates = [
    ...document.querySelectorAll(".candidate:not(.removing)"),
  ];
  if (candidates.length === 0) return;

  const firstCandidate = candidates[0];
  const key = firstCandidate?.id.replace("candidate-", "");
  if (!key) return;

  const actualKey = decodeURIComponent(key);

  // 'a' key = approve first candidate
  if (e.key === "a" && !e.metaKey && !e.ctrlKey) {
    e.preventDefault();
    approve(actualKey);
  }
  // 'r' key = reject first candidate
  else if (e.key === "r" && !e.metaKey && !e.ctrlKey) {
    e.preventDefault();
    reject(actualKey);
  }
});

// Make functions available globally for onclick handlers
interface GlobalFunctions {
  jumpToTimestamp: typeof jumpToTimestamp;
  approve: typeof approve;
  reject: typeof reject;
  showEpisodeInfo: typeof showEpisodeInfo;
}

(globalThis as typeof globalThis & GlobalFunctions).jumpToTimestamp =
  jumpToTimestamp;
(globalThis as typeof globalThis & GlobalFunctions).approve = approve;
(globalThis as typeof globalThis & GlobalFunctions).reject = reject;
(globalThis as typeof globalThis & GlobalFunctions).showEpisodeInfo =
  showEpisodeInfo;

loadCandidates();
