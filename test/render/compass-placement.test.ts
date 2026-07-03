import { test } from "node:test";
import assert from "node:assert/strict";
import { createField, type Field } from "../../src/core/grid.ts";
import { bfsDistance } from "../../src/core/bfs-distance.ts";
import { createProjection } from "../../src/render/transform.ts";
import { STYLES } from "../../src/render/style.ts";
import { createRng } from "../../src/core/rng.ts";
import { createLabelArena, type RenderCtx } from "../../src/render/context.ts";
import { planCompass } from "../../src/render/layers/compass.ts";
import type { Box } from "../../src/render/geometry.ts";
import type { CartouchePlan } from "../../src/render/layers/cartouche.ts";
import type { World } from "../../src/world/types.ts";

// The compass is placed in open water, nautical-chart style. Two failure modes
// these pin: it must not mistake an inland LAKE for the sea (#103), and among
// valid sea it must prefer the most OPEN water rather than whatever corner is
// farthest from the title, and it must keep clear of the legend (#104).

const WIDTH = 1500;
const MARGIN = Math.round(WIDTH * 0.045);

function synthCtx(elev: Field, seaLevel: number): RenderCtx {
  // oceanDist mirrors the real world build: hops from the nearest land, so it
  // is large deep inside ANY water body (this is exactly why lakes fool it).
  const oceanDist = bfsDistance(elev.w, elev.h, (x, y) => elev.at(x, y) > seaLevel);
  const proj = createProjection(elev.w, elev.h, WIDTH, MARGIN);
  const world = { elev, seaLevel, oceanDist } as unknown as World;
  return {
    world,
    style: STYLES.antique,
    proj,
    coastRings: [],
    elevSpan: 1,
    rng: createRng(1).fork("render"),
    realmTint: [],
    labels: createLabelArena(),
  };
}

// invert a compass px x-coordinate back to a grid column
function gxOf(cx: number, elev: Field): number {
  const scale = (WIDTH - 2 * MARGIN) / (elev.w - 1);
  return Math.round((cx - MARGIN) / scale);
}

const cart = (rect: Box): CartouchePlan => ({ rect } as unknown as CartouchePlan);

test("#103 the compass sits in the sea, not an inland lake", () => {
  const W = 64, H = 48, sea = 0;
  // left band = border-connected sea; a large landlocked block = a lake with an
  // even deeper (higher oceanDist) interior than the thin coastal sea. The
  // cartouche sits by the sea and the lake is the water FARTHEST from it, so the
  // old distance-from-title scoring drops the rose in the lake.
  const isSea = (x: number) => x <= 10;
  const isLake = (x: number, y: number) => x >= 38 && x <= 58 && y >= 10 && y <= 38;
  const elev = createField(W, H, (x, y) => (isSea(x) || isLake(x, y) ? -1 : 1));
  const ctx = synthCtx(elev, sea);

  const plan = planCompass(ctx, cart({ x: 80, y: 70, w: 260, h: 110 }), {
    x: 1100, y: 1000, w: 200, h: 34,
  });

  assert.ok(plan, "expected a compass to be placed");
  const gx = gxOf(plan.cx, elev);
  assert.ok(
    gx <= 12,
    `compass landed at column ${gx}; expected the coastal sea (<=12), not the lake (~48)`,
  );
});

test("#104 the compass prefers open sea over a cramped inlet farther from the title", () => {
  const W = 64, H = 48, sea = 0;
  // deep open sea in the upper-right (near the cartouche), a shallow pocket in
  // the far bottom-left (farthest from the cartouche). The old scoring chases
  // distance-from-cartouche and lands in the cramped pocket.
  const isDeep = (x: number, y: number) => x >= 42 && y >= 10 && y <= 30;
  const isInlet = (x: number, y: number) => x <= 10 && y >= 30;
  const elev = createField(W, H, (x, y) => (isDeep(x, y) || isInlet(x, y) ? -1 : 1));
  const ctx = synthCtx(elev, sea);

  const plan = planCompass(ctx, cart({ x: 1150, y: 70, w: 280, h: 110 }), {
    x: 80, y: 80, w: 200, h: 34,
  });

  assert.ok(plan, "expected a compass to be placed");
  const gx = gxOf(plan.cx, elev);
  assert.ok(
    gx >= 30,
    `compass landed at column ${gx}; expected the open sea (>=42), not the far inlet (~4)`,
  );
});

test("#104 the compass keeps clear of the legend", () => {
  const W = 64, H = 48, sea = 0;
  // one big sea filling the right and bottom; the legend sits over its deepest
  // (south-east) water, exactly where the compass would otherwise want to be.
  const isSea = (x: number, y: number) => x >= 28 && y >= 14;
  const elev = createField(W, H, (x, y) => (isSea(x, y) ? -1 : 1));
  const ctx = synthCtx(elev, sea);
  const legendBox: Box = { x: 1140, y: 840, w: 230, h: 200 };

  const plan = planCompass(
    ctx,
    cart({ x: 80, y: 70, w: 260, h: 110 }),
    { x: 80, y: 200, w: 200, h: 34 },
    legendBox,
  );

  assert.ok(plan, "expected a compass to be placed");
  assert.ok(
    !boxesOverlapTest(plan.box, legendBox),
    `compass box ${JSON.stringify(plan.box)} overlaps the legend ${JSON.stringify(legendBox)}`,
  );
});

// local copy so the test states the contract without importing the geometry the
// implementation uses to satisfy it
function boxesOverlapTest(a: Box, b: Box): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
