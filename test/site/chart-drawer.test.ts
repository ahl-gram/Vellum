import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  layOnTable,
  takeOffTable,
  roomOnTable,
  countLine,
  tabLine,
  refusalLine,
  subOf,
  thumbJobFor,
  thumbNames,
  layPressFace,
  filingAt,
  surveyItemFrom,
  sheetsThatLeft,
  type FilingSheet,
  LAY_ON_CARD,
  LAY_ON_PAGE,
} from "../../src/site/explorer/chart-drawer.ts";
import {
  TABLE_CAP,
  TABLE_KEY,
  emitTable,
  parseTable,
  emitTableKey,
  type ProspectItem,
  type SurveyItem,
  type TableItem,
} from "../../src/site/shared/table-address.ts";

import { LOD_BANDS, lodWindowFor } from "../../src/world/lod.ts";
import { placeId } from "../../src/world/outline-ids.ts";
import type { WorldRecipe } from "../../src/world/types.ts";
import { hashOf } from "../../test-support/table-address-fixtures.ts";

const REPO = resolve(import.meta.dirname, "..", "..");
import type { ProspectJob, ProspectResult, RegionJob, RegionResult } from "../../src/site/explorer/worker-client.ts";
type SameKeys<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

// The Chart Table's state (Issue #520 Sub 2), pure and apart from the DOM: what the drawer draws and what the address carries are both this array. The surface is `chart-drawer` and never `drawer` (Issue #520 ruling 2).
const survey = (lx: number): SurveyItem => ({
  kind: "survey",
  seed: 42,
  overrides: {},
  rung: 2,
  lx,
  ly: 3,
  style: "antique",
  legend: true,
  arms: false,
  beasts: false,
  theme: null,
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
  assert.deepEqual(
    after.map((i) => (i as SurveyItem).lx),
    [0, 2],
  );
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
  assert.equal(
    one.get(TABLE_KEY),
    emitTable(fill(1)),
    "ONE sheet is the commonest table and is written like any other: the emptiness gate is exactly zero",
  );
});

// Issue #518 ruling 6 (period voice): the wordings are provisional until Sub 5's post-use re-review.
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

// Issue #522 Sub 4: a prospect draws its own plate, which is what Issue #518 ruling 7 calls "the plate itself in its own dress".
const prospect = (over: Partial<ProspectItem> = {}): ProspectItem => ({
  kind: "prospect",
  seed: 42,
  overrides: {},
  style: "ink",
  index: 3,
  year: 1059,
  ...over,
});

test("CT1 thumbJobFor hands a prospect its own job, dressed as the ADDRESS states, so an ink chart's cutting is an ink plate (#522, #237)", () => {
  const ink = thumbJobFor(prospect());
  assert.equal(ink.kind, "prospect");
  assert.equal(ink.dress, "ink", "an ink prospect draws the ink plate");
  const antique = thumbJobFor(prospect({ style: "antique" }));
  assert.equal((antique as ProspectJob).dress, "antique");
  assert.deepEqual(
    { index: ink.index, year: ink.year, seed: ink.seed },
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
  const regionRes = {
    ok: true,
    title: "The Environs of Nurunui",
    worldTitle: "The Isle of Rahai",
    svg: "",
  } as unknown as RegionResult;
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
  assert.equal(
    subOf(prospect({ style: "nautical" })),
    "a prospect, antique, 1059",
    "nautical draws antique, so it reads antique",
  );
  assert.equal(subOf(prospect({ style: "topographic" })), "a prospect, antique, 1059");
  assert.equal(subOf(survey(1)), "band 2, antique", "a survey's line is unchanged");
});

test("CT6 the card's press wears the two ruled faces, and a table that is BOTH full and already holding this plate says the more useful of the two true things (#518 ruling 7, Alex 2026-09-17, and #520's own precedence scar)", () => {
  assert.deepEqual(layPressFace({ holds: false, full: false }, LAY_ON_CARD), {
    label: "Lay the prospect on the table",
    refuses: false,
  });
  assert.deepEqual(
    layPressFace({ holds: false, full: false }, LAY_ON_PAGE),
    { label: "Lay this prospect on the table", refuses: false },
    "the page's resting face is its own, ruled from the rendered variant: THIS plate rather than a place on a chart",
  );
  assert.deepEqual(layPressFace({ holds: false, full: true }, LAY_ON_CARD), {
    label: "No room on the table",
    refuses: true,
  });
  assert.deepEqual(
    layPressFace({ holds: false, full: true }, LAY_ON_PAGE),
    { label: "No room on the table", refuses: true },
    "and both surfaces refuse in the SAME words, since they refuse for the same reason",
  );
  assert.deepEqual(layPressFace({ holds: true, full: false }, LAY_ON_CARD), {
    label: "Already on the table",
    refuses: true,
  });
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
  const sheet: FilingSheet = { seed: 42, overrides: {}, style: "ink", presentYear: 1059 };
  const filedFrom = (from: FilingSheet, index = 3) => {
    const filed = filingAt({ turning: false, sheet: from, index });
    assert.ok(filed, "a settled sheet files");
    return filed;
  };
  const filed = filedFrom(sheet);
  assert.deepEqual(
    [filed.seed, filed.overrides, filed.style, filed.year, filed.index],
    [42, {}, "ink", 1059, 3],
    "and it files that sheet's world at that sheet's year",
  );
  assert.equal(filingAt({ turning: false, sheet: null, index: 3 }), null, "nothing before the first draw lands");
  assert.equal(filingAt({ turning: true, sheet, index: 3 }), null, "and nothing while the sheet is mid-flip");
  assert.equal(filedFrom({ ...sheet, seed: 43 }).seed, 43, "the seed is the sheet's own");
  assert.deepEqual(
    filedFrom({ ...sheet, overrides: { mapType: "island" } }).overrides,
    { mapType: "island" },
    "so are its overrides",
  );
  assert.equal(filedFrom({ ...sheet, style: "antique" }).style, "antique", "and its dress");
  assert.equal(filedFrom({ ...sheet, presentYear: 809 }).year, 809, "and its present year");
  assert.equal(filedFrom(sheet, 5).index, 5, "and the index is the one asked for");
  const oneYear: SameKeys<keyof FilingSheet, "seed" | "overrides" | "style" | "presentYear"> = true;
  assert.ok(
    oneYear,
    "held by the type checker, not this run: a FilingSheet member beyond these four fails npm run check here, since a second year is the skew this shape exists to make unrepresentable",
  );
  assert.notEqual(
    emitTable([filedFrom({ ...sheet, presentYear: 809 })]),
    emitTable([filed]),
    "two charts' presents are two distinct sheets, which is why they may not be mixed",
  );
});

test("CT7c one call reaches the landing paths (#631 round 3; kept at the close of Issue #779: a census of call sites; CD57 to CD59 read what is filed)", () => {
  const src = readFileSync(resolve(REPO, "src/site/explorer/app.ts"), "utf8");
  assert.equal(
    [...src.matchAll(/^\s*landDraw\(([^)]*)\);$/gm)].length,
    1,
    "the landing paths are reached from some number of places other than the one draw",
  );
});

test("CT9 the Explorer seats the table in exactly two places, the boot and the cached return (#634, ruled 2026-09-19; kept at the close of Issue #779: a census of call sites; CD37 to CD42 and CD52 read the device written on a change, the boot's precedence and the cached return)", () => {
  const app = readFileSync(resolve(REPO, "src/site/explorer/app.ts"), "utf8");
  assert.equal(
    [...app.matchAll(/chartTable\.restore\(/g)].length,
    2,
    "the Explorer seats the table in some number of places other than the two #634 leaves. BLIND SPOT, declared, erring toward passing: only src/site/explorer/app.ts is counted, so a seat written in src/site/explorer/app-wiring.ts, which is handed the table, passes unseen (Issue #814)",
  );
});

test("CT10 the sheets a re-seat drops are read against the table it brings, so every departed sheet's picture is named for revoking (#634; the drawer's own passes are chart-drawer-ceremony.test.ts's)", () => {
  const before = [survey(1), survey(2), survey(3)];
  assert.deepEqual(
    sheetsThatLeft(before, [survey(1), survey(3)]).map((i) => emitTable([i])),
    [emitTable([survey(2)])],
    "the middle sheet left and was not named, so its picture is never revoked",
  );
  assert.deepEqual(
    sheetsThatLeft(before, before),
    [],
    "nothing left, so nothing is forgotten and a redraw does not churn the urls it already made",
  );
  assert.deepEqual(sheetsThatLeft(before, []).length, 3, "an emptied table drops every picture");
  assert.deepEqual(sheetsThatLeft([], before), [], "and an arrival into a bare drawer forgets nothing");
});

test("CT11 EVERY road out that carries this page's address is rebuilt by the one hash writer, never by the draw (#634, the cold review's round 3 on PR #635; kept at the close of Issue #779: a class over every road the file may grow, where CD52 reads the two that stand)", () => {
  // Guarded as a CLASS, and derived rather than restated: the roads are read out of the file. Laying a sheet, taking
  // one off and a cached return all move the address WITHOUT drawing, so a road rebuilt in draw() hands on the table as
  // it stood at the last draw. Measured doing exactly that: a reader who took their only sheet off still pressed a road
  // carrying it, and the Print Room, which since this branch carries the table through, passed it on to the folio.
  const app = readFileSync(resolve(REPO, "src/site/explorer/app.ts"), "utf8");
  const at = app.indexOf("function syncHash()");
  assert.notEqual(at, -1, "the one hash writer is gone, so this guard has nothing to check the roads against");
  const sync = app.slice(at, app.indexOf("\n}", at));
  const roads = [...app.matchAll(/^\s*(?:if \([^)]*\) )?(\w+)\.href = [^\n]*location\.hash[^\n]*$/gm)].map((m) => m[1]);
  assert.ok(
    roads.length >= 2,
    `this scan found ${roads.length} address-carrying roads in app.ts and the page has at least the Reading Room's and the Print Room's, so it is reading the wrong shape. BLIND SPOT, declared, erring toward passing: only app.ts is scanned, so a road written in src/site/explorer/app-wiring.ts, which imports the page's elements, passes unseen (Issue #814)`,
  );
  for (const road of new Set(roads)) {
    assert.match(
      sync,
      new RegExp(`\\b${road}\\.href = `),
      `${road} carries this page's address but is not rebuilt when the address changes, so it points at the table as it stood at the last draw`,
    );
  }
});

test("CT5 a prospect refused as a duplicate is refused in its OWN noun, and the survey line stays byte-identical (#522; e2e CD and announce.test pin the survey wording)", () => {
  assert.equal(refusalLine("already"), "this survey is already on the table", "the survey line is unchanged");
  assert.equal(refusalLine("already", "survey"), "this survey is already on the table");
  assert.equal(refusalLine("already", "prospect"), "this prospect is already on the table");
  assert.equal(
    refusalLine("full"),
    "the table is full: six sheets lie on it",
    "the cap line names no kind and is unchanged",
  );
  assert.equal(refusalLine("full", "prospect"), "the table is full: six sheets lie on it");
});

test("CT12 a settle at any region band is gathered, band 5 the deepest, and none at the world sheet or past the table (Issue #954)", () => {
  const settle = (band: number) =>
    surveyItemFrom({ seed: 42, overrides: undefined, render: { style: "antique" }, band, seat: { lx: 3, ly: 4 } });
  assert.equal(settle(5)?.rung, 5, "band 5, the ruled depth");
  for (const b of LOD_BANDS.filter((x) => x.isRegion)) assert.equal(settle(b.index)?.rung, b.index, `band ${b.index}`);
  assert.equal(settle(0), null);
  assert.equal(settle(LOD_BANDS.length), null);
});

test("CT13 a rung-5 sheet carried in the address redraws its own band-5 window (Issue #954)", () => {
  const [item] = parseTable(hashOf("k-s.seed-42.style-antique.legend-1.arms-0.beasts-0.rung-5.lx-131.ly-105")) ?? [];
  assert.ok(item && item.kind === "survey", "a rung-5 survey parses");
  const job = thumbJobFor(item) as RegionJob;
  assert.equal(job.band, 5);
  assert.deepEqual(job.window, lodWindowFor(131 / 256, 105 / 256, 1 / 32));
});

test("surveyItemFrom carries the shape the sheet was drawn with (Issue #854)", () => {
  const from = (overrides: Partial<WorldRecipe>) =>
    surveyItemFrom({ seed: 42, overrides, render: { style: "antique" }, band: 2, seat: { lx: 3, ly: 4 } })?.overrides;
  assert.deepEqual(from({ mapType: "archipelago", islands: 12, isleSize: "varied" }), {
    mapType: "archipelago",
    islands: 12,
    isleSize: "varied",
  });
  const texas = placeId("ne-1159315211");
  assert.deepEqual(from({ outline: texas, looseness: 0.5 }), { outline: texas, looseness: 0.5 });
});
