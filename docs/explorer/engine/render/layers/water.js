import { minMax } from "../../core/grid.js";
import { chaikinSmooth, closedIsoRings } from "../../terrain/contours.js";
import { el, pathFrom } from "../svg.js";
export function oceanLayer(ctx) {
    const { proj, style, world } = ctx;
    const m = proj.margin;
    const children = [
        el("rect", {
            x: m,
            y: m,
            width: proj.widthPx - 2 * m,
            height: proj.heightPx - 2 * m,
            fill: style.oceanDeep ?? style.ocean,
        }),
    ];
    if (style.oceanDeep) {
        // paint progressively shallower water over the deep base
        const { min } = minMax(world.elev);
        const below = world.seaLevel - min;
        const bands = [
            { frac: 0.3, color: style.ocean, opacity: 0.55 },
            { frac: 0.12, color: style.ocean, opacity: 1 },
        ];
        for (const band of bands) {
            const iso = world.seaLevel - band.frac * below;
            const rings = closedIsoRings(world.elev, iso).map((c) => chaikinSmooth(c.points, true, 1));
            if (rings.length === 0)
                continue;
            const d = rings
                .map((r) => pathFrom(r.map(([x, y]) => [proj.px(x), proj.py(y)]), true))
                .join("");
            children.push(el("path", {
                d,
                fill: band.color,
                "fill-opacity": band.opacity,
                "fill-rule": "evenodd",
            }));
        }
    }
    if (style.shoalTint) {
        // shallow-water wash out to the dashed "danger line" (nautical)
        const { min } = minMax(world.elev);
        const iso = world.seaLevel - 0.08 * (world.seaLevel - min);
        const rings = closedIsoRings(world.elev, iso).map((c) => chaikinSmooth(c.points, true, 2));
        if (rings.length > 0) {
            const d = rings
                .map((r) => pathFrom(r.map(([x, y]) => [proj.px(x), proj.py(y)]), true))
                .join("");
            children.push(el("path", { d, fill: style.shoalTint, "fill-rule": "evenodd" }), el("path", {
                d,
                fill: "none",
                stroke: style.inkSoft,
                "stroke-width": 0.8,
                "stroke-dasharray": "4 2.6",
                "stroke-opacity": 0.55,
            }));
        }
    }
    return el("g", { id: "layer-ocean" }, children);
}
export function waterlinesLayer(ctx) {
    const { style, coastRings } = ctx;
    const d = coastRings.map((r) => pathFrom(r, true)).join("");
    const rings = [
        { width: 9, opacity: 0.16 },
        { width: 5.5, opacity: 0.26 },
        { width: 2.6, opacity: 0.42 },
    ];
    return el("g", { id: "layer-waterlines" }, rings.map((r) => el("path", {
        d,
        fill: "none",
        stroke: style.waterline,
        "stroke-width": r.width,
        "stroke-opacity": r.opacity,
    })));
}
