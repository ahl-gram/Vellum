import { defineConfig, includeIgnoreFile } from "eslint/config";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import css from "@eslint/css";
import vellum from "./scripts/lint/css-comment-form.ts";

export default defineConfig(
  includeIgnoreFile(fileURLToPath(new URL(".gitignore", import.meta.url)), "the .gitignore: build output, generated trees and scratch"),
  {
    name: "Issue #653 ruling D: no JavaScript source anywhere",
    files: ["**/*.cjs", "**/*.js", "**/*.jsx", "**/*.mjs"],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    linterOptions: { noInlineConfig: true },
    rules: {
      "no-restricted-syntax": ["error", { selector: "Program", message: "JavaScript is not written here: the house is TypeScript (CLAUDE.md, One language, one pipeline), and design/ is the one archive whose round tools keep their JavaScript (Issue #653 ruling D)." }],
    },
  },
  {
    name: "Issue #653 ruling D: design/ archives its round tools as they ran",
    files: ["design/**/*.cjs", "design/**/*.js", "design/**/*.jsx", "design/**/*.mjs"],
    linterOptions: { noInlineConfig: false, reportUnusedDisableDirectives: "off" },
    rules: { "no-restricted-syntax": "off" },
  },
  {
    files: ["src/**/*.ts", "scripts/**/*.ts", "test/**/*.ts", "test-support/**/*.ts"],
    extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked],
    languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
    rules: {
      "max-depth": ["error", 4],
      "max-lines": ["error", 400],
      "max-lines-per-function": ["error", 50],
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-param-reassign": ["error", { props: true, ignorePropertyModificationsFor: ["drawerEls", "ghostEl", "innerEl", "leafEls", "legendEl", "logEls", "mapEl", "noteEl", "pillEl", "revealEl", "roomEls", "sheetEl", "slipEl", "statusEl", "targetEl", "viewportEl"] }],
      "@typescript-eslint/no-floating-promises": [
        "error",
        { allowForKnownSafeCalls: [{ from: "package", package: "node:test", name: ["test", "suite"] }] },
      ],
      "@typescript-eslint/no-unnecessary-condition": "error",
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
    },
  },
  {
    files: ["public/**/*.css"],
    plugins: { css, vellum },
    language: "css/css",
    languageOptions: { tolerant: true },
    rules: {
      "vellum/css-comment-issue-form": "error",
      "vellum/css-comment-no-em-dash": "error",
      "vellum/css-comment-one-line": "error",
    },
  },
);
