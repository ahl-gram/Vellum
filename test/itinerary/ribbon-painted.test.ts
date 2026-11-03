import test from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import { ribbonSvgFor } from "../../src/itinerary/finished.ts";
import { layoutRibbon, RIBBON_H, RIBBON_MARGIN, RIBBON_W, stripPos } from "../../src/itinerary/dress/layout.ts";
import { CELLS_PER_LEAGUE } from "../../src/render/layers/scalebar.ts";
import { WIDTH_FACTOR } from "../../src/render/geometry.ts";
import { r1 } from "../../src/prospect/dress/context.ts";
import { BIOMES } from "../../src/climate/biomes.ts";
import type { StripLayout } from "../../src/itinerary/dress/layout.ts";
import { attrsOf, inkExtent } from "../../test-support/dress-svg.ts";
import { BAND, stripBody } from "../../src/itinerary/dress/cloth.ts";
import { STYLES } from "../../src/render/style.ts";
import { capitalJourneys, namedJourney, stripNearestX } from "../../test-support/ribbon-fixtures.ts";

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

const PAINT = STYLES.antique.ribbonLimner!;
const SEA_WASH = new RegExp(`<path d="([^"]*)" fill="${PAINT.azuriteWash}" fill-opacity="0.55"`, "g");
const WAVE = new RegExp(
  `<path d="([^"]*)" fill="none" stroke="${STYLES.antique.river}" stroke-width="0.9" stroke-opacity="0.8"`,
  "g",
);
const RIVER_BAND = new RegExp(`<path d="([^"]*)" fill="none" stroke="${PAINT.azuriteWash}" stroke-width="7"`, "g");

const dOf = (svg: string, re: RegExp): string[] => [...svg.matchAll(re)].map((m) => m[1] as string);
const headOf = (d: string): readonly [number, number] => vertices(d)[0] as readonly [number, number];

function shorePoints(d: string): Array<readonly [number, number]> {
  const out: Array<readonly [number, number]> = [];
  for (const m of d.matchAll(/Q(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g)) out.push([Number(m[1]), Number(m[2])]);
  return out.slice(1);
}

function withinHairlines(strip: StripLayout, x0: number, x1: number, y: number, what: string): void {
  const body = stripBody(strip);
  assert.ok(
    x0 >= body.left(y) + BAND - 0.1,
    `${what}: left end ${x0} past the hairline ${(body.left(y) + BAND).toFixed(1)}`,
  );
  assert.ok(
    x1 <= body.right(y) - BAND + 0.1,
    `${what}: right end ${x1} past the hairline ${(body.right(y) - BAND).toFixed(1)}`,
  );
}

function seaLiesWhereTheSamplesSay(): void {
  const strips = layoutRibbon(road42).strips;
  const last = strips.at(-1)!;
  const oceanR = last.samples.filter((s) => s.biomeR === BIOMES.ocean).length;
  assert.ok(oceanR >= 2, `premise: the last strip's samples run on ocean on the right (${oceanR})`);
  assert.ok(
    last.samples.every((s) => s.biomeL !== BIOMES.ocean),
    "premise: and never on the left",
  );
  const meanX = last.pts.reduce((a, p) => a + p.sx, 0) / last.pts.length;
  const washes = dOf(ribbonSvgFor(road42, "antique"), SEA_WASH).filter(
    (d) => stripNearestX(strips, headOf(d)[0]) === last,
  );
  assert.ok(washes.length >= 1, "seed 42's last strip holds a sea wash");
  for (const d of washes)
    for (const [x] of shorePoints(d))
      assert.ok(x > meanX, `a shore point ${x} lies right of the road ${meanX.toFixed(1)}`);
  const dry = namedJourney(worlds.find((w) => w.seed === 99)!.world, "Mialiscove", "Selea");
  assert.ok(
    dry.samples.every((s) => s.biomeL !== BIOMES.ocean && s.biomeR !== BIOMES.ocean),
    "premise: no sample of Mialiscove to Selea is ocean",
  );
  assert.equal(dOf(ribbonSvgFor(dry, "antique"), SEA_WASH).length, 0, "and it holds no sea wash");
}

/** The whole outline of a closed M, L, Q path, the closing edge included, walked in steps under a unit: a segment between two vertices on the cloth can still leave it. */
function outlineOf(d: string): Array<readonly [number, number]> {
  const out: Array<readonly [number, number]> = [];
  let start: readonly [number, number] = [0, 0];
  let cur: readonly [number, number] = [0, 0];
  const walk = (to: readonly [number, number], at: (t: number) => readonly [number, number]): void => {
    for (let t = 0; t <= 1; t += 0.01) out.push(at(t));
    cur = to;
  };
  for (const m of d.matchAll(/([MLQ])([^MLQZ]*)|Z/g)) {
    const n = (m[2] ?? "").split(/[ ,]/).map(Number);
    const from = cur;
    if (m[1] === undefined)
      walk(start, (t) => [from[0] + (start[0] - from[0]) * t, from[1] + (start[1] - from[1]) * t]);
    else if (m[1] === "M") start = cur = [n[0] as number, n[1] as number];
    else if (m[1] === "L") {
      const to: readonly [number, number] = [n[0] as number, n[1] as number];
      walk(to, (t) => [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t]);
    } else {
      const c = [n[0] as number, n[1] as number] as const;
      const to: readonly [number, number] = [n[2] as number, n[3] as number];
      walk(to, (t) => [
        (1 - t) ** 2 * from[0] + 2 * (1 - t) * t * c[0] + t * t * to[0],
        (1 - t) ** 2 * from[1] + 2 * (1 - t) * t * c[1] + t * t * to[1],
      ]);
    }
  }
  return out;
}

function withinCloth(strip: StripLayout, x: number, y: number, what: string): void {
  const body = stripBody(strip);
  assert.ok(
    x >= body.left(y) - 0.1,
    `${what}: ${x} at y ${y} lies past the cloth's left edge ${body.left(y).toFixed(1)}`,
  );
  assert.ok(
    x <= body.right(y) + 0.1,
    `${what}: ${x} at y ${y} lies past the cloth's right edge ${body.right(y).toFixed(1)}`,
  );
}

function seaStaysOnTheCloth(): void {
  const coast = namedJourney(worlds.find((w) => w.seed === 42)!.world, "Laukuwelua", "Paukilua");
  const first = layoutRibbon(coast).strips[0]!;
  const body = stripBody(first);
  const runsPast = first.samples.some(
    (s, i) =>
      s.biomeR === BIOMES.ocean &&
      first.samples[i + 1]?.biomeR === BIOMES.ocean &&
      (first.pts[i]?.sx ?? 0) + 26 > body.right(first.pts[i]?.sy ?? 0) - BAND,
  );
  assert.ok(
    runsPast,
    "premise, the witness: a right-side ocean run on strip 0 where the road's x plus 26 passes the hairline",
  );
  let shores = 0;
  let waves = 0;
  for (const input of [coast, road15, ...sweep]) {
    const strips = layoutRibbon(input).strips;
    const svg = ribbonSvgFor(input, "antique");
    const where = `${input.fromName} to ${input.toName}`;
    for (const d of dOf(svg, SEA_WASH)) {
      const strip = stripNearestX(strips, headOf(d)[0]);
      for (const [x, y] of shorePoints(d)) withinHairlines(strip, x, x, y, `${where}, a shore point`);
      for (const [x, y] of outlineOf(d)) withinCloth(strip, x, y, `${where}, strip ${strip.index}, a wash outline`);
      shores++;
    }
    for (const d of dOf(svg, WAVE)) {
      const [, wy] = headOf(d);
      const e = inkExtent(`<path d="${d}"/>`);
      withinHairlines(stripNearestX(strips, headOf(d)[0]), e.x0, e.x1, wy, `${where}, a wave`);
      waves++;
    }
  }
  assert.ok(shores >= 20 && waves >= 40, `the sweep draws seas to measure: ${shores} shores, ${waves} waves`);
}

test("the sea lies beside the road where the samples say, and stays on the cloth", () => {
  seaLiesWhereTheSamplesSay();
  seaStaysOnTheCloth();
});

test("a river crossing's band stays between the hairlines", () => {
  let bands = 0;
  let onRoad15 = 0;
  for (const input of [road15, ...sweep]) {
    const strips = layoutRibbon(input).strips;
    for (const d of dOf(ribbonSvgFor(input, "antique"), RIVER_BAND)) {
      const e = inkExtent(`<path d="${d}"/>`);
      const [hx, sy] = headOf(d);
      withinHairlines(stripNearestX(strips, hx), e.x0, e.x1, sy, `${input.fromName} to ${input.toName}, a river band`);
      bands++;
      if (input === road15) onRoad15++;
    }
  }
  assert.ok(onRoad15 >= 1, "premise: seed 15's road carries a crossing");
  assert.ok(bands >= 10, `the sweep draws crossings to measure: ${bands}`);
});

const BAND_NAME = /<text x="([^"]*)" y="([^"]*)"[^>]*transform="rotate\((-?90) [^)]*\)"[^>]*>([^<]*)<\/text>/g;
const bandNames = (svg: string): Array<{ x: number; turn: string; name: string }> =>
  [...svg.matchAll(BAND_NAME)].map((m) => ({ x: Number(m[1]), turn: m[3] as string, name: m[4] as string }));

test("the realm names ride the outer bands, the departure's first and the arrival's last", () => {
  assert.equal(road42.realmFrom, "The Chiefdom of Rekekoa", "premise: the departure lies in the Chiefdom of Rekekoa");
  assert.equal(road42.realmName, "The Hauwaiwa Atolls", "and the arrival in the Hauwaiwa Atolls");
  const strips = layoutRibbon(road42).strips;
  const first = strips[0]!;
  const last = strips.at(-1)!;
  assert.deepEqual(bandNames(ribbonSvgFor(road42, "antique")), [
    { x: r1(first.x0 + 4.6), turn: "-90", name: "The Chiefdom of Rekekoa" },
    { x: r1(last.x0 + last.w - 4.6), turn: "90", name: "The Hauwaiwa Atolls" },
  ]);
  const unnamed = { ...road42, realmFrom: null, realmName: null };
  assert.deepEqual(bandNames(ribbonSvgFor(unnamed, "antique")), [], "a journey with no realm names none");
});

test("every caption is drawn above every strip", () => {
  for (const input of [road42, road15]) {
    for (const dress of ["antique", "ink"] as const) {
      const svg = ribbonSvgFor(input, dress);
      const lines = [...svg.matchAll(/<text [^>]*text-anchor="(?:start|end)"/g)];
      const where = `${input.fromName} to ${input.toName}, ${dress}`;
      assert.ok(lines.length >= input.events.length, `${where}: every event is captioned (${lines.length} lines)`);
      assert.ok(
        (lines[0]?.index ?? -1) > svg.lastIndexOf('class="road"'),
        `${where}: every caption lies after the last strip's road, so no strip covers it`,
      );
    }
  }
  assert.ok(ribbonSvgFor(road42, "antique").includes(">to Lamahai</text>"), "the side road to Lamahai is captioned");
});
