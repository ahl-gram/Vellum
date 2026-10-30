import type { PlaceId } from "../../world/outline-ids.ts";

export type NameRow = readonly [id: PlaceId, name: string, kind: string, country: string];
export interface PlaceHit {
  readonly id: PlaceId;
  readonly name: string;
  readonly sub: string;
  readonly mark: readonly [number, number] | null;
}
export interface PlaceList {
  readonly hits: ReadonlyArray<PlaceHit>;
  readonly more: number;
}

export const fold = (s: string): string => s;
export const subLine = (_row: NameRow): string => "";
export const NO_SUCH_PLACE = "no such place in the gazetteer";
export const moreWords = (n: number): string => `and ${n} more; type more of the name`;
export const largestNameGroup = (_rows: ReadonlyArray<NameRow>): number => 0;
export const createMatcher =
  (_rows: ReadonlyArray<NameRow>) =>
  (_query: string): PlaceList => ({ hits: [], more: 0 });
export const nameOf = (_rows: ReadonlyArray<NameRow>, _id: PlaceId): string | null => null;
