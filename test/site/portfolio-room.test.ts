import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// #521 Sub 3: the three guards the cold review on PR #546 found missing on the Portfolio. This is not the room's
// full test (the kit sweep, the css, the folio lines): it is the inline-fallback notice every other worker-driven
// room carries, the slip's where-line in the bare state, and what the two sheet presses actually stand down on.
const REPO = resolve(import.meta.dirname, "..", "..");
const read = (p: string): string => readFileSync(resolve(REPO, p), "utf8");
const page = read("src/pages/print-room/portfolio/index.astro");
const app = read("src/site/portfolio/app.ts");
const css = read("public/print-room/portfolio/index.css");

const between = (from: string, to: string): string => {
  const a = page.indexOf(from);
  assert.ok(a >= 0, `the page is missing ${from}`);
  const b = page.indexOf(to, a);
  assert.ok(b > a, `${to} does not follow ${from}`);
  return page.slice(a, b);
};

const at = (needle: string): number => {
  const i = app.indexOf(needle);
  assert.ok(i >= 0, `app.ts is missing ${needle}`);
  return i;
};

test("PFR1 the Portfolio says when the worker did not start: the notice stands in the stage and the page raises it on the inline fallback, the way the Print Room, the Prospect, the Ribbon and the Reading Room each do", () => {
  const stage = between("<ChartStage", "<Vignettes />");
  assert.match(stage, /<p id="pf-warning" class="warning" hidden>/, "the inline-fallback warning stands in the stage");
  assert.match(app, /import \{[^}]*\busesWorker\b[^}]*\} from "\.\.\/explorer\/worker-client\.ts"/, "the page asks the worker client which path it took");
  assert.match(app, /if \(!usesWorker\(\)\) warning\.hidden = false;/, "and raises the notice when the sheets fell back to the main thread");
  assert.ok(at("await initWorker()") < at("if (!usesWorker())"), "the client knows which path it took only once the worker has been tried");
  assert.ok(at("if (!usesWorker())") < at("await draft()"), "and the notice is up BEFORE the drafting that would freeze the tab, which is the moment it is about");
  assert.match(css, /\.stage \.warning \{[^}]*position: absolute/, "and the page seats it over the sheet the way the other four do; with no rule of its own it stands beside the sheet as a second flex item and shoves the fitted sheet off centre");
  assert.match(css, /\.stage \.warning\[hidden\] \{ display: none; \}/, "the four carry this line with it, so a page sheet that seats the notice cannot leave it showing on every load");
});

test("PFR2 the slip's where-line follows the gathering in both states: a bare Portfolio must not keep the Astro literal promising sheets over a line that says none were gathered", () => {
  assert.match(page, /where="the sheets gathered at the Explorer"/, "the literal the page ships with, which is only ever true of a gathering that arrived");
  assert.match(app, /if \(whereLine\) whereLine\.textContent = gatheredLine\(items\.length\);/, "so the page writes the line whatever the tally");
  assert.doesNotMatch(app, /whereLine && items\.length/, "no length guard: gatheredLine(0) already carries the bare voice, 'no sheets gathered at the Explorer'");
});

test("PFR3 every gathered sheet drafts, so nothing in the page skips a sheet by KIND and the presses stand down only on a bare portfolio (#522, superseding #521 ruling 3)", () => {
  assert.match(app, /if \(sheets\.length === 0\) \{/, "the stand-down asks whether anything was gathered at all");
  assert.doesNotMatch(app, /\bisAwaited\b/, "the reserved-place predicate is gone, not merely unused");
  assert.doesNotMatch(app, /\bdrawable\b/, "and so is the drawable filter it fed");
  // The loop that draws them: a `continue` or an early return keyed on the item's kind is the shape that leaves one kind forever drafting.
  const from = at("const draft = async");
  const loop = app.slice(from, app.indexOf("\n};", from));
  assert.ok(loop.length > 100, "the drafting loop was not found, so the assertions below read an empty slice");
  // Not a word list. The first version of this enumerated two spellings of the comparison and the guard-prover walked
  // straight past it with a third; the second version caught the loop's own legitimate type narrowing. So the skips are
  // ENUMERATED instead: after this sub there is exactly one reason to skip a sheet, and it is not the sheet's kind.
  // Named blind spot, with its direction: a skip hoisted into a variable first (`const k = sheet.item.kind;`) reads as no
  // skip at all here, which costs a miss and never a false red. What the loop CANNOT do unread is guard on the item.
  const skips = (loop.match(/\n\s*if \([^)]*\)\s*(continue|return)[;\s]/g) ?? []).map((s) => s.trim());
  assert.deepEqual(
    skips,
    ["if (!sheet) continue;"],
    "the drafting loop skips a sheet for exactly one reason, a seat the index does not hold; a kind-based skip in any spelling is the bug #521 ruling 3 held open and this sub closes",
  );
  assert.doesNotMatch(loop, /\bitem\.kind\s*(===|!==)/, "and the loop never branches on the ITEM's kind at all; the narrowing it does need is on the JOB's");
  // The slice above is the DRAFTING loop only, and the prover put the same bug in `bringUp` and shipped it green: a
  // kind-gated early exit anywhere in the page keeps a prospect out of the pile just as effectively. So the whole file is
  // swept for that one shape. `showTop`, `rowFor` and `nameOf` legitimately branch on kind for their label text and are
  // untouched by this, because none of them returns on it.
  const kindExits = (app.match(/\n\s*if \([^)]*\bkind\b[^)]*\)\s*(return|continue)\b/g) ?? []).map((s) => s.trim());
  assert.deepEqual(kindExits, [], "a kind-gated early return or continue anywhere in the page holds one sheet kind out of the pile, which is the reserved place #521 ruling 3 kept and this sub closes");
});

test("PFR4 the Portfolio's road home is built from the address it is SHOWING, and a folio the address does not name is the device's (#634, ruled 2026-09-19)", () => {
  // Asserted against the ID and not the anchor text, because test/site/astro-scaffold.test.ts pins the AUTHORED href
  // literally and this page keeps it: the rewrite is a runtime one, which is the Prospect and Ribbon pattern.
  const road = at("pf-explorer");
  const hrefAt = app.indexOf("href", road);
  assert.ok(hrefAt > road, "nothing assigns the road's href after it is looked up, so the press back is the Astro literal and loses the whole gathering (#634 defect 1)");
  // Both calls are anchored WHOLE rather than by their tokens. The guard-prover's round 1 on this branch put the
  // address and the device the wrong way round as arguments and put "" in place of the sheets, and two unordered
  // assert.match calls passed both mutations while the ruled precedence was inverted and the gathering dropped.
  const line = app.slice(road, app.indexOf("\n", hrefAt));
  assert.match(line, /roadHome\.href = "\.\.\/\.\.\/explorer\/" \+ tableHash\(location\.hash, emitTable\(items\)\)/, "the road home is no longer this page's own address plus the sheets it is showing, so a reader who presses it loses the chart they gathered from, the sheets, or both");
  const arrival = at("tableOnArrival(");
  const call = app.slice(arrival, app.indexOf("\n", arrival));
  assert.match(call, /tableOnArrival\(parseTable\(location\.hash\), readStoredTable\(\(\) => localStorage\), navigationTypeNow\(\)\)/, "this folio's contents no longer come from the address FIRST and the device second (#634 rulings 1 and 4): swapped, a shared link stops reproducing exactly; dropped, the Print Room's own road here reaches a bare pile");
});
