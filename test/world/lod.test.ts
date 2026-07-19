import { test } from "node:test";
import assert from "node:assert/strict";
import {
  LOD_BANDS,
  LATTICE_DIVISIONS,
  bandFor,
  quantizeCenter,
  lodWindowFor,
  worldCameraFrom,
  decideSettle,
  scaleExtentFor,
  FULL_WINDOW,
} from "../../src/world/lod.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { windowAround } from "../../src/world/region.ts";

// The Surveyor's Glass LOD schedule (#168): a pure map from a continuous camera
// zoom k to a discrete band, a fixed lattice that snaps nearby settles to one
// window (so the worker cache and the stamped recipe stay stable), and a window
// derived from the band size that clamps exactly like windowAround.

test("LOD_BANDS: four bands, sizeUV = 1/k, grid fixed at 320x240", () => {
  assert.equal(LOD_BANDS.length, 4);
  LOD_BANDS.forEach((b, i) => {
    assert.equal(b.index, i, "index matches array position");
    assert.ok(Math.abs(b.sizeUV - 1 / b.k) < 1e-12, `sizeUV=1/k for band ${i}`);
    assert.equal(b.gridW, 320, "grid width fixed per band");
    assert.equal(b.gridH, 240, "grid height fixed per band");
    assert.equal(b.isRegion, i > 0, "band 0 is the world sheet; 1..3 are regions");
  });
  assert.deepEqual(
    LOD_BANDS.map((b) => b.k),
    [1, 2, 4, 8],
    "the k ladder is 1,2,4,8",
  );
});

test("bandFor with no current band picks the nominal band for k", () => {
  assert.equal(bandFor(1), 0, "k=1 is the world sheet");
  assert.equal(bandFor(1.0), 0);
  assert.equal(bandFor(2.0), 1, "at the k=2 rung");
  assert.equal(bandFor(4.0), 2, "at the k=4 rung");
  assert.equal(bandFor(8.0), 3, "at the k=8 rung");
  assert.equal(bandFor(100), 3, "clamps to the finest band");
});

test("bandFor is hysteretic: the SAME k resolves differently by current band", () => {
  // These three k values each sit inside the deadband of a boundary, so which
  // band you keep depends on which side you came from. This is the whole point
  // of hysteresis: a settle near a boundary must not thrash bands.
  assert.equal(bandFor(1.45, 0), 0, "held below at the 0/1 boundary");
  assert.equal(bandFor(1.45, 1), 1, "held above at the 0/1 boundary");

  assert.equal(bandFor(2.7, 1), 1, "held below at the 1/2 boundary");
  assert.equal(bandFor(2.7, 2), 2, "held above at the 1/2 boundary");

  assert.equal(bandFor(5.3, 2), 2, "held below at the 2/3 boundary");
  assert.equal(bandFor(5.3, 3), 3, "held above at the 2/3 boundary");
});

test("bandFor climbs one band at a time on an ascending zoom", () => {
  let band = 0;
  const walk = [1.0, 1.5, 1.7, 3.0, 3.3, 6.0, 6.5];
  const expected = [0, 0, 1, 1, 2, 2, 3];
  walk.forEach((k, i) => {
    band = bandFor(k, band);
    assert.equal(band, expected[i], `k=${k} -> band ${expected[i]}`);
  });
});

test("bandFor drops one band at a time on a descending zoom", () => {
  let band = 3;
  const walk = [6.0, 5.0, 2.6, 2.5, 1.3, 1.2];
  const expected = [3, 2, 2, 1, 1, 0];
  walk.forEach((k, i) => {
    band = bandFor(k, band);
    assert.equal(band, expected[i], `k=${k} -> band ${expected[i]}`);
  });
});

test("bandFor honours a multi-band jump in one settle (hysteresis is per-boundary, not a one-step limiter)", () => {
  assert.equal(bandFor(8, 0), 3, "a fast zoom from home lands directly at the finest band");
  assert.equal(bandFor(1, 3), 0, "a fast zoom-out from the finest band lands home");
});

test("quantizeCenter snaps to a fixed lattice: nearby settles collapse to one window", () => {
  const size = 0.25;
  const step = size / LATTICE_DIVISIONS;

  const base = quantizeCenter(0.5, 0.5, size);
  // snapped centres are multiples of the lattice step
  assert.ok(Math.abs(Math.round(base.cx / step) * step - base.cx) < 1e-12);
  assert.ok(Math.abs(Math.round(base.cy / step) * step - base.cy) < 1e-12);

  // idempotent: snapping a snapped centre is a no-op (cache stability)
  const again = quantizeCenter(base.cx, base.cy, size);
  assert.deepEqual(again, base, "quantize is idempotent");

  // a jitter well under half a step lands on the SAME lattice point
  const near = quantizeCenter(0.5 + step * 0.3, 0.5 - step * 0.3, size);
  assert.deepEqual(near, base, "sub-cell jitter collapses to one window");

  // a move past half a step lands on a DIFFERENT lattice point (real quantization)
  const far = quantizeCenter(0.5 + step * 0.7, 0.5, size);
  assert.notEqual(far.cx, base.cx, "a move past half a cell snaps to a new window");
});

test("lodWindowFor clamps exactly like windowAround (same [0.01, 0.99-size] bounds)", () => {
  const world = generateWorld(defaultRecipe(42));
  const capital = world.settlements.find((s) => s.kind === "capital");
  assert.ok(capital);
  const size = 0.25;
  const u = capital.x / (world.recipe.gridW - 1);
  const v = capital.y / (world.recipe.gridH - 1);
  assert.deepEqual(
    lodWindowFor(u, v, size),
    windowAround(world, capital, size),
    "a centre-derived window matches windowAround byte-for-byte",
  );
});

test("lodWindowFor clamps a centre near the world edge inside the sheet", () => {
  const size = 0.5;
  const lo = lodWindowFor(0, 0, size);
  assert.equal(lo.u0, 0.01, "left edge clamps to 0.01");
  assert.equal(lo.v0, 0.01, "top edge clamps to 0.01");
  assert.ok(Math.abs(lo.u1 - (0.01 + size)) < 1e-12);

  const hi = lodWindowFor(1, 1, size);
  assert.ok(Math.abs(hi.u0 - (0.99 - size)) < 1e-12, "right edge clamps to 0.99-size");
  assert.ok(Math.abs(hi.v0 - (0.99 - size)) < 1e-12, "bottom edge clamps to 0.99-size");
});

// ---- Sub 8 settle math (#169) ---------------------------------------------------

test("worldCameraFrom is the identity at band 0 (the world sheet)", () => {
  assert.deepEqual(
    worldCameraFrom({ cx: 0.5, cy: 0.5, k: 3 }, FULL_WINDOW),
    { cx: 0.5, cy: 0.5, k: 3 },
    "a full-window sheet needs no composition",
  );
});

test("worldCameraFrom composes a region-relative camera up into world-uv (#169)", () => {
  // A size-0.5 window at (0.25..0.75). The region sheet's own centre (cx=cy=0.5, ck=1)
  // is the world centre 0.5, at world zoom 1/0.5 = 2 (the window fills the viewport).
  const win = { u0: 0.25, v0: 0.25, u1: 0.75, v1: 0.75 };
  assert.deepEqual(worldCameraFrom({ cx: 0.5, cy: 0.5, k: 1 }, win), { cx: 0.5, cy: 0.5, k: 2 });
  // The region's top-left corner (cx=cy=0) is world (0.25, 0.25); ck=1 -> wk=2.
  assert.deepEqual(worldCameraFrom({ cx: 0, cy: 0, k: 1 }, win), { cx: 0.25, cy: 0.25, k: 2 });
  // Zoom the region 1.6x -> world zoom 3.2 (crosses into band 2).
  assert.deepEqual(worldCameraFrom({ cx: 0.5, cy: 0.5, k: 1.6 }, win).k, 3.2);
});

test("scaleExtentFor maps every band's region-ck onto the global world zoom [1,8]", () => {
  assert.deepEqual(scaleExtentFor(0), [1, 8], "band 0 is the world sheet");
  // Region band b: ck in [1/k_b, 8/k_b], so wk = ck*k_b spans [1,8] at every band.
  assert.deepEqual(scaleExtentFor(1), [1 / 2, 8 / 2]);
  assert.deepEqual(scaleExtentFor(2), [1 / 4, 8 / 4]);
  assert.deepEqual(scaleExtentFor(3), [1 / 8, 8 / 8]);
});

test("decideSettle: zoom-in from the world enters a region at the quantized window", () => {
  const d = decideSettle({
    camera: { cx: 0.5, cy: 0.5, k: 2 }, // world-relative at band 0
    currentWindow: FULL_WINDOW,
    currentBand: 0,
  });
  assert.equal(d.action, "region");
  if (d.action !== "region") return;
  assert.equal(d.band, 1, "k=2 is band 1");
  assert.deepEqual(d.window, lodWindowFor(0.5, 0.5, 0.5), "quantized window centred on the camera");
});

test("decideSettle: a settle onto the SAME band and window is a no-op (skip the redraft)", () => {
  const win = lodWindowFor(0.5, 0.5, 0.5); // band-1 window centred at 0.5
  const d = decideSettle({
    camera: { cx: 0.5, cy: 0.5, k: 1 }, // region home: world centre 0.5, wk=2 -> still band 1
    currentWindow: win,
    currentBand: 1,
  });
  assert.equal(d.action, "noop", "unchanged window does not redraft");
});

test("decideSettle: zooming in inside a region redrafts the next finer band", () => {
  const win = lodWindowFor(0.5, 0.5, 0.5); // band 1
  const d = decideSettle({
    camera: { cx: 0.5, cy: 0.5, k: 1.6 }, // wk = 1.6/0.5 = 3.2 -> band 2
    currentWindow: win,
    currentBand: 1,
  });
  assert.equal(d.action, "region");
  if (d.action !== "region") return;
  assert.equal(d.band, 2);
  assert.deepEqual(d.window, lodWindowFor(0.5, 0.5, 0.25));
});

test("decideSettle: panning to a new quantized window inside the band redrafts", () => {
  const win = lodWindowFor(0.5, 0.5, 0.5); // band 1 centred at 0.5
  // A region-relative cx of 0.6 pans the WORLD centre to 0.25 + 0.6*0.5 = 0.55, past half a
  // lattice cell (step 0.0625), so it quantizes to a different window than the held one.
  const q = quantizeCenter(0.55, 0.5, 0.5);
  const d = decideSettle({
    camera: { cx: 0.6, cy: 0.5, k: 1 },
    currentWindow: win,
    currentBand: 1,
  });
  assert.equal(d.action, "region", "a new window in the same band still redrafts");
  if (d.action !== "region") return;
  assert.equal(d.band, 1);
  assert.notDeepEqual(d.window, win, "the window moved");
  assert.deepEqual(d.window, lodWindowFor(q.cx, q.cy, 0.5), "the quantized panned window");
});

test("decideSettle: zooming back out of a region reverts to the retained world sheet", () => {
  const win = lodWindowFor(0.5, 0.5, 0.5); // band 1
  const d = decideSettle({
    camera: { cx: 0.5, cy: 0.5, k: 0.6 }, // wk = 0.6/0.5 = 1.2 < the 0/1 down-cross -> world
    currentWindow: win,
    currentBand: 1,
  });
  assert.equal(d.action, "world", "a zoom-out past band 0 returns to the world sheet");
});

test("decideSettle: a partial zoom-out steps down ONE region band (band-by-band, not straight to world)", () => {
  // Zoom-out is tier-ordered too: only the region -> world hop is the retained-sheet, no-worker
  // revert; an intermediate down-cross redrafts the next COARSER region. From band 3, ck=0.5 is
  // wk = 0.5/0.125 = 4.0, and bandFor(4.0, 3) drops one step to band 2 (4.0 < DOWN[2], not DOWN[1]).
  const win3 = lodWindowFor(0.5, 0.5, 0.125); // band 3
  const d = decideSettle({
    camera: { cx: 0.5, cy: 0.5, k: 0.5 },
    currentWindow: win3,
    currentBand: 3,
  });
  assert.equal(d.action, "region", "an intermediate zoom-out redrafts, it does not revert to world");
  if (d.action !== "region") return;
  assert.equal(d.band, 2, "band 3 steps to band 2, not straight to band 0");
  assert.deepEqual(d.window, lodWindowFor(0.5, 0.5, 0.25));
});

test("decideSettle: staying on the world sheet is a no-op", () => {
  const d = decideSettle({
    camera: { cx: 0.5, cy: 0.5, k: 1.1 }, // still band 0
    currentWindow: FULL_WINDOW,
    currentBand: 0,
  });
  assert.equal(d.action, "noop", "the world sheet does not redraft itself");
});
