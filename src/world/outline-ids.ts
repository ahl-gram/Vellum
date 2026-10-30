import { PLACE_ID_LIST } from "./outline-place-ids.ts";

export const OUTLINE_IDS = ["round", "crescent", "ring"] as const;

export type FormId = (typeof OUTLINE_IDS)[number];
export type PlaceId = string & { readonly placeId: true };
export type OutlineId = FormId | PlaceId;

const FORMS: ReadonlySet<string> = new Set(OUTLINE_IDS);
const PLACES: ReadonlySet<string> = new Set(PLACE_ID_LIST.split("\n"));

export function isFormId(value: string): value is FormId {
  return FORMS.has(value);
}

export function isOutlineId(value: string): value is OutlineId {
  return FORMS.has(value) || PLACES.has(value);
}

export function placeId(value: string): PlaceId {
  if (!PLACES.has(value)) throw new RangeError(`no place is called ${value}`);
  return value as PlaceId;
}
