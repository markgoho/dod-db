/**
 * Split a transcript into chunks of whole lines.
 *
 * Lines are never split, so every chunk starts at a line boundary and
 * `chunks.join("\n")` reproduces the transcript exactly. A single line longer
 * than `maxLength` becomes its own chunk.
 *
 * @param transcript - Newline-separated transcript text
 * @param maxLength - Target maximum chunk length in characters
 * @returns Chunks of whole lines, in order
 */
export function chunkTranscriptLines(
  transcript: string,
  maxLength: number,
): string[] {
  if (transcript.length === 0) return [];

  const chunks: string[] = [];
  let current: string | undefined;

  for (const line of transcript.split("\n")) {
    if (current === undefined) {
      current = line;
    } else if (current.length + 1 + line.length <= maxLength) {
      current += `\n${line}`;
    } else {
      chunks.push(current);
      current = line;
    }
  }

  if (current !== undefined) chunks.push(current);
  return chunks;
}
