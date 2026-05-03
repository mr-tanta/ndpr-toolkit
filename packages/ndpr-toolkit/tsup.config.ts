import { defineConfig } from 'tsup';

const sharedOptions = {
  format: ['cjs', 'esm'] as const,
  target: 'es2018' as const,
  dts: false,
  splitting: true,
  sourcemap: true,
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
      'hooks-entry': 'src/hooks-entry.ts',
      consent: 'src/consent.ts',
      dsr: 'src/dsr.ts',
      dpia: 'src/dpia.ts',
      breach: 'src/breach.ts',
      policy: 'src/policy.ts',
      'lawful-basis-entry': 'src/lawful-basis-entry.ts',
      'cross-border-entry': 'src/cross-border-entry.ts',
      'ropa-entry': 'src/ropa-entry.ts',
      presets: 'src/presets-entry.ts',
      unstyled: 'src/unstyled.ts',
    },
    clean: false,
    banner: { js: '"use client";' },
  },
]);
