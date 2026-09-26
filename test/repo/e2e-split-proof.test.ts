import { test } from "node:test";
import assert from "node:assert/strict";
import { compareFamilies, familyOf } from "../../scripts/e2e-split-proof.ts";

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
  "import { mapKit, m1Draws, m2Lays, m3Stays, desktop } from \"./map/groups.ts\";",
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

const verdict = (after: readonly string[]) => compareFamilies([BASE], after);
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
  assert.equal(compareFamilies([before], [inOrder]).same, true);
  assert.equal(compareFamilies([before], [swappedOrder]).same, false);
});

test("a declaration that reads the clock may not move, while a literal constant may", () => {
  const before = ["export async function run(ctx) {", "  const { evaluate } = ctx;", "  const LIMIT = 5;", "  await evaluate(`1`);", "  const t0 = performance.now();", "  await evaluate(`2`);", "}"].join("\n");
  const hoisted = ["const LIMIT = 5;", "export async function run(ctx) {", "  const { evaluate } = ctx;", "  await evaluate(`1`);", "  const t0 = performance.now();", "  await evaluate(`2`);", "}"].join("\n");
  const clockMoved = ["export async function run(ctx) {", "  const { evaluate } = ctx;", "  const LIMIT = 5;", "  const t0 = performance.now();", "  await evaluate(`1`);", "  await evaluate(`2`);", "}"].join("\n");
  assert.equal(compareFamilies([before], [hoisted]).same, true);
  assert.equal(compareFamilies([before], [clockMoved]).same, false);
});

test("a declaration that only reads a value the run later changes may not move, though it makes no call", () => {
  const before = ["export async function run(ctx) {", "  const { evaluate } = ctx;", "  let n = await evaluate(`1`);", "  const first = n;", "  n = await evaluate(`2`);", "}"].join("\n");
  const moved = ["export async function run(ctx) {", "  const { evaluate } = ctx;", "  let n = await evaluate(`1`);", "  n = await evaluate(`2`);", "  const first = n;", "}"].join("\n");
  assert.equal(compareFamilies([before], [moved]).same, false);
});

test("a module's top-level statement that is not a literal constant is compared, in the suite file or in a part", () => {
  const before = ["const SRC = resolve(HERE, \"src\");", "export async function run(ctx) {", "  await ctx.evaluate(SRC);", "}"].join("\n");
  const changed = swapped(before, "resolve(HERE, \"src\")", "resolve(HERE, \"lib\")");
  assert.equal(compareFamilies([before], [changed]).same, false);
  const [head, ...rest] = before.split("\n");
  assert.equal(compareFamilies([before], [rest.join("\n"), head ?? ""]).same, true);
  assert.equal(compareFamilies([before], [rest.join("\n"), swapped(head ?? "", "\"src\"", "\"lib\"")]).same, false);
});

test("a listener whose body moved into a named function reads the same, the harness's own shape", () => {
  const before = ["export async function start({ consoleErrors }) {", "  ws.addEventListener(\"message\", (ev) => {", "    const m = JSON.parse(ev.data);", "    if (m.error) consoleErrors.push(m.error);", "  });", "}"].join("\n");
  const after = ["function onMessage(ev, consoleErrors) {", "  const m = JSON.parse(ev.data);", "  if (m.error) consoleErrors.push(m.error);", "}", "export async function start({ consoleErrors }) {", "  ws.addEventListener(\"message\", (ev) => onMessage(ev, consoleErrors));", "}"].join("\n");
  assert.equal(compareFamilies([before], [after]).same, true);
  assert.equal(compareFamilies([before], [swapped(after, "if (m.error)", "if (!m.error)")]).same, false);
});

test("a type note or a condition marker gained or lost is a difference", () => {
  assert.equal(inGroups("  const g = ", "  // @ts-expect-error a note\n  const g = ").same, false);
  assert.equal(inGroups("JSON.stringify(g));", "JSON.stringify(g)); // eslint-disable-line @typescript-eslint/no-unnecessary-condition").same, false);
});

test("a suite's family is its suite file and its own folder, never a sibling whose name it prefixes, and the harness takes its server", () => {
  assert.equal(familyOf("scripts/e2e/suite-zoom.ts"), "zoom");
  assert.equal(familyOf("scripts/e2e/zoom/deep/reads.ts"), "zoom");
  assert.equal(familyOf("scripts/e2e/suite-zoom-gestures.ts"), "zoom-gestures");
  assert.equal(familyOf("scripts/e2e/zoom-gestures/checks.ts"), "zoom-gestures");
  assert.equal(familyOf("scripts/e2e/site-server.ts"), familyOf("scripts/e2e/harness.ts"));
  assert.equal(familyOf("scripts/e2e/room-support.ts"), "scripts/e2e/room-support.ts");
});
