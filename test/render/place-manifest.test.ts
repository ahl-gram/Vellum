import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { buildPlaceManifest } from "../../src/render/place-manifest.ts";

// Unit tests for #52: the projected place manifest, the data layer the Living
// Chart epic (#51) consumes. The projection MUST match renderMap exactly
// (map-renderer.ts:87-88), so the expected pixel coords here are reconstructed by
// hand from world.elev.w/h and Math.round(widthPx*0.045), independent of
// createProjection, so a regression in either the manifest OR the projection
// helper is caught (not the tautological nx*widthPx === proj.px(s.x)).

const world = generateWorld(defaultRecipe(42, { gridW: 160, gridH: 120 }));
const WIDTH = 1500;

// Hand-rolled mirror of createProjection (transform.ts) + renderMap's margin.
const margin = Math.round(WIDTH * 0.045);
const scale = (WIDTH - 2 * margin) / (world.elev.w - 1);
const expectedHeightPx = 2 * margin + (world.elev.h - 1) * scale;
const expectedPx = (x: number) => margin + x * scale;
const expectedPy = (y: number) => margin + y * scale;

const EPS = 1e-9;

test("one PlaceMark per settlement, with matching name/kind/founded/ruined", () => {
  const m = buildPlaceManifest(world, WIDTH);
  assert.equal(m.places.length, world.settlements.length);
  m.places.forEach((p, i) => {
    const s = world.settlements[i]!;
    assert.equal(p.idx, i, `place ${i} idx`);
    assert.equal(p.name, s.name, `place ${i} name`);
    assert.equal(p.kind, s.kind, `place ${i} kind`);
    assert.equal(p.founded, s.founded, `place ${i} founded`);
    assert.equal(p.ruined, s.ruined, `place ${i} ruined`);
  });
});

test("nx/ny reproduce renderMap's projected pixel coords for seed 42", () => {
  const m = buildPlaceManifest(world, WIDTH);
  assert.equal(m.widthPx, WIDTH, "widthPx echoed");
  assert.ok(Math.abs(m.heightPx - expectedHeightPx) < EPS, "heightPx matches projection");
  m.places.forEach((p, i) => {
    const s = world.settlements[i]!;
    const px = p.nx * m.widthPx;
    const py = p.ny * m.heightPx;
    assert.ok(
      Math.abs(px - expectedPx(s.x)) < EPS,
      `place ${i} px: got ${px}, want ${expectedPx(s.x)}`,
    );
    assert.ok(
      Math.abs(py - expectedPy(s.y)) < EPS,
      `place ${i} py: got ${py}, want ${expectedPy(s.y)}`,
    );
  });
});

test("events ship verbatim and presentYear is the survey year", () => {
  const m = buildPlaceManifest(world, WIDTH);
  assert.equal(m.events, world.history.events, "events ship by reference, no copy");
  assert.equal(m.presentYear, world.title.year, "presentYear is world.title.year");
});

test("the manifest is structured-cloneable (no Field methods leak across the worker)", () => {
  const m = buildPlaceManifest(world, WIDTH);
  const clone = structuredClone(m);
  assert.deepEqual(clone, m, "round-trips through the structured-clone algorithm");
});

test("nx/ny are width-independent fractions: a wider render scales pixels, not fractions", () => {
  const a = buildPlaceManifest(world, 1000);
  const b = buildPlaceManifest(world, 2000);
  a.places.forEach((pa, i) => {
    const pb = b.places[i]!;
    assert.ok(Math.abs(pa.nx - pb.nx) < EPS, `place ${i} nx invariant to width`);
    assert.ok(Math.abs(pa.ny - pb.ny) < EPS, `place ${i} ny invariant to width`);
  });
});
