import type { World } from "../world/types.ts";
import type { Arms } from "../society/heraldry.ts";
import { biomeName, type BiomeName } from "../climate/biomes.ts";
import { minMax } from "../core/grid.ts";
import { clamp } from "../core/math.ts";
import {
  BACKDROP_OFFSET,
  BACKDROP_SAMPLES,
  FOREGROUND_OFFSET,
  FOREGROUND_SAMPLES,
  TRANSECT_HALF_WIDTH,
  linePoints,
  sampleBilinear,
  viewDirection,
  viewRight,
  type ProspectView,
} from "./transect.ts";

export type ProspectKind = "capital" | "seat" | "town" | "village" | "hamlet";

export type ProspectInput = {
  readonly seed: number;
  /** Index into world.settlements; NOT stable across region sheets, which filter and reindex. */
  readonly index: number;
  readonly name: string;
  readonly kind: ProspectKind;
  /** Raw placeSettlements score, unnormalized; hamlet scores use a slimmer capped formula and are NOT on the same scale. */
  readonly score: number;
  readonly harbor: boolean;
  readonly onRiver: boolean;
  readonly founded: number;
  readonly ruined: boolean;
  readonly ruinedYear: number | null;
  readonly realm: number;
  readonly realmName: string | null;
  readonly arms: Arms | null;
  readonly view: ProspectView;
  readonly siteRel: number;
  readonly backdrop: ReadonlyArray<number>;
  readonly foreground: ReadonlyArray<BiomeName>;
};

function biomeAt(world: World, x: number, y: number): BiomeName {
  const w = world.elev.w;
  const xi = clamp(Math.round(x), 0, w - 1);
  const yi = clamp(Math.round(y), 0, world.elev.h - 1);
  // world.biomes is a bare Uint8Array indexed x + y * w, never .at(x, y).
  return biomeName(world.biomes[xi + yi * w] as number);
}

/** World sheets only: a region world carries no realm labels, arms, or chronicle, so a region-sourced input would silently degrade; region insets must resolve those through the parent world. */
export function buildProspectInput(world: World, index: number): ProspectInput {
  const s = world.settlements[index];
  if (s === undefined) {
    throw new RangeError(
      `settlement index ${index} out of range 0..${world.settlements.length - 1}`,
    );
  }
  const { elev, seaLevel } = world;
  const span = minMax(elev).max - seaLevel || 1;
  const rel = (e: number): number => (e - seaLevel) / span;

  const view = viewDirection(elev, seaLevel, s);
  const right = viewRight(view);
  const backdrop = linePoints(
    s.x + BACKDROP_OFFSET * view.dx,
    s.y + BACKDROP_OFFSET * view.dy,
    right,
    TRANSECT_HALF_WIDTH,
    BACKDROP_SAMPLES,
  ).map((p) => rel(sampleBilinear(elev, p.x, p.y)));
  const foreground = linePoints(
    s.x - FOREGROUND_OFFSET * view.dx,
    s.y - FOREGROUND_OFFSET * view.dy,
    right,
    TRANSECT_HALF_WIDTH,
    FOREGROUND_SAMPLES,
  ).map((p) => biomeAt(world, p.x, p.y));

  const realm = world.realms.labels[s.x + s.y * elev.w] ?? -1;
  const kind: ProspectKind =
    s.kind === "capital"
      ? "capital"
      : world.realms.seats.includes(index)
        ? "seat"
        : s.kind;
  const ruinEvent = world.history.events.find(
    (e) => e.kind === "ruin" && e.settlement === index,
  );

  return {
    seed: world.recipe.seed,
    index,
    name: s.name,
    kind,
    score: s.score,
    harbor: s.harbor,
    onRiver: s.onRiver,
    founded: s.founded,
    ruined: s.ruined,
    ruinedYear: s.ruined ? (ruinEvent?.year ?? null) : null,
    realm,
    realmName: realm >= 0 ? (world.names.realms[realm] ?? null) : null,
    arms: realm >= 0 ? (world.arms[realm] ?? null) : null,
    view,
    siteRel: rel(elev.at(s.x, s.y)),
    backdrop,
    foreground,
  };
}
