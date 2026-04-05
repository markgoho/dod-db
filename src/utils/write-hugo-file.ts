import type { HugoEpisodeFrontmatter } from "./hugo-frontmatter-types.js";

/**
 * Write Hugo markdown file with updated frontmatter.
 *
 * @param filePath - Path to the Hugo markdown file
 * @param frontmatter - Frontmatter object
 * @param content - Markdown content (unchanged)
 */
export async function writeHugoFile({
  filePath,
  frontmatter,
  content,
}: {
  filePath: string;
  frontmatter: HugoEpisodeFrontmatter;
  content: string;
}): Promise<void> {
  const normalizedFrontmatter = {
    ...frontmatter,
    date:
      frontmatter.date instanceof Date
        ? frontmatter.date.toISOString()
        : frontmatter.date,
  };

  const frontmatterYaml = Bun.YAML.stringify(
    normalizedFrontmatter,
    undefined,
    2,
  ).replaceAll(/ +\n/g, "\n");
  const normalizedContent = content.endsWith("\n") ? content : `${content}\n`;
  const fullContent = `---\n${frontmatterYaml}\n---\n${normalizedContent}`;
  await Bun.write(filePath, fullContent);
}
