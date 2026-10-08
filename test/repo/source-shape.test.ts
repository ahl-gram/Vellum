import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, globSync } from "node:fs";
import { join, resolve } from "node:path";
import { ESLint, Linter } from "eslint";
import tseslint from "typescript-eslint";
import sourceShape from "../../scripts/lint/source-shape.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const eslint = new ESLint({ cwd: ROOT, flags: ["unstable_native_nodejs_ts_config"] });
const ENGINE = "vellum/engine-no-id-lookup";
const WORKER = "vellum/worker-spawn-static";
const ESCAPE = "vellum/template-silent-escape";
const ROSTER = "vellum/e2e-cancellation-roster";
const READS = "vellum/e2e-console-read-through-drop";
const FRAME_IDS = "vellum/frame-no-id-lookup";
const FRAME_IMPORTS = "vellum/frame-no-explorer-import";
const GLASS = "vellum/explorer-no-glass-keys";
const CONTENTS = "vellum/contents-row-builder-only";
const TEST_IMPORTS = "vellum/test-no-test-import";
const SPLIT_FILE_RULE = "vellum/split-arguments-by-name";

const houseReports = async (lines: readonly string[], path: string): Promise<Array<[string, number]>> => {
  const [result] = await eslint.lintText(lines.join("\n"), { filePath: join(ROOT, path) });
  assert.deepEqual(
    result!.messages.filter((m) => m.fatal).map((m) => m.message),
    [],
    `the plant at ${path} does not parse, so no rule read it`,
  );
  return result!.messages
    .filter((m) => m.ruleId?.startsWith("vellum/") && m.ruleId !== SPLIT_FILE_RULE)
    .map((m): [string, number] => [m.ruleId!, m.line]);
};
const at = (rule: string, lines: readonly number[]): Array<[string, number]> => lines.map((line) => [rule, line]);

const ID_LOOKUP_PLANT = [
  'export const a = (doc: Document) => doc.getElementById("a");',
  'export const b = (doc?: Document) => doc?.getElementById("a");',
  'export const c = (doc: Document) => doc["getElementById"]("a");',
  'export const d = (doc: Document) => doc[`getElementById`]("a");',
  "export const e = (doc: Document) => { const { getElementById } = doc; return getElementById; };",
  'const k = "getElementById"; export const f = (doc: Document) => (doc as unknown as Record<string, () => null>)[k]!();',
  "// getElementById, named in a comment",
  'export const g = "do not call getElementById here";',
  'export const h = (el: Element) => el.querySelector("#a");',
];

test("the living-chart engine looks up no element by id, however the lookup is spelled, and a mention is not a lookup", async () => {
  assert.deepEqual(
    await houseReports(ID_LOOKUP_PLANT, "src/site/living-chart/index.ts"),
    at(ENGINE, [1, 2, 3, 4, 5, 6]),
  );
});

test("the reading frame looks up no element by id, spelled any way the engine's rule reads", async () => {
  assert.deepEqual(
    await houseReports(ID_LOOKUP_PLANT, "src/site/reading-frame/index.ts"),
    at(FRAME_IDS, [1, 2, 3, 4, 5, 6]),
    "BLIND SPOT, declared, erring toward passing: the name assembled from pieces, as for the engine's rule",
  );
});

const SOURCE_BLIND_SPOTS =
  'BLIND SPOTS, declared, each erring toward passing: a module source held in a variable and handed to import() (const MODULE = "..."; import(MODULE)), a source assembled at run time from pieces none of which carries the banned text, an import in a type position (typeof import("..."), import("...").T), which run time erases, a source resolved through import.meta.resolve or a loader other than require, createRequire\'s result or a URL on import.meta.url, and a module reached through another module outside this rule\'s scope';

test("the reading frame imports nothing from the Explorer, by a static import, a re-export, a type import or any string inside import(), and naming the Explorer is not importing it", async () => {
  assert.deepEqual(
    await houseReports(
      [
        'import { a } from "../explorer/app.ts";',
        'export { b } from "../explorer/b.ts";',
        'export * from "../explorer/c.ts";',
        'import type { D } from "../explorer/d.ts";',
        'export const e = () => import("../explorer/e.ts");',
        "export const f = (x: string) => import(`../explorer/${x}.ts`);",
        'export const g = (x: string) => import("../" + "explorer/" + x);',
        "// ../explorer/app.ts, named in a comment",
        'export const h = "the Explorer lives in ../explorer/app.ts";',
        'import { i } from "../shared/room.ts";',
        'const MODULE = "../explorer/m.ts"; export const j = () => import(MODULE);',
        'export const k = () => new URL("../explorer/worker.ts", import.meta.url);',
        'export type L = typeof import("../explorer/l.ts");',
      ],
      "src/site/reading-frame/index.ts",
    ),
    at(FRAME_IMPORTS, [1, 2, 3, 4, 5, 6, 7, 12]),
    SOURCE_BLIND_SPOTS,
  );
});

const GLASS_PLANT = [
  'import { bindGlassKeys } from "../shared/glass-keys.ts";',
  'export * from "../shared/glass-keys.ts";',
  'export const b = () => import("../shared/glass-keys.ts");',
  'export const c = (root: ParentNode) => root.querySelectorAll("[data-zoom]");',
  'export const d = (root: ParentNode) => root.querySelector(`button[data-zoom="in"]`);',
  "// glass-keys.ts and [data-zoom], named in a comment",
  'export const e = "the other rooms bind glass-keys";',
  'import { f } from "../shared/room.ts";',
  'export const g = (el: HTMLElement) => el.dataset["zoom"];',
  'const GK = "../shared/glass-keys.ts"; export const h = () => import(GK);',
  'export const i = (root: ParentNode) => root.querySelectorAll("[ DATA-ZOOM]");',
  'export { j } from "../shared/glass-keys.ts";',
  'const GQ = "../shared/glass-keys.ts?v=1"; export const k = () => import(GQ);',
  'const GJ = "../shared/glass-keys.js"; export const l = () => import(GJ);',
];

test("neither the Explorer nor home imports the kit's glass-keys, by a path to it in a module source or held in any string, or queries [data-zoom] itself, in either directory, and naming the kit is not binding it", async () => {
  for (const path of ["src/site/explorer/app.ts", "src/site/home/app.ts"]) {
    assert.deepEqual(
      await houseReports(GLASS_PLANT, path),
      at(GLASS, [1, 2, 3, 4, 5, 10, 11, 12, 13, 14]),
      `${path}: BLIND SPOTS, declared, each erring toward passing: a path or selector assembled at run time from pieces none of which carries glass-keys or [data-zoom], and the kit reached through another module outside this rule's scope`,
    );
  }
});

const CONTENTS_PLANT = [
  'export const a = "<span class=\\"cr-num\\">1</span>";',
  'export const b = (n: number) => `<span class="cr-num">${n}</span>`;',
  'export const c = (el: HTMLElement) => { el.classList.add("cr-num"); };',
  "// cr-num, named in a comment",
  'export type K = "cr-num";',
];

test("a room writes the contents row's cr-num class only through the shared builder, which alone may spell it", async () => {
  for (const path of ["src/site/prospect/seats.ts", "src/site/shared/room.ts"]) {
    assert.deepEqual(
      await houseReports(CONTENTS_PLANT, path),
      at(CONTENTS, [1, 2, 3]),
      `${path}: BLIND SPOT, declared, erring toward passing: the class name assembled from pieces`,
    );
  }
  assert.deepEqual(
    await houseReports(CONTENTS_PLANT, "src/site/shared/contents-row.ts"),
    [],
    "the shared builder is the one place the class is written",
  );
  const namesake = new Linter({ cwd: ROOT }).verify(
    CONTENTS_PLANT.join("\n"),
    [
      {
        files: ["**/*.ts"],
        plugins: { vellum: sourceShape },
        languageOptions: { parser: tseslint.parser },
        rules: { [CONTENTS]: "error" },
      },
    ],
    { filename: join(ROOT, "src/site/zz-room/contents-row.ts") },
  );
  assert.deepEqual(
    namesake.map((m): [string, number] => [m.ruleId ?? "", m.line]),
    at(CONTENTS, [1, 2, 3]),
    "a module that only shares the builder's name is exempted, so the owner is matched by more than its exact path",
  );
});

const SCOPES: ReadonlyArray<readonly [string, readonly string[]]> = [
  [FRAME_IDS, ["src/site/reading-frame/**/*.ts"]],
  [FRAME_IMPORTS, ["src/site/reading-frame/**/*.ts"]],
  [GLASS, ["src/site/explorer/**/*.ts", "src/site/home/**/*.ts"]],
  [CONTENTS, ["src/site/**/*.ts"]],
  [TEST_IMPORTS, ["e2e/**/*.ts", "scripts/**/*.ts", "src/**/*.ts", "test/**/*.ts", "test-support/**/*.ts"]],
];

test("each Issue #728 rule resolves at error on every linted file its ruled scope holds today, so a scope narrowed to the files that once held a copy reds", async () => {
  for (const [rule, globs] of SCOPES) {
    const files = globs.flatMap((g) => globSync(g, { cwd: ROOT }));
    assert.ok(files.length > 0, `${rule}'s scope holds no file, so this sweep reads nothing`);
    const unresolved: string[] = [];
    for (const file of files) {
      if (await eslint.isPathIgnored(file)) continue;
      const resolved = (await eslint.calculateConfigForFile(file)) as { rules?: Record<string, unknown> };
      if (JSON.stringify(resolved.rules?.[rule]) !== "[2]") unresolved.push(file);
    }
    assert.deepEqual(unresolved, [], `${rule} does not resolve at error on these files of its ruled scope`);
  }
});

test("no module imports a .test.ts, by a static import, a re-export, or any string inside import() or require(), and naming a test file is not importing it", async () => {
  const plant = [
    'import { a } from "./other.test.ts";',
    'export { b } from "../site/b.test.ts";',
    'export * from "./c.test.ts";',
    'export const d = () => import("./d.test.ts");',
    'export const e = () => import("./e.test.ts?x=1");',
    "export const f = (x: string) => import(`./${x}.test.ts`);",
    'export const g = (root: string) => import(new URL("test/g.test.ts", root).href);',
    'export const h = () => import("./a" + ".test.ts");',
    'export const i = require("./i.test.ts");',
    '// import "./j.test.ts", named in a comment',
    'export const k = "node --test collects every .test.ts";',
    'import { l } from "./l.ts";',
    'const MODULE = "./m.test.ts"; export const m = () => import(MODULE);',
    'export const n = "./n.test.ts";',
    'import { createRequire } from "node:module";',
    'export const o = createRequire(import.meta.url)("./o.test.ts");',
    'const r = createRequire(import.meta.url); export const p = r("./p.test.ts");',
    'export const q = () => import("./q.test.ts#x");',
    'export const s = () => new URL("./s.test.ts", import.meta.url);',
    'const t = (x: string) => x; export const u = t("./u.test.ts");',
  ];
  for (const path of ["test/repo/lint-config.test.ts", "test-support/lint-roots.ts"]) {
    assert.deepEqual(
      await houseReports(plant, path),
      at(TEST_IMPORTS, [1, 2, 3, 4, 5, 6, 7, 8, 9, 16, 17, 18, 19]),
      `${path}: ${SOURCE_BLIND_SPOTS}`,
    );
  }
});

const WORKER_PLANT = [
  'export const ok = () => new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });',
  "export const wrapped = () =>",
  "  new Worker(",
  "    new URL('./worker.ts', import.meta.url),",
  '    { type: "module" },',
  "  );",
  'const target = new URL("./worker.ts", import.meta.url);',
  'export const variable = () => new Worker(target, { type: "module" });',
  'export const bare = () => new Worker(new URL("./worker.ts", import.meta.url));',
  'export const classic = () => new Worker(new URL("./worker.ts", import.meta.url), { type: "classic" });',
  'export const named = () => new Worker(new URL("./worker.ts", import.meta.url), { type: "module", name: "x" });',
  'export const up = () => new Worker(new URL("../worker.ts", import.meta.url), { type: "module" });',
  'export const js = () => new Worker(new URL("./worker.js", import.meta.url), { type: "module" });',
  'export const tick = () => new Worker(new URL(`./worker.ts`, import.meta.url), { type: "module" });',
  'export const page = () => new Worker(new URL("./worker.ts", location.href), { type: "module" });',
  'export const member = (u: URL) => new window.Worker(u, { type: "module" });',
  "export const shared = (u: URL) => new SharedWorker(u);",
  'export const memberStatic = () => new window.Worker(new URL("./worker.ts", import.meta.url), { type: "module" });',
  'export const viaGlobal = () => new globalThis.SharedWorker(new URL("./worker.ts", import.meta.url), { type: "module" });',
  'const W = Worker; export const alias = () => new W(new URL("./worker.ts", import.meta.url), { type: "module" });',
  'const { SharedWorker: S } = globalThis; export const pulled = () => new S(new URL("./worker.ts", import.meta.url), { type: "module" });',
  'export const sharedOk = () => new SharedWorker(new URL("./worker.ts", import.meta.url), { type: "module" });',
  'export const detect = (): boolean => typeof Worker !== "undefined";',
  "export const isWorker = (w: unknown): boolean => w instanceof Worker;",
  'export const labels = { Worker: "a key, not a constructor" };',
  "export const hold = (w: Worker | null): Worker | null => w;",
  "export const cast = Worker as typeof Worker;",
  "export const asserted = Worker!;",
  "export const checked = Worker satisfies unknown;",
  "export const angled = <typeof Worker>Worker;",
  "export const proxied = () => new Proxy(Worker, {});",
  "export const bag = { make: Worker };",
  'export const keyed = (u: URL) => new globalThis["Worker"](u);',
  "export const ticked = globalThis[`SharedWorker`];",
  "export const negated = !Worker;",
  "export const compared = (x: unknown) => Worker === x;",
  "export const leftSide = (X: new () => object) => Worker instanceof X;",
  "export const computedKey = { [Worker]: 1 };",
  "export const called = () => Worker(1);",
  "export const short = { Worker };",
  'const k = "Worker"; export const viaKey = (u: URL) => new (globalThis as unknown as Record<string, new (u: URL) => object>)[k]!(u);',
  'const { ["SharedWorker"]: S2 } = globalThis; export const destructured = (u: URL) => new S2(u);',
  'export const mention = "a Worker is spawned once, in worker-client";',
  'export type Name = "Worker" | "SharedWorker";',
  'const k2 = "Worker" as const; export const viaConst = (u: URL) => new (globalThis as unknown as Record<string, new (u: URL) => object>)[k2]!(u);',
  'export const angledName = <string>"SharedWorker";',
  'export const checkedName = "Worker" satisfies string;',
  'export const extra = () => new Worker(new URL("./worker.ts", import.meta.url), { type: "module" }, 1);',
];

test("a worker spawn in the site is the one static form the bundler reads, wrapped or single-quoted, and any other form reports", async () => {
  assert.deepEqual(
    await houseReports(WORKER_PLANT, "src/site/explorer/worker-client.ts"),
    at(
      WORKER,
      [
        8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
        41, 42, 45, 46, 47, 48,
      ],
    ),
    "BLIND SPOTS, declared, each erring toward passing: the name assembled from pieces, or handed to eval or Reflect.get; and a TypeScript value position other than the four casts (an instantiation, an import alias, an export assignment, an enum member), each of which npm run check refuses first (TS2635, TS1294)",
  );
});

const SPELLINGS = [
  'new Worker(new URL("./worker.ts", import.meta.url), { type: "module" })',
  "new SharedWorker(new URL('./worker.ts', import.meta.url), { type: \"module\" })",
  'new Worker(\n  new URL("./worker.ts", import.meta.url,),\n  { type: "module" },\n)',
  'new (Worker)(new URL("./worker.ts", import.meta.url), { type: "module" })',
  'new Worker(new (URL)("./worker.ts", import.meta.url), { type: "module" })',
  'new Worker(new URL("./worker.ts", (import.meta).url), { type: "module" })',
  'new Worker(new URL(("./worker.ts"), import.meta.url), { type: "module" })',
  'new Worker((new URL("./worker.ts", import.meta.url)), { type: "module" })',
  'new Worker(new URL("./worker.ts", import.meta\n.url), { type: "module" })',
];

test("a static spawn wearing parentheses, a line break or a trailing comma passes, since the bundler's TypeScript transform prints each as the plain form before its worker matcher reads it (measured by a real vite build on PR #731); ruling 2 keeps harmless spelling from reddening", async () => {
  for (const spelling of SPELLINGS)
    assert.deepEqual(
      await houseReports([`export const w = () => ${spelling};`], "src/site/explorer/worker-client.ts"),
      [],
      `${JSON.stringify(spelling)} reports, though the bundler rewrites it`,
    );
});

test("a single-escaped regex class or dot in a backtick string reports in every chunk, an odd run of backslashes included, and String.raw is the remedy", async () => {
  assert.deepEqual(
    await houseReports(
      [
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
        'const tag = (s: TemplateStringsArray): string => s.raw.join("");',
        "export const tagged = tag`a\\sb`;",
      ],
      "scripts/build-app-bundles.ts",
    ),
    at(ESCAPE, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 18]),
  );
});

test("no e2e file but the console module spells a cancellation opening, in a string or a backtick chunk, and the drop is only ever the one that module exports", async () => {
  assert.deepEqual(
    await houseReports(
      [
        'export const a = "EXCEPTION: AbortError: Transition was skipped. Document hidden";',
        "export const b = (r: string) => `EXCEPTION: Transition was aborted because of invalid state. ${r}`;",
        "// Transition was skipped, named in a comment, filters nothing",
        "const dropExpectedCancellations = (e: readonly string[]): string[] => [...e];",
        "export const c = dropExpectedCancellations([]);",
        "export const f = (e: string) => !/Transition was skipped/.test(e);",
        'export type Key = "dropExpectedCancellations";',
      ],
      "e2e/suites/home.ts",
    ),
    at(ROSTER, [1, 2, 5, 6]),
    'BLIND SPOTS, declared, each erring toward passing (a handbook/errata/guards.md row): an opening matched in a shape whose text does not carry it whole, such as a regex alternation (/Transition was (skipped|aborted)/), an escape class (\\s), a case-folded match (/i, or toLowerCase().includes), a string assembled from pieces, or a shorter fragment ("Transition was")',
  );
  assert.deepEqual(
    await houseReports(
      [
        'import { CANCELLATION_PREFIXES as dropExpectedCancellations } from "../support/console.ts";',
        "export const m = dropExpectedCancellations([]);",
      ],
      "e2e/suites/home.ts",
    ),
    at(ROSTER, [2]),
    "an import of another export under the drop's name is not the drop",
  );
  assert.deepEqual(
    await houseReports(
      [
        'import { dropExpectedCancellations } from "../support/console.ts";',
        "export const n = (): string[] => dropExpectedCancellations([]);",
        "export const o = (dropExpectedCancellations: (e: string[]) => string[]): string[] => dropExpectedCancellations([]);",
      ],
      "e2e/suites/home.ts",
    ),
    at(ROSTER, [3]),
    "the drop called inside a function resolves to its import through the scopes above, and a parameter shadowing the name is not the drop",
  );
  assert.deepEqual(
    await houseReports(
      [
        'import { dropExpectedCancellations } from "../support/console.ts";',
        "export const d = dropExpectedCancellations([]);",
      ],
      "e2e/suites/home.ts",
    ),
    [],
  );
  assert.deepEqual(
    await houseReports(
      [
        'import { dropExpectedCancellations } from "../support/elsewhere.ts";',
        "export const e = dropExpectedCancellations([]);",
      ],
      "e2e/suites/home.ts",
    ),
    at(ROSTER, [2]),
  );
  assert.deepEqual(
    await houseReports(
      [
        'import * as other from "../support/elsewhere.ts";',
        "type Dropper = { dropExpectedCancellations: (e: string[]) => string[] };",
        "export const g = (other as unknown as Dropper).dropExpectedCancellations([]);",
        'export const h = (other as unknown as Dropper)["dropExpectedCancellations"]([]);',
        "export const i = (other as unknown as Dropper)[`dropExpectedCancellations`]([]);",
        "const { dropExpectedCancellations: d } = other as unknown as Dropper; export const j = d([]);",
        'const name = "dropExpectedCancellations"; export const k = (other as unknown as Record<string, (e: string[]) => string[]>)[name]!([]);',
      ],
      "e2e/suites/home.ts",
    ),
    at(ROSTER, [3, 4, 5, 6, 7]),
    "BLIND SPOTS, declared: a namespace import of e2e/support/console.ts itself calling the drop as a member reports too, since the house spelling is the named import, erring toward reporting; the drop's name assembled from pieces passes, erring toward passing",
  );
  assert.deepEqual(
    await houseReports(['export const roster = ["Transition was skipped"];'], "e2e/support/console.ts"),
    [],
  );
});

const CLEAN_READS = [
  'import type { SuiteContext } from "../types.ts";',
  'import { dropExpectedCancellations } from "../support/console.ts";',
  "export function clean(ctx: SuiteContext, base: number): void {",
  "  const { check, consoleErrors } = ctx;",
  "  const errBase = consoleErrors.length;",
  '  check("A1", dropExpectedCancellations(consoleErrors).length === 0);',
  '  check("A2", dropExpectedCancellations(consoleErrors.slice(errBase)).length === 0);',
  '  check("A3", dropExpectedCancellations(ctx.consoleErrors.slice(base)).length === 0);',
  '  check("A4", dropExpectedCancellations(ctx["consoleErrors"]).length === 0);',
  "  const wrapped = (consoleErrors as string[]).length;",
  "  const satisfied = (consoleErrors satisfies string[]).length;",
  "  const doubled = (consoleErrors as unknown as string[]).length;",
  '  check("A6", satisfied >= 0);',
  "  const shape = { consoleErrors: wrapped };",
  '  check("A5", Object.keys(shape).length > 0);',
  "}",
  'export type Picked = Pick<SuiteContext, "consoleErrors">;',
  "export interface Own { consoleErrors: string[] }",
  "export const withDefault = (consoleErrors: string[] = []): number => dropExpectedCancellations(consoleErrors).length;",
  "export const filtered = (ctx: SuiteContext): number => { const consoleErrors = dropExpectedCancellations(ctx.consoleErrors); return 0; };",
];
const DIRTY_READS = [
  "export function dirty(ctx: SuiteContext, base: number, helper: (o: object) => boolean): void {",
  "  const { check, consoleErrors } = ctx;",
  '  check("B1", consoleErrors.length === 0);',
  '  check("B2", consoleErrors.filter((e) => e.includes("x")).length === 0);',
  '  check("B3", ctx.consoleErrors',
  "    .length > base);",
  '  check("B4", helper({ check, consoleErrors }));',
  '  check("B5", ctx["consoleErrors"].length === 0);',
  '  check("B6", (consoleErrors as string[]).length === 0);',
  '  check("B7", consoleErrors!.length === 0);',
  '  check("B8", (consoleErrors satisfies string[]).length === 0);',
  '  check("B9", (<string[]>consoleErrors).length === 0);',
  '  check("B10", Object.keys({ [consoleErrors]: 1 }).length === 0);',
  "  const ctxBase = ctx.consoleErrors.length;",
  '  check("B11", ctxBase === 0);',
  '  check("B12", ctx[`consoleErrors`].length === 0);',
  '  check("B13", ctx["consoleErrors" as const].length === 0);',
  '  const key = "consoleErrors";',
  '  check("B14", (Reflect.get(ctx, "consoleErrors") as string[]).length === 0);',
  '  check("B15", (ctx as unknown as Record<string, string[]>)[key]!.length === 0);',
  '  const lengthKey = "length";',
  '  const n2 = consoleErrors[lengthKey as "length"];',
  '  check("B16", n2 === 0);',
  '  const length = "length";',
  "  const n3 = consoleErrors[length];",
  '  check("B17", n3 === 0);',
  "  const alias = consoleErrors;",
  "  const fallback = (e: string[] = consoleErrors): boolean => e.length === 0;",
  '  check("B18", fallback() && alias.length === 0);',
  "  const get = (): string[] => consoleErrors;",
  '  check("B19", get().length === 0);',
  "}",
];
const OWNER_SHAPE = ['export const sink = (consoleErrors: string[]): void => { consoleErrors.push("x"); };'];

test("every read of the console accumulator outside its two owners goes through the shared drop, read across lines, through the context, or handed on", async () => {
  assert.deepEqual(await houseReports(CLEAN_READS, "e2e/suites/home.ts"), []);
  const offset = CLEAN_READS.length;
  assert.deepEqual(
    await houseReports([...CLEAN_READS, ...DIRTY_READS], "e2e/suites/home.ts"),
    at(
      READS,
      [3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 22, 25, 27, 28, 30].map((n) => n + offset),
    ),
    "BLIND SPOTS, declared, each erring toward passing (a handbook/errata/guards.md row): a base capture of the destructured accumulator compared directly (const n = consoleErrors.length; then n === 0 in a check), which the old line scanner excused too; two such captures and a comparison of them; a base handed to a helper that compares it, since a base legitimately crosses files as a call argument; the accumulator under another name (const { consoleErrors: raw } = ctx), or its name assembled from pieces; the nested destructure const { consoleErrors: { length } } = ctx; any read inside e2e/run.ts or e2e/harness.ts, the two owners that create and fill it; and a read nested anywhere inside the drop's arguments, filtered or not (dropExpectedCancellations([String(consoleErrors.length)]))",
  );
  assert.deepEqual(
    await houseReports(
      ['import { consoleErrors } from "../support/elsewhere.ts";', "export { consoleErrors };"],
      "e2e/suites/home.ts",
    ),
    [],
    "an import or export specifier binds the name and reads nothing",
  );
  assert.deepEqual(await houseReports(OWNER_SHAPE, "e2e/suites/home.ts"), at(READS, [1]));
  for (const owner of ["e2e/run.ts", "e2e/harness.ts"])
    assert.deepEqual(
      await houseReports(OWNER_SHAPE, owner),
      [],
      `${owner} creates or fills the accumulator, so its own shapes are not reads`,
    );
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
  [FRAME_IDS, "src/site/reading-frame/index.ts", "src/site/living-chart/index.ts"],
  [FRAME_IMPORTS, "src/site/reading-frame/index.ts", "src/site/explorer/app.ts"],
  [GLASS, "src/site/explorer/app.ts", "src/site/prospect/seats.ts"],
  [GLASS, "src/site/home/app.ts", "src/site/prospect/seats.ts"],
  [CONTENTS, "src/site/prospect/seats.ts", "src/cli/main.ts"],
  [TEST_IMPORTS, "e2e/harness.ts", "public/house.css"],
  [TEST_IMPORTS, "scripts/build-app-bundles.ts", "public/house.css"],
  [TEST_IMPORTS, "src/cli/main.ts", "public/house.css"],
  [TEST_IMPORTS, "test/repo/lint-config.test.ts", "public/house.css"],
  [TEST_IMPORTS, "test-support/lint-roots.ts", "public/house.css"],
];

test("each scoped rule resolves at error inside its scope and not outside it, and the 400-line bound resolves at app.ts itself (Issue #675, Issue #191)", async () => {
  for (const [rule, inside, outside] of REACH) {
    assert.deepEqual((await resolvedRules(inside))[rule], [2], `${rule} does not resolve at error on ${inside}`);
    assert.equal((await resolvedRules(outside))[rule], undefined, `${rule} reaches ${outside}, outside its scope`);
  }
  assert.deepEqual(
    (await resolvedRules("src/site/explorer/app.ts"))["max-lines"],
    [2, { max: 400, skipBlankLines: true, skipComments: true }],
    "app.ts no longer resolves max-lines at the 400-line bound Issue #191 ratified for it, counted in lines of code (Alex, 2026-10-07, Issue #779)",
  );
  for (const [rule, nested] of [
    [ENGINE, "src/site/living-chart/nested/deeper/part.ts"],
    [WORKER, "src/site/explorer/nested/deeper/part.ts"],
    [ROSTER, "e2e/suites/nested/deeper/part.ts"],
    [READS, "e2e/suites/nested/deeper/part.ts"],
    [FRAME_IDS, "src/site/reading-frame/nested/deeper/part.ts"],
    [FRAME_IMPORTS, "src/site/reading-frame/nested/deeper/part.ts"],
    [GLASS, "src/site/explorer/nested/deeper/part.ts"],
    [GLASS, "src/site/home/nested/deeper/part.ts"],
    [CONTENTS, "src/site/prospect/nested/deeper/part.ts"],
    [CONTENTS, "src/site/zz-new-room/part.ts"],
    [TEST_IMPORTS, "test/nested/deeper/part.test.ts"],
    [TEST_IMPORTS, "e2e/nested/deeper/part.ts"],
    [TEST_IMPORTS, "scripts/nested/deeper/part.ts"],
    [TEST_IMPORTS, "test-support/nested/deeper/part.ts"],
  ] as const) {
    const resolved = (await eslint.calculateConfigForFile(nested)) as { rules?: Record<string, unknown> };
    assert.deepEqual(
      resolved.rules?.[rule],
      [2],
      `${rule} does not reach ${nested}, so a module nested deeper in its scope escapes it`,
    );
  }
});
