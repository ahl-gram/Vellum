import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// What no browser here can see of the Print Room, kept at the close of Issue #779: the room's markup, dress and behaviour are read in e2e/suites/print-room/ (PR20 to PR39) and by CD49 and CD49b.
const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");
const atlas = read("src/site/print-room/bound-atlas.ts");

test("PRR6 a failed re-bind leaves the previous atlas deliverable (kept at the close of Issue #779: no browser path here fails a bind job)", () => {
  const bind = atlas.slice(atlas.indexOf("function bindAtlas"), atlas.indexOf("function printAtlas"));
  assert.ok(bind.length > 0, "bindAtlas was not found, so the assertions below read an empty slice");
  assert.match(
    bind,
    /if \(lastAtlas !== null\) setDeliveryEnabled\(true\)/,
    "a failed re-bind leaves the previous atlas deliverable",
  );
});
