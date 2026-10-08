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
import e2eScriptsOff from "./scripts/lint/e2e-scripts-off.ts";
import importBounds from "./scripts/lint/import-bounds.ts";
import siteShape from "./scripts/lint/site-shape.ts";
import paramExcuse from "./scripts/lint/param-excuse.ts";
import commentCitation from "./scripts/lint/comment-citation.ts";
import splitArguments, { OLDER_CALLS, SPLIT_FILES } from "./scripts/lint/split-arguments.ts";

const vellum = { meta: cssCommentForm.meta, rules: { ...cssCommentForm.rules, ...tsCommentForm.rules, ...sourceShape.rules, ...errorCast.rules, ...narrowWidth.rules, ...e2eScriptsOff.rules, ...importBounds.rules, ...siteShape.rules, ...paramExcuse.rules, ...commentCitation.rules, ...splitArguments.rules } };
const TS_ROOTS = ["e2e/**/*.ts", "scripts/**/*.ts", "src/**/*.ts", "test/**/*.ts", "test-support/**/*.ts"];
const PAGE_ELEMENT_PARAMETERS = ["drawerEls", "ghostEl", "innerEl", "legendEl", "logEls", "mapEl", "noteEl", "pillEl", "roomEls", "sheetEl", "slipEl", "statusEl", "targetEl", "viewportEl"];
const site = (...paths: string[]): string[][] => paths.map((path) => ["src/**/*.ts", path]);
const HOME_PURE = ["drift.ts", "station-flight.ts", "stations.ts", "camera.ts", "ceremony.ts", "coords.ts", "valve.ts"];
const PURE_MESSAGE = "a pure module of home reads no document, no window and no global object they hang from: app.ts owns the page, and these run under node --test (Issue #458)";

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
      "max-lines": ["error", { max: 400, skipBlankLines: true, skipComments: true }],
      "max-lines-per-function": ["error", { max: 50, skipBlankLines: true, skipComments: true }],
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-param-reassign": ["error", { props: true, ignorePropertyModificationsFor: PAGE_ELEMENT_PARAMETERS }],
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
      "vellum/css-comment-citation-resolves": "error",
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
      "vellum/ts-comment-citation-resolves": "error",
      "vellum/param-excuse-holds-element": ["error", { names: PAGE_ELEMENT_PARAMETERS }],
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
    rules: {
      "vellum/worker-spawn-static": "error",
      "vellum/contents-row-builder-only": "error",
      "vellum/prospect-item-through-builder": "error",
    },
  },
  {
    name: "the house's rules on world generation",
    files: site("src/world/**", "src/society/**", "src/hydrology/**", "src/core/**", "src/terrain/**", "src/climate/**", "src/noise/**"),
    plugins: { vellum },
    rules: { "vellum/world-no-philology": "error" },
  },
  {
    name: "Issue #124: the philologist's glass",
    files: site("src/society/philology.ts"),
    plugins: { vellum },
    rules: { "vellum/philology-no-entropy": "error" },
  },
  {
    name: "the house's rules on home's modules",
    files: site("src/site/home/**"),
    plugins: { vellum },
    rules: { "vellum/home-client-no-engine": "error" },
  },
  {
    name: "Issue #458: home's pure modules",
    files: site(...HOME_PURE.map((file) => `src/site/home/${file}`)),
    rules: {
      "no-restricted-globals": [
        "error",
        ...["document", "window", "globalThis", "self"].map((name) => ({ name, message: PURE_MESSAGE })),
      ],
      "no-restricted-properties": [
        "error",
        ...["document", "window"].map((property) => ({ property, message: PURE_MESSAGE })),
      ],
    },
  },
  {
    name: "the house's rules on the Hunt's modules",
    files: site("src/site/seed-of-the-day/**"),
    plugins: { vellum },
    rules: { "vellum/hunt-fixed-world": "error" },
  },
  {
    name: "the house's rules on the chart rooms' modules",
    files: site("src/site/reading-room/**", "src/site/reading-frame/**", "src/site/print-room/**", "src/site/prospect/**", "src/site/ribbon/**"),
    plugins: { vellum },
    rules: { "vellum/room-no-scroll": "error" },
  },
  {
    name: "Issue #311: the prospect stage",
    files: site("src/site/reading-room/prospect-stage.ts"),
    plugins: { vellum },
    rules: { "vellum/stage-no-status": "error" },
  },
  {
    name: "Issue #654: the split builders",
    files: site(...SPLIT_FILES),
    plugins: { vellum },
    rules: { "vellum/split-arguments-by-name": ["error", { excused: OLDER_CALLS }] },
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
    name: "the house's rules on every e2e script",
    files: ["e2e/**/*.ts"],
    plugins: { vellum },
    rules: { "vellum/e2e-cancellation-roster": "error", "vellum/e2e-console-read-through-drop": "error", "vellum/e2e-scripts-off-through-helper": "error" },
  },
  {
    name: "Issue #763: no script switches layout at a fixed window width at or below the 1024 floor",
    files: ["src/**/*.ts"],
    plugins: { vellum },
    rules: { "vellum/no-narrow-width": "error" },
  },
);
