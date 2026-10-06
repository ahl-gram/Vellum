import { test } from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import type { World } from "../../src/world/types.ts";
import { STYLES } from "../../src/render/style.ts";
import { renderSvg } from "../../src/render/svg.ts";
import { buildProspectInput } from "../../src/prospect/input.ts";
import { plateSurroundings } from "../../src/prospect/surroundings.ts";
import { engravePlate } from "../../src/prospect/finished.ts";
import { horizonTowns, INNER } from "../../src/prospect/dress/furniture.ts";
import { skylineOf, type Box } from "../../src/prospect/dress/rise.ts";
import { engraver } from "../../src/prospect/dress/burin.ts";
import { createLettering } from "../../src/prospect/letter/letter.ts";
import type { Surroundings } from "../../src/prospect/surroundings.ts";

// No byte pins here: world-sourced geometry descends from Math.hypot (the compose-world.test.ts caveat); these are layout claims, read from the boxes the plate reports.
const worlds = new Map<number, World>();
function worldFor(seed: number): World {
  const cached = worlds.get(seed);
  if (cached) return cached;
  const w = generateWorld(defaultRecipe(seed));
  worlds.set(seed, w);
  return w;
}

const surroundingsOf = (seed: number, index: number, year?: number): Surroundings => plateSurroundings(worldFor(seed), index, year ?? worldFor(seed).title.year);
const engrave = (seed: number, index: number, year?: number) => {
  const w = worldFor(seed);
  return engravePlate(buildProspectInput(w, index), STYLES.antique, year ?? w.title.year, { surroundings: surroundingsOf(seed, index, year) });
};

const RULED: ReadonlyArray<readonly [number, number, number?]> = [[42, 0], [42, 4], [42, 10], [42, 22], [26, 22], [33, 20], [7, 6], [42, 0, 400]];
const SWEEP = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const overlaps = (a: Box, b: Box): boolean => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
const inside = (b: Box): boolean => b.x0 >= INNER.x0 && b.x1 <= INNER.x1 && b.y0 >= INNER.y0 && b.y1 <= INNER.y1;

function everyPlate(visit: (label: string, plate: ReturnType<typeof engrave>, surroundings: Surroundings) => void): void {
  for (const [seed, index, year] of RULED) visit(`seed ${seed} index ${index}${year === undefined ? "" : ` at An. ${year}`}`, engrave(seed, index, year), surroundingsOf(seed, index, year));
  for (const seed of SWEEP) worldFor(seed).settlements.forEach((_, i) => visit(`seed ${seed} index ${i}`, engrave(seed, i), surroundingsOf(seed, i)));
}

test("every piece of furniture, every lettered run and every bird stays inside the inner frame, every bird flies in open sky clear of the town, the masts and the hills, and no run is left as device text", () => {
  let plates = 0;
  everyPlate((label, plate) => {
    plates++;
    for (const [group, boxes] of Object.entries(plate.furniture)) {
      for (const b of boxes) assert.ok(inside(b), `${label}: the ${group} reaches past the inner frame: ${JSON.stringify(b)}`);
    }
    const v = plate.picture.vignette;
    for (const b of v.birds) {
      assert.ok(inside(b), `${label}: a flock at ${JSON.stringify(b)} straddles the frame`);
      for (const [group, boxes] of Object.entries(plate.furniture)) assert.ok(!boxes.some((f) => overlaps(b, f)), `${label}: a bird crosses the ${group}`);
      for (const t of [...v.town, ...v.masts]) assert.ok(!overlaps(b, t), `${label}: a flock at ${JSON.stringify(b)} crosses the town or a mast at ${JSON.stringify(t)}`);
      for (let x = b.x0; x <= b.x1; x += 1) assert.ok(b.y1 < v.hillTopAt(x), `${label}: a flock at ${JSON.stringify(b)} flies into the hills at x ${x.toFixed(1)}`);
    }
    assert.ok(!/<text\b/.test(renderSvg(plate.node)), `${label}: a run left as device text`);
  });
  assert.ok(plates > 300, `premise: the sweep engraves the ruled places and whole worlds (${plates})`);
});

test("a horizon town's name and number clear every mast and the ridge line under them (the round's \"3 Poalo\" and \"6 Haireno\")", () => {
  let labels = 0;
  everyPlate((label, plate, surroundings) => {
    const v = plate.picture.vignette;
    const unflown = horizonTowns(engraver(STYLES.antique), createLettering("t"), plate.era === "before-founding" ? [] : surroundings.roadTowns, plate.key, { ...skylineOf(plate.g), birds: [] });
    assert.deepEqual(plate.furniture.towns, unflown.boxes, `${label}: a horizon name stands where the hills and the masts put it; the birds give way to it, never it to them`);
    for (const b of plate.furniture.towns) {
      labels++;
      for (const m of v.masts) assert.ok(!overlaps(b, m), `${label}: a horizon label ${JSON.stringify(b)} crosses a mast ${JSON.stringify(m)}`);
      for (let x = b.x0; x <= b.x1; x += 1) assert.ok(b.y1 < v.horizonYAt(x), `${label}: the ridge runs through a horizon label at x ${x.toFixed(1)}`);
    }
  });
  const capital = engrave(42, 0);
  assert.ok(capital.furniture.towns.length >= 4 && capital.picture.vignette.masts.length > 0, "premise: the capital names its horizon towns among its masts, the witness");
  assert.ok(labels > 50, `premise: the sweep reads horizon labels (${labels})`);
});

test("the named sea beast surfaces in the open bay, clear of the people and the near ship (ruling D4)", () => {
  let surfaced = 0;
  for (const seed of [7, 8, 10, 12, 15]) {
    const w = worldFor(seed);
    w.settlements.forEach((_, i) => {
      if (plateSurroundings(w, i, w.title.year).beast === null) return;
      const pic = engrave(seed, i).picture;
      assert.ok(pic.beast !== null, `seed ${seed} index ${i}: a harbour with a beast in its bay surfaces it`);
      surfaced++;
      for (const f of pic.figures) assert.ok(!overlaps(pic.beast, f), `seed ${seed} index ${i}: the beast crosses a figure`);
      if (pic.ship !== null) assert.ok(!overlaps(pic.beast, pic.ship), `seed ${seed} index ${i}: the beast crosses the near ship`);
      assert.ok(pic.beast.x0 >= INNER.x0 && pic.beast.x1 <= INNER.x1, `seed ${seed} index ${i}: the beast stays on the plate`);
    });
  }
  assert.ok(surfaced >= 4, `premise: the sweep meets beasts in their bays (${surfaced})`);
  assert.equal(engrave(42, 0).picture.beast, null, "the capital's bay has none");
});
