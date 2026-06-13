import { createField } from "../core/grid.js";
/** Gradient magnitude via central differences (one-sided at edges). */
export function slopeField(elev) {
    const { w, h, data } = elev;
    const at = (x, y) => data[x + y * w];
    return createField(w, h, (x, y) => {
        const x0 = Math.max(0, x - 1);
        const x1 = Math.min(w - 1, x + 1);
        const y0 = Math.max(0, y - 1);
        const y1 = Math.min(h - 1, y + 1);
        const dx = (at(x1, y) - at(x0, y)) / (x1 - x0);
        const dy = (at(x, y1) - at(x, y0)) / (y1 - y0);
        return Math.hypot(dx, dy);
    });
}
