import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, globSync } from "node:fs";
import { join, resolve } from "node:path";
import { ESLint } from "eslint";

const ROOT = resolve(import.meta.dirname, "..", "..");
const eslint = new ESLint({ cwd: ROOT, flags: ["unstable_native_nodejs_ts_config"] });
const RULE = "vellum/prospect-libm-clock-free";

const reports = async (lines: readonly string[], path: string): Promise<Array<[number, string]>> => {
  const [result] = await eslint.lintText(lines.join("\n"), { filePath: join(ROOT, path) });
  assert.deepEqual(result!.messages.filter((m) => m.fatal).map((m) => m.message), [], `the plant at ${path} does not parse, so no rule read it`);
  return result!.messages.filter((m) => m.ruleId === RULE).map((m): [number, string] => [m.line, m.messageId ?? ""]);
};

const REFUSED: ReadonlyArray<readonly [string, string]> = [
  ["libm", "export const sine = (x: number) => Math.sin(x);"],
  ["libm", "export const power = (x: number, y: number) => Math.pow(x, y);"],
  ["libm", "export const dice = () => Math.random();"],
  ["libm", "export const unread = Math.pow;"],
  ["libm", "const { sin } = Math; export const destructured = sin;"],
  ["libm", "export const whole = Math;"],
  ["libm", "export const keyed = Math[\"floor\"];"],
  ["power", "export const operator = (x: number, y: number) => x ** y;"],
  ["power", "export const assigned = (x: number) => { let y = x; y **= 2; return y; };"],
  ["host", "export const stamp = () => new Date();"],
  ["host", "export const called = () => Date();"],
  ["host", "export const now = () => Date.now();"],
  ["host", "export const perf = () => performance.now();"],
  ["host", "export const hr = () => process.hrtime();"],
  ["host", "export const hrBig = () => process.hrtime.bigint();"],
  ["host", "export const fill = (buf: Uint32Array) => crypto.getRandomValues(buf);"],
  ["host", "export const uuid = () => crypto.randomUUID();"],
  ["host", "export const temporal = () => Temporal.Now;"],
  ["host", "export const viaGlobal = () => globalThis.Date;"],
  ["host", "export const viaWindow = () => window.performance;"],
  ["host", "export const viaSelf = () => self.crypto;"],
  ["host", "export const evaluated = () => eval(\"1\");"],
  ["host", "export const built = () => new Function(\"\");"],
  ["host", "export const intl = () => Intl.DateTimeFormat;"],
  ["host", "export const logged = () => console.log;"],
  ["host", "export const timer = (f: () => void) => setTimeout(f, 0);"],
  ["host", "export const loaded = () => require(\"./geometry.ts\");"],
  ["host", "export const year = (n: number) => n.toLocaleString();"],
  ["host", "export const order = (s: string, t: string) => s.localeCompare(t);"],
  ["host", "export const day = (d: Date) => d.toLocaleDateString();"],
  ["host", "export const hour = (d: Date) => d.toLocaleTimeString();"],
  ["host", "export const lower = (s: string) => s.toLocaleLowerCase();"],
  ["host", "export const keyedLocale = (n: number) => n[\"toLocaleString\"]();"],
  ["host", "export const tickedLocale = (s: string) => s[`toLocaleUpperCase`]();"],
  ["host", "const { localeCompare } = String.prototype; export const destructuredLocale = localeCompare;"],
  ["host", "export const described = Object.getOwnPropertyDescriptor(Number.prototype, \"toLocaleString\");"],
  ["host", "const LOCALE_KEY = \"toLocaleString\"; export const heldKey = (n: number) => (n as unknown as Record<string, () => string>)[LOCALE_KEY]!();"],
  ["host", "export const where = () => import.meta.url;"],
  ["ambient", "declare const hidden: { now(): number };"],
  ["ambient", "declare function stamped(): number;"],
  ["ambient", "declare class Clock {}"],
  ["ambient", "declare global { const hiddenClock: () => number; }"],
  ["ambient", "declare enum Hidden { A }"],
  ["module", "import { randomUUID } from \"node:crypto\";"],
  ["module", "import { performance as perfHooks } from \"perf_hooks\";"],
  ["module", "export const lazy = () => import(\"node:perf_hooks\");"],
  ["module", "export * from \"node:os\";"],
  ["module", "export { cpus } from \"os\";"],
  ["module", "export const computed = (n: number) => import(`./x${n}.ts`);"],
  ["module", "const SOURCE = \"./geometry.ts\"; export const held = () => import(SOURCE);"],
];

const PASSED: readonly string[] = [
  "// Math.sin, performance.now() and 2 ** 3, named in a comment",
  "export const mention = \"Math.pow(2, 3), performance.now(), Date.now() and 2 ** 3\";",
  "export const annotated = (d: Date): number => (d === d ? 0 : 1);",
  "export type Clock = typeof Date;",
  "export type Sine = typeof Math.sin;",
  "export const shadowed = (Date: number): number => Date + 1;",
  "export const keys = { Date: 1, performance: 2 }.performance;",
  "export const field = (o: { toLocale: number }) => o.toLocale;",
  "export type LocaleKey = \"toLocaleString\";",
  "export const ownMethod = { toLocaleString: (): string => \"the plate's own\" };",
  "export const optional = (x: number) => Math?.floor(x);",
  "export const builtIns = (s: string) => [new Map<string, number>(), new Set<number>(), JSON.stringify([s]), parseInt(s, 10), String(s), Array.from(s), Number(s), Object.keys({}), Boolean(s), Infinity, NaN, undefined, new Error(s), new RangeError(s), new TypeError(s)];",
  "export function Ctor(this: unknown) { return new.target; }",
  "import { el } from \"../render/svg.ts\";",
  "import { zoom } from \"d3-zoom\";",
  "export const lazyLocal = () => import(\"./geometry.ts\");",
  "export const square = (x: number) => x * x;",
  "export function overloaded(x: number): number;",
  "export function overloaded(x: number): number { return x; }",
];

// Restated on purpose, an oracle beside EXACT_MATH and PROSPECT_GLOBALS in scripts/lint/source-shape.ts rather than read from them, so a name wrongly added to either list reds here; every other Math member and every other global this Node holds is planted as refused.
const EXACT = ["E", "LN10", "LN2", "LOG10E", "LOG2E", "PI", "SQRT1_2", "SQRT2", "abs", "ceil", "clz32", "floor", "fround", "imul", "max", "min", "round", "sign", "sqrt", "trunc"];
const APPROVED = ["Array", "Boolean", "Error", "Infinity", "JSON", "Map", "Math", "NaN", "Number", "Object", "RangeError", "Set", "String", "TypeError", "parseInt", "undefined"];
const BROWSER_SAMPLE = ["caches", "document", "importScripts", "indexedDB", "isSecureContext", "localStorage", "location", "matchMedia", "navigator", "origin", "postMessage", "requestAnimationFrame", "requestIdleCallback", "self", "window"];
const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;
const offList = (names: readonly string[], approved: readonly string[]): string[] => [...new Set(names)].filter((name) => !approved.includes(name) && IDENTIFIER.test(name)).sort();
const OFF_LIST: ReadonlyArray<readonly [string, string]> = [
  ...offList(Object.getOwnPropertyNames(Math), EXACT).map((name, i): [string, string] => ["libm", `export const offMath${i} = Math.${name};`]),
  ...offList([...Object.getOwnPropertyNames(globalThis), ...BROWSER_SAMPLE], APPROVED).map((name, i): [string, string] => ["host", `export const offGlobal${i} = (): unknown => ${name};`]),
];
const ON_LIST = [...EXACT.map((name, i) => `export const onMath${i} = Math.${name};`), ...APPROVED.filter((name) => name !== "Math").map((name, i) => `export const onGlobal${i} = (): unknown => ${name};`)];

const ERASED_PLANT = [
  "import type { XYS as Date } from \"./geometry.ts\";",
  "import { type XYS as Math } from \"./geometry.ts\";",
  "import type { XYS as performance } from \"./geometry.ts\";",
  "import type { XYS } from \"./geometry.ts\";",
  "export const now = () => Date.now();",
  "export const sine = (x: number) => Math.sin(x);",
  "export const floor = (x: number) => Math.floor(x);",
  "export const perf = () => performance.now();",
  "export const typed = (p: XYS): XYS => p;",
];
const ERASED_READS: Array<[number, string]> = [[5, "host"], [6, "libm"], [8, "host"]];

const BLIND_SPOTS = "BLIND SPOTS, declared: a module outside src/prospect/, the repo's or a package's, is not read (src/prospect/dress/furniture.ts reaches Math.cos through armsNode in src/render/layers/heraldry.ts, which is why the finished-plate pins are armless), erring toward passing; the Function constructor reached through a value's constructor chain (Object.constructor, [].constructor.constructor), erring toward passing; a host read through a value the rule does not name (new Error().stack, a locale member whose name is assembled from pieces, a built-in whose result follows the engine's Unicode data, such as normalize), erring toward passing; a TypeScript value position read as a type (an instantiation expression), erring toward passing; an erased binding other than a declare line or a type-only import (an import alias, which npm run check refuses first, TS1294), erring toward passing; Math behind a cast or a non-null mark ((Math as M).floor, Math!.floor), erring toward reporting; and, of this test's oracle, a browser or worker global this Node lacks and BROWSER_SAMPLE does not name, wrongly approved in PROSPECT_GLOBALS, erring toward passing";

test("the prospect layer refuses libm, the exponent in both forms, Math reached any way but an exact member, every global outside the approved built-ins, the locale members, import.meta, an ambient declaration, a Node module and a computed import, while a type, a key, a shadow, a comment, a string, a package and a relative module pass", async () => {
  const refused = [...REFUSED, ...OFF_LIST];
  assert.ok(OFF_LIST.length > 50, `only ${OFF_LIST.length} off-list Math members and globals were found, so the oracle reads almost nothing`);
  const plant = [...refused.map(([, line]) => line), ...PASSED, ...ON_LIST];
  const expected = refused.map(([arm], i): [number, string] => [i + 1, arm]);
  assert.deepEqual(await reports(plant, "src/prospect/compose.ts"), expected, BLIND_SPOTS);
  assert.deepEqual(await reports(ERASED_PLANT, "src/prospect/compose.ts"), ERASED_READS, "a name bound by a type-only import is erased, so its value read is the global of that name and is judged as one");
});

const resolvedAt = async (file: string): Promise<unknown> => ((await eslint.calculateConfigForFile(file)) as { rules?: Record<string, unknown> }).rules?.[RULE];
const real = async (file: string): Promise<string> => {
  assert.ok(existsSync(join(ROOT, file)), `${file}, a witness here, does not exist`);
  assert.equal(await eslint.isPathIgnored(file), false, `${file} is ignored, so it witnesses nothing`);
  return file;
};

test("the rule resolves at error on every file under src/prospect/, on one nested deeper and on the pinned prospects' fixture builder, and on nothing outside them (Issue #759)", async () => {
  const files = globSync("src/prospect/**/*.ts", { cwd: ROOT });
  assert.ok(files.length > 0, "src/prospect/ holds no file, so this sweep reads nothing");
  const inside = [...(await Promise.all(files.map(real))), "src/prospect/nested/deeper/part.ts", await real("test-support/prospect-fixtures.ts")];
  const unresolved: string[] = [];
  for (const file of inside) if (JSON.stringify(await resolvedAt(file)) !== "[2]") unresolved.push(file);
  assert.deepEqual(unresolved, [], `${RULE} does not resolve at error on these files`);
  for (const file of ["src/site/prospect/seats.ts", "src/render/svg.ts", "test-support/dress-svg.ts"]) {
    assert.equal(await resolvedAt(await real(file)), undefined, `${RULE} reaches ${file}, outside its scope`);
  }
});
