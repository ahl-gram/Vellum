import test from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import type { RibbonInput } from "../../src/itinerary/input.ts";
import { ribbonSvgFor } from "../../src/itinerary/finished.ts";
import { layoutRibbon, STRIP_PAD, type StripLayout } from "../../src/itinerary/dress/layout.ts";
import { BAND, stripBody } from "../../src/itinerary/dress/cloth.ts";
import { capitalJourneys, namedJourney } from "../../test-support/ribbon-fixtures.ts";

// 2026-11-02, 77 journeys (seeds 99/15/42 plus the four extremes): painted casings 16.2 inside the hairline at worst, side roads 0.49 inside (seed 42 Laukuwelua to Naukoa, strip 2), the ends 1.26 past (seed 99 Taliport to Ceasairmere, strip 2); the plain frame 0.65 past (the same journey and strip). TOLERANCE and PAINTED_TOLERANCE are the casings' half-widths written out, not imported, so they cannot widen with the module they guard.

const SEEDS = [99, 15, 42];
const TOLERANCE = 2.3;
const PAINTED_TOLERANCE = 4.2;

type Dress = "antique" | "ink";
type RoadShape = { readonly kind: string; readonly pts: ReadonlyArray<readonly [number, number]> };

function roadShapes(svg: string): RoadShape[] {
  const out: RoadShape[] = [];
  for (const m of svg.matchAll(/<path ([^>]*?)\/>/g)) {
    const attrs = m[1] as string;
    if (!attrs.includes('class="road"')) continue;
    const dash = /stroke-dasharray="([^"]*)"/.exec(attrs)?.[1] ?? "none";
    const d = /d="([^"]*)"/.exec(attrs)?.[1] ?? "";
    const nums = (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
    const pts: Array<readonly [number, number]> = [];
    for (let i = 0; i + 1 < nums.length; i += 2) pts.push([nums[i] as number, nums[i + 1] as number]);
    out.push({ kind: dash === "0.2 3.4" ? "casing" : dash === "0.2 3" ? "branch" : "town span", pts });
  }
  return out;
}

const worlds = SEEDS.map((seed) => ({ seed, world: generateWorld(defaultRecipe(seed)) }));

function stripOf(layout: ReadonlyArray<StripLayout>, x: number): StripLayout | undefined {
  let best: StripLayout | undefined;
  for (const s of layout) {
    if (best === undefined || Math.abs(x - (s.x0 + s.w / 2)) < Math.abs(x - (best.x0 + best.w / 2))) best = s;
  }
  return best;
}

function pastOf(dress: Dress, strip: StripLayout, x: number, y: number): number {
  const endsPast = Math.max(strip.y0 - y, y - (strip.y0 + strip.h), 0);
  if (dress === "ink") {
    return Math.max(Math.max(strip.x0 - x, x - (strip.x0 + strip.w), endsPast) - TOLERANCE, 0);
  }
  const body = stripBody(strip);
  const sidePast = Math.max(body.left(y) + BAND - x, x - (body.right(y) - BAND), 0);
  return Math.max(sidePast, endsPast - PAINTED_TOLERANCE, 0);
}

function overshootOf(
  input: RibbonInput,
  dress: Dress,
): { worst: number; where: string; shapes: number; kinds: Map<string, number> } {
  const strips = layoutRibbon(input).strips;
  let worst = 0;
  let where = "";
  let shapes = 0;
  const kinds = new Map<string, number>();
  for (const shape of roadShapes(ribbonSvgFor(input, dress))) {
    const head = shape.pts[0];
    if (!head) continue;
    const strip = stripOf(strips, head[0]);
    if (!strip) continue;
    shapes++;
    kinds.set(shape.kind, (kinds.get(shape.kind) ?? 0) + 1);
    for (const [x, y] of shape.pts) {
      const past = pastOf(dress, strip, x, y);
      if (past > worst) {
        worst = past;
        where = `${input.fromName} to ${input.toName}, strip ${strip.index}, ${shape.kind} at ${x},${y}`;
      }
    }
  }
  return { worst, where, shapes, kinds };
}

test("no road ink escapes its strip, inside the painted hairlines on antique and the plain frame on ink, on any journey, on any seed", () => {
  for (const dress of ["antique", "ink"] as const) {
    let checked = 0;
    let shapes = 0;
    let worst = 0;
    let worstAt = "";
    const kinds = new Map<string, number>();
    for (const { seed, world } of worlds) {
      for (const input of capitalJourneys(world)) {
        const m = overshootOf(input, dress);
        shapes += m.shapes;
        for (const [k, n] of m.kinds) kinds.set(k, (kinds.get(k) ?? 0) + n);
        if (m.worst > worst) {
          worst = m.worst;
          worstAt = `seed ${seed} ${m.where}`;
        }
        checked++;
      }
    }
    assert.ok(checked >= 60, `${dress}: the sweep is real: ${checked} journeys`);
    assert.ok(shapes >= 500, `${dress}: and it found road ink to measure: ${shapes} shapes`);
    for (const kind of ["casing", "branch", "town span"]) {
      assert.ok((kinds.get(kind) ?? 0) > 0, `${dress}: and it found a ${kind} to measure`);
    }
    assert.equal(
      worst,
      0,
      `${dress}: road ink must stay inside its frame. Worst ${worst.toFixed(2)}px past: ${worstAt}`,
    );
  }
});

test("the sweep includes journeys short enough for the overlap clamp to bind, or it proves nothing", () => {
  let binding = 0;
  let total = 0;
  for (const { world } of worlds) {
    for (const input of capitalJourneys(world)) {
      total++;
      if (STRIP_PAD / layoutRibbon(input).pxPerCell < 0.75) binding++;
    }
  }
  assert.ok(
    binding > 0,
    `the fixed 0.75 overlap only overshoots when STRIP_PAD/pxPerCell < 0.75; ${binding} of ${total} journeys reach that case`,
  );
});

test("seed 99's Mialiscove to Con, the journey that first drew off the sheet, stays on it", () => {
  const world = worlds.find((w) => w.seed === 99)!.world;
  const input = namedJourney(world, "Mialiscove", "Con");
  assert.ok(STRIP_PAD / layoutRibbon(input).pxPerCell < 0.75, "it is still short enough to be the case that broke");
  for (const dress of ["antique", "ink"] as const) {
    const { worst, where, shapes } = overshootOf(input, dress);
    assert.ok(shapes > 0, `${dress}: it found road ink to measure`);
    assert.equal(worst, 0, `${dress}: worst ${worst.toFixed(2)}px past: ${where}`);
  }
});

test("the three journeys that lean hardest on the frame still hold", () => {
  // The measured worst cases of the all-pairs sweep, named outright; seed 2 is not loaded by the sweep above.
  const extremes = [
    { seed: 99, from: "Taliport", to: "Ceasairmere" },
    { seed: 15, from: "Stanbyl", to: "Gistel" },
    { seed: 2, from: "Skorsty", to: "Zakvigrad" },
  ];
  for (const { seed, from, to } of extremes) {
    const world = worlds.find((w) => w.seed === seed)?.world ?? generateWorld(defaultRecipe(seed));
    const input = namedJourney(world, from, to);
    for (const dress of ["antique", "ink"] as const) {
      const { worst, where, shapes } = overshootOf(input, dress);
      assert.ok(shapes > 0, `seed ${seed} ${dress}: it found road ink to measure`);
      assert.equal(worst, 0, `seed ${seed} ${dress}: worst ${worst.toFixed(2)}px past: ${where}`);
    }
  }
});

test("two presses of the same journey are byte-identical (the unit twin of e2e RB7)", () => {
  const world = worlds[0]!.world;
  const input = capitalJourneys(world)[0]!;
  for (const dress of ["antique", "ink"] as const) {
    assert.equal(ribbonSvgFor(input, dress), ribbonSvgFor(input, dress), `${dress} presses the same`);
  }
  // Same process, same libm: this pins statefulness, not cross-platform drift, which is fork-keys'.
  assert.notEqual(
    ribbonSvgFor(input, "antique"),
    ribbonSvgFor(input, "ink"),
    "the two dresses are genuinely different scrolls",
  );
});
