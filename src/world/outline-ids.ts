export const OUTLINE_IDS = ["round", "crescent", "ring"] as const;

export type OutlineId = (typeof OUTLINE_IDS)[number];

export function isOutlineId(value: string): value is OutlineId {
  return (OUTLINE_IDS as readonly string[]).includes(value);
}
