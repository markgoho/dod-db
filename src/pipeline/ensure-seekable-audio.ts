import * as path from "node:path";

export interface AudioSeekInspection {
  inputPath: string;
  outputPath: string;
  reencoded: boolean;
  reasons: string[];
}

interface AudioProbe {
  streams?: Array<{ start_time?: string }>;
}

async function readProcessOutput(command: string[]): Promise<{
  exitCode: number;
  stdout: string;
  stderr: string;
}> {
  const proc = Bun.spawn(command, { stderr: "pipe" });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);

  return { exitCode, stdout, stderr };
}

async function hasMp3SeekHeader(inputPath: string): Promise<boolean> {
  const file = Bun.file(inputPath);
  const bytes = new Uint8Array(await file.slice(0, 4096).arrayBuffer());
  const text = new TextDecoder("latin1").decode(bytes);
  return text.includes("Xing") || text.includes("VBRI");
}

async function getStartTime(inputPath: string): Promise<number | undefined> {
  const result = await readProcessOutput([
    "ffprobe",
    "-v",
    "error",
    "-show_entries",
    "stream=start_time",
    "-of",
    "json",
    inputPath,
  ]);
  if (result.exitCode !== 0) {
    throw new Error(`ffprobe failed for ${inputPath}: ${result.stderr}`);
  }

  const probe = JSON.parse(result.stdout) as AudioProbe;
  const firstStartTime = probe.streams?.[0]?.start_time;
  if (firstStartTime === undefined) {
    return undefined;
  }

  const startTime = Number.parseFloat(firstStartTime);
  return Number.isNaN(startTime) ? undefined : startTime;
}

async function reencodeToCbrMp3(
  inputPath: string,
  outputPath: string,
): Promise<void> {
  const result = await readProcessOutput([
    "ffmpeg",
    "-hide_banner",
    "-y",
    "-i",
    inputPath,
    "-codec:a",
    "libmp3lame",
    "-b:a",
    "192k",
    "-write_xing",
    "0",
    outputPath,
  ]);
  if (result.exitCode !== 0) {
    throw new Error(
      `ffmpeg re-encode failed for ${inputPath}: ${result.stderr}`,
    );
  }
}

export async function ensureSeekableAudio(
  inputPath: string,
): Promise<AudioSeekInspection> {
  const reasons: string[] = [];
  const extension = path.extname(inputPath).toLowerCase();

  if (extension === ".mp3" && (await hasMp3SeekHeader(inputPath))) {
    reasons.push("mp3-seek-header");
  }

  const startTime = await getStartTime(inputPath);
  if (startTime !== undefined && Math.abs(startTime) > 0.001) {
    reasons.push(`non-zero-start-time:${startTime.toFixed(6)}`);
  }

  if (reasons.length === 0) {
    return {
      inputPath,
      outputPath: inputPath,
      reencoded: false,
      reasons,
    };
  }

  const outputPath = inputPath.replace(/\.mp3$/i, "-seekable.mp3");
  await reencodeToCbrMp3(inputPath, outputPath);

  return {
    inputPath,
    outputPath,
    reencoded: true,
    reasons,
  };
}
