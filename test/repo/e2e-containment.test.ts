import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { containment } from "../../test-support/e2e-containment.ts";
import type { FamilyFile } from "../../test-support/e2e-containment.ts";
import { e2eSuiteFamily } from "../../test-support/e2e-source.ts";

const SUITE = "e2e/suites/x.ts";
const PART = "e2e/suites/x/groups.ts";
const one = (...lines: string[]): FamilyFile[] => [{ path: SUITE, text: lines.join("\n") }];
const names = (files: readonly FamilyFile[]): string[] => containment(files).breaches.map((b) => b.name);

test("a wait awaited in run outside every step is a breach at its own line, and one inside a step is not", () => {
  const got = containment(one(
    "export async function run(ctx) {",
    "  const { waitSettled } = ctx;",
    "  const step = makeStep(ctx);",
    "  await waitSettled(\"a\");",
    "  await step(\"A1\", async () => { await waitSettled(\"b\"); });",
    "}",
  ));
  assert.deepEqual(got.breaches, [{ at: `${SUITE}:4`, name: "waitSettled" }]);
  assert.equal(got.throwingCalls, 2);
  assert.deepEqual(got.steps, ["A1"]);
});

test("a group function in the suite's folder that waits is contained by its one-line step, and reached outside one it is a breach", () => {
  const part: FamilyFile = { path: PART, text: ["export async function b1Draws({ settle }) {", "  await settle(READ, (d) => d.ok, \"b1\");", "}"].join("\n") };
  const suite = (extra: string): FamilyFile => ({ path: SUITE, text: ["export async function run(ctx) {", "  const k = kit(ctx);", "  const step = makeStep(ctx);", extra, "  await step(\"B1\", () => b1Draws(k));", "}"].join("\n") });
  assert.deepEqual(names([suite(""), part]), []);
  assert.deepEqual(containment([suite("  await b1Draws(k);"), part]).breaches, [{ at: `${SUITE}:4`, name: "b1Draws" }]);
});

test("a helper that holds the step calls themselves is not a thrower, since each wait it reaches sits inside its own step", () => {
  const got = containment(one(
    "export async function run(ctx) {",
    "  const step = makeStep(ctx);",
    "  await landSteps(ctx, step);",
    "}",
    "async function landSteps({ waitSettled }, step) {",
    "  await step(\"C1\", async () => { await waitSettled(\"c1\"); });",
    "  await step(\"C2\", async () => { await waitSettled(\"c2\"); });",
    "}",
  ));
  assert.deepEqual(got.breaches, []);
  assert.deepEqual(got.steps, ["C1", "C2"]);
});

test("a helper declared inside a kit is a thrower of its own, not the kit's, so building the kit is no breach and calling the helper outside a step is", () => {
  assert.deepEqual(names(one(
    "function kit(ctx) {",
    "  const { evaluate } = ctx;",
    "  const goHome = async () => { if (!(await evaluate(\"1\"))) throw new Error(\"never\"); };",
    "  return { ...ctx, goHome };",
    "}",
    "export async function run(ctx) {",
    "  const { goHome } = kit(ctx);",
    "  const step = makeStep(ctx);",
    "  await goHome();",
    "  await step(\"D1\", () => goHome());",
    "}",
  )), ["goHome"]);
});

test("a throw in run outside every step is a breach, and one inside a step is not", () => {
  assert.deepEqual(containment(one(
    "export async function run(ctx) {",
    "  const step = makeStep(ctx);",
    "  if (!ctx) throw new Error(\"no context\");",
    "  await step(\"E1\", async () => { throw new Error(\"inside\"); });",
    "}",
  )).breaches, [{ at: `${SUITE}:3`, name: "throw" }]);
});

test("today's shape reads clean: a three-line step around a throwing helper declared inside run", () => {
  const got = containment(one(
    "export async function run(ctx) {",
    "  const { evaluate, check, waitSettled } = ctx;",
    "  const step = makeStep(ctx);",
    "  const go = async (hash) => {",
    "    await evaluate(`location.hash = ${JSON.stringify(hash)}`);",
    "    await waitSettled(hash);",
    "  };",
    "  await step(\"F1\", async () => {",
    "    await go(\"a\");",
    "  });",
    "  check(\"F2 outside\", true);",
    "}",
  ));
  assert.deepEqual(got.breaches, []);
  assert.equal(got.throwingCalls, 2);
});

test("a wait reached through the context or the kit is read by its property name (the PR #682 errata row's class)", () => {
  assert.deepEqual(names(one(
    "function kit(ctx) {",
    "  const go = async () => { await ctx.waitSettled(\"go\"); };",
    "  return { ...ctx, go };",
    "}",
    "export async function run(ctx) {",
    "  const k = kit(ctx);",
    "  const step = makeStep(ctx);",
    "  await ctx.waitSettled(\"h1\");",
    "  await k.go();",
    "  await step(\"H1\", () => k.go());",
    "}",
  )), ["waitSettled", "go"]);
});

test("a thrower two calls from a seed is still a thrower, whatever order the file declares them in", () => {
  assert.deepEqual(names(one(
    "export async function run(ctx) {",
    "  const step = makeStep(ctx);",
    "  await outer(ctx);",
    "  await step(\"I1\", () => outer(ctx));",
    "}",
    "async function outer(ctx) { await inner(ctx); }",
    "async function inner({ settle }) { await settle(READ, () => true, \"i\"); }",
  )), ["outer"]);
});

test("a helper that throws with no wait in it is a thrower", () => {
  assert.deepEqual(names(one(
    "export async function run(ctx) {",
    "  const step = makeStep(ctx);",
    "  await boot(ctx);",
    "  await step(\"J1\", () => boot(ctx));",
    "}",
    "async function boot({ waitReady }) { if (!(await waitReady())) throw new Error(\"never drew\"); }",
  )), ["boot"]);
});

test("an object literal's function members are functions of their own, by method and by property", () => {
  assert.deepEqual(names(one(
    "function kit(ctx) {",
    "  return { ...ctx, async turned() { await ctx.waitTurned(\"k\"); }, landed: async () => { await ctx.waitTurned(\"k2\"); } };",
    "}",
    "export async function run(ctx) {",
    "  const k = kit(ctx);",
    "  const step = makeStep(ctx);",
    "  await k.turned();",
    "  await k.landed();",
    "  await step(\"K1\", () => k.turned());",
    "}",
  )), ["turned", "landed"]);
});

test("a wait at a module's top level runs outside every step, in the suite file or in a part", () => {
  const top: FamilyFile = { path: PART, text: "await waitTurned(\"part\");" };
  assert.deepEqual(names([...one(
    "const ready = await waitSettled(\"top\");",
    "export async function run(ctx) {",
    "  const step = makeStep(ctx);",
    "  await step(\"L1\", async () => { await ctx.waitSettled(\"l1\"); });",
    "}",
  ), top]), ["waitSettled", "waitTurned"]);
});

test("run is the root however it is declared, and a wait reached through a string key is read", () => {
  const body = ["  const step = makeStep(ctx);", "  await waitSettled(\"early\");", "  await step(\"R1\", async () => { await waitSettled(\"r1\"); });"];
  assert.deepEqual(names(one("export const run = async (ctx) => {", ...body, "};")), ["waitSettled"]);
  assert.deepEqual(names(one("async function run(ctx) {", ...body, "}", "export { run };")), ["waitSettled"]);
  assert.deepEqual(names(one("export async function run(ctx) {", "  const step = makeStep(ctx);", "  await ctx[\"waitSettled\"](\"x\");", "}")), ["waitSettled"]);
});

test("a suite's family is its suite file and every TypeScript file in its own folder at any depth, and never a sibling whose name it prefixes", () => {
  const root = mkdtempSync(join(tmpdir(), "vellum-e2e-family-"));
  try {
    const plant = (rel: string): void => {
      mkdirSync(dirname(join(root, rel)), { recursive: true });
      writeFileSync(join(root, rel), "");
    };
    ["e2e/suites/zoom.ts", "e2e/suites/zoom/reads.ts", "e2e/suites/zoom/deep/checks.ts", "e2e/suites/zoom/notes.md",
      "e2e/suites/zoom-gestures.ts", "e2e/suites/zoom-gestures/checks.ts", "e2e/support/zoom.ts", "e2e/zoom.ts"].forEach(plant);
    assert.deepEqual(e2eSuiteFamily(root, "zoom"), ["e2e/suites/zoom.ts", "e2e/suites/zoom/deep/checks.ts", "e2e/suites/zoom/reads.ts"]);
    assert.deepEqual(e2eSuiteFamily(root, "zoom-gestures"), ["e2e/suites/zoom-gestures.ts", "e2e/suites/zoom-gestures/checks.ts"]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
