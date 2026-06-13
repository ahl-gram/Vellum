import { el } from "../svg.js";
import { prunePoints, boxesOverlap } from "../geometry.js";
/**
 * Prevailing-wind arrows over open water (nautical charts). One seeded
 * direction per world, feathered shafts with a little angular jitter so
 * they read as hand-noted observations rather than a stamped pattern.
 */
export function windsLayer(ctx, cartouche, compass) {
    const { style, world, proj, rng } = ctx;
    if (!style.winds)
        return null;
    const k = proj.widthPx / 1500;
    const { w, h } = world.elev;
    const wrng = rng.fork("winds");
    const prevailing = wrng.range(0, Math.PI * 2);
    const avoid = [cartouche.rect];
    if (compass)
        avoid.push(compass.box);
    const clear = (px, py) => avoid.every((b) => !boxesOverlap(b, { x: px - 30, y: py - 30, w: 60, h: 60 }, 8));
    const spots = [];
    for (let gy = 4; gy < h - 4; gy += 3) {
        for (let gx = 4; gx < w - 4; gx += 3) {
            const d = world.oceanDist[gx + gy * w];
            if (d < 6)
                continue;
            const px = proj.px(gx);
            const py = proj.py(gy);
            const edge = Math.min(px - proj.margin, py - proj.margin, proj.widthPx - proj.margin - px, proj.heightPx - proj.margin - py);
            if (edge < 50 * k || !clear(px, py))
                continue;
            spots.push({ x: px, y: py });
        }
    }
    const picked = prunePoints(wrng.shuffled(spots), 165 * k, 9);
    const arrows = [];
    for (const spot of picked) {
        const a = prevailing + wrng.range(-0.16, 0.16);
        const len = (24 + wrng.range(0, 8)) * k;
        const dx = Math.cos(a);
        const dy = Math.sin(a);
        const x1 = spot.x - (dx * len) / 2;
        const y1 = spot.y - (dy * len) / 2;
        const x2 = spot.x + (dx * len) / 2;
        const y2 = spot.y + (dy * len) / 2;
        // chevron head
        const ha = a + Math.PI * 0.82;
        const hb = a - Math.PI * 0.82;
        const hl = 6.5 * k;
        // feather ticks at the tail
        const fa = a + Math.PI / 2;
        const ticks = [];
        for (const t of [0, 0.18]) {
            const tx = x1 + dx * len * t;
            const ty = y1 + dy * len * t;
            ticks.push(`M${tx.toFixed(1)} ${ty.toFixed(1)}L${(tx + Math.cos(fa) * 5 * k).toFixed(1)} ${(ty + Math.sin(fa) * 5 * k).toFixed(1)}`);
        }
        arrows.push(el("path", {
            d: `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}` +
                `M${x2.toFixed(1)} ${y2.toFixed(1)}L${(x2 + Math.cos(ha) * hl).toFixed(1)} ${(y2 + Math.sin(ha) * hl).toFixed(1)}` +
                `M${x2.toFixed(1)} ${y2.toFixed(1)}L${(x2 + Math.cos(hb) * hl).toFixed(1)} ${(y2 + Math.sin(hb) * hl).toFixed(1)}` +
                ticks.join(""),
            fill: "none",
            stroke: style.inkSoft,
            "stroke-width": (1.1 * k).toFixed(2),
            "stroke-opacity": 0.6,
            "stroke-linecap": "round",
        }));
    }
    if (arrows.length === 0)
        return null;
    return el("g", { id: "layer-winds" }, arrows);
}
