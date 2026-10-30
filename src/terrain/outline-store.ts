import { isFormId, type OutlineId, type PlaceId } from "../world/outline-ids.ts";
import { decodeRings, type Rings } from "./outline-codec.ts";
import { OUTLINE_RINGS } from "./outlines.ts";

export type PlaceSource = (id: PlaceId) => string | undefined;

let source: PlaceSource | null = null;
let generation = 0;
let last: { readonly id: PlaceId; readonly rings: Rings } | null = null;

export function setPlaceSource(next: PlaceSource | null): void {
  source = next;
  generation++;
  last = null;
}

export function sourceGeneration(): number {
  return generation;
}

export function ringsOf(id: OutlineId): Rings {
  if (isFormId(id)) return OUTLINE_RINGS[id];
  if (last !== null && last.id === id) return last.rings;
  const text = source === null ? undefined : source(id);
  if (text === undefined) throw new RangeError(`outline ${id} is not loaded`);
  const rings = decodeRings(text);
  last = { id, rings };
  return rings;
}
