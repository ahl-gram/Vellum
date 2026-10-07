import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { ESLint } from "eslint";
import { lintTsRoots } from "../../test-support/lint-roots.ts";
import { WITNESSES } from "../../test-support/lint-witnesses.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const eslint = new ESLint({ cwd: ROOT, flags: ["unstable_native_nodejs_ts_config"] });
const CSS_RULE = "vellum/css-no-narrow-width";
const TS_RULE = "vellum/no-narrow-width";

const REFUSE = true;
const PASS = false;
type Plant = ReadonlyArray<readonly [string, boolean]>;

const CSS_PLANT: Plant = [
  ["@import url(x.css) (max-width: 900px);", REFUSE],
  ["@custom-media --narrow (max-width: 900px);", REFUSE],
  ["@media (max-width: 900px) { a { color: red } }", REFUSE],
  ["@media (min-width: 901px) { a { color: red } }", REFUSE],
  ["@media (max-width: 1023px) { a { color: red } }", REFUSE],
  ["@media (min-width: 1024px) { a { color: red } }", REFUSE],
  ["@media (max-width: 1024px) { a { color: red } }", PASS],
  ["@media (min-width: 1025px) { a { color: red } }", PASS],
  ["@media (max-width: 1023.98px) { a { color: red } }", REFUSE],
  ["@media (min-width: 900.02px) { a { color: red } }", REFUSE],
  ["@media (width < 1024px) { a { color: red } }", REFUSE],
  ["@media (width < 1025px) { a { color: red } }", PASS],
  ["@media (width > 1024px) { a { color: red } }", PASS],
  ["@media (width >= 1024px) { a { color: red } }", REFUSE],
  ["@media (width: 900px) { a { color: red } }", REFUSE],
  ["@media (width: 1280px) { a { color: red } }", PASS],
  ["@media (width: 1024px) { a { color: red } }", REFUSE],
  ["@media (width: 1025px) { a { color: red } }", PASS],
  ["@media (600px <= width <= 900px) { a { color: red } }", REFUSE],
  ["@media (1100px >= width >= 900px) { a { color: red } }", REFUSE],
  ["@media (1100px <= width <= 80em) { a { color: red } }", REFUSE],
  ["@media (min-width 640px) { a { color: red } }", REFUSE],
  ["@media (1100px <= width <= 1400px) { a { color: red } }", PASS],
  ["@media (1024px < width) { a { color: red } }", PASS],
  ["@media (1024px <= width) { a { color: red } }", REFUSE],
  ["@media screen and (max-width: 900px) { a { color: red } }", REFUSE],
  ["@media print, (max-width: 900px) { a { color: red } }", REFUSE],
  ["@media not all and (max-width: 900px) { a { color: red } }", REFUSE],
  ["@media (max-device-width: 900px) { a { color: red } }", REFUSE],
  ["@media (min-width: 1280px) and (max-width: 1440px) { a { color: red } }", PASS],
  ["@media (max-width: 56.25em) { a { color: red } }", REFUSE],
  ["@media (min-width: 80rem) { a { color: red } }", REFUSE],
  ["@media (max-width: calc(900px + 1px)) { a { color: red } }", REFUSE],
  ["@media (max-height: 640px) { a { color: red } }", PASS],
  ["@media (prefers-reduced-motion: reduce) { a { color: red } }", PASS],
  ["@media print { a { color: red } }", PASS],
  ["@media screen { a { color: red } }", PASS],
  ["@media (orientation: portrait) { a { color: red } }", PASS],
  ["@container (max-width: 300px) { a { color: red } }", PASS],
  ["a { padding-inline: max(4vw, 40.96px); }", PASS],
  ["/* @media (max-width: 900px), named in a comment, a control no syntax-tree mutation reaches */", PASS],
];

const TS_PLANT: Plant = [
  ["export const a = (): boolean => matchMedia(\"(max-width: 900px)\").matches;", REFUSE],
  ["export const b = (): boolean => window.matchMedia(\"(min-width: 1024px)\").matches;", REFUSE],
  ["export const c = (): boolean => globalThis.matchMedia(\"(width < 1024px)\").matches;", REFUSE],
  ["export const d = (): boolean => matchMedia(`(max-width: 900px)`).matches;", REFUSE],
  ["const NARROW_QUERY = \"(max-width: 900px)\"; export const e = (): boolean => matchMedia(NARROW_QUERY).matches;", REFUSE],
  ["export const f = (q: string): boolean => matchMedia(q).matches;", REFUSE],
  ["export const g = (): boolean => matchMedia(\"(max-width: 56em)\").matches;", REFUSE],
  ["export const h = (): boolean => matchMedia(\"(prefers-reduced-motion: reduce)\").matches;", PASS],
  ["export const i = (): boolean => matchMedia(\"(hover: none) and (pointer: coarse)\").matches;", PASS],
  ["export const j = (): boolean => matchMedia(\"(min-width: 1280px)\").matches;", PASS],
  ["export const k = (): boolean => innerWidth < 900;", REFUSE],
  ["export const l = (): boolean => window.innerWidth <= 1023;", REFUSE],
  ["export const m = (): boolean => 1024 > window.innerWidth;", REFUSE],
  ["export const n = (): boolean => innerWidth >= 1024;", REFUSE],
  ["export const o = (): boolean => innerWidth === 900;", REFUSE],
  ["export const oa = (): boolean => innerWidth === 1024;", REFUSE],
  ["export const ob = (): boolean => innerWidth == 900;", REFUSE],
  ["export const oc = (): boolean => innerWidth != 900;", REFUSE],
  ["export const od = (): boolean => innerWidth !== 900;", REFUSE],
  ["const BREAK = 900; export const p = (): boolean => innerWidth < BREAK;", REFUSE],
  ["export const q = (): boolean => document.documentElement.clientWidth < 900;", REFUSE],
  ["export const r = (): boolean => document.body.clientWidth < 900;", REFUSE],
  ["export const s = (): boolean => window.visualViewport!.width < 900;", REFUSE],
  ["export const sa = (): boolean => window.visualViewport?.width < 900;", REFUSE],
  ["export const sb = (): boolean => document.documentElement.offsetWidth < 900;", REFUSE],
  ["export const sc = (): boolean => document.body.offsetWidth < 900;", REFUSE],
  ["export const t = (): boolean => screen.width < 900;", REFUSE],
  ["export const u = (): boolean => window.screen.availWidth < 1024;", REFUSE],
  ["export const v = (): boolean => outerWidth < 900;", REFUSE],
  ["export const w = (): boolean => self.innerWidth < 900;", REFUSE],
  ["export const x = (): boolean => innerWidth > 1024;", PASS],
  ["export const y = (): boolean => innerWidth <= 1024;", PASS],
  ["export const z = (): boolean => innerWidth < 1025;", PASS],
  ["export const aa = (innerWidth: number): boolean => innerWidth < 900;", PASS],
  ["export const ab = (edge: number): boolean => innerWidth < edge;", PASS],
  ["export const ac = (): number => Math.min(innerWidth, 900);", PASS],
  ["export const ad = (): boolean => innerHeight < 900;", PASS],
  ["export const ae = (el: HTMLElement): boolean => el.clientWidth < 900;", PASS],
  ["export const af = (): string => \"innerWidth < 900\";", PASS],
  ["// innerWidth < 900 and matchMedia(\"(max-width: 900px)\"), named in a comment, a control no syntax-tree mutation reaches", PASS],
];

const refusedLines = (plant: Plant): number[] => plant.flatMap(([, refused], i) => (refused ? [i + 1] : []));
const BLIND_SPOTS = "BLIND SPOTS, declared, each erring toward passing (a handbook/errata/guards.md row; Alex ruled them out of the guard's reach, Issue #763 ruling 2A): a length that shrinks with the window (vw and its kin, or a Math.min or Math.max of a width read against a constant), a comparison with a value the checker cannot fold, a width read stored in a variable first, height, the window's shape (orientation, aspect-ratio), a box's own size (@container, an element's clientWidth), a matchMedia in an .astro inline script, which this lint never reads";

const lintPlant = async (plant: Plant, filePath: string, rule: string): Promise<number[]> => {
  const [result] = await eslint.lintText(plant.map(([line]) => line).join("\n"), { filePath: join(ROOT, filePath) });
  assert.deepEqual(result!.messages.filter((m) => m.fatal).map((m) => m.message), [], "the plant does not parse, so no rule read it");
  return [...new Set(result!.messages.filter((m) => m.ruleId === rule).map((m) => m.line))];
};

test("no sheet switches layout at a fixed window width at or below the 1024 floor, in either media query form, and a width it cannot read in px is refused (Issue #763 ruling 2A)", async () => {
  const refused = refusedLines(CSS_PLANT);
  assert.ok(refused.length > 0 && refused.length < CSS_PLANT.length, "the plant holds no line to refuse or none to pass, so this test cannot tell the rule from its negation");
  assert.deepEqual(await lintPlant(CSS_PLANT, WITNESSES["public/**/*.css"]!, CSS_RULE), refused, BLIND_SPOTS);
});

test("no script asks a media query for a fixed window width at or below the 1024 floor, or compares the window's or the screen's width with one, and a query it cannot read is refused (Issue #763 ruling 2A)", async () => {
  const refused = refusedLines(TS_PLANT);
  assert.ok(refused.length > 0 && refused.length < TS_PLANT.length, "the plant holds no line to refuse or none to pass, so this test cannot tell the rule from its negation");
  assert.deepEqual(await lintPlant(TS_PLANT, "src/site/prospect/app.ts", TS_RULE), refused, BLIND_SPOTS);
});

const resolvedRule = async (file: string, rule: string): Promise<unknown> => ((await eslint.calculateConfigForFile(file)) as { rules?: Record<string, unknown> }).rules?.[rule];

test("the sheet rule resolves at error on every sheet under public/ and on no script; the script rule on every file under src/, in a room not yet written too, and on no other root and no sheet (Issue #763)", async () => {
  const sheet = WITNESSES["public/**/*.css"]!;
  assert.ok(existsSync(join(ROOT, sheet)), `${sheet}, the sheets' witness, does not exist`);
  for (const file of [sheet, "public/zz-new-room/index.css"]) assert.deepEqual(await resolvedRule(file, CSS_RULE), [2], `${CSS_RULE} does not resolve at error on ${file}`);
  for (const file of [WITNESSES["src/**/*.ts"]!, "src/site/zz-new-room/part.ts"]) assert.deepEqual(await resolvedRule(file, TS_RULE), [2], `${TS_RULE} does not resolve at error on ${file}`);
  const roots = lintTsRoots();
  assert.ok(roots.includes("src") && roots.length > 1, "the lint reads no TypeScript root but src, so the sweep below reads nothing");
  for (const root of roots) {
    const witness = WITNESSES[`${root}/**/*.ts`];
    assert.ok(witness !== undefined, `${root} has no witness in test-support/lint-witnesses.ts`);
    assert.equal(await resolvedRule(witness, CSS_RULE), undefined, `${CSS_RULE} reaches a script, ${witness}`);
    if (root !== "src") assert.equal(await resolvedRule(witness, TS_RULE), undefined, `${TS_RULE} reaches ${witness}, code no page runs`);
  }
  assert.equal(await resolvedRule(sheet, TS_RULE), undefined, `${TS_RULE} reaches a sheet`);
});
