// The detail chain's parent fields, held across region jobs the way world-cache.ts holds the
// base world: buildChainedField's own cache is per-call, so without this every settle rebuilds
// the whole ancestry and a pan costs as much as the first descent. Deterministic either way,
// since the key is the full spec (seed, map type, window, grid, aspect, sea level, coast warp):
// a sea-level or coast drag MISSES rather than serving a stale waterline, and a hit returns the
// field that call would have built.
import { createChainCache } from "../../world/detail-chain.ts";
import { LOD_BANDS } from "../../world/lod.ts";

// The working set a pan actually touches: the deepest window's whole ancestry, plus the eight
// lattice neighbours one pan can reach. At 320x240 Float64 that is about 7 MB held.
const NEIGHBOURS = 8;
const CAPACITY = LOD_BANDS.length + NEIGHBOURS;

export const regionChainCache = createChainCache(CAPACITY);
