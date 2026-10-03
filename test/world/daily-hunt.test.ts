import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import {
  buildClues,
  chooseQuarry,
  classifyClick,
  classifyDistanceBand,
  legendExcluded,
  revealLore,
  type LegendBox,
  type Quarry,
} from "../../src/world/daily-hunt.ts";
import { createProjection } from "../../src/render/transform.ts";
import { buildClueFacts } from "../../src/world/daily-hunt-clue-facts.ts";
import type { World } from "../../src/world/types.ts";
import {
  expectedLeadAxis,
  mustQuarry,
  villagePoolSize,
} from "../../test-support/daily-hunt-geometry.ts";
import { DAILY_SEEDS, DAILY, SWEEP, SWEEP_SVGS, gatesFor } from "../../test-support/daily-hunt-sweep.ts";

test("chooseQuarry is deterministic across independent constructions of a seed", () => {
  const seed = DAILY_SEEDS[0]!;
  const a = chooseQuarry(DAILY[0]!);
  const b = chooseQuarry(generateWorld(defaultRecipe(seed)));
  assert.ok(a && b);
  assert.equal(a.idx, b.idx, "same seed, freshly generated, yields the same target");
  assert.equal(chooseQuarry(DAILY[0]!)!.idx, a.idx);
});

test("the quarry is a real, non-seat village (the broad uniform-glyph pool)", () => {
  for (const world of SWEEP) {
    const q = mustQuarry(world);
    assert.ok(q.idx >= 0 && q.idx < world.settlements.length, "valid settlement index");
    assert.equal(world.settlements[q.idx], q.settlement, "idx and settlement agree");
    assert.equal(q.settlement.kind, "village", "drawn from the village pool");
    assert.ok(!world.realms.seats.includes(q.idx), "never a realm seat");
  }
});

test("chooseQuarry picks are pinned: the #335 pool refactor changed nothing", () => {
  assert.equal(chooseQuarry(DAILY[0]!)!.idx, 11);
  assert.equal(DAILY[0]!.settlements[11]!.name, "Sharakhara");
  assert.equal(chooseQuarry(DAILY[14]!)!.idx, 19);
  assert.equal(DAILY[14]!.settlements[19]!.name, "Lurgry");
});

test("a quarry near (not exactly at) the chart's center reads central, not west/south", () => {
  // Probed through buildClueFacts' compass candidates, which always exist even though selection emits only one compass line.
  const w = 320;
  const h = 240;
  const world = {
    elev: { w, h, data: new Float64Array(w * h) },
    seaLevel: -1,
    biomes: new Uint8Array(w * h),
    rivers: [],
    roads: [],
    settlements: [],
    realms: { labels: new Int16Array(w * h), seats: [] },
    names: { rivers: new Map(), lakes: [], realms: [] },
  } as unknown as World;
  const at = (x: number, y: number): Quarry => ({
    idx: 0,
    settlement: {
      x,
      y,
      kind: "village",
      harbor: false,
      onRiver: false,
      score: 0,
      name: "Midmark",
      founded: 500,
      ruined: false,
    },
  });
  const subjects = (x: number, y: number) => {
    const compass = buildClueFacts(world, at(x, y)).compass;
    return {
      ew: compass.find((c) => c.clue.kind === "ew")!.clue.subject,
      ns: compass.find((c) => c.clue.kind === "ns")!.clue.subject,
    };
  };

  // Slightly west and south of the midpoint (159.5, 119.5): inside the band.
  assert.deepEqual(subjects(150, 125), { ew: "central", ns: "central" });
  // At the band edges (|dx| <= 319/8, |dy| <= 239/8): still central.
  assert.deepEqual(subjects(120, 90), { ew: "central", ns: "central" });
  assert.deepEqual(subjects(118, 88), { ew: "west", ns: "north" });
  assert.deepEqual(subjects(201, 152), { ew: "east", ns: "south" });
});

test("the survey leads with the axis the quarry is furthest off-center on", () => {
  // Live play, seed 20260908 (Issue #539): Diggai at grid (208, 28) on 320x240 read "the eastern reach" while sitting 0.15 of the width east of center and 0.38 of the height north of it.
  const world = generateWorld(defaultRecipe(20260908));
  const q = mustQuarry(world);
  assert.equal(q.settlement.name, "Diggai", "the reported quarry");
  const clues = buildClues(world, q);
  assert.equal(clues[1]!.kind, "ns", "the survey's first bearing is north/south");
  assert.equal(clues[1]!.subject, "north");
});

function flatWorld(w: number, h: number): World {
  return {
    recipe: { seed: 20260908 },
    elev: { w, h, data: new Float64Array(w * h) },
    seaLevel: -1,
    biomes: new Uint8Array(w * h),
    rivers: [],
    roads: [],
    settlements: [],
    realms: { labels: new Int16Array(w * h), seats: [] },
    names: { rivers: new Map(), lakes: [], realms: [] },
  } as unknown as World;
}

function villageAt(x: number, y: number): Quarry {
  return {
    idx: 0,
    settlement: {
      x,
      y,
      kind: "village",
      harbor: false,
      onRiver: false,
      score: 0,
      name: "Midmark",
      founded: 500,
      ruined: false,
    },
  };
}

test("the leading compass line is never the strictly less decisive axis (#333's class)", () => {
  const flat = flatWorld(320, 240);
  const leadFor = (x: number, y: number): string =>
    buildClues(flat, villageAt(x, y)).filter((c) => c.kind === "ew" || c.kind === "ns")[0]!.kind;

  assert.equal(leadFor(208, 28), "ns", "0.15 east against 0.38 north: north leads");
  assert.equal(leadFor(300, 100), "ew", "0.44 east against 0.08 south: east leads");
  assert.equal(leadFor(159, 10), "ns", "central east/west against far north");
  assert.equal(leadFor(10, 119), "ew", "far west against central north/south");

  // x=120 is 39.5 cells off a 319-wide axis (0.1238, central) and y=89 is 30.5 off a 239-tall one (0.1276, north): compared in raw cells the central axis would win.
  assert.equal(leadFor(120, 89), "ns", "a directional band never loses to a central one");

  assert.equal(expectedLeadAxis(flat, 0, 0), null, "a corner ties the two axes exactly");
  const tied = leadFor(0, 0);
  assert.ok(tied === "ew" || tied === "ns", "a tie still yields one compass bearing");
  assert.equal(tied, leadFor(0, 0), "and the coin that breaks it is seeded, not arbitrary");

  SWEEP.forEach((world, wi) => {
    const q = mustQuarry(world);
    const gates = gatesFor(world, q, SWEEP_SVGS[wi]!);
    const lead = buildClues(world, q, gates).filter(
      (c) => c.kind === "ew" || c.kind === "ns",
    )[0]!;
    const want = expectedLeadAxis(world, q.settlement.x, q.settlement.y);
    if (want !== null) {
      assert.equal(lead.kind, want, `seed ${world.recipe.seed} leads with the decisive axis`);
    }
  });
});

test("days the decisive axis already led are untouched: the coin is still drawn", () => {
  // Measured against the pre-fix build (64-seed replay, 2026-09-07): these three days did not move.
  const sig = (world: World): string =>
    buildClues(world, mustQuarry(world))
      .slice(1)
      .map((c) => `${c.kind}:${c.subject ?? ""}`)
      .join(" | ");

  assert.equal(sig(DAILY[0]!), "ew:east | onriver: | near:Sahi | road:track | terrain:forest");
  assert.equal(sig(DAILY[3]!), "ew:west | near:Nepai | road:track | realm:Greater Hoaro");
  assert.equal(
    sig(DAILY[5]!),
    "ns:south | near:Tseyama | road:track | realm:The Shogunate of Gaicha | terrain:forest",
  );
});

test("classifyDistanceBand is monotonic and a direct hit is never cold", () => {
  const diag = 300;
  assert.notEqual(classifyDistanceBand(0, diag), "cold", "distance 0 is not cold");
  assert.equal(classifyDistanceBand(0, diag), "hot", "a direct hit is hot");
  const rank: Record<string, number> = { cold: 0, cool: 1, warm: 2, hot: 3 };
  let prev = Infinity;
  for (let d = 0; d <= diag; d += 5) {
    const r = rank[classifyDistanceBand(d, diag)]!;
    assert.ok(r <= prev, `temperature never rises with distance (d=${d})`);
    prev = r;
  }
});

test("revealLore reports the place, a founding year, and a non-empty secret line", () => {
  for (const world of SWEEP) {
    const q = mustQuarry(world);
    const r = revealLore(world, q);
    assert.equal(r.name, q.settlement.name, "names the found place");
    assert.ok(Number.isFinite(r.founded), "cites a finite founding year");
    assert.equal(r.founded, q.settlement.founded, "the year is the settlement's own");
    assert.ok(r.line.length > 0, "the secret line is non-empty");
  }
});

test("revealLore falls back gracefully when a ruined quarry's event has aged out", () => {
  const world = { history: { events: [] } } as unknown as World;
  const quarry: Quarry = {
    idx: 3,
    settlement: {
      x: 10,
      y: 10,
      kind: "village",
      harbor: false,
      onRiver: false,
      score: 0,
      name: "Greymoor",
      founded: 412,
      ruined: true,
    },
  };
  const r = revealLore(world, quarry);
  assert.equal(r.name, "Greymoor");
  assert.equal(r.founded, 412);
  assert.equal(r.line, "Greymoor is marked on older charts, yet no living hand keeps its survey.");
});

test("a ruined quarry reveals its abandonment event verbatim", () => {
  // ~12% of seeds draw a ruined quarry, so one is virtually certain across the 30 daily worlds.
  const ruined = SWEEP.find((w) => {
    const q = chooseQuarry(w);
    if (q?.settlement.ruined !== true) return false;
    // the chronicle caps at 14 events; require the ruin line to have survived
    return w.history.events.some((e) => e.kind === "ruin" && e.settlement === q.idx);
  });
  assert.ok(ruined, "expected a swept world whose quarry is a ruin with a surviving event");
  const q = chooseQuarry(ruined)!;
  const event = ruined.history.events.find(
    (e) => e.kind === "ruin" && e.settlement === q.idx,
  );
  assert.ok(event, "a ruined quarry has a matching ruin event");
  const r = revealLore(ruined, q);
  assert.equal(r.line, event.text, "surfaces the chronicle's abandonment line");
  assert.equal(r.founded, q.settlement.founded, "still cites the founding year");
});

test("chooseQuarry never returns an excluded settlement when alternatives exist", () => {
  const world = SWEEP.find((w) => villagePoolSize(w) >= 2);
  assert.ok(world, "fixture sanity: some swept world has >=2 candidate villages");
  const q0 = chooseQuarry(world)!;
  const q1 = chooseQuarry(world, { exclude: new Set([q0.idx]) })!;
  assert.notEqual(q1.idx, q0.idx, "excluding the default pick yields a different place");
  assert.equal(world.settlements[q1.idx], q1.settlement, "idx and settlement still agree");
});

test("chooseQuarry falls back to the full pool when exclusion would empty it", () => {
  const world = DAILY[0]!;
  const all = new Set(world.settlements.map((_, i) => i));
  const q = chooseQuarry(world, { exclude: all });
  assert.ok(q, "a target still exists even if every settlement is under the legend");
  assert.equal(q.idx, chooseQuarry(world)!.idx, "the fallback pool is the unconstrained one");
});

test("chooseQuarry is deterministic for a given exclusion set", () => {
  const world = SWEEP.find((w) => villagePoolSize(w) >= 2)!;
  const ex = new Set([chooseQuarry(world)!.idx]);
  assert.equal(
    chooseQuarry(world, { exclude: ex })!.idx,
    chooseQuarry(world, { exclude: ex })!.idx,
  );
});

test("legendExcluded flags settlements under the box and spares those outside it", () => {
  const world = DAILY[0]!;
  const widthPx = 1500;
  const proj = createProjection(world.elev.w, world.elev.h, widthPx, Math.round(widthPx * 0.045));
  const target = world.settlements[0]!;
  const box: LegendBox = { x: proj.px(target.x) - 6, y: proj.py(target.y) - 6, width: 12, height: 12 };
  assert.ok(legendExcluded(world, box, widthPx).has(0), "a settlement under the box is excluded");
  // Every projected point sits at >= margin (68px), so a 4px corner box can never contain a settlement: a clean spared case independent of the world.
  const corner: LegendBox = { x: 0, y: 0, width: 4, height: 4 };
  assert.ok(!legendExcluded(world, corner, widthPx).has(0), "a settlement clear of the box is spared");
  assert.equal(legendExcluded(world, null, widthPx).size, 0, "no legend box excludes nothing");
});


const clickWorld = {
  elev: { w: 100, h: 100 },
  recipe: { seed: 1 },
  settlements: [
    { x: 50, y: 50, name: "Quarrytown" }, // idx 0 = quarry
    { x: 50, y: 55, name: "Cluster" }, //     idx 1, hard by the quarry
    { x: 10, y: 10, name: "Farhold" }, //     idx 2, far off
  ],
} as unknown as World;
const clickQuarry: Quarry = { idx: 0, settlement: clickWorld.settlements[0]! };
const BAND_RANK: Record<string, number> = { cold: 0, cool: 1, warm: 2, hot: 3 };

test("classifyClick returns a hit when the click lands in the quarry's cell", () => {
  const fb = classifyClick(clickWorld, clickQuarry, { x: 50, y: 50 });
  assert.equal(fb.kind, "hit");
});

test("classifyClick names the settlement nearest the click on a miss", () => {
  const fb = classifyClick(clickWorld, clickQuarry, { x: 12, y: 12 });
  assert.equal(fb.kind, "miss");
  assert.equal(fb.pickedIdx, 2);
  assert.equal(fb.pickedName, "Farhold");
});

test("classifyClick heat reflects the click's distance, not the nearest town's", () => {
  const fb = classifyClick(clickWorld, clickQuarry, { x: 50, y: 95 });
  assert.equal(fb.kind, "miss");
  assert.equal(fb.pickedName, "Cluster", "still names the town the click selected");
  assert.notEqual(fb.band, "hot", "a far click does not read Hot just because it snapped to a near town");
  assert.equal(fb.band, "cool");
});

test("classifyClick reports the click's own distance to the quarry on a miss (#327)", () => {
  const fb = classifyClick(clickWorld, clickQuarry, { x: 12, y: 12 });
  assert.equal(fb.kind, "miss");
  assert.equal(fb.dist, Math.hypot(12 - 50, 12 - 50), "dist is the click-to-quarry grid distance");
});

test("classifyClick heat never cools as the click steps straight toward the quarry", () => {
  for (const world of DAILY.slice(0, 5)) {
    const q = mustQuarry(world);
    const { x: qx, y: qy } = q.settlement;
    const steps = 12;
    let prev = -1;
    for (let k = steps; k >= 1; k--) {
      const t = k / steps; // 1 (far) -> ~0 (at the quarry)
      const fb = classifyClick(world, q, { x: qx + (5 - qx) * t, y: qy + (5 - qy) * t });
      const r = fb.kind === "hit" ? BAND_RANK.hot! : BAND_RANK[fb.band]!;
      assert.ok(r >= prev, `warming toward the quarry never cools (seed ${world.recipe.seed}, k=${k})`);
      prev = r;
    }
  }
});
