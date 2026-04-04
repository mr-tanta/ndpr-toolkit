import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    core: 'src/core.ts',
    'hooks-entry': 'src/hooks-entry.ts',
    consent: 'src/consent.ts',
    dsr: 'src/dsr.ts',
    dpia: 'src/dpia.ts',
    breach: 'src/breach.ts',
    policy: 'src/policy.ts',
    'lawful-basis-entry': 'src/lawful-basis-entry.ts',
    'cross-border-entry': 'src/cross-border-entry.ts',
    'ropa-entry': 'src/ropa-entry.ts',
  },
  format: ['cjs', 'esm'],
  target: 'es2018',
  dts: false,
  splitting: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.js',
    };
  },
});
