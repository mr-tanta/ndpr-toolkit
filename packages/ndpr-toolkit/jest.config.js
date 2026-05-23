module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/setupTests.ts',
  ],
  // Coverage thresholds act as a ratchet — set at or just below current values
  // to fail CI on regression but not on the existing gaps. Raise these in a
  // follow-up patch as new tests land. Coverage is uploaded as a CI artifact
  // either way so the trend is visible.
  coverageThreshold: {
    global: {
      branches: 45,
      functions: 50,
      lines: 65,
      statements: 65,
    },
  },
};
