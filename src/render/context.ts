import type { Rng } from "../core/rng.ts";
import type { World } from "../world/types.ts";
import type { MapStyle } from "./style.ts";
import type { Projection } from "./transform.ts";
import type { Box, Pt } from "./geometry.ts";
import type { ThemeName } from "./layers/field.ts";
import { boxesOverlap, polyBoxOverlapFraction } from "./geometry.ts";

export type PxRing = ReadonlyArray<readonly [number, number]>;

export type RenderCtx = {
  readonly world: World;
  readonly style: MapStyle;
  readonly proj: Projection;
  readonly coastRings: ReadonlyArray<PxRing>;
  readonly elevSpan: number;
  readonly rng: Rng;
  readonly realmTint: ReadonlyArray<number>;
  readonly labels: LabelArena;
  readonly theme?: ThemeName;
};

export type LabelArena = {
  tryClaim(box: Box, pad?: number): boolean;
  tryClaimAll(boxes: ReadonlyArray<Box>, pad?: number): boolean;
  tryClaimPoly(poly: ReadonlyArray<Pt>, footprint: ReadonlyArray<Box>, maxFrac: number): boolean;
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
    tryClaimAll(boxes: ReadonlyArray<Box>, pad = 2): boolean {
      for (const box of boxes) {
        for (const b of placed) {
          if (boxesOverlap(b, box, pad)) return false;
        }
      }
      placed.push(...boxes);
      return true;
    },
    tryClaimPoly(poly: ReadonlyArray<Pt>, footprint: ReadonlyArray<Box>, maxFrac: number): boolean {
      for (const b of placed) {
        if (polyBoxOverlapFraction(poly, b) >= maxFrac) return false;
      }
      placed.push(...footprint);
      return true;
    },
    claim(box: Box): void {
      placed.push(box);
    },
  };
}
