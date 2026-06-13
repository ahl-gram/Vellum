import { createField } from "../core/grid.js";
import { smoothstep } from "../core/math.js";
import { ridged2, warped2 } from "../noise/fbm.js";
const SHAPES = {
    island: {
        featureScale: 3.0,
        warpStrength: 0.45,
        ridgedWeight: 0.4,
        falloffStart: 0.62,
        falloffEnd: 1.02,
        baseKeep: 0.4,
        sinkDepth: 0.3,
    },
    archipelago: {
        featureScale: 4.6,
        warpStrength: 0.7,
        ridgedWeight: 0.25,
        falloffStart: 0.55,
        falloffEnd: 1.05,
        baseKeep: 0.55,
        sinkDepth: 0.22,
    },
    continent: {
        featureScale: 2.2,
        warpStrength: 0.4,
        ridgedWeight: 0.45,
        falloffStart: 0.78,
        falloffEnd: 1.12,
        baseKeep: 0.55,
        sinkDepth: 0.25,
    },
    // one compact landmass: a city and its hinterland
    citystate: {
        featureScale: 2.6,
        warpStrength: 0.4,
        ridgedWeight: 0.3,
        falloffStart: 0.5,
        falloffEnd: 0.92,
        baseKeep: 0.36,
        sinkDepth: 0.34,
    },
};
const RIDGE_SEED_SALT = 0x7fe9b2c5;
/**
 * Elevation is a pure function of world-space (u, v) and the seed, so a
 * finer grid over the same recipe samples the identical landscape —
 * this is what makes consistent regional zoom charts possible.
 */
export function buildHeightfield(params) {
    const { seed, gridW, gridH, mapType } = params;
    const shape = SHAPES[mapType];
    const featureScale = params.featureScale ?? shape.featureScale;
    const warpStrength = params.warpStrength ?? shape.warpStrength;
    const ridgedWeight = params.ridgedWeight ?? shape.ridgedWeight;
    // span-based aspect: identical for any resolution over the same world
    const aspect = params.worldAspect ?? (gridW - 1) / (gridH - 1);
    const win = params.window ?? { u0: 0, v0: 0, u1: 1, v1: 1 };
    return createField(gridW, gridH, (x, y) => {
        const u = win.u0 + (x / (gridW - 1)) * (win.u1 - win.u0);
        const v = win.v0 + (y / (gridH - 1)) * (win.v1 - win.v0);
        const nx = u * featureScale * aspect;
        const ny = v * featureScale;
        const base = warped2(nx, ny, seed, { octaves: 6, warpStrength });
        const e01 = (base + 1) / 2;
        const ridge = ridged2(nx * 1.8 + 31.4, ny * 1.8 + 27.2, (seed ^ RIDGE_SEED_SALT) >>> 0, { octaves: 5 });
        const ridgeMask = smoothstep(0.52, 0.78, e01);
        let e = e01 + ridgedWeight * ridge * ridgeMask;
        // radial falloff sinks the map edges into ocean
        const dx = (u - 0.5) * 2;
        const dy = (v - 0.5) * 2;
        const d = Math.hypot(dx, dy);
        const falloff = 1 - smoothstep(shape.falloffStart, shape.falloffEnd, d);
        e = e * (shape.baseKeep + (1 - shape.baseKeep) * falloff) -
            (1 - falloff) * shape.sinkDepth;
        // hard guarantee: outermost fringe is always deep water
        const edge = Math.min(u, 1 - u, v, 1 - v);
        e -= (1 - smoothstep(0, 0.05, edge)) * 0.8;
        return e;
    });
}
