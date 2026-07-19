const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle module aliases (if you have them in tsconfig.json)
    '^@/(.*)$': '<rootDir>/src/$1',
    // @paralleldrive/cuid2 is ESM-only; recipe tests run in Jest's CJS runtime.
    '^@paralleldrive/cuid2$': '<rootDir>/src/__tests__/mocks/cuid2.js',
  },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/out/',
    '<rootDir>/src/__tests__/helpers/',
    '<rootDir>/src/__tests__/mocks/'
  ],
  transformIgnorePatterns: [
    '/node_modules/',
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'packages/ndpr-toolkit/src/**/*.{ts,tsx}',
    '!packages/ndpr-toolkit/src/**/*.d.ts',
    '!packages/ndpr-toolkit/src/**/*.stories.{ts,tsx}',
    '!packages/ndpr-toolkit/src/**/__tests__/**',
    '!packages/ndpr-toolkit/src/**/index.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      statements: 66,
      branches: 54,
      functions: 53,
      lines: 69,
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
