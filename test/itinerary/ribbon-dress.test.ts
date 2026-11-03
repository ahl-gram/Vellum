import test from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import { ribbonSvgFor } from "../../src/itinerary/finished.ts";
import { ribbonDress } from "../../src/itinerary/dress/context.ts";
import { layoutRibbon } from "../../src/itinerary/dress/layout.ts";
import { STYLES, type MapStyle } from "../../src/render/style.ts";
import { capitalJourneys, namedJourney } from "../../test-support/ribbon-fixtures.ts";

const SWEEP_SEEDS = [99, 15, 42];
const DRESSES = ["antique", "ink"] as const;

const worlds = SWEEP_SEEDS.map((seed) => ({ seed, world: generateWorld(defaultRecipe(seed)) }));
const sweep = worlds.flatMap(({ world }) => capitalJourneys(world));
const seed42 = worlds.find((w) => w.seed === 42)!.world;
const road42 = namedJourney(seed42, "Laukuwelua", "Homaitani");

function ribbonTokens(s: MapStyle): Set<string> {
  return new Set(
    [
      s.paper,
      s.ink,
      s.inkSoft,
      s.land,
      s.road,
      s.river,
      ...(s.limner ? [s.limner.vermilion] : []),
      ...Object.values(s.ribbonLimner ?? {}),
    ].map((c) => c.toLowerCase()),
  );
}

const hexesIn = (svg: string): string[] => (svg.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).map((c) => c.toLowerCase());
const count = (svg: string, needle: string): number => svg.split(needle).length - 1;

test("the ribbon dresses in antique and ink alone, and only the antique is painted", () => {
  assert.notEqual(ribbonDress(STYLES.antique).paint, null, "the antique carries the limner's paint");
  assert.equal(ribbonDress(STYLES.ink).paint, null, "the ink dress is the plain impression");
  assert.throws(() => ribbonDress(STYLES.topographic), RangeError);
  assert.throws(() => ribbonDress(STYLES.nautical), RangeError);
});

test("every colour on every ribbon is a ribbon token, and the antique carries every pigment", () => {
  assert.ok(sweep.length >= 60, `the sweep is real: ${sweep.length} journeys`);
  const seen = new Set<string>();
  for (const dress of DRESSES) {
    const allowed = ribbonTokens(STYLES[dress]);
    for (const input of sweep) {
      const hexes = hexesIn(ribbonSvgFor(input, dress));
      assert.ok(hexes.length >= 3, `${dress} ${input.fromName} to ${input.toName}: the plate carries colour`);
      for (const c of hexes) {
        assert.ok(allowed.has(c), `${dress} ${input.fromName} to ${input.toName}: ${c} is not a ribbon token`);
        if (dress === "antique") seen.add(c);
      }
    }
  }
  const a = STYLES.antique;
  const pigments = [...Object.values(a.ribbonLimner!), a.limner!.vermilion, a.river, a.road].map((c) =>
    c.toLowerCase(),
  );
  for (const pigment of pigments) assert.ok(seen.has(pigment), `the antique sweep draws ${pigment} somewhere`);
});

test("the ink dress keeps the uncoloured impression", () => {
  const strips = layoutRibbon(road42).strips.length;
  const leagues = Math.floor(road42.totalLeagues);
  const ink = ribbonSvgFor(road42, "ink");
  assert.equal(count(ink, ">N</text>"), strips, "ink keeps the plain compass and its N, one a strip");
  assert.equal(count(ink, 'r="1.4"'), leagues, "ink keeps a dot at every league");
  assert.equal(count(ink, 'font-size="7"'), Math.floor(leagues / 5), "and a soft five at every fifth");
  const gamboge = `fill="${STYLES.antique.ribbonLimner!.gamboge}"`;
  for (const gone of ['font-size="5.2"', gamboge, "From Laukuwelua", "The Chiefdom of Rekekoa"]) {
    assert.equal(count(ink, gone), 0, `ink draws no ${gone}`);
  }
  const antique = ribbonSvgFor(road42, "antique");
  assert.ok(count(antique, "From Laukuwelua") > 0, "the antique holds the stages line");
  assert.ok(count(antique, 'font-size="5.2"') > 0, "and the numbered leagues");
  assert.equal(count(antique, ">N</text>"), 0, "and no plain compass");
  assert.equal(count(antique, 'r="1.4"'), 0, "and no league dots");
});
