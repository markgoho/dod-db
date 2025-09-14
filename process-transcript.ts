import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { createAgent } from 'langchain';
import { correctTranscript } from './tools/correction';
import { readFile, writeFile } from './tools/file-io';
import { transcribeAudio } from './tools/transcribe';

const model = new ChatGoogleGenerativeAI({
  model: 'gemini-2.5-flash',
  temperature: 0,
});

const tools = [writeFile, readFile, transcribeAudio, correctTranscript];

const agent = createAgent({
  llm: model,
  tools,
  prompt: `You are a helpful assistant that transcribes and corrects audio files.

Tools and I/O contracts:
- 'transcribeAudio': input { url: string } → returns the transcript as a PLAIN STRING.
- 'writeFile': input { path: string, content: string } → writes the given string to disk.
- 'readFile': input { path: string } → returns the file contents as a PLAIN STRING.
- 'correctTranscript': input { transcript: string } → returns a corrected transcript as a PLAIN STRING.

Required workflow:
1) Call 'transcribeAudio' with the provided URL.
2) Call 'writeFile' with path 'raw_transcript.txt' and content EXACTLY the transcript string from step 1.
3) Call 'readFile' with path 'raw_transcript.txt'.
4) Call 'correctTranscript' with the string returned in step 3 as 'transcript'.
5) Call 'writeFile' with path 'corrected_transcript.txt' and content EXACTLY the corrected string from step 4.
6) When finished, respond ONLY with: corrected_transcript.txt

Rules:
- Use the exact argument keys and types defined above.
- Do NOT wrap strings in JSON or add keys like "text".
- Pass and write plain strings only.`,
});

const audioUrl =
  'https://drive.google.com/uc?export=download&id=1vsS2VRHz5fdXz0JhGSsxysa5SCMXy6gi'; // Please replace with a real audio URL

const result = await agent.invoke({
  messages: [
    {
      role: 'user',
      content: `Please transcribe and then correct the audio file from the following URL: ${audioUrl}`,
    },
  ],
});

console.log(result);
