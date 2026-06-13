/**
 * Row-major Float64 scalar fields over a w×h grid.
 *
 * Fields are immutable by convention: builders fill a fresh array at
 * construction, transforms return new fields. Hot loops may read
 * `field.data` directly with `index()` math.
 */
export const NEIGHBORS_4 = [
    [1, 0, 1],
    [-1, 0, 1],
    [0, 1, 1],
    [0, -1, 1],
];
export const NEIGHBORS_8 = [
    [1, 0, 1],
    [-1, 0, 1],
    [0, 1, 1],
    [0, -1, 1],
    [1, 1, Math.SQRT2],
    [1, -1, Math.SQRT2],
    [-1, 1, Math.SQRT2],
    [-1, -1, Math.SQRT2],
];
function wrap(w, h, data) {
    return {
        w,
        h,
        data,
        at: (x, y) => data[x + y * w],
        index: (x, y) => x + y * w,
        inBounds: (x, y) => x >= 0 && x < w && y >= 0 && y < h,
    };
}
export function createField(w, h, fill) {
    const data = new Float64Array(w * h);
    if (fill) {
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                data[x + y * w] = fill(x, y);
            }
        }
    }
    return wrap(w, h, data);
}
export function fieldFrom(w, h, data) {
    if (data.length !== w * h) {
        throw new RangeError(`data length ${data.length} != ${w}×${h}`);
    }
    return wrap(w, h, Float64Array.from(data));
}
export function mapField(f, fn) {
    const data = new Float64Array(f.w * f.h);
    for (let y = 0; y < f.h; y++) {
        for (let x = 0; x < f.w; x++) {
            const i = x + y * f.w;
            data[i] = fn(f.data[i], x, y);
        }
    }
    return wrap(f.w, f.h, data);
}
export function minMax(f) {
    let min = Infinity;
    let max = -Infinity;
    for (const v of f.data) {
        if (v < min)
            min = v;
        if (v > max)
            max = v;
    }
    return { min, max };
}
export function quantile(values, q) {
    const sorted = Float64Array.from(values).sort();
    if (sorted.length === 0)
        throw new RangeError("quantile of empty set");
    const i = Math.min(sorted.length - 1, Math.max(0, Math.floor(q * (sorted.length - 1))));
    return sorted[i];
}
export function normalized(f) {
    const { min, max } = minMax(f);
    const span = max - min || 1;
    return mapField(f, (v) => (v - min) / span);
}
