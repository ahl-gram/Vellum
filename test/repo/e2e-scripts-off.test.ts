import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { ESLint } from "eslint";
import { lintTsRoots } from "../../test-support/lint-roots.ts";
import { WITNESSES } from "../../test-support/lint-witnesses.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const eslint = new ESLint({ cwd: ROOT, flags: ["unstable_native_nodejs_ts_config"] });
const RULE = "vellum/e2e-scripts-off-through-helper";
const HELPER = "e2e/support/scripts-off.ts";

const REFUSE = true;
const PASS = false;
const PLANT: ReadonlyArray<readonly [string, boolean]> = [
  ['import type { SuiteContext } from "../../types.ts";', PASS],
  [
    'export const a = (ctx: SuiteContext) => ctx.send("Emulation.setScriptExecutionDisabled", { value: true });',
    REFUSE,
  ],
  [
    'export const b = ({ send }: SuiteContext) => send("Emulation.setScriptExecutionDisabled", { value: false });',
    REFUSE,
  ],
  [
    "export const c = (ctx: SuiteContext) => ctx.send(`Emulation.setScriptExecutionDisabled`, { value: true });",
    REFUSE,
  ],
  [
    'export const d = (ctx: SuiteContext) => ctx["send"]("Emulation.setScriptExecutionDisabled", { value: true });',
    REFUSE,
  ],
  [
    'const METHOD = "Emulation.setScriptExecutionDisabled"; export const e = (ctx: SuiteContext) => ctx.send(METHOD);',
    REFUSE,
  ],
  ["// Emulation.setScriptExecutionDisabled, named in a comment, which switches nothing", PASS],
  ['export const f = "scripts go off through Emulation.setScriptExecutionDisabled\'s one helper";', PASS],
  ['export const g = (ctx: SuiteContext) => ctx.send("Emulation.setEmulatedMedia", { media: "print" });', PASS],
  [
    'export const h = (ctx: SuiteContext) => ctx.send("Emulation." + "setScriptExecutionDisabled", { value: true });',
    PASS,
  ],
];
const REFUSED = PLANT.flatMap(([, refused], i) => (refused ? [i + 1] : []));
const BLIND_SPOT =
  "BLIND SPOT, declared, erring toward passing: the method's name assembled from pieces (the last plant line), which no syntax read can resolve";

const reported = async (path: string): Promise<number[]> => {
  const [result] = await eslint.lintText(PLANT.map(([line]) => line).join("\n"), { filePath: join(ROOT, path) });
  assert.deepEqual(
    result!.messages.filter((m) => m.fatal).map((m) => m.message),
    [],
    `the plant at ${path} does not parse, so no rule read it`,
  );
  return result!.messages.filter((m) => m.ruleId === RULE).map((m) => m.line);
};

test("no e2e file names the scripts-off switch but its one helper, which always turns scripts back on (Issue #779)", async () => {
  assert.ok(REFUSED.length > 0 && REFUSED.length < PLANT.length, "the plant cannot tell the rule from its negation");
  assert.deepEqual(await reported("e2e/suites/document-rooms.ts"), REFUSED, BLIND_SPOT);
  assert.deepEqual(await reported("e2e/suites/nested/deeper/part.ts"), REFUSED, "a suite folder written tomorrow");
  assert.deepEqual(await reported(HELPER), [], "the helper itself is refused the switch it exists to hold");
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
  assert.equal(await resolvedRule(WITNESSES["public/**/*.css"]!), undefined, `${RULE} reaches a sheet`);
});
