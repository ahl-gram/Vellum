import { test } from "node:test";
import assert from "node:assert/strict";
import { join, resolve } from "node:path";
import { ESLint } from "eslint";

const ROOT = resolve(import.meta.dirname, "..", "..");
const eslint = new ESLint({ cwd: ROOT, flags: ["unstable_native_nodejs_ts_config"] });
const RULE = "vellum/param-excuse-holds-element";

test("a parameter bearing a name no-param-reassign excuses holds a page element, an element-shaped type or a record of read-only page elements, and nothing else (Alex, 2026-09-26, Issue #654 rulings 4 and 5)", async () => {
  const plant = [
    "export function a(statusEl: HTMLElement | null): void { void statusEl; }",
    "export function b(statusEl: { n: number }): void { void statusEl; }",
    "export function c(roomEls: { readonly a: HTMLElement }): void { void roomEls; }",
    "export function d(roomEls: { a: HTMLElement }): void { void roomEls; }",
    "export function e(mapEl: HTMLElement & { n: number }): void { void mapEl; }",
    "export function f(pillEl: { value: string }): void { void pillEl; }",
    "export function g(noteEl: object): void { void noteEl; }",
    "export function h({ mapEl }: { mapEl: HTMLElement }): void { void mapEl; }",
    "export function i(other: { n: number }): void { void other; }",
    "export function j(slipEl: { readonly a: HTMLElement; [k: string]: HTMLElement }): void { void slipEl; }",
    "export function k(targetEl: { readonly a: HTMLElement | null }): void { void targetEl; }",
    "export function l(viewportEl: { id: string; n?: number }): void { void viewportEl; }",
    "export const m = (statusEl: { n: number }): void => { void statusEl; };",
    "export function n(statusEl: { n: number } = { n: 1 }): void { void statusEl; }",
  ];
  const [result] = await eslint.lintText(plant.join("\n"), { filePath: join(ROOT, "src/site/home/veil.ts") });
  assert.deepEqual(
    result!.messages.filter((m) => m.fatal).map((m) => m.message),
    [],
    "the plant does not parse, so no rule read it",
  );
  assert.deepEqual(
    result!.messages.filter((m) => m.ruleId === RULE).map((m) => m.line),
    [2, 4, 5, 7, 10, 12, 13, 14],
    "DECLARED, with their directions: an element-shaped type is one a DOM input element satisfies whose every member an input element also carries, so any record made only of such members ({ value: string }) passes, erring toward passing, a handbook/errata/guards.md row; a type with no members at all (object, {}) and a type parameter constrained to an element (T extends HTMLElement) fail, erring toward failing",
  );
});

test("the rule is handed exactly the names no-param-reassign excuses, so the two cannot drift apart", async () => {
  const rules = (
    (await eslint.calculateConfigForFile(join(ROOT, "src/site/home/veil.ts"))) as {
      rules?: Record<string, unknown>;
    }
  ).rules;
  const excused = (rules?.["no-param-reassign"] as [number, { ignorePropertyModificationsFor: string[] }])[1];
  const handed = (rules?.[RULE] as [number, { names: string[] }])[1];
  assert.deepEqual(handed.names, excused.ignorePropertyModificationsFor);
});
