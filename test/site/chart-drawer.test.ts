import test from "node:test";
import assert from "node:assert/strict";
import { layOnTable, takeOffTable, roomOnTable, countLine, tabLine, refusalLine } from "../../src/site/explorer/chart-drawer.ts";
import { TABLE_CAP, TABLE_KEY, emitTable, type SurveyItem, type TableItem } from "../../src/site/shared/table-address.ts";
import { emitTableKey } from "../../src/site/explorer/address.ts";

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

// The writer's half of ruling 1 (#520, 2026-09-07): an EMPTY table writes no key at all, rather than growing `table=` onto every link the Explorer hands out forever. emitLive is the named precedent; writeHash's unconditional params.set for seed/style/legend is the idiom this must not follow.
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

// The drawer's own voice (#518 ruling 6, period voice; the wordings are provisional and ride Sub 5's post-use re-review). Numbers are spelled, as every count in the mock is.
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

// Ruled 2026-09-07: a survey already on the table is refused and the drawer says so, rather than spending two of the six seats on one sheet or ignoring the click in silence.
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

// The fixtures above vary only lx, so a sameSheet comparing the SEAT alone passes all of them: two different worlds settling on one lattice seat would be wrongly refused. Every field the address carries gets a one-field-changed twin here, and each must lay.
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
