import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, globSync } from "node:fs";
import { join, resolve } from "node:path";
import { eslint, plantMessages } from "../../test-support/source-shape-reports.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const RULE = "vellum/founding-locale-clock-free";
const AT = "src/world/founding/normalize.ts";

interface Refusal {
  line: number;
  messageId: string;
  message: string;
}

const refusals = async (lines: readonly string[], path: string): Promise<Refusal[]> =>
  (await plantMessages(lines, path))
    .filter((m) => m.ruleId === RULE)
    .map((m): Refusal => ({ line: m.line, messageId: m.messageId ?? "", message: m.message }));
const reports = async (lines: readonly string[], path: string): Promise<Array<[number, string]>> =>
  (await refusals(lines, path)).map((r): [number, string] => [r.line, r.messageId]);

const REFUSED: ReadonlyArray<readonly [string, string]> = [
  ["host", "export const lower = (s: string) => s.toLocaleLowerCase();"],
  ["host", 'export const upper = (s: string) => s.toLocaleUpperCase("tr");'],
  ["host", "export const shown = (n: number) => n.toLocaleString();"],
  ["host", "export const ordered = (a: string, b: string) => a.localeCompare(b);"],
  ["host", "export const day = (d: Date) => d.toLocaleDateString();"],
  ["host", "export const hour = (d: Date) => d.toLocaleTimeString();"],
  ["host", 'export const keyedLocale = (s: string) => s["toLocaleLowerCase"]();'],
  ["host", "export const tickedLocale = (s: string) => s[`toLocaleUpperCase`]();"],
  ["host", "export const destructuredLocale = ({ localeCompare }: string) => localeCompare;"],
  [
    "host",
    'const LOCALE_KEY = "toLocaleString"; export const heldKey = (n: number) => (n as unknown as Record<string, () => string>)[LOCALE_KEY]!();',
  ],
  ["host", 'export const collator = () => new Intl.Collator("en");'],
  ["host", "export const segments = (s: string) => new Intl.Segmenter().segment(s);"],
  ["host", "export const viaGlobalIntl = () => globalThis.Intl;"],
  ["host", 'export const keyedIntl = () => self["Intl"];'],
  ["host", "export const tongue = () => navigator.language;"],
  ["host", "export const stamp = () => new Date();"],
  ["host", "export const now = () => Date.now();"],
  ["host", "export const called = () => Date();"],
  ["host", "export const perf = () => performance.now();"],
  ["host", "export const viaWindow = () => window.performance;"],
  ["host", "export const temporal = () => Temporal.Now;"],
  ["host", "export const hr = () => process.hrtime();"],
  ["host", "export const timer = (f: () => void) => setTimeout(f, 0);"],
  ["libm", "export const dice = () => Math.random();"],
  ["libm", 'export const keyedDice = () => Math["random"]();'],
  ["libm", "const { random } = Math; export const destructuredDice = random;"],
  ["host", "export const fill = (buf: Uint32Array) => crypto.getRandomValues(buf);"],
  ["host", "export const uuid = () => crypto.randomUUID();"],
  ["host", "export const viaSelfCrypto = () => self.crypto;"],
  ["module", 'import { randomUUID } from "node:crypto";'],
  ["module", 'export const lazyCrypto = () => import("node:crypto");'],
  ["module", 'import { randomBytes } from "crypto";'],
  ["libm", "export const sine = (x: number) => Math.sin(x);"],
  ["libm", "export const power = (x: number, y: number) => Math.pow(x, y);"],
  ["power", "export const operator = (x: number) => x ** 2;"],
  ["power", "export const assigned = (x: number) => { let y = x; y **= 2; return y; };"],
  ["host", "export const where = () => import.meta.url;"],
  ["host", 'export const evaluated = () => eval("1");'],
  ["host", 'export const built = () => new Function("");'],
  ["host", "export const parsed = (s: string): unknown => JSON.parse(s);"],
  ["ambient", "declare const hidden: { now(): number };"],
  ["module", "export const computed = (n: number) => import(`./x${n}.ts`);"],
];

const PASSED: readonly string[] = [
  "// Date.now(), Math.random(), crypto and s.toLocaleLowerCase(), named in a comment",
  'export const mention = "Intl, Date.now(), Math.random(), crypto and toLocaleLowerCase, named in a string";',
  "export const folded = (s: string) => s.toUpperCase().toLowerCase();",
  'export const composed = (s: string) => s.normalize("NFC").normalize("NFKC");',
  "export const letters = (s: string) => Array.from(s).length;",
  "export const words = (s: string) => Array.from(s.matchAll(/\\p{L}+/gu), ([w]) => w);",
  "export const bounds = (n: number) => [Math.max(n, 1), Math.min(n, 2), Math.round(n * 1000) / 1000];",
  'export const held = new Map<string, number>([["a", 1]]);',
  "export const seen = new Set<string>();",
  "export const absent = undefined;",
  'import { hashString } from "../../core/rng.ts";',
  'import { defaultRecipe } from "../generate.ts";',
  "export const chartNumber = (s: string): number => hashString(s) + defaultRecipe(1).seed;",
  "export const annotated = (d: Date): number => (d === d ? 0 : 1);",
  "export type Clock = typeof Date;",
  "export type Sine = typeof Math.sin;",
  "export const shadowed = (Date: number): number => Date + 1;",
  "export const keys = { Date: 1, crypto: 2 }.crypto;",
  'export type LocaleKey = "toLocaleString";',
  'export const ownMethod = { toLocaleString: (): string => "the founding\'s own" };',
  "export const square = (x: number) => x * x;",
];

// Restated on purpose, an oracle beside FOUNDING_GLOBALS in scripts/lint/import-bounds.ts rather than read from it.
const APPROVED = ["Array", "Map", "Math", "Set", "undefined"];
const BROWSER_SAMPLE = [
  "caches",
  "document",
  "importScripts",
  "indexedDB",
  "isSecureContext",
  "localStorage",
  "location",
  "matchMedia",
  "navigator",
  "origin",
  "postMessage",
  "requestAnimationFrame",
  "requestIdleCallback",
  "self",
  "window",
];
const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;
const offList = (names: readonly string[], approved: readonly string[]): string[] =>
  [...new Set(names)].filter((name) => !approved.includes(name) && IDENTIFIER.test(name)).sort();
const OFF_LIST: ReadonlyArray<readonly [string, string]> = offList(
  [...Object.getOwnPropertyNames(globalThis), ...BROWSER_SAMPLE],
  APPROVED,
).map((name, i): [string, string] => ["host", `export const offGlobal${i} = (): unknown => ${name};`]);
const ON_LIST = APPROVED.filter((name) => name !== "Math").map(
  (name, i) => `export const onGlobal${i} = (): unknown => ${name};`,
);

const BLIND_SPOTS =
  "BLIND SPOTS, declared: a module outside src/world/founding/ is not read, so hashString in src/core/rng.ts and defaultRecipe in src/world/generate.ts, which founding calls, are held by review alone, erring toward passing; a built-in whose answer follows the engine's own Unicode data (normalize, toUpperCase, toLowerCase, a Unicode property class in a regular expression) passes on purpose, since founding refuses a character the platform does not know rather than reading it (handbook/specs/engine-invariants.md), erring toward passing; the Function constructor reached through a value's constructor chain ([].constructor.constructor), erring toward passing; a host read through a value the rule does not name (a caught error's stack, a locale member whose name is assembled from pieces, a host value read off a Date handed in), erring toward passing; a TypeScript value position read as a type (an instantiation expression), erring toward passing; an erased binding other than a declare line or a type-only import (an import alias, which npm run check refuses first, TS1294), erring toward passing; Math behind a cast or a non-null mark ((Math as M).floor, Math!.floor), erring toward reporting; and, of this test's oracle, a browser or worker global this Node lacks and BROWSER_SAMPLE does not name, wrongly approved in FOUNDING_GLOBALS, erring toward passing";

test("founding refuses the locale members however spelled, Intl, the clock, chance, libm, the exponent in both forms, every global outside its approved built-ins, import.meta, an ambient declaration, a Node module and a computed import, while its own case folding and normalization, its rng and recipe imports, a type, a key, a shadow, a comment and a string pass (Issue #829)", async () => {
  const refused = [...REFUSED, ...OFF_LIST];
  assert.ok(
    OFF_LIST.length > 50,
    `only ${OFF_LIST.length} off-list globals were found, so the oracle reads almost nothing`,
  );
  const plant = [...refused.map(([, line]) => line), ...PASSED, ...ON_LIST];
  const expected = refused.map(([arm], i): [number, string] => [i + 1, arm]);
  assert.deepEqual(await reports(plant, AT), expected, BLIND_SPOTS);
});

const resolvedAt = async (file: string): Promise<unknown> =>
  ((await eslint.calculateConfigForFile(file)) as { rules?: Record<string, unknown> }).rules?.[RULE];
const real = async (file: string): Promise<string> => {
  assert.ok(existsSync(join(ROOT, file)), `${file}, a witness here, does not exist`);
  assert.equal(await eslint.isPathIgnored(file), false, `${file} is ignored, so it witnesses nothing`);
  return file;
};

test("the founding rule resolves at error on every file under src/world/founding/ and on one nested deeper, and on nothing outside it, the modules founding imports from included (Issue #829)", async () => {
  const files = globSync("src/world/founding/**/*.ts", { cwd: ROOT });
  assert.ok(files.length > 0, "src/world/founding/ holds no file, so this sweep reads nothing");
  const inside = [...(await Promise.all(files.map(real))), "src/world/founding/nested/deeper/part.ts"];
  const unresolved: string[] = [];
  for (const file of inside) if (JSON.stringify(await resolvedAt(file)) !== "[2]") unresolved.push(file);
  assert.deepEqual(unresolved, [], `${RULE} does not resolve at error on these files`);
  for (const file of [
    "src/world/generate.ts",
    "src/core/rng.ts",
    "src/society/philology.ts",
    "src/prospect/compose.ts",
    "test/world/founding-covenant.test.ts",
  ]) {
    assert.equal(await resolvedAt(await real(file)), undefined, `${RULE} reaches ${file}, outside its scope`);
  }
});

const ARMS: ReadonlyArray<readonly [string, string]> = [
  ["host", "export const stamp = () => new Date();"],
  ["libm", "export const sine = (x: number) => Math.sin(x);"],
  ["power", "export const operator = (x: number) => x ** 2;"],
  ["module", 'import { randomUUID } from "node:crypto";'],
  ["ambient", "declare const hidden: { now(): number };"],
];

test("every refusal of the founding rule names the founding covenant and never the prospect layer, and the two list refusals name their list and the file that holds it, so a developer it stops can find what to change (Issue #829)", async () => {
  const found = await refusals(
    ARMS.map(([, line]) => line),
    AT,
  );
  assert.deepEqual(
    found.map((r): [number, string] => [r.line, r.messageId]),
    ARMS.map(([arm], i): [number, string] => [i + 1, arm]),
  );
  for (const { messageId, message } of found) {
    assert.ok(
      message.includes("handbook/specs/engine-invariants.md"),
      `${messageId} does not name the covenant's spec`,
    );
    assert.doesNotMatch(message, /prospect/i, `${messageId} names the prospect layer`);
  }
  const text = (id: string): string => found.find((r) => r.messageId === id)!.message;
  assert.ok(text("host").includes("FOUNDING_GLOBALS in scripts/lint/import-bounds.ts"), "host names no list or file");
  assert.ok(text("libm").includes("EXACT_MATH in scripts/lint/source-shape.ts"), "libm names no list or file");
});
