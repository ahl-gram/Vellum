import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { ESLint } from "eslint";
import { lintTsRoots } from "../../test-support/lint-roots.ts";
import { WITNESSES } from "../../test-support/lint-witnesses.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const eslint = new ESLint({ cwd: ROOT, flags: ["unstable_native_nodejs_ts_config"] });
const RULE = "vellum/package-import-declared";

const PASS = null;
const PLANT: ReadonlyArray<readonly [string, string | null]> = [
  ['import { parse } from "@eslint/css-tree";', PASS],
  ['import type { Program } from "estree";', PASS],
  ['export type Root = import("estree").Program;', PASS],
  ['import { Linter } from "eslint";', PASS],
  ['import { defineConfig } from "eslint/config";', PASS],
  ['import { zoom } from "d3-zoom";', PASS],
  ['import ts from "typescript";', PASS],
  ['export const loadTs = () => import("typescript");', PASS],
  ['import { readFileSync } from "node:fs";', PASS],
  ['import { join } from "path";', PASS],
  ['import { repoPath } from "./source-shape.ts";', PASS],
  ['import { abs } from "/opt/vellum/abs.ts";', PASS],
  ['import { getCollection } from "astro:content";', PASS],
  ['import { internal } from "#internal";', PASS],
  ["export const lazy = (name: string) => import(name);", PASS],
  ['// import pad from "left-pad";', PASS],
  ['export const named = "left-pad";', PASS],
  ['export { Linter as Lint } from "eslint";', PASS],
  ['import pad from "left-pad";', "left-pad"],
  ['import "left-pad/register";', "left-pad"],
  ['import type { RuleDefinition } from "@eslint/core";', "@eslint/core"],
  ['import { type Node as EsNode } from "estree";', "estree"],
  ['import { type Program as EsProgram, builders } from "estree";', "estree"],
  ['export const loadEstree = () => import("estree");', "estree"],
  ['export * from "left-pad";', "left-pad"],
  ['export type { RuleContext } from "@eslint/core";', "@eslint/core"],
  ['export const loadPad = () => import("left-pad");', "left-pad"],
  ["export const loadPadTemplate = () => import(`left-pad`);", "left-pad"],
  ['export type Pad = typeof import("left-pad");', "left-pad"],
  ['export type { Node as EsNode } from "estree";', PASS],
  ['export type * from "estree";', PASS],
  ['import { tokenize } from "@eslint/css-tree/lib/tokenizer";', PASS],
];
const REPORTED = PLANT.flatMap(([, name], i) => (name === null ? [] : [`${i + 1} ${name}`]));
const BLIND_SPOTS =
  'BLIND SPOTS, declared. Toward passing: a source computed at run time (import(name), a template with an expression); require, createRequire and import.meta.resolve("pkg"), which no file the lint reads uses as a loader (scan, 2026-10-16), and import x = require(...), which the type checker refuses here (TS1294 under erasableSyntaxOnly); a /// <reference types="pkg" /> directive, a comment, none in the roots; a subpath import (#name), which package.json\'s own imports field would map and it has none; every file the lint does not read, outside the roots Issue #653 ruling D bounds (the three configs at the root, the hooks under .claude/, the .astro pages, a sheet\'s @import, and design/, whose spike keeps its own package.json this rule never reads), none of which names a package undeclared against its own manifest today (scan, 2026-10-16); the reverse, a package declared and imported nowhere, which is no import; a bare Node built-in name (punycode, events, buffer, util, url) written in a file Vite bundles for the browser under src/site/, which Vite resolves to an installed npm package of that name where one is hoisted (punycode, pulled in by uri-js and declared nowhere) while the rule reads it as the built-in, none in the roots today. Toward red: a type-only import of a scoped package whose types come from a scoped twin (@types/scope__name), none declared today; a query on a bare package root (pkg?raw), read as part of the name, none today. Each toward-red item is loud and is fixed when it lands';

test("a bare import names a package package.json declares, a type-only import may name its @types twin instead, and a relative, absolute, node:, built-in or scheme source names none (Issue #826)", async () => {
  const [result] = await eslint.lintText(PLANT.map(([line]) => line).join("\n"), {
    filePath: join(ROOT, "scripts/lint/package-imports.ts"),
  });
  assert.deepEqual(
    result!.messages.filter((m) => m.fatal).map((m) => m.message),
    [],
    "the plant does not parse, so no rule read it",
  );
  assert.ok(
    REPORTED.length > 0 && REPORTED.length < PLANT.length,
    "the plant holds no line to refuse or none to pass, so this test cannot tell the rule from its negation",
  );
  assert.deepEqual(
    result!.messages
      .filter((m) => m.ruleId === RULE)
      .map((m) => `${m.line} ${/^(\S+) is imported here/.exec(m.message)?.[1]}`),
    REPORTED,
    BLIND_SPOTS,
  );
});

const resolvedRule = async (file: string): Promise<unknown> =>
  ((await eslint.calculateConfigForFile(file)) as { rules?: Record<string, unknown> }).rules?.[RULE];

test("the rule resolves at error on every TypeScript root the lint reads, at any depth and in a room not yet written, and on no sheet (Issue #826)", async () => {
  const roots = lintTsRoots();
  assert.ok(roots.length > 0, "the lint reads no TypeScript root, so this sweep reads nothing");
  for (const root of roots) {
    const witness = WITNESSES[`${root}/**/*.ts`];
    assert.ok(
      witness !== undefined && existsSync(join(ROOT, witness)),
      `${root} has no existing witness in test-support/lint-witnesses.ts, so the rule's reach there is unpinned`,
    );
    assert.equal(await eslint.isPathIgnored(witness), false, `${witness} is ignored, so ${root} reaches nothing`);
    for (const file of [witness, `${root}/nested/deeper/part.ts`])
      assert.deepEqual(await resolvedRule(file), [2], `${RULE} does not resolve at error on ${file}`);
  }
  assert.deepEqual(
    await resolvedRule("src/site/zz-new-room/part.ts"),
    [2],
    `${RULE} does not reach a room written tomorrow`,
  );
  assert.equal(await resolvedRule(WITNESSES["src/styles/**/*.css"]!), undefined, `${RULE} reaches a sheet`);
});
