import type { Format, Options } from 'tsup';
import { defineConfig } from 'tsup';

// Use a mutable typed object so each split config below extends cleanly
// without tripping `readonly` incompatibilities under strict TS. The
// next.config.ts typecheck step in CI scans this file even though tsup
// only consumes it at build time.
// Sourcemaps were previously emitted into the tarball, adding ~3 MB
// of `.map` files for consumers that never need them. Allow callers to
// opt-in via NDPR_SOURCEMAPS=1 (used by the dev workspace), but default
// to off so the published tarball stays lean.
const EMIT_SOURCEMAPS = process.env.NDPR_SOURCEMAPS === '1';

const sharedOptions: Options = {
  format: ['cjs', 'esm'] satisfies Format[],
  target: 'es2018',
  dts: false,
  splitting: true,
  sourcemap: EMIT_SOURCEMAPS,
  external: ['react', 'react-dom'],
  outExtension({ format }: { format: string }) {
    return {
      js: format === 'esm' ? '.mjs' : '.js',
    };
  },
};

export default defineConfig([
  // Pure-logic entries: must remain RSC-safe (no "use client" directive).
  // /server is the strict pure surface — zero React. /core is the broader
  // entry that also re-exports NDPRProvider for backward compat.
  {
    ...sharedOptions,
    entry: { core: 'src/core.ts', server: 'src/server.ts' },
    clean: true,
    onSuccess: async () => {
      const fs = await import('fs');
      const path = await import('path');
      // Prefer the new consolidated stylesheet; fall back to the legacy
      // animations.css if a future refactor removes the new file. Single
      // dist/styles.css keeps the consumer import surface tiny:
      //   import "@tantainnovative/ndpr-toolkit/styles";
      const newSource = path.join('src', 'styles', 'styles.css');
      const legacySource = path.join('src', 'styles', 'animations.css');
      const dest = path.join('dist', 'styles.css');
      const source = fs.existsSync(newSource) ? newSource : legacySource;
      if (fs.existsSync(source)) {
        fs.copyFileSync(source, dest);
      }
    },
  },
  // Client entries: hooks + components. Inject "use client" so consumers can
  // import these directly from a Server Component file without a wrapper.
  {
    ...sharedOptions,
    entry: {
      index: 'src/index.ts',
      headless: 'src/headless.ts',
      hooks: 'src/hooks-entry.ts',
      consent: 'src/consent.ts',
      dsr: 'src/dsr.ts',
      dpia: 'src/dpia.ts',
      breach: 'src/breach.ts',
      policy: 'src/policy.ts',
      'lawful-basis': 'src/lawful-basis-entry.ts',
      'cross-border': 'src/cross-border-entry.ts',
      ropa: 'src/ropa-entry.ts',
      'lawful-basis-lite': 'src/lawful-basis-lite-entry.ts',
      'cross-border-lite': 'src/cross-border-lite-entry.ts',
      'ropa-lite': 'src/ropa-lite-entry.ts',
      presets: 'src/presets-entry.ts',
      unstyled: 'src/unstyled.ts',
    },
    clean: false,
    banner: { js: '"use client";' },
  },
]);
