import { test } from "node:test";
import assert from "node:assert/strict";
import { READS, ROSTER, at, houseReports } from "../../test-support/source-shape-reports.ts";

async function checkDropByImport(): Promise<void> {
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
}

async function checkDropFromElsewhere(): Promise<void> {
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
}

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
  await checkDropByImport();
  await checkDropFromElsewhere();
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
