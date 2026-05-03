// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jsdom (testEnvironment: 'jest-environment-jsdom') provides a real
// localStorage / sessionStorage implementation out of the box. Avoid
// installing a global mock here — it would break tests that rely on
// real persistence semantics (consent storage, policy rehydration, etc.).
// Per-test storage state is cleared via beforeEach in those test files.
