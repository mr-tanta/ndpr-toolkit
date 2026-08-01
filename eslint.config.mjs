import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

const eslintConfig = [
  // Global ignores (replaces .eslintignore)
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/out/**",
      "**/dist/**",
      "**/build/**",
      "**/storybook-static/**",
      "**/coverage/**",
      "**/.turbo/**",
      "**/public/**",
      "**/*.config.js",
      "**/*.config.ts",
      "**/packages/*/dist/**",
      "**/test-installation/**",
      "**/packages/ndpr-toolkit/dist/**",
      // standalone scaffolds with their own toolchains
      "examples/**",
      "phase1/**",
      ".remember/**",
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      "react-hooks": reactHooks,
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // Was "off", which let 45 unused imports and locals accumulate that CodeQL
      // then reported as js/unused-local-variable. Enabled so lint is the gate
      // and the alerts can't come back. `_`-prefixed names stay allowed for
      // deliberately-unused positional args and destructuring holes.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-empty-object-type": "off",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // tests exercise the CJS entry points and jest mocks via require()
  {
    files: ["**/__tests__/**", "**/*.test.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
    },
  },
  // Raw create-ndpr templates are Handlebars sources, not ordinary modules: a
  // declaration can be referenced only from inside a {{#if}} branch that a
  // given render strips, so "unused" here is not a reliable signal. The CodeQL
  // config excludes these same paths for the related reason that mutually
  // exclusive branches aren't valid TypeScript until rendered. The rendered
  // output is what gets linted and strictly typechecked, by verify:create-ndpr.
  {
    files: ["packages/create-ndpr/templates/**"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];

export default eslintConfig;
