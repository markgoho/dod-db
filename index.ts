import { AssemblyAI, type TranscribeParams } from "assemblyai";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY as string,
});

const params: TranscribeParams = {
  audio_url:
    "https://drive.google.com/uc?export=download&id=1XjkVt17K4Oa0muqJnDZm593FXMG9TRQd",
  speaker_labels: true,
  audio_start_from: 0,
  audio_end_at: 8 * 60 * 1000, // 8 minutes
};

const run = async () => {
  const transcript = await client.transcripts.transcribe(params);

  const transcriptLines: string[] = [];
  for (const utterance of transcript.utterances!) {
    const startTime = utterance.start;
    const hours = Math.floor(startTime / 3600000)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((startTime % 3600000) / 60000)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor((startTime % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    const formattedTime = `[${hours}:${minutes}:${seconds}]`;

    const line = `${formattedTime} Speaker ${utterance.speaker}: ${utterance.text}`;
    console.log(line);
    transcriptLines.push(line);
  }

  const transcriptText = transcriptLines.join("\n");
  const outputPath = "transcript-126.txt";
  await Bun.write(outputPath, transcriptText);
  console.log(`\nTranscript also saved to ${outputPath}`);
};

await run();
