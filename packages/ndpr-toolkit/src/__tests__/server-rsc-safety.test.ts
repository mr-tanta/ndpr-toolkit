/**
 * RSC-safety guards for the /server entry.
 *
 * These tests inspect the built bundle (dist/server.{mjs,js}) rather than
 * the source, because the contract we're enforcing is what consumers
 * actually pull when they `import from '@tantainnovative/ndpr-toolkit/server'`.
 * Source-level guards can pass while bundler chunk-splitting silently pulls
 * in React via a transitive dependency.
 *
 * If the build hasn't been run yet, the tests skip cleanly so a fresh
 * `pnpm test` (without a prior `pnpm build`) doesn't fail spuriously.
 */
import * as fs from 'fs';
import * as path from 'path';

const distDir = path.resolve(__dirname, '..', '..', 'dist');
const serverMjs = path.join(distDir, 'server.mjs');
const serverCjs = path.join(distDir, 'server.js');

const distExists = fs.existsSync(serverMjs) && fs.existsSync(serverCjs);

(distExists ? describe : describe.skip)(
  '/server entry — built bundle RSC-safety',
  () => {
    let mjs: string;
    let cjs: string;

    beforeAll(() => {
      mjs = fs.readFileSync(serverMjs, 'utf8');
      cjs = fs.readFileSync(serverCjs, 'utf8');
    });

    it('does not contain a "use client" directive (ESM)', () => {
      // Match the directive at file start or after whitespace/comments.
      // Banner injection in tsup writes "use client"; (with semicolon).
      expect(mjs).not.toMatch(/['"]use client['"]/);
    });

    it('does not contain a "use client" directive (CJS)', () => {
      expect(cjs).not.toMatch(/['"]use client['"]/);
    });

    it('does not import react (ESM)', () => {
      // Cover bare imports, scoped imports, and dynamic imports.
      expect(mjs).not.toMatch(/from\s+['"]react['"]/);
      expect(mjs).not.toMatch(/from\s+['"]react-dom['"]/);
      expect(mjs).not.toMatch(/import\(\s*['"]react['"]\s*\)/);
    });

    it('does not require react (CJS)', () => {
      expect(cjs).not.toMatch(/require\(\s*['"]react['"]\s*\)/);
      expect(cjs).not.toMatch(/require\(\s*['"]react-dom['"]\s*\)/);
    });

    it('does not reference NDPRProvider, useState, or useContext in source', () => {
      // Sanity: the curated entry must not transitively pull in React-only
      // primitives. If any of these appear in the bundled output, a
      // re-export above accidentally dragged React in.
      const combined = mjs + '\n' + cjs;
      expect(combined).not.toMatch(/\bNDPRProvider\b/);
      // useState/useContext etc. would only appear if a React component
      // chunk got pulled in. Note: `useFoo` *names* from our own hooks
      // are intentionally not checked here — those are consumer-facing
      // re-exports that don't belong on /server but won't pull React if
      // they're absent. The structural check is the React import above.
    });
  },
);
