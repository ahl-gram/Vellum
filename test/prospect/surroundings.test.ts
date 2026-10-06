import { test } from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import type { World } from "../../src/world/types.ts";
import { buildProspectInput } from "../../src/prospect/input.ts";
import { viewRight } from "../../src/prospect/transect.ts";
import { plateSurroundings } from "../../src/prospect/surroundings.ts";

const worlds = new Map<number, World>();
function worldFor(seed: number): World {
  const cached = worlds.get(seed);
  if (cached) return cached;
  const w = generateWorld(defaultRecipe(seed));
  worlds.set(seed, w);
  return w;
}

/** The test's own walk: along each road's polyline from the town's cell, stopping at the first settlement met, so a town found here is one a road reaches without passing another. */
function reachedFirst(world: World, index: number): Set<number> {
  const w = world.elev.w;
  const next = new Map<number, number[]>();
  const link = (a: number, b: number): void => {
    next.set(a, [...(next.get(a) ?? []), b]);
    next.set(b, [...(next.get(b) ?? []), a]);
  };
  for (const r of world.roads) for (let i = 1; i < r.points.length; i++) link(r.points[i - 1]!.x + r.points[i - 1]!.y * w, r.points[i]!.x + r.points[i]!.y * w);
  const town = new Map(world.settlements.map((s, i) => [s.x + s.y * w, i] as const));
  const s0 = world.settlements[index]!;
  const seen = new Set([s0.x + s0.y * w]);
  const queue = [s0.x + s0.y * w];
  const found = new Set<number>();
  while (queue.length > 0) {
    const c = queue.shift()!;
    for (const n of next.get(c) ?? []) {
      if (seen.has(n)) continue;
      seen.add(n);
      const t = town.get(n);
      if (t !== undefined && t !== index) found.add(t);
      else queue.push(n);
    }
  }
  return found;
}

const ruinedBy = (world: World, i: number, year: number): boolean =>
  world.history.events.some((e) => e.kind === "ruin" && e.settlement === i && e.year <= year);

test("a road town is one the roads reach without passing another town, standing in the plate's view, the nearest two", () => {
  let named = 0;
  for (const seed of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
    const world = worldFor(seed);
    const year = world.title.year;
    world.settlements.forEach((s, i) => {
      const view = buildProspectInput(world, i).view;
      const right = viewRight(view);
      const reached = reachedFirst(world, i);
      const towns = plateSurroundings(world, i, year).roadTowns;
      assert.ok(towns.length <= 2, `seed ${seed} index ${i}: at most two`);
      let last = -1;
      for (const t of towns) {
        const n = world.settlements[t.index]!;
        const ox = n.x - s.x, oy = n.y - s.y;
        const dist = Math.sqrt(ox * ox + oy * oy);
        assert.ok(reached.has(t.index), `seed ${seed} index ${i}: "The road to ${n.name}" names a town no road reaches first`);
        assert.ok(dist <= 40 && ox * view.dx + oy * view.dy > 2 && Math.abs((ox * right.dx + oy * right.dy) / 40) <= 1, `seed ${seed} index ${i}: ${n.name} stands in the view`);
        assert.ok(n.founded <= year && !ruinedBy(world, t.index, year), `seed ${seed} index ${i}: ${n.name} stands at the year`);
        assert.ok(dist >= last, "nearest first");
        last = dist;
        named++;
      }
    });
  }
  assert.ok(named > 100, `premise: the sweep names road towns (${named})`);
});

test("the round's ruled places name the towns their stills name", () => {
  const w42 = worldFor(42);
  const names = (w: World, i: number, year = w.title.year): string[] => plateSurroundings(w, i, year).roadTowns.map((t) => w.settlements[t.index]!.name);
  assert.deepEqual(names(w42, 0), ["Haireno", "Nanawotani"], "the capital");
  assert.deepEqual(names(w42, 4), ["Poalo"], "Nailo");
  assert.deepEqual(names(w42, 10), [], "Lokai");
  assert.deepEqual(names(w42, 22), [], "Homaitani");
  assert.deepEqual(names(worldFor(26), 22), [], "Voorea");
  assert.deepEqual(names(w42, 0, 400), [], "before its founding a place has no road");
});

test("the river under the town, the range behind it, the roads out and the beast in the bay are the world's", () => {
  const w42 = worldFor(42);
  const at = (w: World, i: number) => plateSurroundings(w, i, w.title.year);
  assert.equal(at(w42, 0).riverName, "The Waters of Lalo");
  assert.equal(at(w42, 10).riverName, "River Naikai");
  assert.equal(at(w42, 22).riverName, null, "Homaitani is on no river");
  assert.equal(at(worldFor(26), 22).rangeName, "The Spires of Nini", "Voorea's range stands behind it");
  assert.equal(at(w42, 0).rangeName, null, "the capital's range is not in its view");
  assert.deepEqual([0, 4, 10, 22].map((i) => at(w42, i).roadCount), [3, 2, 1, 1], "roads ending within a cell of the place");
  assert.equal(at(worldFor(26), 22).roadCount, 2);
  assert.equal(at(w42, 0).seaName, w42.names.sea);
  assert.equal(at(w42, 0).beast, null);
  const wailua = at(worldFor(7), 6).beast;
  assert.ok(wailua !== null && wailua.name === "Kaipu" && wailua.epithet === "the Weed That Wakes", JSON.stringify(wailua));
});
