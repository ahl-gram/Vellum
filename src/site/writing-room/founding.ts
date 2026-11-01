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
  return (
    f.steered.some((r) => r.steers.some((s) => s.subject === "band")) &&
    f.steered.every((r) => r.steers.every((s) => s.subject === "band" || s.subject === "culture"))
  );
}

export function recipeOverrides(f: Founding): Partial<WorldRecipe> {
  return { ...f.overrides, ...(lettered(f) ? { foundingText: f.sentence } : {}) };
}

export function createFounder(names: NameSource): Founder {
  let rows: ReadonlyArray<GazetteerRow> | null = null;
  async function found(sentence: string, version: number): Promise<Founding | RoomRefusal> {
    const first = foundWorld(sentence, version);
    if (first.ok) return first;
    if (first.reason !== "places-not-loaded") return { ok: false, reason: first.reason };
    if (rows !== null) return unread;
    const fetched = await names().catch(() => null);
    if (fetched === null || !installNames(fetched)) return unread;
    rows = fetched;
    const again = foundWorld(sentence, version);
    if (again.ok) return again;
    return { ok: false, reason: again.reason === "places-not-loaded" ? "names-unread" : again.reason };
  }
  return { found, installed: () => rows };
}
