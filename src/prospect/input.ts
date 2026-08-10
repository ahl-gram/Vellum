/**
 * ProspectInput (#238): a pure, serializable description of one settlement's
 * prospect, sampled from the world it belongs to. Data only: no DOM, no SVG,
 * no I/O. Subs 2-4 compose and caption from this; Sub 5 applies the viewing
 * year. Deliberately year-agnostic: it carries the chronicle facts (founded,
 * ruined, ruinedYear) so the renderer can show empty ground before founding
 * and the broken skyline after a ruin.
 */

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

/** Settlement tiers as the prospect grammar sees them (#237 GO condition 2):
 * a realm seat outranks its chart kind, and seats hang arms as capitals do. */
export type ProspectKind = "capital" | "seat" | "town" | "village" | "hamlet";

export type ProspectInput = {
  readonly seed: number;
  /** Index into world.settlements of the world this was sampled from. NOT
   * stable across region sheets, which filter and reindex settlements. */
  readonly index: number;
  readonly name: string;
  readonly kind: ProspectKind;
  readonly score: number;
  readonly harbor: boolean;
  readonly onRiver: boolean;
  readonly founded: number;
  readonly ruined: boolean;
  /** Year of the chronicle's ruin event, when one survived: history caps
   * events at 14, so a ruined settlement can lack a dated event. */
  readonly ruinedYear: number | null;
  /** Realm id (world.realms.labels at the site), -1 when unclaimed. */
  readonly realm: number;
  /** Null on single-realm worlds, which have arms but no realm name. */
  readonly realmName: string | null;
  readonly arms: Arms | null;
  /** Unit vector, viewer through site toward backdrop, in y-south grid space. */
  readonly view: ProspectView;
  /** Site elevation relative to sea level, normalized by the world's span. */
  readonly siteRel: number;
  /** Elevation profile behind the site, left to right, same normalization. */
  readonly backdrop: ReadonlyArray<number>;
  /** Biome band in front of the site, left to right. */
  readonly foreground: ReadonlyArray<BiomeName>;
};

function biomeAt(world: World, x: number, y: number): BiomeName {
  const w = world.elev.w;
  const xi = clamp(Math.round(x), 0, w - 1);
  const yi = clamp(Math.round(y), 0, world.elev.h - 1);
  // world.biomes is a bare Uint8Array indexed x + y * w, never .at(x, y).
  return biomeName(world.biomes[xi + yi * w] as number);
}

/**
 * Sample one settlement's prospect out of its world. Pure: same world and
 * index yield a byte-identical, JSON-serializable ProspectInput.
 */
export function buildProspectInput(world: World, index: number): ProspectInput {
  const s = world.settlements[index];
  if (s === undefined) {
    throw new RangeError(
      `settlement index ${index} out of range 0..${world.settlements.length - 1}`,
    );
  }
  const { elev, seaLevel } = world;
  // The chart's own normalization (map-renderer, biomes): relief relative to
  // sea level over the world's span above it. Sea floor goes negative.
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
  // The ruin YEAR lives only in the event list; the cap of 14 events can
  // drop it, so a ruined settlement may carry ruined: true with a null year.
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
