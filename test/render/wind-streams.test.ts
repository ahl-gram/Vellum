import { test } from "node:test";
import assert from "node:assert/strict";
import { renderMap } from "../../src/render/map-renderer.ts";
import type { ThemeName } from "../../src/render/layers/field.ts";
import type { StyleName } from "../../src/render/style.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";

const STYLE_NAMES: StyleName[] = ["antique", "topographic", "ink", "nautical"];

test("the rainfall plate carries land-clipped wind streaks in every style", () => {
  const world = generateWorld(defaultRecipe(42));
  for (const style of STYLE_NAMES) {
    const svg = renderMap(world, { style, theme: "moisture" });
    const layer = svg.match(/<g id="layer-wind-streams">[\s\S]*?<\/g><\/g>/)?.[0];
    assert.ok(layer, `${style}: wind-streams layer present`);
    assert.match(layer, /<clipPath id="wind-streams-clip">/, `${style}: clip defined`);
    assert.match(
      layer,
      /<g clip-path="url\(#wind-streams-clip\)">/,
      `${style}: clip applied, not just defined`,
    );
    const strokes = layer.match(/stroke="#[0-9a-f]{6}"/gi) ?? [];
    assert.ok(strokes.length >= 10, `${style}: a sparse field of streaks (${strokes.length})`);
    assert.ok(!svg.includes("NaN"), `${style}: no NaN coordinates`);
  }
});

test("wind streaks are exclusive to the rainfall plate", () => {
  const world = generateWorld(defaultRecipe(42));
  assert.ok(
    !renderMap(world, { style: "nautical" }).includes('id="layer-wind-streams"'),
    "no plate, no streaks (arrows only)",
  );
  for (const theme of ["vegetation", "climate", "population"] as ThemeName[]) {
    assert.ok(
      !renderMap(world, { theme }).includes('id="layer-wind-streams"'),
      `${theme}: no streaks`,
    );
  }
});

test("the streaks follow the world's wind", () => {
  const world = generateWorld(defaultRecipe(42));
  const rotated = {
    ...world,
    winds: { dir: (world.winds.dir + Math.PI / 2) % (Math.PI * 2) },
  };
  assert.notEqual(
    renderMap(world, { theme: "moisture" }),
    renderMap(rotated, { theme: "moisture" }),
    "rotating world.winds turns the streaks",
  );

  // and not merely "responds to": every streak points along the wind. The
  // two-point d= pattern excludes the multi-segment coast clip path.
  const svg = renderMap(world, { theme: "moisture" });
  const layer = svg.match(/<g id="layer-wind-streams">[\s\S]*?<\/g><\/g>/)?.[0] ?? "";
  const segs = [...layer.matchAll(/d="M(-?[\d.]+) (-?[\d.]+)L(-?[\d.]+) (-?[\d.]+)"/g)];
  assert.ok(segs.length >= 10, `parsed the streak segments (${segs.length})`);
  for (const m of segs) {
    const [x1, y1, x2, y2] = [m[1], m[2], m[3], m[4]].map(Number) as [
      number, number, number, number,
    ];
    const a = Math.atan2(y2 - y1, x2 - x1);
    const dist = Math.abs(((a - world.winds.dir + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
    assert.ok(dist <= 0.1, `streak within jitter of the wind (off by ${dist.toFixed(3)} rad)`);
  }
});

test("the rainfall legend explains the streaks", () => {
  const world = generateWorld(defaultRecipe(42));
  const svg = renderMap(world, { theme: "moisture", legend: true });
  assert.ok(svg.includes("prevailing wind"), "legend note mentions the prevailing wind");
});
