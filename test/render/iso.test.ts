import { test } from "node:test";
import assert from "node:assert/strict";
import { createField } from "../../src/core/grid.ts";
import { isoLayer, isolines } from "../../src/render/layers/iso.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { renderSvg } from "../../src/render/svg.ts";
import type { RenderCtx } from "../../src/render/context.ts";
import type { ThemeName } from "../../src/render/layers/field.ts";
import { STYLES, type StyleName } from "../../src/render/style.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";

const STYLE_NAMES: StyleName[] = ["antique", "topographic", "ink", "nautical"];

test("isolines: a monotonic field yields evenly spaced levels, ordered by value", () => {
  // vertical gradient 0..1; 13 rows and 10 level-slots are coprime, so no iso
  // value ever lands exactly on a lattice value
  const f = createField(20, 14, (_x, y) => y / 13);
  const sets = isolines(f, 9);
  assert.equal(sets.length, 9, "one set per requested level");
  for (let i = 0; i < sets.length; i++) {
    const s = sets[i]!;
    const expected = (i + 1) / 10; // interior fractions of the [0,1] span
    assert.ok(Math.abs(s.value - expected) < 1e-9, `level ${i} sits at ${expected}`);
    assert.equal(s.contours.length, 1, `level ${i} traces one chain`);
    assert.equal(s.contours[0]!.closed, false, `level ${i} is an open chain`);
  }
  const values = sets.map((s) => s.value);
  assert.deepEqual(values, [...values].sort((a, b) => a - b), "ordered by value");
});

test("isolines: a radial bump yields closed rings; a flat field yields nothing", () => {
  const bump = createField(21, 21, (x, y) => {
    const d = Math.hypot(x - 10, y - 10);
    return Math.max(0, 1 - d / 9.7);
  });
  const sets = isolines(bump, 5);
  assert.ok(sets.length >= 1, "the bump has isolines");
  const rings = sets.flatMap((s) => s.contours).filter((c) => c.closed);
  assert.ok(rings.length >= 1, "interior levels close into rings");

  assert.deepEqual(isolines(createField(8, 8, () => 0.5), 9), [], "flat field, no lines");
});

/** The larger of a ring's grid-space width and height, in cells. */
function maxExtent(points: ReadonlyArray<readonly [number, number]>): number {
  let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
  for (const [x, y] of points) {
    if (x < minx) minx = x;
    if (x > maxx) maxx = x;
    if (y < miny) miny = y;
    if (y > maxy) maxy = y;
  }
  return Math.max(maxx - minx, maxy - miny);
}

test("isolines: a lone spike keeps its broad low ring but culls the sub-pixel high one", () => {
  // one cell above a flat floor. Its rings shrink toward the peak: the 0.1 ring
  // rides ~0.9 cell out from the centre (a real ~1.8-cell diamond), the 0.9 ring
  // hugs the corner at ~0.1 cell out (a degenerate ~0.2-cell speck to be culled).
  const spike = createField(5, 5, (x, y) => (x === 2 && y === 2 ? 1 : 0));
  const sets = isolines(spike, 9); // interior levels 0.1 .. 0.9
  const low = sets.find((s) => Math.abs(s.value - 0.1) < 1e-9);
  assert.ok(low?.contours.some((c) => c.closed), "the broad 0.1 ring survives");
  const high = sets.find((s) => Math.abs(s.value - 0.9) < 1e-9);
  assert.ok(
    !high || high.contours.every((c) => !c.closed),
    "the sub-pixel 0.9 ring is culled",
  );
});

test("isolines: sub-pixel mottle rings are culled off the real rainfall field", () => {
  const world = generateWorld(defaultRecipe(42));
  const closed = isolines(world.climate.moisture, 9)
    .flatMap((s) => s.contours)
    .filter((c) => c.closed);
  assert.ok(closed.length > 100, "the noisy field still carries real rings");
  for (const c of closed) {
    assert.ok(
      maxExtent(c.points) > 0.5,
      `every surviving ring clears the sub-pixel floor (found ${maxExtent(c.points).toFixed(3)} cells)`,
    );
  }
});

test("the rainfall isohyets lead the plate; the temperature isotherms stay faint", () => {
  const world = generateWorld(defaultRecipe(42));
  const isoGroup = (theme: "moisture" | "climate"): string =>
    renderMap(world, { style: "nautical", theme }).match(
      /<g id="layer-iso">[\s\S]*?<\/g><\/g>/,
    )?.[0] ?? "";

  const rain = isoGroup("moisture");
  assert.match(rain, /stroke="#78765f"/, "isohyets take the bold grey-brown");
  assert.match(rain, /stroke-width="1"/, "isohyets are 1.0px");
  assert.match(rain, /stroke-opacity="0.72"/, "isohyets sit at 0.72 opacity");

  const temp = isoGroup("climate");
  assert.match(temp, /stroke-width="0.7"/, "isotherms stay 0.7px");
  assert.match(temp, /stroke-opacity="0.45"/, "isotherms stay 0.45 opacity");
  assert.match(
    temp,
    new RegExp(`stroke="${STYLES.nautical.contourStroke}"`),
    "isotherms keep the style's soft contour stroke",
  );
  assert.doesNotMatch(temp, /stroke="#78765f"/, "the boldness never touches temperature");
});

test("the temperature plate carries coastline-clipped isotherms in every style", () => {
  const world = generateWorld(defaultRecipe(42));
  for (const style of STYLE_NAMES) {
    const svg = renderMap(world, { style, theme: "climate" });
    const layer = svg.match(/<g id="layer-iso">[\s\S]*?<\/g><\/g>/)?.[0];
    assert.ok(layer, `${style}: isotherm layer present`);
    assert.match(layer, /<clipPath id="iso-clip">/, `${style}: clip defined`);
    assert.match(
      layer,
      /<g clip-path="url\(#iso-clip\)">/,
      `${style}: clip applied, not just defined`,
    );
    const strokes = layer.match(/stroke="#[0-9a-f]{6}"/gi) ?? [];
    assert.equal(strokes.length, 9, `${style}: nine visibly stroked levels`);
    if (style === "antique") {
      // antique has no contourStroke; the fallback must be its soft ink
      assert.ok(
        layer.includes(`stroke="${STYLES.antique.inkSoft}"`),
        "antique falls back to inkSoft",
      );
    }
    assert.ok(!svg.includes("NaN"), `${style}: no NaN coordinates`);
  }
});

test("the rainfall plate carries coastline-clipped isohyets in every style", () => {
  const world = generateWorld(defaultRecipe(42));
  for (const style of STYLE_NAMES) {
    const svg = renderMap(world, { style, theme: "moisture" });
    const layer = svg.match(/<g id="layer-iso">[\s\S]*?<\/g><\/g>/)?.[0];
    assert.ok(layer, `${style}: isohyet layer present`);
    assert.match(layer, /<clipPath id="iso-clip">/, `${style}: clip defined`);
    assert.match(
      layer,
      /<g clip-path="url\(#iso-clip\)">/,
      `${style}: clip applied, not just defined`,
    );
    const strokes = layer.match(/stroke="#[0-9a-f]{6}"/gi) ?? [];
    assert.equal(strokes.length, 9, `${style}: nine visibly stroked levels`);
    // #73's wind streaks and the isohyets share the plate; lines draw above streaks
    const streamsAt = svg.indexOf('id="layer-wind-streams"');
    const isoAt = svg.indexOf('id="layer-iso"');
    assert.ok(streamsAt >= 0, `${style}: wind streamlines still on the plate`);
    assert.ok(streamsAt < isoAt, `${style}: isohyets draw above the wind streaks`);
    assert.ok(!svg.includes("NaN"), `${style}: no NaN coordinates`);
  }
});

test("isoLayer geometry: nine open, projected chains at their level's height", () => {
  // a bare-bones ctx: vertical temperature gradient, anisotropic projection so
  // a dropped proj.px/py is caught, empty coast (clip markup only)
  const ctx = {
    theme: "climate",
    world: { climate: { temperature: createField(20, 14, (_x, y) => y / 13) } },
    proj: { px: (x: number) => x * 10, py: (y: number) => y * 2 },
    style: STYLES.antique,
    coastRings: [],
  } as unknown as RenderCtx;
  const svg = renderSvg(isoLayer(ctx)!);
  const ds = [...svg.matchAll(/ d="(M[^"]*)"/g)].map((m) => m[1] as string);
  assert.equal(ds.length, 9, "nine isotherm paths");
  ds.forEach((d, i) => {
    assert.ok(!d.includes("Z"), `level ${i}: open chains stay open`);
    const nums = (d.match(/-?[\d.]+/g) ?? []).map(Number);
    const [xFirst, yFirst] = [nums[0] as number, nums[1] as number];
    const [xLast, yLast] = [nums[nums.length - 2] as number, nums[nums.length - 1] as number];
    // level i sits at grid y = 1.3*(i+1), projected *2; spans columns 0..19, *10
    const y = 2 * 1.3 * (i + 1);
    assert.ok(Math.abs(yFirst - y) < 0.05 && Math.abs(yLast - y) < 0.05, `level ${i} at y=${y}`);
    assert.deepEqual(
      [xFirst, xLast].sort((a, b) => a - b),
      [0, 190],
      `level ${i} spans the projected grid width`,
    );
  });
});

test("isolines stay off the vegetation and population plates", () => {
  const world = generateWorld(defaultRecipe(42));
  assert.ok(!renderMap(world, {}).includes('id="layer-iso"'), "no plate, no isolines");
  for (const theme of ["vegetation", "population"] as ThemeName[]) {
    assert.ok(
      !renderMap(world, { theme }).includes('id="layer-iso"'),
      `${theme}: no isolines`,
    );
  }
});
