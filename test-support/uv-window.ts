import type { UvWindow } from "../src/terrain/heightfield.ts";

export const quarterWindow = (size: number): UvWindow => ({ u0: 0.25, v0: 0.25, u1: 0.25 + size, v1: 0.25 + size });
