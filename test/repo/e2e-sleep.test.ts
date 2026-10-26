import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { ESLint } from "eslint";
import { lintTsRoots } from "../../test-support/lint-roots.ts";
import { WITNESSES } from "../../test-support/lint-witnesses.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const eslint = new ESLint({ cwd: ROOT, flags: ["unstable_native_nodejs_ts_config"] });
const RULE = "vellum/e2e-sleep-inside-poll";

const REFUSE = true;
const PASS = false;
const PLANT: ReadonlyArray<readonly [string, boolean]> = [
  ['import type { SuiteContext } from "../types.ts";', PASS],
  ["declare const ctx: SuiteContext;", PASS],
  ["const { sleep, evaluate } = ctx;", PASS],
  ["await sleep(500);", REFUSE],
  ["await ctx.sleep(500);", REFUSE],
  ['await ctx["sleep"](500);', REFUSE],
  ['export const a = async (): Promise<void> => { await evaluate("1"); await sleep(400); };', REFUSE],
  ['await sleep(120, "pace: the hover lands before the wheel");', PASS],
  ['await ctx.sleep(300, "window: a wheel must move nothing in it");', PASS],
  ["await sleep(60, `pace: a template literal with no expression`);", PASS],
  ['await sleep(120, "pause: not one of the two kinds");', REFUSE],
  ['await sleep(120, "pace:");', REFUSE],
  ['const why = "pace: held in a binding"; await sleep(120, why);', REFUSE],
  ['await sleep(120, `pace: built ${"here"}`);', REFUSE],
  [
    'export async function b(): Promise<void> { for (let i = 0; i < 40; i++) { if (await evaluate<boolean>("x")) return; await sleep(50); } }',
    PASS,
  ],
  [
    'export async function c(): Promise<void> { let done = false; for (let i = 0; i < 40 && !done; i++) { done = await evaluate<boolean>("x"); await sleep(50); } }',
    PASS,
  ],
  [
    'export async function d(): Promise<void> { for (let i = 0; i < 40; i++) { const r = await evaluate<number>("x"); if (r > 1) break; await sleep(50); } }',
    PASS,
  ],
  [
    'export async function e(): Promise<void> { for (let i = 0; i < 40; i++) { try { await evaluate("x"); } catch { break; } await sleep(50); } }',
    PASS,
  ],
  [
    'export async function e2(): Promise<void> { const seen: number[] = []; for (let i = 0; i < 40; i++) { seen.push(await evaluate<number>("x")); if (seen.length > 3) return; await sleep(50); } }',
    PASS,
  ],
  [
    'export async function f(): Promise<void> { for (let i = 0; i < 6; i++) { await evaluate("x"); await sleep(50); } }',
    REFUSE,
  ],
  [
    'export async function g(): Promise<void> { const out: unknown[] = []; for (let i = 0; i < 6; i++) { out.push(await evaluate("x")); if (i > 3) break; await sleep(50); } }',
    REFUSE,
  ],
  [
    'export async function h(): Promise<void> { for (let i = 0; i < 40; i++) { if (await evaluate<boolean>("x")) { await sleep(800); return; } } }',
    REFUSE,
  ],
  [
    'export async function i2(): Promise<void> { for (let i = 0; i < 40; i++) { if (await evaluate<boolean>("x")) return; else await sleep(50); } }',
    PASS,
  ],
  [
    "export async function j(): Promise<void> { for (const p of [1, 2]) { if (await evaluate<boolean>(String(p))) break; await sleep(50); } }",
    REFUSE,
  ],
  [
    'export async function k(): Promise<void> { let done = false; while (!done) { done = await evaluate<boolean>("x"); await sleep(50); } }',
    REFUSE,
  ],
  ["export async function m(): Promise<void> { for (let i = 0; i < 9; ) { i += 3; await sleep(50); } }", REFUSE],
  [
    'export async function o(): Promise<void> { for (let i = 0; i < 40; i++) { if (await evaluate<boolean>("x")) return; [1].forEach(() => void sleep(50)); } }',
    REFUSE,
  ],
  ["const nap = sleep; await nap(500);", PASS],
  ["await new Promise((r) => setTimeout(r, 500));", PASS],
  ["await evaluate(`new Promise((r) => setTimeout(r, 500))`);", PASS],
  [
    'export async function n(): Promise<void> { for (let i = 0; i < 40; i++) { const at = await evaluate<number>("x"); await ctx.wheel(0, 0, 120); if ((await evaluate<number>("x")) === at) break; await sleep(90); } }',
    PASS,
  ],
  ['await sleep(120, "pace: a third argument", 1);', REFUSE],
  [
    'export async function p(): Promise<void> { for (let i = 0; i < 40; i++) { if (await evaluate<boolean>("x")) return; while (i < 0) { await sleep(50); } } }',
    REFUSE,
  ],
  [
    'export async function q(): Promise<void> { outer: for (let i = 0; i < 40; i++) { if (await evaluate<boolean>("x")) break outer; await sleep(50); } }',
    REFUSE,
  ],
  [
    'export async function r(): Promise<void> { for (let i = 0; i < 40; i++) { if (await evaluate<boolean>("x")) throw new Error("x"); await sleep(50); } }',
    PASS,
  ],
  [
    'export async function t(): Promise<void> { for (let i = 0; i < 40; i++) { if (await evaluate<boolean>("x")) { await sleep(800); throw new Error("x"); } } }',
    REFUSE,
  ],
  [
    'export async function u(): Promise<void> { for (let i = 0; i < 40; i++) { if (await evaluate<boolean>("x")) { await sleep(800); break; } } }',
    REFUSE,
  ],
  [
    'export async function v(): Promise<void> { for (let i = 0; i < 6; i++) { [1].forEach(async () => { if (await evaluate<boolean>("x")) return; }); await sleep(50); } }',
    REFUSE,
  ],
  [
    'export async function w(): Promise<void> { const o = { p: false }; for (let i = 0; i < 40 && !o.p; i++) { o.p = await evaluate<boolean>("x"); await sleep(50); } }',
    PASS,
  ],
  [
    'export async function x(): Promise<void> { for (let i = 0; i < 40; i++) { if (await evaluate<boolean>("x")) return; for (const z of [i]) { await sleep(z); } } }',
    REFUSE,
  ],
  [
    'export async function y(): Promise<void> { for (let i = 0; i < 40; i++) { if (await evaluate<boolean>("x")) return; for (const z in [i]) { await sleep(Number(z)); } } }',
    REFUSE,
  ],
  [
    'export async function z(): Promise<void> { for (let i = 0; i < 40; i++) { if (await evaluate<boolean>("x")) return; do { await sleep(50); } while (i < 0); } }',
    REFUSE,
  ],
  [
    "export async function a2(): Promise<void> { let d = false; for (let i = 0; i < 40 && !d; i++) { [1].forEach(() => { d = true; }); await sleep(50); } }",
    REFUSE,
  ],
  [
    'export async function b2(): Promise<void> { for (let i = 0; i < 40; i++) { if (await evaluate<boolean>("y")) return; if (await evaluate<boolean>("x")) { [1].forEach(() => { return; }); await sleep(50); } } }',
    PASS,
  ],
];
const REFUSED = PLANT.flatMap(([, refused], i) => (refused ? [i + 1] : []));
const BLIND_SPOT =
  "BLIND SPOTS, declared, each with its direction: a sleep reached under another name, an alias of sleep or a promise around setTimeout, is no call to sleep (a miss); a timer inside an evaluate payload is a string (a miss); a for loop that leaves on what it reads passes whatever its pause is for, a gesture repeated until the read stops moving or a pacing loop such as travel in e2e/suites/cards/hold.ts among them (a miss); a for loop whose exit reads a name its body writes from the counter, a counter declared outside the loop or after a second declarator, or a catch around the sleep itself passes though it reads nothing from the page (a miss); a while, do or for...of loop is never a poll here, however it leaves (a false red, since a poll here is a for statement); an exit read through a destructured declaration, const { done } = await ..., names nothing the loop writes (a false red); a sleep in a function written inside a poll's loop is read as outside the poll (a false red)";

const reported = async (path: string): Promise<number[]> => {
  const [result] = await eslint.lintText(PLANT.map(([line]) => line).join("\n"), { filePath: join(ROOT, path) });
  assert.deepEqual(
    result!.messages.filter((m) => m.fatal).map((m) => m.message),
    [],
    `the plant at ${path} does not parse, so no rule read it`,
  );
  return result!.messages.filter((m) => m.ruleId === RULE).map((m) => m.line);
};

test("an e2e sleep stands inside a for poll that leaves on what it reads, or names itself at the call as a pace or a window with its reason (Issue #785)", async () => {
  assert.ok(REFUSED.length > 0 && REFUSED.length < PLANT.length, "the plant cannot tell the rule from its negation");
  assert.deepEqual(await reported("e2e/suites/health.ts"), REFUSED, BLIND_SPOT);
  assert.deepEqual(await reported("e2e/support/settle.ts"), REFUSED, "a support module is held as a suite is");
});

const resolvedRule = async (file: string): Promise<unknown> =>
  ((await eslint.calculateConfigForFile(file)) as { rules?: Record<string, unknown> }).rules?.[RULE];

test("the rule resolves at error on every e2e file at any depth and on no other root or sheet", async () => {
  const roots = lintTsRoots();
  assert.ok(roots.includes("e2e") && roots.length > 1, "the lint's roots are not what this sweep expects");
  for (const root of roots) {
    const witness = WITNESSES[`${root}/**/*.ts`];
    assert.ok(witness !== undefined && existsSync(join(ROOT, witness)), `${root} has no existing witness`);
    const want = root === "e2e" ? [2] : undefined;
    for (const file of [witness, `${root}/nested/deeper/part.ts`])
      assert.deepEqual(await resolvedRule(file), want, `${RULE} resolves wrongly on ${file}`);
  }
  assert.equal(await resolvedRule(WITNESSES["src/styles/**/*.css"]!), undefined, `${RULE} reaches a sheet`);
});
