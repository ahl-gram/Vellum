import { test } from "node:test";
import assert from "node:assert/strict";
import { createField } from "../../src/core/grid.ts";
import { computeWindMoisture } from "../../src/climate/moisture-wind.ts";
import { computeClimate } from "../../src/climate/climate.ts";

// #74: moisture rides the prevailing wind — recharged over sea, rained out
// over land, rained out harder where the wind climbs. Windward coasts and
// faces read wet; leeward interiors sit in rain shadow. Every fixture puts
// sea on the EAST and blows the wind WESTWARD (dir = PI points toward -x,
// the same convention the nautical arrows draw), so east is upwind.

const W = 80;
const H = 40;
const WEST_WIND = Math.PI;

// island with a north-south tent ridge: sea east of x=62, ridge peak at x=40
function ridgeIsland() {
  return createField(W, H, (x, y) => {
    if (x === 0 || y === 0 || x === W - 1 || y === H - 1) return -1;
    if (x >= 62) return -1;
    const ridge = Math.max(0, 1 - Math.abs(x - 40) / 10);
    return 0.12 + 0.78 * ridge;
  });
}

function stripMean(
  field: ArrayLike<number>,
  w: number,
  h: number,
  x0: number,
  x1: number,
): number {
  let sum = 0;
  let n = 0;
  for (let y = 8; y < h - 8; y++) {
    for (let x = x0; x <= x1; x++) {
      sum += field[x + y * w] as number;
      n++;
    }
  }
  return sum / n;
}

test("the windward coast is wetter than the leeward coast", () => {
  const wind = computeWindMoisture(ridgeIsland(), 0, WEST_WIND);
  const windward = stripMean(wind, W, H, 52, 60); // flat plain by the eastern sea
  const leeward = stripMean(wind, W, H, 2, 10); // flat plain past the ridge
  assert.ok(
    windward > leeward + 0.15,
    `windward coast ${windward.toFixed(3)} should be much wetter than leeward ${leeward.toFixed(3)}`,
  );
});

test("the windward ridge face is wetter than the leeward face", () => {
  const wind = computeWindMoisture(ridgeIsland(), 0, WEST_WIND);
  const windwardFace = stripMean(wind, W, H, 41, 49); // wind climbs here
  const leewardFace = stripMean(wind, W, H, 31, 39); // rain shadow
  assert.ok(
    windwardFace > leewardFace + 0.15,
    `windward face ${windwardFace.toFixed(3)} should be much wetter than leeward ${leewardFace.toFixed(3)}`,
  );
});

test("off-grid upwind reads as open sea, not desert", () => {
  // no sea anywhere on the grid: the only moisture source is the off-grid
  // horizon, so edge-touching continent land must not read bone-dry (#74
  // acceptance for continent / citystate maps)
  const allLand = createField(60, 40, () => 0.12);
  const wind = computeWindMoisture(allLand, 0, WEST_WIND);
  const upwindEdge = stripMean(wind, 60, 40, 54, 58);
  const interior = stripMean(wind, 60, 40, 25, 35);
  assert.ok(
    upwindEdge > interior + 0.1,
    `upwind edge ${upwindEdge.toFixed(3)} should read maritime vs interior ${interior.toFixed(3)}`,
  );
});

test("a windowed crop continues its border terrain, no phantom upwind ocean", () => {
  // a regional crop cut from a continent interior never borders the world's
  // forced-water edge; with offGridSea=false the fetch clamps to the border
  // cell instead of inventing a maritime band along the crop's upwind side
  const allLand = createField(60, 40, () => 0.12);
  const wind = computeWindMoisture(allLand, 0, WEST_WIND, false);
  const upwindEdge = stripMean(wind, 60, 40, 54, 58);
  const interior = stripMean(wind, 60, 40, 25, 35);
  assert.ok(
    Math.abs(upwindEdge - interior) < 0.05,
    `clamped edge ${upwindEdge.toFixed(3)} should match interior ${interior.toFixed(3)}`,
  );
});

test("a north-blowing wind wets the north-facing side (vertical component)", () => {
  // pins the sign of the vertical wind component: nothing else in the suite
  // exercises uy, so a flipped sign would only surface as re-pinnable golden
  // noise. Sea to the NORTH, an east-west tent ridge, wind blowing SOUTH
  // (dir = PI/2 points +y): the north coast and north face must be the wet side.
  const w = 40;
  const h = 80;
  const f = createField(w, h, (x, y) => {
    if (x === 0 || y === 0 || x === w - 1 || y === h - 1) return -1;
    if (y <= 17) return -1; // sea on the north
    const ridge = Math.max(0, 1 - Math.abs(y - 40) / 10);
    return 0.12 + 0.78 * ridge;
  });
  const SOUTH_WIND = Math.PI / 2; // air arrives from the northern sea
  const wind = computeWindMoisture(f, 0, SOUTH_WIND);
  const rowMean = (y0: number, y1: number): number => {
    let sum = 0;
    let n = 0;
    for (let y = y0; y <= y1; y++) {
      for (let x = 8; x < w - 8; x++) {
        sum += wind[x + y * w] as number;
        n++;
      }
    }
    return sum / n;
  };
  const windwardCoast = rowMean(19, 27); // plain by the northern sea
  const leewardInterior = rowMean(60, 70); // past the ridge
  assert.ok(
    windwardCoast > leewardInterior + 0.15,
    `north coast ${windwardCoast.toFixed(3)} should be much wetter than the south interior ${leewardInterior.toFixed(3)}`,
  );
  const windwardFace = rowMean(31, 39); // wind climbs the north face
  const leewardFace = rowMean(41, 49);
  assert.ok(
    windwardFace > leewardFace + 0.15,
    `north face ${windwardFace.toFixed(3)} should be much wetter than the south face ${leewardFace.toFixed(3)}`,
  );
});

test("wind moisture is deterministic and stays in [0, 1]", () => {
  const f = ridgeIsland();
  const a = computeWindMoisture(f, 0, 1.234);
  const b = computeWindMoisture(f, 0, 1.234);
  assert.deepEqual(a, b);
  for (const v of a) assert.ok(v >= 0 && v <= 1, `out of range: ${v}`);
});

test("the blended climate moisture keeps the wind signal", () => {
  const { moisture } = computeClimate(ridgeIsland(), 0, 7, {
    windDir: WEST_WIND,
  });
  const windwardCoast = stripMean(moisture.data, W, H, 52, 60);
  const leewardCoast = stripMean(moisture.data, W, H, 2, 10);
  assert.ok(
    windwardCoast > leewardCoast + 0.08,
    `windward coast ${windwardCoast.toFixed(3)} vs leeward ${leewardCoast.toFixed(3)}`,
  );
  const windwardFace = stripMean(moisture.data, W, H, 41, 49);
  const leewardFace = stripMean(moisture.data, W, H, 31, 39);
  assert.ok(
    windwardFace > leewardFace + 0.06,
    `windward face ${windwardFace.toFixed(3)} vs leeward ${leewardFace.toFixed(3)}`,
  );
});
