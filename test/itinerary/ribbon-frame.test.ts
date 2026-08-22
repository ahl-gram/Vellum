import test from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import { buildRibbonInput, type RibbonInput } from "../../src/itinerary/input.ts";
import { ribbonSvgFor } from "../../src/itinerary/finished.ts";
import { layoutRibbon, STRIP_PAD } from "../../src/itinerary/dress/layout.ts";
import { roadMask, roadReachable } from "../../src/itinerary/route.ts";
import { STYLES } from "../../src/render/style.ts";
import type { World } from "../../src/world/types.ts";

// #427 item 1. Pre-fix, a flat 0.75-cell overlap against a 16px pad put seed 99's Mialiscove to Con
// 45.40px past strip 1's frame. Post-fix the worst overshoot over all 1457 connected pairs across
// seeds 2/15/42/99/123 is 0.60px, the road casing's own half-width leaning on the frame stroke.
// TOLERANCE is that half-width, written out rather than imported from the renderer: a guard that
// reads its own tolerance from the module it guards widens silently when that module widens.

const SEEDS = [99, 15, 42];
const TOLERANCE = 2.3;

type RoadShape = { readonly kind: string; readonly pts: ReadonlyArray<readonly [number, number]> };

function roadShapes(svg: string, roadColor: string): RoadShape[] {
  const out: RoadShape[] = [];
  for (const m of svg.matchAll(/<path ([^>]*?)\/>/g)) {
    const attrs = m[1] as string;
    if (!attrs.includes(`stroke="${roadColor}"`)) continue;
    const dash = /stroke-dasharray="([^"]*)"/.exec(attrs)?.[1] ?? "none";
    const d = /d="([^"]*)"/.exec(attrs)?.[1] ?? "";
    const nums = (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
    const pts: Array<readonly [number, number]> = [];
    for (let i = 0; i + 1 < nums.length; i += 2) pts.push([nums[i] as number, nums[i + 1] as number]);
    out.push({ kind: dash === "0.2 3.4" ? "casing" : dash === "0.2 3" ? "branch" : "waypoint-span", pts });
  }
  return out;
}

function journeysOf(world: World): RibbonInput[] {
  const mask = roadMask(world);
  const capital = world.settlements.findIndex((s) => s.kind === "capital");
  return roadReachable(world, mask, capital)
    .map((to) => buildRibbonInput(world, capital, to))
    .filter((i): i is RibbonInput => i !== null);
}

const worlds = SEEDS.map((seed) => ({ seed, world: generateWorld(defaultRecipe(seed)) }));

function overshootOf(input: RibbonInput): { worst: number; where: string; shapes: number } {
  const layout = layoutRibbon(input);
  let worst = 0;
  let where = "";
  let shapes = 0;
  for (const shape of roadShapes(ribbonSvgFor(input, "antique"), STYLES.antique.road)) {
    const head = shape.pts[0];
    if (!head) continue;
    const strip = layout.strips.find((s) => head[0] >= s.x0 - 30 && head[0] <= s.x0 + s.w + 30);
    if (!strip) continue;
    shapes++;
    for (const [x, y] of shape.pts) {
      const over = Math.max(strip.x0 - x, x - (strip.x0 + strip.w), strip.y0 - y, y - (strip.y0 + strip.h), 0);
      if (over > worst) {
        worst = over;
        where = `${input.fromName} to ${input.toName}, strip ${strip.index}, ${shape.kind} at ${x},${y}`;
      }
    }
  }
  return { worst, where, shapes };
}

test("no road ink escapes its strip frame, on any journey, on any seed", () => {
  let checked = 0;
  let shapes = 0;
  let worst = 0;
  let worstAt = "";
  for (const { seed, world } of worlds) {
    for (const input of journeysOf(world)) {
      const m = overshootOf(input);
      shapes += m.shapes;
      if (m.worst > worst) {
        worst = m.worst;
        worstAt = `seed ${seed} ${m.where}`;
      }
      checked++;
    }
  }
  assert.ok(checked >= 60, `the sweep is real: ${checked} journeys`);
  assert.ok(shapes >= 500, `and it found road ink to measure: ${shapes} shapes`);
  assert.ok(
    worst <= TOLERANCE,
    `road ink must stay within its strip frame, give or take its own casing (${TOLERANCE}px). Worst ${worst.toFixed(2)}px: ${worstAt}`,
  );
});

test("the sweep includes journeys short enough for the overlap clamp to bind, or it proves nothing", () => {
  let binding = 0;
  let total = 0;
  for (const { world } of worlds) {
    for (const input of journeysOf(world)) {
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
  const from = world.settlements.findIndex((s) => s.name === "Mialiscove");
  const to = world.settlements.findIndex((s) => s.name === "Con");
  assert.ok(from >= 0 && to >= 0, "seed 99 still names both ends of the reference journey");
  const input = buildRibbonInput(world, from, to);
  assert.ok(input, "and still joins them by road");
  assert.ok(
    STRIP_PAD / layoutRibbon(input).pxPerCell < 0.75,
    "it is still short enough to be the case that broke",
  );
  const { worst, where } = overshootOf(input);
  assert.ok(worst <= TOLERANCE, `worst ${worst.toFixed(2)}px: ${where}`);
});

test("the three journeys that lean hardest on the frame still hold", () => {
  // Measured top of the all-pairs sweep. Two of the three set out from their seed's capital
  // (Taliport is not, Stanbyl and Mialiscove are), so this is not a non-capital sweep; it is the
  // measured worst cases named outright, including seed 2, which the sweep above does not load.
  const extremes = [
    { seed: 99, from: "Taliport", to: "Ceasairmere" },
    { seed: 15, from: "Stanbyl", to: "Gistel" },
    { seed: 2, from: "Skorsty", to: "Zakvigrad" },
  ];
  for (const { seed, from, to } of extremes) {
    const world = worlds.find((w) => w.seed === seed)?.world ?? generateWorld(defaultRecipe(seed));
    const a = world.settlements.findIndex((s) => s.name === from);
    const b = world.settlements.findIndex((s) => s.name === to);
    assert.ok(a >= 0 && b >= 0, `seed ${seed} still names ${from} and ${to}`);
    const input = buildRibbonInput(world, a, b);
    assert.ok(input, `seed ${seed} still joins ${from} to ${to} by road`);
    const { worst, where } = overshootOf(input);
    assert.ok(worst <= TOLERANCE, `seed ${seed} worst ${worst.toFixed(2)}px: ${where}`);
  }
});

test("two presses of the same journey are byte-identical (the unit twin of e2e RB7)", () => {
  const world = worlds[0]!.world;
  const input = journeysOf(world)[0]!;
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
