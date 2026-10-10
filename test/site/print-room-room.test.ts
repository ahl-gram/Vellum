import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// What no browser here can see of the Print Room, kept for Issue #779 part 2i: the room's markup, dress and behaviour are read in e2e/suites/print-room/ (PR20 to PR39) and by CD49 and CD49b.
const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");
const css = read("public/print-room/index.css");
const app = read("src/site/print-room/app.ts");
const seats = read("src/site/print-room/seats.ts");
const atlas = read("src/site/print-room/bound-atlas.ts");
const room = read("src/site/shared/room.ts");

test("PRR6 seats.ts imports the shared room, the shared camera and the kit's keys, room.ts takes an optional aspect, and a re-bind revokes the previous plates only once the new ones are on the page and keeps a failed re-bind's atlas deliverable", () => {
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
  assert.match(room, /readonly aspect\?: \(\) => number \| null;/, "room.ts takes an optional aspect override");
  const bind = atlas.slice(atlas.indexOf("function bindAtlas"), atlas.indexOf("function printAtlas"));
  assert.ok(bind.length > 0, "bindAtlas was not found, so the assertions below read an empty slice");
  assert.ok(
    bind.indexOf("revokeObjectURL") > bind.indexOf("renderBoundAtlas(res.atlas)"),
    "a re-bind revokes the previous plates only after the new ones are on the page (a click mid-bind turned a revoked blob, skeptic on PR #496)",
  );
  assert.match(
    bind,
    /if \(lastAtlas !== null\) setDeliveryEnabled\(true\)/,
    "a failed re-bind leaves the previous atlas deliverable",
  );
});

test("PRR7 the css carries no rule for the desk a chart room retired, and ends with its print block, whose unbound stage arm the kit's own stage rule decides", () => {
  assert.ok(
    !/max-width:\s*1000px/.test(css) && !css.includes(".order-desk") && !css.includes(".offering"),
    "the desk's column and cards are gone: the chart is the room",
  );
  const print = css.match(/@media print\s*\{([\s\S]*)\}\s*$/);
  assert.ok(print, "the page css ends with its print stand-down");
  assert.match(print[1]!, /\.stage\s*\{[^}]*position:\s*static/, "unbound, the proof prints in flow");
  assert.doesNotMatch(
    print[1]!,
    /> header|\.room-head|> footer|\.order-desk|\.counter/,
    "no rule targets furniture a chart room no longer has",
  );
});

test("PRR9 the room's aspect asks the page face before the turned plate", () => {
  assert.match(
    app,
    /matterAspect\(furniture\) \?\? sheetAspect\(\)/,
    "the room's aspect asks the page first, then the turned plate",
  );
});

test("PRR10 the page face's scale derives from the measure's one reference width", () => {
  assert.match(seats, /clientWidth \/ PAGE_MEASURE_WIDTH/, "seats.ts scales the inner by the one reference width");
});

test("PRR-table the road on to the Portfolio is written in one place", () => {
  assert.equal(
    (app.match(/folioRoad\.href\s*=/g) ?? []).length,
    1,
    "the folio road is written in more than one place, and the last write is the one the reader presses",
  );
});
