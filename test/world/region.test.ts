import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, windowAround } from "../../src/world/region.ts";
import { createRng } from "../../src/core/rng.ts";
import { createLoreWriter } from "../../src/society/lore.ts";

const world = generateWorld(defaultRecipe(42, { gridW: 160, gridH: 120 }));

test("region world keeps the parent's waterline and terrain", () => {
  const capital = world.settlements.find((s) => s.kind === "capital")!;
  const win = windowAround(world, capital, 0.4);
  const region = generateRegionWorld(world, {
    window: win,
    gridW: 160,
    gridH: 160,
    title: "Test Environs",
  });
  assert.equal(region.seaLevel, world.seaLevel);
  assert.equal(region.winds.dir, world.winds.dir, "the same wind blows over the region");
  assert.equal(region.culture.id, world.culture.id);
  assert.ok(region.region, "region metadata present");

  // capital must survive projection, same name, on land
  const cap = region.settlements.find((s) => s.kind === "capital");
  assert.ok(cap, "capital inside its own environs");
  assert.equal(cap.name, capital.name);
  const i = cap.x + cap.y * region.elev.w;
  assert.ok((region.elev.data[i] as number) > region.seaLevel);
});

test("windowAround clamps to the world", () => {
  const win = windowAround(world, { x: 2, y: 2 }, 0.4);
  assert.ok(win.u0 >= 0 && win.v0 >= 0);
  assert.ok(win.u1 <= 1 && win.v1 <= 1);
  assert.ok(Math.abs(win.u1 - win.u0 - 0.4) < 1e-9);
});

test("settlement notes are deterministic, non-empty prose", () => {
  const writerA = createLoreWriter(world, createRng(5));
  const writerB = createLoreWriter(world, createRng(5));
  for (const s of world.settlements.slice(0, 8)) {
    const a = writerA.settlementNote(s);
    const b = writerB.settlementNote(s);
    assert.equal(a, b);
    assert.ok(a.length > 15, `note too short: "${a}"`);
    assert.ok(a.endsWith("."), "notes are sentences");
    assert.ok(!a.includes("%"), "template slot left unfilled");
  }
});

test("a writer avoids back-to-back template repeats", () => {
  const writer = createLoreWriter(world, createRng(9));
  const harborTowns = world.settlements.filter((s) => s.harbor).slice(0, 6);
  if (harborTowns.length < 3) return;
  const notes = harborTowns.map((s) => writer.settlementNote(s));
  for (let i = 1; i < notes.length; i++) {
    assert.notEqual(notes[i], notes[i - 1], "adjacent notes identical");
  }
});
