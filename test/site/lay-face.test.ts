import { test } from "node:test";
import assert from "node:assert/strict";
import { LAY_ON_CARD, LAY_ON_PAGE, layOnTable, tableFace, trialFace } from "../../src/site/explorer/chart-drawer.ts";
import { TABLE_CAP, type ProspectItem, type TableItem } from "../../src/site/shared/table-address.ts";

const plate = (index: number): ProspectItem => ({
  kind: "prospect",
  seed: 42,
  overrides: {},
  style: "antique",
  index,
  year: 1059,
});
const table = (n: number): TableItem[] => Array.from({ length: n }, (_, i) => plate(i + 10));

test("the Prospect page's press wears the face its trial on the table gives: a plate already laid is held, a full table is full, and a table with room lays (Issue #1273, from e2e CD34 and CD35)", () => {
  assert.deepEqual(
    trialFace(layOnTable([plate(1)], plate(1)), LAY_ON_PAGE),
    { label: "Already on the table", refuses: true },
    "a plate the table already holds wears the held face, not the full one",
  );
  assert.deepEqual(
    trialFace(layOnTable(table(TABLE_CAP), plate(1)), LAY_ON_PAGE),
    { label: "No room on the table", refuses: true },
    "a full table that does not hold the plate wears the full face, not the held one",
  );
  assert.deepEqual(
    trialFace(layOnTable(table(1), plate(1)), LAY_ON_PAGE),
    { label: LAY_ON_PAGE, refuses: false },
    "a table with room wears the page's resting face",
  );
});

test("the Explorer card's press wears the face its table gives: a place the table holds is held, a full table is full, and a table with room lays (Issue #1273, from e2e CD27)", () => {
  const laid = plate(1);
  const at = (full: boolean) => ({ holds: (item: TableItem) => item === laid, isFull: () => full });
  assert.deepEqual(
    tableFace(at(false), laid, LAY_ON_CARD),
    { label: "Already on the table", refuses: true },
    "a place the table holds wears the held face",
  );
  assert.deepEqual(
    tableFace(at(true), plate(2), LAY_ON_CARD),
    { label: "No room on the table", refuses: true },
    "a full table that does not hold the place wears the full face, not the held one",
  );
  assert.deepEqual(
    tableFace(at(false), plate(2), LAY_ON_CARD),
    { label: LAY_ON_CARD, refuses: false },
    "a table with room wears the card's resting face",
  );
});
