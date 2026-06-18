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
  readonly labels: LabelArena;
  /** Active thematic plate, if any; suppresses the normal land-coloring layers. */
  readonly theme?: ThemeName;
};

/** Greedy first-come label collision arena, local to one render pass. */
export type LabelArena = {
  tryClaim(box: Box, pad?: number): boolean;
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
    claim(box: Box): void {
      placed.push(box);
    },
  };
}
