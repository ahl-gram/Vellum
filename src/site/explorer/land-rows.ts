import type { ShapeOverrides } from "../shared/shape-address.ts";
import type { OutlineId } from "../../world/outline-ids.ts";
import type { IsleSize } from "../../terrain/lobes.ts";

export const LAND_ROWS = ["place", "looseness", "islands", "sizes", "land", "coast", "ragged"] as const;
export type LandRow = (typeof LAND_ROWS)[number];
export type RowState = "live" | "held" | "hidden";

export const HELD_NOTES: Readonly<Record<"plain" | "exact" | "loose" | "counted" | "archExact" | "archLoose", string>> = {
  plain: "the looseness waits for a place to loosen",
  exact: "the outline holds the sea level and the coast; loosen it to free the coast",
  loose: "the outline holds the sea level",
  counted: "the count holds the sea level, and the looseness waits for a place",
  archExact: "the outline holds the count, the sea level and the coast; clear the place to free the islands",
  archLoose: "the outline holds the count and the sea level; clear the place to free the islands",
};

export interface LandSeat {
  readonly rows: Readonly<Record<LandRow, RowState>>;
  readonly note: string;
}

export function seatOf(_type: string, _choice: ShapeOverrides): LandSeat {
  return {
    rows: { place: "live", looseness: "live", islands: "live", sizes: "live", land: "live", coast: "live", ragged: "live" },
    note: "",
  };
}

export const ISLANDS_SEEDS_CHOICE = 1;
export const looseWord = (_looseness: number): string => "";
export const islandsWord = (_slider: number): string => "";
export const raggedWord = (_raggedness: number): string => "";

export type ShapeEdit =
  | { readonly kind: "place"; readonly id: OutlineId | null }
  | { readonly kind: "looseness"; readonly slider: number }
  | { readonly kind: "islands"; readonly slider: number }
  | { readonly kind: "size"; readonly size: IsleSize }
  | { readonly kind: "raggedness"; readonly slider: number };

export function nextChoice(choice: ShapeOverrides, _edit: ShapeEdit): ShapeOverrides {
  return choice;
}

export interface ShapeSliders {
  readonly looseness: number;
  readonly islands: number;
  readonly raggedness: number;
  readonly size: IsleSize;
}

export function slidersOf(_choice: ShapeOverrides): ShapeSliders {
  return { looseness: 0, islands: 1, raggedness: 0, size: "equal" };
}
