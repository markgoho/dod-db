import { escapeHtml } from '../shared/utilities.js';

// Types
interface ParsedLine {
  index: number;
  timestamp: string;
  seconds: number;
  speaker: string;
  text: string;
  raw: string;
}

// State
let parsedLines: ParsedLine[] = [];
const audioPlayer = document.querySelector('#audioPlayer') as HTMLAudioElement;

/**
 * Parse transcript format: [HH:MM:SS.mmm] Speaker Name: text or [HH:MM:SS] Speaker Name: text
 */
function parseTranscript(): void {
  const inputElement = document.querySelector('#transcriptInput') as HTMLTextAreaElement;
  const input = inputElement.value;
  if (!input.trim()) {
    alert('Please paste transcript text first');
    return;
  }

  const lines = input.split('\n').filter((l) => l.trim());
  parsedLines = [];

  // Regex to match: [HH:MM:SS.mmm] Speaker Name: text (milliseconds optional)
  const timestampRegex = /^\[(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?\]\s+(.+?):\s+(.+)$/;

  console.log('Total lines to parse:', lines.length);
  for (const [index, line] of lines.entries()) {
    const match = line.match(timestampRegex);
    if (match) {
      const [, hours, minutes, seconds, milliseconds, speaker, text] = match;
      const totalSeconds =
        Number.parseInt(hours || '0', 10) * 3600 +
        Number.parseInt(minutes || '0', 10) * 60 +
        Number.parseInt(seconds || '0', 10) +
        (milliseconds ? Number.parseInt(milliseconds, 10) / 1000 : 0);

      const timestamp = milliseconds
        ? `${hours}:${minutes}:${seconds}.${milliseconds}`
        : `${hours}:${minutes}:${seconds}`;

      parsedLines.push({
        index,
        timestamp,
        seconds: totalSeconds,
        speaker: speaker || '',
        text: text || '',
        raw: line,
      });
    } else if (index < 3) {
      console.log('Failed to parse line', index, ':', line);
    }
  }

  console.log('Parsed lines:', parsedLines.length);

  if (parsedLines.length === 0) {
    alert(
      `No valid timestamps found. Please check the format:\n[HH:MM:SS.mmm] Speaker Name: text or [HH:MM:SS] Speaker Name: text\n\nFirst line: ${lines[0] || ''}`,
    );
    return;
  }

  displayTranscript();
  updateStats();
}

/**
 * Display parsed transcript lines
 */
function displayTranscript(): void {
  const container = document.querySelector('#transcriptLines');
  if (!container) return;

  container.innerHTML = '';

  for (const [index, line] of parsedLines.entries()) {
    const div = document.createElement('div');
    div.className = 'transcript-line';
    div.id = `line-${index}`;
    div.addEventListener('click', () => jumpToTimestamp(line.seconds, index));

    div.innerHTML = `
      <span class="timestamp">[${line.timestamp}]</span>
      <span class="speaker">${escapeHtml(line.speaker)}:</span>
      <span class="text">${escapeHtml(line.text)}</span>
    `;

    container.append(div);
  }
}

/**
 * Jump audio to specific timestamp
 */
function jumpToTimestamp(seconds: number, lineIndex: number): void {
  if (!audioPlayer.src) {
    alert('Please load an audio file first');
    return;
  }

  audioPlayer.currentTime = seconds;
  audioPlayer.play();

  // Highlight active line
  for (const element of document.querySelectorAll('.transcript-line')) {
    element.classList.remove('active');
  }

  const activeLine = document.querySelector(`#line-${lineIndex}`);
  if (activeLine) {
    activeLine.classList.add('active');
    // Scroll into view
    activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/**
 * Update statistics panel
 */
function updateStats(): void {
  if (parsedLines.length === 0) return;

  const lastLine = parsedLines.at(-1);
  if (!lastLine) return;

  const duration = lastLine.seconds;
  const avgGap = duration / parsedLines.length;

  // Count unique speakers
  const speakers = new Set(parsedLines.map((l) => l.speaker));

  const statLinesElement = document.querySelector('#statLines');
  const statDurationElement = document.querySelector('#statDuration');
  const statAvgGapElement = document.querySelector('#statAvgGap');
  const statSpeakersElement = document.querySelector('#statSpeakers');
  const statsElement = document.querySelector('#stats') as HTMLElement;

  if (statLinesElement) statLinesElement.textContent = String(parsedLines.length);
  if (statDurationElement) statDurationElement.textContent = `${Math.floor(duration / 60)}m`;
  if (statAvgGapElement) statAvgGapElement.textContent = `${avgGap.toFixed(1)}s`;
  if (statSpeakersElement) statSpeakersElement.textContent = String(speakers.size);

  if (statsElement) statsElement.style.display = 'block';
}

/**
 * Handle audio file upload
 */
const audioFileInput = document.querySelector('#audioFile');
if (audioFileInput) {
  audioFileInput.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      audioPlayer.src = url;
      console.log('Audio loaded:', file.name);
    }
  });
}

/**
 * Handle transcript file upload
 */
const transcriptFileInput = document.querySelector('#transcriptFile');
if (transcriptFileInput) {
  transcriptFileInput.addEventListener('change', async (e) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const text = await file.text();
      const inputElement = document.querySelector('#transcriptInput') as HTMLTextAreaElement;
      if (inputElement) {
        inputElement.value = text;
        parseTranscript();
      }
    }
  });
}

/**
 * Keyboard shortcuts
 */
document.addEventListener('keydown', (e) => {
  const target = e.target as HTMLElement;
  // Ignore if typing in textarea or input
  if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
    return;
  }

  // Space = play/pause
  if (e.key === ' ') {
    e.preventDefault();
    if (audioPlayer.paused) {
      audioPlayer.play();
    } else {
      audioPlayer.pause();
    }
  }

  // Left arrow = seek backward 5s
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 5);
  }

  // Right arrow = seek forward 5s
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 5);
  }
});

/**
 * Update active line as audio plays (optional feature)
 */
audioPlayer.addEventListener('timeupdate', () => {
  if (parsedLines.length === 0) return;

  const currentTime = audioPlayer.currentTime;

  // Find the most recent line whose timestamp has passed
  for (let i = parsedLines.length - 1; i >= 0; i--) {
    const line = parsedLines[i];
    if (line && line.seconds <= currentTime) {
      // Highlight this line if not already highlighted
      const lineId = `line-${i}`;
      const activeLine = document.querySelector('.transcript-line.active');

      if (!activeLine || activeLine.id !== lineId) {
        for (const element of document.querySelectorAll('.transcript-line')) {
          element.classList.remove('active');
        }
        const newActiveLine = document.querySelector(`#${lineId}`);
        if (newActiveLine) {
          newActiveLine.classList.add('active');
        }
      }
      break;
    }
  }
});

// Make parseTranscript available globally for onclick handler
interface GlobalFunctions {
  parseTranscript: typeof parseTranscript;
}

(globalThis as typeof globalThis & GlobalFunctions).parseTranscript = parseTranscript;
