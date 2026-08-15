import type { World } from "../world/types.ts";
import type { SettlementKind } from "../society/sites.ts";
import type { HistoricalEvent } from "../society/history.ts";
import { createProjection, marginFor } from "./transform.ts";

export type PlaceMark = {
  readonly idx: number;
  readonly name: string;
  readonly kind: SettlementKind;
  readonly founded: number;
  readonly ruined: boolean;
  readonly seat: boolean;
  readonly nx: number;
  readonly ny: number;
  readonly gx: number;
  readonly gy: number;
};

export type PlaceManifest = {
  readonly places: ReadonlyArray<PlaceMark>;
  readonly events: ReadonlyArray<HistoricalEvent>;
  readonly cultureId: string;
  readonly presentYear: number;
  readonly widthPx: number;
  readonly heightPx: number;
  readonly marginPx: number;
};

export function buildPlaceManifest(world: World, widthPx: number): PlaceManifest {
  const margin = marginFor(widthPx);
  const proj = createProjection(world.elev.w, world.elev.h, widthPx, margin);
  const seats = new Set(world.realms.seats);
  const places: PlaceMark[] = world.settlements.map((s, idx) => ({
    idx,
    name: s.name,
    kind: s.kind,
    founded: s.founded,
    ruined: s.ruined,
    seat: seats.has(idx),
    nx: proj.px(s.x) / proj.widthPx,
    ny: proj.py(s.y) / proj.heightPx,
    gx: s.x,
    gy: s.y,
  }));
  return {
    places,
    events: world.history.events,
    cultureId: world.culture.id,
    presentYear: world.title.year,
    widthPx,
    heightPx: proj.heightPx,
    marginPx: margin,
  };
}
