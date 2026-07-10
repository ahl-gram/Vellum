import type { World } from "../world/types.ts";
import type { SettlementKind } from "../society/sites.ts";
import type { HistoricalEvent } from "../society/history.ts";
import { createProjection } from "./transform.ts";

/**
 * A settlement projected for the client: identity + chronicle fields plus its
 * position as 0..1 fractions of the rendered chart, so the overlay aligns at any
 * width with zero projection math on the client.
 */
export type PlaceMark = {
  readonly idx: number;
  readonly name: string;
  readonly kind: SettlementKind;
  readonly founded: number;
  readonly ruined: boolean;
  /** Projected x as a fraction of the rendered width (0..1). */
  readonly nx: number;
  /** Projected y as a fraction of the rendered height (0..1). */
  readonly ny: number;
  /**
   * The settlement's cell on the world grid. The voyage router (#120) walks road
   * and sea cells, so it needs this; nx/ny cannot serve, being fractions of the
   * rendered chart with a margin baked in. Shipping the integer the worker already
   * holds beats inverting the projection on the client.
   */
  readonly gx: number;
  readonly gy: number;
};

/**
 * A plain, structured-cloneable projection of the world's places and chronicle.
 * The backbone of the Living Chart epic (#51): the Explorer's hover cards and
 * year-scrubber consume this on the client. The full `world` cannot cross the
 * worker boundary (its Field methods are not cloneable), so this is the `draw`
 * job's analogue of `serializableAtlas` for the atlas job.
 */
export type PlaceManifest = {
  readonly places: ReadonlyArray<PlaceMark>;
  readonly events: ReadonlyArray<HistoricalEvent>;
  readonly presentYear: number;
  readonly widthPx: number;
  readonly heightPx: number;
};

/**
 * Project the world into a {@link PlaceManifest}. Pure: no RNG, no World
 * mutation, no `rng.fork` (the data was already produced by the LAST fork in the
 * pipeline, `rng.fork("history")`, so there is nothing to fork). The projection
 * MUST match renderMap exactly (map-renderer.ts:87-88) so client overlays land on
 * the drawn settlements.
 */
export function buildPlaceManifest(world: World, widthPx: number): PlaceManifest {
  const margin = Math.round(widthPx * 0.045);
  const proj = createProjection(world.elev.w, world.elev.h, widthPx, margin);
  const places: PlaceMark[] = world.settlements.map((s, idx) => ({
    idx,
    name: s.name,
    kind: s.kind,
    founded: s.founded,
    ruined: s.ruined,
    nx: proj.px(s.x) / proj.widthPx,
    ny: proj.py(s.y) / proj.heightPx,
    gx: s.x,
    gy: s.y,
  }));
  return {
    places,
    events: world.history.events,
    presentYear: world.title.year,
    widthPx,
    heightPx: proj.heightPx,
  };
}
