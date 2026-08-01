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
  type Clue,
  type LegendBox,
  type Quarry,
} from "../../src/world/daily-hunt.ts";
import { createProjection } from "../../src/render/transform.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { GLYPH_HILL_REL, GLYPH_MTN_REL, TREE_BIOMES } from "../../src/render/layers/glyphs.ts";
import { CELLS_PER_LEAGUE } from "../../src/render/layers/scalebar.ts";
import * as facts from "../../src/world/daily-hunt-clue-facts.ts";
import { buildClueFacts } from "../../src/world/daily-hunt-clue-facts.ts";
import type { World } from "../../src/world/types.ts";
import {
  ALLOWED_KINDS,
  clueHoldsAt,
  expectedClueText,
  expectedEW,
  expectedNS,
  glyphGate,
  labelGate,
  LEAGUE_LADDER,
  MIRROR_CELLS_PER_LEAGUE,
  MIRROR_HILL_REL,
  MIRROR_MTN_REL,
  mustQuarry,
  NEAR,
  nearestAnchor,
  nearestNamedLake,
  nearestNamedRiver,
  quarryPoolMirror,
  realmNameAt,
  ROAD_NEAR,
  roadState,
  TERRAIN_MIN,
  TERRAIN_RADIUS,
  terrainCounts,
  TREE_IDS,
  truthfulCandidates,
  villagePoolSize,
  type TerrainBand,
} from "../../test-support/daily-hunt-geometry.ts";

// Mirrors MAX_LINES in src/world/daily-hunt-clues.ts: the cap on a day's total
// clue lines, past which the narrowing walk stops even if the field is wide.
const MAX_LINES = 8;
// Ratified narrowing target (#335): villages consistent with all clues.
const NARROW_TARGET = 3;
// Mirrors MARGIN in src/site/seed-of-the-day/app.ts (renderMap's default).
const MARGIN = Math.round(1500 * 0.045);

// This suite is world-generation heavy by design: acceptance #5 asks for the
// truthfulness sweep to run across ALL 30 June-2026 daily seeds. Worlds are
// generated ONCE into a shared pool and reused by every test below, so the
// 30 gens are paid a single time rather than per-test.
const DAILY_SEEDS = Array.from({ length: 30 }, (_, i) => 20260601 + i);
const DAILY: ReadonlyArray<World> = DAILY_SEEDS.map((s) => generateWorld(defaultRecipe(s)));
// "a few off-grid seeds": arbitrary, non-date seeds, default recipe.
const OFFGRID: ReadonlyArray<World> = [1, 7, 12345].map((s) => generateWorld(defaultRecipe(s)));
const SWEEP: ReadonlyArray<World> = [...DAILY, ...OFFGRID];

// The delivered clue list depends on what the sheet DREW (#335), so the sweep
// renders each world's antique chart once and derives the page's findability
// gates from the markup, exactly as setupHunt in src/site/seed-of-the-day/app.ts
// does from the live SVG.
const SWEEP_SVGS: ReadonlyArray<string> = SWEEP.map((w) =>
  renderMap(w, { style: "antique", legend: true }),
);

type Gates = {
  readonly isLabeled: (name: string) => boolean;
  readonly hasGlyphNear: (band: TerrainBand) => boolean;
};

function gatesFor(world: World, q: Quarry, markup: string): Gates {
  const proj = createProjection(world.elev.w, world.elev.h, 1500, MARGIN);
  return {
    isLabeled: labelGate(markup),
    hasGlyphNear: glyphGate(
      markup,
      proj.px(q.settlement.x),
      proj.py(q.settlement.y),
      TERRAIN_RADIUS * proj.scale,
    ),
  };
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
  SWEEP.forEach((world, wi) => {
    const q = mustQuarry(world);
    const { x, y } = q.settlement;
    const gates = gatesFor(world, q, SWEEP_SVGS[wi]!);
    const clues = buildClues(world, q, gates);

    assert.ok(clues.length >= 3, "at least the three-line floor");
    assert.ok(clues.length <= MAX_LINES, "never past the line cap");
    const kinds = clues.map((c) => c.kind);
    assert.ok(
      kinds.includes("framing") && (kinds.includes("ew") || kinds.includes("ns")),
      "the floor is framing + at least one compass band (#335)",
    );

    for (const clue of clues) {
      assert.equal(clue.text, expectedClueText(clue), "the prose matches the clue's subject");
      assert.ok(ALLOWED_KINDS.has(clue.kind), `kind ${clue.kind} is allowed`);
      assert.doesNotMatch(clue.text, /ruin|abandon/i, `clue avoids ruin/abandon: ${clue.text}`);
      assert.doesNotMatch(clue.text, /inland/i, `clue makes no affirmative inland claim: ${clue.text}`);

      // Findability (#335): a cited name must be printed on the sheet, and a
      // terrain claim must have DRAWN glyphs nearby, per the page's own gates.
      if (clue.kind === "river" || clue.kind === "lake" || clue.kind === "near") {
        assert.ok(gates.isLabeled(clue.subject!), `"${clue.subject}" is printed on the sheet`);
      }
      if (clue.kind === "terrain") {
        assert.ok(
          gates.hasGlyphNear(clue.subject as TerrainBand),
          `${clue.subject} glyphs are truly drawn near the quarry`,
        );
      }

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
        case "terrain": {
          const counts = terrainCounts(world, x, y);
          const band = clue.subject as TerrainBand;
          assert.ok(band in counts, `terrain subject ${clue.subject} is a known band`);
          assert.ok(
            counts[band] >= TERRAIN_MIN,
            `enough ${band} glyph cells near the quarry (${counts[band]})`,
          );
          break;
        }
        case "road":
          assert.equal(
            clue.subject,
            roadState(world, x, y),
            "road clue matches the network's true state at the quarry",
          );
          break;
        case "near": {
          const anchor = nearestAnchor(world, q.idx);
          assert.ok(anchor, "near clue requires an anchor settlement to exist");
          assert.equal(clue.subject, anchor.name, "cites the nearest anchor-tier settlement");
          assert.ok(
            clue.leagues !== undefined && LEAGUE_LADDER.includes(clue.leagues),
            `quotes a round leagues bound (${clue.leagues})`,
          );
          assert.ok(
            anchor.dist <= clue.leagues! * MIRROR_CELLS_PER_LEAGUE + 1e-9,
            `the quoted bound truly contains the quarry (${anchor.dist})`,
          );
          break;
        }
      }

      // Never references a range or forest (named, but coordinate-less).
      if (clue.subject) {
        assert.notEqual(clue.subject, world.names.range, "no range reference");
        assert.notEqual(clue.subject, world.names.forest, "no forest reference");
      }
    }
  });
});

test("buildClues falls to exactly the three-line floor on a featureless quarry", () => {
  // Real village placement clusters near water, so a bare-floor quarry is
  // vanishingly rare from a live seed. Acceptance #2's guarantee (">=3 even
  // with no named river, lake, harbor, or realm") is proven directly with a
  // constructed featureless world: a single-realm flat grid, no named
  // features, no roads, a lone landlocked dry village. buildClues reads only
  // these fields.
  const w = 320;
  const h = 240;
  const quarrySettlement = {
    x: 100,
    y: 50,
    kind: "village",
    harbor: false,
    onRiver: false,
    score: 0,
    name: "Nowhere",
    founded: 100,
    ruined: false,
  };
  const featureless = {
    recipe: { seed: 99 },
    elev: { w, h, data: new Float64Array(w * h) },
    seaLevel: -1,
    biomes: new Uint8Array(w * h),
    rivers: [],
    roads: [],
    settlements: [quarrySettlement],
    realms: { labels: new Int16Array(w * h), seats: [] },
    names: { rivers: new Map(), lakes: [], realms: [] },
  } as unknown as World;
  const quarry: Quarry = { idx: 0, settlement: quarrySettlement as Quarry["settlement"] };
  const clues = buildClues(featureless, quarry);
  assert.ok(
    clues.length >= 3,
    `expected at least the three-line floor; got ${clues.map((c) => c.kind).join(",")}`,
  );
  assert.equal(clues[0]!.kind, "framing", "the framing line opens the list");
  const kinds = clues.map((c) => c.kind);
  assert.ok(kinds.includes("ew") || kinds.includes("ns"), "a compass anchor survives the floor");
});

// --- #335: seeded, discriminative clue selection ------------------------------

test("clue selection is deterministic across fresh constructions of a seed (#335)", () => {
  for (const seed of [20260601, 12345]) {
    const a = generateWorld(defaultRecipe(seed));
    const b = generateWorld(defaultRecipe(seed));
    assert.deepEqual(
      buildClues(a, chooseQuarry(a)!),
      buildClues(b, chooseQuarry(b)!),
      `seed ${seed}: same seed, same clues`,
    );
  }
});

test("at least one compass line survives every day (#335 ratified)", () => {
  SWEEP.forEach((world, wi) => {
    const q = mustQuarry(world);
    const kinds = buildClues(world, q, gatesFor(world, q, SWEEP_SVGS[wi]!)).map((c) => c.kind);
    assert.ok(kinds.includes("ew") || kinds.includes("ns"), "a compass anchor is guaranteed");
    assert.equal(kinds[0], "framing", "the framing line still opens the list");
  });
});

test("the month's clue voice varies: terrain, road, and near clues all appear (#335)", () => {
  const kinds = new Set<string>();
  DAILY.forEach((world, wi) => {
    const q = mustQuarry(world);
    for (const c of buildClues(world, q, gatesFor(world, q, SWEEP_SVGS[wi]!))) kinds.add(c.kind);
  });
  for (const k of ["terrain", "road", "near"]) {
    assert.ok(kinds.has(k), `kind ${k} appears at least once across the June-2026 month`);
  }
});

test("each day's DELIVERED clues narrow the field to <= 3 villages, or nothing unused and findable would help (#335)", () => {
  SWEEP.forEach((world, wi) => {
    const q = mustQuarry(world);
    const gates = gatesFor(world, q, SWEEP_SVGS[wi]!);
    const clues = buildClues(world, q, gates);
    const pool = quarryPoolMirror(world);
    const remaining = pool.filter(({ s, idx }) =>
      clues.every((c) => clueHoldsAt(world, c, s, idx)),
    );
    assert.ok(
      remaining.some(({ idx }) => idx === q.idx),
      `the quarry itself stays consistent with every clue (seed ${world.recipe.seed})`,
    );
    if (remaining.length <= NARROW_TARGET) return;
    if (clues.length >= MAX_LINES) return;
    const emitted = new Set(clues.map((c) => `${c.kind}:${c.subject ?? ""}`));
    const findable = truthfulCandidates(world, q).filter((cand) =>
      cand.kind === "river" || cand.kind === "lake" || cand.kind === "near"
        ? gates.isLabeled(cand.subject!)
        : cand.kind === "terrain"
          ? gates.hasGlyphNear(cand.subject as TerrainBand)
          : true,
    );
    for (const cand of findable) {
      if (emitted.has(`${cand.kind}:${cand.subject ?? ""}`)) continue;
      const clueLike = {
        kind: cand.kind,
        text: "",
        subject: cand.subject,
        leagues: cand.leagues,
      } as Clue;
      const filtered = remaining.filter(({ s, idx }) => clueHoldsAt(world, clueLike, s, idx));
      assert.equal(
        filtered.length,
        remaining.length,
        `an unused truthful ${cand.kind} clue would have narrowed ${remaining.length} -> ` +
          `${filtered.length} (seed ${world.recipe.seed})`,
      );
    }
  });
});

test("findability gates run before selection, so the walk plans around them (#335)", () => {
  const world = DAILY[0]!;
  const q = mustQuarry(world);
  const closed = buildClues(world, q, { isLabeled: () => false, hasGlyphNear: () => false });
  const kinds = closed.map((c) => c.kind);
  for (const k of ["river", "lake", "near", "terrain"]) {
    assert.ok(!kinds.includes(k as Clue["kind"]), `${k} cannot appear when its gate is closed`);
  }
  assert.ok(closed.length >= 3, "the three-line floor survives fully closed gates");
  assert.equal(closed[0]!.kind, "framing", "the framing line still opens the list");
});

test("every mirrored constant matches its source (the drift alarm, #335)", () => {
  assert.equal(MIRROR_MTN_REL, GLYPH_MTN_REL, "mountain relief threshold");
  assert.equal(MIRROR_HILL_REL, GLYPH_HILL_REL, "hill relief threshold");
  assert.equal(MIRROR_CELLS_PER_LEAGUE, CELLS_PER_LEAGUE, "cells per league");
  assert.deepEqual([...TREE_IDS].sort(), [...TREE_BIOMES].sort(), "tree-glyph biome set");
  assert.deepEqual(LEAGUE_LADDER, facts.LEAGUE_LADDER, "leagues ladder");
  assert.equal(NEAR, facts.NEAR, "named-feature nearness radius");
  assert.equal(TERRAIN_RADIUS, facts.TERRAIN_RADIUS, "terrain neighborhood radius");
  assert.equal(TERRAIN_MIN, facts.TERRAIN_MIN, "terrain cell floor");
  assert.equal(ROAD_NEAR, facts.ROAD_NEAR, "road reach");
});

test("chooseQuarry picks are pinned: the #335 pool refactor changed nothing", () => {
  // Measured before the pool moved to daily-hunt-clue-facts.ts (120-seed
  // equivalence run, 0 mismatches); these two pins keep the class guarded.
  assert.equal(chooseQuarry(DAILY[0]!)!.idx, 11);
  assert.equal(DAILY[0]!.settlements[11]!.name, "Sharakhara");
  assert.equal(chooseQuarry(DAILY[14]!)!.idx, 19);
  assert.equal(DAILY[14]!.settlements[19]!.name, "Lurgry");
});

test("a quarry near (not exactly at) the chart's center reads central, not west/south", () => {
  // Live-play 2026-07-31 (seed 20260731, Breibrook): the quarry sat a few cells
  // off dead-center yet the clues claimed "western reach" and "southern part",
  // because "central" fired only on exact midpoint equality. Near-center must
  // land in a central BAND (within 1/8 of the dimension from the midpoint).
  // Probed through buildClueFacts' compass candidates: selection (#335)
  // guarantees only ONE compass line in the emitted list, but both candidates
  // always exist and carry the band the sweep re-verifies emitted clues by.
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
  // Just beyond the band: the directional wording is earned again.
  assert.deepEqual(subjects(118, 88), { ew: "west", ns: "north" });
  assert.deepEqual(subjects(201, 152), { ew: "east", ns: "south" });
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

// pruneUnlabeledFeatureClues and its tests are gone (#335): findability now
// gates candidates BEFORE selection (ClueFindability), covered by the gated
// sweep and the closed-gates test above.

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

test("classifyClick reports the click's own distance to the quarry on a miss (#327)", () => {
  const fb = classifyClick(clickWorld, clickQuarry, { x: 12, y: 12 });
  assert.equal(fb.kind, "miss");
  if (fb.kind === "miss") {
    assert.equal(fb.dist, Math.hypot(12 - 50, 12 - 50), "dist is the click-to-quarry grid distance");
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
