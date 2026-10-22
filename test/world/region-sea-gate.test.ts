import { test } from "node:test";
import assert from "node:assert/strict";
import { createField } from "../../src/core/grid.ts";
import { createRng } from "../../src/core/rng.ts";
import { seaMask } from "../../src/hydrology/sea-mask.ts";
import { createLabelArena, type RenderCtx } from "../../src/render/context.ts";
import { planCartouche } from "../../src/render/layers/cartouche.ts";
import { planCompass } from "../../src/render/layers/compass.ts";
import { planLegend } from "../../src/render/layers/legend.ts";
import { planScalebar } from "../../src/render/layers/scalebar.ts";
import { soundingsLayer } from "../../src/render/layers/soundings.ts";
import { STYLES } from "../../src/render/style.ts";
import type { SvgNode } from "../../src/render/svg.ts";
import { createProjection, marginFor } from "../../src/render/transform.ts";
import { defaultRecipe, generateWorld } from "../../src/world/generate.ts";
import { generateRegionWorld } from "../../src/world/region.ts";
import { cellsPerWorldCell, nearestParentCells } from "../../src/world/region-parent.ts";
import { refineSeaGate } from "../../src/world/region-sea-gate.ts";
import type { World } from "../../src/world/types.ts";

const SEA = 0;
const GRID_H = 8;

function gateOf(
  worldSea: number[],
  parentLand: number[],
  isLandCell: (x: number, y: number) => boolean = () => false,
): { gate: Uint8Array; gridW: number } {
  const parentW = worldSea.length;
  const gridW = parentW * 8;
  const parentOf = new Int32Array(gridW * GRID_H);
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < gridW; x++) parentOf[x + y * gridW] = Math.min(parentW - 1, Math.floor(x / 8));
  }
  const gate = refineSeaGate({
    worldSea: Uint8Array.from(worldSea),
    parentLand: Uint8Array.from(parentLand),
    parentW,
    parentH: 1,
    parentOf,
    elev: createField(gridW, GRID_H, (x, y) => (isLandCell(x, y) ? 1 : -1)),
    seaLevel: SEA,
  });
  return { gate, gridW };
}

test("water on coastal parent land joined to the sea opens", () => {
  const { gate, gridW } = gateOf([1, 0, 0], [0, 1, 0]);
  assert.equal(gate[12 + 3 * gridW], 1);
});

test("water on a parent lake stays shut though the close-up's water joins it to the sea", () => {
  const { gate, gridW } = gateOf([1, 0, 0], [0, 1, 0]);
  for (let x = 16; x < gridW; x++) assert.equal(gate[x + 3 * gridW], 0, `x ${x}`);
});

test("water on inland parent land stays shut", () => {
  const { gate, gridW } = gateOf([1, 0, 0, 0], [0, 1, 1, 1]);
  for (let x = 0; x < gridW; x++) assert.equal(gate[x + 3 * gridW], x < 16 ? 1 : 0, `x ${x}`);
});

test("water the close-up's land cuts off from the sea stays shut", () => {
  const { gate, gridW } = gateOf([1, 0, 0], [0, 1, 0], (x) => x === 10);
  assert.equal(gate[12 + 3 * gridW], 0);
});

const WIDTH = 1500;

function ctxFor(w: World): RenderCtx {
  const proj = createProjection(w.elev.w, w.elev.h, WIDTH, marginFor(WIDTH));
  return {
    world: w,
    style: STYLES.nautical,
    proj,
    coastRings: [],
    elevSpan: 1,
    rng: createRng(w.recipe.seed).fork("render"),
    realmTint: w.realms.seats.map((_, i) => i),
    labels: createLabelArena(),
  };
}

function points(node: SvgNode | null): Array<{ px: number; py: number }> {
  const out: Array<{ px: number; py: number }> = [];
  const walk = (n: SvgNode): void => {
    const a = n.attrs;
    if (a.x !== undefined && a.y !== undefined && n.tag === "text") out.push({ px: Number(a.x), py: Number(a.y) });
    if (typeof a.d === "string") {
      const m = /M(-?[\d.]+) (-?[\d.]+)/.exec(a.d);
      if (m) out.push({ px: Number(m[1]), py: Number(m[2]) });
    }
    for (const c of n.children) if (typeof c !== "string") walk(c);
  };
  if (node) walk(node);
  return out;
}

const SPEC = { gridW: 320, gridH: 240, title: "t", detail: true } as const;

const seaWorld = generateWorld(defaultRecipe(23));
const seaWindow = { u0: 0.31640625, v0: 0.1796875, u1: 0.34765625, v1: 0.2109375 };
const seaRegion = generateRegionWorld(seaWorld, { ...SPEC, window: seaWindow });

test("chart 23's open-sea shore at band 5 opens the close-up's sea where the world charts land", () => {
  const parentOf = nearestParentCells(seaWorld.recipe.gridW, seaWorld.recipe.gridH, seaWindow, 320, 240);
  const gate = seaRegion.region?.seaGate;
  assert.ok(gate, "a close-up carries a sea gate");
  let opened = 0;
  for (let i = 0; i < gate.length; i++) {
    const water = (seaRegion.elev.data[i] as number) <= seaRegion.seaLevel;
    if (water && gate[i] === 1 && (seaWorld.elev.data[parentOf[i] as number] as number) > seaWorld.seaLevel) opened++;
  }
  assert.ok(opened > 0, "no water on parent land opened");
});

test("a sounding stands on water the world charts as land there", () => {
  const ctx = ctxFor(seaRegion);
  const cart = planCartouche(ctx);
  ctx.labels.claim(cart.rect);
  const scale = planScalebar(ctx);
  ctx.labels.claim(scale.box);
  const legend = planLegend(ctx, [cart.rect, scale.box]);
  if (legend) ctx.labels.claim(legend.box);
  const compass = planCompass(ctx, cart, scale.box, legend?.box);
  const marks = points(soundingsLayer(ctx, cart, compass));
  assert.ok(marks.length > 0, "the shore draws soundings");

  const { proj } = ctx;
  const { recipe } = seaWorld;
  const perWorld = cellsPerWorldCell(320, seaWindow, recipe.gridW);
  const du = seaWindow.u1 - seaWindow.u0;
  const dv = seaWindow.v1 - seaWindow.v0;
  let onLand = 0;
  for (const { px, py } of marks) {
    const gx = (px - proj.margin) / proj.scale;
    const gy = (py - proj.margin) / proj.scale;
    const pu = (seaWindow.u0 + (gx / 319) * du) * (recipe.gridW - 1);
    const pv = (seaWindow.v0 + (gy / 239) * dv) * (recipe.gridH - 1);
    const rx = Math.round(pu);
    const ry = Math.round(pv);
    const inside = (0.5 - Math.max(Math.abs(pu - rx), Math.abs(pv - ry))) * perWorld;
    if ((seaWorld.elev.data[rx + ry * recipe.gridW] as number) > seaWorld.seaLevel && inside > 1) onLand++;
  }
  assert.ok(onLand > 0, `0 of ${marks.length} soundings stand more than a region cell inside parent land`);
});

test("no water on a parent lake opens where a window cuts the lake (chart 7, band 5)", () => {
  const world = generateWorld(defaultRecipe(7));
  const window = { u0: 0.30859375, v0: 0.87109375, u1: 0.33984375, v1: 0.90234375 };
  const region = generateRegionWorld(world, { ...SPEC, window });
  const sea = seaMask(world.elev, world.seaLevel);
  const parentOf = nearestParentCells(world.recipe.gridW, world.recipe.gridH, window, 320, 240);
  const gate = region.region?.seaGate;
  assert.ok(gate, "a close-up carries a sea gate");
  let leaked = 0;
  for (let i = 0; i < gate.length; i++) {
    const p = parentOf[i] as number;
    const parentLake = (world.elev.data[p] as number) <= world.seaLevel && sea[p] === 0;
    if (gate[i] === 1 && parentLake) leaked++;
  }
  assert.equal(leaked, 0, "region cells opened as sea on a parent lake");
});
