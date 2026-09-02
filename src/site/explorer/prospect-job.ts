// The prospect job's engine glue (#242), shared by ./worker.ts and runInline in
// ./worker-client.ts (the serializable-atlas.ts pattern) so the two transports cannot
// drift apart.
import { type ProspectDress, plateDressFor } from "../../prospect/dress/context.ts";
import { engravedProspectPlate } from "../../prospect/finished.ts";
import { gazetteerNoteFor } from "../../atlas/compose.ts";
import type { PlateEra } from "../../prospect/caption.ts";
import { STYLES } from "../../render/style.ts";
import type { World } from "../../world/types.ts";

/** The two engraved dresses a prospect renders in (the #237 contract). */
export type PlateDress = ProspectDress;
export { plateDressFor };

export function resolveProspectIndex(world: World, index: number | null): number {
  if (index != null && Number.isInteger(index) && index >= 0 && index < world.settlements.length) {
    return index;
  }
  const capital = world.settlements.findIndex((s) => s.kind === "capital");
  return capital >= 0 ? capital : 0;
}

export interface ProspectSpec {
  readonly index: number | null;
  readonly dress: PlateDress;
  readonly year: number | null;
}

export interface PlateKeyRow {
  readonly letter: string;
  readonly label: string;
}

export interface ProspectPlateResult {
  readonly svg: string;
  readonly name: string;
  readonly index: number;
  readonly year: number;
  readonly presentYear: number;
  readonly title: string;
  readonly formerName?: string;
  readonly era: PlateEra;
  readonly epithet: string;
  readonly founded: number;
  readonly key: ReadonlyArray<PlateKeyRow>;
  readonly note: string;
}

export function prospectResultFor(world: World, spec: ProspectSpec): ProspectPlateResult {
  const index = resolveProspectIndex(world, spec.index);
  const year = spec.year ?? world.title.year;
  const s = world.settlements[index]!;
  const plate = engravedProspectPlate(world, index, STYLES[spec.dress], year);
  return {
    svg: plate.svg,
    name: s.name,
    ...(s.formerName === undefined ? {} : { formerName: s.formerName }),
    index,
    year,
    presentYear: world.title.year,
    title: world.title.title,
    era: plate.era,
    epithet: plate.caption.epithet,
    founded: s.founded,
    key: plate.key.map(({ letter, label }) => ({ letter, label })),
    note: gazetteerNoteFor(world, index),
  };
}
