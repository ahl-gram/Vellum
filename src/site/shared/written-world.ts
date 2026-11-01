import type { WorldRecipe } from "../../world/types.ts";
import { createNameLoader } from "../explorer/place-names.ts";
import { emitLandKeys, gateLand } from "./address-grammar.ts";
import { createFounder, recipeOverrides, type Founder } from "./founding.ts";
import { SHAPE_KEYS, shapeOf } from "./shape-address.ts";
import { FOUND_KEY, VERSION_KEY, readWritten, type Written } from "./written-address.ts";

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

const IDENTITY_KEYS: ReadonlySet<string> = new Set([
  FOUND_KEY,
  VERSION_KEY,
  "seed",
  "type",
  "band",
  "land",
  "coast",
  ...SHAPE_KEYS,
]);

export function writtenParams(params: URLSearchParams, written: Written | null): URLSearchParams {
  if (written === null) return params;
  return new URLSearchParams([
    [FOUND_KEY, written.sentence],
    [VERSION_KEY, String(written.version)],
    ...[...params].filter(([key]) => !IDENTITY_KEYS.has(key)),
  ]);
}

export function identityParams(
  params: URLSearchParams,
  seed: number,
  overrides: Partial<WorldRecipe>,
): URLSearchParams {
  const out = new URLSearchParams([["seed", String(seed)]]);
  if (overrides.mapType !== undefined) out.set("type", overrides.mapType);
  if (overrides.band !== undefined) out.set("band", overrides.band);
  emitLandKeys(
    out,
    gateLand({ land: overrides.landFraction ?? null, coast: overrides.coastWarp ?? null, shape: shapeOf(overrides) }),
  );
  for (const [key, value] of params) if (!IDENTITY_KEYS.has(key)) out.append(key, value);
  return out;
}
