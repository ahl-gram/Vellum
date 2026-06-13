import { el } from "../svg.js";
function wrapText(text, maxChars) {
    const words = text.split(" ");
    const lines = [];
    let cur = "";
    for (const word of words) {
        if (cur.length + word.length + 1 > maxChars && cur.length > 0) {
            lines.push(cur);
            cur = word;
        }
        else {
            cur = cur ? `${cur} ${word}` : word;
        }
    }
    if (cur)
        lines.push(cur);
    return lines;
}
export function planCartouche(ctx) {
    const { proj, world } = ctx;
    const k = proj.widthPx / 1500;
    const m = proj.margin;
    const lines = wrapText(world.title.subtitle, 58);
    const width = Math.min(470 * k, (proj.widthPx - 2 * m) * 0.38);
    const height = (72 + lines.length * 15 + 16) * k;
    const inset = 20 * k;
    const corners = [
        { corner: "tr", x: proj.widthPx - m - inset - width, y: m + inset },
        { corner: "tl", x: m + inset, y: m + inset },
        { corner: "br", x: proj.widthPx - m - inset - width, y: proj.heightPx - m - inset - height },
        { corner: "bl", x: m + inset, y: proj.heightPx - m - inset - height },
    ];
    // pick the corner with the least land under it
    const { w, data } = world.elev;
    let best = corners[0];
    let bestLand = Infinity;
    for (const c of corners) {
        let land = 0;
        let n = 0;
        for (let sy = 0; sy < 8; sy++) {
            for (let sx = 0; sx < 16; sx++) {
                const gx = Math.round((c.x + (sx / 15) * width - m) / proj.scale);
                const gy = Math.round((c.y + (sy / 7) * height - m) / proj.scale);
                const i = gx + gy * w;
                if (i >= 0 && i < data.length) {
                    n++;
                    if (data[i] > world.seaLevel)
                        land++;
                }
            }
        }
        const frac = n ? land / n : 1;
        if (frac < bestLand - 0.02) {
            bestLand = frac;
            best = c;
        }
    }
    return {
        rect: { x: best.x, y: best.y, w: width, h: height },
        corner: best.corner,
        lines,
    };
}
export function cartoucheLayer(ctx, plan) {
    const { style, world, proj } = ctx;
    const k = proj.widthPx / 1500;
    const { x, y, w, h } = plan.rect;
    const cx = x + w / 2;
    const titleFs = Math.min(27 * k, (w - 56 * k) / (world.title.title.length * 0.58));
    const children = [
        el("rect", {
            x, y, width: w, height: h, rx: 3 * k,
            fill: style.paper, stroke: style.ink, "stroke-width": 2.2 * k,
            "fill-opacity": 0.94,
        }),
        el("rect", {
            x: x + 5 * k, y: y + 5 * k, width: w - 10 * k, height: h - 10 * k,
            fill: "none", stroke: style.ink, "stroke-width": 0.8 * k,
        }),
        // corner flourishes
        ...["tl", "tr", "bl", "br"].map((c) => {
            const fx = c.includes("l") ? x + 5 * k : x + w - 5 * k;
            const fy = c.startsWith("t") ? y + 5 * k : y + h - 5 * k;
            const sx = c.includes("l") ? 1 : -1;
            const sy = c.startsWith("t") ? 1 : -1;
            return el("path", {
                d: `M${fx + sx * 14 * k} ${fy}Q${fx} ${fy} ${fx} ${fy + sy * 14 * k}`,
                fill: "none", stroke: style.ink, "stroke-width": 1.8 * k,
            });
        }),
        el("text", {
            x: cx, y: y + 34 * k, "text-anchor": "middle",
            "font-family": style.fontFamilyTitle,
            "font-size": titleFs.toFixed(1),
            "letter-spacing": (1.4 * k).toFixed(1),
            fill: style.ink,
        }, [world.title.title]),
        // divider with center diamond
        el("line", {
            x1: cx - w * 0.3, y1: y + 46 * k, x2: cx + w * 0.3, y2: y + 46 * k,
            stroke: style.ink, "stroke-width": 0.9 * k,
        }),
        el("path", {
            d: `M${cx} ${y + 42.4 * k}L${cx + 3.6 * k} ${y + 46 * k}L${cx} ${y + 49.6 * k}L${cx - 3.6 * k} ${y + 46 * k}Z`,
            fill: style.ink,
        }),
        ...plan.lines.map((line, i) => el("text", {
            x: cx, y: y + (64 + i * 15) * k, "text-anchor": "middle",
            "font-family": style.fontFamily,
            "font-size": (10.5 * k).toFixed(1),
            "font-style": "italic",
            fill: style.inkSoft,
        }, [line])),
        el("text", {
            x: cx, y: y + h - 11 * k, "text-anchor": "middle",
            "font-family": style.fontFamily,
            "font-size": (9 * k).toFixed(1),
            "letter-spacing": (1.8 * k).toFixed(1),
            fill: style.inkSoft,
        }, [`CHART № ${world.recipe.seed}`]),
    ];
    return el("g", { id: "layer-cartouche" }, children);
}
