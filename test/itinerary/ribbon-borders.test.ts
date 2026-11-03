import test from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import { ribbonSvgFor } from "../../src/itinerary/finished.ts";
import { layoutRibbon, stripFor, type StripLayout } from "../../src/itinerary/dress/layout.ts";
import { BAND, stripBody } from "../../src/itinerary/dress/cloth.ts";
import { textBox, WIDTH_FACTOR } from "../../src/render/geometry.ts";
import { unescapeXml } from "../../src/render/svg.ts";
import { r1 } from "../../src/prospect/dress/context.ts";
import { STYLES } from "../../src/render/style.ts";
import type { RibbonInput } from "../../src/itinerary/input.ts";
import { attrsOf } from "../../test-support/dress-svg.ts";
import { namedJourney, stripNearestX } from "../../test-support/ribbon-fixtures.ts";
import { plateCaptions, sweepJourneys, type PlateCaptionLine } from "../../test-support/ribbon-captions.ts";
import { ribbonResultFor } from "../../src/site/explorer/ribbon-job.ts";
import { buildRibbonInput } from "../../src/itinerary/input.ts";

const world42 = generateWorld(defaultRecipe(42));
const world15 = generateWorld(defaultRecipe(15));
const world123 = generateWorld(defaultRecipe(123));
const default42 = ((): RibbonInput => {
  const road = ribbonResultFor(world42, { from: null, to: null, dress: "antique" });
  return buildRibbonInput(world42, road.fromIdx, road.toIdx)!;
})();

type BandName = { x: number; y: number; anchor: string; turn: string; name: string };

function bandNames(svg: string): BandName[] {
  return [...svg.matchAll(/<text ([^>]*transform="rotate\((-?90) [^)]*\)"[^>]*)>([^<]*)<\/text>/g)].map((m) => {
    const a = attrsOf(m[1] as string);
    return {
      x: Number(a.x),
      y: Number(a.y),
      anchor: a["text-anchor"] as string,
      turn: m[2] as string,
      name: unescapeXml(m[3] as string),
    };
  });
}

const bordersOf = (input: RibbonInput): Array<Extract<RibbonInput["events"][number], { kind: "border" }>> =>
  input.events.filter((e): e is Extract<typeof e, { kind: "border" }> => e.kind === "border");

test("a road that crosses no border keeps its realm at the plate's two ends", () => {
  const road = namedJourney(world42, "Laukuwelua", "Noloatatani");
  assert.equal(bordersOf(road).length, 0, "premise: it crosses no border");
  assert.equal(road.realmFrom, "The Chiefdom of Rekekoa");
  assert.equal(road.realmName, "The Chiefdom of Rekekoa", "premise: and arrives in the realm it left");
  const strips = layoutRibbon(road).strips;
  const first = strips[0]!;
  const last = strips.at(-1)!;
  const name = "The Chiefdom of Rekekoa";
  assert.deepEqual(
    bandNames(ribbonSvgFor(road, "antique")).map(({ x, turn, anchor, name: n }) => ({ x, turn, anchor, name: n })),
    [
      { x: r1(first.x0 + 4.6), turn: "-90", anchor: "middle", name },
      { x: r1(last.x0 + last.w - 4.6), turn: "90", anchor: "middle", name },
    ],
  );
  assert.deepEqual(bandNames(ribbonSvgFor({ ...road, realmFrom: null, realmName: null }, "antique")), []);
});

test("at a border the old realm's name ends just below the line and the new realm's begins just above it, on the band of the line's strip", () => {
  const svg = ribbonSvgFor(default42, "antique");
  assert.deepEqual(bandNames(svg), [
    { x: 371.6, y: 376, anchor: "start", turn: "-90", name: "The Hauwaiwa Atolls" },
    { x: 371.6, y: 386, anchor: "end", turn: "-90", name: "The Chiefdom of Rekekoa" },
  ]);
  assert.match(svg, /<path class="border" d="M[\d.]+ 381H/, "the line stands at y 381");
  const nurunui = bandNames(ribbonSvgFor(namedJourney(world42, "Laukuwelua", "Nurunui"), "antique"));
  assert.deepEqual(nurunui, [
    { x: 371.6, y: 708, anchor: "start", turn: "-90", name: "The Ratoa Atolls" },
    { x: 201.6, y: 222, anchor: "end", turn: "-90", name: "The Chiefdom of Rekekoa" },
  ]);
  const skeldil = bandNames(ribbonSvgFor(namedJourney(world15, "Stanbyl", "Skeldil"), "antique"));
  assert.deepEqual(
    skeldil.map(({ y, anchor, name }) => ({ y, anchor, name })),
    [
      { y: 688.6, anchor: "start", name: "The Tsardom of Gyksvu" },
      { y: 128, anchor: "end", name: "The Vlylgro Voivodeship" },
    ],
  );
});

const lengthOf = (name: string): number => textBox(0, 0, name, 7.6, "start", WIDTH_FACTOR.mixed, 1.2).w;

function spanOf(n: BandName): [number, number] {
  const len = lengthOf(n.name);
  if (n.anchor === "start") return [n.y - len, n.y];
  if (n.anchor === "end") return [n.y, n.y + len];
  return [n.y - len / 2, n.y + len / 2];
}

test("every band name lies on its strip's band between the strip's ends, no two meet, and the ink plate draws none", () => {
  const journeys = [...sweepJourneys().map((j) => j.input), namedJourney(world123, "Tauwoamo", "Laupehau")];
  let names = 0;
  let borderless = 0;
  for (const input of journeys) {
    const layout = layoutRibbon(input);
    const withBorder = new Set(bordersOf(input).map((e) => stripFor(layout, e.dist)?.index));
    const read = bandNames(ribbonSvgFor(input, "antique")).map((n) => ({
      ...n,
      strip: stripNearestX(layout.strips, n.x),
    }));
    const where = `${input.fromName} to ${input.toName}`;
    for (const n of read) {
      const [a, b] = spanOf(n);
      assert.ok(
        a >= n.strip.y0 + 6 - 0.06 && b <= n.strip.y0 + n.strip.h - 6 + 0.06,
        `${where}: ${n.name} spans ${a} to ${b}`,
      );
      names++;
      if (!withBorder.has(n.strip.index)) borderless++;
    }
    read.forEach((n, i) =>
      read.slice(i + 1).forEach((m) => {
        if (n.strip.index !== m.strip.index) return;
        const [a, b] = spanOf(n);
        const [c, d] = spanOf(m);
        assert.ok(!(a < d && c < b), `${where}: ${n.name} and ${m.name} meet on strip ${n.strip.index}`);
      }),
    );
    assert.deepEqual(bandNames(ribbonSvgFor(input, "ink")), [], `${where}: ink draws no band name`);
  }
  assert.ok(names >= 140, `the sweep reads names to measure: ${names}`);
  assert.ok(borderless >= 10, `and some stand on a strip with no border: ${borderless}`);
  const five = bandNames(ribbonSvgFor(namedJourney(world123, "Tauwoamo", "Laupehau"), "antique"));
  assert.equal(five.length, 5, "seed 123's three borders name five");
  assert.equal(
    five.filter((n) => n.name === "The Chiefdom of Nopauha").length,
    1,
    "the Nopauha name that would meet itself is not drawn",
  );
});

type Run = { readonly a: number; readonly b: number; readonly y: number; readonly strip: StripLayout };
type Rose = { readonly x: number; readonly y: number; readonly r: number };

function runsOf(
  svg: string,
  input: RibbonInput,
): { paths: string[]; runs: Run[]; layout: ReturnType<typeof layoutRibbon> } {
  const layout = layoutRibbon(input);
  const drawn = bordersOf(input).filter((e) => stripFor(layout, e.dist) !== null);
  const paths = [...svg.matchAll(/<path class="border"[^>]*>/g)].map((m) => m[0]);
  assert.equal(paths.length, drawn.length, "one path to a drawn border");
  const runs = paths.flatMap((tag, i) => {
    const strip = stripFor(layout, (drawn[i] as { dist: number }).dist) as StripLayout;
    const d = attrsOf(tag).d as string;
    return [...d.matchAll(/M(-?[\d.]+) (-?[\d.]+)H(-?[\d.]+)/g)].map((m) => ({
      a: Number(m[1]),
      b: Number(m[3]),
      y: Number(m[2]),
      strip,
    }));
  });
  return { paths, runs, layout };
}

function rosesOf(svg: string, dress: "antique" | "ink"): Rose[] {
  const radius = dress === "antique" ? "15" : "13.4";
  return [...svg.matchAll(/<g transform="translate\((-?[\d.]+) (-?[\d.]+)\)"><circle cx="0" cy="0" r="([\d.]+)"/g)]
    .filter((m) => m[3] === radius)
    .map((m) => ({ x: Number(m[1]), y: Number(m[2]), r: Number(radius) + 0.45 }));
}

type Dress = "antique" | "ink";
type PlateRose = Rose & { readonly strip: StripLayout };

function checkRun(run: Run, dress: Dress, roses: ReadonlyArray<PlateRose>, where: string): void {
  const body = stripBody(run.strip);
  const lo = dress === "antique" ? body.left(run.y) + BAND : run.strip.x0 + 3;
  const hi = dress === "antique" ? body.right(run.y) - BAND : run.strip.x0 + run.strip.w - 3;
  assert.ok(
    run.a >= lo - 0.06 && run.b <= hi + 0.06,
    `${where}: a run ${run.a} to ${run.b} lies between ${lo} and ${hi}`,
  );
  for (const rose of roses.filter((r) => r.strip === run.strip && Math.abs(run.y - r.y) < r.r)) {
    const half = Math.sqrt(rose.r * rose.r - (run.y - rose.y) ** 2);
    assert.ok(run.b <= rose.x - half + 0.06 || run.a >= rose.x + half - 0.06, `${where}: a run enters its rose`);
  }
}

function lettersOnRuns(
  svg: string,
  layout: ReturnType<typeof layoutRibbon>,
  runs: ReadonlyArray<Run>,
): PlateCaptionLine[] {
  return plateCaptions(svg, layout.strips).flatMap((cap) =>
    cap.lines.filter((line) =>
      runs.some(
        (run) =>
          run.strip === cap.strip &&
          line.box.y - 1.94 <= run.y &&
          run.y <= line.box.y + line.box.h + 1.94 &&
          line.box.x <= run.b &&
          line.box.x + line.box.w >= run.a,
      ),
    ),
  );
}

test("every drawn border is ruled across its strip in the dress's border ink, steps round every rose, and runs under lettering that stands on its backing", () => {
  for (const dress of ["antique", "ink"] as const) {
    const style = STYLES[dress];
    let drawnBorders = 0;
    let meetsRose = 0;
    let onLine = 0;
    for (const { input } of sweepJourneys()) {
      const svg = ribbonSvgFor(input, dress);
      const { paths, runs, layout } = runsOf(svg, input);
      drawnBorders += paths.length;
      const where = `${dress} ${input.fromName} to ${input.toName}`;
      for (const tag of paths) {
        const a = attrsOf(tag);
        assert.equal(a.stroke, style.borderStroke, `${where}: border ink`);
        assert.equal(a["stroke-dasharray"], style.borderDash.join(" "), `${where}: border dash`);
        assert.equal(a["stroke-opacity"], String(style.borderOpacity), `${where}: border opacity`);
      }
      const roses = rosesOf(svg, dress).map((r) => ({ ...r, strip: stripNearestX(layout.strips, r.x) }));
      assert.equal(roses.length, layout.strips.length, `${where}: one rose to a strip`);
      for (const run of runs) checkRun(run, dress, roses, where);
      meetsRose += new Set(
        runs.filter((r) => roses.some((o) => o.strip === r.strip && Math.abs(r.y - o.y) < o.r)).map((r) => r.strip),
      ).size;
      for (const line of lettersOnRuns(svg, layout, runs)) {
        onLine++;
        assert.ok(line.backed, `${where}: "${line.text}" stands on a border line without its backing`);
      }
    }
    assert.ok(drawnBorders >= 30, `${dress}: the sweep draws borders: ${drawnBorders}`);
    assert.ok(meetsRose >= 1, `${dress}: some line meets its strip's rose: ${meetsRose}`);
    assert.ok(onLine >= 20, `${dress}: some lettering stands on a line: ${onLine}`);
  }
});
