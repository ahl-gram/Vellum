import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { ESLint } from "eslint";

const ROOT = resolve(import.meta.dirname, "..", "..");
const eslint = new ESLint({ cwd: ROOT, flags: ["unstable_native_nodejs_ts_config"] });
const ENGINE = "vellum/engine-no-id-lookup";
const WORKER = "vellum/worker-spawn-static";
const ESCAPE = "vellum/template-silent-escape";
const ROSTER = "vellum/e2e-cancellation-roster";
const READS = "vellum/e2e-console-read-through-drop";

const houseReports = async (lines: readonly string[], path: string): Promise<Array<[string, number]>> => {
  const [result] = await eslint.lintText(lines.join("\n"), { filePath: join(ROOT, path) });
  assert.deepEqual(result!.messages.filter((m) => m.fatal).map((m) => m.message), [], `the plant at ${path} does not parse, so no rule read it`);
  return result!.messages.filter((m) => m.ruleId?.startsWith("vellum/")).map((m): [string, number] => [m.ruleId!, m.line]);
};
const at = (rule: string, lines: readonly number[]): Array<[string, number]> => lines.map((line) => [rule, line]);

test("the living-chart engine looks up no element by id, however the lookup is spelled, and a mention is not a lookup", async () => {
  assert.deepEqual(await houseReports([
    "export const a = (doc: Document) => doc.getElementById(\"a\");",
    "export const b = (doc?: Document) => doc?.getElementById(\"a\");",
    "export const c = (doc: Document) => doc[\"getElementById\"](\"a\");",
    "export const d = (doc: Document) => doc[`getElementById`](\"a\");",
    "export const e = (doc: Document) => { const { getElementById } = doc; return getElementById; };",
    "const k = \"getElementById\"; export const f = (doc: Document) => (doc as unknown as Record<string, () => null>)[k]!();",
    "// getElementById, named in a comment",
    "export const g = \"do not call getElementById here\";",
    "export const h = (el: Element) => el.querySelector(\"#a\");",
  ], "src/site/living-chart/index.ts"), at(ENGINE, [1, 2, 3, 4, 5, 6]));
});

test("a worker spawn in the site is the one static form the bundler reads, wrapped or single-quoted, and any other form reports", async () => {
  assert.deepEqual(await houseReports([
    "export const ok = () => new Worker(new URL(\"./worker.ts\", import.meta.url), { type: \"module\" });",
    "export const wrapped = () =>",
    "  new Worker(",
    "    new URL('./worker.ts', import.meta.url),",
    "    { type: \"module\" },",
    "  );",
    "const target = new URL(\"./worker.ts\", import.meta.url);",
    "export const variable = () => new Worker(target, { type: \"module\" });",
    "export const bare = () => new Worker(new URL(\"./worker.ts\", import.meta.url));",
    "export const classic = () => new Worker(new URL(\"./worker.ts\", import.meta.url), { type: \"classic\" });",
    "export const named = () => new Worker(new URL(\"./worker.ts\", import.meta.url), { type: \"module\", name: \"x\" });",
    "export const up = () => new Worker(new URL(\"../worker.ts\", import.meta.url), { type: \"module\" });",
    "export const js = () => new Worker(new URL(\"./worker.js\", import.meta.url), { type: \"module\" });",
    "export const tick = () => new Worker(new URL(`./worker.ts`, import.meta.url), { type: \"module\" });",
    "export const page = () => new Worker(new URL(\"./worker.ts\", location.href), { type: \"module\" });",
    "export const member = (u: URL) => new window.Worker(u, { type: \"module\" });",
    "export const shared = (u: URL) => new SharedWorker(u);",
    "export const memberStatic = () => new window.Worker(new URL(\"./worker.ts\", import.meta.url), { type: \"module\" });",
    "export const viaGlobal = () => new globalThis.SharedWorker(new URL(\"./worker.ts\", import.meta.url), { type: \"module\" });",
    "const W = Worker; export const alias = () => new W(new URL(\"./worker.ts\", import.meta.url), { type: \"module\" });",
    "const { SharedWorker: S } = globalThis; export const pulled = () => new S(new URL(\"./worker.ts\", import.meta.url), { type: \"module\" });",
    "export const sharedOk = () => new SharedWorker(new URL(\"./worker.ts\", import.meta.url), { type: \"module\" });",
    "export const detect = (): boolean => typeof Worker !== \"undefined\";",
    "export const isWorker = (w: unknown): boolean => w instanceof Worker;",
    "export const labels = { Worker: \"a key, not a constructor\" };",
    "export const hold = (w: Worker | null): Worker | null => w;",
    "export const cast = Worker as typeof Worker;",
    "export const asserted = Worker!;",
    "export const checked = Worker satisfies unknown;",
    "export const angled = <typeof Worker>Worker;",
    "export const proxied = () => new Proxy(Worker, {});",
    "export const bag = { make: Worker };",
    "export const keyed = (u: URL) => new globalThis[\"Worker\"](u);",
    "export const ticked = globalThis[`SharedWorker`];",
    "export const negated = !Worker;",
    "export const compared = (x: unknown) => Worker === x;",
    "export const leftSide = (X: new () => object) => Worker instanceof X;",
    "export const computedKey = { [Worker]: 1 };",
    "export const called = () => Worker(1);",
    "export const short = { Worker };",
  ], "src/site/explorer/worker-client.ts"), at(WORKER, [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40]));
});

test("a single-escaped regex class or dot in a backtick string reports in every chunk, an odd run of backslashes included, and String.raw is the remedy", async () => {
  assert.deepEqual(await houseReports([
    "export const s = `a\\sb`;",
    "export const S = `a\\Sb`;",
    "export const d = `a\\db`;",
    "export const D = `a\\Db`;",
    "export const w = `a\\wb`;",
    "export const W = `a\\Wb`;",
    "export const b = `a\\bb`;",
    "export const B = `a\\Bb`;",
    "export const dot = `a\\.b`;",
    "export const head = (x: string) => `\\s${x}`;",
    "export const middle = (x: string) => `${x}\\s${x}`;",
    "export const tail = (x: string) => `${x}\\s`;",
    "export const doubled = `a\\\\sb`;",
    "export const tripled = `a\\\\\\sb`;",
    "export const raw = String.raw`a\\sb`;",
    "export const rawSub = (x: string) => String.raw`${x}\\b`;",
    "const tag = (s: TemplateStringsArray): string => s.raw.join(\"\");",
    "export const tagged = tag`a\\sb`;",
  ], "scripts/build-app-bundles.ts"), at(ESCAPE, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 18]));
});

test("no e2e file but the console module spells a cancellation opening, in a string or a backtick chunk, and the drop is only ever the one that module exports", async () => {
  assert.deepEqual(await houseReports([
    "export const a = \"EXCEPTION: AbortError: Transition was skipped. Document hidden\";",
    "export const b = (r: string) => `EXCEPTION: Transition was aborted because of invalid state. ${r}`;",
    "// Transition was skipped, named in a comment, filters nothing",
    "const dropExpectedCancellations = (e: readonly string[]): string[] => [...e];",
    "export const c = dropExpectedCancellations([]);",
    "export const f = (e: string) => !/Transition was skipped/.test(e);",
  ], "e2e/suites/home.ts"), at(ROSTER, [1, 2, 5, 6]));
  assert.deepEqual(await houseReports([
    "import { dropExpectedCancellations } from \"../support/console.ts\";",
    "export const d = dropExpectedCancellations([]);",
  ], "e2e/suites/home.ts"), []);
  assert.deepEqual(await houseReports([
    "import { dropExpectedCancellations } from \"../support/elsewhere.ts\";",
    "export const e = dropExpectedCancellations([]);",
  ], "e2e/suites/home.ts"), at(ROSTER, [2]));
  assert.deepEqual(await houseReports(["export const roster = [\"Transition was skipped\"];"], "e2e/support/console.ts"), []);
});

const CLEAN_READS = [
  "import type { SuiteContext } from \"../types.ts\";",
  "import { dropExpectedCancellations } from \"../support/console.ts\";",
  "export function clean(ctx: SuiteContext, base: number): void {",
  "  const { check, consoleErrors } = ctx;",
  "  const errBase = consoleErrors.length;",
  "  check(\"A1\", dropExpectedCancellations(consoleErrors).length === 0);",
  "  check(\"A2\", dropExpectedCancellations(consoleErrors.slice(errBase)).length === 0);",
  "  check(\"A3\", dropExpectedCancellations(ctx.consoleErrors.slice(base)).length === 0);",
  "  const ctxBase = ctx.consoleErrors.length;",
  "  check(\"A4\", ctxBase >= 0);",
  "  const wrapped = (consoleErrors as string[]).length;",
  "  const satisfied = (consoleErrors satisfies string[]).length;",
  "  check(\"A6\", satisfied >= 0);",
  "  const shape = { consoleErrors: wrapped };",
  "  check(\"A5\", Object.keys(shape).length > 0);",
  "}",
  "export type Picked = Pick<SuiteContext, \"consoleErrors\">;",
  "export interface Own { consoleErrors: string[] }",
];
const DIRTY_READS = [
  "export function dirty(ctx: SuiteContext, base: number, helper: (o: object) => boolean): void {",
  "  const { check, consoleErrors } = ctx;",
  "  check(\"B1\", consoleErrors.length === 0);",
  "  check(\"B2\", consoleErrors.filter((e) => e.includes(\"x\")).length === 0);",
  "  check(\"B3\", ctx.consoleErrors",
  "    .length > base);",
  "  check(\"B4\", helper({ check, consoleErrors }));",
  "  check(\"B5\", ctx[\"consoleErrors\"].length === 0);",
  "  check(\"B6\", (consoleErrors as string[]).length === 0);",
  "  check(\"B7\", consoleErrors!.length === 0);",
  "  check(\"B8\", (consoleErrors satisfies string[]).length === 0);",
  "  check(\"B9\", (<string[]>consoleErrors).length === 0);",
  "  check(\"B10\", Object.keys({ [consoleErrors]: 1 }).length === 0);",
  "}",
];
const OWNER_SHAPE = ["export const sink = (consoleErrors: string[]): void => { consoleErrors.push(\"x\"); };"];

test("every read of the console accumulator outside its two owners goes through the shared drop, read across lines, through the context, or handed on", async () => {
  assert.deepEqual(await houseReports(CLEAN_READS, "e2e/suites/home.ts"), []);
  const offset = CLEAN_READS.length;
  assert.deepEqual(
    await houseReports([...CLEAN_READS, ...DIRTY_READS], "e2e/suites/home.ts"),
    at(READS, [3, 4, 5, 7, 8, 9, 10, 11, 12, 13].map((n) => n + offset)),
    "BLIND SPOTS, declared, each erring toward passing (a handbook/errata/guards.md row): a base capture compared directly (const n = consoleErrors.length; then n === 0 in a check); two captures and a comparison of them; a base handed to a helper that compares it, since a base legitimately crosses files as a call argument; the accumulator under another name (const { consoleErrors: raw } = ctx); and the nested destructure const { consoleErrors: { length } } = ctx",
  );
  assert.deepEqual(await houseReports(["import { consoleErrors } from \"../support/elsewhere.ts\";", "export { consoleErrors };"], "e2e/suites/home.ts"), [], "an import or export specifier binds the name and reads nothing");
  assert.deepEqual(await houseReports(OWNER_SHAPE, "e2e/suites/home.ts"), at(READS, [1]));
  for (const owner of ["e2e/run.ts", "e2e/harness.ts"]) assert.deepEqual(await houseReports(OWNER_SHAPE, owner), [], `${owner} creates or fills the accumulator, so its own shapes are not reads`);
});

const resolvedRules = async (file: string): Promise<Record<string, unknown>> => {
  assert.ok(existsSync(join(ROOT, file)), `${file}, a witness here, does not exist, so its scope reads nothing`);
  assert.equal(await eslint.isPathIgnored(file), false, `${file} is ignored, so its scope reads nothing`);
  return ((await eslint.calculateConfigForFile(file)) as { rules?: Record<string, unknown> }).rules ?? {};
};

const REACH: ReadonlyArray<readonly [string, string, string]> = [
  [ENGINE, "src/site/living-chart/index.ts", "src/site/explorer/app.ts"],
  [WORKER, "src/site/explorer/worker-client.ts", "src/cli/main.ts"],
  [ROSTER, "e2e/suites/home.ts", "src/cli/main.ts"],
  [READS, "e2e/suites/home.ts", "src/cli/main.ts"],
];

test("each scoped rule resolves at error inside its scope and not outside it, and the 400-line bound resolves at app.ts itself (Issue #675, Issue #191)", async () => {
  for (const [rule, inside, outside] of REACH) {
    assert.deepEqual((await resolvedRules(inside))[rule], [2], `${rule} does not resolve at error on ${inside}`);
    assert.equal((await resolvedRules(outside))[rule], undefined, `${rule} reaches ${outside}, outside its scope`);
  }
  assert.deepEqual((await resolvedRules("src/site/explorer/app.ts"))["max-lines"], [2, 400], "app.ts no longer resolves max-lines at the 400-line bound Issue #191 ratified for it");
  for (const [rule, nested] of [[ENGINE, "src/site/living-chart/nested/deeper/part.ts"], [WORKER, "src/site/explorer/nested/deeper/part.ts"], [ROSTER, "e2e/suites/nested/deeper/part.ts"], [READS, "e2e/suites/nested/deeper/part.ts"]] as const) {
    const resolved = (await eslint.calculateConfigForFile(nested)) as { rules?: Record<string, unknown> };
    assert.deepEqual(resolved.rules?.[rule], [2], `${rule} does not reach ${nested}, so a module nested deeper in its scope escapes it`);
  }
});
