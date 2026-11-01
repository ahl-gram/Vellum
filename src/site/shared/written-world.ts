import type { WorldRecipe } from "../../world/types.ts";
import { createNameLoader } from "../explorer/place-names.ts";
import { createFounder, recipeOverrides, type Founder } from "./founding.ts";
import { readWritten, type Written } from "./written-address.ts";

export type WrittenWorld = Written & { readonly seed: number; readonly overrides: Partial<WorldRecipe> };

export const pageFounder = (): Founder => createFounder(createNameLoader((url) => fetch(url)));

export async function foundAddress(hash: string, founder: Founder): Promise<WrittenWorld | null> {
  const w = readWritten(hash);
  if (w === null) return null;
  const f = await founder.found(w.sentence, w.version);
  if (!f.ok) return null;
  return { sentence: f.sentence, version: f.version, seed: f.seed, overrides: recipeOverrides(f) };
}

export const heldFor = (written: WrittenWorld | null, seed: number): WrittenWorld | null =>
  written !== null && written.seed === seed ? written : null;
