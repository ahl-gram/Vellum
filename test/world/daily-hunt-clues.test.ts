import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { buildClues, chooseQuarry, type Clue, type Quarry } from "../../src/world/daily-hunt.ts";
import { GLYPH_HILL_REL, GLYPH_MTN_REL, TREE_BIOMES } from "../../src/render/layers/glyphs.ts";
import { CELLS_PER_LEAGUE } from "../../src/render/layers/scalebar.ts";
import * as facts from "../../src/world/daily-hunt-clue-facts.ts";
import type { World } from "../../src/world/types.ts";
import {
  ALLOWED_KINDS,
  clueHoldsAt,
  expectedClueText,
  expectedEW,
  expectedNS,
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
  type TerrainBand,
} from "../../test-support/daily-hunt-geometry.ts";
import { DAILY, SWEEP, SWEEP_SVGS, type Gates, gatesFor } from "../../test-support/daily-hunt-sweep.ts";

// Mirrors MAX_LINES in src/world/daily-hunt-clues.ts.
const MAX_LINES = 8;
// Ratified narrowing target (#335): villages consistent with all clues.
const NARROW_TARGET = 3;

function checkRiverClue(world: World, x: number, y: number, clue: Clue): void {
  const nr = nearestNamedRiver(world, x, y);
  assert.ok(nr, "river clue requires a named river to exist");
  assert.equal(clue.subject, nr.name, "cites the nearest named river");
  assert.ok(nr.dist <= NEAR + 1e-9, `nearest named river within threshold (${nr.dist})`);
}

function checkLakeClue(world: World, x: number, y: number, clue: Clue): void {
  const nl = nearestNamedLake(world, x, y);
  assert.ok(nl, "lake clue requires a named lake to exist");
  assert.equal(clue.subject, nl.name, "cites the nearest named lake");
  assert.ok(nl.dist <= NEAR + 1e-9, `nearest named lake within threshold (${nl.dist})`);
}

function checkTerrainClue(world: World, x: number, y: number, clue: Clue): void {
  const counts = terrainCounts(world, x, y);
  const band = clue.subject as TerrainBand;
  assert.ok(band in counts, `terrain subject ${clue.subject} is a known band`);
  assert.ok(
    counts[band] >= TERRAIN_MIN,
    `enough ${band} glyph cells near the quarry (${counts[band]})`,
  );
}

function checkNearClue(world: World, q: Quarry, clue: Clue): void {
  const anchor = nearestAnchor(world, q.idx);
  assert.ok(anchor, "near clue requires an anchor settlement to exist");
  assert.equal(clue.subject, anchor.name, "cites the nearest anchor-tier settlement");
  assert.ok(
    clue.leagues !== undefined && LEAGUE_LADDER.includes(clue.leagues),
    `quotes a round leagues bound (${clue.leagues})`,
  );
  assert.ok(
    anchor.dist <= clue.leagues * MIRROR_CELLS_PER_LEAGUE + 1e-9,
    `the quoted bound truly contains the quarry (${anchor.dist})`,
  );
}

function checkClueGeometry(world: World, q: Quarry, clue: Clue): void {
  const { x, y } = q.settlement;
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
    case "river":
      checkRiverClue(world, x, y, clue);
      break;
    case "lake":
      checkLakeClue(world, x, y, clue);
      break;
    case "realm":
      assert.ok(world.names.realms.length >= 2, "realm clue only when multi-realm");
      assert.equal(clue.subject, realmNameAt(world, x, y), "cites the cell's realm");
      break;
    case "terrain":
      checkTerrainClue(world, x, y, clue);
      break;
    case "road":
      assert.equal(
        clue.subject,
        roadState(world, x, y),
        "road clue matches the network's true state at the quarry",
      );
      break;
    case "near":
      checkNearClue(world, q, clue);
      break;
  }
}

function checkClueLine(world: World, q: Quarry, gates: Gates, clue: Clue): void {
  assert.equal(clue.text, expectedClueText(clue), "the prose matches the clue's subject");
  assert.ok(ALLOWED_KINDS.has(clue.kind), `kind ${clue.kind} is allowed`);
  assert.doesNotMatch(clue.text, /ruin|abandon/i, `clue avoids ruin/abandon: ${clue.text}`);
  assert.doesNotMatch(clue.text, /inland/i, `clue makes no affirmative inland claim: ${clue.text}`);

  if (clue.kind === "river" || clue.kind === "lake" || clue.kind === "near") {
    assert.ok(gates.isLabeled(clue.subject!), `"${clue.subject}" is printed on the sheet`);
  }
  if (clue.kind === "terrain") {
    assert.ok(
      gates.hasGlyphNear(clue.subject as TerrainBand),
      `${clue.subject} glyphs are truly drawn near the quarry`,
    );
  }

  checkClueGeometry(world, q, clue);

  if (clue.subject) {
    assert.notEqual(clue.subject, world.names.range, "no range reference");
    assert.notEqual(clue.subject, world.names.forest, "no forest reference");
  }
}

function checkWorldClues(world: World, wi: number): void {
  const q = mustQuarry(world);
  const gates = gatesFor(world, q, SWEEP_SVGS[wi]!);
  const clues = buildClues(world, q, gates);

  assert.ok(clues.length >= 3, "at least the three-line floor");
  assert.ok(clues.length <= MAX_LINES, "never past the line cap");
  const kinds = clues.map((c) => c.kind);
  assert.ok(
    kinds.includes("framing") && (kinds.includes("ew") || kinds.includes("ns")),
    "the floor is framing + at least one compass band (#335)",
  );

  for (const clue of clues) checkClueLine(world, q, gates, clue);
}

test("every emitted clue re-verifies true against independent raw geometry", () => {
  SWEEP.forEach((world, wi) => checkWorldClues(world, wi));
});

test("buildClues falls to exactly the three-line floor on a featureless quarry", () => {
  // A bare-floor quarry is vanishingly rare live, so the floor is proven on a constructed featureless world; buildClues reads only these fields.
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
    const remaining = pool.filter(({ s }) =>
      clues.every((c) => clueHoldsAt(world, c, s)),
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
      const filtered = remaining.filter(({ s }) => clueHoldsAt(world, clueLike, s));
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
