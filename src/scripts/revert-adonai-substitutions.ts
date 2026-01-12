#!/usr/bin/env bun
/**
 * Revert LLM substitutions where "The Lord" was changed to "Adonai"
 * by comparing -raw.txt files to final .txt files.
 */

import { readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

const TRANSCRIPTS_DIR = join(import.meta.dir, '../../data/transcripts');

interface Reversion {
  file: string;
  line: number;
  raw: string;
  corrected: string;
}

async function main() {
  const dryRun = !process.argv.includes('--apply');

  if (dryRun) {
    console.log('DRY RUN - showing what would be changed. Use --apply to make changes.\n');
  }

  const files = readdirSync(TRANSCRIPTS_DIR);
  const finalFiles = files.filter(f => f.endsWith('.txt') && !f.includes('-raw'));

  let totalReversions = 0;
  const allReversions: { file: string; reversions: Reversion[] }[] = [];

  for (const finalFile of finalFiles) {
    const rawFile = finalFile.replace('.txt', '-raw.txt');
    const rawPath = join(TRANSCRIPTS_DIR, rawFile);
    const finalPath = join(TRANSCRIPTS_DIR, finalFile);

    if (!existsSync(rawPath)) {
      continue; // No raw file to compare against
    }

    const rawContent = await Bun.file(rawPath).text();
    const finalContent = await Bun.file(finalPath).text();

    const rawLines = rawContent.split('\n');
    const finalLines = finalContent.split('\n');

    // Build a map of timestamps to raw lines for comparison
    const rawByTimestamp = new Map<string, string>();
    for (const line of rawLines) {
      const match = line.match(/^\[(\d{2}:\d{2}:\d{2}\.\d{3})\]/);
      if (match) {
        rawByTimestamp.set(match[1], line);
      }
    }

    const reversions: Reversion[] = [];
    const newFinalLines: string[] = [];

    for (let i = 0; i < finalLines.length; i++) {
      let line = finalLines[i];
      const match = line.match(/^\[(\d{2}:\d{2}:\d{2}\.\d{3})\]/);

      if (match && line.toLowerCase().includes('adonai')) {
        const timestamp = match[1];
        const rawLine = rawByTimestamp.get(timestamp);

        if (rawLine) {
          // Check if raw has "the lord" (case insensitive) where final has "adonai"
          const rawLower = rawLine.toLowerCase();
          const finalLower = line.toLowerCase();

          if (rawLower.includes('the lord') && finalLower.includes('adonai')) {
            // Find and replace Adonai with the original casing from raw
            // Extract "the Lord" variant from raw (preserve original casing)
            const lordMatch = rawLine.match(/the lord/i);
            if (lordMatch) {
              const originalPhrase = lordMatch[0];
              const newLine = line.replace(/adonai/gi, originalPhrase);

              reversions.push({
                file: finalFile,
                line: i + 1,
                raw: rawLine.trim(),
                corrected: line.trim(),
              });

              line = newLine;
            }
          }
        }
      }

      newFinalLines.push(line);
    }

    if (reversions.length > 0) {
      totalReversions += reversions.length;
      allReversions.push({ file: finalFile, reversions });

      if (!dryRun) {
        await Bun.write(finalPath, newFinalLines.join('\n'));
        console.log(`✓ Fixed ${reversions.length} substitution(s) in ${finalFile}`);
      }
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log(`SUMMARY: Found ${totalReversions} "The Lord" → "Adonai" substitutions across ${allReversions.length} files\n`);

  for (const { file, reversions } of allReversions) {
    console.log(`\n📄 ${file} (${reversions.length} reversions)`);
    for (const r of reversions) {
      console.log(`   Line ${r.line}:`);
      console.log(`   - Raw:       ${r.raw.substring(0, 100)}${r.raw.length > 100 ? '...' : ''}`);
      console.log(`   + Corrected: ${r.corrected.substring(0, 100)}${r.corrected.length > 100 ? '...' : ''}`);
    }
  }

  if (dryRun && totalReversions > 0) {
    console.log('\n\nRun with --apply to make these changes.');
  }
}

main().catch(console.error);
