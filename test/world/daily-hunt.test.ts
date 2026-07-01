import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import {
  buildClues,
  chooseQuarry,
  classifyClick,
  classifyDistanceBand,
  legendExcluded,
  pruneUnlabeledFeatureClues,
  revealLore,
  type Clue,
  type LegendBox,
  type Quarry,
} from "../../src/world/daily-hunt.ts";
import { createProjection } from "../../src/render/transform.ts";
import type { World } from "../../src/world/types.ts";

// This suite is world-generation heavy by design: acceptance #5 asks for the
// truthfulness sweep to run across ALL 30 June-2026 daily seeds. Worlds are
// generated ONCE into a shared pool and reused by every test below, so the
// 30 gens are paid a single time rather than per-test.
const DAILY_SEEDS = Array.from({ length: 30 }, (_, i) => 20260601 + i);
const DAILY: ReadonlyArray<World> = DAILY_SEEDS.map((s) => generateWorld(defaultRecipe(s)));
// "a few off-grid seeds": arbitrary, non-date seeds, default recipe.
const OFFGRID: ReadonlyArray<World> = [1, 7, 12345].map((s) => generateWorld(defaultRecipe(s)));
const SWEEP: ReadonlyArray<World> = [...DAILY, ...OFFGRID];

// Grid threshold (cells) within which buildClues will cite a named feature;
// mirrored here so the test can bound an emitted feature clue's distance. The
// test computes nearest features from raw geometry, independent of the module.
const NEAR = 4;

const ALLOWED_KINDS = new Set<Clue["kind"]>([
  "framing",
  "ew",
  "ns",
  "river",
  "lake",
  "coast",
  "onriver",
  "realm",
]);

// --- independent ground-truth geometry (never calls buildClues internals) ----

function nearestNamed(
  entries: Iterable<readonly [number, string]>,
  pointsOf: (i: number) => ReadonlyArray<{ x: number; y: number }>,
  x: number,
  y: number,
): { name: string; dist: number } | null {
  let best: { name: string; dist: number } | null = null;
  for (const [i, name] of entries) {
    let d = Infinity;
    for (const p of pointsOf(i)) d = Math.min(d, Math.hypot(p.x - x, p.y - y));
    if (best === null || d < best.dist) best = { name, dist: d };
  }
  return best;
}

function nearestNamedRiver(world: World, x: number, y: number) {
  return nearestNamed(
    world.names.rivers.entries(),
    (i) => world.rivers[i]?.points ?? [],
    x,
    y,
  );
}

function nearestNamedLake(world: World, x: number, y: number) {
  let best: { name: string; dist: number } | null = null;
  for (const lk of world.names.lakes) {
    const d = Math.hypot(lk.x - x, lk.y - y);
    if (best === null || d < best.dist) best = { name: lk.name, dist: d };
  }
  return best;
}

function realmNameAt(world: World, x: number, y: number): string | null {
  if (world.names.realms.length < 2) return null;
  const id = world.realms.labels[x + y * world.elev.w] as number;
  return id >= 0 ? (world.names.realms[id] ?? null) : null;
}

function expectedEW(world: World, x: number): "east" | "west" | "central" {
  const c = (world.elev.w - 1) / 2;
  return x < c ? "west" : x > c ? "east" : "central";
}

function expectedNS(world: World, y: number): "north" | "south" | "central" {
  const c = (world.elev.h - 1) / 2;
  return y < c ? "north" : y > c ? "south" : "central";
}

function mustQuarry(world: World): Quarry {
  const q = chooseQuarry(world);
  assert.ok(q, "every swept world has at least one settlement, so a quarry exists");
  return q;
}

// --- tests -------------------------------------------------------------------

test("chooseQuarry is deterministic across independent constructions of a seed", () => {
  const seed = DAILY_SEEDS[0]!;
  const a = chooseQuarry(DAILY[0]!);
  const b = chooseQuarry(generateWorld(defaultRecipe(seed)));
  assert.ok(a && b);
  assert.equal(a.idx, b.idx, "same seed, freshly generated, yields the same target");
  // repeated calls on one world also agree (pure function of the world)
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

test("every emitted clue re-verifies true against independent raw geometry", () => {
  for (const world of SWEEP) {
    const q = mustQuarry(world);
    const { x, y } = q.settlement;
    const clues = buildClues(world, q);

    assert.ok(clues.length >= 3, "at least the three-line floor");
    const kinds = clues.map((c) => c.kind);
    assert.ok(
      kinds.includes("framing") && kinds.includes("ew") && kinds.includes("ns"),
      "the floor is framing + east/west + north/south",
    );

    for (const clue of clues) {
      assert.ok(clue.text.length > 0, "clue has text");
      assert.ok(ALLOWED_KINDS.has(clue.kind), `kind ${clue.kind} is allowed`);
      assert.doesNotMatch(clue.text, /ruin|abandon/i, `clue avoids ruin/abandon: ${clue.text}`);
      assert.doesNotMatch(clue.text, /inland/i, `clue makes no affirmative inland claim: ${clue.text}`);

      switch (clue.kind) {
        case "framing":
          break;
        case "ew":
          assert.equal(clue.subject, expectedEW(world, x), "east/west band matches geometry");
          break;
        case "ns":
          assert.equal(clue.subject, expectedNS(world, y), "north/south band matches geometry");
          break;
        case "coast":
          assert.ok(q.settlement.harbor, "coastal asserted only from settlement.harbor");
          break;
        case "onriver":
          assert.ok(q.settlement.onRiver, "on-a-river asserted only from settlement.onRiver");
          break;
        case "river": {
          const nr = nearestNamedRiver(world, x, y);
          assert.ok(nr, "river clue requires a named river to exist");
          assert.equal(clue.subject, nr.name, "cites the nearest named river");
          assert.ok(nr.dist <= NEAR + 1e-9, `nearest named river within threshold (${nr.dist})`);
          break;
        }
        case "lake": {
          const nl = nearestNamedLake(world, x, y);
          assert.ok(nl, "lake clue requires a named lake to exist");
          assert.equal(clue.subject, nl.name, "cites the nearest named lake");
          assert.ok(nl.dist <= NEAR + 1e-9, `nearest named lake within threshold (${nl.dist})`);
          break;
        }
        case "realm":
          assert.ok(world.names.realms.length >= 2, "realm clue only when multi-realm");
          assert.equal(clue.subject, realmNameAt(world, x, y), "cites the cell's realm");
          break;
      }

      // Never references a range or forest (named, but coordinate-less).
      if (clue.subject) {
        assert.notEqual(clue.subject, world.names.range, "no range reference");
        assert.notEqual(clue.subject, world.names.forest, "no forest reference");
      }
    }
  }
});

test("buildClues falls to exactly the three-line floor on a featureless quarry", () => {
  // Real village placement clusters near water, so a bare-floor quarry is
  // vanishingly rare from a live seed. Acceptance #2's guarantee (">=3 even
  // with no named river, lake, harbor, or realm") is proven directly with a
  // constructed featureless world: a single-realm grid, no named features, a
  // landlocked dry village. buildClues reads only these fields.
  const featureless = {
    elev: { w: 320, h: 240 },
    rivers: [],
    realms: { labels: new Int16Array(320 * 240), seats: [] },
    names: { rivers: new Map(), lakes: [], realms: [] },
  } as unknown as World;
  const quarry: Quarry = {
    idx: 0,
    settlement: {
      x: 100,
      y: 50,
      kind: "village",
      harbor: false,
      onRiver: false,
      score: 0,
      name: "Nowhere",
      founded: 100,
      ruined: false,
    },
  };
  const clues = buildClues(featureless, quarry);
  assert.equal(
    clues.length,
    3,
    `expected the bare floor; got ${clues.map((c) => c.kind).join(",")}`,
  );
  assert.deepEqual(clues.map((c) => c.kind), ["framing", "ew", "ns"]);
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
  // history caps its chronicle at 14 events (history.ts slice(0,14)), so a
  // ruined village's ruin line can be sliced away. The reveal must still return
  // a non-empty secret line rather than crash or go blank. A constructed world
  // with no events drives the fallback branch directly.
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
  // ~12% of seeds draw a ruined quarry, so a ruin is virtually certain across
  // the 30 daily worlds. Find one and assert the ruined branch explicitly
  // rather than trusting the sweep to land on one.
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

// --- #88: keep the quarry from hiding under the legend ------------------------

/** Count of the broad non-seat village pool chooseQuarry normally draws from. */
function villagePoolSize(world: World): number {
  const seats = new Set(world.realms.seats);
  return world.settlements.filter((s, i) => s.kind === "village" && !seats.has(i)).length;
}

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
  assert.equal(q!.idx, chooseQuarry(world)!.idx, "the fallback pool is the unconstrained one");
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
  // Every projected point sits at >= margin (68px), so a 4px corner box can
  // never contain a settlement: a clean "spared" case independent of the world.
  const corner: LegendBox = { x: 0, y: 0, width: 4, height: 4 };
  assert.ok(!legendExcluded(world, corner, widthPx).has(0), "a settlement clear of the box is spared");
  assert.equal(legendExcluded(world, null, widthPx).size, 0, "no legend box excludes nothing");
});

// --- pruneUnlabeledFeatureClues: keep only clues a player can actually find ---
// Uses a synthetic clue list (not a pinned seed) so the contract is tested
// directly, independent of world-gen determinism.
const SAMPLE_CLUES: readonly Clue[] = [
  { kind: "framing", text: "Today's survey hides one small place." },
  { kind: "ew", subject: "west", text: "It lies toward the western reach of the chart." },
  { kind: "ns", subject: "north", text: "It lies in the northern part of the chart." },
  {
    kind: "river",
    subject: "The Hjarggre Torrent",
    text: "It stands within sight of the river The Hjarggre Torrent.",
  },
  { kind: "lake", subject: "The Still Mere", text: "Its prospect takes in the waters of The Still Mere." },
  { kind: "onriver", text: "A river runs through its bounds." },
  { kind: "realm", subject: "The Jarldom of Skaugre", text: "It answers to The Jarldom of Skaugre." },
];

test("pruneUnlabeledFeatureClues drops river/lake clues whose label was never drawn", () => {
  const kept = pruneUnlabeledFeatureClues(SAMPLE_CLUES, () => false);
  const kinds = kept.map((c) => c.kind);
  assert.ok(!kinds.includes("river"), "an unlabeled river clue is removed");
  assert.ok(!kinds.includes("lake"), "an unlabeled lake clue is removed");
  // Non-feature clues (and the realm clue, which is out of scope) always survive.
  assert.deepEqual(kinds, ["framing", "ew", "ns", "onriver", "realm"]);
});

test("pruneUnlabeledFeatureClues keeps every clue when all labels are drawn", () => {
  const kept = pruneUnlabeledFeatureClues(SAMPLE_CLUES, () => true);
  assert.deepEqual(kept, SAMPLE_CLUES);
});

test("pruneUnlabeledFeatureClues keeps a labeled feature and drops an unlabeled one", () => {
  const kept = pruneUnlabeledFeatureClues(SAMPLE_CLUES, (name) => name === "The Hjarggre Torrent");
  const river = kept.find((c) => c.kind === "river");
  const lake = kept.find((c) => c.kind === "lake");
  assert.ok(river, "the labeled river clue is kept");
  assert.equal(lake, undefined, "the unlabeled lake clue is dropped");
});

test("pruneUnlabeledFeatureClues never mutates its input", () => {
  const before = SAMPLE_CLUES.length;
  const kept = pruneUnlabeledFeatureClues(SAMPLE_CLUES, () => false);
  assert.equal(SAMPLE_CLUES.length, before, "input array length is unchanged");
  assert.notStrictEqual(kept, SAMPLE_CLUES, "a new array is returned");
});

// --- classifyClick: continuous warmer/colder + name the town you clicked -----
// A synthetic world gives exact control over the geometry the click reads
// (settlements + elev + the quarry).
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
  if (fb.kind === "miss") {
    assert.equal(fb.pickedIdx, 2);
    assert.equal(fb.pickedName, "Farhold");
  }
});

test("classifyClick heat reflects the click's distance, not the nearest town's", () => {
  // The click is far from the quarry but snaps to "Cluster", which sits right by
  // the quarry. The band must read the CLICK's distance (cool), not saturate to
  // Hot the way the old nearest-settlement scoring did.
  const fb = classifyClick(clickWorld, clickQuarry, { x: 50, y: 95 });
  assert.equal(fb.kind, "miss");
  if (fb.kind === "miss") {
    assert.equal(fb.pickedName, "Cluster", "still names the town the click selected");
    assert.notEqual(fb.band, "hot", "a far click does not read Hot just because it snapped to a near town");
    assert.equal(fb.band, "cool");
  }
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
