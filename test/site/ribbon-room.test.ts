import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// What no browser here can see of the Wayfarer's Ribbon, kept for Issue #779 part 2i: the room's markup, dress and behaviour are read in e2e/suites/ribbon/ (RB11 to RB16) and e2e/suites/ribbon.ts.
const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => (existsSync(resolve(REPO, p)) ? readFileSync(resolve(REPO, p), "utf8") : "");
const css = read("public/ribbon/index.css");
const printCss = read("public/print-room/index.css");
const seats = read("src/site/ribbon/seats.ts");

test("RBR6 seats.ts imports the shared room, the shared camera and the kit's keys, leans by its one constant, and the row's text is a module of its own", () => {
  assert.match(seats, /import\s*\{\s*bindRoom, type Room\s*\}\s*from\s*"\.\.\/shared\/room\.ts"/, "the shared room");
  assert.match(
    seats,
    /import\s*\{\s*createZoomController\s*\}\s*from\s*"\.\.\/shared\/zoom-controller\.ts"/,
    "the Glass is the shared controller",
  );
  assert.match(
    seats,
    /import\s*\{\s*bindGlassKeys\s*\}\s*from\s*"\.\.\/shared\/glass-keys\.ts"/,
    "its keys and buttons are the kit's",
  );
  assert.match(
    read("src/site/ribbon/row-text.ts"),
    /export function rowText\(/,
    "the row's text is a DOM-free module a unit test runs (skeptic round 3: regexed source is not a run)",
  );
  assert.match(
    seats,
    /\{ cx: nx, cy: ny, k: LEAN_K \}/,
    "a lean takes its depth from the one constant RB5c reads as 2.6",
  );
});

test("RBR7 the css carries no rule for furniture a chart room retired, and ends with its print block, whose stage arm the kit's own stage rule decides", () => {
  assert.doesNotMatch(
    css,
    /(^|\n)\s*(header|footer|\.plate-figure|\.actions|main)\s*[{,]/,
    "no rule targets furniture a chart room no longer has",
  );
  const print = css.match(/@media print\s*\{([\s\S]*)\}\s*$/);
  assert.ok(print, "the page css ends with its print stand-down");
  assert.match(print[1]!, /\.stage\s*\{[^}]*position:\s*static/, "the scroll prints in flow");
});

test("RBR8 the Print Room's sheet sizes its picker at the width the kit already gives", () => {
  assert.match(
    printCss,
    /\.folio-controls select\.control\s*\{\s*width:\s*7\.4rem;\s*\}/,
    "the Print Room keeps its picker's width at (0,2,1) (skeptic round 2)",
  );
});
