import { defineConfig, includeIgnoreFile } from "eslint/config";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import css from "@eslint/css";
import vellum from "./scripts/lint/css-comment-form.ts";

// Every rule set off below was red on main when the tool landed; Issue #648 is the ledger, and each family pull request turns its rules on with the violations fixed or exempted by name.
export default defineConfig(
  includeIgnoreFile(fileURLToPath(new URL(".gitignore", import.meta.url)), "the .gitignore: build output, generated trees and scratch"),
  {
    name: "Issue #653 ruling D: no JavaScript source anywhere",
    files: ["**/*.cjs", "**/*.js", "**/*.jsx", "**/*.mjs"],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    rules: {
      "no-restricted-syntax": ["error", { selector: "Program", message: "JavaScript is not written here: the house is TypeScript (CLAUDE.md, One language, one pipeline), and design/ is the one archive whose round tools keep their JavaScript (Issue #653 ruling D)." }],
    },
  },
  {
    name: "Issue #653 ruling D: design/ archives its round tools as they ran",
    files: ["design/**/*.cjs", "design/**/*.js", "design/**/*.jsx", "design/**/*.mjs"],
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
      "no-empty": "off",
      "no-param-reassign": ["error", { props: false }],
      "@typescript-eslint/no-floating-promises": [
        "error",
        { allowForKnownSafeCalls: [{ from: "package", package: "node:test", name: ["test", "suite"] }] },
      ],
      "@typescript-eslint/no-unnecessary-condition": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/require-await": "off",
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
