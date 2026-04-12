import { parseSpokenScriptureReference } from "../pipeline/parse-spoken-scripture-reference.js";
import { parseTranscript } from "../pipeline/parse-transcript.js";

const transcript = await Bun.file(
  "/Users/mgoho/Github/dod-db/data/transcripts/2024-04-08-episode-53-april-8-2024-the-holy-ghost-and-bears.txt",
).text();

const lines = parseTranscript(transcript).slice(120, 136);

for (const line of lines) {
  const parsed = parseSpokenScriptureReference(line.text);
  console.log(line.timestamp, JSON.stringify(line.text));
  console.log("=>", parsed ?? "none");
}
