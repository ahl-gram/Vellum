import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { ESLint } from "eslint";
import { declaredIn, sheetsOnDisk, SRC_CSS_FILES, type ReadDir } from "../../scripts/lint/sheet-tokens.ts";
import { lintTsRoots } from "../../test-support/lint-roots.ts";
import { WITNESSES } from "../../test-support/lint-witnesses.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const eslint = new ESLint({ cwd: ROOT, flags: ["unstable_native_nodejs_ts_config"] });
const TOKEN = "vellum/css-token-by-name";
const SHADOW = "vellum/css-shadow-by-token";
const VAR = "vellum/css-var-declared";
const BUILDER = "vellum/css-builder-token-by-name";

const REFUSE = true;
const PASS = false;
type Plant = ReadonlyArray<readonly [string, boolean]>;

const refusedLines = (plant: Plant): number[] => plant.flatMap(([, refused], i) => (refused ? [i + 1] : []));

const reported = async (plant: Plant, path: string, rule: string): Promise<number[]> => {
  const [result] = await eslint.lintText(plant.map(([line]) => line).join("\n"), { filePath: join(ROOT, path) });
  assert.deepEqual(
    result!.messages.filter((m) => m.fatal).map((m) => m.message),
    [],
    `the plant at ${path} does not parse, so no rule read it`,
  );
  return [...new Set(result!.messages.filter((m) => m.ruleId === rule).map((m) => m.line))];
};

const assertRefuses = async (plant: Plant, path: string, rule: string, blindSpots: string): Promise<void> => {
  const refused = refusedLines(plant);
  assert.ok(
    refused.length > 0 && refused.length < plant.length,
    `the plant at ${path} holds no line to refuse or none to pass, so it cannot tell ${rule} from its negation`,
  );
  assert.deepEqual(await reported(plant, path, rule), refused, blindSpots);
};

const COLOUR_PLANT = (home: boolean): Plant => [
  [".a { color: #4a3826; }", REFUSE],
  [".a { color: #4A3826; }", REFUSE],
  [".a { color: #4a3826cc; }", REFUSE],
  [".a { color: rgb(74 56 38); }", REFUSE],
  [".a { color: rgb(74 56 38 / 0.5); }", REFUSE],
  [".a { color: rgb(74, 56, 38); }", REFUSE],
  [".a { color: rgba(74, 56, 38, 0.5); }", REFUSE],
  [".a { color: var(--ink-dark, #4a3826); }", REFUSE],
  [".a { --x: #4a3826; }", REFUSE],
  [".a { --x: 0 1px 2px rgb(74 56 38 / 0.2); }", REFUSE],
  [".a { --x: var(--a, #4a3826); }", REFUSE],
  [".a { color: RGB(74 56 38); }", REFUSE],
  [":root { --ink-dark: #4a3826; }", !home],
  [":root { --ink-dark: #4A3826; }", !home],
  [":root { --ink-brown: #4a3826; }", REFUSE],
  [".a { color: rgb(from var(--ink-dark) r g b / 0.5); }", PASS],
  [".a { color: var(--ink-dark); }", PASS],
  [".a { color: #4a3827; }", PASS],
  [".a { color: rgb(74 56 39); }", PASS],
  [".a { color: rgb(29% 22% 15%); }", PASS],
  [".a { color: hsl(30 32% 22%); }", PASS],
  ['.a { background: url("x.svg#4a3826"); }', PASS],
  [".a { width: if(style(--x: 1): 2px; else: 3px); }", PASS],
  ["/* #4a3826 and rgb(74 56 38), named in a comment, a control no syntax-tree mutation reaches */", PASS],
];
const COLOUR_BLIND =
  "BLIND SPOTS, declared, each a miss: a token written as hsl(), a percentage rgb(), a named colour or color-mix() of literals; a token's hex or rgb inside a string or a url(), which the old text sweeps read; a value css-tree cannot re-parse (the family parses tolerant, Issue #648), skipped rather than reported";

test("no sheet writes a token's colour raw, as a hash of any case or length or an rgb() in either form, in a value, a fallback or a custom property, and only public/shell.css writes a token's own declaration (Issue #263, Issue #324, Issue #779 part 2d)", async () => {
  await assertRefuses(COLOUR_PLANT(false), "public/house.css", TOKEN, COLOUR_BLIND);
  await assertRefuses(COLOUR_PLANT(true), "public/shell.css", TOKEN, COLOUR_BLIND);
});

const SHADOW_PLANT = (home: boolean): Plant => [
  [".a { box-shadow: 0 12px 34px red; }", REFUSE],
  [".a { box-shadow: 0px 12px 34px red; }", REFUSE],
  [".a { box-shadow: 0em 12px 34px red; }", REFUSE],
  [".a { box-shadow: 0 12PX 34PX red; }", REFUSE],
  [".a { box-shadow: 0 12px 34px; }", REFUSE],
  [".a { color: rgb(0 12 34); }", PASS],
  [".a { filter: drop-shadow(0 18px 60px red); }", REFUSE],
  [".a { box-shadow: 1px 2px 3px red, 0 18px 60px blue; }", REFUSE],
  [".a { --s: 0 12px 34px red; }", REFUSE],
  [":root { --sheet-shadow: 0 12px 34px red; }", !home],
  [":root { --stage-shadow: 0 12px 34px red; }", REFUSE],
  [".a { box-shadow: var(--sheet-shadow); }", PASS],
  [".a { box-shadow: 0 12px 35px red; }", PASS],
  [".a { box-shadow: 0 12em 34em red; }", PASS],
  [".a { box-shadow: 0 calc(12px * var(--fit)) calc(34px * var(--fit)) red; }", PASS],
  ["/* 0 12px 34px, named in a comment */", PASS],
];

test("no sheet writes a depth shadow's geometry longhand, in any property, at a zero of any unit, and only public/shell.css declares the token itself (Issue #367, Issue #463, Issue #779 part 2d)", async () => {
  const blind =
    "BLIND SPOTS, declared, each a miss: the geometry inside a string or a url(); the geometry as calc() terms or in a unit other than px";
  await assertRefuses(SHADOW_PLANT(false), "public/house.css", SHADOW, blind);
  await assertRefuses(SHADOW_PLANT(true), "public/shell.css", SHADOW, blind);
});

const VAR_PLANT: Plant = [
  [".a { color: var(--no-such-token); }", REFUSE],
  [".a { color: var(--no-such-token, var(--no-such-ink)); }", REFUSE],
  [".a { --x: 0 1px var(--no-such-token); }", REFUSE],
  [".a { --x: var(--a, var(--no-such-token)); }", REFUSE],
  [".a { color: VAR(--no-such-token); }", REFUSE],
  [".a { color: var(--no-such-token, red); }", PASS],
  [".a { --own: 1px; width: var(--own); }", PASS],
  [".a { color: var(--ink-dark); }", PASS],
];

test("every var() with no fallback names a property some sheet under public/ or the file itself declares, read through fallbacks and custom properties (Issue #263, Issue #779 part 2d)", async () => {
  const blind =
    "BLIND SPOTS, declared: the declared set does not know which page loads which sheet (a pass); the builders' markup outside their CSS is not read, where the old drift guard read their whole source (a miss, handbook/errata/guards.md)";
  await assertRefuses(VAR_PLANT, "public/house.css", VAR, blind);
  const spread: Plant = [
    [".a { height: var(--band-h); }", PASS],
    [".a { transform: translateY(var(--raise)); }", PASS],
    [".a { color: var(--no-such-token); }", REFUSE],
  ];
  await assertRefuses(
    spread,
    "public/house.css",
    VAR,
    "a var only public/shell.css or only public/motion.css declares is read off the disk",
  );
  assert.deepEqual(
    await reported(spread, "public/shell.css", VAR),
    [1, 3],
    "linting public/shell.css, its own disk copy is not read: only the text being linted declares for it",
  );
  assert.deepEqual(
    await reported(spread, "public/motion.css", VAR),
    [2, 3],
    "and linting public/motion.css, its own disk copy is not read either",
  );
});

test("the declared set reads a custom property wherever a sheet declares one, and nothing else (Issue #779 part 2d)", () => {
  assert.deepEqual(
    [...declaredIn([":root { --a: 1px; } @media print { .x { --b: red; color: var(--c); } } /* --d: 2px; */"])].sort(),
    ["--a", "--b"],
  );
});

const failing =
  (code: string, at: string, readDir: ReadDir): ReadDir =>
  (dir) => {
    if (dir.endsWith(at)) throw Object.assign(new Error(`${code}: ${dir}`), { code });
    return readDir(dir);
  };

test("the sheets the declared set reads are every .css file under public/ but a generated tree's, and a directory that vanishes mid-walk is skipped (Issue #709, Issue #779 part 2d)", () => {
  const root = mkdtempSync(join(tmpdir(), "vellum-sheets-"));
  const onDisk: ReadDir = (dir) => readdirSync(dir, { withFileTypes: true });
  try {
    for (const path of [
      "public/a.css",
      "public/room/index.css",
      "public/gallery/index.css",
      "public/fonts/face.css",
      "public/explorer/chunks/x.css",
      "public/b.txt",
    ]) {
      mkdirSync(dirname(join(root, path)), { recursive: true });
      writeFileSync(join(root, path), "");
    }
    assert.deepEqual(sheetsOnDisk(root), ["public/a.css", "public/room/index.css"]);
    assert.deepEqual(
      sheetsOnDisk(root, failing("ENOENT", "room", onDisk)),
      ["public/a.css"],
      "a directory the build cleans away during the walk is skipped, not thrown",
    );
    assert.throws(() => sheetsOnDisk(root, failing("EACCES", "room", onDisk)), /EACCES/, "any other failure is thrown");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
  assert.ok(sheetsOnDisk().includes("public/shell.css"), "the walk of the real tree reads public/shell.css");
});

const BUILDER_PLANT: Plant = [
  ["export const a = 'fill=\"rgb(74 56 38)\"';", REFUSE],
  ['export const b = "rgb(74, 56, 38)";', REFUSE],
  ["export const c = `box-shadow: 0 1px 2px rgba(74 56 38 / 0.4)`;", REFUSE],
  ['export const g = "RGB(74 56 38)";', REFUSE],
  ['export const h = "rgb( 74 56 38)";', REFUSE],
  ['export const i = "rgb(74 56 38.5)";', PASS],
  ["export const d = (x: number): string => `rgb(${String(x)} 56 38)`;", PASS],
  ['export const e = "rgb(from var(--ink-dark) r g b / 0.5)";', PASS],
  ['export const f = "rgb(74 56 380)";', PASS],
  ["// rgb(74 56 38), named in a comment, a control no syntax-tree mutation reaches", PASS],
];

test("the modules that build CSS write no token's rgb in any string they hold, in either form (Issue #709 ruling 3, Issue #779 part 2d)", async () => {
  const blind = "BLIND SPOT, declared, a miss: an rgb() split across a template's ${} boundary";
  await assertRefuses(BUILDER_PLANT, "src/render/og-card.ts", BUILDER, blind);
});

const resolvedRule = async (file: string, rule: string): Promise<unknown> =>
  ((await eslint.calculateConfigForFile(file)) as { rules?: Record<string, unknown> }).rules?.[rule];

test("the three sheet rules resolve at error on every sheet and on no script; the builder rule on exactly the modules that build CSS (Issue #779 part 2d)", async () => {
  for (const rule of [TOKEN, SHADOW, VAR]) {
    for (const file of [WITNESSES["public/**/*.css"]!, "public/zz-new-room/index.css"])
      assert.deepEqual(await resolvedRule(file, rule), [2], `${rule} does not resolve at error on ${file}`);
    for (const root of lintTsRoots())
      assert.equal(
        await resolvedRule(WITNESSES[`${root}/**/*.ts`]!, rule),
        undefined,
        `${rule} reaches a ${root} script`,
      );
  }
  for (const file of SRC_CSS_FILES)
    assert.deepEqual(await resolvedRule(file, BUILDER), [2], `${BUILDER} does not resolve at error on ${file}`);
  for (const file of [WITNESSES["src/**/*.ts"]!, "src/cli/zz-new.ts", WITNESSES["public/**/*.css"]!])
    assert.equal(await resolvedRule(file, BUILDER), undefined, `${BUILDER} reaches ${file}, which builds no CSS`);
});
