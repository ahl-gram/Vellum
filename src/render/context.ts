import type { Rng } from "../core/rng.ts";
import type { World } from "../world/types.ts";
import type { MapStyle } from "./style.ts";
import type { Projection } from "./transform.ts";
import type { Box } from "./geometry.ts";
import type { ThemeName } from "./layers/field.ts";
import { boxesOverlap } from "./geometry.ts";

export type PxRing = ReadonlyArray<readonly [number, number]>;

export type RenderCtx = {
  readonly world: World;
  readonly style: MapStyle;
  readonly proj: Projection;
  /** Coastline rings, smoothed, in pixel coordinates. */
  readonly coastRings: ReadonlyArray<PxRing>;
  /** max elevation − sea level. */
  readonly elevSpan: number;
  readonly rng: Rng;
  /** Palette index per realm id: identity within the base palette, distance-aware
   *  beyond it (#78). Shared so washes and seat halos always agree on a colour. */
  readonly realmTint: ReadonlyArray<number>;
  readonly labels: LabelArena;
  /** Active thematic plate, if any; suppresses the normal land-coloring layers. */
  readonly theme?: ThemeName;
};

/** Greedy first-come label collision arena, local to one render pass. */
export type LabelArena = {
  tryClaim(box: Box, pad?: number): boolean;
  /** All-or-nothing: one label whose footprint is several boxes (a rotated run). */
  tryClaimAll(boxes: ReadonlyArray<Box>, pad?: number): boolean;
  claim(box: Box): void;
};

export function createLabelArena(): LabelArena {
  const placed: Box[] = [];
  return {
    tryClaim(box: Box, pad = 2): boolean {
      for (const b of placed) {
        if (boxesOverlap(b, box, pad)) return false;
      }
      placed.push(box);
      return true;
    },
    // Every box is tested against the arena BEFORE any is claimed, so a rejected
    // label never leaves part of itself reserved (#175). The boxes are slices of
    // one label, so they are not tested against each other.
    tryClaimAll(boxes: ReadonlyArray<Box>, pad = 2): boolean {
      for (const box of boxes) {
        for (const b of placed) {
          if (boxesOverlap(b, box, pad)) return false;
        }
      }
      placed.push(...boxes);
      return true;
    },
    claim(box: Box): void {
      placed.push(box);
    },
  };
}
