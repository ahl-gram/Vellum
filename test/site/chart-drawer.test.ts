import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { layOnTable, takeOffTable, roomOnTable, countLine, tabLine, refusalLine, subOf, thumbJobFor, thumbNames, layPressFace, filingAt, LAY_ON_CARD, LAY_ON_PAGE } from "../../src/site/explorer/chart-drawer.ts";
import { TABLE_CAP, TABLE_KEY, emitTable, type ProspectItem, type SurveyItem, type TableItem } from "../../src/site/shared/table-address.ts";
import { emitTableKey } from "../../src/site/explorer/address.ts";

const REPO = resolve(import.meta.dirname, "..", "..");
import type { ProspectJob, ProspectResult, RegionResult } from "../../src/site/explorer/worker-client.ts";

// The Chart Table's state (#520 Sub 2), pure and apart from the DOM: what the drawer draws and what the address carries are both this array. The surface is `chart-drawer` and never `drawer`, which src/site/shell/drawer.ts already spends on the site's phone nav (#520 ruling 2).
const survey = (lx: number): SurveyItem => ({
  kind: "survey", seed: 42, overrides: {}, rung: 2, lx, ly: 3,
  style: "antique", legend: true, arms: false, beasts: false, theme: null,
});
const fill = (n: number): TableItem[] => Array.from({ length: n }, (_, i) => survey(i));

test("a survey lays on the table, and the table it came from is untouched (#520)", () => {
  const before = fill(2);
  const after = layOnTable(before, survey(9));
  assert.equal(after.refused, false);
  assert.equal(after.items.length, 3);
  assert.equal(before.length, 2, "the caller's array is never mutated");
  assert.notEqual(after.items, before);
  assert.deepEqual(after.items[2], survey(9), "the newest sheet lies on top of the pile, last");
});

test("the table holds six and refuses the seventh, leaving the six it has (#520, #401 ruling: cap six)", () => {
  const full = fill(TABLE_CAP);
  assert.equal(full.length, 6, "TABLE_CAP is the grammar's own six");
  const after = layOnTable(full, survey(99));
  assert.equal(after.refused, true);
  assert.equal(after.items.length, TABLE_CAP, "a refusal never grows the table");
  assert.deepEqual(after.items, full, "a refusal never reorders it either");
  assert.equal(after.items, full, "and hands back the same array, not a copy of it");
});

test("a cutting comes off by its seat, and only that one (#520)", () => {
  const three = fill(3);
  const after = takeOffTable(three, 1);
  assert.equal(after.length, 2);
  assert.deepEqual(after.map((i) => (i as SurveyItem).lx), [0, 2]);
  assert.equal(three.length, 3, "the caller's array is never mutated");
});

test("taking off a seat the table does not have leaves it whole (#520)", () => {
  const three = fill(3);
  assert.deepEqual(takeOffTable(three, 7), three);
  assert.deepEqual(takeOffTable(three, -1), three);
  assert.deepEqual(takeOffTable(three, 1.5), three, "a seat is a whole number or it is no seat");
  assert.deepEqual(takeOffTable(three, NaN), three);
});

test("the room left is what the drawer's head counts down (#520)", () => {
  assert.equal(roomOnTable([]), TABLE_CAP);
  assert.equal(roomOnTable(fill(3)), 3);
  assert.equal(roomOnTable(fill(TABLE_CAP)), 0);
  assert.equal(roomOnTable(fill(TABLE_CAP + 2)), 0, "an over-full table reports no room, never a negative one");
});

test("an empty table writes no key, and a laid one writes the grammar's (#520 ruling 1)", () => {
  const bare = new URLSearchParams("seed=42");
  emitTableKey(bare, []);
  assert.equal(bare.has(TABLE_KEY), false, "nothing on the table means no key");
  assert.equal(bare.toString(), "seed=42", "and nothing else moves either");

  const none = new URLSearchParams("seed=42");
  emitTableKey(none, null);
  assert.equal(none.has(TABLE_KEY), false, "no table at all is the same silence");

  const laid = new URLSearchParams("seed=42");
  emitTableKey(laid, fill(2));
  assert.equal(laid.get(TABLE_KEY), emitTable(fill(2)), "a laid table writes exactly what the grammar emits");

  const one = new URLSearchParams("seed=42");
  emitTableKey(one, fill(1));
  assert.equal(one.get(TABLE_KEY), emitTable(fill(1)), "ONE sheet is the commonest table and is written like any other: the emptiness gate is exactly zero");
});

// #518 ruling 6 (period voice): the wordings are provisional until Sub 5's post-use re-review.
test("the head counts the table in words, and says when it is bare and when it is full (#520)", () => {
  assert.equal(countLine([]), "the table is bare");
  assert.equal(countLine(fill(1)), "one sheet laid · room for five more");
  assert.equal(countLine(fill(3)), "three sheets laid · room for three more");
  assert.equal(countLine(fill(5)), "five sheets laid · room for one more");
  assert.equal(countLine(fill(TABLE_CAP)), "six sheets laid · the table is full");
});

test("the tab counts the drawer it is shut over (#520)", () => {
  assert.equal(tabLine([]), "The Drawer · the table is bare");
  assert.equal(tabLine(fill(1)), "The Drawer · one sheet");
  assert.equal(tabLine(fill(3)), "The Drawer · three sheets");
});

test("the same survey is refused a second time, and the table is unmoved (#520, ruled)", () => {
  const one = layOnTable([], survey(4)).items;
  const again = layOnTable(one, survey(4));
  assert.equal(again.refused, true);
  assert.equal(again.reason, "already", "refused for being a duplicate, not for want of room");
  assert.equal(again.items, one, "and the table is handed back untouched");

  const other = layOnTable(one, survey(5));
  assert.equal(other.refused, false, "a different seat on the same world is a different survey");
  assert.equal(other.items.length, 2);
});

test("the cap refuses for want of room, which reads differently from a duplicate (#520)", () => {
  const full = layOnTable(fill(TABLE_CAP - 1), survey(98)).items;
  const seventh = layOnTable(full, survey(99));
  assert.equal(seventh.refused, true);
  assert.equal(seventh.reason, "full");
  assert.notEqual(refusalLine("full"), refusalLine("already"), "the two refusals are not the same sentence");
  assert.match(refusalLine("full"), /six/, "the cap's refusal names the six, as #518 ruling 3 wrote it");
});

// The fixtures above vary only lx, so a sameSheet comparing the seat alone passes all of them.
test("a sheet differing in ANY field the address carries is a different sheet (#520)", () => {
  const base = survey(4);
  const twins: ReadonlyArray<readonly [string, TableItem]> = [
    ["seed", { ...base, seed: 43 }],
    ["rung", { ...base, rung: 3 }],
    ["lx", { ...base, lx: 5 }],
    ["ly", { ...base, ly: 9 }],
    ["style", { ...base, style: "ink" }],
    ["legend", { ...base, legend: false }],
    ["arms", { ...base, arms: true }],
    ["beasts", { ...base, beasts: true }],
    ["theme", { ...base, theme: "moisture" }],
    ["overrides", { ...base, overrides: { landFraction: 0.4 } }],
  ];
  for (const [field, twin] of twins) {
    const laid = layOnTable([base], twin);
    assert.equal(laid.refused, false, `a sheet differing only in ${field} must lay`);
    assert.equal(laid.items.length, 2, field);
  }
  assert.equal(layOnTable([base], { ...base }).refused, true, "and an identical sheet still does not");
});

test("a prospect is told from a survey, and from another prospect (#520)", () => {
  const p1: TableItem = { kind: "prospect", seed: 42, overrides: {}, style: "ink", index: 3, year: 1059 };
  assert.equal(layOnTable([survey(4)], p1).refused, false, "a prospect is never the survey beside it");
  assert.equal(layOnTable([p1], p1).refused, true, "the same prospect twice is refused");
  assert.equal(layOnTable([p1], { ...p1, index: 4 }).refused, false, "a different plate is a different prospect");
  assert.equal(layOnTable([p1], { ...p1, year: 900 }).refused, false, "so is the same plate in another year");
});

// Nothing else makes a table both FULL and holding the item, so swapping the two guards in layOnTable was invisible at both layers.
test("a full table refusing a sheet it ALREADY holds says so, not that it is full (#520)", () => {
  const target = survey(0);
  const full = fill(TABLE_CAP);
  assert.equal(full.length, TABLE_CAP);
  assert.deepEqual(full[0], target, "the target is on the full table");
  const again = layOnTable(full, target);
  assert.equal(again.refused, true);
  assert.equal(again.reason, "already", "the more useful of the two true things");
});

// #522 Sub 4: a prospect draws its own plate, which is what #518 ruling 7 calls "the plate itself in its own dress".
const prospect = (over: Partial<ProspectItem> = {}): ProspectItem => ({
  kind: "prospect", seed: 42, overrides: {}, style: "ink", index: 3, year: 1059, ...over,
});

test("CT1 thumbJobFor hands a prospect its own job, dressed as the ADDRESS states, so an ink chart's cutting is an ink plate (#522, #237)", () => {
  const ink = thumbJobFor(prospect());
  assert.equal(ink.kind, "prospect");
  assert.equal((ink as ProspectJob).dress, "ink", "an ink prospect draws the ink plate");
  const antique = thumbJobFor(prospect({ style: "antique" }));
  assert.equal((antique as ProspectJob).dress, "antique");
  assert.deepEqual(
    { index: (ink as ProspectJob).index, year: (ink as ProspectJob).year, seed: ink.seed },
    { index: 3, year: 1059, seed: 42 },
    "the place, the year and the world ride verbatim: they ARE the plate's identity",
  );
});

test("CT2 thumbJobFor hands EVERY table item a job, so no kind can be left drafting forever (#522; a prospect returned null until this sub and read 'drawing…' for good)", () => {
  for (const item of [survey(2), prospect(), prospect({ style: "antique", year: 300 })] as TableItem[]) {
    const job = thumbJobFor(item);
    assert.ok(job, `${item.kind} has no job, so its cutting never fills`);
    assert.equal(job.kind, item.kind === "prospect" ? "prospect" : "region");
  }
});

test("CT3 thumbNames takes a prospect's name from the TOWN and its world line from the job's own title, which is the world's (#522)", () => {
  const prospectRes = { ok: true, name: "Paukilua", title: "The Isle of Rahai", svg: "" } as unknown as ProspectResult;
  assert.deepEqual(thumbNames(prospectRes), { title: "The Prospect of Paukilua", worldTitle: "The Isle of Rahai" });
  const regionRes = { ok: true, title: "The Environs of Nurunui", worldTitle: "The Isle of Rahai", svg: "" } as unknown as RegionResult;
  assert.deepEqual(
    thumbNames(regionRes),
    { title: "The Environs of Nurunui", worldTitle: "The Isle of Rahai" },
    "a region keeps the pair it already carries",
  );
});

test("CT4 a prospect's cutting names the dress the PLATE is drawn in, so a hand-typed style the plate cannot wear does not label the picture beside it (#522)", () => {
  assert.equal(subOf(prospect()), "a prospect, pen & ink, 1059");
  assert.equal(subOf(prospect({ style: "antique" })), "a prospect, antique, 1059");
  // parseTable accepts all four chart styles, and plateDressFor sends these two to the antique plate.
  assert.equal(subOf(prospect({ style: "nautical" })), "a prospect, antique, 1059", "nautical draws antique, so it reads antique");
  assert.equal(subOf(prospect({ style: "topographic" })), "a prospect, antique, 1059");
  assert.equal(subOf(survey(1)), "band 2, antique", "a survey's line is unchanged");
});

test("CT6 the card's press wears the two ruled faces, and a table that is BOTH full and already holding this plate says the more useful of the two true things (#518 ruling 7, Alex 2026-09-17, and #520's own precedence scar)", () => {
  assert.deepEqual(layPressFace({ holds: false, full: false }, LAY_ON_CARD), { label: "Lay the prospect on the table", refuses: false });
  assert.deepEqual(layPressFace({ holds: false, full: false }, LAY_ON_PAGE), { label: "Lay this prospect on the table", refuses: false },
    "the page's resting face is its own, ruled from the rendered variant: THIS plate rather than a place on a chart");
  assert.deepEqual(layPressFace({ holds: false, full: true }, LAY_ON_CARD), { label: "No room on the table", refuses: true });
  assert.deepEqual(layPressFace({ holds: false, full: true }, LAY_ON_PAGE), { label: "No room on the table", refuses: true },
    "and both surfaces refuse in the SAME words, since they refuse for the same reason");
  assert.deepEqual(layPressFace({ holds: true, full: false }, LAY_ON_CARD), { label: "Already on the table", refuses: true });
  // layOnTable answers "already" before "full" for exactly this reason: the reader can act on the first and not on the second.
  assert.deepEqual(
    layPressFace({ holds: true, full: true }, LAY_ON_CARD),
    { label: "Already on the table", refuses: true },
    "a full table holding this very plate tells the reader it is already there, not that there is no room for it",
  );
  const held = layOnTable(fill(TABLE_CAP - 1).concat([prospect()]), prospect());
  assert.equal(held.reason, "already", "and that is the order layOnTable itself takes");
});

// The first version of this guarded the INSTANCE, a mid-turn press, and asserted that a world paired with another
// chart's year still produced an item, which pinned the defect as correct. The class is that the two may never disagree
// at all, on any path: an ABORTED turn drops the `turning` class without running the continuation that moved the world,
// so a gate on that class left the skew reachable indefinitely. `filingAt` now takes ONE value, so no caller can express
// the skew and no test needs to assert what happens when it does.
test("CT7 the sheet a filing is made from carries its own present year, so a world and a year can never be paired from different charts (#522, both cold review rounds on PR #631)", () => {
  const sheet = { seed: 42, overrides: {}, style: "ink", presentYear: 1059 } as const;
  const filed = filingAt({ turning: false, sheet, index: 3 });
  assert.ok(filed, "a settled sheet files");
  assert.deepEqual([filed.seed, filed.year, filed.index], [42, 1059, 3], "and it files that sheet's world at that sheet's year");
  assert.equal(filingAt({ turning: false, sheet: null, index: 3 }), null, "nothing before the first draw lands");
  assert.equal(filingAt({ turning: true, sheet, index: 3 }), null, "and nothing while the sheet is mid-flip");
  const src = readFileSync(resolve(REPO, "src/site/explorer/chart-drawer.ts"), "utf8");
  const iface = src.slice(src.indexOf("interface FilingSheet {"), src.indexOf("}", src.indexOf("interface FilingSheet {")));
  const members = [...iface.matchAll(/^\s*(?:readonly\s+)?([A-Za-z]+)\??:/gm)].map((m) => m[1]).sort();
  assert.deepEqual(members, ["overrides", "presentYear", "seed", "style"], "the filing sheet grew a member, and a second field is a second place a year can live");
  assert.equal(members.filter((m) => /year/i.test(m)).length, 1, "two year-ish members are two independently-assignable years, which is the skew this shape exists to make unrepresentable");
  const call = src.slice(src.indexOf("prospectItemFrom({", src.indexOf("export function filingAt")), src.indexOf("});", src.indexOf("export function filingAt")));
  const fields = [...call.matchAll(/(\w+):\s*([^,}]+)/g)];
  assert.equal(fields.length, 5, "the gate's call no longer reads as the five fields a prospect item takes, so the loop below is sweeping nothing");
  for (const [, field, value] of fields) {
    assert.match(value.trim(), field === "index" ? /^at\.index$/ : /^at\.sheet\.\w+$/, `${field} reaches past the one sheet, so the filing no longer describes a single chart`);
  }
  const other = filingAt({ turning: false, sheet: { ...sheet, presentYear: 809 }, index: 3 });
  assert.ok(other);
  assert.notEqual(emitTable([other]), emitTable([filed]), "two charts' presents are two distinct sheets, which is why they may not be mixed");
});

test("CT7c the Explorer assigns that sheet beside the OVERLAY it describes, which is what keeps an aborted turn consistent rather than skewed (#631 round 3)", () => {
  const src = readFileSync(resolve(REPO, "src/site/explorer/app.ts"), "utf8");
  const builds = [...src.matchAll(/lc\.buildPlaceOverlay\(res\.manifest\);\n(\s*)([^\n]*)/g)].map((m) => m[2]);
  assert.ok(builds.length >= 2, "both draw paths build the overlay, or this guard reads fewer than it thinks");
  for (const next of builds) {
    assert.match(next, /^lastSheet = \{/, "the line after an overlay build is not the sheet assignment, so the hit targets on screen and the world the card files from can drift apart");
    assert.doesNotMatch(next, /lastManifest/, "a year read from the module's own lastManifest is the second, independently-moving source this shape exists to remove, and a `!` defeats a check that spells the whole path");
  }
  assert.equal((src.match(/presentYear: res\.manifest\.presentYear/g) ?? []).length, builds.length, "one build's year is read from the manifest it was built from and another's is not, which is the drift with one of the two doors left open");
});

test("CT7b the Explorer passes the REAL turn flag into the gate, so the pure refusal above cannot be fed a constant (#631)", () => {
  const app = readFileSync(resolve(REPO, "src/site/explorer/app.ts"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  const sites = [...app.matchAll(/filingAt\(/g)].map((m) => m.index);
  assert.equal(sites.length, 1, "a second call site is a second answer to the same question, and reading only the first leaves it unguarded");
  const at = sites[0];
  const call = app.slice(at, app.indexOf("})", at));
  assert.match(call, /turning:\s*sheetEl\.classList\.contains\("turning"\)/, "the gate is fed a literal or a stale flag instead of the sheet's own state; `turning` is the class runTurn brackets the window with");
  assert.doesNotMatch(call, /turning:\s*(false|true)\b/, "a constant here disables the refusal while every unit assertion above stays green");
  // The window is closed upstream too, and that line had no reader until a mutation deleted it and shipped green: the
  // card belongs to the chart being replaced, so a draw drops it BEFORE it rebases and swaps the sheet under it.
  const at2 = app.indexOf("function draw(opts");
  assert.notEqual(at2, -1, "draw() is gone, so the ordering assertion below reads an empty slice");
  const draw = app.slice(at2, app.indexOf("\n}", at2));
  assert.match(draw, /lc\.hideCard\(\);/, "a pinned card outlives the chart it names, and its hit targets then point at the OUTGOING world's places for the length of the turn");
  assert.ok(draw.indexOf("lc.hideCard();") < draw.indexOf("glass.rebase();"), "and it is dropped before the rebase, so nothing reads it in between");
});

test("CT5 a prospect refused as a duplicate is refused in its OWN noun, and the survey line stays byte-identical (#522; e2e CD and announce.test pin the survey wording)", () => {
  assert.equal(refusalLine("already"), "this survey is already on the table", "the survey line is unchanged");
  assert.equal(refusalLine("already", "survey"), "this survey is already on the table");
  assert.equal(refusalLine("already", "prospect"), "this prospect is already on the table");
  assert.equal(refusalLine("full"), "the table is full: six sheets lie on it", "the cap line names no kind and is unchanged");
  assert.equal(refusalLine("full", "prospect"), "the table is full: six sheets lie on it");
});
