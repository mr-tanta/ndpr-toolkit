// @ts-check
/**
 * Package-level flat ESLint config for @tantainnovative/ndpr-toolkit.
 *
 * The repo root has a thin shared config (ignores + a few rule overrides)
 * but no parser / plugins, so a TypeScript file run from inside this
 * package errored with "Parsing error: Unexpected token :". This config
 * wires up the @typescript-eslint parser and the React / React Hooks
 * plugins so `pnpm lint` actually parses our sources.
 *
 * ESLint flat-config replaces the legacy `--ext` flag — the lint script
 * now passes glob patterns instead.
 */
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default [
  // Files this config applies to. The root config's `ignores` are merged
  // by ESLint's flat-config resolver, but we re-state the package-local
  // exclusions here so this file is self-contained when run with `--no-config-lookup`.
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '*.config.{js,mjs,cjs,ts}',
      'src/setupTests.ts',
    ],
  },
  // TypeScript / TSX sources
  {
    files: ['src/**/*.{ts,tsx}'],
    linterOptions: {
      // Real react-hooks plugin (v7+) is now loaded, so inline disable
      // directives are evaluated normally. Keep this off because the
      // codebase has historical disables that point at the old rule
      // names; we don't want lint noise during the v5/v7 transition.
      reportUnusedDisableDirectives: 'off',
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        // jsdom / browser globals our components reference
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        queueMicrotask: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        Blob: 'readonly',
        FormData: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        HTMLElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLSelectElement: 'readonly',
        Element: 'readonly',
        Event: 'readonly',
        KeyboardEvent: 'readonly',
        MouseEvent: 'readonly',
        FocusEvent: 'readonly',
        Node: 'readonly',
        // Node + bundler globals appearing in our utilities
        process: 'readonly',
        Buffer: 'readonly',
        require: 'readonly',
        module: 'readonly',
        global: 'readonly',
        __dirname: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // The recommended ruleset is intentionally NOT spread in here — the
      // codebase predates this lint config and applying every default
      // would surface ~hundreds of stylistic issues that are out of scope
      // for the publish blocker. Below are the minimum rules that catch
      // genuine bugs without churn.
      '@typescript-eslint/no-unused-vars': 'off', // many intentional internal helpers
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'react/no-unescaped-entities': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/react-in-jsx-scope': 'off',
      // Hooks rules — these catch real bugs.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // Semicolon / quote style left unmanaged — Prettier territory.
      'no-undef': 'off', // typescript-eslint handles this; ESLint can't see TS globals
      'no-empty': 'off',
      'no-prototype-builtins': 'off',
      'no-useless-escape': 'off',
    },
  },
];
