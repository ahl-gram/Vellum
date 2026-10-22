import { test } from "node:test";
import assert from "node:assert/strict";
import { glyphDensity } from "../../src/render/layers/glyphs.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, windowAround } from "../../src/world/region.ts";

const sized = (size: number) => ({ u0: 0.25, v0: 0.25, u1: 0.25 + size, v1: 0.25 + size });
const BAND_3_ZOOM = Math.sqrt(319 / (0.125 * 319));

test("past band 3's window a close-up keeps band 3's mark spacing and grows its caps with its area", () => {
  assert.deepEqual(glyphDensity(320, { window: sized(1 / 32), worldGridW: 320 }), {
    zoom: BAND_3_ZOOM,
    capScale: 4,
  });
  assert.deepEqual(glyphDensity(320, { window: sized(1 / 16), worldGridW: 320 }), { zoom: BAND_3_ZOOM, capScale: 2 });
});

test("band 3's window, the atlas plate and a world sheet draw as before", () => {
  assert.deepEqual(glyphDensity(320, { window: sized(0.125), worldGridW: 320 }), { zoom: BAND_3_ZOOM, capScale: 1 });
  const world = generateWorld(defaultRecipe(42));
  const capital = world.settlements.find((s) => s.kind === "capital")!;
  const plate = windowAround(world, capital, 0.38);
  assert.deepEqual(glyphDensity(320, { window: plate, worldGridW: 320 }), {
    zoom: Math.sqrt(319 / ((plate.u1 - plate.u0) * 319)),
    capScale: 1,
  });
  assert.deepEqual(glyphDensity(320, undefined), { zoom: 1, capScale: 1 });
});

test("chart 15's band-5 border sheet packs its mountains at band 3's spacing", () => {
  const world = generateWorld(defaultRecipe(15));
  const window = { u0: 0.5, v0: 0.58984375, u1: 0.53125, v1: 0.62109375 };
  const region = generateRegionWorld(world, { window, gridW: 320, gridH: 240, title: "t", detail: true });
  const svg = renderMap(region, { widthPx: 1500, legend: true });
  const start = svg.indexOf('id="layer-glyphs"');
  assert.notEqual(start, -1, "the sheet draws a glyph layer");
  const layer = svg.slice(start, svg.indexOf("</g>", start));
  const mountains = [...layer.matchAll(/<use href="#gl-mtn-\d"[^>]*transform="translate\(([\d.-]+) ([\d.-]+)\)/g)].map(
    (m) => [Number(m[1]), Number(m[2])] as const,
  );
  assert.ok(mountains.length > 1, `only ${mountains.length} mountain marks`);
  let nearest = Infinity;
  for (let a = 0; a < mountains.length; a++) {
    for (let b = a + 1; b < mountains.length; b++) {
      const d = Math.hypot(mountains[a]![0] - mountains[b]![0], mountains[a]![1] - mountains[b]![1]);
      if (d < nearest) nearest = d;
    }
  }
  assert.ok(
    nearest < 15 * Math.sqrt(32) - 1,
    `the nearest mountain pair stands ${nearest.toFixed(1)} px apart, no closer than band 5's own spacing`,
  );
});
