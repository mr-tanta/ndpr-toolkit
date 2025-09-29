const eslintConfig = [
  // Global ignores (replaces .eslintignore)
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/out/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/.turbo/**",
      "**/public/**",
      "**/*.config.js",
      "**/*.config.ts",
      "**/packages/*/dist/**",
      "**/test-installation/**",
      "**/packages/ndpr-toolkit/dist/**",
    ],
  },
  // Custom rules
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default eslintConfig;
