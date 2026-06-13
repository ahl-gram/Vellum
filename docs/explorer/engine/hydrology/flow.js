import { NEIGHBORS_8 } from "../core/grid.js";
import { createMinHeap } from "../core/heap.js";
const EPS = 1e-7;
export function computeFlow(elev, seaLevel, rain) {
    const { w, h, data } = elev;
    const n = w * h;
    // --- priority-flood: raise pits to their spill level (+EPS, so no flats) ---
    const fill = Float64Array.from(data);
    const visited = new Uint8Array(n);
    const heap = createMinHeap();
    let seeded = false;
    for (let i = 0; i < n; i++) {
        if (data[i] <= seaLevel) {
            visited[i] = 1;
            heap.push(i, fill[i]);
            seeded = true;
        }
    }
    if (!seeded) {
        let mi = 0;
        for (let i = 1; i < n; i++) {
            if (data[i] < data[mi])
                mi = i;
        }
        visited[mi] = 1;
        heap.push(mi, fill[mi]);
    }
    while (heap.size() > 0) {
        const i = heap.pop();
        const x = i % w;
        const y = (i / w) | 0;
        for (const [dx, dy] of NEIGHBORS_8) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || nx >= w || ny < 0 || ny >= h)
                continue;
            const ni = nx + ny * w;
            if (visited[ni])
                continue;
            visited[ni] = 1;
            fill[ni] = Math.max(data[ni], fill[i] + EPS);
            heap.push(ni, fill[ni]);
        }
    }
    // --- D8 steepest descent on the filled surface ---
    const dir = new Int32Array(n).fill(-1);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = x + y * w;
            if (data[i] <= seaLevel)
                continue;
            let best = -1;
            let bestDrop = 0;
            for (const [dx, dy, dist] of NEIGHBORS_8) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx < 0 || nx >= w || ny < 0 || ny >= h)
                    continue;
                const ni = nx + ny * w;
                const drop = (fill[i] - fill[ni]) / dist;
                if (drop > bestDrop) {
                    bestDrop = drop;
                    best = ni;
                }
            }
            dir[i] = best;
        }
    }
    // --- accumulate downstream, highest fill first ---
    const acc = new Float64Array(n);
    const landOrder = [];
    for (let i = 0; i < n; i++) {
        if (data[i] > seaLevel)
            landOrder.push(i);
    }
    landOrder.sort((a, b) => fill[b] - fill[a]);
    for (const i of landOrder) {
        acc[i] = acc[i] + (rain ? rain[i] : 1);
        const d = dir[i];
        if (d >= 0)
            acc[d] = acc[d] + acc[i];
    }
    return { fill, dir, acc };
}
