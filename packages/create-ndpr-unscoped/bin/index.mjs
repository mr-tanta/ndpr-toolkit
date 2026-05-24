#!/usr/bin/env node
/**
 * `create-ndpr` (unscoped) — thin alias for `@tantainnovative/create-ndpr`.
 *
 * Why this package exists:
 * - npm convention: `npm create ndpr@latest` resolves to `create-ndpr`,
 *   which is the unscoped name. The canonical CLI lives at
 *   `@tantainnovative/create-ndpr`. This alias bridges the two so the
 *   `npm create ndpr` muscle memory works.
 * - The alias delegates to the scoped package via `npx`. That way you
 *   always get the latest scaffolder without re-publishing this alias
 *   when the scoped CLI is updated.
 *
 * Equivalent of running:
 *   npx -y @tantainnovative/create-ndpr@latest [...args]
 */

import { spawn } from 'node:child_process';

const args = process.argv.slice(2);

const child = spawn(
  'npx',
  ['-y', '@tantainnovative/create-ndpr@latest', ...args],
  { stdio: 'inherit' },
);

child.on('error', (err) => {
  console.error(
    `[create-ndpr] Failed to invoke @tantainnovative/create-ndpr: ${err.message}\n` +
      'You can install the scoped CLI directly with:\n' +
      '  npx @tantainnovative/create-ndpr',
  );
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
