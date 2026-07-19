import { test } from "node:test";
import assert from "node:assert/strict";
import {
  LOD_BANDS,
  LATTICE_DIVISIONS,
  bandFor,
  quantizeCenter,
  lodWindowFor,
  plotUvFromSheet,
  windowSheetRect,
  insetSheetRect,
  decideSettle,
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

// ---- Sub 8 settle + inset math (#169, redesigned after PR #245 review) -----------
// The camera stays WORLD-relative for good (no rebase): decideSettle takes the world
// camera directly, and the committed region mounts as an INSET inside the world sheet,
// riding the same transform. The new pure math is the sheet-fraction <-> plot-uv
// conversion (the 4.5% margin) and the inset placement rects.

// Margin fractions kept simple for arithmetic-by-eye; the alignment identities below
// hold for any margins, and the real 1500px-sheet values are proven in place-manifest.
const M = { mx: 0.05, my: 0.06 };

test("plotUvFromSheet maps the sheet-fraction camera into plot-uv, preserving k", () => {
  // The sheet centre IS the plot centre (margins are symmetric).
  assert.deepEqual(plotUvFromSheet({ cx: 0.5, cy: 0.5, k: 3 }, M), { cx: 0.5, cy: 0.5, k: 3 });
  // The plot area's own edges map to uv 0 and 1.
  const lo = plotUvFromSheet({ cx: M.mx, cy: M.my, k: 2 }, M);
  assert.ok(Math.abs(lo.cx) < 1e-12 && Math.abs(lo.cy) < 1e-12, "plot top-left is uv (0,0)");
  const hi = plotUvFromSheet({ cx: 1 - M.mx, cy: 1 - M.my, k: 2 }, M);
  assert.ok(Math.abs(hi.cx - 1) < 1e-12 && Math.abs(hi.cy - 1) < 1e-12, "plot bottom-right is uv (1,1)");
});

test("plotUvFromSheet clamps a camera over the margin/frame area onto the plot", () => {
  const over = plotUvFromSheet({ cx: 0.01, cy: 0.999, k: 2 }, M);
  assert.equal(over.cx, 0, "left of the plot clamps to 0");
  assert.equal(over.cy, 1, "below the plot clamps to 1");
});

test("windowSheetRect places a plot-uv window inside the margined sheet", () => {
  const win = { u0: 0.25, v0: 0.25, u1: 0.75, v1: 0.75 };
  const r = windowSheetRect(win, M);
  assert.ok(Math.abs(r.x - (0.05 + 0.25 * 0.9)) < 1e-12, "x = mx + u0*(1-2mx)");
  assert.ok(Math.abs(r.y - (0.06 + 0.25 * 0.88)) < 1e-12, "y = my + v0*(1-2my)");
  assert.ok(Math.abs(r.w - 0.5 * 0.9) < 1e-12, "w = s*(1-2mx)");
  assert.ok(Math.abs(r.h - 0.5 * 0.88) < 1e-12, "h = s*(1-2my)");
});

test("insetSheetRect: the mounted region sheet's PLOT area lands exactly on the window rect", () => {
  // The whole point of the inset math: the region sheet (same margins, scaled to s of the
  // world sheet) must overhang the window rect by exactly its own scaled margins, so its
  // plot area aligns with the world content it re-surveys, at any window and any margins.
  for (const win of [
    lodWindowFor(0.5, 0.5, 0.5),
    lodWindowFor(0.3, 0.7, 0.25),
    lodWindowFor(0.9, 0.1, 0.125), // clamped near the sheet corner
  ]) {
    const s = win.u1 - win.u0;
    const inset = insetSheetRect(win, M);
    const target = windowSheetRect(win, M);
    assert.ok(Math.abs(inset.w - s) < 1e-12, "inset outer width is s of the world sheet");
    assert.ok(Math.abs(inset.h - s) < 1e-12, "inset outer height is s of the world sheet");
    assert.ok(Math.abs(inset.x + M.mx * s - target.x) < 1e-12, "inset plot-left == window-rect left");
    assert.ok(Math.abs(inset.y + M.my * s - target.y) < 1e-12, "inset plot-top == window-rect top");
    assert.ok(Math.abs(inset.w * (1 - 2 * M.mx) - target.w) < 1e-12, "inset plot width == window-rect width");
    assert.ok(Math.abs(inset.h * (1 - 2 * M.my) - target.h) < 1e-12, "inset plot height == window-rect height");
  }
});

test("insetSheetRect: a CENTRED window mounts at exactly (u0, v0, s, s)", () => {
  // For a centred window u0 = (1-s)/2 the margin overhang cancels algebraically:
  // x = mx + u0(1-2mx) - mx*s = u0 + mx(1 - 2u0 - s) = u0. A tidy invariant worth pinning.
  const win = { u0: 0.25, v0: 0.25, u1: 0.75, v1: 0.75 };
  const r = insetSheetRect(win, M);
  assert.ok(Math.abs(r.x - 0.25) < 1e-12);
  assert.ok(Math.abs(r.y - 0.25) < 1e-12);
  assert.ok(Math.abs(r.w - 0.5) < 1e-12);
  assert.ok(Math.abs(r.h - 0.5) < 1e-12);
});

test("decideSettle: zoom-in from the world enters a region at the quantized window", () => {
  const d = decideSettle({
    camera: { cx: 0.5, cy: 0.5, k: 2 }, // world camera: plot-uv centre + viewport zoom
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
    camera: { cx: 0.5, cy: 0.5, k: 2.2 }, // still band 1 (hysteresis), same lattice cell
    currentWindow: win,
    currentBand: 1,
  });
  assert.equal(d.action, "noop", "unchanged window does not redraft");
});

test("decideSettle: zooming in past the next boundary redrafts the next finer band", () => {
  const win = lodWindowFor(0.5, 0.5, 0.5); // band 1
  const d = decideSettle({
    camera: { cx: 0.5, cy: 0.5, k: 3.2 }, // past the 1/2 up-cross -> band 2
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
  // A pan of the world centre to 0.55 moves past half a lattice cell (step 0.0625),
  // so it quantizes to a different window than the held one. THIS is the always-
  // pannable camera the redesign exists for: the pan itself is never constrained by
  // the region, only re-surveyed after the fact.
  const q = quantizeCenter(0.55, 0.5, 0.5);
  const d = decideSettle({
    camera: { cx: 0.55, cy: 0.5, k: 2 },
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
    camera: { cx: 0.5, cy: 0.5, k: 1.2 }, // under the 0/1 down-cross -> world
    currentWindow: win,
    currentBand: 1,
  });
  assert.equal(d.action, "world", "a zoom-out past band 0 returns to the world sheet");
});

test("decideSettle: a partial zoom-out steps down ONE region band (band-by-band, not straight to world)", () => {
  // Zoom-out is tier-ordered too: only the region -> world hop drops the inset with no
  // worker; an intermediate down-cross redrafts the next COARSER region. From band 3,
  // k=4.0 drops one step to band 2 (4.0 < DOWN[2], not DOWN[1]).
  const win3 = lodWindowFor(0.5, 0.5, 0.125); // band 3
  const d = decideSettle({
    camera: { cx: 0.5, cy: 0.5, k: 4.0 },
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
