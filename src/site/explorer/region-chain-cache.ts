// The detail chain's parent fields, held across region jobs (buildChainedField's own cache is per-call, so without this every settle rebuilds the whole ancestry and a pan costs as much as the first descent).
// Both sliders move seaLevel, which is in chainCacheKey, so a drag misses rather than serving a stale waterline (measured 2026-08-23, seed 2: coastWarp 0.1 gives seaLevel 0.464777340, 0.9 gives 0.462589513).
import { createChainCache } from "../../world/detail-chain.ts";
import { LOD_BANDS } from "../../world/lod.ts";

// Capacity: the deepest window's whole ancestry plus a lattice ring of neighbour targets (not their ancestors, so a full ring pan still turns the LRU over); about 7 MB held at 320x240 Float64.
const NEIGHBOURS = 8;
const CAPACITY = LOD_BANDS.length + NEIGHBOURS;

export const regionChainCache = createChainCache(CAPACITY);
