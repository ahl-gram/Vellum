export const WITNESSES: Readonly<Record<string, string>> = {
  "e2e/**/*.ts": "e2e/harness.ts",
  "src/styles/**/*.css": "src/styles/shared/house.css",
  "scripts/**/*.ts": "scripts/build-app-bundles.ts",
  "src/**/*.ts": "src/cli/main.ts",
  "test-support/**/*.ts": "test-support/element-shim.ts",
  "test/**/*.ts": "test/repo/lint-wiring.test.ts",
};
