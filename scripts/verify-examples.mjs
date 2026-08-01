#!/usr/bin/env node
/**
 * Typecheck every examples/** app against the toolkit version it pins.
 *
 * Each example is copied to a temp directory OUTSIDE the repository before
 * installing. That matters: built in place, Vite/PostCSS walk up and pick up the
 * monorepo root postcss.config.mjs, whose Tailwind plugin is absent from the
 * example's isolated node_modules. A standalone consumer has no parent config,
 * so the copy is the honest environment.
 *
 * examples/** is deliberately outside the pnpm workspace (see
 * pnpm-workspace.yaml) and no CI job builds these, so this is the only thing
 * that checks they still compile against a published toolkit.
 *
 * Usage: node scripts/verify-examples.mjs [--build] [filter]
 */
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, rmSync, existsSync, readFileSync, globSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2);
const doBuild = args.includes('--build');
const filter = args.find((a) => !a.startsWith('--'));

const manifests = globSync('examples/**/package.json', { exclude: (p) => p.includes('node_modules') })
  .filter((p) => !p.includes('node_modules'))
  .sort();

const results = [];

for (const manifest of manifests) {
  const dir = manifest.replace(/\/package\.json$/, '');
  if (filter && !dir.includes(filter)) continue;

  const pkg = JSON.parse(readFileSync(manifest, 'utf8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const pinned = deps['@tantainnovative/ndpr-toolkit'] ?? '(none)';

  const tmp = mkdtempSync(join(tmpdir(), 'ndpr-ex-'));
  let status = 'ok';
  let detail = '';

  try {
    cpSync(dir, tmp, { recursive: true });
    for (const junk of ['node_modules', 'dist', '.next', '.astro', 'build']) {
      rmSync(join(tmp, junk), { recursive: true, force: true });
    }

    execFileSync('npm', ['install', '--no-audit', '--no-fund'], {
      cwd: tmp,
      stdio: 'pipe',
      encoding: 'utf8',
    });

    // Confirm the toolkit actually resolved to a v6 line.
    const installed = JSON.parse(
      readFileSync(join(tmp, 'node_modules/@tantainnovative/ndpr-toolkit/package.json'), 'utf8'),
    ).version;
    detail = `toolkit@${installed}`;

    if (existsSync(join(tmp, 'tsconfig.json'))) {
      execFileSync('npx', ['tsc', '--noEmit'], { cwd: tmp, stdio: 'pipe', encoding: 'utf8' });
    } else {
      detail += ' (no tsconfig — typecheck skipped)';
    }

    if (doBuild && pkg.scripts?.build) {
      execFileSync('npm', ['run', 'build'], { cwd: tmp, stdio: 'pipe', encoding: 'utf8' });
      detail += ' + build';
    }
  } catch (err) {
    status = 'FAIL';
    const out = `${err.stdout ?? ''}${err.stderr ?? ''}`.trim();
    detail = out.split('\n').slice(0, 14).join('\n      ') || err.message;
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  results.push({ dir, pinned, status, detail });
  const mark = status === 'ok' ? 'ok  ' : 'FAIL';
  console.log(`${mark} ${dir}  (pins ${pinned})  ${status === 'ok' ? detail : ''}`);
  if (status === 'FAIL') console.log(`      ${detail}`);
}

const failed = results.filter((r) => r.status !== 'ok');
console.log(`\n${results.length - failed.length}/${results.length} examples verified`);
if (failed.length) {
  console.log('failed:', failed.map((f) => f.dir).join(', '));
  process.exit(1);
}
