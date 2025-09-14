export function speakerLabelPrompt(transcript: string): string {
  return `You are an expert in speaker label recognition. You will receive a portion of a transcript with timestamps, and speaker labels but the labels don't have the names, only Speaker A, Speaker B, etc.

  Your job is to identify the speakers by name in the text of the transcript.

  <example-transcript>
    [00:00:01] Speaker A: What's the **Song of Songs** all about? Songs.
    [00:00:04] Speaker B: Oh, sex.
    [00:00:05] Speaker A: No. There you go. The **higgledy-piggledy**. So we're gonna go to **Song of Songs** six, nine. And.
    [00:00:16] Speaker B: Thank you for.
    [00:00:16] Speaker A: This is.
    [00:00:17] Speaker B: That was a gift to me.
    [00:00:24] Speaker A: Hey, Everybody, I'm Dan McClellan.
    [00:00:25] Speaker B: And I'm Dan Beecher.
  </example-transcript>

  <expected-output>
    {
      "Speaker A": "Dan McClellan",
      "Speaker B": "Dan Beecher"
    }
  </expected-output>


  Transcript to analyze:
  ${transcript}
  `;
}
