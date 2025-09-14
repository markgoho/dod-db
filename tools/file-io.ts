import { tool } from 'langchain';
import { z } from 'zod';
import { writeToFile } from './functions/write-to-file';

export const writeFile = tool(
  async (input) => {
    const { path, content } = input as { path: string; content: string };
    await writeToFile(path, content);
    return `File written to ${path}.`;
  },
  {
    name: 'writeFile',
    description: 'Write a file to the filesystem.',
    schema: z.object({
      path: z.string(),
      content: z.string(),
    }),
  },
);

export const readFileTool = tool(
  async (input) => {
    const { path } = input as { path: string };
    const maxAttempts = 5;
    const delayMs = 100;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        const content = await Bun.file(path).text();
        return content;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes('ENOENT') && attempt < maxAttempts - 1) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }
        throw error;
      }
    }

    // Should not reach here
    return await Bun.file(path).text();
  },
  {
    name: 'readFile',
    description: 'Read a file from the filesystem.',
    schema: z.object({
      path: z.string(),
    }),
  },
);
