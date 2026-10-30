import { test } from "node:test";
import assert from "node:assert/strict";
import { renderMap } from "../../src/render/map-renderer.ts";
import { recipeFromSvg } from "../../src/render/recipe-meta.ts";
import { setPlaceSource } from "../../src/terrain/outline-store.ts";
import { buildHeightfield, type MapType } from "../../src/terrain/heightfield.ts";
import { landMask, pickSeaLevel } from "../../src/terrain/sealevel.ts";
import { defaultRecipe, generateWorld, landShareOf } from "../../src/world/generate.ts";
import { placeId } from "../../src/world/outline-ids.ts";
import { borderLandCells } from "../../test-support/border-land.ts";
import { insideMask } from "../../test-support/outline-mask.ts";
import { useCommittedPlaces } from "../../test-support/outline-places.ts";

const W = 320;
const H = 240;
const TEXAS = "ne-1159315211";

test("a place whose rings are not loaded is refused by name, never drawn as a stand-in (Issue #853)", () => {
  const texas = { seed: 2, gridW: 80, gridH: 60, mapType: "island", outline: placeId(TEXAS) } as const;
  const refused = { name: "RangeError", message: `outline ${TEXAS} is not loaded` };
  setPlaceSource(null);
  assert.throws(() => buildHeightfield(texas), refused);
  setPlaceSource(() => undefined);
  assert.throws(() => buildHeightfield(texas), refused);
  assert.throws(() => generateWorld(defaultRecipe(2, { gridW: 80, gridH: 60, outline: placeId(TEXAS) })), refused);
  setPlaceSource(null);
  assert.doesNotThrow(() => buildHeightfield({ seed: 2, gridW: 80, gridH: 60, mapType: "island", outline: "round" }));
  useCommittedPlaces();
  assert.doesNotThrow(() => buildHeightfield(texas));
  setPlaceSource(null);
  assert.throws(() => buildHeightfield(texas), refused);
});

// Measured on 2026-10-29 at a6c1990b (Issue #853): the cells inside each place on the 320 by 240 grid, the witness that the place's own rings are drawn.
const INSIDE = { "ne-1159315211": 21332, "ne-1159320937": 3650, "ne-1159321109": 2614 } as const;

test("at looseness 0 a real place is exactly its outline on the world sheet, cell for cell (Issue #853)", () => {
  useCommittedPlaces();
  for (const [name, count] of Object.entries(INSIDE)) {
    const id = placeId(name);
    const inside = insideMask(id, W, H);
    assert.equal(
      inside.reduce((a, b) => a + b, 0),
      count,
      `${name}: the cells inside`,
    );
    for (const [mapType, seed] of [
      ["island", 1],
      ["island", 2],
      ["continent", 1],
      ["continent", 2],
    ] as const) {
      const elev = buildHeightfield({ seed, gridW: W, gridH: H, mapType, outline: id });
      const land = landMask(elev, pickSeaLevel(elev, landShareOf(defaultRecipe(seed, { mapType, outline: id }))));
      const differ = land.reduce((n, cell, i) => n + (cell !== inside[i] ? 1 : 0), 0);
      assert.equal(differ, 0, `${name} on ${mapType}, seed ${seed}: ${differ} cells differ from the outline`);
    }
  }
});

// 2026-10-30, Issue #853: every place at seeds 1 to 6 (every map type, coast and looseness), then the 567 nearest past the soft end and the 303 nearest before it at seeds 1 to 100 (coast 0.55 to 1), found these charts nearest the border: Wyoming and Colorado at the soft end, 0.053 under the waterline, and Baker Island past it, 0.123 under at looseness 0.7; with the edge sink left at 0.8 past the soft end, Baker Island put land on it from looseness 0.74 and Canandaigua Lake at 1, the witnesses.
const NEAREST = [
  ["ne-1159315351", 48],
  ["ne-1159315343", 34],
  ["ne-1159316561", 48],
  ["ne-1159107347", 2],
] as const;

test("the charts that come nearest the sheet's edge keep the sea on all four borders at every map type and land fraction, from the soft end to full looseness, at the coast slider's top (Issue #853)", () => {
  useCommittedPlaces();
  const coastWarp = 1;
  const types: MapType[] = ["island", "archipelago", "continent", "citystate"];
  const cases = NEAREST.flatMap(([name, seed]) =>
    types.flatMap((mapType) =>
      [2 / 3, 0.7, 0.75, 1].flatMap((looseness) =>
        [0.1, 0.7].map((landFraction) => ({ name, seed, mapType, looseness, landFraction })),
      ),
    ),
  );
  let elev: ReturnType<typeof buildHeightfield> | null = null;
  let held = "";
  for (const { name, seed, mapType, looseness, landFraction } of cases) {
    const outline = placeId(name);
    const key = `${name}|${seed}|${mapType}|${looseness}`;
    if (key !== held) {
      elev = buildHeightfield({ seed, gridW: W, gridH: H, mapType, outline, coastWarp, looseness });
      held = key;
    }
    const recipe = defaultRecipe(seed, { mapType, outline, coastWarp, landFraction, looseness });
    const border = borderLandCells(landMask(elev!, pickSeaLevel(elev!, landShareOf(recipe))), W, H);
    assert.equal(
      border,
      0,
      `${name} seed ${seed} ${mapType} looseness ${looseness} coast ${coastWarp} land ${landFraction}: ${border} border land cells`,
    );
  }
});

test("a chart outlined by a real place stamps its ID, and the stamp redraws it byte for byte (Issue #853)", () => {
  useCommittedPlaces();
  const world = generateWorld(defaultRecipe(7, { outline: placeId(TEXAS) }));
  const svg = renderMap(world, { style: "antique" });
  assert.match(svg, /data-vellum-outline="ne-1159315211"/);
  assert.match(svg, /outline=ne-1159315211/);
  const parsed = recipeFromSvg(svg);
  assert.ok(parsed);
  assert.deepEqual(parsed.recipe, world.recipe);
  assert.equal(renderMap(generateWorld(parsed.recipe), { style: parsed.style }), svg);
});
