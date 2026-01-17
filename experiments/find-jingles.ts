/**
 * Find jingle occurrences in episodes using Python/librosa via Docker.
 *
 * Usage:
 *   bun run experiments/find-jingles.ts <video-id>
 */

import { join } from "node:path";

interface JingleMatch {
  timestamp: number;
  confidence: number;
  correlationValue: number;
}

/**
 * Find audio file for a video ID.
 */
async function findAudioFile(videoId: string): Promise<string> {
  const audioDir = join(process.cwd(), "data", "audio");
  const extensions = [".m4a", ".webm", ".mp3", ".wav"];

  for (const extension of extensions) {
    const path = join(audioDir, `${videoId}${extension}`);
    const file = Bun.file(path);
    if (await file.exists()) {
      return path;
    }
  }

  throw new Error(`Audio file not found for video ID: ${videoId}`);
}

/**
 * Find jingles using Docker container with librosa.
 */
async function findJingles(videoId: string): Promise<JingleMatch[]> {
  const audioPath = await findAudioFile(videoId);
  const jinglePath = join(process.cwd(), "data", "jingles", "jingle-pure.wav");

  const jingleFile = Bun.file(jinglePath);
  if (!(await jingleFile.exists())) {
    throw new Error(`Jingle not found: ${jinglePath}`);
  }

  console.log("\n🔍 Finding jingles with librosa (uv)...\n");

  const proc = Bun.spawn(
    ["uv", "run", "scripts/find_jingles_uv.py", jinglePath, audioPath],
    {
      stdout: "pipe",
      stderr: "pipe",
    },
  );

  // Read stdout for JSON results
  const stdout = await new Response(proc.stdout).text();

  // Read stderr for progress (async, don't block)
  new Response(proc.stderr).text().then(stderr => {
    const lines = stderr.split("\n");
    for (const line of lines) {
      if (
        line.trim() &&
        !line.includes("ffmpeg") &&
        !line.includes("libav") &&
        !line.includes("Downloading") &&
        !line.includes("Installed")
      ) {
        console.log(`   ${line}`);
      }
    }
  });

  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    throw new Error(`Docker command failed with code ${exitCode}`);
  }

  // Parse JSON output
  const results = JSON.parse(stdout) as Array<{
    timestamp: number;
    confidence: number;
    correlation_value: number;
  }>;

  const matches: JingleMatch[] = results.map(r => ({
    timestamp: r.timestamp,
    confidence: r.confidence,
    correlationValue: r.correlation_value,
  }));

  return matches;
}

/**
 * Format timestamp as HH:MM:SS
 */
function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Main CLI
 */
async function main(): Promise<void> {
  const [videoId] = process.argv.slice(2);

  if (!videoId) {
    console.error("Usage: bun run experiments/find-jingles.ts <video-id>");
    console.error("\nExample:");
    console.error("  bun run experiments/find-jingles.ts QFyFMwQpSko");
    process.exit(1);
  }

  const matches = await findJingles(videoId);

  console.log("\n\n📊 Segment Boundaries Detected:\n");

  if (matches.length === 0) {
    console.log("   No jingles found\n");
    return;
  }

  // Show all matches above 50% confidence
  const highConfidence = matches.filter(m => m.confidence >= 50);

  console.log(`   Found ${highConfidence.length} high-confidence matches:\n`);

  for (const match of highConfidence) {
    console.log(
      `   [${formatTimestamp(match.timestamp)}] - ${match.confidence.toFixed(1)}% confidence`,
    );
  }

  // Show lower confidence matches if any
  const mediumConfidence = matches.filter(
    m => m.confidence >= 10 && m.confidence < 50,
  );

  if (mediumConfidence.length > 0) {
    console.log(`\n   ${mediumConfidence.length} medium-confidence matches:\n`);
    for (const match of mediumConfidence.slice(0, 10)) {
      console.log(
        `   [${formatTimestamp(match.timestamp)}] - ${match.confidence.toFixed(1)}% confidence`,
      );
    }
  }

  console.log("");
}

main().catch((error: Error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
