import { test } from "node:test";
import assert from "node:assert/strict";
import { compareSources } from "../../scripts/e2e-port-proof.ts";

const MOVED = new Set(["./step-support", "./e2e/harness"]);
const movedToTs = (specifier: string) => MOVED.has(specifier.replace(/\.ts$/, ""));

const BASE = [
  'import { makeStep } from "./step-support.mjs";',
  'const RUNNER = join(HERE, "e2e-explorer.mjs");',
  "export async function run(ctx) {",
  "  const { evaluate, check } = ctx;",
  "  const r = await evaluate(`(() => { const b = document.querySelector('#map svg'); return { x: 1, y: b ? 2 : 0 }; })()`);",
  "  const s = await ctx.evaluate(READ);",
  '  check("T1 the sheet turns", r.y > 0 && /\\d+/.test(String(s)), `seen ${r.x}`);',
  "}",
].join("\n");

const port = (edit: (s: string) => string, isTs = true) => compareSources(BASE, edit(BASE), isTs, movedToTs);
const swap = (from: string, to: string) => (s: string) => {
  assert.ok(s.includes(from), `the fixture has no ${from} to swap, so this case would compare the base with itself`);
  return s.replace(from, to);
};

test("a file unchanged but for the moved import's specifier is a rename and nothing else", () => {
  const got = port(swap('"./step-support.mjs"', '"./step-support.ts"'));
  assert.deepEqual(got.renames, ['"./step-support.mjs" -> "./step-support.ts"']);
  assert.deepEqual(got.edits, []);
  assert.equal(got.literalDiffs, 0);
  assert.equal(got.tokens[0], got.tokens[1]);
  assert.ok(got.tokens[0] > 60, `read only ${got.tokens[0]} tokens, so the fixture is not being parsed`);
  assert.equal(got.literals[0], 7, "the fixture's literals were not all counted: the specifier, the runner name, the evaluate template, the check name, the regex, and the detail template's head and tail");
});

test("types, casts, non-null assertions, type arguments, type-only imports and comments are invisible", () => {
  const typed = [
    'import type { SuiteContext } from "./types.ts";',
    'import { makeStep } from "./step-support.ts";',
    "type Shape = { x: number; y: number };",
    'const RUNNER = join(HERE, "e2e-explorer.mjs");',
    "// a comment the port added",
    "export async function run(ctx: SuiteContext): Promise<void> {",
    "  const { evaluate, check } = ctx;",
    "  const r = await evaluate<Shape>(`(() => { const b = document.querySelector('#map svg'); return { x: 1, y: b ? 2 : 0 }; })()`);",
    "  const s = await ctx.evaluate(READ as Payload<number>)!;",
    '  check("T1 the sheet turns", r.y > 0 && /\\d+/.test(String(s)), `seen ${r.x}`);',
    "}",
  ].join("\n");
  const got = compareSources(BASE, typed, true, movedToTs);
  assert.deepEqual(got.edits, [], JSON.stringify(got.edits));
  assert.equal(got.literalDiffs, 0);
  assert.deepEqual(got.renames, ['"./step-support.mjs" -> "./step-support.ts"']);
});

const EDITS: [string, string, string, boolean][] = [
  ["a changed identifier", "r.y > 0", "r.top > 0", false],
  ["a changed string", '"T1 the sheet turns"', '"T1 the sheet turned"', true],
  ["a changed template part", "return { x: 1,", "return { x: 2,", true],
  ["a changed interpolation", "`seen ${r.x}`", "`seen ${r.y}`", false],
  ["a changed regex", "/\\d+/", "/d+/", true],
  ["a .mjs to .ts rename in a string that is not an import", '"e2e-explorer.mjs"', '"e2e-explorer.ts"', true],
  ["a rename to a different module", '"./step-support.mjs"', '"./settle-support.ts"', true],
  ["a rename to a module that did not move", '"./step-support.mjs"', '"./step-support.js"', true],
];
for (const [name, from, to, literal] of EDITS) {
  test(`${name} is a runtime edit, never a rename`, () => {
    const got = port(swap(from, to));
    assert.equal(got.edits.length, 1, `want one runtime edit, got ${JSON.stringify(got.edits)}`);
    assert.deepEqual(got.renames, [], "a runtime edit was classed as a rename");
    assert.equal(got.literalDiffs, literal ? 1 : 0);
  });
}

test("a specifier to a module that does not exist as .ts is an edit, even when its stem matches", () => {
  const got = compareSources(BASE, BASE.replace('"./step-support.mjs"', '"./step-support.ts"'), true, () => false);
  assert.equal(got.edits.length, 1);
  assert.deepEqual(got.renames, []);
});

test("a reordered statement is an edit", () => {
  const lines = BASE.split("\n");
  const reordered = [lines[0], lines[1], lines[2], lines[3], lines[5], lines[4], lines[6], lines[7]].join("\n");
  assert.ok(port(() => reordered).edits.length > 0);
});

test("evaluate payloads are counted through a destructured and a member call, and a changed one is counted as changed", () => {
  const same = port((s) => s);
  assert.deepEqual(same.payloads, [2, 2]);
  assert.equal(same.payloadDiffs, 0);
  assert.equal(port(swap("(READ)", "(OTHER)")).payloadDiffs, 1);
});

test("dynamic imports and re-exports of a moved module are renames too", () => {
  const before = 'const h = await import("./e2e/harness.mjs");\nexport { start } from "./e2e/harness.mjs";';
  const after = 'const h = await import("./e2e/harness.ts");\nexport { start } from "./e2e/harness.ts";';
  const got = compareSources(before, after, true, movedToTs);
  assert.equal(got.renames.length, 2);
  assert.deepEqual(got.edits, []);
});
