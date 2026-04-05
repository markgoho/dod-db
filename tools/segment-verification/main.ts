import {
  API_BASE_URL,
  applyPendingSeek,
  createAudioPlayer,
  createInitialPlayerState,
  createYouTubePlayer,
  destroyYouTubePlayer,
  escapeHtml,
  formatSecondsToTimestamp,
  formatTimestamp,
  getYouTubeCurrentTime,
  getYouTubeDuration,
  parseTimestamp,
  secondsToTimestamp,
  seekToTimestamp,
  seekYouTube,
  showToast,
  startTimePolling,
  timestampToSeconds,
  type EpisodeSegment,
  type EpisodeWithAudio,
  type SegmentMetadata,
  type TranscriptLine,
  type YouTubePlayerState,
} from "../shared/utilities.js";

const AUDIO_TIME_POLL_MS = 250;

function isFiniteDuration(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

// State
let episodes: EpisodeWithAudio[] = [];
let metadata: SegmentMetadata = { labels: {}, colors: {}, types: [] };
let selectedEpisode: EpisodeWithAudio | undefined;
let selectedSegmentIndex: number | undefined;
let playerState: YouTubePlayerState = createInitialPlayerState();
let audioPlayer: HTMLAudioElement | undefined;
let audioTimePollingInterval: ReturnType<typeof setInterval> | undefined;
let transcriptLines: TranscriptLine[] = [];

// Load data on page load
async function init(): Promise<void> {
  await Promise.all([loadMetadata(), loadEpisodes(), loadStats()]);
  renderEpisodeList();
}

async function loadMetadata(): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/segment-verification/segment-metadata`,
  );
  metadata = await response.json();
}

async function loadEpisodes(): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/segment-verification/episodes`,
  );
  episodes = await response.json();
}

function stopAudioTimePolling(): void {
  if (audioTimePollingInterval !== undefined) {
    clearInterval(audioTimePollingInterval);
    audioTimePollingInterval = undefined;
  }
}

function cleanupMediaState(): void {
  stopAudioTimePolling();
  if (audioPlayer) {
    audioPlayer.pause();
    audioPlayer = undefined;
  }
  destroyYouTubePlayer(playerState);
  playerState = createInitialPlayerState();
}

function getCurrentMediaTime(): number {
  if (audioPlayer) {
    return audioPlayer.currentTime;
  }

  return getYouTubeCurrentTime(playerState);
}

function getCurrentMediaDuration(): number {
  if (audioPlayer) {
    return isFiniteDuration(audioPlayer.duration) ? audioPlayer.duration : 0;
  }

  return getYouTubeDuration(playerState);
}

function seekMedia(seconds: number, autoPlay: boolean): void {
  if (audioPlayer) {
    audioPlayer.currentTime = seconds;
    if (autoPlay) {
      audioPlayer.play().catch(() => {
        // Autoplay may be blocked until the user interacts.
      });
    }
    return;
  }

  seekYouTube(playerState, seconds, autoPlay);
}

function seekMediaToTimestamp(timestamp: string): void {
  if (audioPlayer) {
    seekToTimestamp(audioPlayer, timestamp);
    return;
  }

  const seconds = timestampToSeconds(timestamp);
  seekYouTube(playerState, seconds, true);
}

function initializeAudioPlayer(pendingSeek?: number): void {
  if (!selectedEpisode) return;

  audioPlayer = createAudioPlayer(
    "youtube-player-wrapper",
    selectedEpisode.videoId,
    {
      onTimeUpdate: currentTime => {
        updateTimeDisplay(currentTime);
      },
    },
  );

  if (!audioPlayer) {
    showToast("Failed to load audio player", "error");
    return;
  }

  const totalTimeElement = document.querySelector("#total-time");
  const updateDuration = (): void => {
    if (!totalTimeElement) return;
    totalTimeElement.textContent = isFiniteDuration(audioPlayer?.duration ?? 0)
      ? secondsToTimestamp(audioPlayer?.duration ?? 0)
      : "--:--:--";
  };

  audioPlayer.addEventListener("loadedmetadata", () => {
    updateDuration();
    if (pendingSeek !== undefined && audioPlayer) {
      audioPlayer.currentTime = pendingSeek;
    }
  });
  audioPlayer.addEventListener("durationchange", updateDuration);

  stopAudioTimePolling();
  audioTimePollingInterval = setInterval(() => {
    const currentAudioPlayer = audioPlayer;
    if (currentAudioPlayer && !currentAudioPlayer.paused) {
      updateTimeDisplay(currentAudioPlayer.currentTime);
    }
  }, AUDIO_TIME_POLL_MS);

  updateDuration();
  if (pendingSeek === undefined) {
    updateTimeDisplay(audioPlayer.currentTime);
  }
}

async function initializePlayer(): Promise<void> {
  const pendingSeek = playerState.pendingSeek;
  cleanupMediaState();

  if (!selectedEpisode) return;

  if (selectedEpisode.hasAudio) {
    initializeAudioPlayer(pendingSeek);
    return;
  }

  playerState.pendingSeek = pendingSeek;
  await initializeYouTubePlayer();
}

async function loadStats(): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/segment-verification/stats`,
  );
  const stats = await response.json();
  const totalEpisodesElement = document.querySelector("#total-episodes");
  const totalSegmentsElement = document.querySelector("#total-segments");
  const verifiedCountElement = document.querySelector("#verified-count");

  if (totalEpisodesElement)
    totalEpisodesElement.textContent = stats.totalEpisodes;
  if (totalSegmentsElement)
    totalSegmentsElement.textContent = stats.autoDetected + stats.verified;
  if (verifiedCountElement) verifiedCountElement.textContent = stats.verified;
}

function renderEpisodeList(): void {
  const filterElement = document.querySelector(
    "#status-filter",
  ) as HTMLSelectElement | null;
  const listElement = document.querySelector("#episode-list");
  if (!filterElement || !listElement) return;

  const filter = filterElement.value;

  const filtered = episodes.filter(episode => {
    if (filter === "all") return true;

    const segmentCount = episode.segments?.length || 0;
    const allVerified =
      segmentCount > 0 &&
      (episode.segments?.every(s => s.confidence === "verified") ?? false);

    if (filter === "verified") return allVerified;
    if (filter === "needs-review") return !allVerified;
    return true;
  });

  listElement.innerHTML = filtered
    .map(episode => {
      const segmentCount = episode.segments?.length || 0;
      const verifiedCount =
        episode.segments?.filter(s => s.confidence === "verified").length || 0;
      const allVerified = segmentCount > 0 && verifiedCount === segmentCount;
      const isActive = selectedEpisode?.videoId === episode.videoId;

      return `
        <div class="episode-item ${isActive ? "active" : ""}" onclick="selectEpisode('${episode.videoId}')">
          <div class="ep-number">Episode ${episode.episodeNumber || "?"}</div>
          <div class="ep-title">${escapeHtml(episode.title)}</div>
          <div class="ep-segments">
            ${segmentCount} segments
            <span class="status-badge ${allVerified ? "verified" : "auto"}">
              ${allVerified ? "Verified" : "Auto"}
            </span>
          </div>
          <div class="segment-dots">
            ${(episode.segments || [])
              .map(
                s =>
                  `<div class="segment-dot" style="background: ${metadata.colors[s.type] || "#666"}"></div>`,
              )
              .join("")}
          </div>
        </div>
      `;
    })
    .join("");
}

async function selectEpisode(videoId: string): Promise<void> {
  selectedEpisode = episodes.find(episode => episode.videoId === videoId);
  selectedSegmentIndex = undefined;

  if (!selectedEpisode) return;

  renderEpisodeList();
  renderContent();
  await initializePlayer();
}

function renderContent(): void {
  const content = document.querySelector("#content");
  if (!content) return;

  if (!selectedEpisode) {
    content.innerHTML = `
      <div class="no-selection">
        <p>Select an episode to view and edit segments</p>
      </div>
    `;
    return;
  }

  const segments = selectedEpisode.segments || [];
  const totalDuration = getTotalDuration(segments);

  content.innerHTML = `
    <div class="episode-header">
      <h2>Episode ${selectedEpisode.episodeNumber}: ${escapeHtml(selectedEpisode.title)}</h2>
    </div>

    <div class="timeline-container">
      <div class="timeline-label">Segment Timeline</div>
      <div class="timeline" id="timeline">
        ${segments
          .map((seg, index) => {
            const start = timestampToSeconds(seg.startTimestamp);
            const end = seg.endTimestamp
              ? timestampToSeconds(seg.endTimestamp)
              : totalDuration;
            const left = (start / totalDuration) * 100;
            const width = ((end - start) / totalDuration) * 100;
            const isActive = index === selectedSegmentIndex;
            return `
            <div class="timeline-segment ${isActive ? "active" : ""}"
                 style="left: ${left}%; width: ${width}%; background: ${metadata.colors[seg.type] || "#666"}"
                 onclick="selectSegment(${index})"
                 title="${metadata.labels[seg.type] || seg.type}">
              ${metadata.labels[seg.type] || seg.type}
            </div>
          `;
          })
          .join("")}
      </div>
    </div>

    <div class="video-container">
      <div id="youtube-player-wrapper"></div>
      <div class="video-time">
        <span id="current-time">00:00:00</span>
        <span id="total-time">--:--:--</span>
      </div>
    </div>

    <div class="segments-editor">
      <h3>Segments</h3>
      <div class="segment-list" id="segment-list">
        ${segments
          .map(
            (seg, index) => `
          <div class="segment-row ${index === selectedSegmentIndex ? "active" : ""}" data-index="${index}">
            <select onchange="updateSegmentType(${index}, this.value)">
              ${metadata.types
                .map(
                  type => `
                <option value="${type}" ${seg.type === type ? "selected" : ""}>
                  ${metadata.labels[type]}
                </option>
              `,
                )
                .join("")}
            </select>
            <input type="text" value="${formatTimestamp(seg.startTimestamp)}"
                   onchange="updateSegmentStart(${index}, this.value)"
                   placeholder="Start">
            <input type="text" value="${seg.endTimestamp ? formatTimestamp(seg.endTimestamp) : ""}"
                   onchange="updateSegmentEnd(${index}, this.value)"
                   placeholder="End">
            <div>
              <span class="status-badge ${seg.confidence}">${seg.confidence}</span>
            </div>
            <button class="btn btn-small btn-secondary" onclick="playSegment(${index})">Play</button>
            <button class="btn btn-small btn-danger" onclick="deleteSegment(${index})">X</button>
          </div>
        `,
          )
          .join("")}
      </div>
      <div class="actions">
        <button class="btn btn-secondary" onclick="addSegment()">+ Add Segment</button>
        <button class="btn btn-primary" onclick="markAllVerified()">Mark All Verified</button>
        <button class="btn btn-primary" onclick="saveSegments()">Save Changes</button>
      </div>
    </div>
  `;

  // Load transcript
  loadTranscript();
}

async function initializeYouTubePlayer(): Promise<void> {
  if (!selectedEpisode) return;

  const videoId = selectedEpisode.videoId;
  playerState.videoId = videoId;

  try {
    playerState.player = await createYouTubePlayer({
      containerId: "youtube-player-wrapper",
      videoId,
      onReady: (): void => {
        playerState.isReady = true;
        playerState.duration = playerState.player?.getDuration() ?? 0;

        // Update total time display
        const totalTimeElement = document.querySelector("#total-time");
        if (totalTimeElement) {
          totalTimeElement.textContent = secondsToTimestamp(
            playerState.duration,
          );
        }

        // Apply any pending seek
        applyPendingSeek(playerState, false);

        // Start time polling for transcript highlighting
        startTimePolling(playerState, (currentTime, duration) => {
          updateTimeDisplay(currentTime);
          playerState.duration = duration;
        });
      },
      onError: (event): void => {
        console.error("YouTube player error:", event.data);
        showToast("Error loading video", "error");
      },
    });
  } catch (error) {
    console.error("Failed to create YouTube player:", error);
    showToast("Failed to load video player", "error");
  }
}

async function loadTranscript(): Promise<void> {
  if (!selectedEpisode) return;

  const response = await fetch(
    `${API_BASE_URL}/api/segment-verification/transcript/${selectedEpisode.videoId}`,
  );
  const data = await response.json();

  const transcriptLinesElement = document.querySelector("#transcript-lines");
  if (!transcriptLinesElement) return;

  if (data.error) {
    transcriptLinesElement.innerHTML = `<p style="color: #888">${data.error}</p>`;
    transcriptLines = [];
    return;
  }

  const lines = data.transcript.split("\n").filter((l: string) => l.trim());
  const linePattern =
    /^\s*\[(\d{2}:\d{2}:\d{2}(?:\.\d{3})?)\]\s*([^:]+):\s*(.*)$/;

  // Parse and store transcript lines with timestamps
  transcriptLines = [];
  for (const [index, line] of lines.entries()) {
    const match = linePattern.exec(line);
    if (match) {
      transcriptLines.push({
        index,
        timestamp: match[1] || "",
        seconds: timestampToSeconds(`[${match[1] || "00:00:00"}]`),
        speaker: match[2] || "",
        text: match[3] || "",
      });
    }
  }

  // Render transcript (show all lines - virtualization could be added later if needed)
  transcriptLinesElement.innerHTML = transcriptLines
    .map(
      (line, index) => `
      <div class="transcript-line" id="tline-${index}" onclick="jumpToTime('${line.timestamp}')">
        <span class="timestamp">[${line.timestamp}]</span>
        <span class="speaker">${escapeHtml(line.speaker)}:</span>
        <span class="text">${escapeHtml(line.text)}</span>
      </div>
    `,
    )
    .join("");
}

function selectSegment(index: number): void {
  selectedSegmentIndex = index;
  // Jump video to segment start and play
  const seg = selectedEpisode?.segments?.[index];
  if (seg) {
    const seconds = timestampToSeconds(seg.startTimestamp);
    seekMedia(seconds, true);
  }
  // Update visual selection without re-rendering (preserves player state)
  updateSegmentSelection();
}

function updateSegmentSelection(): void {
  // Update timeline segment highlighting
  for (const [index, element] of document
    .querySelectorAll(".timeline-segment")
    .entries()) {
    element.classList.toggle("active", index === selectedSegmentIndex);
  }
  // Update segment row highlighting
  for (const [index, element] of document
    .querySelectorAll(".segment-row")
    .entries()) {
    element.classList.toggle("active", index === selectedSegmentIndex);
  }
}

function playSegment(index: number): void {
  const seg = selectedEpisode?.segments?.[index];
  if (!seg) {
    console.error("playSegment failed: segment not found", { index });
    return;
  }

  const seconds = timestampToSeconds(seg.startTimestamp);
  console.log("Playing segment", index, "at", seconds, "seconds");
  seekMedia(seconds, true);
  selectedSegmentIndex = index;
  updateSegmentSelection();
}

function deleteSegment(index: number): void {
  if (!selectedEpisode?.segments) return;
  if (!confirm("Delete this segment?")) return;

  const segments = selectedEpisode.segments;
  const deleted = segments[index];
  if (!deleted) return;

  const previous = segments[index - 1];
  const next = segments[index + 1];

  // Extend previous segment to fill the gap
  if (previous) {
    // Previous segment extends to deleted segment's end (or next segment's start)
    previous.endTimestamp =
      deleted.endTimestamp || (next ? next.startTimestamp : null);
    previous.confidence = "auto"; // Mark as needing review
  } else if (next) {
    // No previous segment - extend next segment backward
    next.startTimestamp = deleted.startTimestamp;
    next.confidence = "auto";
  }

  segments.splice(index, 1);
  selectedSegmentIndex = undefined;
  renderContent();
  // Re-initialize player after content render
  void initializePlayer();
}

function jumpToTime(timestamp: string): void {
  console.log("Jumping to timestamp:", timestamp);
  seekMediaToTimestamp(`[${timestamp}]`);
}

function updateTimeDisplay(currentTime: number): void {
  const currentTimeElement = document.querySelector("#current-time");
  if (currentTimeElement) {
    currentTimeElement.textContent = secondsToTimestamp(currentTime);
  }

  // Auto-highlight and scroll transcript
  if (transcriptLines.length === 0) return;

  // Find the most recent line whose timestamp has passed
  for (let index = transcriptLines.length - 1; index >= 0; index--) {
    const line = transcriptLines[index];
    if (line && line.seconds <= currentTime) {
      const lineId = `tline-${index}`;
      const currentActive = document.querySelector(".transcript-line.active");

      // Only update if different line
      if (!currentActive || currentActive.id !== lineId) {
        for (const element of document.querySelectorAll(".transcript-line")) {
          element.classList.remove("active");
        }
        const newActive = document.querySelector(`#${lineId}`);
        if (newActive) {
          newActive.classList.add("active");
          // Scroll within the transcript panel
          const container = document.querySelector("#transcript-lines");
          if (container) {
            const containerRect = container.getBoundingClientRect();
            const lineRect = newActive.getBoundingClientRect();
            const scrollTop =
              container.scrollTop +
              lineRect.top -
              containerRect.top -
              containerRect.height / 2;
            container.scrollTo({ top: scrollTop, behavior: "smooth" });
          }
        }
      }
      break;
    }
  }
}

function updateSegmentType(index: number, type: string): void {
  if (!selectedEpisode?.segments) return;
  const segment = selectedEpisode.segments[index];
  if (!segment) return;
  segment.type = type;
  segment.confidence = "auto";
  // Re-render timeline to show new color
  updateTimeline();
}

function updateTimeline(): void {
  const segments = selectedEpisode?.segments || [];
  const totalDuration = getTotalDuration(segments);
  const timeline = document.querySelector("#timeline");
  if (!timeline) return;

  timeline.innerHTML = segments
    .map((seg, index) => {
      const start = timestampToSeconds(seg.startTimestamp);
      const end = seg.endTimestamp
        ? timestampToSeconds(seg.endTimestamp)
        : totalDuration;
      const left = (start / totalDuration) * 100;
      const width = ((end - start) / totalDuration) * 100;
      const isActive = index === selectedSegmentIndex;
      return `
        <div class="timeline-segment ${isActive ? "active" : ""}"
             style="left: ${left}%; width: ${width}%; background: ${metadata.colors[seg.type] || "#666"}"
             onclick="selectSegment(${index})"
             title="${metadata.labels[seg.type] || seg.type}">
          ${metadata.labels[seg.type] || seg.type}
        </div>
      `;
    })
    .join("");
}

function updateSegmentStart(index: number, value: string): void {
  if (!selectedEpisode?.segments) return;
  const segment = selectedEpisode.segments[index];
  if (!segment) return;
  const ts = parseTimestamp(value);
  if (ts) {
    segment.startTimestamp = ts;
    segment.confidence = "auto";
    updateTimeline();
  }
}

function updateSegmentEnd(index: number, value: string): void {
  if (!selectedEpisode?.segments) return;
  const segment = selectedEpisode.segments[index];
  if (!segment) return;
  const ts = value ? (parseTimestamp(value) ?? null) : null;
  segment.endTimestamp = ts;
  segment.confidence = "auto";
  updateTimeline();
}

function addSegment(): void {
  if (!selectedEpisode) return;
  if (!selectedEpisode.segments) {
    selectedEpisode.segments = [];
  }

  const currentTime = getCurrentMediaTime();
  const videoDuration = getCurrentMediaDuration();
  const newStartTimestamp = formatSecondsToTimestamp(currentTime);

  // Find where to insert based on timestamp order
  const segments = selectedEpisode.segments;
  let insertIndex = segments.length; // Default: end of list

  for (const [index, seg] of segments.entries()) {
    if (!seg) continue;
    const segStart = timestampToSeconds(seg.startTimestamp);
    if (currentTime < segStart) {
      insertIndex = index;
      break;
    }
  }

  // Update previous segment's end timestamp to match new segment's start
  if (insertIndex > 0) {
    const previousSegment = segments[insertIndex - 1];
    if (previousSegment) {
      previousSegment.endTimestamp = newStartTimestamp;
      previousSegment.confidence = "auto";
    }
  }

  // Insert new segment at the correct position
  // If inserting at end, use video duration for end timestamp
  const newSegment: EpisodeSegment = {
    type: "main-content",
    startTimestamp: newStartTimestamp,
    endTimestamp:
      segments[insertIndex]?.startTimestamp ||
      (videoDuration > 0 ? formatSecondsToTimestamp(videoDuration) : null),
    confidence: "auto",
    detectionMethod: "manual",
  };

  segments.splice(insertIndex, 0, newSegment);
  selectedSegmentIndex = insertIndex;

  renderContent();
  // Re-initialize player after content render and seek to the new segment
  playerState.pendingSeek = currentTime;
  void initializePlayer();
}

async function markAllVerified(): Promise<void> {
  if (!selectedEpisode?.segments) return;

  // Find segments that might need patterns learned (manual or non-intro/outro/main-content)
  const learnableSegments = selectedEpisode.segments.filter(
    seg =>
      seg.detectionMethod === "manual" ||
      (seg.confidence === "auto" &&
        !["intro", "outro", "main-content"].includes(seg.type)),
  );

  // Offer to learn patterns from segments
  if (learnableSegments.length > 0 && transcriptLines.length > 0) {
    const learn = confirm(
      `Found ${learnableSegments.length} segment(s) that could teach new detection patterns.\n\n` +
        `Would you like to review and add patterns for future detection?`,
    );

    if (learn) {
      for (const seg of learnableSegments) {
        await learnPatternFromSegment(seg);
      }
    }
  }

  // Mark all as verified
  for (const seg of selectedEpisode.segments) {
    seg.confidence = "verified";
  }
  renderContent();
  // Re-initialize player after content render
  void initializePlayer();
}

async function learnPatternFromSegment(seg: EpisodeSegment): Promise<void> {
  // Find the transcript line at or near this segment's start time
  const segStart = timestampToSeconds(seg.startTimestamp);
  let closestLine: TranscriptLine | null = null;
  let closestDiff = Number.POSITIVE_INFINITY;

  for (const line of transcriptLines) {
    const diff = Math.abs(line.seconds - segStart);
    if (diff < closestDiff) {
      closestDiff = diff;
      closestLine = line;
    }
    if (line.seconds > segStart + 10) break;
  }

  if (!closestLine) return;

  const text = closestLine.text;
  const segmentLabel = metadata.labels?.[seg.type] || seg.type;

  // Let user edit the pattern before saving
  const pattern = prompt(
    `Learn pattern for "${segmentLabel}"?\n\n` +
      `Transcript at ${closestLine.timestamp}:\n"${text}"\n\n` +
      `Edit to create a reusable pattern (or Cancel to skip):`,
    text.slice(0, 60),
  );

  if (!pattern) return; // User cancelled

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/segment-verification/patterns/add`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segmentType: seg.type,
          pattern: pattern.trim(),
        }),
      },
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to add pattern");
    }

    showToast(`Pattern learned for ${segmentLabel}!`, "success");
  } catch (error) {
    showToast((error as Error).message, "error");
  }
}

async function saveSegments(): Promise<void> {
  if (!selectedEpisode) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/segment-verification/segments/${selectedEpisode.videoId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segments: selectedEpisode.segments }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to save");
    }

    showToast("Segments saved successfully!", "success");
    await loadStats();
    renderEpisodeList();
  } catch (error) {
    showToast((error as Error).message, "error");
  }
}

// Utility functions
function getTotalDuration(segments: EpisodeSegment[]): number {
  if (segments.length === 0) return 3600; // Default 1 hour
  let max = 0;
  for (const seg of segments) {
    const end = seg.endTimestamp
      ? timestampToSeconds(seg.endTimestamp)
      : timestampToSeconds(seg.startTimestamp) + 300;
    if (end > max) max = end;
  }
  return max;
}

// Make functions available globally for onclick handlers
interface GlobalFunctions {
  selectEpisode: typeof selectEpisode;
  selectSegment: typeof selectSegment;
  playSegment: typeof playSegment;
  deleteSegment: typeof deleteSegment;
  jumpToTime: typeof jumpToTime;
  updateSegmentType: typeof updateSegmentType;
  updateSegmentStart: typeof updateSegmentStart;
  updateSegmentEnd: typeof updateSegmentEnd;
  addSegment: typeof addSegment;
  markAllVerified: typeof markAllVerified;
  saveSegments: typeof saveSegments;
}

(globalThis as typeof globalThis & GlobalFunctions).selectEpisode =
  selectEpisode;
(globalThis as typeof globalThis & GlobalFunctions).selectSegment =
  selectSegment;
(globalThis as typeof globalThis & GlobalFunctions).playSegment = playSegment;
(globalThis as typeof globalThis & GlobalFunctions).deleteSegment =
  deleteSegment;
(globalThis as typeof globalThis & GlobalFunctions).jumpToTime = jumpToTime;
(globalThis as typeof globalThis & GlobalFunctions).updateSegmentType =
  updateSegmentType;
(globalThis as typeof globalThis & GlobalFunctions).updateSegmentStart =
  updateSegmentStart;
(globalThis as typeof globalThis & GlobalFunctions).updateSegmentEnd =
  updateSegmentEnd;
(globalThis as typeof globalThis & GlobalFunctions).addSegment = addSegment;
(globalThis as typeof globalThis & GlobalFunctions).markAllVerified =
  markAllVerified;
(globalThis as typeof globalThis & GlobalFunctions).saveSegments = saveSegments;

// Event listeners
const statusFilter = document.querySelector("#status-filter");
if (statusFilter) {
  statusFilter.addEventListener("change", renderEpisodeList);
}

// Initialize
init();
