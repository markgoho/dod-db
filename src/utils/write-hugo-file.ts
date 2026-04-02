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
  // Normalize date to Date object for consistent formatting
  // Ensures Bun.YAML.stringify produces unquoted date with milliseconds
  const normalizedFrontmatter = {
    ...frontmatter,
    date:
      typeof frontmatter.date === "string"
        ? new Date(frontmatter.date)
        : frontmatter.date,
  };

  const frontmatterYaml = Bun.YAML.stringify(
    normalizedFrontmatter,
    undefined,
    2,
  );
  const normalizedContent = content.endsWith("\n") ? content : `${content}\n`;
  const fullContent = `---\n${frontmatterYaml}---\n${normalizedContent}`;
  await Bun.write(filePath, fullContent);
}
