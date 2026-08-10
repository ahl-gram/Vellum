/**
 * The ruin grammar (#239, #237 GO condition 3): a ruin is a FIELD of
 * collapse, not just broken rooflines. Strewn rubble, fallen beams leaning
 * on the stumps, greenery reclaiming the floors, the heeling wall stub
 * (masses.ts), and birds. The drowned fen variant sinks the skyline
 * beneath a water sheet (the spike's Saltmere plate).
 */

import type { Rng } from "../core/rng.ts";
import {
  VIEW_X0,
  VIEW_X1,
  WATER_BOTTOM,
  groundAt,
  type ForegroundElement,
  type Ground,
  type Mass,
  type Water,
} from "./geometry.ts";

/** The collapse field strewn across the townscape's run. */
export function composeCollapseField(
  ground: Ground,
  front: ReadonlyArray<Mass>,
  runX0: number,
  runX1: number,
  rng: Rng,
): ForegroundElement[] {
  const cx = (VIEW_X0 + VIEW_X1) / 2;
  const g = (x: number): number => groundAt(ground, x);
  const stones = Array.from({ length: 10 }, () => {
    const x = runX0 + 4 + rng.next() * (runX1 - runX0 - 8);
    return { x, y: g(x) - 0.5 - rng.next() * 2, s: 2 + rng.next() * 3 };
  });
  const beams = Array.from({ length: 3 }, () => {
    const b = front[Math.floor(rng.next() * front.length)]!;
    const x = b.x + b.w * (0.2 + rng.next() * 0.5);
    return { x, y: g(x), dx: 7 + rng.next() * 5, dy: -(9 + rng.next() * 5) };
  });
  return [
    { kind: "rubble", stones },
    { kind: "beams", items: beams },
    {
      kind: "trees",
      species: "round",
      items: [{ x: cx - 20 - rng.next() * 30, y: g(cx) + 3, s: 1.0 + rng.next() * 0.3 }],
    },
    {
      kind: "marshTufts",
      items: [
        { x: cx + 14 + rng.next() * 30, y: g(cx) + 2, s: 0.9 },
        { x: cx - 60 + rng.next() * 20, y: g(cx - 50) + 3, s: 0.8 },
      ],
    },
  ];
}

export type DrownedComposition = {
  readonly water: Water;
  readonly elements: ForegroundElement[];
};

/** A ruined fen settlement drowns: the water sheet covers the ground, and
 * only a leaning tower stub and a half-sunk gable still stand in it. */
export function composeDrowned(ground: Ground, rng: Rng): DrownedComposition {
  const cx = (VIEW_X0 + VIEW_X1) / 2;
  const base = ground.base;
  return {
    water: { kind: "drowned", y0: base + 14, y1: WATER_BOTTOM },
    elements: [
      {
        kind: "drownedStubs",
        stubs: [
          { x: cx + 54, w: 12, h: 45, base: base + 18, tilt: -9 },
          { x: cx - 52, w: 16, h: 23, base: base + 17, tilt: 0 },
        ],
      },
      {
        kind: "ripples",
        items: [
          { x: cx + 40 + rng.next() * 8, y: base + 22, s: 0.9 },
          { x: cx - 66 - rng.next() * 8, y: base + 24, s: 0.8 },
        ],
      },
    ],
  };
}
