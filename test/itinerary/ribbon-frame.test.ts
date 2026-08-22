import test from "node:test";
import assert from "node:assert/strict";
import { generateWorld, defaultRecipe } from "../../src/world/generate.ts";
import { buildRibbonInput, type RibbonInput } from "../../src/itinerary/input.ts";
import { ribbonSvgFor } from "../../src/itinerary/finished.ts";
import { layoutRibbon, STRIP_PAD } from "../../src/itinerary/dress/layout.ts";
import { ROAD_HALF } from "../../src/itinerary/dress/strip.ts";
import { roadMask, roadReachable } from "../../src/itinerary/route.ts";
import { STYLES } from "../../src/render/style.ts";
import type { World } from "../../src/world/types.ts";

// #427 item 1, the skeptic's blocking find on PR #425: the strip overlap was a flat 0.75 cells
// against a 16px pad, so a short journey (few cells per strip, so many px per cell) sampled road
// far past the strip it belonged to and drew the ink off the sheet. Measured 2026-08-22 on this
// branch: with the fix reverted, seed 99 Mialiscove to Con puts road ink 45.40px below strip 1's
// frame; with the fix, the worst overshoot across 118 journeys is 0.40px, which is the casing's
// own half-width leaning on the frame stroke. The tolerance below is that half-width, so the
// guard still bites the regression by a factor of ~20.

const SEEDS = [99, 15, 42];

type RoadShape = { readonly kind: string; readonly pts: ReadonlyArray<readonly [number, number]> };

/** Every shape the strip renderer strokes in the road's ink, tagged by which of the three it is. */
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

test("no road ink escapes its strip frame, on any journey, on any seed", () => {
  let checked = 0;
  let shapes = 0;
  let worst = 0;
  let worstAt = "";
  for (const { seed, world } of worlds) {
    for (const input of journeysOf(world)) {
      const layout = layoutRibbon(input);
      const svg = ribbonSvgFor(input, "antique");
      for (const shape of roadShapes(svg, STYLES.antique.road)) {
        const head = shape.pts[0];
        if (!head) continue;
        const strip = layout.strips.find((s) => head[0] >= s.x0 - 30 && head[0] <= s.x0 + s.w + 30);
        if (!strip) continue;
        shapes++;
        for (const [x, y] of shape.pts) {
          const over = Math.max(
            strip.x0 - x,
            x - (strip.x0 + strip.w),
            strip.y0 - y,
            y - (strip.y0 + strip.h),
            0,
          );
          if (over > worst) {
            worst = over;
            worstAt = `seed ${seed} ${input.fromName} to ${input.toName}, strip ${strip.index}, ${shape.kind} at ${x},${y}`;
          }
        }
      }
      checked++;
    }
  }
  assert.ok(checked >= 60, `the sweep is real: ${checked} journeys`);
  assert.ok(shapes >= 500, `and it found road ink to measure: ${shapes} shapes`);
  assert.ok(
    worst <= ROAD_HALF,
    `road ink must stay within its strip frame, give or take its own casing (${ROAD_HALF}px). Worst ${worst.toFixed(2)}px: ${worstAt}`,
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
  const layout = layoutRibbon(input);
  assert.ok(
    STRIP_PAD / layout.pxPerCell < 0.75,
    "it is still short enough to be the case that broke",
  );
  for (const shape of roadShapes(ribbonSvgFor(input, "antique"), STYLES.antique.road)) {
    const head = shape.pts[0];
    if (!head) continue;
    const strip = layout.strips.find((s) => head[0] >= s.x0 - 30 && head[0] <= s.x0 + s.w + 30);
    if (!strip) continue;
    for (const [, y] of shape.pts) {
      assert.ok(
        y >= strip.y0 - ROAD_HALF && y <= strip.y0 + strip.h + ROAD_HALF,
        `strip ${strip.index} keeps its ink: ${y} outside [${strip.y0}, ${strip.y0 + strip.h}]`,
      );
    }
  }
});

test("two presses of the same journey are byte-identical (the unit twin of e2e RB7)", () => {
  const world = worlds[0]!.world;
  const input = journeysOf(world)[0]!;
  for (const dress of ["antique", "ink"] as const) {
    assert.equal(ribbonSvgFor(input, dress), ribbonSvgFor(input, dress), `${dress} presses the same`);
  }
  // Same process, same libm: this pins the engine's own statefulness, not cross-platform drift.
  // The fork keys in fork-keys.test.ts are what buy that.
  assert.notEqual(
    ribbonSvgFor(input, "antique"),
    ribbonSvgFor(input, "ink"),
    "the two dresses are genuinely different scrolls",
  );
});
