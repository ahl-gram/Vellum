import { bfsDistance } from "../core/bfs-distance.js";
import { createField } from "../core/grid.js";
import { clamp, smoothstep } from "../core/math.js";
import { fbm2 } from "../noise/fbm.js";
const BANDS = {
    tropical: { base: 0.6, latSpan: 0.35 },
    temperate: { base: 0.32, latSpan: 0.5 },
    polar: { base: 0.05, latSpan: 0.42 },
};
const LAPSE = 0.85;
const TEMP_SEED_SALT = 0x1b873593;
const MOIST_SEED_SALT = 0xcc9e2d51;
export function computeClimate(elev, seaLevel, seed, opts) {
    const { w, h, data } = elev;
    const band = BANDS[opts.band ?? "temperate"];
    const aspect = opts.worldAspect ?? (w - 1) / (h - 1);
    const win = opts.window ?? { u0: 0, v0: 0, u1: 1, v1: 1 };
    const toU = (x) => win.u0 + (x / (w - 1)) * (win.u1 - win.u0);
    const toV = (y) => win.v0 + (y / (h - 1)) * (win.v1 - win.v0);
    let maxElev = -Infinity;
    for (const v of data)
        maxElev = Math.max(maxElev, v);
    const elevSpan = Math.max(1e-9, maxElev - seaLevel);
    const temperature = createField(w, h, (x, y) => {
        const lat = toV(y); // south (high v) is warm
        const u = toU(x);
        const wobble = fbm2(u * 3 * aspect, lat * 3, (seed ^ TEMP_SEED_SALT) >>> 0, {
            octaves: 3,
        }) * 0.05;
        const e = data[x + y * w];
        const above = Math.max(0, e - seaLevel) / elevSpan;
        return clamp(band.base + band.latSpan * lat + wobble - above * LAPSE, 0, 1);
    });
    const isOcean = (x, y) => data[x + y * w] <= seaLevel;
    const coastDist = bfsDistance(w, h, isOcean);
    const riverCells = opts.riverCells;
    const riverDist = riverCells
        ? bfsDistance(w, h, (x, y) => riverCells[x + y * w] === 1)
        : null;
    const moisture = createField(w, h, (x, y) => {
        const u = toU(x);
        const v = toV(y);
        const base = 0.45 +
            fbm2(u * 4 * aspect + 13.7, v * 4 + 71.3, (seed ^ MOIST_SEED_SALT) >>> 0, {
                octaves: 4,
            }) *
                0.28;
        const i = x + y * w;
        const coastBonus = 0.2 * (1 - smoothstep(0, 18, coastDist[i]));
        const riverBonus = riverDist
            ? 0.3 * (1 - smoothstep(0, 6, riverDist[i]))
            : 0;
        return clamp(base + coastBonus + riverBonus, 0, 1);
    });
    return { temperature, moisture };
}
