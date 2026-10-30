import { isOutlineId, type OutlineId } from "../../world/outline-ids.ts";
import { isIslandCount, isIsleSize, type IsleSize } from "../../terrain/lobes.ts";
import type { MapType } from "../../terrain/heightfield.ts";
import { seedFromHash } from "../explorer/address.ts";

export interface ShapeOverrides {
  readonly outline?: OutlineId;
  readonly looseness?: number;
  readonly islands?: number;
  readonly isleSize?: IsleSize;
  readonly raggedness?: number;
}
export const SHAPE_KEYS = ["outline", "looseness", "islands", "isleSize", "raggedness"] as const;
export type ShapeKey = (typeof SHAPE_KEYS)[number];

const hundredths = (raw: string): number | null => {
  const n = seedFromHash(raw);
  return n === null ? null : Math.min(1, n / 100);
};

/** The shape fields a bag states, with the engine's defaults and the fields its other fields make idle left out. */
function spelt(shape: ShapeOverrides): ShapeOverrides {
  const counted = shape.islands !== undefined;
  return {
    ...(shape.outline !== undefined ? { outline: shape.outline } : {}),
    ...(shape.outline !== undefined && shape.looseness !== undefined && shape.looseness !== 0
      ? { looseness: shape.looseness }
      : {}),
    ...(counted ? { islands: shape.islands } : {}),
    ...(counted && shape.isleSize !== undefined && shape.isleSize !== "equal" ? { isleSize: shape.isleSize } : {}),
    ...(counted && shape.raggedness !== undefined && shape.raggedness !== 0 ? { raggedness: shape.raggedness } : {}),
  };
}

/** The shape a link or sheet states, spelt one way; {} when it states none, null when it states one the engine refuses. */
export function readShapeKeys(
  get: (key: ShapeKey) => string | null | undefined,
  type: MapType | null | undefined,
): ShapeOverrides | null {
  const raw = (key: ShapeKey): string | undefined => get(key) ?? undefined;
  const outlineRaw = raw("outline");
  const loosenessRaw = raw("looseness");
  const islandsRaw = raw("islands");
  const sizeRaw = raw("isleSize");
  const raggedRaw = raw("raggedness");

  const outline = outlineRaw === undefined ? undefined : isOutlineId(outlineRaw) ? outlineRaw : null;
  const looseness = loosenessRaw === undefined ? undefined : hundredths(loosenessRaw);
  const raggedness = raggedRaw === undefined ? undefined : hundredths(raggedRaw);
  const islandsN = islandsRaw === undefined ? undefined : seedFromHash(islandsRaw);
  const islands = islandsN === undefined ? undefined : islandsN !== null && isIslandCount(islandsN) ? islandsN : null;
  const isleSize = sizeRaw === undefined ? undefined : isIsleSize(sizeRaw) ? sizeRaw : null;

  if ([outline, looseness, raggedness, islands, isleSize].includes(null as never)) return null;
  if (looseness !== undefined && outline === undefined) return null;
  if ((isleSize !== undefined || raggedness !== undefined) && islands === undefined) return null;
  if (islands !== undefined && (outline !== undefined || type !== "archipelago")) return null;

  return spelt({
    ...(outline !== undefined ? { outline } : {}),
    ...(looseness !== undefined ? { looseness } : {}),
    ...(islands !== undefined ? { islands } : {}),
    ...(isleSize !== undefined ? { isleSize } : {}),
    ...(raggedness !== undefined ? { raggedness } : {}),
  });
}

/** The keys and values to write, in SHAPE_KEYS order, only for fields present. */
export function shapePairs(shape: ShapeOverrides): ReadonlyArray<readonly [ShapeKey, string]> {
  const pairs: Array<readonly [ShapeKey, string]> = [];
  if (shape.outline !== undefined) pairs.push(["outline", shape.outline]);
  if (shape.looseness !== undefined) pairs.push(["looseness", String(Math.round(shape.looseness * 100))]);
  if (shape.islands !== undefined) pairs.push(["islands", String(shape.islands)]);
  if (shape.isleSize !== undefined) pairs.push(["isleSize", shape.isleSize]);
  if (shape.raggedness !== undefined) pairs.push(["raggedness", String(Math.round(shape.raggedness * 100))]);
  return pairs;
}

/** The shape fields of a bag, and nothing else. */
export function shapeOf(bag: ShapeOverrides): ShapeOverrides {
  return {
    ...(bag.outline !== undefined ? { outline: bag.outline } : {}),
    ...(bag.looseness !== undefined ? { looseness: bag.looseness } : {}),
    ...(bag.islands !== undefined ? { islands: bag.islands } : {}),
    ...(bag.isleSize !== undefined ? { isleSize: bag.isleSize } : {}),
    ...(bag.raggedness !== undefined ? { raggedness: bag.raggedness } : {}),
  };
}

/** What the world draws from a held choice under the type menu's value: defaults left out, the count dropped off the archipelago. */
export function drawnShape(choice: ShapeOverrides, type: string): ShapeOverrides {
  const own = spelt(choice);
  if (own.islands === undefined || (type === "archipelago" && own.outline === undefined)) return own;
  return own.outline === undefined
    ? {}
    : { outline: own.outline, ...(own.looseness !== undefined ? { looseness: own.looseness } : {}) };
}

export const landDraws = (shape: ShapeOverrides): boolean => shape.outline === undefined && shape.islands === undefined;

export const coastDraws = (shape: ShapeOverrides): boolean =>
  shape.islands === undefined && (shape.outline === undefined || shape.looseness !== undefined);
