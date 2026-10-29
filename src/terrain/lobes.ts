export const ISLE_SIZES = ["equal", "varied"] as const;

export type IsleSize = (typeof ISLE_SIZES)[number];

export function isIsleSize(value: string): value is IsleSize {
  return (ISLE_SIZES as readonly string[]).includes(value);
}

export const MIN_ISLANDS = 2;
export const MAX_ISLANDS = 100;

export function isIslandCount(value: number): boolean {
  return Number.isInteger(value) && value >= MIN_ISLANDS && value <= MAX_ISLANDS;
}

export function isRaggedness(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}
