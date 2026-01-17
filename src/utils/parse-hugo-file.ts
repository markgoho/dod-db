import type { HugoEpisodeFrontmatter } from "./hugo-frontmatter-types.js";

/**
 * Parse a Hugo markdown file and extract frontmatter + content.
 *
 * @param filePath - Path to the Hugo markdown file
 * @returns Object with frontmatter and content
 */
export async function parseHugoFile(filePath: string): Promise<{
  frontmatter: HugoEpisodeFrontmatter;
  content: string;
}> {
  const file = Bun.file(filePath);
  const fullContent = await file.text();

  // Hugo frontmatter is between --- markers
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = fullContent.match(frontmatterRegex);

  if (!match || !match[1] || !match[2]) {
    throw new Error(`No frontmatter found in ${filePath}`);
  }

  const frontmatterYaml = match[1];
  const content = match[2];
  const frontmatter = Bun.YAML.parse(frontmatterYaml) as HugoEpisodeFrontmatter;

  return { frontmatter, content };
}
