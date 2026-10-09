import { test } from "node:test";
import assert from "node:assert/strict";
import { join, resolve } from "node:path";
import { ESLint } from "eslint";
import { kitClassesFrom } from "../../scripts/lint/sheet-owners.ts";
import { lintTsRoots } from "../../test-support/lint-roots.ts";
import { WITNESSES } from "../../test-support/lint-witnesses.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const eslint = new ESLint({ cwd: ROOT, flags: ["unstable_native_nodejs_ts_config"] });
const INTRO = "vellum/css-house-owns-intro";
const CONTROLS = "vellum/css-house-owns-controls";
const KIT = "vellum/css-kit-not-redressed";
const ROW = "vellum/css-kit-owns-contents-row";
const SELECT = "vellum/css-kit-owns-select-dress";
const ENGINE = "vellum/css-engine-dress-one-home";
const HOST_ID = "vellum/css-engine-no-host-id";

const REFUSE = true;
const PASS = false;
type Plant = ReadonlyArray<readonly [string, boolean]>;

const reported = async (plant: Plant, path: string, rule: string): Promise<number[]> => {
  const [result] = await eslint.lintText(plant.map(([line]) => line).join("\n"), { filePath: join(ROOT, path) });
  assert.deepEqual(
    result!.messages.filter((m) => m.fatal).map((m) => m.message),
    [],
    `the plant at ${path} does not parse, so no rule read it`,
  );
  return [...new Set(result!.messages.filter((m) => m.ruleId === rule).map((m) => m.line))];
};

const assertRule = async (
  plant: Plant,
  rule: string,
  refusedAt: string,
  passedAt: readonly string[],
): Promise<void> => {
  const refused = plant.flatMap(([, r], i) => (r ? [i + 1] : []));
  assert.ok(
    refused.length > 0 && refused.length < plant.length,
    `${rule}'s plant cannot tell the rule from its negation`,
  );
  assert.deepEqual(await reported(plant, refusedAt, rule), refused, `${rule} at ${refusedAt}`);
  for (const path of passedAt)
    assert.deepEqual(await reported(plant, path, rule), [], `${rule} reports at ${path}, the file that owns the rule`);
};

test("no sheet but public/house.css binds the intro voice: a colour, a face or a style on a rule naming the intro class (Issue #324, Issue #709, Issue #779 part 2d)", async () => {
  const plant: Plant = [
    [".intro { color: var(--ink-faded); }", REFUSE],
    [".hunt-intro.intro { font-style: normal; }", REFUSE],
    [".intro a { font-family: serif; }", REFUSE],
    [".x, .intro { font: italic 1rem serif; }", REFUSE],
    [".intro { text-align: left; }", PASS],
    [".intro { background-color: red; }", PASS],
    [".x:not(.intro) { color: red; }", PASS],
    [".introduction { color: red; }", PASS],
    ["/* .intro { color: red; } */", PASS],
  ];
  await assertRule(plant, INTRO, "public/index.css", ["public/house.css"]);
});

test("no sheet but public/house.css dresses the controls: a background on a list with a select arm and a button arm (Issue #324, Issue #709, Issue #779 part 2d)", async () => {
  const plant: Plant = [
    ["select, button { background: var(--parchment); }", REFUSE],
    [".x select, .x button { background-color: red; }", REFUSE],
    ["button, select:hover { background-image: none; }", REFUSE],
    ["select, button { color: red; }", PASS],
    ["select { background: red; }", PASS],
    [".x select, .y { background: red; }", PASS],
    ["select .button { background: red; }", PASS],
    [".x select button { background: red; }", PASS],
  ];
  await assertRule(plant, CONTROLS, "public/print-room/index.css", ["public/house.css"]);
});

const KIT_PLANT: Plant = [
  [".legend .legend-head { display: block; color: red; }", REFUSE],
  [".slip-head h2 { color: var(--ink-brown); }", REFUSE],
  [".legend-btn .room { color: red; }", REFUSE],
  ...["sheet", "map-viewport", "map", "zoom-in", "zoom-out", "zoom-reset"].map(
    (id) => [`#${id} .legend-head { color: red; }`, REFUSE] as const,
  ),
  ...[
    "background-color",
    "background-image",
    "border-top",
    "outline",
    "outline-color",
    "font-weight",
    "letter-spacing",
    "text-decoration",
    "text-transform",
  ].map((property) => [`.slip { ${property}: inherit; }`, REFUSE] as const),
  [".cr-num { color: red; }", REFUSE],
  ["label .legend-head { color: red; }", REFUSE],
  [".legend select .legend-head { color: red; }", REFUSE],
  [".slip { background-position: 0 0; }", PASS],
  ...["select", "input", "option", "optgroup", "textarea", "label"].map(
    (element) => [`.legend-head ${element} { color: red; }`, PASS] as const,
  ),
  [".slip:not(.page-own) { color: red; }", PASS],
  [".legend-head, .slip .cr-num { font-style: italic; }", REFUSE],
  [".zoom-btn { box-shadow: none; }", REFUSE],
  [".folded { opacity: 0.5; }", REFUSE],
  [":is(.slip, .legend) { border: 0; }", REFUSE],
  [".slip { top: 9rem; bottom: 4rem; }", PASS],
  [".legend-head select { color: red; }", PASS],
  [".contents li.on .cr-num { color: red; }", PASS],
  ["#pr-page .cr-num { color: red; }", PASS],
  [".control, .primary, .status, .chrome, .intro { color: red; }", PASS],
  [".strip { color: red; }", PASS],
];

test("no page sheet re-dresses the kit: a colour, border, shadow, face or tracking on an arm of kit classes alone, unless the arm names the page's own id or its subject is the page's own form control (Issue #487, Issue #779 part 2d)", async () => {
  await assertRule(KIT_PLANT, KIT, "public/specimen/index.css", [
    "public/atelier.css",
    "public/house.css",
    "public/motion.css",
    "public/shell.css",
    "public/fonts.css",
    "public/atelier-split.css",
  ]);
  assert.deepEqual(
    await reported(KIT_PLANT, "public/home-noscript.css", KIT),
    await reported(KIT_PLANT, "public/specimen/index.css", KIT),
    "home's scripts-off sheet is a page sheet, read as every page sheet is",
  );
});

test("the kit's classes are every class an atelier sheet names, less the house sheets' own and the strip, with the road's room (Issue #487, Issue #779 part 2d)", () => {
  assert.deepEqual(
    [...kitClassesFrom([".a, .b .c:hover { color: red; } .strip {} @media print { .d {} }"], [".b {}"])].sort(),
    ["a", "c", "d", "room"],
  );
  assert.ok(
    !kitClassesFrom([".slip { top: 0; }"], [".slip { color: red; }"]).has("slip"),
    "a class a house sheet names too is not the kit's alone",
  );
});

test("no sheet but public/atelier.css dresses the kit's contents row or the corner's select (Issue #487, Issue #779 part 2d)", async () => {
  const row: Plant = [
    [".cr-num { color: var(--ink-dark); }", REFUSE],
    [".contents .cr-text { margin: 0; }", REFUSE],
    [".x, .cr-num { color: red; }", REFUSE],
    [".cr-text { color: red; }", REFUSE],
    [".contents .cr-num { color: red; }", REFUSE],
    [".contents li.on .cr-num { color: red; }", PASS],
    ['.itinerary .cr-num::after { content: " lg"; }', PASS],
    [".cr-numeral { color: red; }", PASS],
  ];
  for (const sheet of ["public/print-room/index.css", "public/prospect/index.css", "public/ribbon/index.css"])
    await assertRule(row, ROW, sheet, ["public/atelier.css"]);
  const select: Plant = [
    [".folio-controls select.control { appearance: none; }", REFUSE],
    [".folio-controls select.control { -webkit-appearance: none; }", REFUSE],
    [".folio-controls select.control { background-image: none; }", REFUSE],
    [".folio-controls select.control { background: none; }", REFUSE],
    [".folio-controls select.control { width: 7.4rem; }", PASS],
    [".folio-controls select.control option { appearance: none; }", PASS],
    [".folio-controls select.control, .x { appearance: none; }", REFUSE],
    [".folio .folio-controls select.control { appearance: none; }", REFUSE],
    ["body .folio-controls select.control { background-image: none; }", REFUSE],
    [".my-folio-controls select.control { appearance: none; }", PASS],
  ];
  for (const sheet of ["public/print-room/index.css", "public/ribbon/index.css"])
    await assertRule(select, SELECT, sheet, ["public/atelier.css"]);
});

test("the engine's dressing has one home, public/living-chart.css, which names no host's id (Issue #302, Issue #779 part 2d)", async () => {
  const hooks: Plant = [
    [".pc-name { font-weight: 700; }", REFUSE],
    [".place-overlay { inset: 0; }", REFUSE],
    [".place-hit:hover { color: red; }", REFUSE],
    ["#place-card { color: red; }", REFUSE],
    ['.living-chart g[data-ink="ruin"] { fill: red; }', REFUSE],
    [".voyage-wake { stroke: red; }", REFUSE],
    [".ages-range:focus-visible { outline: 0; }", REFUSE],
    ["button:not(.lf-station):not(.place-hit):hover { color: red; }", PASS],
    [".pcx, .voyager, .my-pc-name, .place-hits { color: red; }", PASS],
    ["/* .pc-name and #map, named in a comment */", PASS],
  ];
  await assertRule(hooks, ENGINE, "public/explorer/index.css", ["public/living-chart.css"]);
  const ids: Plant = [
    ["#map .place-overlay { inset: 0; }", REFUSE],
    [".x:not(#map) { color: red; }", REFUSE],
    ["#place-card.flip-h { left: 0; }", PASS],
    [".place-overlay { inset: 0; }", PASS],
    ["/* #map, named in a comment */", PASS],
  ];
  await assertRule(ids, HOST_ID, "public/living-chart.css", ["public/explorer/index.css"]);
});

const resolvedRule = async (file: string, rule: string): Promise<unknown> =>
  ((await eslint.calculateConfigForFile(file)) as { rules?: Record<string, unknown> }).rules?.[rule];

test("the seven owner rules resolve at error on every sheet and on no script (Issue #779 part 2d)", async () => {
  for (const rule of [INTRO, CONTROLS, KIT, ROW, SELECT, ENGINE, HOST_ID]) {
    for (const file of [WITNESSES["public/**/*.css"]!, "public/zz-new-room/index.css"])
      assert.deepEqual(await resolvedRule(file, rule), [2], `${rule} does not resolve at error on ${file}`);
    for (const root of lintTsRoots())
      assert.equal(
        await resolvedRule(WITNESSES[`${root}/**/*.ts`]!, rule),
        undefined,
        `${rule} reaches a ${root} script`,
      );
  }
});
