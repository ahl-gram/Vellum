// The detail chain's parent fields, held across region jobs the way world-cache.ts holds the
// base world: buildChainedField's own cache is per-call, so without this every settle rebuilds
// the whole ancestry and a pan costs as much as the first descent. A hit returns the field that
// call would have built, since chainCacheKey covers every input region.ts varies. Both sliders
// move seaLevel, which is IN that key, so a drag misses rather than serving a stale waterline.
// Measured 2026-08-23, seed 2, coastWarp 0.1 against 0.9: seaLevel 0.464777340 against
// 0.462589513, so the two never share a key.
import { createChainCache } from "../../world/detail-chain.ts";
import { LOD_BANDS } from "../../world/lod.ts";

// Sized for a descent plus a little pan room: the deepest window's whole ancestry, plus eight
// more entries, which is a lattice ring of neighbour targets but NOT the ancestors those
// neighbours bring with them, so a full ring pan still turns the LRU over. About 7 MB held at
// 320x240 Float64. Raising it buys pan smoothness at that rate.
const NEIGHBOURS = 8;
const CAPACITY = LOD_BANDS.length + NEIGHBOURS;

export const regionChainCache = createChainCache(CAPACITY);
