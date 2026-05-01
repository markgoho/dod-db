import {
  addSegmentAtTime,
  deleteSegmentAtIndex,
  escapeHtml,
  fetchSegmentMetadata,
  formatTimestamp,
  getEpisode,
  getTotalDuration,
  getTranscript,
  getVideoIdFromUrl,
  markAllSegmentsVerified,
  parseTimestamp,
  parseTranscript,
  renderTimeline,
  saveSegments,
  secondsToTimestamp,
  showToast,
  timestampToSeconds,
  updateSegmentEnd,
  updateSegmentStart,
  updateSegmentType,
  type Episode,
  type EpisodeSegment,
  type SegmentMetadata,
  type TranscriptLine,
} from "../../shared/utilities.js";

const videoId = getVideoIdFromUrl();
let episode: Episode | undefined;
let segments: EpisodeSegment[] = [];
let metadata: SegmentMetadata = { labels: {}, colors: {}, types: [] };
let transcriptLines: TranscriptLine[] = [];
let audioElement: HTMLAudioElement | undefined;
let selectedSegmentIndex = -1;
let hasUnsavedChanges = false;
let episodeHasAudio = false;

async function init(): Promise<void> {
  const segmentsListElement = document.querySelector("#segments-list");

  if (!videoId) {
    if (segmentsListElement) {
      segmentsListElement.innerHTML =
        '<div class="empty-segments">Invalid episode URL</div>';
    }
    return;
  }

  try {
    // Load episode, metadata, and transcript in parallel
    const [episodeData, metadataData, transcriptText] = await Promise.all([
      getEpisode(videoId),
      fetchSegmentMetadata(),
      getTranscript(videoId),
    ]);

    episode = episodeData;
    metadata = metadataData || { labels: {}, colors: {}, types: [] };
    segments = [...(episode?.segments || [])];
    episodeHasAudio =
      (episodeData as { hasAudio?: boolean })?.hasAudio || false;

    if (!episode) {
      if (segmentsListElement) {
        segmentsListElement.innerHTML =
          '<div class="empty-segments">Episode not found</div>';
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

    const panelTitle = document.querySelector("#panel-title");
    if (panelTitle) {
      panelTitle.textContent = `Episode ${episode.episodeNumber || "?"}: Segments`;
    }
    document.title = `Segments - Episode ${episode.episodeNumber || "?"} - DoD Tools`;

    // Parse transcript
    if (transcriptText) {
      transcriptLines = parseTranscript(transcriptText);
      renderTranscript();
    }

    // Setup audio
    setupAudio();

    // Render segments
    renderTimelineView();
    renderSegmentsList();
  } catch (error) {
    console.error("Failed to load segments:", error);
    if (segmentsListElement) {
      segmentsListElement.innerHTML =
        '<div class="empty-segments">Failed to load segments</div>';
    }
  }
}

function setupAudio(): void {
  const audioElementNode = document.querySelector("#audio") as HTMLAudioElement;
  if (!audioElementNode) return;

  audioElement = audioElementNode;

  if (episodeHasAudio && videoId) {
    audioElement.src = `/api/audio/${videoId}`;
    audioElement.addEventListener("timeupdate", () => {
      const currentTimeElement = document.querySelector("#current-time");
      if (currentTimeElement && audioElement) {
        currentTimeElement.textContent = secondsToTimestamp(
          audioElement.currentTime,
        );
        updateActiveTranscriptLine(audioElement.currentTime);
      }
    });
    audioElement.addEventListener("loadedmetadata", () => {
      const totalTimeElement = document.querySelector("#total-time");
      if (totalTimeElement && audioElement) {
        totalTimeElement.textContent = secondsToTimestamp(
          audioElement.duration,
        );
      }
    });
  } else {
    const audioSection = document.querySelector("#audio-section");
    if (audioSection) {
      audioSection.innerHTML =
        '<div style="padding: 20px; text-align: center; color: var(--color-gray-500);">Audio not available</div>';
    }
  }
}

function renderTimelineView(): void {
  const timeline = document.querySelector("#timeline");
  if (!timeline) return;

  const totalDuration = getTotalDuration(segments);

  timeline.innerHTML = renderTimeline({
    segments,
    totalDuration,
    metadata,
    selectedIndex: selectedSegmentIndex,
    onSegmentClick: "selectSegment",
  });
}

function renderSegmentsList(): void {
  const container = document.querySelector("#segments-list");
  if (!container) return;

  if (segments.length === 0) {
    container.innerHTML =
      '<div class="empty-segments">No segments detected. Click "+ Add Segment" to create one.</div>';
    return;
  }

  container.innerHTML = segments
    .map((seg, i) => {
      const isActive = i === selectedSegmentIndex;

      return `
      <div class="segment-row ${isActive ? "active" : ""}" data-index="${i}">
        <select onchange="updateSegmentType(${i}, this.value)">
          ${metadata.types
            .map(
              type => `
            <option value="${type}" ${seg.type === type ? "selected" : ""}>
              ${metadata.labels[type] || type}
            </option>
          `,
            )
            .join("")}
        </select>
        <input type="text"
               value="${formatTimestamp(seg.startTimestamp)}"
               onchange="updateSegmentStart(${i}, this.value)"
               placeholder="Start">
        <input type="text"
               value="${seg.endTimestamp ? formatTimestamp(seg.endTimestamp) : ""}"
               onchange="updateSegmentEnd(${i}, this.value)"
               placeholder="End">
        <span class="segment-confidence ${seg.confidence}">${seg.confidence}</span>
        <div class="segment-actions">
          <button class="btn-icon" onclick="playSegment(${i})" title="Play">Play</button>
          <button class="btn-icon danger" onclick="deleteSegment(${i})" title="Delete">X</button>
        </div>
      </div>
    `;
    })
    .join("");
}

function renderTranscript(): void {
  const container = document.querySelector("#transcript-content");
  if (!container) return;

  container.innerHTML = transcriptLines
    .map(
      (line, i) => `
    <div class="transcript-line" id="tline-${i}" onclick="jumpToTime(${line.seconds})">
      <span class="timestamp">[${formatTimestamp(line.timestamp)}]</span>
      <span class="speaker">${escapeHtml(line.speaker)}:</span>
      <span class="text">${escapeHtml(line.text)}</span>
    </div>
  `,
    )
    .join("");
}

function updateActiveTranscriptLine(currentTime: number): void {
  // Remove previous active
  for (const element of document.querySelectorAll(".transcript-line.active")) {
    element.classList.remove("active");
  }

  // Find current line
  for (let i = transcriptLines.length - 1; i >= 0; i--) {
    const line = transcriptLines[i];
    if (line && line.seconds <= currentTime) {
      const element = document.querySelector(`#tline-${i}`);
      if (element) {
        element.classList.add("active");
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      break;
    }
  }
}

(globalThis as typeof globalThis & Window).selectSegment = function (
  index: number,
): void {
  selectedSegmentIndex = index;
  const seg = segments[index];
  if (seg && audioElement) {
    audioElement.currentTime = timestampToSeconds(seg.startTimestamp);
    audioElement.play().catch(() => {
      // Autoplay may be blocked
    });
  }
  renderTimelineView();
  renderSegmentsList();
};

(globalThis as typeof globalThis & Window).playSegment = function (
  index: number,
): void {
  const selectSegmentFunction = (
    globalThis as { selectSegment?: (i: number) => void }
  ).selectSegment;
  selectSegmentFunction?.(index);
};

(globalThis as typeof globalThis & Window).jumpToTime = function (
  seconds: number,
): void {
  if (audioElement) {
    audioElement.currentTime = seconds;
    audioElement.play().catch(() => {
      // Autoplay may be blocked
    });
  }
};

(globalThis as typeof globalThis & Window).updateSegmentType = function (
  index: number,
  type: string,
): void {
  segments = updateSegmentType({ segments, index, type });
  hasUnsavedChanges = true;
  renderTimelineView();
};

(globalThis as typeof globalThis & Window).updateSegmentStart = function (
  index: number,
  value: string,
): void {
  const parsed = parseTimestamp(value);
  if (parsed) {
    segments = updateSegmentStart({ segments, index, timestamp: parsed });
    hasUnsavedChanges = true;
    renderTimelineView();
  }
};

(globalThis as typeof globalThis & Window).updateSegmentEnd = function (
  index: number,
  value: string,
): void {
  const parsed = value ? parseTimestamp(value) : undefined;
  segments = updateSegmentEnd({ segments, index, timestamp: parsed });
  hasUnsavedChanges = true;
  renderTimelineView();
};

(globalThis as typeof globalThis & Window).deleteSegment = function (
  index: number,
): void {
  if (confirm("Delete this segment?")) {
    segments = deleteSegmentAtIndex({ segments, index });
    selectedSegmentIndex = -1;
    hasUnsavedChanges = true;
    renderTimelineView();
    renderSegmentsList();
  }
};

(globalThis as typeof globalThis & Window).addSegment = function (): void {
  const currentTime = audioElement ? audioElement.currentTime : 0;
  const audioDuration = audioElement?.duration;
  const defaultType = metadata.types[0] || "main-content";

  const result = addSegmentAtTime({
    segments,
    currentTime,
    audioDuration,
    defaultType,
  });

  segments = result.segments;
  selectedSegmentIndex = result.insertIndex;
  hasUnsavedChanges = true;
  renderTimelineView();
  renderSegmentsList();
  showToast("Segment added", "success");
};

(globalThis as typeof globalThis & Window).markAllVerified = function (): void {
  segments = markAllSegmentsVerified(segments);
  hasUnsavedChanges = true;
  renderSegmentsList();
  showToast("All segments marked as verified", "success");
};

(globalThis as typeof globalThis & Window).saveSegments =
  async function (): Promise<void> {
    if (!videoId) return;

    const success = await saveSegments({ videoId, segments });
    if (success) {
      hasUnsavedChanges = false;
    }
  };

// Warn before leaving with unsaved changes
window.addEventListener("beforeunload", event => {
  if (hasUnsavedChanges) {
    event.preventDefault();
    event.returnValue = "";
  }
});

// Declare global functions for onclick handlers
declare global {
  interface Window {
    selectSegment: (index: number) => void;
    playSegment: (index: number) => void;
    jumpToTime: (seconds: number) => void;
    updateSegmentType: (index: number, type: string) => void;
    updateSegmentStart: (index: number, value: string) => void;
    updateSegmentEnd: (index: number, value: string) => void;
    deleteSegment: (index: number) => void;
    addSegment: () => void;
    markAllVerified: () => void;
    saveSegments: () => Promise<void>;
  }
}

init();
