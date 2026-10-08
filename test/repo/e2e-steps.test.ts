import { test } from "node:test";
import assert from "node:assert/strict";
import { join, resolve } from "node:path";
import { ESLint } from "eslint";

const ROOT = resolve(import.meta.dirname, "..", "..");
const eslint = new ESLint({ cwd: ROOT, flags: ["unstable_native_nodejs_ts_config"] });
const RULE = "vellum/e2e-throw-inside-step";

const reports = async (lines: readonly string[], path: string): Promise<number[]> => {
  const [result] = await eslint.lintText(lines.join("\n"), { filePath: join(ROOT, path) });
  assert.deepEqual(
    result!.messages.filter((m) => m.fatal).map((m) => m.message),
    [],
    `the plant at ${path} does not parse, so no rule read it`,
  );
  return result!.messages.filter((m) => m.ruleId === RULE).map((m) => m.line);
};

const HEAD = [
  'import type { SuiteContext } from "../types.ts";',
  'import { makeStep } from "../support/step.ts";',
  'import { makeSettle } from "../support/settle.ts";',
  'import { sampleRow } from "../support/pixel.ts";',
  'import { deskKit, dnTablet } from "./cluster/desk-notice.ts";',
  'import { specimenKit } from "./specimen/kit.ts";',
  "export async function run(ctx: SuiteContext): Promise<void> {",
  "  const step = makeStep(ctx);",
];
const BODY = [
  "  await ctx.waitSettled();",
  '  await step("A", () => ctx.waitSettled());',
  '  if (ctx.PORT < 0) throw new Error("x");',
  "  try { await ctx.waitTurned(); } catch (e) { throw e; }",
  "  try { await ctx.waitTurned(); } catch {}",
  "  await sampleRow(ctx.send, 0, 0, 1);",
  "  const local = async (): Promise<void> => { await ctx.waitSettled(); };",
  "  await local();",
  '  await step("B", () => local());',
  "  await Promise.all([1].map(async () => { await ctx.waitSettled(); }));",
  "  const desk = deskKit(ctx);",
  "  await dnTablet(desk);",
  '  await step("DN5", () => dnTablet(desk));',
  "  const { brightest } = specimenKit({ ...ctx, settle: makeSettle(ctx) });",
  "  await brightest(1, 1);",
  '  try { await ctx.send("x", {}); } catch { await ctx.waitTurned(); }',
  '  try { await ctx.send("x", {}); } catch {} finally { await ctx.waitSettled(); }',
  '  const other = new Error("y");',
  '  try { await ctx.send("x", {}); } catch (e) { void e; throw other; }',
  "  const { brightest: bright } = specimenKit({ ...ctx, settle: makeSettle(ctx) });",
  "  await bright(1, 1);",
  "  await (async () => { await ctx.waitSettled(); })();",
  "  const rec = async (n: number): Promise<void> => { if (n > 0) await rec(n - 1); };",
  "  await rec(1);",
  '  await step("F", async function () { await ctx.waitSettled(); });',
  "  const pause = makeSettle(ctx);",
  '  await pause("x" as never, () => true, "y");',
  '  await makeSettle(ctx)("x" as never, () => true, "y");',
  '  await ctx.evaluate("1");',
  "}",
];
const at = (lines: readonly number[]): number[] => lines.map((n) => n + HEAD.length);

test("in a suite's own run, a wait or a throw that can fail stands inside a step, the thrower read through the type checker into a support module, a part file or a destructured kit member (Issue #560)", async () => {
  assert.deepEqual(
    await reports([...HEAD, ...BODY], "e2e/suites/health.ts"),
    at([1, 3, 4, 6, 8, 10, 12, 15, 16, 17, 19, 21, 22, 27, 28]),
    "BLIND SPOTS, declared, each with its direction: a function-typed member of a hand-written type, evaluate among them, is not followed (a miss); nor a function passed by reference, as to .then(fn) (a miss); nor .call and .bind (a miss); nor a new expression (a miss); a member read that throws on a missing value is no call (a miss, the PR #680, #681, #682 and #725 rows' class); a step reached by any name but step is not a step (a false red)",
  );
});

test("each lint run reads its own program: the same plant at a second suite reports the same lines (Issue #560)", async () => {
  assert.deepEqual(
    await reports([...HEAD, ...BODY], "e2e/suites/cluster.ts"),
    at([1, 3, 4, 6, 8, 10, 12, 15, 16, 17, 19, 21, 22, 27, 28]),
  );
});

test("a run written as a const arrow is a run", async () => {
  const plant = [
    'import type { SuiteContext } from "../types.ts";',
    "export const run = async (ctx: SuiteContext): Promise<void> => {",
    "  await ctx.waitSettled();",
    "};",
  ];
  assert.deepEqual(await reports(plant, "e2e/suites/health.ts"), [3]);
});

test("a suite's top level is its own region too, and a file outside e2e/suites/ is not read", async () => {
  const plant = [
    'import type { SuiteContext } from "../types.ts";',
    "declare const ctx: SuiteContext;",
    "await ctx.waitSettled();",
  ];
  assert.deepEqual(await reports(plant, "e2e/suites/health.ts"), [3]);
  assert.deepEqual(
    await reports(plant, "e2e/support/room.ts"),
    [],
    "a support module is read only where a suite calls it",
  );
});
