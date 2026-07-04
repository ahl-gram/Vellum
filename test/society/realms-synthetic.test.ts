import { test } from "node:test";
import assert from "node:assert/strict";
import { createField } from "../../src/core/grid.ts";
import { partitionRealms } from "../../src/society/realms.ts";
import { labelLandmasses } from "../../src/world/landmass.ts";
import { realmTintIndices, realmCentroids } from "../../src/render/realm-tints.ts";
import { STYLES } from "../../src/render/style.ts";
import type { Settlement } from "../../src/society/sites.ts";

// Hand-built worlds that DRIVE code paths no natural seed reaches: real worlds
// cap at ~5 realms, so the generation ceiling, the over-ceiling attachment, and
// the >BASE_TINTS distance-aware tint path (#78) never run on generated data.
// These also prove attachment goes BY SEA ROUTE, not straight-line -- the one
// behaviour every generated-world test would still pass with the old Euclidean
// fallback in place.

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

test("#79 ceiling: 9 substantial inhabited islands yield 8 realms, the smallest attaches", () => {
  const W = 150;
  const H = 150;
  const rects: Rect[] = [];
  const settlements: Settlement[] = [];
  let first = true;
  for (const cy of [30, 75, 120]) {
    for (const cx of [30, 75, 120]) {
      rects.push({ x0: cx - 6, y0: cy - 6, x1: cx + 5, y1: cy + 5 }); // 12x12 = 144 cells
      settlements.push(settle(cx, cy, first ? "capital" : "town"));
      first = false;
    }
  }
  const elev = land(W, H, rects);
  const realms = partitionRealms(elev, SEA, noRivers(W, H), settlements);

  assert.equal(realms.seats.length, 8, "9 islands, ceiling 8");

  // every land cell is assigned; no island is left unlabeled
  for (let i = 0; i < W * H; i++) {
    if ((elev.data[i] as number) > SEA) assert.ok((realms.labels[i] as number) >= 0);
  }

  // exactly one inhabited island lost the ceiling race and attaches whole
  const { ids } = labelLandmasses(elev, SEA);
  const seatLm = new Set(realms.seats.map((si) => ids[settlements[si]!.x + settlements[si]!.y * W]));
  const islandLabels = new Map<number, Set<number>>();
  for (let i = 0; i < W * H; i++) {
    const lm = ids[i] as number;
    if (lm < 0 || seatLm.has(lm)) continue;
    (islandLabels.get(lm) ?? islandLabels.set(lm, new Set()).get(lm)!).add(realms.labels[i] as number);
  }
  assert.equal(islandLabels.size, 1, "exactly one island over the ceiling");
  for (const [, realms2] of islandLabels) {
    assert.equal(realms2.size, 1, "the over-ceiling island attaches whole to one realm");
  }
});

test("#78/#79 antique's 8-realm pigeonhole reuses a tint on a far pair, never a close one", () => {
  const W = 150;
  const H = 150;
  const rects: Rect[] = [];
  const settlements: Settlement[] = [];
  let first = true;
  // 8 islands spread so the proximity graph is colourable and far pairs exist
  const centers: Array<[number, number]> = [
    [20, 40], [60, 40], [100, 40], [140, 40],
    [20, 110], [60, 110], [100, 110], [140, 110],
  ];
  for (const [cx, cy] of centers) {
    rects.push({ x0: cx - 6, y0: cy - 6, x1: cx + 5, y1: cy + 5 });
    settlements.push(settle(cx, cy, first ? "capital" : "town"));
    first = false;
  }
  const elev = land(W, H, rects);
  const realms = partitionRealms(elev, SEA, noRivers(W, H), settlements);
  assert.equal(realms.seats.length, 8, "8 islands -> 8 realms (no ceiling loss)");

  const count = realms.seats.length;
  const centroids = realmCentroids(realms.labels, W, H, count);
  const D = 0.5 * Math.min(W, H); // mirrors realm-tints.ts confusionDist
  const tint = realmTintIndices(realms.labels, W, H, count, STYLES.antique); // 7 tints < 8

  let closeCollision = 0;
  let farReuse = 0;
  for (let a = 0; a < count; a++) {
    for (let b = a + 1; b < count; b++) {
      if (tint[a] !== tint[b]) continue;
      const dist = Math.hypot(centroids[a]!.x - centroids[b]!.x, centroids[a]!.y - centroids[b]!.y);
      if (dist < D) closeCollision++;
      else farReuse++;
    }
  }
  assert.equal(closeCollision, 0, "no two proximity-close realms share a tint (the hard #78 rule)");
  assert.ok(farReuse >= 1, "8 realms over a 7-tint palette must reuse a colour on a far pair");
});

test("#79 attaches an islet by sea route, not by straight-line across land", () => {
  // A big continent A (coast near the islet, seat deep and far); a compact B (seat
  // straight-line-nearest to the islet). The islet is empty, so it attaches. Sea
  // route reaches A's near coast first; straight-line-nearest seat is B. They must
  // disagree, and the islet must join A.
  const W = 80;
  const H = 40;
  const A: Rect = { x0: 25, y0: 0, x1: 75, y1: 39 }; // coast at x=25, near the islet
  const B: Rect = { x0: 0, y0: 0, x1: 8, y1: 39 };
  const ISLET: Rect = { x0: 18, y0: 18, x1: 21, y1: 22 };
  const elev = land(W, H, [A, B, ISLET]);
  const capital = settle(70, 20, "capital"); // deep inside A, far from islet
  const townB = settle(3, 20, "town"); // inside B, straight-line-near the islet
  const settlements = [capital, townB];
  const realms = partitionRealms(elev, SEA, noRivers(W, H), settlements);

  assert.equal(realms.seats.length, 2, "A and B are the two realms");
  const realmOfA = realms.labels[70 + 20 * W] as number; // capital's cell
  const realmOfB = realms.labels[3 + 20 * W] as number; // town's cell
  assert.notEqual(realmOfA, realmOfB);

  // the discriminator is real: straight-line-nearest SEAT is B, not A
  const ic = { x: 19.5, y: 20 };
  const dA = Math.hypot(70 - ic.x, 20 - ic.y);
  const dB = Math.hypot(3 - ic.x, 20 - ic.y);
  assert.ok(dB < dA, "setup: Euclidean-nearest seat is B (the wrong answer)");

  // the islet joined A by sea route
  const isletLabel = realms.labels[19 + 20 * W] as number;
  assert.equal(isletLabel, realmOfA, "islet attaches to A's near coast by sea, not B by straight line");
});

test("#79 size wins: a settled but sub-substantial island attaches, it does not self-govern", () => {
  // Alex's locked decision: size always wins. A small island with a town of its
  // own still attaches to a neighbour by sea route -- its town becomes an ordinary
  // settlement, not a realm seat. (n=5000 -> SUBSTANTIAL_FRACTION*n = 20 cells.)
  const W = 100;
  const H = 50;
  const A: Rect = { x0: 0, y0: 0, x1: 40, y1: 49 }; // mainland
  const B: Rect = { x0: 60, y0: 23, x1: 63, y1: 26 }; // 4x4 = 16 cells, below the 20-cell cutoff
  const elev = land(W, H, [A, B]);
  const capital = settle(20, 25, "capital");
  const townOnB = settle(61, 24, "town"); // a real town, but B is too small to matter
  const settlements = [capital, townOnB];
  const realms = partitionRealms(elev, SEA, noRivers(W, H), settlements);

  assert.equal(realms.seats.length, 1, "the small settled island did NOT add a realm");
  assert.ok(!realms.seats.includes(1), "B's town is not promoted to a seat");
  const aRealm = realms.labels[20 + 25 * W] as number;
  const bRealm = realms.labels[61 + 24 * W] as number;
  assert.equal(bRealm, aRealm, "B attaches whole to the mainland realm by sea route");
});

test("#79 backstop: an islet with no sea route (enclosed lake) still gets a realm", () => {
  // Mainland A (seated). A seatless ring island B with an enclosed interior lake;
  // a 1-cell islet C sits in that lake. C's only water touches B (itself seatless
  // in the frozen snapshot), so no realm is reachable by sea -- the ONLY way C
  // escapes -1 is the Euclidean backstop. This is seed 60's real geometry, driven
  // deterministically. Fires once naturally in 300 seeds, so pin it here.
  const W = 60;
  const H = 60;
  const A: Rect = { x0: 2, y0: 2, x1: 20, y1: 57 };
  // ring B: an outer block minus an inner lake, kept as four walls so the lake is
  // fully enclosed (no gap to the open ocean)
  const bTop: Rect = { x0: 32, y0: 15, x1: 54, y1: 21 };
  const bBottom: Rect = { x0: 32, y0: 39, x1: 54, y1: 45 };
  const bLeft: Rect = { x0: 32, y0: 15, x1: 37, y1: 45 };
  const bRight: Rect = { x0: 49, y0: 15, x1: 54, y1: 45 };
  const C: Rect = { x0: 43, y0: 30, x1: 43, y1: 30 }; // 1 cell inside the lake
  const elev = land(W, H, [A, bTop, bBottom, bLeft, bRight, C]);
  const capital = settle(10, 30, "capital"); // only A is inhabited
  const realms = partitionRealms(elev, SEA, noRivers(W, H), [capital]);

  assert.equal(realms.seats.length, 1, "only A governs; B is empty, C is enclosed");
  // C escaped -1 only via the backstop (its lake reaches no realm shore by sea)
  const cLabel = realms.labels[43 + 30 * W] as number;
  assert.ok(cLabel >= 0, "the enclosed islet still gets a realm (no unassigned land)");
  // and no land cell anywhere is left unassigned
  for (let i = 0; i < W * H; i++) {
    if ((elev.data[i] as number) > SEA) assert.ok((realms.labels[i] as number) >= 0, `unassigned land at ${i}`);
  }
});
