import type { WorldRecipe } from "../../world/types.ts";
import { emitLandKeys, gateLand } from "./address-grammar.ts";
import { SHAPE_KEYS, shapeOf } from "./shape-address.ts";

const FOUND_KEY = "found";
const VERSION_KEY = "v";
const UNVERSIONED = 1;

export type Written = { readonly sentence: string; readonly version: number };

export function readWritten(hash: string): Written | null {
  const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const sentence = params.get(FOUND_KEY);
  if (sentence === null) return null;
  const raw = params.get(VERSION_KEY);
  if (raw === null) return { sentence, version: UNVERSIONED };
  return { sentence, version: /^[1-9][0-9]{0,8}$/.test(raw) ? Number(raw) : 0 };
}

export function writtenHash(sentence: string, version: number): string {
  return (
    "#" +
    new URLSearchParams([
      [FOUND_KEY, sentence],
      [VERSION_KEY, String(version)],
    ]).toString()
  );
}

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
