import { test } from "node:test";
import assert from "node:assert/strict";
import { STYLES } from "../../src/render/style.ts";
import { composeProspect } from "../../src/prospect/compose.ts";
import { FOREGROUND_SAMPLES } from "../../src/prospect/transect.ts";
import { bandOf, makeInput } from "../../test-support/prospect-fixtures.ts";
import {
  groundAt,
  type ForegroundElement,
  type ProspectGeometry,
} from "../../src/prospect/geometry.ts";
import {
  PROSPECT_DRESSES,
  foregroundNodes,
  prospectSvg,
  type ProspectDress,
} from "../../src/prospect/dress/plate.ts";
import { dressContext } from "../../src/prospect/dress/context.ts";
import { attrsOf, landPathD } from "../../test-support/dress-svg.ts";

/** The dress rounds coordinates to 0.1 at SVG emit (geometry.ts's "Sub 3
 * rounds at SVG emit"); tests locate elements by reproducing that rounding. */
const f = (v: number): string => String(Math.round(v * 10) / 10);

// Synthetic fixtures reach arms real worlds cannot (see the header of
// test-support/prospect-fixtures.ts) and, unlike world-sourced geometry,
// carry no libm ancestry, so their rendered bytes are platform-stable and
// safe to pin (the golden rule: never byte-compare across environments does
// not bite when no transcendental ever ran).
const FIXTURES: Record<string, ProspectGeometry> = {
  harborCapital: composeProspect(
    makeInput({
      kind: "capital",
      score: 6,
      harbor: true,
      foreground: bandOf(["beach", FOREGROUND_SAMPLES]),
    }),
  ),
  riverVillage: composeProspect(makeInput({ kind: "village", onRiver: true })),
  ruinedTown: composeProspect(makeInput({ kind: "town", ruined: true, ruinedYear: 1361 })),
  drownedVillage: composeProspect(
    makeInput({
      kind: "village",
      ruined: true,
      foreground: bandOf(["marsh", FOREGROUND_SAMPLES]),
    }),
  ),
  fieldsHamlet: composeProspect(makeInput({ kind: "hamlet" })),
};

// ------------------------------------------------------------ the two dresses

test("the ratified dresses are antique and ink, and only those render", () => {
  assert.deepEqual([...PROSPECT_DRESSES], ["antique", "ink"]);
  const g = FIXTURES.fieldsHamlet!;
  for (const dress of PROSPECT_DRESSES) {
    assert.ok(prospectSvg(g, STYLES[dress]).startsWith("<svg"), `${dress} renders`);
  }
  assert.throws(() => prospectSvg(g, STYLES.topographic), RangeError);
  assert.throws(() => prospectSvg(g, STYLES.nautical), RangeError);
});

// ------------------------------------------------- every ink is a style token

/** Every color literal a style owns, lowercased. */
function tokenColors(dress: ProspectDress): Set<string> {
  const style = STYLES[dress];
  const colors = new Set<string>();
  const walk = (v: unknown): void => {
    if (typeof v === "string" && v.startsWith("#")) colors.add(v.toLowerCase());
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v !== null && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(style);
  return colors;
}

test("every ink in every plate is sourced from render/style.ts tokens", () => {
  for (const [name, g] of Object.entries(FIXTURES)) {
    for (const dress of PROSPECT_DRESSES) {
      const svg = prospectSvg(g, STYLES[dress]);
      const found = svg.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
      const inks = found.filter((c) => /^#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3,5})?$/.test(c));
      assert.ok(inks.length >= 3, `${name}/${dress}: plate actually carries ink`);
      const allowed = tokenColors(dress);
      for (const c of inks) {
        assert.ok(allowed.has(c.toLowerCase()), `${name}/${dress}: ${c} is not a token`);
      }
    }
  }
});

// ------------------------------------- same shapes, different ink (#240 core)

test("swapping the dress changes only the ink: paper-filled solids are identical", () => {
  for (const [name, g] of Object.entries(FIXTURES)) {
    const antique = landPathD(prospectSvg(g, STYLES.antique), STYLES.antique.land);
    const ink = landPathD(prospectSvg(g, STYLES.ink), STYLES.ink.land);
    assert.ok(
      antique.length >= g.masses.length,
      `${name}: every mass renders a paper-filled solid (${antique.length} < ${g.masses.length})`,
    );
    assert.deepEqual(antique, ink, `${name}: composition is dress-invariant`);
  }
});

// --------------------------------------------------- layering and the ground

test("walls paint between the back row and the keep, the spike's layering", () => {
  const g = FIXTURES.harborCapital!;
  const backMass = g.masses.find((m) => m.raise > 4);
  const keep = g.masses.find((m) => m.form === "keep");
  const wall = g.walls[0];
  assert.ok(backMass && keep && wall, "fixture composes back row, keep, and wall");
  const svg = prospectSvg(g, STYLES.antique);
  const backAt = svg.indexOf(`M${f(backMass!.x)} ${f(backMass!.base)}`);
  const wallAt = svg.indexOf(`M${f(wall!.x0)} ${f(groundAt(g.ground, wall!.x0))}`);
  const keepAt = svg.indexOf(`M${f(keep!.x)} ${f(keep!.base)}`);
  assert.ok(backAt >= 0, "back-row mass outline found");
  assert.ok(wallAt >= 0, "curtain wall outline found");
  assert.ok(keepAt >= 0, "keep outline found");
  assert.ok(backAt < wallAt, "back row paints before the wall");
  assert.ok(wallAt < keepAt, "wall paints before the keep");
});

test("the ground line follows the sampled ground polyline", () => {
  const g = FIXTURES.fieldsHamlet!;
  const first = g.ground.line[0]!;
  const svg = prospectSvg(g, STYLES.antique);
  assert.ok(
    svg.includes(`M${f(first.x)} ${f(first.y)}`),
    "ground path starts at the first sampled point",
  );
});

test("a risen site fills its mound; a drowned plate draws no ground line", () => {
  const risen = composeProspect(makeInput({ siteRel: 0.6 }));
  assert.ok(risen.ground.rise > 0, "fixture actually rises");
  const svg = prospectSvg(risen, STYLES.antique);
  const moundStart = `M${f(29)} ${f(risen.ground.base + 3)}`;
  assert.ok(svg.includes(moundStart), "mound path closes down to the base line");

  const drowned = FIXTURES.drownedVillage!;
  const dsvg = prospectSvg(drowned, STYLES.antique);
  const lineStart = `M${f(drowned.ground.line[0]!.x)} ${f(drowned.ground.line[0]!.y)}`;
  assert.ok(!dsvg.includes(lineStart), "no ground line under the flood");
});

// ------------------------------------------------------------------ the water

test("the sea band wears the style's water tokens", () => {
  const g = FIXTURES.harborCapital!;
  const antique = prospectSvg(g, STYLES.antique);
  const oceanRects = [...antique.matchAll(/<rect\b[^>]*>/g)]
    .map((m) => attrsOf(m[0]!))
    .filter((a) => a.fill === STYLES.antique.ocean);
  assert.equal(oceanRects.length, 1, "antique paints one ocean sheet");
  assert.equal(oceanRects[0]!.y, f(g.water!.y0));
  const halo = [...antique.matchAll(/<path\b[^>]*>/g)]
    .map((m) => attrsOf(m[0]!))
    .filter((a) => a.stroke === STYLES.antique.waterline);
  assert.equal(halo.length, 3, "the 3-pass waterline halo");

  // ink's ocean IS its paper, so no sheet: the waterline alone carries it.
  const ink = prospectSvg(g, STYLES.ink);
  const inkRects = [...ink.matchAll(/<rect\b[^>]*>/g)]
    .map((m) => attrsOf(m[0]!))
    .filter((a) => a.fill === STYLES.ink.ocean && a.height !== undefined);
  const oceanSheet = inkRects.filter((a) => a.y === f(g.water!.y0));
  assert.equal(oceanSheet.length, 0, "ink paints no ocean sheet");
  assert.ok(ink.includes(`stroke="${STYLES.ink.coastStroke}"`), "ink keeps the coast stroke");
});

// ------------------------------------------------------------ ruin reads ruin

test("a broken mass renders a different silhouette than an intact one", () => {
  const g = FIXTURES.fieldsHamlet!;
  const broken: ProspectGeometry = {
    ...g,
    masses: g.masses.map((m, i) => (i === 0 ? { ...m, broken: true } : m)),
  };
  assert.notEqual(
    prospectSvg(g, STYLES.ink),
    prospectSvg(broken, STYLES.ink),
    "breaking a mass changes the plate",
  );
});

// ------------------------------------------- every foreground element has ink

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
  {
    kind: "quay",
    x0: 130,
    x1: 300,
    y: 238,
    bollards: [140, 215, 290],
    steps: { x: 282, y: 238, count: 3 },
    arcade: { x0: 138, x1: 240, arches: 4 },
  },
  { kind: "mastRow", masts: [{ x: 320, hullY: 248, mastH: 50 }] },
  { kind: "ship", x: 100, y: 260, s: 1.15 },
  { kind: "mole", rootX: 487, headX: 445, headY: 248 },
  { kind: "beachedHulls", hulls: [{ x: 200, y: 236, tilt: -7 }] },
  { kind: "jetty", x0: 330, y0: 237, x1: 394, y1: 244, posts: [{ x: 340, y: 239 }] },
  { kind: "nets", x: 138, y: 222 },
  {
    kind: "bridge",
    x0: 270,
    x1: 418,
    deckY: 227,
    waterY: 253,
    arches: 3,
    gateTower: { form: "tower", x: 264, w: 12, h: 22, base: 228, raise: 0, broken: false },
  },
  { kind: "weir", x0: 170, x1: 350, y: 239 },
  {
    kind: "mill",
    house: { form: "gable", x: 368, w: 22, h: 15, base: 267, raise: 0, broken: false },
    wheel: { cx: 364, cy: 259, r: 6 },
  },
  { kind: "rubble", stones: [{ x: 150, y: 231, s: 3 }] },
  { kind: "beams", items: [{ x: 170, y: 232, dx: 9, dy: -11 }] },
  {
    kind: "drownedStubs",
    stubs: [
      { x: 314, w: 12, h: 45, base: 250, tilt: -9 },
      { x: 208, w: 16, h: 23, base: 249, tilt: 0 },
    ],
  },
  { kind: "birds", items: [{ x: 200, y: 80, s: 0.8 }] },
  { kind: "seaSerpent", x: 97, y: 262, s: 0.55 },
];

test("every foreground kind, every tree species, renders at least one node", () => {
  const seen = new Set<string>();
  for (const dress of PROSPECT_DRESSES) {
    const c = dressContext(STYLES[dress]);
    for (const e of SAMPLE_ELEMENTS) {
      assert.ok(
        foregroundNodes(c, e).length > 0,
        `${e.kind}${"species" in e ? `:${e.species}` : ""} inks nothing in ${dress}`,
      );
      seen.add(e.kind);
    }
  }
  // The sample list itself must not rot: a kind added to the union without a
  // sample here would dodge the coverage claim. Kept honest by tsc too: the
  // renderer's switch is exhaustive with a never arm.
  const KINDS: Record<ForegroundElement["kind"], true> = {
    fieldRows: true,
    scrubRows: true,
    trees: true,
    marshTufts: true,
    dunes: true,
    ripples: true,
    stilts: true,
    quay: true,
    mastRow: true,
    ship: true,
    mole: true,
    beachedHulls: true,
    jetty: true,
    nets: true,
    bridge: true,
    weir: true,
    mill: true,
    rubble: true,
    beams: true,
    drownedStubs: true,
    birds: true,
    seaSerpent: true,
  };
  assert.deepEqual([...seen].sort(), Object.keys(KINDS).sort(), "every kind sampled");
});

// -------------------------------------------------------- determinism, pinned

function fnv1a(s: string): number {
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

// Pinned 2026-08-10 from a measured run (the compose-world.test.ts prospect
// convention). Synthetic fixtures only: their arithmetic is libm-free end to
// end, so the rounded bytes cannot drift across platforms. A deliberate dress
// change re-pins these with the cause named in the commit.
const PINNED: ReadonlyArray<{ fixture: string; dress: ProspectDress; sum: number }> = [
  { fixture: "harborCapital", dress: "antique", sum: 3614064183 },
  { fixture: "harborCapital", dress: "ink", sum: 3369968809 },
  { fixture: "riverVillage", dress: "antique", sum: 2999650680 },
  { fixture: "riverVillage", dress: "ink", sum: 742519168 },
  { fixture: "ruinedTown", dress: "antique", sum: 1173247544 },
  { fixture: "ruinedTown", dress: "ink", sum: 536177691 },
  { fixture: "drownedVillage", dress: "antique", sum: 300302567 },
  { fixture: "drownedVillage", dress: "ink", sum: 2399069377 },
  { fixture: "fieldsHamlet", dress: "antique", sum: 3410339942 },
  { fixture: "fieldsHamlet", dress: "ink", sum: 1133369068 },
];

test("the same (geometry, dress) yields byte-identical, pinned SVG", () => {
  for (const { fixture, dress, sum } of PINNED) {
    const g = FIXTURES[fixture]!;
    const a = prospectSvg(g, STYLES[dress]);
    const b = prospectSvg(g, STYLES[dress]);
    assert.equal(a, b, `${fixture}/${dress}: render is pure`);
    assert.equal(fnv1a(a), sum, `${fixture}/${dress}: pinned dress checksum`);
  }
});

// The byte pins above are only sound while the dress stays libm-free: one
// Math.sin and the rounded bytes can differ Mac-vs-CI (the golden rule's
// ~1e-13 drift). Guard the CLASS at the source, same contract geometry.ts
// states for the composer layer. Math.sqrt is exempt: IEEE requires it
// correctly rounded, so it cannot drift.
test("the dress layer stays libm-free and clock-free", async () => {
  const { readdir, readFile } = await import("node:fs/promises");
  const { fileURLToPath } = await import("node:url");
  const dir = fileURLToPath(new URL("../../src/prospect/dress/", import.meta.url));
  const files = (await readdir(dir)).filter((f) => f.endsWith(".ts"));
  assert.ok(files.length >= 2, "the dress layer exists");
  const banned =
    /Math\.(sin|cos|tan|asin|acos|atan|atan2|sinh|cosh|tanh|asinh|acosh|atanh|hypot|cbrt|log|log2|log10|log1p|exp|expm1|pow|random)\b|Date\.now|new Date/;
  for (const file of files) {
    const src = await readFile(dir + file, "utf8");
    const hit = src.match(banned);
    assert.equal(hit, null, `${file} calls ${hit?.[0]}, breaking cross-platform byte identity`);
  }
});
