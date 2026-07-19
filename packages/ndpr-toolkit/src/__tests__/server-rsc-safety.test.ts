import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const distDir = path.resolve(process.cwd(), 'dist');
const entries = ['core', 'server'] as const;

type EntryName = (typeof entries)[number];
type ModuleFormat = 'mjs' | 'js';

function artifact(entry: EntryName, format: ModuleFormat): string {
  return path.join(distDir, `${entry}.${format}`);
}

function collectLocalGraph(
  entryFile: string,
  format: ModuleFormat,
  visited = new Set<string>(),
): Set<string> {
  if (visited.has(entryFile)) return visited;
  visited.add(entryFile);

  const source = fs.readFileSync(entryFile, 'utf8');
  const pattern =
    format === 'mjs'
      ? /(?:from\s*|import\s*\(\s*|import\s*)["'](\.\/[^"']+)["']/g
      : /require\(\s*["'](\.\/[^"']+)["']\s*\)/g;

  for (const match of source.matchAll(pattern)) {
    const dependency = path.resolve(path.dirname(entryFile), match[1]);
    if (fs.existsSync(dependency)) {
      collectLocalGraph(dependency, format, visited);
    }
  }
  return visited;
}

function graphSource(entry: EntryName, format: ModuleFormat): string {
  return [...collectLocalGraph(artifact(entry, format), format)]
    .map((file) => fs.readFileSync(file, 'utf8'))
    .join('\n');
}

function importWithReactServerCondition(entry: EntryName): void {
  const url = pathToFileURL(artifact(entry, 'mjs')).href;
  const forbiddenExports =
    entry === 'core'
      ? `
        for (const name of ['NDPRProvider', 'useNDPRConfig', 'useNDPRLocale']) {
          if (name in module) throw new Error('/core unexpectedly exports ' + name);
        }
      `
      : '';
  execFileSync(
    process.execPath,
    [
      '--conditions=react-server',
      '--input-type=module',
      '--eval',
      `const module = await import(${JSON.stringify(url)});${forbiddenExports}`,
    ],
    { encoding: 'utf8', stdio: 'pipe' },
  );
}

function requireBuiltCjs(entry: EntryName): void {
  execFileSync(
    process.execPath,
    [
      '--conditions=react-server',
      '--eval',
      `require(${JSON.stringify(artifact(entry, 'js'))})`,
    ],
    { encoding: 'utf8', stdio: 'pipe' },
  );
}

describe.each(entries)('/%s built entry — RSC safety', (entry) => {
  beforeAll(() => {
    for (const format of ['mjs', 'js'] as const) {
      const file = artifact(entry, format);
      if (!fs.existsSync(file)) {
        throw new Error(
          `Missing ${file}. Build the library before running built-artifact RSC tests.`,
        );
      }
    }
  });

  it.each(['mjs', 'js'] as const)(
    'has no client directive or React dependency in its reachable %s graph',
    (format) => {
      const source = graphSource(entry, format);
      expect(source).not.toMatch(/["']use client["']/);
      expect(source).not.toMatch(
        /(?:from\s*|require\(\s*)["']react(?:-dom)?(?:\/[^"']*)?["']/,
      );
      expect(source).not.toMatch(
        /import\(\s*["']react(?:-dom)?(?:\/[^"']*)?["']\s*\)/,
      );
      expect(source).not.toMatch(/\bNDPRProvider\b/);
    },
  );

  it('imports under the react-server condition', () => {
    expect(() => importWithReactServerCondition(entry)).not.toThrow();
  });

  it('loads its CommonJS artifact without React', () => {
    expect(() => requireBuiltCjs(entry)).not.toThrow();
  });
});
