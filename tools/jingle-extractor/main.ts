/**
 * Jingle Extractor - Extract precise jingle boundaries with sub-second accuracy
 */

let audioContext: AudioContext | undefined;
let audioBuffer: AudioBuffer | undefined;
let audioElement: HTMLAudioElement;
let fileName = "";
let startMarker: number | null = null;
let endMarker: number | null = null;
let zoomStart: number | null = null;
let zoomEnd: number | null = null;

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  audioElement = document.querySelector("#audioPlayer") as HTMLAudioElement;
  const audioFileInput = document.querySelector(
    "#audioFile",
  ) as HTMLInputElement;
  audioFileInput.addEventListener("change", loadAudio);

  const canvas = document.querySelector("#waveform") as HTMLCanvasElement;
  canvas.addEventListener("click", handleCanvasClick);

  // Make functions globally available
  (globalThis as unknown as { zoomToRange: () => void }).zoomToRange =
    zoomToRange;
  (globalThis as unknown as { resetZoom: () => void }).resetZoom = resetZoom;
  (globalThis as unknown as { playSelection: () => void }).playSelection =
    playSelection;
  (globalThis as unknown as { playFull: () => void }).playFull = playFull;
  (globalThis as unknown as { clearSelection: () => void }).clearSelection =
    clearSelection;
});

async function loadAudio(event: Event): Promise<void> {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  fileName = file.name;

  // Load for waveform visualization
  const arrayBuffer = await file.arrayBuffer();
  audioContext = new (
    globalThis.AudioContext ||
    (globalThis as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext
  )();
  audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // Load for playback
  audioElement.src = URL.createObjectURL(file);

  resetZoom();
  drawWaveform();
}

function drawWaveform(): void {
  if (!audioBuffer) return;

  const canvas = document.querySelector("#waveform") as HTMLCanvasElement;
  const context = canvas.getContext("2d");
  if (!context) return;

  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas
  context.fillStyle = "#2a2a2a";
  context.fillRect(0, 0, width, height);

  // Determine range to draw
  const bufferStart = zoomStart === null ? 0 : zoomStart;
  const bufferEnd = zoomEnd === null ? audioBuffer.duration : zoomEnd;
  const bufferDuration = bufferEnd - bufferStart;

  // Get audio data
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const startSample = Math.floor(bufferStart * sampleRate);
  const endSample = Math.floor(bufferEnd * sampleRate);
  const samplesPerPixel = Math.floor((endSample - startSample) / width);

  // Draw waveform
  context.strokeStyle = "#4a9eff";
  context.lineWidth = 1;
  context.beginPath();

  for (let x = 0; x < width; x++) {
    const sampleIndex = startSample + x * samplesPerPixel;
    let min = 1;
    let max = -1;

    // Find min/max in this pixel's samples
    for (let s = 0; s < samplesPerPixel; s++) {
      const sample = channelData[sampleIndex + s] || 0;
      if (sample < min) min = sample;
      if (sample > max) max = sample;
    }

    const yMin = ((1 - min) * height) / 2;
    const yMax = ((1 - max) * height) / 2;

    context.moveTo(x, yMin);
    context.lineTo(x, yMax);
  }

  context.stroke();

  // Draw markers
  if (startMarker !== null) {
    const x = ((startMarker - bufferStart) / bufferDuration) * width;
    context.strokeStyle = "#00ff00";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();

    context.fillStyle = "#00ff00";
    context.fillText("START", x + 5, 20);
  }

  if (endMarker !== null) {
    const x = ((endMarker - bufferStart) / bufferDuration) * width;
    context.strokeStyle = "#ff0000";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();

    context.fillStyle = "#ff0000";
    context.fillText("END", x + 5, 40);
  }

  updateTimeline();
}

function updateTimeline(): void {
  if (!audioBuffer) return;

  const bufferStart = zoomStart === null ? 0 : zoomStart;
  const bufferEnd = zoomEnd === null ? audioBuffer.duration : zoomEnd;
  const duration = bufferEnd - bufferStart;

  let html = `<strong>Timeline:</strong> ${formatTime(bufferStart)} to ${formatTime(bufferEnd)} (${duration.toFixed(2)}s)`;

  if (startMarker !== null) {
    html += ` | <span class="marker">Start: ${formatTime(startMarker)}</span>`;
  }

  if (endMarker !== null) {
    html += ` | <span class="marker">End: ${formatTime(endMarker)}</span>`;
  }

  if (startMarker !== null && endMarker !== null) {
    const markerDuration = Math.abs(endMarker - startMarker);
    html += ` | <span class="marker">Duration: ${markerDuration.toFixed(3)}s</span>`;
  }

  const timelineElement = document.querySelector("#timeline");
  if (timelineElement) {
    timelineElement.innerHTML = html;
  }

  updateSelection();
}

function updateSelection(): void {
  let html = "Click on waveform to mark jingle boundaries";

  if (startMarker !== null && endMarker === null) {
    html = `Start marked at <strong>${formatTime(startMarker)}</strong>. Click again to mark end.`;
  }

  if (startMarker !== null && endMarker !== null) {
    const start = Math.min(startMarker, endMarker);
    const end = Math.max(startMarker, endMarker);
    const duration = end - start;

    html = `
      <strong>Jingle selected:</strong><br>
      Start: ${formatTime(start)}<br>
      End: ${formatTime(end)}<br>
      Duration: ${duration.toFixed(3)}s
    `;

    const playButton = document.querySelector("#playBtn") as HTMLButtonElement;
    if (playButton) {
      playButton.disabled = false;
    }

    // Show ffmpeg command
    const commandDiv = document.querySelector(
      "#ffmpegCommand",
    ) as HTMLDivElement;
    const commandText = document.querySelector(
      "#commandText",
    ) as HTMLPreElement;
    if (commandDiv && commandText) {
      commandDiv.style.display = "block";
      commandText.textContent = `ffmpeg -i data/audio/${fileName} -ss ${start.toFixed(3)} -t ${duration.toFixed(3)} -acodec pcm_s16le -ar 16000 -ac 1 -y data/jingles/jingle-pure.wav`;
    }
  } else {
    const playButton = document.querySelector("#playBtn") as HTMLButtonElement;
    if (playButton) {
      playButton.disabled = true;
    }

    const commandDiv = document.querySelector(
      "#ffmpegCommand",
    ) as HTMLDivElement;
    if (commandDiv) {
      commandDiv.style.display = "none";
    }
  }

  const selectionElement = document.querySelector("#selection");
  if (selectionElement) {
    selectionElement.innerHTML = html;
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3);
  return `${mins}:${secs.padStart(6, "0")}`;
}

function handleCanvasClick(event: MouseEvent): void {
  if (!audioBuffer) return;

  const canvas = event.target as HTMLCanvasElement;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const percent = x / canvas.width;

  const bufferStart = zoomStart === null ? 0 : zoomStart;
  const bufferEnd = zoomEnd === null ? audioBuffer.duration : zoomEnd;
  const duration = bufferEnd - bufferStart;

  const clickTime = bufferStart + percent * duration;

  if (startMarker === null) {
    startMarker = clickTime;
  } else if (endMarker === null) {
    endMarker = clickTime;
  } else {
    // Reset and start over
    startMarker = clickTime;
    endMarker = null;
  }

  drawWaveform();
}

function clearSelection(): void {
  startMarker = null;
  endMarker = null;
  drawWaveform();
}

function playSelection(): void {
  if (startMarker === null || endMarker === null) return;

  const start = Math.min(startMarker, endMarker);
  const end = Math.max(startMarker, endMarker);

  audioElement.currentTime = start;
  audioElement.play();

  const stopAt = end;
  const checkTime = setInterval(() => {
    if (audioElement.currentTime >= stopAt) {
      audioElement.pause();
      clearInterval(checkTime);
    }
  }, 10);
}

function playFull(): void {
  audioElement.currentTime = 0;
  audioElement.play();
}

function zoomToRange(): void {
  const input = document.querySelector("#timeRange") as HTMLInputElement;
  if (!input.value || !audioBuffer) return;

  let start: number;
  let end: number;

  if (input.value.includes("-")) {
    const parts = input.value.split("-");
    if (parts[0]?.includes(":")) {
      // MM:SS format
      start = parseTimeString(parts[0]);
      end = parseTimeString(parts[1] ?? "");
    } else {
      // Seconds format
      start = Number.parseFloat(parts[0] ?? "0");
      end = Number.parseFloat(parts[1] ?? "0");
    }
  } else {
    return;
  }

  zoomStart = Math.max(0, start);
  zoomEnd = Math.min(audioBuffer.duration, end);

  drawWaveform();
}

function resetZoom(): void {
  zoomStart = null;
  zoomEnd = null;
  if (audioBuffer) {
    drawWaveform();
  }
}

function parseTimeString(timeString: string): number {
  const parts = timeString.trim().split(":");
  if (parts.length === 2) {
    return (
      Number.parseInt(parts[0] ?? "0", 10) * 60 +
      Number.parseFloat(parts[1] ?? "0")
    );
  }
  return Number.parseFloat(timeString);
}
