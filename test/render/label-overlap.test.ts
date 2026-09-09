import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { glyphPoly, overlapFraction, polysOverlap, textNodes } from "../../test-support/label-geometry.ts";

// Ground truth is rebuilt from the SVG (test-support/label-geometry), deliberately NOT from spacedTextBox: the claim helper would be blind to a claim-vs-render disagreement; `chart` is only the test name.
const CASES = [
  { seed: 1619895893, chart: "The Whispering Reaches of Ciapa" },
  { seed: 3767410253, chart: "The Verdant Isle of Noca" },
] as const;

for (const { seed, chart } of CASES) {
  test(`realm and range names do not overlap on seed ${seed} (${chart})`, () => {
    const world = generateWorld(defaultRecipe(seed));
    const svg = renderMap(world, { style: "antique" });
    const nodes = textNodes(svg);

    const rangeName = world.names.range?.toUpperCase();
    assert.ok(rangeName, `fixture drift: seed ${seed} has no named mountain range`);
    const range = nodes.find((n) => n.text === rangeName);
    assert.ok(range, `the range label "${rangeName}" should be on the chart`);
    assert.ok(range.rotate, "the range label is drawn rotated along its ridge");

    const realmNames = new Set(world.names.realms.map((n) => n.toUpperCase()));
    const realms = nodes.filter((n) => realmNames.has(n.text));
    assert.ok(realms.length > 0, "realm names should be on the chart");

    const rangePoly = glyphPoly(range);
    const collisions = realms
      .filter((r) => polysOverlap(glyphPoly(r), rangePoly))
      .map((r) => r.text);

    assert.deepEqual(
      collisions,
      [],
      `realm names overlapping "${rangeName}": ${collisions.join(", ") || "(none)"}`,
    );
  });
}

test("every realm is still named once label boxes tell the truth", () => {
  const offenders: string[] = [];
  for (const { seed } of CASES) {
    const world = generateWorld(defaultRecipe(seed));
    const svg = renderMap(world, { style: "antique" });
    for (const name of world.names.realms) {
      if (!svg.includes(`>${name.toUpperCase()}</text>`)) offenders.push(`seed ${seed}: "${name}"`);
    }
  }
  assert.deepEqual(offenders, [], `unlabelled realms under the tighter arena: ${offenders.join(", ")}`);
});

test("the range label survives the tighter arena on both filed seeds", () => {
  const missing: number[] = [];
  for (const { seed } of CASES) {
    const world = generateWorld(defaultRecipe(seed));
    const svg = renderMap(world, { style: "antique" });
    if (world.names.range && !svg.includes(`>${world.names.range.toUpperCase()}</text>`)) {
      missing.push(seed);
    }
  }
  assert.deepEqual(missing, [], `range label dropped on seeds: ${missing.join(", ")}`);
});

// The metric mirrors #178's >= 15% bar; touching alone is sub-visual and not asserted.
const RIVER_CASES = [
  { seed: 4, note: "The Waters of Haiki over the village Kakau (46%)" },
  { seed: 6, note: "Wadi Qaar over THE SULTANATE OF ZAIMAZU (20%)" },
  { seed: 90, note: "zoryan: 14 rivers labelled, max graze ~12%, none buried (#235 re-curation)" },
] as const;

const RIVER_OVERLAP_THRESHOLD = 0.15;

for (const { seed, note } of RIVER_CASES) {
  test(`no river name buries a settlement, realm or range label on seed ${seed} (${note})`, () => {
    const world = generateWorld(defaultRecipe(seed));
    const svg = renderMap(world, { style: "antique" });
    const nodes = textNodes(svg);

    const riverNames = new Set(world.names.rivers.values());
    const rivers = nodes.filter((n) => riverNames.has(n.text));
    assert.ok(rivers.length > 0, `fixture drift: seed ${seed} draws no river labels`);
    const others = nodes.filter((n) => !riverNames.has(n.text));

    const collisions: string[] = [];
    for (const r of rivers) {
      const rp = glyphPoly(r);
      for (const o of others) {
        const f = overlapFraction(rp, glyphPoly(o));
        if (f >= RIVER_OVERLAP_THRESHOLD) {
          collisions.push(`"${r.text}" over "${o.text}" @ ${Math.round(f * 100)}%`);
        }
      }
    }

    assert.deepEqual(collisions, [], `river labels burying other labels: ${collisions.join("; ")}`);
  });
}

// Ruled 2026-07-12: a graze under RIVER_OVERLAP_THRESHOLD keeps its label. Measured true ink on seed 42: Roanono Falls 0%, Waters of Lalo 0%, River Potaule ~5% must label; Muku 31%, Naipaupai 21%, Roruke 63% stay dropped.
test("near-miss river names survive on seed 42 (a sub-15% graze keeps its label)", () => {
  const world = generateWorld(defaultRecipe(42));
  const svg = renderMap(world, { style: "antique" });
  const riverNames = new Set(world.names.rivers.values());
  const missing: string[] = [];
  for (const name of ["The Roanono Falls", "The Waters of Lalo", "River Potaule"]) {
    assert.ok(riverNames.has(name), `fixture drift: seed 42 no longer names "${name}"`);
    if (!svg.includes(`>${name}</tspan>`)) missing.push(name);
  }
  assert.deepEqual(missing, [], `near-miss river names dropped instead of kept: ${missing.join(", ")}`);
});

test("the graze tolerance still buries nothing: no seed-42 river overlaps a label >= 15%", () => {
  const world = generateWorld(defaultRecipe(42));
  const svg = renderMap(world, { style: "antique" });
  const nodes = textNodes(svg);
  const riverNames = new Set(world.names.rivers.values());
  const rivers = nodes.filter((n) => riverNames.has(n.text));
  assert.ok(rivers.length > 0, "fixture drift: seed 42 draws no river labels");
  const others = nodes.filter((n) => !riverNames.has(n.text));
  const collisions: string[] = [];
  for (const r of rivers) {
    for (const o of others) {
      const f = overlapFraction(glyphPoly(r), glyphPoly(o));
      if (f >= RIVER_OVERLAP_THRESHOLD) collisions.push(`"${r.text}" over "${o.text}" @ ${Math.round(f * 100)}%`);
    }
  }
  assert.deepEqual(collisions, [], `rivers burying labels >= 15%: ${collisions.join("; ")}`);
});

test("no seed-16 river buries a caps settlement name (honest caps claim, #195)", () => {
  const world = generateWorld(defaultRecipe(16));
  const svg = renderMap(world, { style: "antique" });
  const nodes = textNodes(svg);
  const riverNames = new Set(world.names.rivers.values());
  const rivers = nodes.filter((n) => riverNames.has(n.text));
  assert.ok(rivers.length > 0, "fixture drift: seed 16 draws no river labels");
  assert.ok(nodes.some((n) => n.text === "AELEIGLADE"), "fixture drift: seed 16 no longer labels AELEIGLADE");
  const others = nodes.filter((n) => !riverNames.has(n.text));
  const collisions: string[] = [];
  for (const r of rivers) {
    for (const o of others) {
      if (overlapFraction(glyphPoly(r), glyphPoly(o)) >= RIVER_OVERLAP_THRESHOLD) {
        collisions.push(`"${r.text}" over "${o.text}" @ ${Math.round(overlapFraction(glyphPoly(r), glyphPoly(o)) * 100)}%`);
      }
    }
  }
  assert.deepEqual(collisions, [], `seed-16 rivers burying labels >= 15%: ${collisions.join("; ")}`);
});
