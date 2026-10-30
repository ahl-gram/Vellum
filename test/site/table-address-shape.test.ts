import test from "node:test";
import assert from "node:assert/strict";
import { emitTable, groupByWorld, parseTable, type TableItem } from "../../src/site/shared/table-address.ts";
import { TEXAS, hashOf } from "../../test-support/table-address-fixtures.ts";

const SHAPED_SHEET =
  "k-s.seed-42.type-island.coast-55.outline-ne-1159315211.looseness-67.style-antique.legend-1.arms-0.beasts-0.rung-2.lx-17.ly-13";
const COUNTED_SHEET = "k-p.seed-42.type-archipelago.islands-12.isleSize-varied.raggedness-40.style-ink.i-3.year-814";

test("a shaped sheet and a counted sheet read and emit back field for field (Issue #854)", () => {
  const items = parseTable(hashOf(`${SHAPED_SHEET}_${COUNTED_SHEET}`)) as ReadonlyArray<TableItem>;
  assert.deepEqual(
    items.map((i) => i.overrides),
    [
      { mapType: "island", coastWarp: 0.55, outline: TEXAS, looseness: 0.67 },
      { mapType: "archipelago", islands: 12, isleSize: "varied", raggedness: 0.4 },
    ],
  );
  assert.equal(emitTable(items), `${SHAPED_SHEET}_${COUNTED_SHEET}`);
});

test("a place's ID is one field though it holds the pair's own hyphen (Issue #854)", () => {
  const [item] = parseTable(hashOf(SHAPED_SHEET)) as ReadonlyArray<TableItem>;
  assert.equal(item?.overrides.outline, "ne-1159315211");
});

test("a sheet whose shape the engine would refuse is dropped, never drafted as another world (Issue #854)", () => {
  const bad = [
    "islands-12",
    "type-archipelago.islands-12.outline-round",
    "looseness-50",
    "outline-texas",
    "type-archipelago.islands-101",
  ];
  for (const world of bad)
    assert.deepEqual(parseTable(hashOf(`k-p.seed-42.${world}.style-ink.i-3.year-814`)), [], world);
});

test("a land or coast the shape draws nothing from is left out, so one world is one sheet (Issue #854)", () => {
  const tail = "style-antique.legend-1.arms-0.beasts-0.rung-2.lx-17.ly-13";
  const loud = `k-s.seed-42.type-island.land-350.coast-55.outline-round.${tail}`;
  const quiet = `k-s.seed-42.type-island.outline-round.${tail}`;
  const [item] = parseTable(hashOf(loud)) as ReadonlyArray<TableItem>;
  assert.deepEqual(item?.overrides, { mapType: "island", outline: "round" });
  assert.equal(emitTable([item]), quiet);
  const both = parseTable(hashOf(`${loud}_${quiet}`)) as ReadonlyArray<TableItem>;
  assert.equal(groupByWorld(both).length, 1);
});

test("two sheets that differ only by their outline are two worlds (Issue #854)", () => {
  const other = SHAPED_SHEET.replace("ne-1159315211", "ne-1159320937");
  const items = parseTable(hashOf(`${SHAPED_SHEET}_${other}`)) as ReadonlyArray<TableItem>;
  assert.equal(items.length, 2);
  assert.equal(groupByWorld(items).length, 2);
});
