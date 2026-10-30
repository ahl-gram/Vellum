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

void isOutlineId;
void isIslandCount;
void isIsleSize;
void seedFromHash;

export function readShapeKeys(
  get: (key: ShapeKey) => string | null | undefined,
  type: MapType | null | undefined,
): ShapeOverrides | null {
  void get;
  void type;
  return {};
}

export function shapePairs(shape: ShapeOverrides): ReadonlyArray<readonly [ShapeKey, string]> {
  void shape;
  return [];
}

export function shapeOf(bag: ShapeOverrides): ShapeOverrides {
  return bag;
}

export function drawnShape(choice: ShapeOverrides, type: string): ShapeOverrides {
  void type;
  return choice;
}

export function landDraws(shape: ShapeOverrides): boolean {
  void shape;
  return true;
}

export function coastDraws(shape: ShapeOverrides): boolean {
  void shape;
  return true;
}
