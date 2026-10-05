import { test } from "node:test";
import assert from "node:assert/strict";
import { clears, clusterWidth, cornerWidth, grownBand } from "../../src/site/shell/top-row.ts";

// Boxes measured on main's build at 90c8fe3 (Issue #762 pull request B's plan, measurements 1, 4, 6 and 8): the nav's one line ends the cluster at 510.2 on every page.
const GAP = 25.6;
const KIT = 304;
const cluster = { left: 25.6, right: 510.2 };
const ribbonAt = (w: number, width = 480) => ({ left: w - 25.6 - width, right: w - 25.6, cap: 480, floor: KIT, pad: 0 });

test("TR1 a row whose corner already stands the gap clear of the cluster writes nothing (the FAQ at 1280)", () => {
  const faq = { left: 1005.6, right: 1254.4, cap: KIT, floor: KIT, pad: 0 };
  assert.equal(clears(cluster, faq, GAP), true);
  assert.equal(cornerWidth(cluster, faq, GAP), null);
  assert.equal(clusterWidth(cluster, faq, GAP), null);
  const prospect = { left: 579.3, right: 875.4, cap: 352, floor: KIT, pad: 0 };
  assert.equal(cornerWidth(cluster, prospect, GAP), null, "the Prospect at 901: a corner whose content sits under its cap and already clears takes no width, where 339.6 would also clear");
});

test("TR2 a corner wider than the kit gives way first, to exactly the width that clears the cluster by the gap (the Ribbon at 960)", () => {
  const ribbon = ribbonAt(960);
  assert.equal(clears(cluster, ribbon, GAP), false, "at its 30rem cap the Ribbon's corner runs 55.8 under the nav");
  const width = cornerWidth(cluster, ribbon, GAP);
  assert.ok(width !== null && Math.abs(width - 398.6) < 0.01, `the corner takes 398.6, got ${width}`);
  const yielded = ribbonAt(960, width);
  assert.equal(clusterWidth(cluster, yielded, GAP), null, "the yield alone clears the row, so the nav keeps its one line");
});

test("TR3 a corner never gives way below its floor, and the cluster then takes what the corner leaves (the Ribbon's cap at 801)", () => {
  assert.equal(cornerWidth(cluster, ribbonAt(801), GAP), KIT, "the floor, not the 239.6 that would clear");
  const atFloor = ribbonAt(801, KIT);
  const width = clusterWidth(cluster, atFloor, GAP);
  assert.ok(width !== null && Math.abs(width - (atFloor.left - GAP - cluster.left)) < 0.01, `the cluster ends the gap short of the corner, got ${width}`);
});

test("TR4 a corner at or under the kit's width never gives way, and the cluster wraps beside it (the Explorer at 640, its narrow corner)", () => {
  const explorer = { left: 430.2, right: 614.4, cap: 200, floor: Math.min(200, KIT), pad: 0 };
  assert.equal(cornerWidth(cluster, explorer, GAP), null, "nothing is written on a corner already at its floor");
  const width = clusterWidth(cluster, explorer, GAP);
  assert.ok(width !== null && Math.abs(width - 379) < 0.01, `430.2 less the gap less the inset, got ${width}`);
});

test("TR5 a corner's own padding is not part of the width written for its content (home's seed panel)", () => {
  const seed = { left: 400, right: 990, cap: 560, floor: 304, pad: 28.8 };
  const width = cornerWidth(cluster, seed, GAP);
  assert.ok(width !== null && Math.abs(width - (990 - 510.2 - GAP - 28.8)) < 0.01, `the content width that puts the box the gap clear, got ${width}`);
});

test("TR6 a corner written to the boundary and read back a hair short does not cap the cluster (the Ribbon at 1024)", () => {
  const read = { left: 535.75, right: 998.4 };
  const exact = { left: 25.6, right: 510.1625 };
  assert.ok(read.left < exact.right + GAP, "the witness: the re-read box is short of the gap by 0.0125");
  assert.equal(clusterWidth(exact, read, GAP), null, "a sub-pixel inside the tolerance leaves the nav on one line");
  assert.equal(clears(exact, read, GAP), true);
});

test("TR7 the band grows by exactly the cluster's growth, written in rem at the page's own root size", () => {
  assert.equal(grownBand(10.6, 37.2, 20), "12.46rem", "10.6rem plus 37.2px at a 20px root");
  assert.equal(grownBand(7.6, 37.2, 16), "9.925rem");
  assert.equal(grownBand(10.6, 0.3, 16), null, "a growth inside the tolerance writes nothing");
});
