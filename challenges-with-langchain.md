## Deterministic agent flow challenges (LangChain + tools)

### Overview

Goal: Make an agent reliably execute this exact sequence on every run using only the agent + tools pattern:

1. transcribeAudio(url)
2. writeFile('raw_transcript.txt', transcript)
3. readFile('raw_transcript.txt')
4. correctTranscript(readString)
5. writeFile('corrected_transcript.txt', corrected)
   → respond with `corrected_transcript.txt`.

### Challenges observed

- Tool registration gaps
  - `readFile` existed but wasn’t registered in the agent’s `tools` list ⇒ model attempted to call it and failed with “Tool "readFile" not found.”

- Argument/IO shape drift
  - Model sometimes tried writing JSON-wrapped content (e.g., `{ "text": ... }`) and/or assumed `transcribeAudio` returned an object, not a plain string.
  - Result: placeholder-looking files and downstream steps receiving the wrong type.

- Function-call orchestration instability
  - Strict “one tool per turn” guidance caused stalls and `MALFORMED_FUNCTION_CALL` after tool responses.
  - Allowing multi-step planning (several tool calls planned/streamed) occasionally produced `UNEXPECTED_TOOL_CALL`/intermittent behavior.
  - Net: over-constraining or under-constraining the model both led to non-deterministic tool-call progression.

- Timing/race on filesystem
  - Immediate `readFile` after `writeFile` intermittently raised `ENOENT` even though the write had just succeeded.
  - This manifested as sporadic failures in the middle of an otherwise correct tool sequence.

- Temperature / stochasticity
  - With default temperatures, the model’s decision to continue the chain could vary across runs (e.g., stopping after write vs continuing to read/correct).

- Long-context variability
  - Long transcripts increased token pressure and variability in subsequent tool-call decisions and outputs.

### Mitigations applied

- Registered all required tools
  - Ensured `readFile`, `writeFile`, `transcribeAudio`, and `correctTranscript` are all present in the `tools` array.

- Prompt I/O contracts
  - Explicitly specified: plain-string inputs/outputs for all tools; no JSON wrappers; exact argument keys/types.

- Relaxed overly strict turn-taking
  - Removed the “exactly one tool per turn” constraint to avoid `MALFORMED_FUNCTION_CALL` stalls; kept an explicit, enumerated step order instead.

- Reduced randomness
  - Set `temperature: 0` for both the main agent model and the correction tool’s model.

- FS read retry
  - Added a short, bounded retry loop to `readFile` for transient `ENOENT` after a write (eventual consistency/visibility).

### Remaining risks / tradeoffs

- Model-side orchestration is probabilistic
  - Even with temperature 0 and explicit prompts, LLM function-calling can still occasionally diverge (API finish reasons, internal heuristics).

- Tool-call batching vs step-by-step
  - Forcing strict single-tool steps harms reliability; allowing batching improves flow but can surface `UNEXPECTED_TOOL_CALL` in some providers.

- External dependency variance
  - Upstream API responses (e.g., ASR) and long transcripts can shift token usage and downstream behavior.

### Potential next steps (still agent + tools)

- Atomic write pattern
  - Write to a temp path and `rename` to `raw_transcript.txt` before `readFile` to minimize visibility races.

- Guard-rail tool
  - Add a minimal “validateNextStep” tool that returns the canonical next action; keeps all logic inside the agent pattern without host-side orchestration.

- Size-aware correction
  - Truncate or chunk very long transcripts before correction to reduce token pressure and improve stability.

- Structured tool responses
  - Where supported, return tool outputs wrapped by the framework (e.g., explicit result channels) and instruct the model to chain off those results.
