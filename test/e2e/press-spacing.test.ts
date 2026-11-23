import { test } from "node:test";
import assert from "node:assert/strict";
import {
  pressSpacingFaults,
  spacingOf,
  type Box,
  type PressRead,
  type Target,
} from "../../e2e/suites/runninghead/press.ts";

// The fixtures are the probe's raw boxes on the build of Issue #1254's pull request 2 plan, handbook/plans/1200/1254/1254-pr2-plan.md, Tests T8.
const box = (l: number, t: number, r: number, b: number): Box => ({ l, t, r, b });
const read = (press: Box | null, others: readonly Target[], fonts = "loaded"): PressRead => ({ fonts, press, others });
const VELLUM: Target = { name: "Vellum", box: box(25.59375, 112.921875, 63.046875, 125.921875) };
const PLANNED = box(25.59375, 136.203125, 126.4375, 151.203125);

test("pressSpacingFaults keeps the Primer's press, as planned, a thumb's reach clear: 4.78 px in the Explorer and 3.30 on the Prospect (Issue #1254)", () => {
  assert.deepEqual(pressSpacingFaults("/explorer/", read(PLANNED, [VELLUM])), []);
  const explorer = spacingOf(PLANNED, VELLUM.box);
  assert.equal(explorer.centre.toFixed(2), "39.93");
  assert.equal(explorer.full.toFixed(2), "4.78");
  const prospectPress = box(25.59375, 158, 126.4375, 173);
  const reading: Target = { name: "The Reading Room", box: box(88, 136.203125, 157.828125, 149.203125) };
  assert.deepEqual(pressSpacingFaults("/prospect/", read(prospectPress, [VELLUM, reading])), []);
  assert.equal(spacingOf(prospectPress, reading.box).full.toFixed(2), "3.30");
});

test("pressSpacingFaults faults the round's first seat, the press flush under the trail, and a read it cannot judge (Issue #1254)", () => {
  const firstSeat = box(337.359375, 110.921875, 438.203125, 125.921875);
  const printRoom: Target = { name: "Print Room", box: box(350.140625, 87.8125, 425.8125, 101.8125) };
  assert.equal(pressSpacingFaults("/explorer/", read(firstSeat, [printRoom])).length, 2);
  const flush = box(25.59375, 127.40625, 126.4375, 142.40625);
  assert.equal(pressSpacingFaults("/explorer/", read(flush, [VELLUM])).length, 1);
  assert.deepEqual(pressSpacingFaults("/x/", undefined), ["/x/: not visited"]);
  assert.equal(pressSpacingFaults("/x/", read(PLANNED, [VELLUM], "loading")).length, 1);
  assert.deepEqual(pressSpacingFaults("/x/", read(null, [VELLUM])), ["/x/: no Primer press"]);
  assert.equal(pressSpacingFaults("/x/", read(PLANNED, [])).length, 1);
});
