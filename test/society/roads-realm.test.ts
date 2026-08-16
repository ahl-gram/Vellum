import { test } from "node:test";
import assert from "node:assert/strict";
import { createField } from "../../src/core/grid.ts";
import { labelComponents } from "../../src/core/mask-components.ts";
import { partitionRealms } from "../../src/society/realms.ts";
import { buildRoads } from "../../src/society/roads.ts";
import { labelLandmasses } from "../../src/world/landmass.ts";
import type { Settlement } from "../../src/society/sites.ts";

// #309 guards on hand-built worlds: exact realm and landmass geometry no natural seed guarantees.

const SEA = 0.5;
type Rect = { x0: number; y0: number; x1: number; y1: number };
const inRect = (x: number, y: number, r: Rect) =>
  x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1;

function land(w: number, h: number, rects: ReadonlyArray<Rect>) {
  return createField(w, h, (x, y) => (rects.some((r) => inRect(x, y, r)) ? 1 : 0));
}
function settle(x: number, y: number, kind: Settlement["kind"], score = 1): Settlement {
  return { x, y, kind, harbor: false, onRiver: false, score };
}
const noRivers = (w: number, h: number) => new Uint8Array(w * h);

const roadCellSet = (roads: ReturnType<typeof buildRoads>, w: number) => {
  const cells = new Set<number>();
  for (const road of roads) for (const p of road.points) cells.add(p.x + p.y * w);
  return cells;
};

test("#309: a settled second island grows its own roads, on land only", () => {
  const W = 160;
  const H = 90;
  const A: Rect = { x0: 10, y0: 10, x1: 69, y1: 69 };
  const B: Rect = { x0: 90, y0: 10, x1: 139, y1: 59 };
  const elev = land(W, H, [A, B]);
  const settlements = [
    settle(40, 40, "capital", 3),
    settle(115, 35, "town", 2),
    settle(100, 20, "village"),
    settle(130, 50, "village"),
  ];
  const realms = partitionRealms(elev, SEA, noRivers(W, H), settlements);
  assert.equal(realms.seats.length, 2, "fixture: island B governs itself");

  const roads = buildRoads(elev, SEA, noRivers(W, H), settlements, realms);
  const cells = roadCellSet(roads, W);
  for (const v of settlements.filter((s) => s.kind === "village")) {
    assert.ok(cells.has(v.x + v.y * W), `island village at ${v.x},${v.y} has no road to its seat`);
  }
  for (const road of roads) {
    for (const p of road.points) {
      assert.ok((elev.data[p.x + p.y * W] as number) > SEA, `road in the sea at ${p.x},${p.y}`);
    }
  }
});

test("#309: an islet attached to a realm is that realm's second shore, roaded without a sea bridge", () => {
  const W = 120;
  const H = 60;
  const A: Rect = { x0: 5, y0: 5, x1: 84, y1: 54 };
  const C: Rect = { x0: 100, y0: 25, x1: 104, y1: 29 };
  const elev = land(W, H, [A, C]);
  const settlements = [
    settle(42, 30, "capital", 3),
    settle(44, 30, "village"),
    settle(102, 27, "town", 2),
    settle(101, 26, "village"),
  ];
  const realms = partitionRealms(elev, SEA, noRivers(W, H), settlements);
  assert.equal(realms.seats.length, 1, "fixture: the islet attaches instead of self-governing");
  assert.equal(realms.labels[102 + 27 * W], realms.labels[42 + 30 * W], "fixture: one realm, two shores");

  const roads = buildRoads(elev, SEA, noRivers(W, H), settlements, realms);
  const cells = roadCellSet(roads, W);
  assert.ok(cells.has(101 + 26 * W), "the islet village has no road");
  assert.ok(cells.has(102 + 27 * W), "the islet's anchor settlement has no road");
  for (const road of roads) {
    for (const p of road.points) {
      assert.ok((elev.data[p.x + p.y * W] as number) > SEA, `road bridges the sea at ${p.x},${p.y}`);
    }
  }
});

test("#309: village reach scales with realm size", () => {
  const W = 400;
  const H = 120;
  const A: Rect = { x0: 10, y0: 10, x1: 329, y1: 25 };
  const B: Rect = { x0: 10, y0: 60, x1: 269, y1: 67 };
  const elev = land(W, H, [A, B]);
  const settlements = [
    settle(12, 17, "capital", 3),
    settle(12, 63, "town", 2),
    settle(300, 17, "village"),
    settle(240, 63, "village"),
  ];
  const realms = partitionRealms(elev, SEA, noRivers(W, H), settlements);
  assert.equal(realms.seats.length, 2, "fixture: two realms of different sizes");

  const roads = buildRoads(elev, SEA, noRivers(W, H), settlements, realms);
  const cells = roadCellSet(roads, W);
  assert.ok(
    cells.has(300 + 17 * W),
    "the large realm's far village lies within its grown allowance and must be roaded",
  );
  assert.ok(
    !cells.has(240 + 63 * W),
    "the small realm's equally far village lies beyond its shrunken allowance and must stay a track",
  );
});

test("#309: realm webs sharing a landmass are joined into one component by a royal trunk", () => {
  const W = 200;
  const H = 80;
  const continent: Rect = { x0: 10, y0: 10, x1: 189, y1: 59 };
  const elev = land(W, H, [continent]);
  const settlements = [
    settle(20, 35, "capital", 3),
    settle(170, 35, "town", 2),
    settle(30, 35, "village"),
    settle(150, 35, "village"),
  ];
  const realms = partitionRealms(elev, SEA, noRivers(W, H), settlements);
  assert.equal(realms.seats.length, 2, "fixture: two seats on one landmass");
  assert.notEqual(
    realms.labels[30 + 35 * W],
    realms.labels[150 + 35 * W],
    "fixture: the villages live in different realms",
  );

  const roads = buildRoads(elev, SEA, noRivers(W, H), settlements, realms);
  const cells = roadCellSet(roads, W);
  for (const si of realms.seats) {
    const seat = settlements[si]!;
    assert.ok(cells.has(seat.x + seat.y * W), `seat at ${seat.x},${seat.y} is off the web`);
  }

  const mask = new Uint8Array(W * H);
  for (const c of cells) mask[c] = 1;
  const comp = labelComponents(mask, W, H, 8);
  const ids = new Set<number>();
  for (const c of cells) ids.add(comp[c] as number);
  assert.equal(ids.size, 1, "the two realm webs never meet: no royal trunk joins them");
});

test("#309: roads with realms are deterministic", () => {
  const W = 160;
  const H = 90;
  const elev = land(W, H, [
    { x0: 10, y0: 10, x1: 69, y1: 69 },
    { x0: 90, y0: 10, x1: 139, y1: 59 },
  ]);
  const settlements = [
    settle(40, 40, "capital", 3),
    settle(115, 35, "town", 2),
    settle(100, 20, "village"),
    settle(130, 50, "village"),
  ];
  const realms = partitionRealms(elev, SEA, noRivers(W, H), settlements);
  const a = buildRoads(elev, SEA, noRivers(W, H), settlements, realms);
  const b = buildRoads(elev, SEA, noRivers(W, H), settlements, realms);
  assert.deepEqual(a, b);
  const { ids } = labelLandmasses(elev, SEA);
  const onB = a.some((r) => r.points.some((p) => ids[p.x + p.y * W] === ids[115 + 35 * W]));
  assert.ok(onB, "the second island carries part of the deterministic web");
});
