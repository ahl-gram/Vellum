import { defineConfig, includeIgnoreFile } from "eslint/config";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import css from "@eslint/css";
import cssCommentForm from "./scripts/lint/css-comment-form.ts";
import tsCommentForm from "./scripts/lint/ts-comment-form.ts";
import sourceShape from "./scripts/lint/source-shape.ts";
import errorCast from "./scripts/lint/error-cast.ts";
import narrowWidth from "./scripts/lint/narrow-width.ts";

const vellum = { meta: cssCommentForm.meta, rules: { ...cssCommentForm.rules, ...tsCommentForm.rules, ...sourceShape.rules, ...errorCast.rules, ...narrowWidth.rules } };
const TS_ROOTS = ["e2e/**/*.ts", "scripts/**/*.ts", "src/**/*.ts", "test/**/*.ts", "test-support/**/*.ts"];

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
    files: TS_ROOTS,
    extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked],
    languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
    rules: {
      "max-depth": ["error", 4],
      "max-lines": ["error", 400],
      "max-lines-per-function": ["error", 50],
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-param-reassign": ["error", { props: true, ignorePropertyModificationsFor: ["drawerEls", "ghostEl", "innerEl", "legendEl", "logEls", "mapEl", "noteEl", "pillEl", "roomEls", "sheetEl", "slipEl", "statusEl", "targetEl", "viewportEl"] }],
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
    name: "Issue #779: the strict rules adopted one at a time",
    files: TS_ROOTS,
    rules: {
      "@typescript-eslint/no-deprecated": "error",
      "@typescript-eslint/return-await": ["error", "error-handling-correctness-only"],
      "@typescript-eslint/no-non-null-asserted-nullish-coalescing": "error",
      "@typescript-eslint/related-getter-setter-pairs": "error",
      "@typescript-eslint/unified-signatures": "error",
      "@typescript-eslint/no-useless-constructor": "error",
      "@typescript-eslint/no-extraneous-class": "error",
      "@typescript-eslint/prefer-return-this-type": "error",
      "@typescript-eslint/prefer-reduce-type-parameter": "error",
      "@typescript-eslint/no-invalid-void-type": "error",
      "@typescript-eslint/no-generated-empty-object-type": "error",
      "@typescript-eslint/restrict-template-expressions": ["error", { allowAny: false, allowBoolean: true, allowNever: false, allowNullish: true, allowNumber: true, allowRegExp: true }],
      "@typescript-eslint/no-misused-spread": "error",
      "@typescript-eslint/no-unnecessary-template-expression": "error",
      "@typescript-eslint/no-unnecessary-type-arguments": "error",
      "@typescript-eslint/restrict-plus-operands": ["error", { allowAny: false, allowBoolean: false, allowNullish: true, allowNumberAndString: true, allowRegExp: false }],
      "@typescript-eslint/use-unknown-in-catch-callback-variable": "error",
      "@typescript-eslint/no-confusing-void-expression": ["error", { ignoreArrowShorthand: true, ignoreVoidOperator: false, ignoreVoidReturningFunctions: false }],
      "@typescript-eslint/no-useless-default-assignment": "error",
      "@typescript-eslint/no-import-type-side-effects": "error",
    },
  },
  {
    name: "the house's rules on every stylesheet",
    files: ["public/**/*.css"],
    plugins: { css, vellum },
    language: "css/css",
    languageOptions: { tolerant: true },
    rules: {
      "vellum/css-comment-issue-form": "error",
      "vellum/css-comment-no-em-dash": "error",
      "vellum/css-comment-one-line": "error",
      "vellum/css-comment-no-js-module": "error",
      "vellum/css-no-narrow-width": "error",
    },
  },
  {
    name: "the house's rules on every TypeScript root",
    files: TS_ROOTS,
    plugins: { vellum },
    rules: {
      "vellum/ts-comment-no-js-module": "error",
      "vellum/ts-comment-issue-form": "error",
      "vellum/template-silent-escape": "error",
      "vellum/test-no-test-import": "error",
      "vellum/no-error-cast": "error",
    },
  },
  {
    name: "Issue #675: the living-chart engine takes its elements from the host",
    files: [["src/**/*.ts", "src/site/living-chart/**"]],
    plugins: { vellum },
    rules: { "vellum/engine-no-id-lookup": "error" },
  },
  {
    name: "the house's rules on every site script",
    files: [["src/**/*.ts", "src/site/**"]],
    plugins: { vellum },
    rules: { "vellum/worker-spawn-static": "error", "vellum/contents-row-builder-only": "error" },
  },
  {
    name: "Issue #728: the reading frame looks nothing up by id and imports nothing from the Explorer",
    files: [["src/**/*.ts", "src/site/reading-frame/**"]],
    plugins: { vellum },
    rules: { "vellum/frame-no-id-lookup": "error", "vellum/frame-no-explorer-import": "error" },
  },
  {
    name: "Issue #728: the Explorer and home bind no zoom press through the kit's document-wide binding",
    files: [["src/**/*.ts", "src/site/explorer/**"], ["src/**/*.ts", "src/site/home/**"]],
    plugins: { vellum },
    rules: { "vellum/explorer-no-glass-keys": "error" },
  },
  {
    name: "Issue #759: the prospect layer and the builder of its pinned fixtures read no clock, no entropy and nothing libm computes",
    files: [["src/**/*.ts", "src/prospect/**"], ["test-support/**/*.ts", "test-support/prospect-fixtures.ts"]],
    plugins: { vellum },
    rules: { "vellum/prospect-libm-clock-free": "error" },
  },
  {
    name: "Issue #675: the e2e console filter has one roster, and every read goes through it",
    files: ["e2e/**/*.ts"],
    plugins: { vellum },
    rules: { "vellum/e2e-cancellation-roster": "error", "vellum/e2e-console-read-through-drop": "error" },
  },
  {
    name: "Issue #763: no script switches layout at a fixed window width at or below the 1024 floor",
    files: ["src/**/*.ts"],
    plugins: { vellum },
    rules: { "vellum/no-narrow-width": "error" },
  },
);
