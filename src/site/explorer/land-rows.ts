import { type Written } from "../shared/written-address.ts";
import { coastDraws, drawnShape, landDraws, type ShapeOverrides } from "../shared/shape-address.ts";
import type { OutlineId } from "../../world/outline-ids.ts";
import type { IsleSize } from "../../terrain/lobes.ts";

export const LAND_ROWS = ["type", "band", "place", "looseness", "islands", "sizes", "land", "coast", "ragged"] as const;
export type LandRow = (typeof LAND_ROWS)[number];
export type RowState = "live" | "held" | "hidden";

export const HELD_NOTES: Readonly<
  Record<"plain" | "exact" | "loose" | "counted" | "archExact" | "archLoose" | "written", string>
> = {
  written: "the sentence holds the land; to change it,",
  plain: "the looseness waits for a place to loosen",
  exact: "the outline holds the sea level and the coast; loosen it to free the coast",
  loose: "the outline holds the sea level",
  counted: "the count holds the sea level, and the looseness waits for a place",
  archExact: "the outline holds the count, the sea level and the coast; clear the place to free the islands",
  archLoose: "the outline holds the count and the sea level; clear the place to free the islands",
};

export const WRITE_ANEW = "write it anew in the Writing Room";

export interface LandSeat {
  readonly rows: Readonly<Record<LandRow, RowState>>;
  readonly note: string;
  readonly road?: string;
}

const heldIf = (is: boolean): RowState => (is ? "held" : "live");

export function seatOf(type: string, choice: ShapeOverrides, written: Written | null = null): LandSeat {
  void written;
  return seatPlain(type, choice);
}

function seatPlain(type: string, choice: ShapeOverrides): LandSeat {
  const drawn = drawnShape(choice, type);
  const arch = type === "archipelago";
  const outline = drawn.outline !== undefined;
  const counted = drawn.islands !== undefined;
  const loose = drawn.looseness !== undefined;
  const rows: Record<LandRow, RowState> = {
    type: "live",
    band: "live",
    place: "live",
    looseness: heldIf(!outline),
    islands: arch ? heldIf(outline) : "hidden",
    sizes: arch && choice.islands !== undefined ? heldIf(outline) : "hidden",
    land: heldIf(!landDraws(drawn)),
    coast: counted ? "hidden" : heldIf(!coastDraws(drawn)),
    ragged: counted ? "live" : "hidden",
  };
  const note = outline
    ? arch
      ? loose
        ? HELD_NOTES.archLoose
        : HELD_NOTES.archExact
      : loose
        ? HELD_NOTES.loose
        : HELD_NOTES.exact
    : counted
      ? HELD_NOTES.counted
      : HELD_NOTES.plain;
  return { rows, note };
}

export const ISLANDS_SEEDS_CHOICE = 1;

export const looseWord = (looseness: number): string =>
  looseness === 0 ? "exact" : looseness <= 0.33 ? "soft edge" : looseness <= 0.8 ? "looser" : "nearly the seed's own";

export const islandsWord = (slider: number): string =>
  slider === ISLANDS_SEEDS_CHOICE ? "seed's choice" : `about ${slider}`;

export const raggedWord = (raggedness: number): string =>
  raggedness === 0 ? "round" : `ragged ${raggedness.toFixed(2)}`;

export type ShapeEdit =
  | { readonly kind: "place"; readonly id: OutlineId | null }
  | { readonly kind: "looseness"; readonly slider: number }
  | { readonly kind: "islands"; readonly slider: number }
  | { readonly kind: "size"; readonly size: IsleSize }
  | { readonly kind: "raggedness"; readonly slider: number };

function put(choice: ShapeOverrides, key: keyof ShapeOverrides, value: unknown): ShapeOverrides {
  const next: Record<string, unknown> = { ...choice };
  if (value === undefined) delete next[key];
  else next[key] = value;
  return next;
}

export function nextChoice(choice: ShapeOverrides, edit: ShapeEdit): ShapeOverrides {
  switch (edit.kind) {
    case "place":
      return put(choice, "outline", edit.id ?? undefined);
    case "looseness":
      return put(choice, "looseness", edit.slider === 0 ? undefined : edit.slider / 100);
    case "islands":
      return put(choice, "islands", edit.slider === ISLANDS_SEEDS_CHOICE ? undefined : edit.slider);
    case "size":
      return put(choice, "isleSize", edit.size);
    case "raggedness":
      return put(choice, "raggedness", edit.slider === 0 ? undefined : edit.slider / 100);
  }
}

export interface ShapeSliders {
  readonly looseness: number;
  readonly islands: number;
  readonly raggedness: number;
  readonly size: IsleSize;
}

export const slidersOf = (choice: ShapeOverrides): ShapeSliders => ({
  looseness: Math.round((choice.looseness ?? 0) * 100),
  islands: choice.islands ?? ISLANDS_SEEDS_CHOICE,
  raggedness: Math.round((choice.raggedness ?? 0) * 100),
  size: choice.isleSize ?? "equal",
});
