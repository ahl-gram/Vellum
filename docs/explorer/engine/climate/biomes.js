export const BIOMES = {
    ocean: 0,
    beach: 1,
    marsh: 2,
    tundra: 3,
    taiga: 4,
    steppe: 5,
    grassland: 6,
    shrubland: 7,
    temperateForest: 8,
    rainforest: 9,
    savanna: 10,
    desert: 11,
    tropicalForest: 12,
    jungle: 13,
    alpine: 14,
    snow: 15,
};
const NAMES = Object.keys(BIOMES);
export function biomeName(id) {
    const name = NAMES[id];
    if (name === undefined)
        throw new RangeError(`unknown biome id ${id}`);
    return name;
}
function landBiome(rel, t, m) {
    // elevation overrides
    if (rel > 0.82)
        return t < 0.65 ? BIOMES.snow : BIOMES.alpine;
    if (rel > 0.68 && t < 0.75)
        return BIOMES.alpine;
    // shoreline overrides
    if (rel < 0.035 && t > 0.3)
        return BIOMES.beach;
    if (rel < 0.08 && m > 0.78)
        return BIOMES.marsh;
    if (t < 0.22)
        return BIOMES.tundra;
    if (t < 0.42)
        return m < 0.3 ? BIOMES.steppe : BIOMES.taiga;
    if (t < 0.62) {
        if (m < 0.22)
            return BIOMES.steppe;
        if (m < 0.45)
            return BIOMES.grassland;
        if (m < 0.7)
            return BIOMES.temperateForest;
        return BIOMES.rainforest;
    }
    if (t < 0.8) {
        if (m < 0.2)
            return BIOMES.desert;
        if (m < 0.4)
            return BIOMES.shrubland;
        if (m < 0.65)
            return BIOMES.temperateForest;
        return BIOMES.rainforest;
    }
    if (m < 0.25)
        return BIOMES.desert;
    if (m < 0.5)
        return BIOMES.savanna;
    if (m < 0.72)
        return BIOMES.tropicalForest;
    return BIOMES.jungle;
}
export function classifyBiomes(elev, seaLevel, climate) {
    const { data } = elev;
    const out = new Uint8Array(data.length);
    let maxElev = -Infinity;
    for (const v of data)
        maxElev = Math.max(maxElev, v);
    const span = Math.max(1e-9, maxElev - seaLevel);
    for (let i = 0; i < data.length; i++) {
        const e = data[i];
        if (e <= seaLevel) {
            out[i] = BIOMES.ocean;
            continue;
        }
        const rel = (e - seaLevel) / span;
        out[i] = landBiome(rel, climate.temperature.data[i], climate.moisture.data[i]);
    }
    return out;
}
