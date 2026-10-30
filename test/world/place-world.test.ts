import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderMap } from "../../src/render/map-renderer.ts";
import { recipeFromSvg } from "../../src/render/recipe-meta.ts";
import { decodeRings } from "../../src/terrain/outline-codec.ts";
import { outlineSegments, signedDistance } from "../../src/terrain/outline-distance.ts";
import { setPlaceSource } from "../../src/terrain/outline-store.ts";
import { buildHeightfield, type MapType } from "../../src/terrain/heightfield.ts";
import { landMask, pickSeaLevel } from "../../src/terrain/sealevel.ts";
import { defaultRecipe, generateWorld, landShareOf } from "../../src/world/generate.ts";
import { placeId, type OutlineId } from "../../src/world/outline-ids.ts";
import { PLACE_TABLE, useCommittedPlaces } from "../../test-support/outline-places.ts";

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
    const inside = insideMask(id);
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

function insideMask(id: OutlineId): Uint8Array {
  const segs = outlineSegments(id, (W - 1) / (H - 1));
  const inside = new Uint8Array(W * H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) inside[x + y * W] = signedDistance(segs, x / (W - 1), y / (H - 1)) < 0 ? 1 : 0;
  return inside;
}

function borderLand(land: Uint8Array): number {
  let border = 0;
  for (let x = 0; x < W; x++) border += land[x]! + land[x + (H - 1) * W]!;
  for (let y = 1; y < H - 1; y++) border += land[y * W]! + land[W - 1 + y * W]!;
  return border;
}

function shareOfSheet(text: string): number {
  let total = 0;
  for (const ring of decodeRings(text)) {
    let twice = 0;
    for (let i = 0; i < ring.length; i += 2) {
      const j = (i + 2) % ring.length;
      twice += ring[i]! * ring[j + 1]! - ring[j]! * ring[i + 1]!;
    }
    total += Math.abs(twice) / 2;
  }
  return total / 1e6;
}

test("the three places that fill the sheet most keep the sea on all four borders at every map type, looseness, coast and land fraction (Issue #853)", () => {
  useCommittedPlaces();
  const table = JSON.parse(readFileSync(PLACE_TABLE, "utf8")) as Record<string, string>;
  const ranked = Object.entries(table)
    .map(([id, text]) => ({ id, share: shareOfSheet(text) }))
    .sort((a, b) => b.share - a.share || (a.id < b.id ? -1 : 1));
  const top = ranked.slice(0, 3).map((r) => r.id);
  assert.deepEqual(top, ["ne-1159315343", "ne-1159315351", "ne-1159310489"]);
  // 2026-10-29, Issue #853: seeds 1 to 3 over these three left every border sea (360 cases); the falloff spreads furthest past the inset where an outline runs along the box, so the places that fill it most are the sample.
  const seed = 2;
  const types: MapType[] = ["island", "archipelago", "continent", "citystate"];
  const settings = [
    [0, 1],
    [0.5, 0],
    [0.5, 1],
    [1, 0],
    [1, 1],
  ] as const;
  const cases = top.flatMap((name) =>
    types.flatMap((mapType) =>
      settings.flatMap(([looseness, coastWarp]) =>
        [0.1, 0.7].map((landFraction) => ({ name, mapType, looseness, coastWarp, landFraction })),
      ),
    ),
  );
  let elev: ReturnType<typeof buildHeightfield> | null = null;
  let held = "";
  for (const { name, mapType, looseness, coastWarp, landFraction } of cases) {
    const outline = placeId(name);
    const extra = looseness > 0 ? { looseness } : {};
    const key = `${name}|${mapType}|${looseness}|${coastWarp}`;
    if (key !== held) {
      elev = buildHeightfield({ seed, gridW: W, gridH: H, mapType, outline, coastWarp, ...extra });
      held = key;
    }
    const recipe = defaultRecipe(seed, { mapType, outline, coastWarp, landFraction, ...extra });
    const border = borderLand(landMask(elev!, pickSeaLevel(elev!, landShareOf(recipe))));
    assert.equal(
      border,
      0,
      `${name} ${mapType} looseness ${looseness} coast ${coastWarp} land ${landFraction}: ${border} border land cells`,
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
