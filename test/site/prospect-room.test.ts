import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// What no browser here can see of the Prospect, kept for Issue #779 part 2i: the room's markup, dress and behaviour are read in e2e/suites/prospect/ (PB12 to PB18) and e2e/suites/prospect.ts.
const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => (existsSync(resolve(REPO, p)) ? readFileSync(resolve(REPO, p), "utf8") : "");
const css = read("public/prospect/index.css");
const app = read("src/site/prospect/app.ts");
const seats = read("src/site/prospect/seats.ts");

test("PPR6 seats.ts imports the shared room, the shared camera and the kit's keys", () => {
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
});

test("PPR7 the css carries no rule for furniture a chart room retired, seats the plate by inset and width, and ends with its print block, whose stage arm the kit's own stage rule decides", () => {
  assert.doesNotMatch(
    css,
    /(^|\n)\s*(header|footer|\.plate-figure|\.actions|main)\s*[{,]/,
    "no rule targets furniture a chart room no longer has",
  );
  assert.match(
    css,
    /#pp-plate\s*\{[^}]*inset:\s*0;[^}]*width:\s*100%/,
    "the plate is seated by inset and width, which the sheet's own proportion makes redundant today",
  );
  const print = css.match(/@media print\s*\{([\s\S]*)\}\s*$/);
  assert.ok(print, "the page css ends with its print stand-down");
  assert.match(print[1]!, /\.stage\s*\{[^}]*position:\s*static/, "the plate prints in flow");
  assert.match(print[1]!, /#pp-plate\s*\{[^}]*height:\s*auto/, "at its own proportion, by height auto");
});

test("PR-lay the filing handler keeps the gate's own answer and reads its refusal before the table moves, and the press's own rule is declared once (#522)", () => {
  const from = app.indexOf('layPress.addEventListener("click"');
  assert.notEqual(from, -1, "the press is no longer wired, so the assertions below read an empty slice");
  const handler = app.slice(from, app.indexOf("\n});", from));
  assert.match(
    handler,
    /\btable = laid\.items\b/,
    "the gate's answer is discarded and the table is built some other way, so the dedupe and the cap decide nothing here",
  );
  assert.ok(
    handler.indexOf("laid.refused") < handler.indexOf("table = laid.items"),
    "the refusal is read after the table has already moved, so a refused filing still writes",
  );
  const rule = css.match(/(^|\n)\.pp-lay\s*\{[^}]*\}/g) ?? [];
  assert.equal(rule.length, 1, "public/prospect/index.css declares .pp-lay's own rule once, or the last one wins");
});

test("PR-table the filing handler writes the device before the address (#634)", () => {
  const from = app.indexOf('layPress.addEventListener("click"');
  assert.notEqual(from, -1, "the filing press has no handler, so this guard reads the whole file");
  const handler = app.slice(from, app.indexOf("\n});", from));
  assert.ok(
    handler.includes("writeStoredTable"),
    "the handler no longer writes the device, so the order below reads nothing",
  );
  assert.ok(
    handler.indexOf("writeStoredTable") < handler.indexOf("history.replaceState"),
    "the device is written after the address, which is a second order to keep in step for no reason",
  );
});
