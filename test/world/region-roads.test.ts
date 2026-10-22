import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import type { UvWindow } from "../../src/terrain/heightfield.ts";
import { worldRoadsDrawn } from "../../scripts/region-detail/feature-match.ts";
import { closeUp } from "../../test-support/region-rivers-fixtures.ts";

const HERO = generateWorld(defaultRecipe(42));
const WON_BAND_3: UvWindow = { u0: 0.671875, v0: 0.609375, u1: 0.796875, v1: 0.734375 };

test("a close-up lays in each world road crossing it: the village Won's band-3 survey (Issue #952)", () => {
  const region = closeUp(HERO, WON_BAND_3);
  const drawn = worldRoadsDrawn(HERO, region, WON_BAND_3);
  const crossing = drawn.flatMap((d, i) => (d === undefined ? [] : [{ road: i, drawn: d }]));
  assert.ok(crossing.length >= 2, `precondition: at least 2 world roads cross Won's window (${crossing.length})`);
  for (const { road, drawn: laid } of crossing)
    assert.ok(laid, `world road ${road} crosses Won's band-3 window and is drawn on it`);
});
