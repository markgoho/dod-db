/**
 * Recover missing raw transcripts (data/transcripts/*-raw.txt) from the
 * transcripts AssemblyAI still stores, matched to episodes by timestamps.
 *
 * Only writes gitignored raw files; committed transcripts are not touched.
 *
 * Usage:
 *   bun run src/scripts/recover-raw-transcripts.ts
 */

import { AssemblyAI } from "assemblyai";
import {
  groupSentencesByLines,
  parseTranscriptLines,
  timestampToMs,
} from "../pipeline/repair-transcript-lines.js";
import { loadProcessedVideos } from "../storage/load-processed-videos.js";

const minMatchRatio = 0.9;
const concurrency = 6;

const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! });

type Sentence = { start: number; text: string };

async function listCompletedTranscriptIds(): Promise<string[]> {
  const ids: string[] = [];
  let page = await client.transcripts.list({ status: "completed", limit: 200 });
  for (;;) {
    ids.push(...page.transcripts.map(t => t.id));
    const previous = page.page_details.prev_url;
    if (!previous) break;
    page = await client.transcripts.list(previous);
  }
  return ids;
}

async function fetchSentences(id: string): Promise<Sentence[]> {
  const { sentences } = await client.transcripts.sentences(id);
  return sentences.map(s => ({
    start: s.words?.[0]?.start ?? s.start,
    text: s.text,
  }));
}

async function mapWithConcurrency<T, R>(
  items: T[],
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = Array.from({ length: items.length });
  let next = 0;
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (next < items.length) {
        const index = next++;
        results[index] = await worker(items[index]!);
      }
    }),
  );
  return results;
}

async function main() {
  const videos = await loadProcessedVideos();
  const missing = [];
  for (const video of videos) {
    if (!video.transcriptPath) continue;
    const rawPath = video.transcriptPath.replace(/\.txt$/, "-raw.txt");
    if (await Bun.file(rawPath).exists()) continue;
    const lines = parseTranscriptLines(
      await Bun.file(video.transcriptPath).text(),
    );
    missing.push({ video, rawPath, lines });
  }
  console.log(`Episodes without a raw transcript: ${missing.length}`);
  if (missing.length === 0) return;

  const ids = await listCompletedTranscriptIds();
  console.log(`AssemblyAI transcripts to scan: ${ids.length}`);

  let fetched = 0;
  const transcripts = await mapWithConcurrency(ids, async id => {
    const sentences = await fetchSentences(id).catch(() => []);
    if (++fetched % 25 === 0) console.log(`  fetched ${fetched}/${ids.length}`);
    return { id, sentences, starts: new Set(sentences.map(s => s.start)) };
  });

  let recovered = 0;
  const unmatched: string[] = [];
  for (const { video, rawPath, lines } of missing) {
    const stamps = lines.map(line => timestampToMs(line.timestamp));
    let best: (typeof transcripts)[number] | undefined;
    let bestRatio = 0;
    for (const transcript of transcripts) {
      const hits = stamps.filter(ms => transcript.starts.has(ms)).length;
      const ratio = stamps.length > 0 ? hits / stamps.length : 0;
      if (ratio > bestRatio) {
        best = transcript;
        bestRatio = ratio;
      }
    }

    const label = `#${video.episodeNumber ?? "?"} ${video.title}`;
    if (!best || bestRatio < minMatchRatio) {
      unmatched.push(`${label} (best match ${(bestRatio * 100).toFixed(0)}%)`);
      continue;
    }

    const rawLines = groupSentencesByLines(best.sentences, lines);
    await Bun.write(rawPath, `${rawLines.join("\n")}\n`);
    recovered++;
    console.log(
      `  ✓ ${label} ← ${best.id} (${(bestRatio * 100).toFixed(1)}% timestamps)`,
    );
  }

  console.log(`\nRecovered ${recovered}/${missing.length} raw transcripts`);
  if (unmatched.length > 0) {
    console.log("No confident match:");
    for (const line of unmatched) console.log(`  - ${line}`);
  }
}

await main();
