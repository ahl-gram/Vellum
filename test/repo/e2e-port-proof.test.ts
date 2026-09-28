import { test } from "node:test";
import assert from "node:assert/strict";
import { compareSources, inTree, movedTo, moveJudge, pairUp } from "../../e2e/port-proof.ts";

const SUITE_BEFORE = "scripts/e2e/suite-x.ts";
const SUITE_AFTER = "e2e/suites/x.ts";
const HEAD_FILES = new Set(["e2e/support/step.ts", "e2e/support/settle.ts", "e2e/support/home.ts", "e2e/support/room.ts", "e2e/harness.ts", "src/cli/raster.ts"]);
const exists = (p: string) => HEAD_FILES.has(p);
const judge = moveJudge(SUITE_BEFORE, SUITE_AFTER, exists);

const BASE = [
  'import { makeStep } from "./step-support.ts";',
  'const RUNNER = join(HERE, "e2e-explorer.ts");',
  "export async function run(ctx) {",
  "  const { evaluate, check } = ctx;",
  "  const r = await evaluate(`(() => { const b = document.querySelector('#map svg'); return { x: 1, y: b ? 2 : 0 }; })()`);",
  "  const s = await ctx.evaluate(READ);",
  '  check("T1 the sheet turns", r.y > 0 && /\\d+/.test(String(s)), `seen ${r.x}`);',
  "}",
].join("\n");
const MOVED = BASE.replace('"./step-support.ts"', '"../support/step.ts"');

const port = (edit: (s: string) => string) => compareSources(BASE, edit(MOVED), judge);
const swap = (from: string, to: string) => (s: string) => {
  assert.ok(s.includes(from), `the fixture has no ${from} to swap, so this case would compare the moved file with itself`);
  return s.replace(from, to);
};

test("a suite moved into the grouped layout, its import re-spelled to reach the same module, is a rename and nothing else", () => {
  assert.notEqual(MOVED, BASE, "the fixture's move changed no specifier, so this case proves nothing");
  const got = port((s) => s);
  assert.deepEqual(got.renames, ['"./step-support.ts" -> "../support/step.ts"']);
  assert.deepEqual(got.edits, []);
  assert.equal(got.literalDiffs, 0);
  assert.equal(got.tokens[0], got.tokens[1]);
  assert.ok(got.tokens[0] > 60, `read only ${got.tokens[0]} tokens, so the fixture is not being parsed`);
  assert.equal(got.literals[0], 7, "the fixture's literals were not all counted: the specifier, the runner name, the evaluate template, the check name, the regex, and the detail template's head and tail");
});

test("a folder part's specifiers to a support module and to the harness, each climbing one level further, are renames", () => {
  const before = 'import { stage } from "../home-support.ts";\nimport { start } from "../harness.ts";\nexport const k = stage(start);';
  const after = 'import { stage } from "../../support/home.ts";\nimport { start } from "../../harness.ts";\nexport const k = stage(start);';
  const got = compareSources(before, after, moveJudge("scripts/e2e/home/kit.ts", "e2e/suites/home/kit.ts", exists));
  assert.deepEqual(got.renames, ['"../home-support.ts" -> "../../support/home.ts"', '"../harness.ts" -> "../../harness.ts"']);
  assert.deepEqual(got.edits, []);
  const wrong = compareSources(before, after.replace("support/home.ts", "support/room.ts"), moveJudge("scripts/e2e/home/kit.ts", "e2e/suites/home/kit.ts", exists));
  assert.equal(wrong.edits.length, 1, "a specifier re-spelled to reach a different moved module was not an edit");
});

test("a relative specifier whose text did not change is still judged by what it reaches, so a file moved to a new depth that kept its text is an edit", () => {
  const before = 'import { findBrowser } from "../../src/cli/raster.ts";\nexport const b = findBrowser();';
  const kept = compareSources(before, before, moveJudge("scripts/e2e/harness.ts", "e2e/harness.ts", exists));
  assert.equal(kept.edits.length, 1, "the unchanged text now climbs out of the repo, and it read as the same module");
  const fixed = compareSources(before, before.replace("../../src/", "../src/"), moveJudge("scripts/e2e/harness.ts", "e2e/harness.ts", exists));
  assert.deepEqual(fixed.edits, []);
  assert.deepEqual(fixed.renames, ['"../../src/cli/raster.ts" -> "../src/cli/raster.ts"']);
});

test("types, casts, non-null assertions, type arguments, type-only imports and comments are invisible", () => {
  const typed = [
    'import type { SuiteContext } from "../types.ts";',
    'import { makeStep } from "../support/step.ts";',
    "type Shape = { x: number; y: number };",
    'const RUNNER = join(HERE, "e2e-explorer.ts");',
    "// a comment the port added",
    "export async function run(ctx: SuiteContext): Promise<void> {",
    "  const { evaluate, check } = ctx;",
    "  const r = await evaluate<Shape>(`(() => { const b = document.querySelector('#map svg'); return { x: 1, y: b ? 2 : 0 }; })()`);",
    "  const s = await ctx.evaluate(READ as Payload<number>)!;",
    '  check("T1 the sheet turns", r.y > 0 && /\\d+/.test(String(s)), `seen ${r.x}`);',
    "}",
  ].join("\n");
  const got = compareSources(BASE, typed, judge);
  assert.deepEqual(got.edits, [], JSON.stringify(got.edits));
  assert.equal(got.literalDiffs, 0);
  assert.deepEqual(got.renames, ['"./step-support.ts" -> "../support/step.ts"']);
});

const EDITS: [string, string, string, boolean][] = [
  ["a changed identifier", "r.y > 0", "r.top > 0", false],
  ["a changed string", '"T1 the sheet turns"', '"T1 the sheet turned"', true],
  ["a changed template part", "return { x: 1,", "return { x: 2,", true],
  ["a changed interpolation", "`seen ${r.x}`", "`seen ${r.y}`", false],
  ["a changed regex", "/\\d+/", "/d+/", true],
  ["a runner renamed in a string that is not an import", '"e2e-explorer.ts"', '"run.ts"', true],
  ["a specifier re-spelled to reach a different moved module", '"../support/step.ts"', '"../support/settle.ts"', true],
  ["a specifier re-spelled to reach a module that does not exist", '"../support/step.ts"', '"../support/steps.ts"', true],
  ["a specifier left at its old spelling", '"../support/step.ts"', '"./step-support.ts"', false],
];
const STEP_RENAME = '"./step-support.ts" -> "../support/step.ts"';
for (const [name, from, to, literal] of EDITS) {
  test(`${name} is a runtime edit, never a rename`, () => {
    const got = port(swap(from, to));
    assert.equal(got.edits.length, 1, `want one runtime edit, got ${JSON.stringify(got.edits)}`);
    assert.deepEqual(got.renames, from.includes("support/step") ? [] : [STEP_RENAME], "a runtime edit was classed as a rename, or the untouched specifier's rename was lost");
    assert.equal(got.literalDiffs, literal ? 1 : 0);
  });
}

test("a bare specifier compares as text, never by resolution", () => {
  const got = compareSources('import { a } from "node:fs";', 'import { a } from "node:path";', () => true);
  assert.equal(got.edits.length, 1);
  assert.deepEqual(got.renames, []);
});

test("a line break that changes the syntax tree with the same tokens is an edit, and one that does not is invisible", () => {
  const before = "function f(a, b) {\n  return a && b.c;\n}";
  const asi = compareSources(before, "function f(a, b) {\n  return\n    a && b.c;\n}", judge);
  assert.equal(asi.tokens[0], asi.tokens[1], "the fixture should keep every token and change only the tree");
  assert.ok(asi.edits.length > 0, "a return split from its value (a semicolon inserted, the value never returned) was not reported");
  const reflow = compareSources(before, "function f(a, b) {\n  return a &&\n    b.c;\n}", judge);
  assert.deepEqual(reflow.edits, []);
});

test("a reordered statement is an edit", () => {
  const lines = MOVED.split("\n");
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
  const before = 'const h = await import("./e2e/harness.ts");\nexport { start } from "./e2e/harness.ts";';
  const after = 'const h = await import("./harness.ts");\nexport { start } from "./harness.ts";';
  const got = compareSources(before, after, moveJudge("scripts/e2e-explorer.ts", "e2e/run.ts", exists));
  assert.equal(got.renames.length, 2);
  assert.deepEqual(got.edits, []);
});

const LAYOUT: [string, string][] = [
  ["scripts/e2e-explorer.ts", "e2e/run.ts"],
  ["scripts/e2e-lanes.ts", "e2e/lanes.ts"],
  ["scripts/e2e-port-proof.ts", "e2e/port-proof.ts"],
  ["scripts/e2e-split-proof.ts", "e2e/split-proof.ts"],
  ["scripts/e2e/harness.ts", "e2e/harness.ts"],
  ["scripts/e2e/types.ts", "e2e/types.ts"],
  ["scripts/e2e/site-server.ts", "e2e/site-server.ts"],
  ["scripts/e2e/step-support.ts", "e2e/support/step.ts"],
  ["scripts/e2e/suite-zoom-gestures.ts", "e2e/suites/zoom-gestures.ts"],
  ["scripts/e2e/chart-drawer/reads.ts", "e2e/suites/chart-drawer/reads.ts"],
  ["scripts/e2e/zoom/deep/checks.ts", "e2e/suites/zoom/deep/checks.ts"],
  ["src/cli/e2e-lanes.ts", "e2e/support/lanes.ts"],
  ["src/cli/browser-policy.ts", "e2e/support/browser-policy.ts"],
  ["test/cli/e2e-suites.test.ts", "test/e2e/suites.test.ts"],
  ["test/cli/browser-policy.test.ts", "test/e2e/browser-policy.test.ts"],
  ["e2e/suites/home/kit.ts", "e2e/suites/home/kit.ts"],
  ["e2e/support/step.ts", "e2e/support/step.ts"],
  ["test/e2e/lanes.test.ts", "test/e2e/lanes.test.ts"],
];
const OUTSIDE = ["scripts/build-og.ts", "scripts/lint/css-comment-form.ts", "src/cli/main.ts", "src/cli/raster.ts", "test/cli/main.test.ts", "test/repo/e2e-tiers.test.ts", "scripts/e2e/other.ts", "scripts/e2e/x/left.mjs"];

test("the ruled layout sends each kind of e2e file to its home, keeps a file already there, and claims nothing else (Issue #679)", () => {
  for (const [from, to] of LAYOUT) assert.equal(movedTo(from), to, from);
  for (const path of OUTSIDE) assert.equal(movedTo(path), null, path);
});

test("the tree the proof reads is every e2e file in either layout, and a file in it that no rule places is reported rather than dropped", () => {
  for (const [from] of LAYOUT) assert.ok(inTree(from), from);
  for (const path of ["scripts/e2e/other.ts", "scripts/e2e/x/left.mjs"]) assert.ok(inTree(path), path);
  for (const path of ["scripts/build-og.ts", "scripts/lint/css-comment-form.ts", "src/cli/main.ts", "test/cli/main.test.ts", "test/repo/e2e-tiers.test.ts"]) assert.equal(inTree(path), false, path);
  const got = pairUp(["scripts/e2e/other.ts", "scripts/e2e/harness.ts"], ["e2e/harness.ts"]);
  assert.deepEqual(got.unmapped, ["scripts/e2e/other.ts"]);
  assert.deepEqual(got.pairs, [["scripts/e2e/harness.ts", "e2e/harness.ts"]]);
});

const OLD_LAYOUT = [
  "scripts/e2e-explorer.ts", "scripts/e2e-lanes.ts", "scripts/e2e-split-proof.ts",
  "scripts/e2e/harness.ts", "scripts/e2e/types.ts", "scripts/e2e/site-server.ts",
  "scripts/e2e/home-support.ts", "scripts/e2e/room-support.ts", "scripts/e2e/step-support.ts",
  "scripts/e2e/suite-home.ts", "scripts/e2e/suite-zoom.ts", "scripts/e2e/suite-zoom-gestures.ts",
  "scripts/e2e/home/kit.ts", "scripts/e2e/home/reads.ts", "scripts/e2e/zoom/kit.ts", "scripts/e2e/zoom/reads.ts",
  "src/cli/e2e-lanes.ts", "src/cli/e2e-suites.ts", "src/cli/browser-policy.ts",
  "test/cli/e2e-lanes.test.ts", "test/cli/e2e-suites.test.ts", "test/cli/browser-policy.test.ts",
];

test("no two files of the old layout land on one path, so every pair the proof compares is one file before and after", () => {
  const targets = OLD_LAYOUT.map(movedTo);
  assert.ok(targets.every((t) => t !== null), `a file of the old layout has no rule: ${OLD_LAYOUT.filter((p) => movedTo(p) === null).join(", ")}`);
  assert.equal(new Set(targets).size, OLD_LAYOUT.length, "two files of the old layout move to one path");
});

test("pairing reports a file whose target is absent as gone, a head file no base reaches as new, and two bases on one target as a failure", () => {
  const got = pairUp(["scripts/e2e/suite-home.ts", "scripts/e2e/suite-zoom.ts"], ["e2e/suites/home.ts", "e2e/suites/extra.ts"]);
  assert.deepEqual(got.pairs, [["scripts/e2e/suite-home.ts", "e2e/suites/home.ts"]]);
  assert.deepEqual(got.gone, ["scripts/e2e/suite-zoom.ts"]);
  assert.deepEqual(got.added, ["e2e/suites/extra.ts"]);
  assert.throws(() => pairUp(["scripts/e2e/harness.ts", "e2e/harness.ts"], ["e2e/harness.ts"]), /both move to e2e\/harness\.ts/);
});
