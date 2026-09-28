import { test } from "node:test";
import assert from "node:assert/strict";
import { compareFamilies, familyOf } from "../../e2e/split-proof.ts";
import type { FamilyFile } from "../../e2e/split-proof.ts";

const files = (...texts: string[]): FamilyFile[] => texts.map((text, i) => ({ path: i === 0 ? "e2e/suites/map.ts" : `e2e/suites/map/part${i}.ts`, text }));

const BASE = [
  "import { makeStep } from \"./step-support.ts\";",
  "const TICK = 120;",
  "const READ = `({ok:!!document.getElementById(\"map\")})`;",
  "export async function run(ctx) {",
  "  const { evaluate, send, check, sleep, waitSettled } = ctx;",
  "  const settle = makeSettle(ctx);",
  "  const step = makeStep(ctx);",
  "  const DRAWN = 400;",
  "  const go = async (hash) => {",
  "    await send(\"Page.navigate\", { url: `http://127.0.0.1/#${hash}` });",
  "    await sleep(TICK);",
  "  };",
  "  await send(\"Emulation.setDeviceMetricsOverride\", { width: 1280, height: 800 });",
  "  await step(\"M1\", async () => {",
  "    await go(\"seed=42\");",
  "    const g = await settle(READ, (d) => d.ok && d.n === 1, \"m1\", DRAWN);",
  "    check(\"M1 the map draws\", g.n === 1, JSON.stringify(g));",
  "  });",
  "  let laid = null;",
  "  await step(\"M2\", async () => {",
  "    laid = await evaluate(READ);",
  "    if (!laid) throw new Error(\"never laid\");",
  "    await waitSettled(\"m2\");",
  "  });",
  "  await step(\"M3\", async () => {",
  "    check(\"M3 it stays laid\", !!laid);",
  "  });",
  "  await go(\"\");",
  "}",
].join("\n");

const SPLIT_RUN = [
  "import { makeStep } from \"./step-support.ts\";",
  "import { mapKit, m1Draws, m2Lays, m3Stays, desktop } from \"./map/part1.ts\";",
  "export async function run(ctx) {",
  "  const settle = makeSettle(ctx);",
  "  const step = makeStep(ctx);",
  "  const k = mapKit({ ...ctx, settle });",
  "  const { go } = k;",
  "  await desktop(k);",
  "  await step(\"M1\", () => m1Draws(k));",
  "  let laid = null;",
  "  await step(\"M2\", async () => { laid = await m2Lays(k); });",
  "  await step(\"M3\", () => m3Stays(k, laid));",
  "  await go(\"\");",
  "}",
].join("\n");

const SPLIT_GROUPS = [
  "export const TICK = 120;",
  "export const READ = `({ok:!!document.getElementById(\"map\")})`;",
  "const DRAWN = 400;",
  "export function mapKit(base) {",
  "  const { send, sleep } = base;",
  "  const go = async (hash) => {",
  "    await send(\"Page.navigate\", { url: `http://127.0.0.1/#${hash}` });",
  "    await sleep(TICK);",
  "  };",
  "  return { ...base, go };",
  "}",
  "export async function desktop({ send }) {",
  "  await send(\"Emulation.setDeviceMetricsOverride\", { width: 1280, height: 800 });",
  "}",
  "export async function m1Draws({ check, settle, go }) {",
  "  await go(\"seed=42\");",
  "  const g = await settle(READ, (d) => d.ok && d.n === 1, \"m1\", DRAWN);",
  "  check(\"M1 the map draws\", g.n === 1, JSON.stringify(g));",
  "}",
  "export async function m2Lays({ evaluate, waitSettled }) {",
  "  const laid = await evaluate(READ);",
  "  if (!laid) throw new Error(\"never laid\");",
  "  await waitSettled(\"m2\");",
  "  return laid;",
  "}",
  "export async function m3Stays({ check }, laid) {",
  "  check(\"M3 it stays laid\", !!laid);",
  "}",
].join("\n");

const verdict = (after: readonly string[]) => compareFamilies(files(BASE), files(...after));
const split = (runText: string, groupsText: string) => verdict([runText, groupsText]);
const swapped = (text: string, from: string, to: string): string => {
  assert.ok(text.includes(from), `the fixture no longer carries ${from}, so this case would compare the unchanged text`);
  return text.replace(from, to);
};
const inGroups = (from: string, to: string) => split(SPLIT_RUN, swapped(SPLIT_GROUPS, from, to));

test("a split into a kit, group functions and a folder file, with state crossing a step and constants hoisted, reads the same", () => {
  assert.deepEqual(split(SPLIT_RUN, SPLIT_GROUPS).lines, []);
  assert.equal(split(SPLIT_RUN, SPLIT_GROUPS).same, true);
});

test("the base against itself reads the same", () => {
  assert.equal(verdict([BASE]).same, true);
});

test("a page script chosen by name is read: the constant swapped at a settle and at an evaluate", () => {
  assert.equal(inGroups("settle(READ,", "settle(READ_CARD,").same, false);
  assert.equal(inGroups("evaluate(READ)", "evaluate(READ_CARD)").same, false);
});

test("a predicate, an operator or a field read changed is a difference", () => {
  assert.equal(inGroups("(d) => d.ok &&", "(d) => !d.ok &&").same, false);
  assert.equal(inGroups("d.n === 1", "d.n !== 1").same, false);
  assert.equal(inGroups("d.ok && d.n", "d.ok || d.n").same, false);
  assert.equal(inGroups("g.n === 1, JSON", "g.m === 1, JSON").same, false);
});

test("a budget changed by number or by name is a difference", () => {
  assert.equal(inGroups("\"m1\", DRAWN)", "\"m1\", 401)").same, false);
  assert.equal(inGroups("await sleep(TICK);", "await sleep(LONG_TICK);").same, false);
  assert.equal(inGroups("export const TICK = 120;", "export const TICK = 150;").same, false);
});

test("a message, a payload byte or a payload's indentation changed is a difference", () => {
  assert.equal(inGroups("\"M1 the map draws\"", "\"M1 the map drew\"").same, false);
  assert.equal(inGroups('getElementById("map")', 'getElementById("mapx")').same, false);
  assert.equal(inGroups("`http://127.0.0.1/#${hash}`", "`http://127.0.0.1/# ${hash}`").same, false);
});

test("an added wait, an await turned to void and a throw turned to a log are each a difference", () => {
  assert.equal(inGroups("  await waitSettled(\"m2\");", "  await waitSettled(\"m2\");\n  await waitReady();").same, false);
  assert.equal(inGroups("  await waitSettled(\"m2\");", "  void waitSettled(\"m2\");").same, false);
  assert.equal(inGroups("throw new Error(\"never laid\")", "console.log(\"never laid\")").same, false);
});

test("a statement moved across a step, or a setup call moved out of order, is a difference", () => {
  const late = swapped(swapped(SPLIT_RUN, "  await desktop(k);\n", ""), "  let laid = null;", "  let laid = null;\n  await desktop(k);");
  assert.equal(split(late, SPLIT_GROUPS).same, false);
  const into = swapped(swapped(SPLIT_RUN, "  await go(\"\");\n", ""), "() => m3Stays(k, laid));", "async () => { await m3Stays(k, laid); await go(\"\"); });");
  assert.equal(split(into, SPLIT_GROUPS).same, false);
});

test("in a suite with no step at all, two groups called in the other order are a difference", () => {
  const before = ["export async function run(ctx) {", "  const { check, evaluate } = ctx;", "  await evaluate(`1`);", "  check(\"H1 one\", true);", "  await evaluate(`2`);", "  check(\"H2 two\", true);", "}"].join("\n");
  const groups = ["async function h1({ check, evaluate }) {", "  await evaluate(`1`);", "  check(\"H1 one\", true);", "}", "async function h2({ check, evaluate }) {", "  await evaluate(`2`);", "  check(\"H2 two\", true);", "}"].join("\n");
  const inOrder = `export async function run(ctx) {\n  await h1(ctx);\n  await h2(ctx);\n}\n${groups}`;
  const swappedOrder = `export async function run(ctx) {\n  await h2(ctx);\n  await h1(ctx);\n}\n${groups}`;
  assert.equal(compareFamilies(files(before), files(inOrder)).same, true);
  assert.equal(compareFamilies(files(before), files(swappedOrder)).same, false);
});

test("a declaration that reads the clock may not move, while a literal constant may", () => {
  const before = ["export async function run(ctx) {", "  const { evaluate } = ctx;", "  const LIMIT = 5;", "  await evaluate(`1`);", "  const t0 = performance.now();", "  await evaluate(`2`);", "}"].join("\n");
  const hoisted = ["const LIMIT = 5;", "export async function run(ctx) {", "  const { evaluate } = ctx;", "  await evaluate(`1`);", "  const t0 = performance.now();", "  await evaluate(`2`);", "}"].join("\n");
  const clockMoved = ["export async function run(ctx) {", "  const { evaluate } = ctx;", "  const LIMIT = 5;", "  const t0 = performance.now();", "  await evaluate(`1`);", "  await evaluate(`2`);", "}"].join("\n");
  assert.equal(compareFamilies(files(before), files(hoisted)).same, true);
  assert.equal(compareFamilies(files(before), files(clockMoved)).same, false);
});

test("a declaration that only reads a value the run later changes may not move, though it makes no call", () => {
  const before = ["export async function run(ctx) {", "  const { evaluate } = ctx;", "  let n = await evaluate(`1`);", "  const first = n;", "  n = await evaluate(`2`);", "}"].join("\n");
  const moved = ["export async function run(ctx) {", "  const { evaluate } = ctx;", "  let n = await evaluate(`1`);", "  n = await evaluate(`2`);", "  const first = n;", "}"].join("\n");
  assert.equal(compareFamilies(files(before), files(moved)).same, false);
});

test("a module's top-level statement that is not a literal constant is compared, in the suite file or in a part", () => {
  const before = ["const SRC = resolve(HERE, \"src\");", "export async function run(ctx) {", "  await ctx.evaluate(SRC);", "}"].join("\n");
  const changed = swapped(before, "resolve(HERE, \"src\")", "resolve(HERE, \"lib\")");
  assert.equal(compareFamilies(files(before), files(changed)).same, false);
  const [head, ...rest] = before.split("\n");
  assert.equal(compareFamilies(files(before), files(rest.join("\n"), head ?? "")).same, true);
  assert.equal(compareFamilies(files(before), files(rest.join("\n"), swapped(head ?? "", "\"src\"", "\"lib\""))).same, false);
});

test("a listener whose body moved into a named function reads the same, the harness's own shape", () => {
  const before = ["export async function start({ consoleErrors }) {", "  ws.addEventListener(\"message\", (ev) => {", "    const m = JSON.parse(ev.data);", "    if (m.error) consoleErrors.push(m.error);", "  });", "}"].join("\n");
  const after = ["function onMessage(ev, consoleErrors) {", "  const m = JSON.parse(ev.data);", "  if (m.error) consoleErrors.push(m.error);", "}", "export async function start({ consoleErrors }) {", "  ws.addEventListener(\"message\", (ev) => onMessage(ev, consoleErrors));", "}"].join("\n");
  assert.equal(compareFamilies(files(before), files(after)).same, true);
  assert.equal(compareFamilies(files(before), files(swapped(after, "if (m.error)", "if (!m.error)"))).same, false);
});

test("a type note or a condition marker gained or lost is a difference", () => {
  assert.equal(inGroups("  const g = ", "  // @ts-expect-error a note\n  const g = ").same, false);
  assert.equal(inGroups("JSON.stringify(g));", "JSON.stringify(g)); // eslint-disable-line @typescript-eslint/no-unnecessary-condition").same, false);
});

test("a suite's family is its suite file and its own folder, never a sibling whose name it prefixes, and the harness takes its server, and a support module is a family of its own, never a suite's", () => {
  assert.equal(familyOf("e2e/suites/zoom.ts"), "zoom");
  assert.equal(familyOf("e2e/suites/zoom/deep/reads.ts"), "zoom");
  assert.equal(familyOf("e2e/suites/zoom-gestures.ts"), "zoom-gestures");
  assert.equal(familyOf("e2e/suites/zoom-gestures/checks.ts"), "zoom-gestures");
  assert.equal(familyOf("e2e/site-server.ts"), familyOf("e2e/harness.ts"));
  assert.equal(familyOf("e2e/support/room.ts"), "e2e/support/room.ts");
  assert.equal(familyOf("e2e/support/zoom.ts"), "e2e/support/zoom.ts");
});

test("a group handed a different value than its parameter names reads as a difference: a wrong name, a literal, or two arguments swapped", () => {
  assert.equal(split(swapped(SPLIT_RUN, "() => m3Stays(k, laid));", "() => m3Stays(k, null));"), SPLIT_GROUPS).same, false);
  assert.equal(split(swapped(SPLIT_RUN, "() => m3Stays(k, laid));", "() => m3Stays(k, settle));"), SPLIT_GROUPS).same, false);
  assert.equal(split(swapped(SPLIT_RUN, "() => m3Stays(k, laid));", "() => m3Stays(k, { laid: null }));"), SPLIT_GROUPS).same, false);
  assert.equal(split(swapped(SPLIT_RUN, "() => m3Stays(k, laid));", "async () => { await m3Stays(k, laid, go(\"x\")); });"), SPLIT_GROUPS).same, false);
  assert.equal(split(swapped(SPLIT_RUN, "await desktop(k);", "await desktop(null);"), SPLIT_GROUPS).same, false);
  const before = ["export async function start({ consoleErrors, http4xx }) {", "  ws.addEventListener(\"message\", (ev) => {", "    consoleErrors.push(ev.a);", "    http4xx.push(ev.b);", "  });", "}"].join("\n");
  const after = (args: string) => [`function onMessage(ev, consoleErrors, http4xx) {`, "  consoleErrors.push(ev.a);", "  http4xx.push(ev.b);", "}", "export async function start({ consoleErrors, http4xx }) {", `  ws.addEventListener("message", (ev) => onMessage(${args}));`, "}"].join("\n");
  assert.equal(compareFamilies(files(before), files(after("ev, consoleErrors, http4xx"))).same, true);
  assert.equal(compareFamilies(files(before), files(after("ev, http4xx, consoleErrors"))).same, false);
  assert.equal(compareFamilies(files(before), files(after("ev, [], http4xx"))).same, false);
});

test("a group that hands back a different value than the name its caller binds reads as a difference", () => {
  assert.equal(inGroups("  return laid;\n}", "  return null;\n}").same, false);
  assert.equal(inGroups("  return laid;\n}", "  return { laid };\n}").same, false);
  assert.equal(inGroups("  return laid;\n}", "  return { ...laid };\n}").same, false);
  const before = ["export async function run(ctx) {", "  const { evaluate, check } = ctx;", "  const wide = await evaluate(`1`);", "  const tall = await evaluate(`2`);", "  check(\"B2 wider\", wide > tall);", "}"].join("\n");
  const after = (ret: string) => ["export async function run(ctx) {", "  const { check } = ctx;", "  const [wide, tall] = await b1Reads(ctx);", "  check(\"B2 wider\", wide > tall);", "}", "async function b1Reads({ evaluate }) {", "  const wide = await evaluate(`1`);", "  const tall = await evaluate(`2`);", `  return ${ret};`, "}"].join("\n");
  assert.equal(compareFamilies(files(before), files(after("[wide, tall]"))).same, true);
  assert.equal(compareFamilies(files(before), files(after("[tall, wide]"))).same, false);
  assert.equal(compareFamilies(files(before), files(after("[1500, 900]"))).same, false);
});

test("an import bound to a different module or a different export reads as a difference, and one moved into a part file does not", () => {
  const before = ["import { settleFast as settle } from \"./settle-support.ts\";", "export async function run(ctx) {", "  await settle(ctx);", "}"].join("\n");
  const aliased = swapped(before, "settleFast as settle", "settleSlow as settle");
  const moved = swapped(before, "./settle-support.ts", "./other-support.ts");
  assert.equal(compareFamilies(files(before), files(aliased)).same, false);
  assert.equal(compareFamilies(files(before), files(moved)).same, false);
  const run = ["import { go } from \"./map/part1.ts\";", "export async function run(ctx) {", "  await go(ctx);", "}"].join("\n");
  const part = ["import { settleFast as settle } from \"../settle-support.ts\";", "export async function go(ctx) {", "  await settle(ctx);", "}"].join("\n");
  assert.equal(compareFamilies(files(before), files(run, part)).same, true);
  assert.equal(compareFamilies(files(before), files(run, swapped(part, "../settle-support.ts", "./settle-support.ts"))).same, false);
});

test("an import or an export inside the family that renames a name reads as a difference, since the proof finds a function the split made by its declared name", () => {
  const before = ["export async function run(ctx) {", "  const { check, sleep } = ctx;", "  await sleep(1);", "  check(\"X1 one\", true);", "  await sleep(2);", "  check(\"X2 two\", true);", "}"].join("\n");
  const part = ["export async function x1One({ check, sleep }) {", "  await sleep(1);", "  check(\"X1 one\", true);", "}", "export async function x2Two({ check, sleep }) {", "  await sleep(2);", "  check(\"X2 two\", true);", "}"].join("\n");
  const run = (wiring: string) => [wiring, "export async function run(ctx) {", "  await x1One(ctx);", "  await x2Two(ctx);", "}"].join("\n");
  assert.equal(compareFamilies(files(before), files(run("import { x1One, x2Two } from \"./map/part1.ts\";"), part)).same, true);
  assert.equal(compareFamilies(files(before), files(run("import { x2Two as x1One, x1One as x2Two } from \"./map/part1.ts\";"), part)).same, false);
  const unexported = swapped(swapped(part, "export async function x1One", "async function x1One"), "export async function x2Two", "async function x2Two");
  assert.equal(compareFamilies(files(before), files(run("import { x1One, x2Two } from \"./map/part1.ts\";"), `${unexported}\nexport { x2Two as x1One, x1One as x2Two };`)).same, false);
  const relay = (wiring: string) => [wiring, "export async function both(ctx) {", "  await x1One(ctx);", "  await x2Two(ctx);", "}"].join("\n");
  const viaRelay = ["import { both } from \"./map/part2.ts\";", "export async function run(ctx) {", "  await both(ctx);", "}"].join("\n");
  assert.equal(compareFamilies(files(before), files(viaRelay, part, relay("import { x1One, x2Two } from \"./part1.ts\";"))).same, true);
  assert.equal(compareFamilies(files(before), files(viaRelay, part, relay("import { x2Two as x1One, x1One as x2Two } from \"./part1.ts\";"))).same, false);
  const one = ["export default async function x1One({ check, sleep }) {", "  await sleep(1);", "  check(\"X1 one\", true);", "}"].join("\n");
  const two = ["export default async function x2Two({ check, sleep }) {", "  await sleep(2);", "  check(\"X2 two\", true);", "}"].join("\n");
  assert.equal(compareFamilies(files(before), files(run("import x1One from \"./map/part2.ts\";\nimport x2Two from \"./map/part1.ts\";"), one, two)).same, false);
  assert.equal(compareFamilies(files(before), files(run("import { x1One, x2Two } from \"./map/part1.ts\";"), "import x1One from \"./part2.ts\";\nimport x2Two from \"./part3.ts\";\nexport { x1One, x2Two };", two, one)).same, false);
  const defaultImportOnly = compareFamilies(files(before), files(run("import x1One from \"./map/part1.ts\";\nimport { x2Two } from \"./map/part1.ts\";"), part)).lines;
  assert.ok(defaultImportOnly.includes("e2e/suites/map.ts imports a default as x1One inside the family"), defaultImportOnly.join("\n"));
  assert.ok(!defaultImportOnly.some((l) => l.includes("exports a default")), "the default-import fixture carries no default export, so only the import can be reported");
  const defaultExportOnly = compareFamilies(files(before), files(run("import { x1One, x2Two } from \"./map/part1.ts\";"), `${one.replace("export default ", "export ")}\n${two}`)).lines;
  assert.ok(defaultExportOnly.includes("e2e/suites/map/part1.ts exports a default inside the family"), defaultExportOnly.join("\n"));
  assert.ok(!defaultExportOnly.some((l) => l.includes("imports a default")), "the default-export fixture carries no default import, so only the export can be reported");
  const assigned = compareFamilies(files(before), files(run("import { x1One, x2Two } from \"./map/part1.ts\";"), `${part}\nexport default x1One;`)).lines;
  assert.ok(assigned.includes("e2e/suites/map/part1.ts exports a default inside the family"), assigned.join("\n"));
});

test("a function only the split declares is read through at every call, so one that stands in for a context member reads as a difference", () => {
  const kit = swapped(SPLIT_GROUPS, "  return { ...base, go };", "  const settle = (script, pred, label, budget) => base.settle(script, pred, label, budget * 10);\n  return { ...base, go, settle };");
  assert.equal(split(SPLIT_RUN, kit).same, false);
  const noWait = swapped(SPLIT_GROUPS, "export async function m2Lays({ evaluate, waitSettled }) {", "async function waitSettled(label) {\n}\nexport async function m2Lays({ evaluate }) {");
  assert.equal(split(SPLIT_RUN, noWait).same, false);
  const before = ["export async function run(ctx) {", "  const { evaluate, waitSettled, onDone } = ctx;", "  await evaluate(`1`);", "  await waitSettled(\"m2\");", "  await evaluate(`2`).then(onDone);", "}"].join("\n");
  const once = ["async function waitSettled(evaluate) {", "  await evaluate(`1`);", "}", "export async function run(ctx) {", "  const { evaluate, onDone } = ctx;", "  await waitSettled(evaluate);", "  await waitSettled(\"m2\");", "  await evaluate(`2`).then(onDone);", "}"].join("\n");
  assert.deepEqual(compareFamilies(files(before), files(once)).lines, ["a call to waitSettled, a function the split made, is not read through: waitSettled ( \"m2\" )"]);
  const byValue = ["function onDone(v) {}", "export async function run(ctx) {", "  const { evaluate, waitSettled } = ctx;", "  await evaluate(`1`);", "  await waitSettled(\"m2\");", "  await evaluate(`2`).then(onDone);", "}"].join("\n");
  assert.deepEqual(compareFamilies(files(before), files(byValue)).lines, ["onDone, a function the split made, is never read through"]);
});

test("a function declared twice in the split is a difference, whichever copy a call would reach", () => {
  const start = SPLIT_GROUPS.indexOf("export async function m1Draws(");
  const end = SPLIT_GROUPS.indexOf("export async function m2Lays(");
  assert.ok(start >= 0 && end > start, "the fixture no longer carries m1Draws before m2Lays");
  const faithful = SPLIT_GROUPS.slice(start, end);
  assert.equal(verdict([SPLIT_RUN, swapped(SPLIT_GROUPS, "g.n === 1, JSON", "g.n === 2, JSON"), faithful]).same, false);
});

test("a let, a var or a container may not move, even with a literal initializer", () => {
  const before = ["export async function run(ctx) {", "  const { evaluate } = ctx;", "  let tries = 0;", "  const seen = [];", "  const poll = async () => {", "    tries++;", "    seen.push(tries);", "    await evaluate(`1`);", "  };", "  await poll();", "  await poll();", "}"].join("\n");
  const inner = swapped(swapped(before, "  const poll = async () => {\n", "  const poll = async () => {\n    let tries = 0;\n"), "  let tries = 0;\n  const seen", "  const seen");
  assert.equal(compareFamilies(files(before), files(inner)).same, false);
  const seenInside = swapped(swapped(before, "  const poll = async () => {\n", "  const poll = async () => {\n    const seen = [];\n"), "  const seen = [];\n  const poll", "  const poll");
  assert.equal(compareFamilies(files(before), files(seenInside)).same, false);
  const asVar = (text: string) => text.replaceAll("let tries", "var tries");
  assert.equal(compareFamilies(files(asVar(before)), files(asVar(inner))).same, false);
  const asObject = (text: string) => text.replaceAll("const seen = [];", "const seen = {};").replaceAll("seen.push(tries);", "seen.n = tries;");
  assert.equal(compareFamilies(files(asObject(before)), files(asObject(seenInside))).same, false);
  const regex = ["export async function run(ctx) {", "  const { check } = ctx;", "  const RE = /a/g;", "  const hit = (s) => {", "    return RE.test(s);", "  };", "  check(\"R1\", hit(\"a\"));", "  check(\"R2\", hit(\"a\"));", "}"].join("\n");
  const regexInside = swapped(swapped(regex, "  const RE = /a/g;\n", ""), "  const hit = (s) => {\n", "  const hit = (s) => {\n    const RE = /a/g;\n");
  assert.equal(compareFamilies(files(regex), files(regexInside)).same, false);
});

test("an async function the split made, called without await where the base awaited its body, is a difference", () => {
  assert.equal(split(swapped(SPLIT_RUN, "  await desktop(k);", "  desktop(k);"), SPLIT_GROUPS).same, false);
  assert.equal(split(swapped(SPLIT_RUN, "laid = await m2Lays(k);", "laid = m2Lays(k);"), SPLIT_GROUPS).same, false);
  const before = ["export async function run(ctx) {", "  const { evaluate, check } = ctx;", "  const g = await evaluate(`1`);", "  check(\"A1\", g > 0);", "}"].join("\n");
  const declared = (call: string) => [`async function a1Reads({ evaluate }) {`, "  const g = await evaluate(`1`);", "  return g;", "}", "export async function run(ctx) {", "  const { check } = ctx;", `  const g = ${call};`, "  check(\"A1\", g > 0);", "}"].join("\n");
  assert.equal(compareFamilies(files(before), files(declared("await a1Reads(ctx)"))).same, true);
  assert.equal(compareFamilies(files(before), files(declared("a1Reads(ctx)"))).same, false);
});
