import type { WorldRecipe } from "../../world/types.ts";
import { createNameLoader } from "../explorer/place-names.ts";
import { createFounder, recipeOverrides, type Founder } from "./founding.ts";
import { readWritten, type Written } from "./written-address.ts";

export type WrittenWorld = Written & { readonly seed: number; readonly overrides: Partial<WorldRecipe> };

export const pageFounder = (): Founder => createFounder(createNameLoader((url) => fetch(url)));

export async function foundAddress(hash: string, founder: Founder): Promise<WrittenWorld | null> {
  void hash;
  void founder;
  void readWritten;
  void recipeOverrides;
  return null;
}

export const heldFor = (written: WrittenWorld | null, seed: number): WrittenWorld | null => {
  void seed;
  return written;
};
