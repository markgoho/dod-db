export async function writeToFile(path: string, content: string) {
  await Bun.write(path, content);
}
