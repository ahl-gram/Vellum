import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Issue #463: the Explorer as a chart room on the Issue #462 pattern (rulings 1 to 10). Issue #779 part 2h moved every claim a browser can read to `broadside`, `render` and `runninghead`; what stays here is a retired rule's absence, the print block's place, an import and two synchronous calls in one task.
const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");
const css = read("public/explorer/index.css");
const app = read("src/site/explorer/app.ts");

test("ER6 the page css revives no 1100px column and ends with its print block (kept for Issue #779 part 2i: a retired rule's absence and the block's place; BR12 and BR14 read the rest)", () => {
  assert.ok(!/max-width:\s*1100px/.test(css), "the 1100px column is gone: the chart is the room");
  assert.ok(css.match(/@media print\s*\{([\s\S]*)\}\s*$/), "the page css ends with its print stand-down");
});

test("ER7 app.ts imports the shared room and refits after the place overlay is built (kept for Issue #779 part 2i: an import, and two synchronous calls in one task)", () => {
  assert.match(app, /import\s*\{\s*bindRoom\s*\}\s*from\s*"\.\.\/shared\/room\.ts"/, "app.ts binds the shared room");
  const settlePath = app.slice(app.indexOf("mapDiv.innerHTML = res.svg;"), app.indexOf("if (pendingCamera)"));
  assert.ok(
    settlePath.includes("room.layout()") && settlePath.includes("lc.buildPlaceOverlay(res.manifest)"),
    "the settle path still builds the overlay and fits the room",
  );
  assert.ok(
    settlePath.indexOf("room.layout()") > settlePath.indexOf("lc.buildPlaceOverlay(res.manifest)"),
    "the settle refits after the overlay is built, so the fit measures the chart as drawn",
  );
});
