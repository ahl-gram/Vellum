import { test } from "node:test";
import assert from "node:assert/strict";
import { STYLES, type MapStyle } from "../../src/render/style.ts";
import { el, renderSvg } from "../../src/render/svg.ts";
import { createRng } from "../../src/core/rng.ts";
import { composeProspect } from "../../src/prospect/compose.ts";
import { FOREGROUND_SAMPLES } from "../../src/prospect/transect.ts";
import { groundAt, type ForegroundElement, type Mass } from "../../src/prospect/geometry.ts";
import { massNodes } from "../../src/prospect/dress/buildings.ts";
import { foregroundNodes, PROSPECT_DRESSES } from "../../src/prospect/dress/plate.ts";
import { dressContext } from "../../src/prospect/dress/context.ts";
import { birdFlock, engraver, hatchNode, pt } from "../../src/prospect/dress/burin.ts";
import { foregroundEngraved, massNodesEngraved, shipEngraved, wallNodesEngraved } from "../../src/prospect/dress/townscape.ts";
import { flockBox, LIFT, massReach, shipRig, wallReach, type Box } from "../../src/prospect/dress/rise.ts";
import { finishedPlateSvg } from "../../src/prospect/finished.ts";
import { bandOf, makeInput } from "../../test-support/prospect-fixtures.ts";
import { inkExtent, outlinedSolids, tokenColors } from "../../test-support/dress-svg.ts";

/** The dress rounds coordinates to 0.1 at SVG emit; tests locate elements by reproducing that rounding. */
const f = (v: number): string => String(Math.round(v * 10) / 10);

// Synthetic inputs reach arms real worlds cannot (see test-support/prospect-fixtures.ts) and carry no libm ancestry, so their plates are platform-stable.
const DRESS_FIXTURES = {
  harborCapital: makeInput({ kind: "capital", score: 6, harbor: true, foreground: bandOf(["beach", FOREGROUND_SAMPLES]) }),
  riverVillage: makeInput({ kind: "village", onRiver: true }),
  ruinedTown: makeInput({ kind: "town", ruined: true, ruinedYear: 1361 }),
  drownedVillage: makeInput({ kind: "village", ruined: true, foreground: bandOf(["marsh", FOREGROUND_SAMPLES]) }),
  fieldsHamlet: makeInput({ kind: "hamlet" }),
};
const YEAR = 1400;
const plate = (name: keyof typeof DRESS_FIXTURES, style: MapStyle): string => finishedPlateSvg(DRESS_FIXTURES[name], style, YEAR);

test("the ratified dresses are antique and ink, and only those render", () => {
  assert.deepEqual([...PROSPECT_DRESSES], ["antique", "ink"]);
  for (const dress of PROSPECT_DRESSES) assert.ok(plate("fieldsHamlet", STYLES[dress]).startsWith("<svg"), `${dress} renders`);
  assert.throws(() => plate("fieldsHamlet", STYLES.topographic), RangeError);
  assert.throws(() => plate("fieldsHamlet", STYLES.nautical), RangeError);
});

test("every ink in every plate is a style token, a limner's wash or a heraldic tincture, never a literal", () => {
  for (const name of Object.keys(DRESS_FIXTURES) as Array<keyof typeof DRESS_FIXTURES>) {
    for (const dress of PROSPECT_DRESSES) {
      const inks = (plate(name, STYLES[dress]).match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).filter((c) => /^#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3,5})?$/.test(c));
      assert.ok(inks.length >= 3, `${name}/${dress}: the plate carries ink`);
      const allowed = tokenColors(STYLES[dress]);
      for (const c of inks) assert.ok(allowed.has(c.toLowerCase()), `${name}/${dress}: ${c} is not a token`);
    }
  }
});

test("swapping the dress changes the ink and the washes, never a shape: every outlined solid is the same in both dresses", () => {
  for (const name of Object.keys(DRESS_FIXTURES) as Array<keyof typeof DRESS_FIXTURES>) {
    const antique = outlinedSolids(plate(name, STYLES.antique));
    const ink = outlinedSolids(plate(name, STYLES.ink));
    assert.ok(antique.length > 20, `${name}: the plate draws its solids (${antique.length})`);
    assert.deepEqual(antique, ink, `${name}: composition is dress-invariant`);
  }
  assert.ok(plate("harborCapital", STYLES.antique).includes(`fill="${STYLES.antique.limner!.water}"`), "premise: the antique carries the limner's water wash, which the ink does not");
});

test("walls paint between the back row and the keep, as the round layers them", () => {
  const g = composeProspect(DRESS_FIXTURES.harborCapital);
  const backMass = g.masses.find((m) => m.raise > 4), keep = g.masses.find((m) => m.form === "keep"), wall = g.walls[0];
  assert.ok(backMass && keep && wall, "fixture composes back row, keep and wall");
  const svg = plate("harborCapital", STYLES.antique);
  const at = (s: string): number => svg.indexOf(s);
  const backAt = at(`M${f(backMass.x)} ${f(backMass.base)}V`), wallAt = at(`M${f(wall.x0)} ${f(groundAt(g.ground, wall.x0))}L`), keepAt = at(`M${f(keep.x)} ${f(keep.base)}V`);
  assert.ok(backAt >= 0 && wallAt >= 0 && keepAt >= 0, JSON.stringify({ backAt, wallAt, keepAt }));
  assert.ok(backAt < wallAt && wallAt < keepAt, "back row, then the wall, then the keep");
});

test("a risen site fills its mound down to its base line", () => {
  const risen = makeInput({ siteRel: 0.6 });
  const g = composeProspect(risen);
  assert.ok(g.ground.rise > 0, "premise: the fixture rises");
  assert.ok(finishedPlateSvg(risen, STYLES.antique, YEAR).includes(`M${f(g.ground.line[0]!.x)} ${f(g.ground.base + 3)}L`), "the mound closes down to its base line");
});

const MASSES: ReadonlyArray<{ readonly m: Mass; readonly intact: string; readonly broken: string; readonly what: string }> = [
  { m: { form: "gable", x: 100, w: 20, h: 18, base: 232, raise: 0, broken: false }, what: "gable", intact: `L${f(110)} ${f(232 - 18 - Math.min(9, 18 * 0.45))}`, broken: `L${f(100)} ${f(232 - 18 + 18 * 0.25)}` },
  { m: { form: "tower", x: 200, w: 10, h: 30, base: 232, raise: 0, broken: false }, what: "tower", intact: `M${f(199.5)} ${f(202)}`, broken: `L${f(203.5)} ${f(202 + 30 * 0.38)}` },
  { m: { form: "keep", x: 240, w: 34, h: 40, base: 232, raise: 0, broken: false }, what: "keep", intact: "l4 1.4l-4 1.4", broken: `L${f(240 + 34 * 0.2)} ${f(192 + 40 * 0.4)}` },
];

// Silhouette-specific on purpose: a whole-plate notEqual is satisfied by the foot rubble alone, so each form family's silhouette is guarded, in today's dress (the river craft still draws with it) and in E's engraved one.
test("a broken mass loses its intact silhouette, form by form, in both mass dresses", () => {
  const today = (m: Mass): string => massNodes(dressContext(STYLES.ink), m, 1.2).map(renderSvg).join("");
  const engraved = (m: Mass): string => massNodesEngraved(engraver(STYLES.ink), m, 1.2).map(renderSvg).join("");
  for (const [dress, render] of [["today", today], ["engraved", engraved]] as const) {
    for (const { m, intact, broken, what } of MASSES) {
      assert.ok(render(m).includes(intact), `${dress}: an intact ${what} keeps its silhouette`);
      const ruin = render({ ...m, broken: true });
      assert.ok(!ruin.includes(intact), `${dress}: a broken ${what} loses it`);
      assert.ok(ruin.includes(broken), `${dress}: a broken ${what} jags`);
    }
  }
});

const SAMPLE_ELEMENTS: ReadonlyArray<ForegroundElement> = [
  { kind: "fieldRows", rows: [{ y: 242, x0: 60, x1: 460 }] },
  { kind: "scrubRows", rows: [{ y: 244, x0: 70, x1: 450 }] },
  { kind: "trees", species: "round", items: [{ x: 100, y: 250, s: 1.5 }] },
  { kind: "trees", species: "pine", items: [{ x: 120, y: 250, s: 1.5 }] },
  { kind: "trees", species: "palm", items: [{ x: 140, y: 250, s: 2 }] },
  { kind: "marshTufts", items: [{ x: 160, y: 250, s: 1 }] },
  { kind: "dunes", items: [{ x: 180, y: 226, s: 1.5 }] },
  { kind: "ripples", items: [{ x: 200, y: 250, s: 0.8 }] },
  { kind: "stilts", posts: [{ x: 220, y: 232 }] },
  { kind: "quay", x0: 130, x1: 300, y: 238, bollards: [140, 215, 290], steps: { x: 282, y: 238, count: 3 }, arcade: { x0: 138, x1: 240, arches: 4 } },
  { kind: "mastRow", masts: [{ x: 320, hullY: 248, mastH: 50 }] },
  { kind: "ship", x: 100, y: 260, s: 1.15 },
  { kind: "mole", rootX: 487, headX: 445, headY: 248 },
  { kind: "beachedHulls", hulls: [{ x: 200, y: 236, tilt: -7 }] },
  { kind: "jetty", x0: 330, y0: 237, x1: 394, y1: 244, posts: [{ x: 340, y: 239 }] },
  { kind: "nets", x: 138, y: 222 },
  { kind: "bridge", x0: 270, x1: 418, deckY: 227, waterY: 253, arches: 3, gateTower: { form: "tower", x: 264, w: 12, h: 22, base: 228, raise: 0, broken: false } },
  { kind: "weir", x0: 170, x1: 350, y: 239 },
  { kind: "mill", house: { form: "gable", x: 368, w: 22, h: 15, base: 267, raise: 0, broken: false }, wheel: { cx: 364, cy: 259, r: 6 } },
  { kind: "rubble", stones: [{ x: 150, y: 231, s: 3 }] },
  { kind: "beams", items: [{ x: 170, y: 232, dx: 9, dy: -11 }] },
  { kind: "drownedStubs", stubs: [{ x: 314, w: 12, h: 45, base: 250, tilt: -9 }, { x: 208, w: 16, h: 23, base: 249, tilt: 0 }] },
  { kind: "birds", items: [{ x: 200, y: 80, s: 0.8 }] },
  { kind: "seaSerpent", x: 97, y: 262, s: 0.55 },
];

const RIPPLES_STAND_DOWN: ReadonlySet<ForegroundElement["kind"]> = new Set(["ripples"]);

test("every foreground kind, every tree species, inks at least one node in today's dress and in E's", () => {
  const seen = new Set<string>();
  for (const dress of PROSPECT_DRESSES) {
    for (const e of SAMPLE_ELEMENTS) {
      const label = `${e.kind}${"species" in e ? `:${e.species}` : ""}`;
      assert.ok(foregroundNodes(dressContext(STYLES[dress]), e).length > 0, `${label} inks nothing in today's ${dress}`);
      const engraved = foregroundEngraved(engraver(STYLES[dress]), e, createRng(1));
      assert.ok(engraved.nodes.length > 0 || RIPPLES_STAND_DOWN.has(e.kind), `${label} inks nothing in E's ${dress}`);
      seen.add(e.kind);
    }
  }
  // The sample list must not rot: a kind added to the union without a sample here would dodge the coverage claim (tsc keeps it honest via the renderers' exhaustive arms).
  const KINDS: Record<ForegroundElement["kind"], true> = {
    fieldRows: true, scrubRows: true, trees: true, marshTufts: true, dunes: true, ripples: true, stilts: true, quay: true, mastRow: true, ship: true, mole: true,
    beachedHulls: true, jetty: true, nets: true, bridge: true, weir: true, mill: true, rubble: true, beams: true, drownedStubs: true, birds: true, seaSerpent: true,
  };
  assert.deepEqual([...seen].sort(), Object.keys(KINDS).sort(), "every kind sampled");
});

test("a mass's reach, which a bird keeps clear of, holds every mark it engraves, roof, spire, battlements and pennant, and a wall's holds its towers", () => {
  const e = engraver(STYLES.antique);
  const STROKE = 0.7;
  const holds = (reach: Box, svg: string, what: string): void => {
    const ink = inkExtent(svg);
    const inside = ink.x0 - STROKE >= reach.x0 && ink.x1 + STROKE <= reach.x1 && ink.y0 - STROKE >= reach.y0 - LIFT && ink.y1 + STROKE <= reach.y1 - LIFT + STROKE;
    assert.ok(inside, `${what}: ink ${JSON.stringify(ink)} reaches past ${JSON.stringify({ ...reach, y0: reach.y0 - LIFT, y1: reach.y1 - LIFT })}`);
  };
  for (const form of ["gable", "ridge", "tower", "spire", "keep"] as const) {
    for (const [w, h] of [[8, 10], [16, 24], [30, 48], [46, 70]] as const) {
      for (const broken of [false, true]) {
        const m: Mass = { form, x: 100, w, h, base: 200, raise: 0, broken };
        holds(massReach(m), renderSvg(el("g", {}, massNodesEngraved(e, m, 1.2, form === "spire"))), `${form} ${w}x${h}${broken ? " broken" : ""}`);
      }
    }
  }
  for (const rise of [0, 14]) {
    for (const [x0, x1] of [[60, 140], [200, 330]] as const) {
      for (const gate of [false, true]) {
        const ground = { base: 200, rise, line: [] };
        const wall = { x0, x1, h: 9, gate, heel: 0 };
        holds(wallReach(ground, wall), renderSvg(el("g", {}, wallNodesEngraved(e, ground, wall))), `wall ${x0} to ${x1}, rise ${rise}${gate ? ", gated" : ""}`);
      }
    }
  }
});

test("a drowned plate draws no ground line under the flood, where a dry one draws its own", () => {
  const lineOf = (input: ReturnType<typeof makeInput>): string => {
    const line = composeProspect(input).ground.line;
    return `d="M${pt(line[0]!)}L${pt(line[1]!)}`;
  };
  const drowned = makeInput({ kind: "village", ruined: true, foreground: bandOf(["marsh", FOREGROUND_SAMPLES]) });
  const dry = makeInput({ kind: "hamlet" });
  assert.equal(composeProspect(drowned).water?.kind, "drowned", "premise: the fixture drowns");
  assert.ok(finishedPlateSvg(dry, STYLES.antique, 1300).includes(lineOf(dry)), "the control: a dry plate draws the line this probe reads");
  for (const style of [STYLES.antique, STYLES.ink]) assert.ok(!finishedPlateSvg(drowned, style, 1300).includes(lineOf(drowned)), `${style.name}: no ground line under the flood`);
});

test("a flock's box holds every bird it draws, and a ship's rig box holds its masts and pennants from the waterline up, so what keeps clear of the boxes above the water keeps clear of the ink", () => {
  const e = engraver(STYLES.antique);
  const STROKE = 0.5;
  const within = (ink: Box, b: Box, what: string, below = true): void =>
    assert.ok(ink.x0 - STROKE >= b.x0 && ink.x1 + STROKE <= b.x1 && ink.y0 - STROKE >= b.y0 && (!below || ink.y1 <= b.y1 + STROKE), `${what}: ink ${JSON.stringify(ink)} reaches past ${JSON.stringify(b)}`);
  for (let k = 0; k < 40; k++) {
    const n = 2 + (k % 6);
    within(inkExtent(renderSvg(birdFlock(e, 200, 120, n, createRng(k)))), flockBox(200, 120, n), `a flock of ${n}, draw ${k}`);
  }
  for (const s of [0.6, 0.8, 1, 1.15, 1.4]) {
    for (const great of [false, true]) {
      const rig = shipRig(200, 150, s, great);
      within(inkExtent(renderSvg(el("g", {}, shipEngraved(e, 200, 150, s, great, createRng(7))))), { ...rig, y0: rig.y0 - LIFT, y1: rig.y1 - LIFT }, `a ${great ? "great " : ""}ship at ${s}`, false);
    }
  }
});

test("hatching is clipped by its own scanlines and names no clip path, so many plates share one document", () => {
  const svg = renderSvg(hatchNode(engraver(STYLES.antique), [{ x: 0, y: 0 }, { x: 40, y: 0 }, { x: 30, y: 25 }, { x: 5, y: 30 }], 0.6, 2));
  assert.ok(svg.includes("<path") && !/clip/i.test(svg), svg.slice(0, 120));
});
