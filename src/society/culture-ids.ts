export const CULTURE_IDS = [
  "thalassic",
  "norden",
  "veshari",
  "sylvan",
  "tsuren",
  "draket",
  "oromi",
  "zoryan",
  "tezcal",
  "ordai",
] as const;

export type CultureId = (typeof CULTURE_IDS)[number];

export function isCultureId(value: string): value is CultureId {
  return (CULTURE_IDS as readonly string[]).includes(value);
}
