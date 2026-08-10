import { test } from "node:test";
import assert from "node:assert/strict";
import type { ProspectInput, ProspectKind } from "../../src/prospect/input.ts";
import type { BiomeName } from "../../src/climate/biomes.ts";
import { BACKDROP_SAMPLES, FOREGROUND_SAMPLES } from "../../src/prospect/transect.ts";
import { composeProspect } from "../../src/prospect/compose.ts";
import {
  BASE_GROUND,
  PLATE_H,
  RIVER_BANK_DROP,
  SHORE_DROP,
  VIEW_X0,
  VIEW_X1,
  WATER_BOTTOM,
  groundingViolations,
  type ForegroundElement,
  type Mass,
  type ProspectGeometry,
} from "../../src/prospect/geometry.ts";

/** Typical raw site scores per tier, matching the ranges input.ts documents
 * (0.3-8 for sites, hamlets capped near 2). */
const TYPICAL_SCORE: Record<ProspectKind, number> = {
  capital: 6,
  seat: 4.5,
  town: 3.5,
  village: 1.8,
  hamlet: 1.2,
};

function makeInput(overrides: Partial<{
  seed: number;
  index: number;
  kind: ProspectKind;
  score: number;
  harbor: boolean;
  onRiver: boolean;
  ruined: boolean;
  ruinedYear: number | null;
  siteRel: number;
  backdrop: ReadonlyArray<number>;
  foreground: ReadonlyArray<BiomeName>;
}> = {}): ProspectInput {
  const kind = overrides.kind ?? "town";
  return {
    seed: overrides.seed ?? 4242,
    index: overrides.index ?? 0,
    name: "Testholm",
    kind,
    score: overrides.score ?? TYPICAL_SCORE[kind],
    harbor: overrides.harbor ?? false,
    onRiver: overrides.onRiver ?? false,
    founded: 1100,
    ruined: overrides.ruined ?? false,
    ruinedYear: overrides.ruinedYear ?? null,
    realm: 0,
    realmName: "Testrealm",
    arms: null,
    view: { dx: 0, dy: -1 },
    siteRel: overrides.siteRel ?? 0.12,
    backdrop: overrides.backdrop ?? Array(BACKDROP_SAMPLES).fill(0.15),
    foreground: overrides.foreground ?? Array(FOREGROUND_SAMPLES).fill("grassland"),
  };
}

function els<K extends ForegroundElement["kind"]>(
  g: ProspectGeometry,
  kind: K,
): Array<Extract<ForegroundElement, { kind: K }>> {
  return g.foreground.filter(
    (e): e is Extract<ForegroundElement, { kind: K }> => e.kind === kind,
  );
}

function one<K extends ForegroundElement["kind"]>(
  g: ProspectGeometry,
  kind: K,
): Extract<ForegroundElement, { kind: K }> {
  const found = els(g, kind);
  assert.equal(found.length, 1, `expected exactly one ${kind}, got ${found.length}`);
  return found[0]!;
}

function tallest(g: ProspectGeometry): number {
  assert.ok(g.masses.length > 0, "composition has masses");
  return Math.max(...g.masses.map((m) => m.h));
}

const verticals = (g: ProspectGeometry): Mass[] =>
  g.masses.filter((m) => m.form === "spire" || m.form === "tower");
const keeps = (g: ProspectGeometry): Mass[] =>
  g.masses.filter((m) => m.form === "keep");

// ---------------------------------------------------------------- tier ladder

test("the five-tier ladder drives mass count and height", () => {
  const byKind = Object.fromEntries(
    (Object.keys(TYPICAL_SCORE) as ProspectKind[]).map((kind) => [
      kind,
      composeProspect(makeInput({ kind })),
    ]),
  ) as Record<ProspectKind, ProspectGeometry>;

  assert.ok(
    byKind.capital.masses.length > byKind.town.masses.length,
    "capital composes denser than town",
  );
  assert.ok(
    byKind.town.masses.length > byKind.village.masses.length,
    "town composes denser than village",
  );
  assert.ok(
    byKind.village.masses.length > byKind.hamlet.masses.length,
    "village composes denser than hamlet",
  );
  assert.ok(
    byKind.capital.masses.length > byKind.seat.masses.length,
    "capital composes denser than seat",
  );
  assert.ok(
    tallest(byKind.capital) > tallest(byKind.village),
    "capital composes taller than village",
  );

  assert.equal(keeps(byKind.capital).length, 1, "capital raises a keep");
  assert.equal(keeps(byKind.seat).length, 1, "seat raises a keep");
  assert.equal(keeps(byKind.town).length, 0, "town has no keep");
  assert.equal(keeps(byKind.village).length, 0);
  assert.equal(keeps(byKind.hamlet).length, 0);

  assert.equal(verticals(byKind.capital).length, 3, "capital: three verticals");
  assert.equal(verticals(byKind.seat).length, 2);
  assert.equal(verticals(byKind.town).length, 2);
  assert.equal(verticals(byKind.village).length, 1);
  assert.equal(verticals(byKind.hamlet).length, 0, "a hamlet has no spire");

  for (const kind of ["capital", "seat", "town"] as const) {
    assert.ok(byKind[kind].walls.length >= 1, `${kind} is walled`);
    assert.ok(byKind[kind].walls.some((w) => w.gate), `${kind} wall has a gate`);
  }
  assert.equal(byKind.village.walls.length, 0, "village is unwalled");
  assert.equal(byKind.hamlet.walls.length, 0, "hamlet is unwalled");
});

test("score modulates density within a kind", () => {
  const low = composeProspect(makeInput({ kind: "town", score: 2 }));
  const high = composeProspect(makeInput({ kind: "town", score: 6 }));
  assert.ok(
    high.masses.length > low.masses.length,
    `high score composes denser: ${high.masses.length} vs ${low.masses.length}`,
  );
  assert.ok(tallest(high) > tallest(low), "high score composes taller");
});

// ------------------------------------------------------------- sea foreground

test("a harbor town fronts the sea: quay, masts, ship", () => {
  const g = composeProspect(makeInput({ kind: "town", harbor: true }));
  assert.ok(g.water, "harbor composes water");
  assert.equal(g.water!.kind, "sea");
  assert.equal(g.water!.y0, BASE_GROUND + SHORE_DROP);
  assert.equal(g.water!.y1, WATER_BOTTOM);

  // The articulate quay face (#237 GO condition 9): steps, arcade, bollards.
  const quay = one(g, "quay");
  assert.equal(quay.y, BASE_GROUND + SHORE_DROP);
  assert.ok(quay.bollards.length >= 3, "quay carries bollards");
  assert.ok(quay.steps.count >= 2, "quay face has steps");
  assert.ok(quay.arcade.arches >= 2, "quay face has an arcade");
  assert.ok(quay.arcade.x0 >= quay.x0 && quay.arcade.x1 <= quay.x1, "arcade sits in the quay");

  const masts = one(g, "mastRow");
  assert.equal(masts.masts.length, 4, "a town moors four masts");
  for (const m of masts.masts) {
    assert.ok(m.x > quay.x1, "masts moor past the quay");
    assert.ok(m.hullY > g.water!.y0, "hulls sit on the water");
    assert.ok(m.mastH > 0);
  }
  one(g, "ship");
  assert.equal(els(g, "mole").length, 0, "no mole below capital rank");
  assert.equal(one(g, "birds").items.length, 2, "two birds over the coast");
});

test("a harbor capital adds the mole and a fifth mast", () => {
  const g = composeProspect(makeInput({ kind: "capital", harbor: true }));
  assert.equal(one(g, "mastRow").masts.length, 5);
  const mole = one(g, "mole");
  assert.ok(mole.headX < mole.rootX, "the mole curves out from the shore");
});

test("a fisher village beaches its hulls instead of building a quay", () => {
  const g = composeProspect(makeInput({ kind: "village", harbor: true }));
  assert.equal(els(g, "quay").length, 0);
  assert.equal(els(g, "mastRow").length, 0);
  assert.equal(one(g, "beachedHulls").hulls.length, 2);
  one(g, "jetty");
  one(g, "nets");
  const h = composeProspect(makeInput({ kind: "hamlet", harbor: true }));
  assert.equal(one(h, "beachedHulls").hulls.length, 1);
  assert.equal(els(h, "nets").length, 0, "a hamlet dries no nets");
});

// ----------------------------------------------------------- river foreground

test("a river town stands on the bank and anchors its bridge", () => {
  const g = composeProspect(makeInput({ kind: "town", onRiver: true }));
  assert.equal(g.ground.base, BASE_GROUND - RIVER_BANK_DROP, "river towns stand on the bank");
  assert.ok(g.water, "river composes water");
  assert.equal(g.water!.kind, "river");

  const bridge = one(g, "bridge");
  assert.equal(bridge.arches, 3);
  // Anchoring (#237 GO condition 4): the bridge-gate tower at the town bank.
  assert.equal(bridge.gateTower.form, "tower");
  assert.equal(bridge.gateTower.base, bridge.deckY + 1, "gate tower stands on the deck end");
  assert.ok(Math.abs(bridge.gateTower.x + 6 - bridge.x0) < 1e-9, "gate tower holds the town bank");
  assert.ok(bridge.waterY > bridge.deckY, "the deck rides above the water");
});

test("a river capital spans five arches", () => {
  const g = composeProspect(makeInput({ kind: "capital", onRiver: true }));
  assert.equal(one(g, "bridge").arches, 5);
});

test("the weir mill is keyed on river villages", () => {
  const g = composeProspect(makeInput({ kind: "village", onRiver: true }));
  assert.equal(els(g, "bridge").length, 0, "a village builds no bridge");
  one(g, "weir");
  const mill = one(g, "mill");
  assert.equal(mill.house.form, "gable");
  assert.ok(mill.wheel.r > 0, "the mill dips a wheel");

  const hamlet = composeProspect(makeInput({ kind: "hamlet", onRiver: true }));
  assert.equal(els(hamlet, "weir").length, 0, "no weir below village rank");
  assert.equal(els(hamlet, "mill").length, 0);
  const town = composeProspect(makeInput({ kind: "town", onRiver: true }));
  assert.equal(els(town, "mill").length, 0, "towns bridge, they do not mill");
});

test("harbor outranks river when a site is both", () => {
  const g = composeProspect(makeInput({ kind: "town", harbor: true, onRiver: true }));
  assert.equal(g.water!.kind, "sea", "the adaptive vantage opens from the sea");
  assert.equal(els(g, "bridge").length, 0);
  one(g, "quay");
});

// ----------------------------------------------------------- biome dressing

const band = (b: BiomeName): BiomeName[] => Array(FOREGROUND_SAMPLES).fill(b);

test("each biome dresses its named foreground", () => {
  const fields = composeProspect(makeInput({ foreground: band("grassland") }));
  assert.equal(one(fields, "fieldRows").rows.length, 4, "four furrow rows");
  const fieldTrees = one(fields, "trees");
  assert.equal(fieldTrees.species, "round");

  const forest = composeProspect(makeInput({ foreground: band("temperateForest") }));
  const round = one(forest, "trees");
  assert.equal(round.species, "round");
  assert.ok(round.items.length >= 8, "a forest crowds its trees");
  assert.equal(els(forest, "fieldRows").length, 0);

  const pines = composeProspect(makeInput({ foreground: band("taiga") }));
  assert.equal(one(pines, "trees").species, "pine");

  const marsh = composeProspect(makeInput({ foreground: band("marsh") }));
  assert.ok(one(marsh, "marshTufts").items.length >= 6);
  assert.ok(one(marsh, "ripples").items.length >= 2);
  assert.equal(marsh.walls.length, 0, "no wall stands in the fen");

  const strand = composeProspect(makeInput({ foreground: band("beach") }));
  assert.ok(one(strand, "dunes").items.length >= 3);
  assert.equal(one(strand, "trees").species, "palm");

  const scrub = composeProspect(makeInput({ foreground: band("tundra") }));
  assert.equal(one(scrub, "scrubRows").rows.length, 3);
});

test("the majority biome wins the dressing", () => {
  const mixed: BiomeName[] = [
    ...Array(20).fill("temperateForest"),
    ...Array(13).fill("grassland"),
  ];
  const g = composeProspect(makeInput({ foreground: mixed }));
  assert.equal(one(g, "trees").species, "round");
  assert.equal(els(g, "fieldRows").length, 0);
});

test("marsh villages stand on stilts", () => {
  const g = composeProspect(makeInput({ kind: "village", foreground: band("marsh") }));
  assert.equal(one(g, "stilts").posts.length, 6, "two posts under each of three houses");
  const town = composeProspect(makeInput({ kind: "town", foreground: band("marsh") }));
  assert.equal(els(town, "stilts").length, 0);
});

// ------------------------------------------------------------ ground & ridge

test("high ground composes the seat hill and the backdrop ridge", () => {
  const flat = composeProspect(
    makeInput({ siteRel: 0.1, backdrop: Array(BACKDROP_SAMPLES).fill(0.1) }),
  );
  assert.equal(flat.ground.rise, 0, "lowland stands on flat ground");
  assert.equal(flat.ridge, null, "a flat backdrop draws no ridge");

  const humped = Array.from({ length: BACKDROP_SAMPLES }, (_, i) => {
    const t = Math.abs(i - (BACKDROP_SAMPLES - 1) / 2) / ((BACKDROP_SAMPLES - 1) / 2);
    return 0.6 + 0.3 * (1 - t) - 0.6 * t;
  });
  const seat = composeProspect(
    makeInput({ kind: "seat", siteRel: 0.6, backdrop: humped }),
  );
  // #237 GO condition 5: a mountain seat stands on a filled hill mass.
  assert.ok(seat.ground.rise > 0, "the seat hill rises");
  assert.ok(seat.ridge !== null, "terrain behind the site draws the ridge");
  assert.equal(seat.ridge!.length, BACKDROP_SAMPLES, "the ridge is the transect polyline");
  const ys = seat.ridge!.map((p) => p.y);
  assert.ok(Math.min(...ys) < BASE_GROUND - 35, "the ridge climbs behind the town");
});

// -------------------------------------------------------------------- ruins

test("a ruin composes a field of collapse, not just broken rooflines", () => {
  const g = composeProspect(makeInput({ kind: "town", ruined: true, ruinedYear: 1361 }));
  assert.ok(g.masses.some((m) => m.broken), "broken silhouettes stand in the ruin");
  assert.ok(one(g, "rubble").stones.length >= 6, "rubble strews the ground");
  assert.ok(one(g, "beams").items.length >= 2, "fallen beams lean on the stumps");
  assert.ok(
    els(g, "trees").length + els(g, "marshTufts").length >= 2,
    "greenery reclaims the floors",
  );
  assert.equal(one(g, "birds").items.length, 6, "birds circle the ruin");
  // The heeling wall: two stubs, one leaning, the gate fallen.
  assert.equal(g.walls.length, 2, "the wall breaks to two stubs");
  assert.ok(g.walls.some((w) => w.heel !== 0), "one stub heels over");
  assert.ok(g.walls.every((w) => !w.gate), "no gate survives");
});

test("a ruined port keeps its masonry and loses its craft", () => {
  const g = composeProspect(makeInput({ kind: "town", harbor: true, ruined: true }));
  one(g, "quay");
  assert.equal(els(g, "mastRow").length, 0, "no masts moor at a dead port");
  assert.equal(els(g, "ship").length, 0);
  const v = composeProspect(makeInput({ kind: "village", onRiver: true, ruined: true }));
  one(v, "weir");
  assert.equal(els(v, "mill").length, 0, "the mill wheel is gone");
});

test("a drowned fen village sinks beneath the water sheet", () => {
  const g = composeProspect(
    makeInput({ kind: "village", ruined: true, foreground: band("marsh") }),
  );
  assert.equal(g.masses.length, 0, "the skyline is drowned");
  assert.equal(g.water!.kind, "drowned");
  const stubs = one(g, "drownedStubs");
  assert.ok(stubs.stubs.length >= 2, "stubs still stand in the water");
  assert.ok(stubs.stubs.some((s) => s.tilt !== 0), "one stub leans");
});

// ------------------------------------------------------- eras & invariants

test("before founding the ground is empty", () => {
  const g = composeProspect(
    makeInput({ kind: "town", harbor: true }),
    { era: "before-founding" },
  );
  assert.equal(g.masses.length, 0);
  assert.equal(g.walls.length, 0);
  assert.ok(g.water, "the sea was always there");
  const made = new Set([
    "quay", "mastRow", "ship", "mole", "beachedHulls", "jetty", "nets",
    "bridge", "weir", "mill", "stilts", "rubble", "beams", "drownedStubs",
    "fieldRows",
  ]);
  assert.ok(
    g.foreground.every((e) => !made.has(e.kind)),
    "nothing built stands before the founding",
  );
});

test("every composition is grounded and in frame", () => {
  const cases: ProspectInput[] = [
    makeInput({ kind: "capital", harbor: true }),
    makeInput({ kind: "seat", siteRel: 0.6 }),
    makeInput({ kind: "town", onRiver: true }),
    makeInput({ kind: "village", foreground: band("marsh") }),
    makeInput({ kind: "town", ruined: true }),
    makeInput({ kind: "hamlet" }),
  ];
  for (const input of cases) {
    const g = composeProspect(input);
    assert.deepEqual(
      groundingViolations(g),
      [],
      `${input.kind} h${String(input.harbor)} r${String(input.onRiver)} is grounded`,
    );
    for (const m of g.masses) {
      assert.ok(m.x >= VIEW_X0 - 2 && m.x + m.w <= VIEW_X1 + 2, "mass inside the view");
      assert.ok(m.base - m.h > 0 && m.base < PLATE_H, "mass inside the plate");
    }
  }
});

test("the grounding check bites on a floated or uncovered mass", () => {
  const g = composeProspect(makeInput({ kind: "capital" }));
  const firstIdx = g.masses.findIndex((m) => m.raise === 0);
  const floated: ProspectGeometry = {
    ...g,
    masses: g.masses.map((m, i) => (i === firstIdx ? { ...m, base: m.base - 3 } : m)),
  };
  assert.ok(groundingViolations(floated).length > 0, "a floated mass is reported");

  const backIdx = g.masses.findIndex((m) => m.raise > 0);
  assert.ok(backIdx >= 0, "a capital composes a raised back row");
  const escaped: ProspectGeometry = {
    ...g,
    masses: g.masses.map((m, i) =>
      i === backIdx ? { ...m, x: VIEW_X0 + 1, base: groundingBase(g, VIEW_X0 + 1, m) } : m,
    ),
  };
  assert.ok(
    groundingViolations(escaped).length > 0,
    "a raised mass outside the front cover is reported",
  );
});

/** Base that keeps the moved mass on the ground function, so the uncovered
 * case fails on COVER alone, not incidentally on the ground equation. */
function groundingBase(g: ProspectGeometry, x: number, m: Mass): number {
  return g.ground.base - m.raise;
}

// ----------------------------------------------------------- purity & bytes

test("the same input composes byte-identical geometry", () => {
  const input = makeInput({ kind: "capital", harbor: true, siteRel: 0.3 });
  const a = composeProspect(input);
  const b = composeProspect(structuredClone(input));
  assert.deepEqual(a, b);
  assert.equal(JSON.stringify(a), JSON.stringify(b));
  assert.deepEqual(JSON.parse(JSON.stringify(a)), a, "survives a JSON round trip");
});

test("geometry carries no style tokens", () => {
  const forbidden = /^(fill|stroke|color|font|opacity|ink|paper|style|hatch)/i;
  const walk = (v: unknown, path: string): void => {
    if (Array.isArray(v)) {
      v.forEach((item, i) => walk(item, `${path}[${i}]`));
    } else if (v !== null && typeof v === "object") {
      for (const [k, val] of Object.entries(v)) {
        assert.ok(!forbidden.test(k), `style-flavored key "${k}" at ${path}`);
        walk(val, `${path}.${k}`);
      }
    }
  };
  walk(composeProspect(makeInput({ kind: "capital", harbor: true, ruined: true })), "$");
});
