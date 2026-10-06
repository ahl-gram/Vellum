import { test } from "node:test";
import assert from "node:assert/strict";
import { join, resolve } from "node:path";
import { ESLint, type Linter } from "eslint";
import lintConfig from "../../eslint.config.ts";
import { WITNESSES } from "../../test-support/lint-witnesses.ts";
import { lintTsRoots } from "../../test-support/lint-roots.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const BLOCK = "Issue #779: the strict rules adopted one at a time";
const PRESET_LAYERS = ["@eslint/js/recommended", "typescript-eslint/eslint-recommended", "typescript-eslint/recommended-type-checked"];
const blocks: readonly Linter.Config[] = lintConfig;
const shortName = (b: Linter.Config): string => (b.name ?? "(unnamed)").replace(/^.* > /, "");

const RULED: Readonly<Record<string, Linter.RuleEntry>> = {
  "@typescript-eslint/no-deprecated": "error",
  "@typescript-eslint/return-await": ["error", "error-handling-correctness-only"],
  "@typescript-eslint/no-non-null-asserted-nullish-coalescing": "error",
  "@typescript-eslint/related-getter-setter-pairs": "error",
  "@typescript-eslint/unified-signatures": "error",
  "@typescript-eslint/no-useless-constructor": "error",
  "@typescript-eslint/no-extraneous-class": "error",
  "@typescript-eslint/prefer-return-this-type": "error",
  "@typescript-eslint/prefer-reduce-type-parameter": "error",
  "@typescript-eslint/no-invalid-void-type": "error",
  "@typescript-eslint/no-generated-empty-object-type": "error",
  "@typescript-eslint/restrict-template-expressions": ["error", { allowAny: false, allowBoolean: true, allowNever: false, allowNullish: true, allowNumber: true, allowRegExp: true }],
  "@typescript-eslint/no-misused-spread": "error",
  "@typescript-eslint/no-unnecessary-template-expression": "error",
  "@typescript-eslint/no-unnecessary-type-arguments": "error",
  "@typescript-eslint/restrict-plus-operands": ["error", { allowAny: false, allowBoolean: false, allowNullish: true, allowNumberAndString: true, allowRegExp: false }],
  "@typescript-eslint/use-unknown-in-catch-callback-variable": "error",
  "@typescript-eslint/no-confusing-void-expression": ["error", { ignoreArrowShorthand: true, ignoreVoidOperator: false, ignoreVoidReturningFunctions: false }],
};

type Plant = { lines: readonly string[]; refused: readonly number[] };
const PLANTS: Readonly<Record<string, Plant>> = {
  "@typescript-eslint/no-deprecated": { lines: ["export const p = \"abc\".substr(1);", "export const q = \"abc\".slice(1);"], refused: [1] },
  "@typescript-eslint/return-await": { lines: ["declare function g(): Promise<number>;", "export async function f(): Promise<number> { try { return g(); } catch { return 0; } }", "export async function h(): Promise<number> { try { return await g(); } catch { return 0; } }", "export async function k(): Promise<number> { return await g(); }", "export async function m(): Promise<number> { return g(); }"], refused: [2] },
  "@typescript-eslint/no-non-null-asserted-nullish-coalescing": { lines: ["export const b = (o: { a?: string }): string => o.a! ?? \"x\";", "export const c = (o: { a?: string }): string => o.a ?? \"x\";"], refused: [1] },
  "@typescript-eslint/related-getter-setter-pairs": { lines: ["export class C { y = 1; get x(): string { return \"\"; } set x(v: number) { this.y = v; } }", "export class D { y = 1; get x(): number { return this.y; } set x(v: number) { this.y = v; } }"], refused: [1] },
  "@typescript-eslint/unified-signatures": { lines: ["export function u(a: string): void;", "export function u(a: number): void;", "export function u(a: unknown): void { void a; }"], refused: [2] },
  "@typescript-eslint/no-useless-constructor": { lines: ["export class A { x = 1; constructor() {} }", "export class B { x: number; constructor() { this.x = 1; } }"], refused: [1] },
  "@typescript-eslint/no-extraneous-class": { lines: ["export class Probe { static x = 1; }", "export class Kept { x = 1; }"], refused: [1] },
  "@typescript-eslint/prefer-return-this-type": { lines: ["export class B { x = 1; f(): B { return this; } }", "export class C { x = 1; f(): this { return this; } }"], refused: [1] },
  "@typescript-eslint/prefer-reduce-type-parameter": { lines: ["export const r = [[1], [2]].reduce((a, b) => a.concat(b), [] as number[]);", "export const s = [[1], [2]].reduce<number[]>((a, b) => a.concat(b), []);"], refused: [1] },
  "@typescript-eslint/no-invalid-void-type": { lines: ["export const v: number | void = 1;", "export const w = (): void => undefined;"], refused: [1] },
  "@typescript-eslint/no-generated-empty-object-type": { lines: ["type K = { a: 1 };", "export type E = Omit<K, \"a\">;", "export type F = Pick<K, \"a\">;"], refused: [2] },
  "@typescript-eslint/restrict-template-expressions": { lines: ["declare const u: any;", "declare const n: number | undefined;", "export const t = `${u}`;", "export const s = `${n} ${true} ${/re/}`;", "declare const nv: never;", "export const nt = `${nv}`;", "export const ar = `${[1]}`;", "export const ur = `${new URL(\"https://example.org\")}`;"], refused: [3, 6, 7] },
  "@typescript-eslint/no-misused-spread": { lines: ["declare const pr: Promise<number>;", "export const cs = [...\"ab\"];", "export const o = { ...pr };", "export const ok = \"ab\".split(\"\");"], refused: [2, 3] },
  "@typescript-eslint/no-unnecessary-template-expression": { lines: ["declare const w: string;", "export const t = `${w}`;", "export const u = `${w}!`;"], refused: [2] },
  "@typescript-eslint/no-unnecessary-type-arguments": { lines: ["declare function fd<T = number>(): T;", "export const z = fd<number>();", "export const y = fd<string>();"], refused: [2] },
  "@typescript-eslint/restrict-plus-operands": { lines: ["declare const a: any;", "declare const m: string | undefined;", "export const p1 = \"x\" + a;", "export const p2 = \"x\" + true;", "export const p3 = \"x\" + /re/;", "export const p4 = \"x\" + 1;", "export const p5 = \"x\" + m;", "let d = \"\";", "d += a;", "export { d };"], refused: [3, 4, 5, 9] },
  "@typescript-eslint/use-unknown-in-catch-callback-variable": { lines: ["declare const pr: Promise<number>;", "export const a = pr.catch((e: Error) => e.message);", "export const b = pr.catch((e) => String(e));", "export const c = pr.then((n) => n, (e: Error) => e.message);", "export const d = pr.catch((e: unknown) => String(e));", "export const f = pr.then((n) => n, (e: unknown) => String(e));"], refused: [2, 3, 4] },
  "@typescript-eslint/no-confusing-void-expression": { lines: ["declare function g(): void;", "export function r(c: boolean): void { if (c) return g(); g(); }", "export function v(): void { void g(); }", "export const x = [g()];", "export const h = (): void => g();", "export function s(c: boolean): void { if (c) { g(); return; } g(); }"], refused: [2, 3, 4] },
};

const PLANT_AT = WITNESSES["src/**/*.ts"]!;
const tsRootGlobs = (): string[] => lintTsRoots().map((r) => `${r}/**/*.ts`).sort();
const eslint = new ESLint({ cwd: ROOT, flags: ["unstable_native_nodejs_ts_config"] });
const resolvedEntry = (entry: Linter.RuleEntry): unknown[] => {
  const [severity, ...options]: unknown[] = Array.isArray(entry) ? entry : [entry];
  return [severity === "error" ? 2 : severity, ...options];
};

const theBlock = (): Linter.Config => {
  const named = blocks.filter((b) => b.name === BLOCK);
  assert.equal(named.length, 1, `${named.length} config blocks are named "${BLOCK}", so the rules Issue #779 adopted have no single home`);
  return named[0]!;
};

test("the block holding the rules Issue #779 adopted reaches every TypeScript root, unnarrowed and with no ignores", () => {
  const block = theBlock();
  const roots = tsRootGlobs();
  assert.ok(roots.length > 0, "the lint names no TypeScript root, so this guard is reading the wrong config");
  assert.deepEqual([...(block.files ?? [])].sort(), roots, "the block does not reach exactly the lint's TypeScript roots, so an adopted rule is taken back from every root it dropped, or narrowed by a conjunct such as src/**/*.ts with src/core/**");
  assert.equal(block.ignores, undefined, "the block carries an ignores key, which takes the adopted rules back for whatever it excludes");
});

test("the block sets exactly the ruled rules at their ruled values, and no other house block sets one of them, so none is added, dropped or weakened for a subtree unread (Alex, 2026-10-06, Issue #779)", () => {
  for (const layer of PRESET_LAYERS) assert.equal(blocks.filter((b) => shortName(b) === layer).length, 1, `${layer} names more or fewer than one block, so a house block named like a preset layer would set an adopted rule unread`);
  assert.deepEqual(theBlock().rules ?? {}, RULED, "the block's rules are not the ruled set at the ruled values: a rule was added without a ruling, dropped, or weakened by an option. BLIND SPOT, declared, erring toward passing: a change that edits the block and RULED together passes here; the plant test catches it for every option a plant exercises, and a rule ruled at bare \"error\" whose options are widened in both places passes everything, which is a change to a ruling and shows in its diff");
  const setters = blocks
    .filter((b) => b.name !== BLOCK && !PRESET_LAYERS.includes(shortName(b)))
    .flatMap((b) => Object.keys(RULED).filter((rule) => Object.hasOwn(b.rules ?? {}, rule)).map((rule) => `${b.name ?? "(unnamed)"}: ${rule}`));
  assert.deepEqual(setters, [], "a house block other than Issue #779's sets an adopted rule, and a block over a subtree or one named file can weaken it there while every witness still resolves the ruled value");
});

test("through ESLint itself, every TypeScript witness resolves each adopted rule at its ruled value", async () => {
  const typed = Object.entries(WITNESSES).filter(([glob]) => glob.endsWith(".ts"));
  assert.deepEqual(typed.map(([glob]) => glob).sort(), tsRootGlobs(), "the witnesses do not name one file per TypeScript root, so a root can drop out of the block with no witness to see it");
  for (const [, file] of typed) {
    const rules = ((await eslint.calculateConfigForFile(file)) as { rules?: Record<string, unknown> }).rules ?? {};
    for (const [rule, entry] of Object.entries(RULED)) {
      assert.deepEqual(rules[rule], resolvedEntry(entry), `${file}: ${rule} does not resolve at its ruled value through ESLint, so a layer after the block, or one before it setting options the block's entry does not replace, wins here, or the block does not reach this root`);
    }
  }
});

test("through ESLint itself, each adopted rule refuses its plant at exactly the planted lines and passes the lines its options admit", async () => {
  assert.deepEqual(Object.keys(PLANTS).sort(), Object.keys(RULED).sort(), "an adopted rule has no plant, or a plant names a rule nobody adopted, so a rule nobody has seen fire is in the config, or a removed one is still planted");
  for (const [rule, plant] of Object.entries(PLANTS)) {
    const [result] = await eslint.lintText(plant.lines.join("\n"), { filePath: join(ROOT, PLANT_AT) });
    assert.deepEqual(result!.messages.filter((m) => m.fatal).map((m) => m.message), [], `the plant for ${rule} does not parse at ${PLANT_AT}, so no rule read it`);
    assert.deepEqual(result!.messages.filter((m) => m.ruleId === rule).map((m) => m.line), plant.refused, `${rule} does not refuse exactly the planted lines at ${PLANT_AT}: a refused line passing means the rule or one of its ruled options is gone, an admitted line refused means an option admitting it is gone. BLIND SPOTS, declared: the plant runs at one path, and reach to every root is the witness test's; and use-unknown-in-catch-callback-variable reads only a callback written inline, so .catch(onErr) with a named onErr taking (e: Error) passes, erring toward passing (the tree held none on 2026-10-06)`);
  }
});
