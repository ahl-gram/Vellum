import { test } from "node:test";
import assert from "node:assert/strict";
import { createField, type Field } from "../../src/core/grid.ts";
import { isoLayer, isolines } from "../../src/render/layers/iso.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { renderSvg } from "../../src/render/svg.ts";
import type { RenderCtx } from "../../src/render/context.ts";
import type { ThemeName } from "../../src/render/layers/field.ts";
import { STYLES, type StyleName } from "../../src/render/style.ts";
import { marchingSquares } from "../../src/terrain/contours.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";

const STYLE_NAMES: StyleName[] = ["antique", "topographic", "ink", "nautical"];

test("isolines: a monotonic field yields evenly spaced levels, ordered by value", () => {
  // Vertical gradient 0..1; 13 rows and 10 level-slots are coprime, so no iso value ever lands exactly on a lattice value.
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
  assert.deepEqual(
    values,
    [...values].sort((a, b) => a - b),
    "ordered by value",
  );
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

  assert.deepEqual(
    isolines(
      createField(8, 8, () => 0.5),
      9,
    ),
    [],
    "flat field, no lines",
  );
});

test("isolines: a lone spike keeps its broad low ring but culls the sub-pixel high one", () => {
  // One cell above a flat floor: the 0.1 ring rides ~0.9 cell out (a real ~1.8-cell diamond), the 0.9 ring hugs the corner at ~0.1 cell (a degenerate ~0.2-cell speck to be culled).
  const spike = createField(5, 5, (x, y) => (x === 2 && y === 2 ? 1 : 0));
  const sets = isolines(spike, 9); // interior levels 0.1 .. 0.9
  const low = sets.find((s) => Math.abs(s.value - 0.1) < 1e-9);
  assert.ok(
    low?.contours.some((c) => c.closed),
    "the broad 0.1 ring survives",
  );
  const high = sets.find((s) => Math.abs(s.value - 0.9) < 1e-9);
  assert.ok(!high || high.contours.every((c) => !c.closed), "the sub-pixel 0.9 ring is culled");
});

test("isolines: a closed ring survives while its longer side spans 0.6 cell or more, and is culled below it", () => {
  const closedAt = (field: Field, levels: number, v: number): boolean =>
    isolines(field, levels).some((s) => Math.abs(s.value - v) < 1e-9 && s.contours.some((c) => c.closed));
  const spike = createField(5, 5, (x, y) => (x === 2 && y === 2 ? 1 : 0));
  assert.equal(closedAt(spike, 19, 0.65), true, "a lone spike's 0.65 ring spans 2 x 0.35 = 0.7 cell, and survives");
  assert.equal(closedAt(spike, 19, 0.75), false, "its 0.75 ring spans 2 x 0.25 = 0.5 cell, and is culled");
  const bar = createField(7, 5, (x, y) => (y === 2 && (x === 2 || x === 3) ? 1 : 0));
  assert.equal(
    closedAt(bar, 19, 0.75),
    true,
    "beside a second high cell the 0.75 ring is 1.5 cells long and 0.5 tall, and the longer side keeps it",
  );
  assert.equal(closedAt(bar, 19, 0.95), true, "its 0.95 ring, 1.1 cells long and 0.1 tall, survives too");
});

test("isolines: sub-pixel mottle rings are culled off the real rainfall field", () => {
  const field = generateWorld(defaultRecipe(42)).climate.moisture;
  const sets = isolines(field, 9);
  const kept = sets.flatMap((s) => s.contours).filter((c) => c.closed).length;
  const traced = sets.flatMap((s) => marchingSquares(field, s.value)).filter((c) => c.closed).length;
  assert.ok(kept > 100, `the noisy field still carries real rings (${kept})`);
  assert.ok(traced > kept, `the cull removed some of the ${traced} rings the field traces (kept ${kept})`);
});

test("the rainfall isohyets lead the plate; the temperature isotherms stay faint", () => {
  const world = generateWorld(defaultRecipe(42));
  const isoGroup = (theme: "moisture" | "climate"): string =>
    renderMap(world, { style: "nautical", theme }).match(/<g id="layer-iso">[\s\S]*?<\/g><\/g>/)?.[0] ?? "";

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
    assert.match(layer, /<g clip-path="url\(#iso-clip\)">/, `${style}: clip applied, not just defined`);
    const strokes = layer.match(/stroke="#[0-9a-f]{6}"/gi) ?? [];
    assert.equal(strokes.length, 9, `${style}: nine visibly stroked levels`);
    if (style === "antique") {
      assert.ok(layer.includes(`stroke="${STYLES.antique.inkSoft}"`), "antique falls back to inkSoft");
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
    assert.match(layer, /<g clip-path="url\(#iso-clip\)">/, `${style}: clip applied, not just defined`);
    const strokes = layer.match(/stroke="#[0-9a-f]{6}"/gi) ?? [];
    assert.equal(strokes.length, 9, `${style}: nine visibly stroked levels`);
    const streamsAt = svg.indexOf('id="layer-wind-streams"');
    const isoAt = svg.indexOf('id="layer-iso"');
    assert.ok(streamsAt >= 0, `${style}: wind streamlines still on the plate`);
    assert.ok(streamsAt < isoAt, `${style}: isohyets draw above the wind streaks`);
    assert.ok(!svg.includes("NaN"), `${style}: no NaN coordinates`);
  }
});

test("isoLayer geometry: nine open, projected chains at their level's height", () => {
  // A bare-bones ctx: vertical temperature gradient, anisotropic projection so a dropped proj.px/py is caught, empty coast (clip markup only).
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
    assert.ok(!renderMap(world, { theme }).includes('id="layer-iso"'), `${theme}: no isolines`);
  }
});
