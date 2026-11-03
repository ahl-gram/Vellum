import test from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import { ribbonSvgFor } from "../../src/itinerary/finished.ts";
import { layoutRibbon, RIBBON_H, RIBBON_MARGIN, RIBBON_W, stripPos } from "../../src/itinerary/dress/layout.ts";
import { CELLS_PER_LEAGUE } from "../../src/render/layers/scalebar.ts";
import { WIDTH_FACTOR } from "../../src/render/geometry.ts";
import { r1 } from "../../src/prospect/dress/context.ts";
import { attrsOf } from "../../test-support/dress-svg.ts";
import { BAND, stripBody } from "../../src/itinerary/dress/cloth.ts";
import { STYLES } from "../../src/render/style.ts";
import { capitalJourneys, namedJourney } from "../../test-support/ribbon-fixtures.ts";

const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const SWEEP_SEEDS = [99, 15, 42];
const PLATE_INNER_RULE = RIBBON_MARGIN - 14 + 4;
const GAMBOGE = STYLES.antique.ribbonLimner!.gamboge;

const worlds = SWEEP_SEEDS.map((seed) => ({ seed, world: generateWorld(defaultRecipe(seed)) }));
const sweep = worlds.flatMap(({ world }) => capitalJourneys(world));
const road42 = namedJourney(worlds.find((w) => w.seed === 42)!.world, "Laukuwelua", "Homaitani");
const road15 = namedJourney(worlds.find((w) => w.seed === 15)!.world, "Stanbyl", "Svidsvikov");

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

type Numeral = { readonly n: number; readonly x: number; readonly y: number; readonly halo: Record<string, string> };

function numeralsOf(svg: string): Numeral[] {
  const out: Numeral[] = [];
  for (const m of svg.matchAll(
    /(?:<(?:circle|ellipse) ([^>]*)\/>)?<text ([^>]*font-size="5\.2"[^>]*)>(\d+)<\/text>/g,
  )) {
    const a = attrsOf(m[2] as string);
    out.push({ n: Number(m[3]), x: Number(a.x), y: Number(a.y), halo: attrsOf(m[1] ?? "") });
  }
  return out;
}

test("every league is numbered on the road's centreline on antique", () => {
  for (const input of [road42, road15]) {
    const strips = layoutRibbon(input).strips;
    const numerals = numeralsOf(ribbonSvgFor(input, "antique"));
    const whole = Math.floor(input.totalLeagues);
    assert.deepEqual(
      numerals.map((v) => v.n).sort((a, b) => a - b),
      Array.from({ length: whole }, (_, i) => i + 1),
      `${input.fromName} to ${input.toName}: leagues 1 to ${whole} are each numbered once, and no other number is`,
    );
    for (const v of numerals) {
      const near = strips.some((s) => {
        const p = stripPos(s, v.n * CELLS_PER_LEAGUE);
        return Math.abs(p.sx - v.x) <= 0.1 && Math.abs(p.sy - (v.y - 1.9)) <= 0.1;
      });
      assert.ok(near, `league ${v.n} stands on the road's centreline`);
    }
  }
});

test("every league's halo is wider than its numeral", () => {
  const numerals = numeralsOf(ribbonSvgFor(road15, "antique"));
  assert.ok(
    numerals.some((v) => v.n === 100) && numerals.some((v) => v.n === 115),
    "premise: leagues 100 to 115 are numbered",
  );
  for (const v of numerals) {
    const half = Number(v.halo.rx ?? v.halo.r);
    const need = (String(v.n).length * 5.2 * WIDTH_FACTOR.mixed) / 2 + 0.6;
    assert.ok(half >= need, `league ${v.n}: halo half-width ${half} under the numeral's ${need.toFixed(2)}`);
  }
});

test("each strip's rose turns with its strip's needle", () => {
  const paper = STYLES.antique.land;
  const vermilion = STYLES.antique.limner!.vermilion;
  for (const input of [road42, road15]) {
    const svg = ribbonSvgFor(input, "antique");
    for (const strip of layoutRibbon(input).strips) {
      const group = `<g transform="rotate(${r1(strip.needleDeg)})">`;
      const turned = new RegExp(
        `${escapeRegExp(group)}<path d="[^"]*" fill="${paper}"[^>]*/><path d="[^"]*" fill="${vermilion}"`,
      );
      assert.ok(
        turned.test(svg),
        `${input.fromName} to ${input.toName}, strip ${strip.index}: the paper star and the vermilion star ride ${group}`,
      );
    }
  }
});
