import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld, regionTitle, windowAround } from "../../src/world/region.ts";
import { createProjection, marginFor } from "../../src/render/transform.ts";
import { STYLES, type StyleName } from "../../src/render/style.ts";
import { createRng } from "../../src/core/rng.ts";
import { createLabelArena, type RenderCtx } from "../../src/render/context.ts";
import { renderMap } from "../../src/render/map-renderer.ts";
import { cartoucheLayer, cornerChoice, planCartouche } from "../../src/render/layers/cartouche.ts";
import { cornerSeats, landCellsUnder } from "../../src/render/layers/cartouche-seat.ts";
import { planScalebar, scalebarBacking, scalebarSeat } from "../../src/render/layers/scalebar.ts";
import { boxesOverlap, type Box } from "../../src/render/geometry.ts";
import type { SvgNode } from "../../src/render/svg.ts";
import type { World, WorldRecipe } from "../../src/world/types.ts";

const FOUR =
  "Where the grey kings sleep under the hill and the river runs backward to the sea, the fishermen of the long coast keep the old count of tides and the older count of the dead.";
const FIVE = `${FOUR} No stranger is welcome there.`;
const SIX = `${FOUR} No stranger is welcome there, and none who comes ever leaves.`;
const COUNT_20: Partial<WorldRecipe> = { mapType: "archipelago", islands: 20 };
const COUNT_100: Partial<WorldRecipe> = { mapType: "archipelago", islands: 100 };
const STYLE_NAMES: ReadonlyArray<StyleName> = ["antique", "topographic", "ink", "nautical"];

function ctxOf(world: World, style: StyleName = "antique"): RenderCtx {
  const proj = createProjection(world.elev.w, world.elev.h, 1500, marginFor(1500));
  return {
    world,
    style: STYLES[style],
    proj,
    coastRings: [],
    elevSpan: 1,
    rng: createRng(world.recipe.seed).fork("render"),
    realmTint: world.realms.seats.map((_, i) => i),
    labels: createLabelArena(),
  };
}

const worlds = new Map<string, World>();
function worldOf(seed: number, overrides: Partial<WorldRecipe> = {}): World {
  const key = JSON.stringify([seed, overrides]);
  const known = worlds.get(key);
  if (known !== undefined) return known;
  const made = generateWorld(defaultRecipe(seed, overrides));
  worlds.set(key, made);
  return made;
}

const homePaper = (ctx: RenderCtx): Box => scalebarBacking(scalebarSeat(ctx), 1);

function drawnBox(svg: string, layer: "layer-cartouche" | "layer-scalebar"): Box {
  const found = svg.match(
    new RegExp(`id="${layer}"><rect x="([\\d.]+)" y="([\\d.]+)" width="([\\d.]+)" height="([\\d.]+)"`),
  );
  assert.ok(found, `the drawn sheet carries ${layer}`);
  const [x, y, w, h] = found.slice(1).map(Number) as [number, number, number, number];
  return { x, y, w, h };
}

// 2026-11-13: the counts are Issue #1109's plate read at 1500 px, matched by the planner's script; a cell flips only where it ties the sea level within float drift, the exposure test/world/land-mask-pins.test.ts already accepts.
test("landCellsUnder counts the land under today's title as the Issue #1109 plate read counted it", () => {
  const cases: Array<[Partial<WorldRecipe>, number]> = [
    [COUNT_20, 334],
    [{ ...COUNT_20, isleSize: "varied" }, 145],
    [COUNT_100, 29],
  ];
  for (const [overrides, cells] of cases) {
    const ctx = ctxOf(worldOf(1, overrides));
    assert.equal(landCellsUnder(ctx, cornerChoice(ctx)), cells, JSON.stringify(overrides));
  }
});

test("the scale bar keeps its seat wherever the title leaves its paper clear (Issue #1108)", () => {
  for (const seed of [1, 42]) {
    const ctx = ctxOf(worldOf(seed));
    const plan = planCartouche(ctx);
    assert.ok(!boxesOverlap(plan.rect, homePaper(ctx)), `seed ${seed}: the title stands clear of the bar's home`);
    assert.deepEqual(planScalebar(ctx, plan.rect).box, scalebarSeat(ctx), `seed ${seed}`);
  }
});

type Witness = { readonly label: string; readonly world: World; readonly lines?: number };

const BAR_WITNESSES: ReadonlyArray<Witness> = [
  { label: "plain 6", world: worldOf(6) },
  { label: "plain 31", world: worldOf(31) },
  { label: "plain 34", world: worldOf(34) },
  { label: "plain 35", world: worldOf(35) },
  { label: "4 lines, seed 6", world: worldOf(6, { foundingText: FOUR }), lines: 4 },
  { label: "5 lines, seed 3", world: worldOf(3, { foundingText: FIVE }), lines: 5 },
  { label: "6 lines, seed 6", world: worldOf(6, { foundingText: SIX }), lines: 6 },
];

test("the title never covers the scale bar on the witness charts, plain and founded, in every style (Issue #1108)", () => {
  for (const { label, world, lines } of BAR_WITNESSES) {
    for (const style of lines === undefined ? (["antique"] as const) : STYLE_NAMES) {
      const ctx = ctxOf(world, style);
      const plan = planCartouche(ctx);
      const at = `${label} ${style}`;
      assert.ok(boxesOverlap(plan.rect, homePaper(ctx)), `${at}: the title still stands over the bar's home`);
      if (lines !== undefined) assert.equal(plan.founding.length, lines, `${at}: the founding block's lines`);
      const bar = planScalebar(ctx, plan.rect).box;
      assert.ok(!boxesOverlap(plan.rect, scalebarBacking(bar, 1)), `${at}: the bar's paper clears the title`);
      const { margin, widthPx, heightPx } = ctx.proj;
      assert.ok(bar.x >= margin && bar.y >= margin, `${at}: the bar stays inside the frame, top left`);
      assert.ok(bar.x + bar.w <= widthPx - margin && bar.y + bar.h <= heightPx - margin, `${at}: bottom right`);
    }
  }
});

test("a moved scale bar takes the seat that covers less land, beside it on a tie (Issue #1108)", () => {
  const cases: Array<[string, World, "above" | "beside", number, number]> = [
    ["plain 34", worldOf(34), "above", 222, 0],
    ["seed 6 with six lines", worldOf(6, { foundingText: SIX }), "beside", 12, 31],
    ["plain 35", worldOf(35), "beside", 0, 0],
  ];
  for (const [label, world, takes, besideLand, aboveLand] of cases) {
    const ctx = ctxOf(world);
    const plan = planCartouche(ctx);
    const home = scalebarSeat(ctx);
    const beside = { ...home, x: plan.rect.x + plan.rect.w + 22 };
    const above = { ...home, x: plan.rect.x + 2, y: plan.rect.y - 24 - home.h };
    assert.equal(landCellsUnder(ctx, scalebarBacking(beside, 1)), besideLand, `${label}: land under the beside seat`);
    assert.equal(landCellsUnder(ctx, scalebarBacking(above, 1)), aboveLand, `${label}: land under the above seat`);
    assert.deepEqual(planScalebar(ctx, plan.rect).box, takes === "above" ? above : beside, `${label}: takes ${takes}`);
  }
});

test("a counted world's title covers no land (Issue #1109)", () => {
  for (const [count, overrides] of [
    [20, COUNT_20],
    [100, COUNT_100],
  ] as const) {
    for (let seed = 1; seed <= 20; seed++) {
      const ctx = ctxOf(worldOf(seed, overrides));
      const cells = landCellsUnder(ctx, planCartouche(ctx).rect);
      assert.equal(cells, 0, `seed ${seed} asked ${count}: ${cells} land cells under the title`);
    }
    const ctx = ctxOf(worldOf(1, overrides));
    const chosen = cornerChoice(ctx);
    const covered = cornerSeats(ctx, chosen.w, chosen.h).map((seat) => landCellsUnder(ctx, seat) > 0);
    assert.deepEqual(covered, [true, true, true, true], `seed 1 asked ${count}: no corner is clear`);
  }
});

type Flat = { readonly node: SvgNode; readonly parent: string };
function flatten(node: SvgNode, parent = ""): Flat[] {
  return [{ node, parent }, ...node.children.flatMap((c) => (typeof c === "string" ? [] : flatten(c, node.tag)))];
}

test("a shrunk title draws every word at its own size (Issue #1109)", () => {
  const ctx = ctxOf(worldOf(6, { foundingText: SIX }));
  const full = { ...planCartouche(ctx), rect: cornerChoice(ctx), scale: 1 as const };
  const shrunk = { ...full, rect: { ...full.rect, w: full.rect.w * 0.8, h: full.rect.h * 0.8 }, scale: 0.8 as const };
  const bigNodes = flatten(cartoucheLayer(ctx, full)).map((f) => f.node);
  const smallNodes = flatten(cartoucheLayer(ctx, shrunk)).map((f) => f.node);
  assert.equal(smallNodes.length, bigNodes.length, "the shrunk title draws the same nodes");
  const frame = smallNodes.find((n) => n.tag === "rect");
  assert.ok(frame, "the frame is found");
  assert.equal(frame.attrs["width"], shrunk.rect.w);
  assert.equal(frame.attrs["height"], shrunk.rect.h);
  let sized = 0;
  smallNodes.forEach((small, i) => {
    const big = bigNodes[i] as SvgNode;
    assert.equal(small.tag, big.tag, `node ${i} pairs`);
    if (small.tag !== "text" && small.tag !== "tspan") return;
    const fs = small.attrs["font-size"];
    if (fs === undefined) return;
    sized++;
    assert.ok(
      Math.abs(Number(fs) - 0.8 * Number(big.attrs["font-size"])) <= 0.1,
      `node ${i}: font-size ${String(fs)} against 0.8 of ${String(big.attrs["font-size"])}`,
    );
  });
  assert.ok(sized >= 6, `the text nodes carrying a size were found (${sized})`);
  const number = smallNodes.find((n) => n.tag === "text" && n.children[0] === "CHART № 6");
  assert.ok(number, "the chart number is found");
  const y = Number(number.attrs["y"]);
  assert.ok(y > shrunk.rect.y && y < shrunk.rect.y + shrunk.rect.h, "the chart number stands inside the shrunk frame");
});

test("a close-up keeps today's corner (Issue #1109)", () => {
  const world = worldOf(1, COUNT_20);
  const window = windowAround(world, world.settlements[0]!, 0.5);
  const region = generateRegionWorld(world, { window, gridW: 320, gridH: 240, title: regionTitle(world, window) });
  const ctx = ctxOf(region);
  assert.ok(landCellsUnder(ctx, cornerChoice(ctx)) > 0, "the close-up's corner covers land");
  const plan = planCartouche(ctx);
  assert.deepEqual(plan.rect, cornerChoice(ctx));
  assert.equal(plan.scale, 1);
});

test("a plain chart's title leaves land for clear sea (Issue #1109, ruled for every world sheet)", () => {
  for (const [seed, scale] of [
    [1, 1],
    [11, 0.8],
  ] as const) {
    const ctx = ctxOf(worldOf(seed));
    assert.ok(landCellsUnder(ctx, cornerChoice(ctx)) > 0, `seed ${seed}: today's corner covers land`);
    const plan = planCartouche(ctx);
    assert.equal(landCellsUnder(ctx, plan.rect), 0, `seed ${seed}: the title covers no land`);
    assert.equal(plan.scale, scale, `seed ${seed}: the title's size`);
  }
});

test("the drawn sheet seats its bar against the title it draws (Issues #1108 and #1109)", () => {
  const close = (a: Box, b: Box): boolean =>
    [Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.w - b.w), Math.abs(a.h - b.h)].every((d) => d < 1e-6);
  for (const seed of [11, 6]) {
    const world = worldOf(seed);
    const ctx = ctxOf(world);
    assert.ok(boxesOverlap(cornerChoice(ctx), homePaper(ctx)), `seed ${seed}: today's title stands over the bar`);
    const svg = renderMap(world, { style: "antique", legend: true });
    const frame = drawnBox(svg, "layer-cartouche");
    const paper = drawnBox(svg, "layer-scalebar");
    assert.ok(!boxesOverlap(frame, paper), `seed ${seed}: the drawn frame clears the drawn paper`);
    assert.equal(close(paper, homePaper(ctx)), seed === 11, `seed ${seed}: the bar ${seed === 11 ? "stays" : "moves"}`);
  }
});

test("a close-up's title keeps its corner, and its scale bar still gives way to it (Issues #1108 and #1109)", () => {
  const world = worldOf(2);
  const window = windowAround(world, world.settlements[0]!, 0.25);
  const region = generateRegionWorld(world, { window, gridW: 320, gridH: 240, title: regionTitle(world, window) });
  const ctx = ctxOf(region);
  const plan = planCartouche(ctx);
  assert.deepEqual(plan.rect, cornerChoice(ctx), "the close-up's title keeps its corner");
  assert.ok(boxesOverlap(plan.rect, homePaper(ctx)), "the title stands over the bar's home");
  const bar = planScalebar(ctx, plan.rect).box;
  assert.ok(!boxesOverlap(plan.rect, scalebarBacking(bar, 1)), "the bar's paper clears the title");
  const { margin, widthPx, heightPx } = ctx.proj;
  assert.ok(bar.x >= margin && bar.y >= margin, "the bar stays inside the frame, top left");
  assert.ok(bar.x + bar.w <= widthPx - margin && bar.y + bar.h <= heightPx - margin, "bottom right");
});

test("the title tries the corners first, then the edge seats nearest the chosen corner first (Issue #1109)", () => {
  const near = (a: Box, b: Box): boolean =>
    [a.x - b.x, a.y - b.y, a.w - b.w, a.h - b.h].every((d) => Math.abs(d) < 1e-6);
  const edgeSeatsAt = (ctx: RenderCtx, width: number, height: number): Box[] => {
    const [topRight, topLeft, bottomRight] = cornerSeats(ctx, width, height) as [Box, Box, Box, Box];
    return [1, 2, 3, 4, 5, 6, 7].flatMap((i) => {
      const x = topRight.x + ((topLeft.x - topRight.x) * i) / 8;
      return [
        { ...topRight, x },
        { ...bottomRight, x },
      ];
    });
  };

  const counted = ctxOf(worldOf(8, COUNT_100));
  const chosen = cornerChoice(counted);
  const corners = cornerSeats(counted, chosen.w, chosen.h);
  assert.ok(
    corners.every((seat) => landCellsUnder(counted, seat) > 0),
    "asked 100, seed 8: no corner is clear at full size",
  );
  const clear = edgeSeatsAt(counted, chosen.w, chosen.h).filter((seat) => landCellsUnder(counted, seat) === 0);
  const apart = (seat: Box): number => Math.hypot(seat.x - chosen.x, seat.y - chosen.y);
  const byDistance = [...clear].sort((a, b) => apart(a) - apart(b));
  assert.ok(
    byDistance.length >= 2 && apart(byDistance[0]!) < apart(byDistance[1]!),
    "several edge seats are clear, at different distances",
  );
  const plan = planCartouche(counted);
  assert.equal(plan.scale, 1);
  assert.ok(near(plan.rect, byDistance[0]!), "the nearest clear edge seat is taken");

  const plain = ctxOf(worldOf(1));
  const first = cornerChoice(plain);
  const bottomRight = cornerSeats(plain, first.w, first.h)[2]!;
  assert.ok(
    edgeSeatsAt(plain, first.w, first.h).some((seat) => landCellsUnder(plain, seat) === 0),
    "plain seed 1: a clear edge seat exists beside the clear corner",
  );
  assert.ok(near(planCartouche(plain).rect, bottomRight), "a clear corner is taken before any edge seat");
});
