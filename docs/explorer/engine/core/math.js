export function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
}
export function lerp(a, b, t) {
    return a + (b - a) * t;
}
export function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
}
