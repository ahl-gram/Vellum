import { foundWorld, type Founding } from "../../world/founding/found.ts";
import type { RefusalReason } from "../../world/founding/normalize.ts";
import type { GazetteerRow } from "../../world/founding/shapes.ts";
import type { WorldRecipe } from "../../world/types.ts";
import { installNames } from "./names.ts";

export type RoomReason = Exclude<RefusalReason, "places-not-loaded"> | "names-unread";
export type RoomRefusal = { readonly ok: false; readonly reason: RoomReason };
export type NameSource = () => Promise<ReadonlyArray<GazetteerRow>>;
export type Founder = {
  readonly found: (sentence: string, version: number) => Promise<Founding | RoomRefusal>;
  readonly installed: () => ReadonlyArray<GazetteerRow> | null;
};

const unread: RoomRefusal = { ok: false, reason: "names-unread" };

export const lettered = (f: Founding): boolean => f.steered.length + f.contested.length > 0;

export function opensOnPlate(f: Founding): boolean {
  void f;
  return false;
}

export function recipeOverrides(f: Founding): Partial<WorldRecipe> {
  return f.overrides;
}

export function createFounder(names: NameSource): Founder {
  void [names, installNames, unread];
  return { found: (s, v) => Promise.resolve(foundWorld(s, v) as never), installed: () => null };
}
