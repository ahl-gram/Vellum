import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { CDP_HOMES } from "../../scripts/lint/e2e-cdp-helpers.ts";
import { lintTsRoots } from "../../test-support/lint-roots.ts";
import { WITNESSES } from "../../test-support/lint-witnesses.ts";
import { eslint, ruleLines } from "../../test-support/source-shape-reports.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
const RULE = "vellum/e2e-cdp-through-helper";
const HOME = "e2e/support/input.ts";

const REFUSE = true;
const PASS = false;
const PLANT: ReadonlyArray<readonly [string, boolean]> = [
  ['import type { SuiteContext } from "../../types.ts";', PASS],
  [
    'export const a = (ctx: SuiteContext) => ctx.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab" });',
    REFUSE,
  ],
  [
    'export const b = ({ send }: SuiteContext) => send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab" });',
    REFUSE,
  ],
  [
    'export const c = (ctx: SuiteContext) => ctx.send(`Input.dispatchKeyEvent`, { type: "rawKeyDown", key: "Tab" });',
    REFUSE,
  ],
  [
    'export const d = (ctx: SuiteContext) => ctx["send"]("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter" });',
    REFUSE,
  ],
  ['const METHOD = "Input.dispatchKeyEvent"; export const e = (ctx: SuiteContext) => ctx.send(METHOD);', REFUSE],
  ["// Input.dispatchKeyEvent, named in a comment, which presses nothing", PASS],
  ['export const f = "a key press goes through Input.dispatchKeyEvent\'s one home";', PASS],
  ['export const g = (ctx: SuiteContext) => ctx.send("Input.insertText", { text: "x" });', PASS],
  ['const s = "x"; export const h = (ctx: SuiteContext) => ctx.send(`Input.dispatchKeyEvent${s}`);', PASS],
  ['export const i = (ctx: SuiteContext) => ctx.send("Input." + "dispatchKeyEvent", { type: "keyDown" });', PASS],
  [
    'import { KEY } from "../../test-support/cdp-methods.ts"; export const j = (ctx: SuiteContext) => ctx.send(KEY);',
    PASS,
  ],
  ['export const k = ["constructor", "toString", "hasOwnProperty"];', PASS],
];
const REFUSED = PLANT.flatMap(([, refused], i) => (refused ? [i + 1] : []));
const BLIND_SPOT =
  "BLIND SPOTS, declared, each erring toward passing: a method name assembled from pieces or from a template holding an expression, and a name held in a binding the file never spells, such as a constant imported from a file the rule does not read (plant lines 10 to 12), since no syntax read of one file resolves either; and a press written by hand on top of sendKey, keyDown or keyUp, since the rule reads spellings and not what a function does. Input.insertText sends text and no key event, and is no row (plant line 9)";

const reported = (path: string): Promise<number[]> =>
  ruleLines(
    PLANT.map(([line]) => line),
    path,
    RULE,
  );

test("no e2e file sends a key event but through its one home, e2e/support/input.ts (Issue #1016)", async () => {
  assert.ok(REFUSED.length > 0 && REFUSED.length < PLANT.length, "the plant cannot tell the rule from its negation");
  assert.deepEqual(await reported("e2e/suites/document-rooms.ts"), REFUSED, BLIND_SPOT);
  assert.deepEqual(
    await reported("e2e/support/home.ts"),
    REFUSED,
    "a support module that is not the home, sendKey's own until Issue #1016",
  );
  assert.deepEqual(await reported(HOME), [], "the home itself is refused the method it exists to hold");
});

const resolvedRule = async (file: string): Promise<unknown> =>
  ((await eslint.calculateConfigForFile(file)) as { rules?: Record<string, unknown> }).rules?.[RULE];

test("the rule resolves at error on every e2e file at any depth and on no other root or sheet", async () => {
  const roots = lintTsRoots();
  assert.ok(roots.includes("e2e") && roots.length > 1, "the lint's roots are not what this sweep expects");
  for (const root of roots) {
    const witness = WITNESSES[`${root}/**/*.ts`];
    assert.ok(witness !== undefined && existsSync(join(ROOT, witness)), `${root} has no existing witness`);
    const want = root === "e2e" ? [2] : undefined;
    for (const file of [witness, `${root}/nested/deeper/part.ts`])
      assert.deepEqual(await resolvedRule(file), want, `${RULE} resolves wrongly on ${file}`);
  }
  assert.equal(await resolvedRule(WITNESSES["src/styles/**/*.css"]!), undefined, `${RULE} reaches a sheet`);
});

test("each row's home is a file in the tree, and its method is refused in a suite and passes at its home", async () => {
  assert.ok(CDP_HOMES.size > 0, "the rule has no row");
  for (const [spelling, home] of CDP_HOMES) {
    assert.ok(existsSync(join(ROOT, home)), `${spelling}'s home ${home} is not in the tree`);
    const lines = [`export const a = "${spelling}";`, "export const b = `" + spelling + "`;"];
    assert.deepEqual(await ruleLines(lines, "e2e/suites/cards.ts", RULE), [1, 2], `${spelling} passes in a suite`);
    assert.deepEqual(await ruleLines(lines, home, RULE), [], `${spelling} is refused at its own home`);
  }
});

const linted = (plant: ReadonlyArray<readonly [string, boolean]>, path: string): Promise<number[]> =>
  ruleLines(
    plant.map(([line]) => line),
    path,
    RULE,
  );
const refusedOf = (plant: ReadonlyArray<readonly [string, boolean]>): number[] =>
  plant.flatMap(([, refused], i) => (refused ? [i + 1] : []));

const HOP_HOME = "e2e/support/nav.ts";
const HOP_PLANT: ReadonlyArray<readonly [string, boolean]> = [
  ['import type { SuiteContext } from "../../types.ts";', PASS],
  ['export const a = (ctx: SuiteContext) => ctx.send("Page.navigate", { url: "about:blank" });', REFUSE],
  ['export const b = ({ send }: SuiteContext) => send("Page.navigate", { url: `about:blank` });', REFUSE],
  ['export const c = ["--headless=new", "--window-size=1280,2400", "about:blank"];', REFUSE],
  [
    'const AWAY = "about:blank"; export const d = (ctx: SuiteContext) => ctx.send("Page.navigate", { url: AWAY });',
    REFUSE,
  ],
  ["// a hop leaves through about:blank, named in a comment, which navigates nowhere", PASS],
  ['export const e = "every fresh address arrives through about:blank first";', PASS],
  ['export const f = (ctx: SuiteContext) => ctx.send("Page.navigate", { url: "about:" + "blank" });', PASS],
  [
    'const s = "blank"; export const g = (ctx: SuiteContext) => ctx.send("Page.navigate", { url: `about:${s}` });',
    PASS,
  ],
  [
    'import { ABOUT_BLANK } from "../../support/nav.ts"; export const h = (ctx: SuiteContext) => ctx.send("Page.navigate", { url: ABOUT_BLANK });',
    PASS,
  ],
  ['export const i = (ctx: SuiteContext) => ctx.send("Page.navigate", { url: "http://127.0.0.1:8765/faq/" });', PASS],
];
const HOP_BLIND_SPOT =
  "BLIND SPOTS, declared, each erring toward passing: the address assembled from pieces or from a template holding an expression (plant lines 8 and 9), and ABOUT_BLANK imported from its home and handed to a raw Page.navigate (plant line 10), since no syntax read of one file resolves either; and a hop written by hand on top of leaveBlank or bounce, since the rule reads spellings and not what a function does. A navigate to any other address is no row (plant line 11)";

test("no e2e file names about:blank but its one home, e2e/support/nav.ts, the harness's launch argument included (Issue #1016)", async () => {
  const refused = refusedOf(HOP_PLANT);
  assert.ok(
    refused.length > 0 && refused.length < HOP_PLANT.length,
    "the plant cannot tell the rule from its negation",
  );
  assert.deepEqual(await linted(HOP_PLANT, "e2e/suites/document-rooms.ts"), refused, HOP_BLIND_SPOT);
  assert.deepEqual(
    await linted(HOP_PLANT, "e2e/harness.ts"),
    refused,
    "the harness launches its browser on ABOUT_BLANK from the home, never on a spelling of its own",
  );
  assert.deepEqual(await linted(HOP_PLANT, HOP_HOME), [], "the home itself is refused the address it exists to hold");
});
