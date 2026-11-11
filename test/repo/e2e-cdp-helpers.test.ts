import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { CDP_HOMES } from "../../scripts/lint/e2e-cdp-helpers.ts";
import { lintTsRoots } from "../../test-support/lint-roots.ts";
import { WITNESSES } from "../../test-support/lint-witnesses.ts";
import { plantMessages, resolvedRule, ruleLines } from "../../test-support/source-shape-reports.ts";

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

test("the rule resolves at error on every e2e file at any depth and on no other root or sheet", async () => {
  const roots = lintTsRoots();
  assert.ok(roots.includes("e2e") && roots.length > 1, "the lint's roots are not what this sweep expects");
  for (const root of roots) {
    const witness = WITNESSES[`${root}/**/*.ts`];
    assert.ok(witness !== undefined && existsSync(join(ROOT, witness)), `${root} has no existing witness`);
    const want = root === "e2e" ? [2] : undefined;
    for (const file of [witness, `${root}/nested/deeper/part.ts`])
      assert.deepEqual(await resolvedRule(file, RULE), want, `${RULE} resolves wrongly on ${file}`);
  }
  assert.equal(await resolvedRule(WITNESSES["src/styles/**/*.css"]!, RULE), undefined, `${RULE} reaches a sheet`);
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

const SCRIPTS_OFF_HOME = "e2e/support/scripts-off.ts";
const SCRIPTS_OFF_PLANT: ReadonlyArray<readonly [string, boolean]> = [
  ['import type { SuiteContext } from "../../types.ts";', PASS],
  [
    'export const a = (ctx: SuiteContext) => ctx.send("Emulation.setScriptExecutionDisabled", { value: true });',
    REFUSE,
  ],
  [
    'export const b = ({ send }: SuiteContext) => send("Emulation.setScriptExecutionDisabled", { value: false });',
    REFUSE,
  ],
  [
    "export const c = (ctx: SuiteContext) => ctx.send(`Emulation.setScriptExecutionDisabled`, { value: true });",
    REFUSE,
  ],
  [
    'export const d = (ctx: SuiteContext) => ctx["send"]("Emulation.setScriptExecutionDisabled", { value: true });',
    REFUSE,
  ],
  [
    'const METHOD = "Emulation.setScriptExecutionDisabled"; export const e = (ctx: SuiteContext) => ctx.send(METHOD);',
    REFUSE,
  ],
  ["// Emulation.setScriptExecutionDisabled, named in a comment, which switches nothing", PASS],
  ['export const f = "scripts go off through Emulation.setScriptExecutionDisabled\'s one helper";', PASS],
  ['export const g = (ctx: SuiteContext) => ctx.send("Emulation.setEmulatedMedia", { media: "print" });', PASS],
  [
    'const s = "x"; export const i = (ctx: SuiteContext) => ctx.send(`Emulation.setScriptExecutionDisabled${s}`);',
    PASS,
  ],
  [
    'export const h = (ctx: SuiteContext) => ctx.send("Emulation." + "setScriptExecutionDisabled", { value: true });',
    PASS,
  ],
  [
    'import { SWITCH } from "../../test-support/cdp-methods.ts"; export const j = (ctx: SuiteContext) => ctx.send(SWITCH);',
    PASS,
  ],
];
const SCRIPTS_OFF_BLIND_SPOT =
  "BLIND SPOTS, declared, each erring toward passing: the method's name assembled from pieces, and the whole name held in a binding the file never spells, such as a constant imported from a file the rule does not read (the last two plant lines); no syntax read of the one file can resolve either";

test("no e2e file names the scripts-off switch but its one helper, which always turns scripts back on (Issue #779)", async () => {
  const refused = refusedOf(SCRIPTS_OFF_PLANT);
  assert.ok(
    refused.length > 0 && refused.length < SCRIPTS_OFF_PLANT.length,
    "the plant cannot tell the rule from its negation",
  );
  assert.deepEqual(await linted(SCRIPTS_OFF_PLANT, "e2e/suites/document-rooms.ts"), refused, SCRIPTS_OFF_BLIND_SPOT);
  assert.deepEqual(
    await linted(SCRIPTS_OFF_PLANT, "e2e/support/settle.ts"),
    refused,
    "a support module that is not the helper",
  );
  assert.deepEqual(
    await linted(SCRIPTS_OFF_PLANT, SCRIPTS_OFF_HOME),
    [],
    "the helper itself is refused the switch it exists to hold",
  );
  const [why] = (
    await plantMessages(
      SCRIPTS_OFF_PLANT.map(([line]) => line),
      "e2e/suites/document-rooms.ts",
    )
  ).filter((m) => m.ruleId === RULE);
  assert.match(
    why?.message ?? "",
    /withScriptsOff always turns page scripts back on/,
    "the refusal no longer says why the switch has one helper",
  );
});

const MOUSE_PLANT: ReadonlyArray<readonly [string, boolean]> = [
  ['import type { SuiteContext } from "../../types.ts";', PASS],
  [
    'export const a = (ctx: SuiteContext) => ctx.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });',
    REFUSE,
  ],
  [
    'export const b = ({ send }: SuiteContext) => send("Input.dispatchMouseEvent", { type: "mousePressed", x: 1, y: 1, button: "left", clickCount: 1 });',
    REFUSE,
  ],
  [
    'export const c = (ctx: SuiteContext) => ctx.send(`Input.dispatchMouseEvent`, { type: "mouseWheel", x: 1, y: 1, deltaX: 0, deltaY: 120 });',
    REFUSE,
  ],
  [
    'export const d = (ctx: SuiteContext) => ctx["send"]("Input.dispatchMouseEvent", { type: "mouseReleased", x: 1, y: 1 });',
    REFUSE,
  ],
  ['const METHOD = "Input.dispatchMouseEvent"; export const e = (ctx: SuiteContext) => ctx.send(METHOD);', REFUSE],
  ["// Input.dispatchMouseEvent, named in a comment, which presses nothing", PASS],
  ['export const f = "a click goes through Input.dispatchMouseEvent\'s one home";', PASS],
  [
    'export const g = (ctx: SuiteContext) => ctx.send("Input.synthesizePinchGesture", { x: 1, y: 1, scaleFactor: 2, gestureSourceType: "touch" });',
    PASS,
  ],
  ['const s = "Mouse"; export const h = (ctx: SuiteContext) => ctx.send(`Input.dispatch${s}Event`);', PASS],
  ['export const i = (ctx: SuiteContext) => ctx.send("Input." + "dispatchMouseEvent", { type: "mouseMoved" });', PASS],
  [
    'import { MOUSE } from "../../test-support/cdp-methods.ts"; export const j = (ctx: SuiteContext) => ctx.send(MOUSE);',
    PASS,
  ],
  [
    "export const k = (ctx: SuiteContext) => ctx.evaluate('document.body.dispatchEvent(new MouseEvent(\"click\", { bubbles: true }))');",
    PASS,
  ],
];
const MOUSE_BLIND_SPOT =
  "BLIND SPOTS, declared, each erring toward passing: the method's name assembled from pieces or from a template holding an expression, and a name held in a binding the file never spells (plant lines 10 to 12), since no syntax read of one file resolves either; a click, drag or hover written by hand on top of the shared helpers, since the rule reads spellings and not what a function does; and a mouse event made inside the page through evaluate (plant line 13), which no CDP spelling carries. A synthesized gesture is no row (plant line 9)";

test("no e2e file sends a mouse event but through its one home, e2e/support/input.ts, the harness's wheel and the home page's click included (Issue #1016)", async () => {
  const refused = refusedOf(MOUSE_PLANT);
  assert.ok(
    refused.length > 0 && refused.length < MOUSE_PLANT.length,
    "the plant cannot tell the rule from its negation",
  );
  assert.deepEqual(await linted(MOUSE_PLANT, "e2e/suites/document-rooms.ts"), refused, MOUSE_BLIND_SPOT);
  assert.deepEqual(
    await linted(MOUSE_PLANT, "e2e/harness.ts"),
    refused,
    "the harness wheels through the home, never on a spelling of its own",
  );
  assert.deepEqual(
    await linted(MOUSE_PLANT, "e2e/support/home.ts"),
    refused,
    "clickAt and makeMouse press through the home",
  );
  assert.deepEqual(await linted(MOUSE_PLANT, HOME), [], "the home itself is refused the method it exists to hold");
});

const TOUCH_PLANT: ReadonlyArray<readonly [string, boolean]> = [
  ['import type { SuiteContext } from "../../types.ts";', PASS],
  [
    'export const a = (ctx: SuiteContext) => ctx.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 1, y: 1, id: 1 }] });',
    REFUSE,
  ],
  [
    'export const b = ({ send }: SuiteContext) => send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });',
    REFUSE,
  ],
  [
    'export const c = (ctx: SuiteContext) => ctx.send(`Input.dispatchTouchEvent`, { type: "touchEnd", touchPoints: [] });',
    REFUSE,
  ],
  ['const METHOD = "Input.dispatchTouchEvent"; export const d = (ctx: SuiteContext) => ctx.send(METHOD);', REFUSE],
  ["// Input.dispatchTouchEvent, named in a comment, which touches nothing", PASS],
  [
    'export const e = (ctx: SuiteContext) => ctx.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });',
    PASS,
  ],
  [
    'export const f = (ctx: SuiteContext) => ctx.send("Input.synthesizeScrollGesture", { x: 1, y: 1, yDistance: -500, gestureSourceType: "touch" });',
    PASS,
  ],
  ['export const g = (ctx: SuiteContext) => ctx.send("Input." + "dispatchTouchEvent", { type: "touchEnd" });', PASS],
  [
    "export const h = (ctx: SuiteContext) => ctx.evaluate('document.body.dispatchEvent(new TouchEvent(\"touchstart\"))');",
    PASS,
  ],
];
const TOUCH_BLIND_SPOT =
  "BLIND SPOTS, declared, each erring toward passing: the method's name assembled from pieces (plant line 9); a tap or a pinch written by hand on top of sendTouch or the harness's touch; and a touch made inside the page through evaluate (plant line 10). The touch emulation switch and a synthesized gesture are no rows (plant lines 7 and 8)";

test("no e2e file sends a touch event but through its one home, e2e/support/input.ts, the harness's touch included (Issue #1016)", async () => {
  const refused = refusedOf(TOUCH_PLANT);
  assert.ok(
    refused.length > 0 && refused.length < TOUCH_PLANT.length,
    "the plant cannot tell the rule from its negation",
  );
  assert.deepEqual(await linted(TOUCH_PLANT, "e2e/suites/cards/hold.ts"), refused, TOUCH_BLIND_SPOT);
  assert.deepEqual(
    await linted(TOUCH_PLANT, "e2e/harness.ts"),
    refused,
    "the harness touches through the home, never on a spelling of its own",
  );
  assert.deepEqual(await linted(TOUCH_PLANT, HOME), [], "the home itself is refused the method it exists to hold");
});
