import { test } from "node:test";
import assert from "node:assert/strict";
import { legendSeat } from "../../src/site/shared/room.ts";

// #463: on a phone the legend row (the room's roads out) docks inside the slip so the bottom sheet carries it (#462 ruling 3); on a wide sheet it stands on the stage. One element moves, because the Explorer's roads carry ids the suites and app.ts read, so a second copy is not an option.

test("the legend seats in the slip on a narrow sheet and on the stage on a wide one", () => {
  assert.equal(legendSeat({ narrow: true, hasSlip: true }), "slip");
  assert.equal(legendSeat({ narrow: false, hasSlip: true }), "stage");
});

test("a room with no slip keeps its legend on the stage at every width", () => {
  assert.equal(legendSeat({ narrow: true, hasSlip: false }), "stage");
  assert.equal(legendSeat({ narrow: false, hasSlip: false }), "stage");
});
