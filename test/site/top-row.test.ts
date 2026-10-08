import { test } from "node:test";
import assert from "node:assert/strict";
import { clears, cornerWidth } from "../../src/site/shell/top-row.ts";

// Boxes measured on main's build at 90c8fe3 (Issue #762 pull request B's plan, measurements 1, 4, 6 and 8): the nav's one line ends the cluster at 510.2 on every page.
const GAP = 25.6;
const KIT = 304;
const cluster = { left: 25.6, right: 510.2 };
const ribbonAt = (w: number, width = 480) => ({
  left: w - 25.6 - width,
  right: w - 25.6,
  cap: 480,
  floor: KIT,
  pad: 0,
});

test("TR1 a row whose corner already stands the gap clear of the cluster writes nothing (the FAQ at 1280)", () => {
  const faq = { left: 1005.6, right: 1254.4, cap: KIT, floor: KIT, pad: 0 };
  assert.equal(clears(cluster, faq, GAP), true);
  assert.equal(cornerWidth(cluster, faq, GAP), null);
  const prospect = { left: 579.3, right: 875.4, cap: 352, floor: KIT, pad: 0 };
  assert.equal(
    cornerWidth(cluster, prospect, GAP),
    null,
    "the Prospect at 901: a corner whose content sits under its cap and already clears takes no width, where 339.6 would also clear",
  );
});

test("TR2 a corner wider than the kit gives way, to exactly the width that clears the cluster by the gap (the Ribbon at 960)", () => {
  const ribbon = ribbonAt(960);
  assert.equal(clears(cluster, ribbon, GAP), false, "at its 30rem cap the Ribbon's corner runs 55.8 under the nav");
  const width = cornerWidth(cluster, ribbon, GAP);
  assert.ok(width !== null && Math.abs(width - 398.6) < 0.01, `the corner takes 398.6, got ${width}`);
  assert.equal(clears(cluster, ribbonAt(960, width), GAP), true, "the yield alone clears the row");
});

test("TR3 a corner never gives way below its floor (the Ribbon's cap at 801)", () => {
  assert.equal(cornerWidth(cluster, ribbonAt(801), GAP), KIT, "the floor, not the 239.6 that would clear");
});

test("TR4 a corner at or under the kit's width never gives way, even running under the cluster (a room's kit corner, its cap the kit's 19rem)", () => {
  const kit = { left: 500, right: 998.4, cap: KIT, floor: KIT, pad: 0 };
  assert.equal(clears(cluster, kit, GAP), false);
  assert.equal(cornerWidth(cluster, kit, GAP), null, "nothing is written on a corner already at its floor");
});

test("TR5 a corner's own padding is not part of the width written for its content", () => {
  const padded = { left: 400, right: 990, cap: 560, floor: 304, pad: 28.8 };
  const width = cornerWidth(cluster, padded, GAP);
  assert.ok(
    width !== null && Math.abs(width - (990 - 510.2 - GAP - 28.8)) < 0.01,
    `the content width that puts the box the gap clear, got ${width}`,
  );
});

test("TR6 a corner read back a hair short of the gap counts as clear, and one short by more than the tolerance does not (a synthetic witness: the browser read the Ribbon 0.0094 over at 1024, so no e2e width reaches the tolerance)", () => {
  const exact = { left: 25.6, right: 510.1625 };
  const edge = exact.right + GAP;
  const at = (left: number) => ({ left, right: 998.4, cap: 480, floor: KIT, pad: 0 });
  assert.ok(535.75 < edge, "the witness: the re-read box is short of the gap by 0.0125");
  assert.equal(clears(exact, at(535.75), GAP), true, "a sub-pixel inside the tolerance clears");
  assert.equal(cornerWidth(exact, at(edge - 0.4), GAP), null, "0.4 short still clears, so nothing is written");
  assert.notEqual(
    cornerWidth(exact, at(edge - 0.6), GAP),
    null,
    "0.6 short does not: the tolerance is half a pixel, no more",
  );
});
