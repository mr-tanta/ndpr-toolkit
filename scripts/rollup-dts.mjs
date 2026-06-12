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
  'headless',
  'consent',
  'dsr',
  'dpia',
  'breach',
  'policy',
  'lawful-basis',
  'cross-border',
  'ropa',
  'lawful-basis-lite',
  'cross-border-lite',
  'ropa-lite',
  'adapters',
  'presets',
  'presets-consent',
  'presets-dsr',
  'presets-policy',
  'unstyled',
];

const DIST = path.resolve('dist');
const TMP_CONFIG = path.resolve('.api-extractor-tmp.json');

const baseConfig = JSON.parse(readFileSync('api-extractor.base.json', 'utf8'));

let processed = 0;
let skipped = 0;
const failed = [];

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

  let result;
  try {
    const prepared = ExtractorConfig.loadFileAndPrepare(TMP_CONFIG);
    result = Extractor.invoke(prepared, {
      localBuild: true,
      showVerboseMessages: false,
    });
  } catch (err) {
    console.error(`  ✗ ${entry} — api-extractor threw: ${err.message}`);
    failed.push(entry);
    if (existsSync(rolledUpDts)) unlinkSync(rolledUpDts);
    continue;
  }

  if (!result.succeeded) {
    console.error(
      `  ✗ ${entry} — ${result.errorCount} error(s), ${result.warningCount} warning(s)`,
    );
    failed.push(entry);
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

// Sweep up every .d.ts / .d.mts file that ISN'T one of our published
// entries. After dts-rollup runs, the entry files are fully self-contained
// (every referenced declaration is inlined), so the per-symbol and chunk
// files that tsup emitted alongside them are dead weight and broke IDE
// "go to definition" links because their content-hashes rotate per release.
//
// We keep an explicit allowlist (built from ENTRIES + 'styles') instead of
// pattern-matching the hash suffix. The older regex approach
// (`-[A-Za-z0-9_-]{8,}\.d\.m?ts$`) accidentally matched legitimate
// hyphenated entry names like `lawful-basis-lite.d.ts` and
// `cross-border-lite.d.ts` — the trailing `basis-lite` / `border-lite`
// segments fall inside the dash-inclusive 8-char window. That bug shipped
// in 3.8.0 and silently failed every npm publish from 3.8.0 through
// 3.10.0: the publish workflow's entry-points check then errored before
// `npm publish` ever ran, leaving npm stuck on 3.7.0.
const allowed = new Set([...ENTRIES, 'styles']);
const allDts = (await fs.readdir(DIST))
  .filter((f) => /\.d\.m?ts$/.test(f));
let swept = 0;
for (const f of allDts) {
  const base = f.replace(/\.d\.m?ts$/, '');
  if (allowed.has(base)) continue;
  await fs.unlink(path.join(DIST, f));
  swept++;
}

console.log(
  `\n  rolled up ${processed} entries, skipped ${skipped}, swept ${swept} chunk/hash dts files`,
);

if (failed.length > 0) {
  console.error(
    `\n  ✗ ${failed.length} entr${failed.length === 1 ? 'y' : 'ies'} failed to roll up: ${failed.join(', ')}`,
  );
  process.exit(1);
}
