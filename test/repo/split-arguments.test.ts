import { test } from "node:test";
import assert from "node:assert/strict";
import { join, resolve } from "node:path";
import { ESLint } from "eslint";
import { OLDER_CALLS, SPLIT_FILES } from "../../scripts/lint/split-arguments.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const eslint = new ESLint({ cwd: ROOT, flags: ["unstable_native_nodejs_ts_config"] });
const RULE = "vellum/split-arguments-by-name";

const reports = async (lines: readonly string[], path: string): Promise<number[]> => {
  const [result] = await eslint.lintText(lines.join("\n"), { filePath: join(ROOT, path) });
  assert.deepEqual(
    result!.messages.filter((m) => m.fatal).map((m) => m.message),
    [],
    `the plant at ${path} does not parse, so no rule read it`,
  );
  return result!.messages.filter((m) => m.ruleId === RULE).map((m) => m.line);
};

test("a split builder hands each value to its own file's parts under the name of the parameter it lands in, and a call of an exported function is not read (Issue #654)", async () => {
  const plant = [
    "function part(view: number, scale: number): number { return view * scale; }",
    "export function whole(view: number, scale: number): number { return part(view, scale); }",
    "export function swapped(view: number, scale: number): number { return part(scale, view); }",
    "export function literal(view: number): number { return part(view, 2); }",
    "export function exported(a: number): number { return whole(a, a); }",
  ];
  assert.deepEqual(await reports(plant, "src/site/explorer/hash-sync.ts"), [3, 4]);
});

test("a file on the list that hands nothing to a part of its own reds, so the list cannot go stale (Issue #654)", async () => {
  assert.deepEqual(await reports(["export const x = 1;"], "src/site/explorer/hash-sync.ts"), [1]);
});

test("an older call is excused by its exact text, and an excuse whose call is gone or edited reds (Alex, Issue #654 comment 5939656565, decision B)", async () => {
  const declare =
    "function startSounding(statusEl: Element, random: () => number): void { void statusEl; void random; }";
  assert.deepEqual(
    await reports(
      [
        declare,
        "export function boot(veil: { status: Element }, opts: { random?: () => number }): void { startSounding(veil.status, opts.random ?? Math.random); }",
      ],
      "src/site/home/veil.ts",
    ),
    [],
    "the excused call as written",
  );
  assert.deepEqual(
    await reports(
      [declare, "export function boot(veil: { status: Element }): void { startSounding(veil.status, Math.random); }"],
      "src/site/home/veil.ts",
    ),
    [1, 2],
    "the edited call reds where it stands, and its excuse reds as stale",
  );
});

test("every file with an excuse is on the list, and the rule reaches exactly the list", async () => {
  for (const file of Object.keys(OLDER_CALLS)) assert.ok(SPLIT_FILES.includes(file), `${file} is excused but unlisted`);
  for (const file of SPLIT_FILES) {
    const rules = ((await eslint.calculateConfigForFile(join(ROOT, file))) as { rules?: Record<string, unknown> })
      .rules;
    assert.ok(rules?.[RULE], `${file} is on the list, but the rule does not reach it`);
  }
  const off = (
    (await eslint.calculateConfigForFile(join(ROOT, "src/site/explorer/elements.ts"))) as {
      rules?: Record<string, unknown>;
    }
  ).rules;
  assert.equal(off?.[RULE], undefined, "a file off the list is not read");
});
