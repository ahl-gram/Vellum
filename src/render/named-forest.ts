import { BIOMES } from "../climate/biomes.ts";
import type { World } from "../world/types.ts";
import { largestBlob } from "./blobs.ts";

const FOREST_BIOMES: ReadonlySet<number> = new Set<number>([
  BIOMES.temperateForest,
  BIOMES.rainforest,
  BIOMES.tropicalForest,
  BIOMES.jungle,
  BIOMES.taiga,
]);

const NAMED_FOREST_MIN_CELLS = 25;

export function namedForestBlob(world: World): number[] | null {
  if (!world.names.forest) return null;
  const blob = largestBlob(world.elev.w, world.elev.h, (i) => FOREST_BIOMES.has(world.biomes[i] as number));
  return blob.length < NAMED_FOREST_MIN_CELLS ? null : blob;
}
