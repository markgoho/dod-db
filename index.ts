import { AssemblyAI, type TranscribeParams } from "assemblyai";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY as string,
});

const audioFile = "./126-full-audio.mp3";

const params: TranscribeParams = {
  audio: audioFile,
  speaker_labels: true,
  audio_start_from: 0,
  audio_end_at: 8 * 60 * 1000, // 8 minutes
};

const run = async () => {
  const transcript = await client.transcripts.transcribe(params);
  for (const utterance of transcript.utterances!) {
    console.log(`Speaker ${utterance.speaker}: ${utterance.text}`);
  }
};

await run();
