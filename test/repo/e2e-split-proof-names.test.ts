import { test } from "node:test";
import assert from "node:assert/strict";
import { compareFamilies } from "../../e2e/split-proof.ts";
import {
  files,
  inGroups,
  split,
  SPLIT_GROUPS,
  SPLIT_RUN,
  swapped,
  verdict,
} from "../../test-support/e2e-split-proof-fixtures.ts";

test("a group handed a different value than its parameter names reads as a difference: a wrong name, a literal, or two arguments swapped", () => {
  assert.equal(
    split(swapped(SPLIT_RUN, "() => m3Stays(k, laid));", "() => m3Stays(k, null));"), SPLIT_GROUPS).same,
    false,
  );
  assert.equal(
    split(swapped(SPLIT_RUN, "() => m3Stays(k, laid));", "() => m3Stays(k, settle));"), SPLIT_GROUPS).same,
    false,
  );
  assert.equal(
    split(swapped(SPLIT_RUN, "() => m3Stays(k, laid));", "() => m3Stays(k, { laid: null }));"), SPLIT_GROUPS).same,
    false,
  );
  assert.equal(
    split(
      swapped(SPLIT_RUN, "() => m3Stays(k, laid));", 'async () => { await m3Stays(k, laid, go("x")); });'),
      SPLIT_GROUPS,
    ).same,
    false,
  );
  assert.equal(split(swapped(SPLIT_RUN, "await desktop(k);", "await desktop(null);"), SPLIT_GROUPS).same, false);
  const before = [
    "export async function start({ consoleErrors, http4xx }) {",
    '  ws.addEventListener("message", (ev) => {',
    "    consoleErrors.push(ev.a);",
    "    http4xx.push(ev.b);",
    "  });",
    "}",
  ].join("\n");
  const after = (args: string) =>
    [
      `function onMessage(ev, consoleErrors, http4xx) {`,
      "  consoleErrors.push(ev.a);",
      "  http4xx.push(ev.b);",
      "}",
      "export async function start({ consoleErrors, http4xx }) {",
      `  ws.addEventListener("message", (ev) => onMessage(${args}));`,
      "}",
    ].join("\n");
  assert.equal(compareFamilies(files(before), files(after("ev, consoleErrors, http4xx"))).same, true);
  assert.equal(compareFamilies(files(before), files(after("ev, http4xx, consoleErrors"))).same, false);
  assert.equal(compareFamilies(files(before), files(after("ev, [], http4xx"))).same, false);
});

test("a group that hands back a different value than the name its caller binds reads as a difference", () => {
  assert.equal(inGroups("  return laid;\n}", "  return null;\n}").same, false);
  assert.equal(inGroups("  return laid;\n}", "  return { laid };\n}").same, false);
  assert.equal(inGroups("  return laid;\n}", "  return { ...laid };\n}").same, false);
  const before = [
    "export async function run(ctx) {",
    "  const { evaluate, check } = ctx;",
    "  const wide = await evaluate(`1`);",
    "  const tall = await evaluate(`2`);",
    '  check("B2 wider", wide > tall);',
    "}",
  ].join("\n");
  const after = (ret: string) =>
    [
      "export async function run(ctx) {",
      "  const { check } = ctx;",
      "  const [wide, tall] = await b1Reads(ctx);",
      '  check("B2 wider", wide > tall);',
      "}",
      "async function b1Reads({ evaluate }) {",
      "  const wide = await evaluate(`1`);",
      "  const tall = await evaluate(`2`);",
      `  return ${ret};`,
      "}",
    ].join("\n");
  assert.equal(compareFamilies(files(before), files(after("[wide, tall]"))).same, true);
  assert.equal(compareFamilies(files(before), files(after("[tall, wide]"))).same, false);
  assert.equal(compareFamilies(files(before), files(after("[1500, 900]"))).same, false);
});

test("an import bound to a different module or a different export reads as a difference, and one moved into a part file does not", () => {
  const before = [
    'import { settleFast as settle } from "./settle-support.ts";',
    "export async function run(ctx) {",
    "  await settle(ctx);",
    "}",
  ].join("\n");
  const aliased = swapped(before, "settleFast as settle", "settleSlow as settle");
  const moved = swapped(before, "./settle-support.ts", "./other-support.ts");
  assert.equal(compareFamilies(files(before), files(aliased)).same, false);
  assert.equal(compareFamilies(files(before), files(moved)).same, false);
  const run = [
    'import { go } from "./map/part1.ts";',
    "export async function run(ctx) {",
    "  await go(ctx);",
    "}",
  ].join("\n");
  const part = [
    'import { settleFast as settle } from "../settle-support.ts";',
    "export async function go(ctx) {",
    "  await settle(ctx);",
    "}",
  ].join("\n");
  assert.equal(compareFamilies(files(before), files(run, part)).same, true);
  assert.equal(
    compareFamilies(files(before), files(run, swapped(part, "../settle-support.ts", "./settle-support.ts"))).same,
    false,
  );
});

function checkNamedRenames(before: string, part: string, run: (wiring: string) => string): void {
  assert.equal(
    compareFamilies(files(before), files(run('import { x1One, x2Two } from "./map/part1.ts";'), part)).same,
    true,
  );
  assert.equal(
    compareFamilies(files(before), files(run('import { x2Two as x1One, x1One as x2Two } from "./map/part1.ts";'), part))
      .same,
    false,
  );
  const unexported = swapped(
    swapped(part, "export async function x1One", "async function x1One"),
    "export async function x2Two",
    "async function x2Two",
  );
  assert.equal(
    compareFamilies(
      files(before),
      files(
        run('import { x1One, x2Two } from "./map/part1.ts";'),
        `${unexported}\nexport { x2Two as x1One, x1One as x2Two };`,
      ),
    ).same,
    false,
  );
}

function checkRelayRenames(before: string, part: string): void {
  const relay = (wiring: string) =>
    [wiring, "export async function both(ctx) {", "  await x1One(ctx);", "  await x2Two(ctx);", "}"].join("\n");
  const viaRelay = [
    'import { both } from "./map/part2.ts";',
    "export async function run(ctx) {",
    "  await both(ctx);",
    "}",
  ].join("\n");
  assert.equal(
    compareFamilies(files(before), files(viaRelay, part, relay('import { x1One, x2Two } from "./part1.ts";'))).same,
    true,
  );
  assert.equal(
    compareFamilies(
      files(before),
      files(viaRelay, part, relay('import { x2Two as x1One, x1One as x2Two } from "./part1.ts";')),
    ).same,
    false,
  );
}

function checkDefaultRenames(before: string, run: (wiring: string) => string): { one: string; two: string } {
  const one = [
    "export default async function x1One({ check, sleep }) {",
    "  await sleep(1);",
    '  check("X1 one", true);',
    "}",
  ].join("\n");
  const two = [
    "export default async function x2Two({ check, sleep }) {",
    "  await sleep(2);",
    '  check("X2 two", true);',
    "}",
  ].join("\n");
  assert.equal(
    compareFamilies(
      files(before),
      files(run('import x1One from "./map/part2.ts";\nimport x2Two from "./map/part1.ts";'), one, two),
    ).same,
    false,
  );
  assert.equal(
    compareFamilies(
      files(before),
      files(
        run('import { x1One, x2Two } from "./map/part1.ts";'),
        'import x1One from "./part2.ts";\nimport x2Two from "./part3.ts";\nexport { x1One, x2Two };',
        two,
        one,
      ),
    ).same,
    false,
  );
  return { one, two };
}

function checkDefaultReports(
  before: string,
  part: string,
  run: (wiring: string) => string,
  one: string,
  two: string,
): void {
  const defaultImportOnly = compareFamilies(
    files(before),
    files(run('import x1One from "./map/part1.ts";\nimport { x2Two } from "./map/part1.ts";'), part),
  ).lines;
  assert.ok(
    defaultImportOnly.includes("e2e/suites/map.ts imports a default as x1One inside the family"),
    defaultImportOnly.join("\n"),
  );
  assert.ok(
    !defaultImportOnly.some((l) => l.includes("exports a default")),
    "the default-import fixture carries no default export, so only the import can be reported",
  );
  const defaultExportOnly = compareFamilies(
    files(before),
    files(
      run('import { x1One, x2Two } from "./map/part1.ts";'),
      `${one.replace("export default ", "export ")}\n${two}`,
    ),
  ).lines;
  assert.ok(
    defaultExportOnly.includes("e2e/suites/map/part1.ts exports a default inside the family"),
    defaultExportOnly.join("\n"),
  );
  assert.ok(
    !defaultExportOnly.some((l) => l.includes("imports a default")),
    "the default-export fixture carries no default import, so only the export can be reported",
  );
  const assigned = compareFamilies(
    files(before),
    files(run('import { x1One, x2Two } from "./map/part1.ts";'), `${part}\nexport default x1One;`),
  ).lines;
  assert.ok(assigned.includes("e2e/suites/map/part1.ts exports a default inside the family"), assigned.join("\n"));
}

test("an import or an export inside the family that renames a name reads as a difference, since the proof finds a function the split made by its declared name", () => {
  const before = [
    "export async function run(ctx) {",
    "  const { check, sleep } = ctx;",
    "  await sleep(1);",
    '  check("X1 one", true);',
    "  await sleep(2);",
    '  check("X2 two", true);',
    "}",
  ].join("\n");
  const part = [
    "export async function x1One({ check, sleep }) {",
    "  await sleep(1);",
    '  check("X1 one", true);',
    "}",
    "export async function x2Two({ check, sleep }) {",
    "  await sleep(2);",
    '  check("X2 two", true);',
    "}",
  ].join("\n");
  const run = (wiring: string) =>
    [wiring, "export async function run(ctx) {", "  await x1One(ctx);", "  await x2Two(ctx);", "}"].join("\n");
  checkNamedRenames(before, part, run);
  checkRelayRenames(before, part);
  const { one, two } = checkDefaultRenames(before, run);
  checkDefaultReports(before, part, run, one, two);
});

test("a function only the split declares is read through at every call, so one that stands in for a context member reads as a difference", () => {
  const kit = swapped(
    SPLIT_GROUPS,
    "  return { ...base, go };",
    "  const settle = (script, pred, label, budget) => base.settle(script, pred, label, budget * 10);\n  return { ...base, go, settle };",
  );
  assert.equal(split(SPLIT_RUN, kit).same, false);
  const noWait = swapped(
    SPLIT_GROUPS,
    "export async function m2Lays({ evaluate, waitSettled }) {",
    "async function waitSettled(label) {\n}\nexport async function m2Lays({ evaluate }) {",
  );
  assert.equal(split(SPLIT_RUN, noWait).same, false);
  const before = [
    "export async function run(ctx) {",
    "  const { evaluate, waitSettled, onDone } = ctx;",
    "  await evaluate(`1`);",
    '  await waitSettled("m2");',
    "  await evaluate(`2`).then(onDone);",
    "}",
  ].join("\n");
  const once = [
    "async function waitSettled(evaluate) {",
    "  await evaluate(`1`);",
    "}",
    "export async function run(ctx) {",
    "  const { evaluate, onDone } = ctx;",
    "  await waitSettled(evaluate);",
    '  await waitSettled("m2");',
    "  await evaluate(`2`).then(onDone);",
    "}",
  ].join("\n");
  assert.deepEqual(compareFamilies(files(before), files(once)).lines, [
    'a call to waitSettled, a function the split made, is not read through: waitSettled ( "m2" )',
  ]);
  const byValue = [
    "function onDone(v) {}",
    "export async function run(ctx) {",
    "  const { evaluate, waitSettled } = ctx;",
    "  await evaluate(`1`);",
    '  await waitSettled("m2");',
    "  await evaluate(`2`).then(onDone);",
    "}",
  ].join("\n");
  assert.deepEqual(compareFamilies(files(before), files(byValue)).lines, [
    "onDone, a function the split made, is never read through",
  ]);
});

test("a function declared twice in the split is a difference, whichever copy a call would reach", () => {
  const start = SPLIT_GROUPS.indexOf("export async function m1Draws(");
  const end = SPLIT_GROUPS.indexOf("export async function m2Lays(");
  assert.ok(start >= 0 && end > start, "the fixture no longer carries m1Draws before m2Lays");
  const faithful = SPLIT_GROUPS.slice(start, end);
  assert.equal(verdict([SPLIT_RUN, swapped(SPLIT_GROUPS, "g.n === 1, JSON", "g.n === 2, JSON"), faithful]).same, false);
});

test("an async function the split made, called without await where the base awaited its body, is a difference", () => {
  assert.equal(split(swapped(SPLIT_RUN, "  await desktop(k);", "  desktop(k);"), SPLIT_GROUPS).same, false);
  assert.equal(split(swapped(SPLIT_RUN, "laid = await m2Lays(k);", "laid = m2Lays(k);"), SPLIT_GROUPS).same, false);
  const before = [
    "export async function run(ctx) {",
    "  const { evaluate, check } = ctx;",
    "  const g = await evaluate(`1`);",
    '  check("A1", g > 0);',
    "}",
  ].join("\n");
  const declared = (call: string) =>
    [
      `async function a1Reads({ evaluate }) {`,
      "  const g = await evaluate(`1`);",
      "  return g;",
      "}",
      "export async function run(ctx) {",
      "  const { check } = ctx;",
      `  const g = ${call};`,
      '  check("A1", g > 0);',
      "}",
    ].join("\n");
  assert.equal(compareFamilies(files(before), files(declared("await a1Reads(ctx)"))).same, true);
  assert.equal(compareFamilies(files(before), files(declared("a1Reads(ctx)"))).same, false);
});
