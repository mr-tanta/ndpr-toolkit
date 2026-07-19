#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const standaloneUrl = new URL('./postgresql.sql', import.meta.url);
const drizzleUrl = new URL('./drizzle.sql', import.meta.url);
const standalone = readFileSync(standaloneUrl, 'utf8');
const newline = standalone.includes('\r\n') ? '\r\n' : '\n';
const lines = standalone.split(/\r?\n/);
const beginLines = lines.flatMap((line, index) => (line === 'BEGIN;' ? [index] : []));
const commitLines = lines.flatMap((line, index) => (line === 'COMMIT;' ? [index] : []));

if (beginLines.length !== 1 || commitLines.length !== 1) {
  throw new Error('postgresql.sql must contain exactly one top-level BEGIN; and COMMIT;.');
}

const [beginIndex] = beginLines;
const [commitIndex] = commitLines;
if (
  beginIndex >= commitIndex ||
  lines.slice(commitIndex + 1).some((line) => line.trim() !== '')
) {
  throw new Error('postgresql.sql transaction control must wrap the complete migration.');
}

const placeholder = '__REPLACE_WITH_TENANT_ID__';
if (standalone.split(placeholder).length - 1 !== 1) {
  throw new Error('postgresql.sql must contain exactly one tenant placeholder.');
}

// postgresql.sql is canonical. Drizzle supplies the outer transaction, so its
// managed migration receives exactly the same SQL minus these two wrapper lines.
const derived = lines
  .filter((_, index) => index !== beginIndex && index !== commitIndex)
  .join(newline);

if (/^(?:BEGIN|COMMIT);\r?$/m.test(derived)) {
  throw new Error('The derived Drizzle body must not contain transaction control.');
}

if (process.argv.includes('--check')) {
  let published;
  try {
    published = readFileSync(drizzleUrl, 'utf8');
  } catch {
    throw new Error(`${fileURLToPath(drizzleUrl)} is missing; run this command without --check.`);
  }

  if (published !== derived) {
    throw new Error('drizzle.sql is stale; regenerate it with derive-drizzle.mjs.');
  }

  console.log('drizzle.sql matches postgresql.sql without its transaction wrapper.');
} else {
  writeFileSync(drizzleUrl, derived, 'utf8');
  console.log(`Wrote ${fileURLToPath(drizzleUrl)}.`);
}
