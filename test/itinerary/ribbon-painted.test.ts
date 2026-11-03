import test from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import { ribbonSvgFor } from "../../src/itinerary/finished.ts";
import { layoutRibbon, RIBBON_H, RIBBON_MARGIN, RIBBON_W } from "../../src/itinerary/dress/layout.ts";
import { BAND, stripBody } from "../../src/itinerary/dress/cloth.ts";
import { STYLES } from "../../src/render/style.ts";
import { capitalJourneys, namedJourney } from "../../test-support/ribbon-fixtures.ts";

const SWEEP_SEEDS = [99, 15, 42];
const PLATE_INNER_RULE = RIBBON_MARGIN - 14 + 4;
const GAMBOGE = STYLES.antique.ribbonLimner!.gamboge;

const worlds = SWEEP_SEEDS.map((seed) => ({ seed, world: generateWorld(defaultRecipe(seed)) }));
const sweep = worlds.flatMap(({ world }) => capitalJourneys(world));
const road42 = namedJourney(worlds.find((w) => w.seed === 42)!.world, "Laukuwelua", "Homaitani");

function vertices(d: string): Array<readonly [number, number]> {
  const out: Array<readonly [number, number]> = [];
  for (const m of d.matchAll(/[ML](-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g)) out.push([Number(m[1]), Number(m[2])]);
  return out;
}

function shoelace(pts: ReadonlyArray<readonly [number, number]>): number {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i] as readonly [number, number];
    const [x2, y2] = pts[(i + 1) % pts.length] as readonly [number, number];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2;
}

test("every strip's cloth stays inside the plate frame's inner rule", () => {
  assert.ok(
    sweep.some((input) => layoutRibbon(input).strips.length === 7),
    "premise: some journey fills all seven strips",
  );
  for (const input of sweep) {
    for (const strip of layoutRibbon(input).strips) {
      const body = stripBody(strip);
      const where = `${input.fromName} to ${input.toName}, strip ${strip.index}`;
      assert.ok(
        strip.y0 >= PLATE_INNER_RULE && strip.y0 + strip.h <= RIBBON_H - PLATE_INNER_RULE,
        `${where}: ends inside`,
      );
      for (let y = strip.y0; y <= strip.y0 + strip.h; y++) {
        assert.ok(body.left(y) >= PLATE_INNER_RULE, `${where}: left edge ${body.left(y).toFixed(1)} at y ${y}`);
        assert.ok(
          body.right(y) <= RIBBON_W - PLATE_INNER_RULE,
          `${where}: right edge ${body.right(y).toFixed(1)} at y ${y}`,
        );
      }
    }
  }
});

test("each strip's two edge bands enclose the band they paint", () => {
  const svg = ribbonSvgFor(road42, "antique");
  const bands = [...svg.matchAll(/<path d="([^"]*)" fill="([^"]*)" fill-opacity="0.72"\/>/g)]
    .filter((m) => m[2] === GAMBOGE)
    .map((m) => m[1] as string);
  const strips = layoutRibbon(road42).strips;
  assert.equal(bands.length, strips.length * 2, "two gamboge bands to a strip");
  bands.forEach((d, i) => {
    const strip = strips[Math.floor(i / 2)]!;
    assert.ok(d.endsWith("Z"), `band ${i} closes`);
    const area = shoelace(vertices(d));
    assert.ok(
      area >= 0.9 * BAND * strip.h,
      `band ${i} encloses ${area.toFixed(0)}, a band ${BAND} wide is ${BAND * strip.h}`,
    );
  });
});
