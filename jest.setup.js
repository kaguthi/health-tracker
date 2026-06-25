// Runs before the test framework and any test files are loaded, so that
// modules which read process.env at import time (e.g. api/index.ts) see
// these values regardless of import hoisting in individual test files.
process.env.EXPO_PUBLIC_API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://api.test.local";
