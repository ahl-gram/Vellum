import type { Linter } from "eslint";
import lintConfig from "../eslint.config.ts";

export const LINT_SCOPE = [
  "**/*.cjs",
  "**/*.js",
  "**/*.jsx",
  "**/*.mjs",
  "e2e/**/*.ts",
  "scripts/**/*.ts",
  "src/**/*.ts",
  "src/styles/**/*.css",
  "test-support/**/*.ts",
  "test/**/*.ts",
];
export const REFUSED = LINT_SCOPE.filter((g) => g.startsWith("**/"));

export const blocks: readonly Linter.Config[] = lintConfig;
export const shortName = (b: Linter.Config): string => (b.name ?? "(unnamed)").replace(/^.* > /, "");

export type Resolved = {
  rules?: Record<string, unknown>;
  language?: { defaultLanguageOptions?: unknown };
  languageOptions?: { parser?: { meta?: { name?: string } }; tolerant?: unknown };
  linterOptions?: { reportUnusedDisableDirectives?: unknown };
};
