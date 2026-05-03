#!/usr/bin/env node
/**
 * Roll up tsup-emitted per-entry `.d.ts` files into single self-contained
 * declaration files using @microsoft/api-extractor.
 *
 * Background: tsup emits one `.d.ts` per entry plus N hash-suffixed
 * `chunk-*.d.mts` files for shared internal types. Consumers' IDE
 * "go to definition" walks through those chunk files, and since the
 * hashes change per release, doc links and source-map URLs rot. This
 * script replaces each entry's `.d.ts` with a single rolled-up file
 * that inlines every referenced declaration, then deletes the chunks.
 *
 * Runs after tsup in build:lib. Idempotent — safe to re-run.
 */
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor';
import { promises as fs } from 'node:fs';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import * as path from 'node:path';

const ENTRIES = [
  'index',
  'core',
  'server',
  'hooks',
  'consent',
  'dsr',
  'dpia',
  'breach',
  'policy',
  'lawful-basis',
  'cross-border',
  'ropa',
  'adapters',
  'presets',
  'unstyled',
];

const DIST = path.resolve('dist');
const TMP_CONFIG = path.resolve('.api-extractor-tmp.json');

const baseConfig = JSON.parse(readFileSync('api-extractor.base.json', 'utf8'));

let processed = 0;
let skipped = 0;

for (const entry of ENTRIES) {
  const entryDts = path.join(DIST, `${entry}.d.ts`);
  if (!existsSync(entryDts)) {
    console.warn(`  ⊘ skip ${entry} — ${entryDts} not found`);
    skipped++;
    continue;
  }

  const rolledUpDts = path.join(DIST, `${entry}.rolled.d.ts`);

  const config = {
    ...baseConfig,
    mainEntryPointFilePath: entryDts,
    dtsRollup: {
      enabled: true,
      untrimmedFilePath: rolledUpDts,
    },
  };

  writeFileSync(TMP_CONFIG, JSON.stringify(config, null, 2));

  const prepared = ExtractorConfig.loadFileAndPrepare(TMP_CONFIG);
  const result = Extractor.invoke(prepared, {
    localBuild: true,
    showVerboseMessages: false,
  });

  if (!result.succeeded) {
    console.error(
      `  ✗ ${entry} — ${result.errorCount} error(s), ${result.warningCount} warning(s)`,
    );
    // Don't throw — best-effort. Keep the original .d.ts in place.
    if (existsSync(rolledUpDts)) unlinkSync(rolledUpDts);
    continue;
  }

  // Replace the original with the rolled-up file.
  await fs.copyFile(rolledUpDts, entryDts);
  await fs.unlink(rolledUpDts);

  // Also update the .d.mts version so ESM consumers get the same rolled-up
  // surface. tsup emits both .d.ts and .d.mts pointing at the same content
  // in our setup; keep them in sync.
  const entryDmts = path.join(DIST, `${entry}.d.mts`);
  if (existsSync(entryDmts)) {
    await fs.copyFile(entryDts, entryDmts);
  }

  processed++;
  console.log(`  ✓ ${entry}`);
}

// Clean up the temp config.
if (existsSync(TMP_CONFIG)) unlinkSync(TMP_CONFIG);

// Sweep up the now-orphaned chunk .d.ts and .d.mts files. They're inlined
// into the rolled-up entries so consumers no longer reach them.
const chunkFiles = (await fs.readdir(DIST))
  .filter((f) => /^chunk-[A-Z0-9_-]+\.d\.m?ts$/.test(f));
for (const f of chunkFiles) {
  await fs.unlink(path.join(DIST, f));
}

// Also sweep any remaining hash-suffixed component .d.{m,}ts files
// (e.g. `useDefaultPrivacyPolicy-DkOqMg2e.d.ts`). These were the symptom
// FINLAB flagged — broken doc links per release.
const hashSuffixedFiles = (await fs.readdir(DIST))
  .filter((f) => /-[A-Za-z0-9_-]{8,}\.d\.m?ts$/.test(f));
for (const f of hashSuffixedFiles) {
  await fs.unlink(path.join(DIST, f));
}

console.log(
  `\n  rolled up ${processed} entries, skipped ${skipped}, swept ${chunkFiles.length + hashSuffixedFiles.length} chunk/hash dts files`,
);
