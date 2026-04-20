import { rename } from "node:fs/promises";
import { join } from "node:path";

const TOPICS_DIR = "hugo/content/topics";

interface MoveArguments {
  fromSlug: string;
  toSlug: string;
  addAlias: boolean;
}

function parseArguments(argv: string[]): MoveArguments {
  const positional: string[] = [];
  let addAlias = false;

  for (const argument of argv) {
    if (argument === "--add-alias") {
      addAlias = true;
    } else {
      positional.push(argument);
    }
  }

  if (positional.length !== 2) {
    throw new Error(
      "Usage: move-topic-page <from-slug> <to-slug> [--add-alias]",
    );
  }

  return {
    fromSlug: positional[0] as string,
    toSlug: positional[1] as string,
    addAlias,
  };
}

async function main(): Promise<void> {
  try {
    const args = parseArguments(process.argv.slice(2));
    const fromDir = join(TOPICS_DIR, args.fromSlug);
    const toDir = join(TOPICS_DIR, args.toSlug);

    const fromExists = await Bun.file(join(fromDir, "_index.md")).exists();
    if (!fromExists) {
      throw new Error(`No page found at ${fromDir}/_index.md`);
    }

    const toExists = await Bun.file(join(toDir, "_index.md")).exists();
    if (toExists) {
      throw new Error(`Page already exists at ${toDir}/_index.md`);
    }

    await rename(fromDir, toDir);

    if (args.addAlias) {
      const indexPath = join(toDir, "_index.md");
      const content = await Bun.file(indexPath).text();
      const aliasPath = `/topics/${args.fromSlug}/`;

      if (!content.includes(aliasPath)) {
        const aliasLine = `  - "${aliasPath}"`;

        if (content.includes("aliases:")) {
          const updated = content.replace(/^(aliases:)$/m, `$1\n${aliasLine}`);
          await Bun.write(indexPath, updated);
        } else {
          const updated = content.replace(
            /^(title: .+)$/m,
            `$1\naliases:\n${aliasLine}`,
          );
          await Bun.write(indexPath, updated);
        }
      }
    }

    console.log(`Moved ${fromDir} → ${toDir}`);
    if (args.addAlias) {
      console.log(`Added alias /tags/${args.fromSlug}/`);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

await main();
