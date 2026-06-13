import { clamp } from "../../core/math.js";
import { el, pathFrom } from "../svg.js";
/** Chaikin corner-cutting over (x, y, width) triples. */
function smoothWeighted(pts, iterations) {
    let cur = [...pts];
    for (let it = 0; it < iterations; it++) {
        if (cur.length < 3)
            return cur;
        const next = [cur[0]];
        for (let i = 0; i < cur.length - 1; i++) {
            const p = cur[i];
            const q = cur[i + 1];
            next.push([
                0.75 * p[0] + 0.25 * q[0],
                0.75 * p[1] + 0.25 * q[1],
                0.75 * p[2] + 0.25 * q[2],
            ], [
                0.25 * p[0] + 0.75 * q[0],
                0.25 * p[1] + 0.75 * q[1],
                0.25 * p[2] + 0.75 * q[2],
            ]);
        }
        next.push(cur[cur.length - 1]);
        cur = next;
    }
    return cur;
}
export function riversLayer(ctx) {
    const { world, proj, style } = ctx;
    const widthScale = proj.scale / 4.3;
    const groups = [];
    world.rivers.forEach((river, idx) => {
        const weighted = river.points.map((p) => [
            proj.px(p.x),
            proj.py(p.y),
            clamp(0.35 + Math.sqrt(p.acc) * 0.05, 0.7, 4.8) * widthScale,
        ]);
        const smooth = smoothWeighted(weighted, 2);
        // group consecutive points into short constant-width segments
        const STEP = 4;
        const segs = [];
        for (let i = 0; i < smooth.length - 1; i += STEP) {
            const end = Math.min(i + STEP, smooth.length - 1);
            const slice = smooth.slice(i, end + 1);
            const w = slice[Math.floor(slice.length / 2)][2];
            segs.push(el("path", {
                d: pathFrom(slice.map(([x, y]) => [x, y]), false),
                fill: "none",
                stroke: style.river,
                "stroke-width": w,
                "stroke-linecap": "round",
                "stroke-linejoin": "round",
            }));
        }
        groups.push(el("g", { id: `river-${idx}` }, segs));
    });
    return el("g", { id: "layer-rivers", "stroke-opacity": 0.92 }, groups);
}
