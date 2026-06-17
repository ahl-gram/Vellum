import { el, renderSvg } from "../svg.js";
// Canonical heraldic tinctures, muted a touch to sit on parchment.
const HERALDIC = {
    or: "#c8a032",
    argent: "#efe8d6",
    gules: "#a83232",
    azure: "#2f5a86",
    sable: "#2b2722",
    vert: "#3f6b46",
    purpure: "#6f4a78",
};
// Monochrome styles read heraldry as a value ladder (hatching is a later polish).
const GREYS = {
    argent: "#f1ece1",
    or: "#d6d0c2",
    vert: "#938a7d",
    gules: "#827a6e",
    azure: "#665f56",
    purpure: "#6f675c",
    sable: "#2b2722",
};
export function paletteForStyle(style) {
    const table = style.name === "ink" ? GREYS : HERALDIC;
    return {
        tincture: (t) => table[t],
        outline: style.ink,
    };
}
function n(x) {
    return Math.round(x * 100) / 100;
}
function geom(cx, cy, size) {
    const w = size;
    const h = size * 1.18;
    const half = w / 2;
    return {
        cx, cy, w, h, half,
        x0: cx - half,
        x1: cx + half,
        top: cy - h / 2,
        bottom: cy + h / 2,
    };
}
/** Heater shield silhouette: flat top, straight upper sides, curved taper. */
function shieldPath(g) {
    const shoulder = g.top + g.h * 0.46;
    const lower = g.top + g.h * 0.82;
    return (`M${n(g.x0)} ${n(g.top)}` +
        `L${n(g.x1)} ${n(g.top)}` +
        `L${n(g.x1)} ${n(shoulder)}` +
        `Q${n(g.x1)} ${n(lower)} ${n(g.cx)} ${n(g.bottom)}` +
        `Q${n(g.x0)} ${n(lower)} ${n(g.x0)} ${n(shoulder)}` +
        `Z`);
}
/** Base field plus, for a divided shield, the second tincture's region. All
 *  are clipped to the silhouette, so simple bbox shapes give exact divisions. */
function fieldNodes(arms, g, pal) {
    const base = el("rect", {
        x: n(g.x0), y: n(g.top), width: n(g.w), height: n(g.h),
        fill: pal.tincture(arms.field[0]),
    });
    if (arms.division === "plain")
        return [base];
    const t1 = pal.tincture(arms.field[1]);
    const polygon = (pts) => el("path", { d: pts + "Z", fill: t1 });
    const P = (x, y, lead = "L") => `${lead}${n(x)} ${n(y)}`;
    switch (arms.division) {
        case "perPale":
            return [base, el("rect", { x: n(g.cx), y: n(g.top), width: n(g.half), height: n(g.h), fill: t1 })];
        case "perFess":
            return [base, el("rect", { x: n(g.x0), y: n(g.cy), width: n(g.w), height: n(g.h / 2), fill: t1 })];
        case "perBend":
            return [base, polygon(P(g.x0, g.top, "M") + P(g.x0, g.bottom) + P(g.x1, g.bottom))];
        case "perChevron":
            return [base, polygon(P(g.cx, g.top + g.h * 0.4, "M") + P(g.x1, g.bottom) + P(g.x0, g.bottom))];
        case "quarterly":
            return [
                base,
                el("rect", { x: n(g.cx), y: n(g.top), width: n(g.half), height: n(g.h / 2), fill: t1 }),
                el("rect", { x: n(g.x0), y: n(g.cy), width: n(g.half), height: n(g.h / 2), fill: t1 }),
            ];
        default:
            return [base];
    }
}
/** Ordinaries are bold bands; drawn as thick clipped strokes that read as
 *  reaching the shield edge. */
function ordinaryNode(ord, g, fill) {
    const bw = g.w * 0.2;
    const common = {
        fill: "none", stroke: fill, "stroke-width": n(bw),
        "stroke-linejoin": "round",
    };
    switch (ord) {
        case "pale":
            return el("path", { d: `M${n(g.cx)} ${n(g.top)}L${n(g.cx)} ${n(g.bottom)}`, ...common });
        case "fess":
            return el("path", { d: `M${n(g.x0)} ${n(g.cy)}L${n(g.x1)} ${n(g.cy)}`, ...common });
        case "cross":
            return el("path", {
                d: `M${n(g.cx)} ${n(g.top)}L${n(g.cx)} ${n(g.bottom)}M${n(g.x0)} ${n(g.cy)}L${n(g.x1)} ${n(g.cy)}`,
                ...common, "stroke-width": n(g.w * 0.16),
            });
        case "bend":
            return el("path", { d: `M${n(g.x0)} ${n(g.top)}L${n(g.x1)} ${n(g.bottom)}`, ...common });
        case "chevron":
            return el("path", {
                d: `M${n(g.x0)} ${n(g.bottom - g.h * 0.08)}L${n(g.cx)} ${n(g.cy - g.h * 0.04)}L${n(g.x1)} ${n(g.bottom - g.h * 0.08)}`,
                ...common,
            });
    }
}
/** A culture charge centered at (X, Y) within radius R, in tincture `fill`. */
function chargeGlyph(charge, X, Y, R, fill, outline) {
    const sw = n(R * 0.16);
    const line = { fill: "none", stroke: fill, "stroke-width": sw, "stroke-linecap": "round", "stroke-linejoin": "round" };
    const solid = { fill, stroke: outline, "stroke-width": n(R * 0.05), "stroke-linejoin": "round" };
    const kids = [];
    const M = (x, y) => `M${n(x)} ${n(y)}`;
    const L = (x, y) => `L${n(x)} ${n(y)}`;
    const Q = (cx, cy, x, y) => `Q${n(cx)} ${n(cy)} ${n(x)} ${n(y)}`;
    switch (charge) {
        case "ship":
            kids.push(el("path", { d: M(X - R, Y + R * 0.2) + Q(X, Y + R, X + R, Y + R * 0.2) + "Z", ...solid }));
            kids.push(el("path", { d: M(X, Y + R * 0.2) + L(X, Y - R), ...line }));
            kids.push(el("path", { d: M(X, Y - R * 0.9) + L(X + R * 0.7, Y) + L(X, Y) + "Z", ...solid }));
            break;
        case "anchor":
            kids.push(el("circle", { cx: n(X), cy: n(Y - R * 0.78), r: n(R * 0.2), fill: "none", stroke: fill, "stroke-width": sw }));
            kids.push(el("path", { d: M(X, Y - R * 0.58) + L(X, Y + R * 0.75), ...line }));
            kids.push(el("path", { d: M(X - R * 0.45, Y - R * 0.35) + L(X + R * 0.45, Y - R * 0.35), ...line }));
            kids.push(el("path", { d: M(X, Y + R * 0.75) + Q(X - R * 0.8, Y + R * 0.7, X - R * 0.55, Y + R * 0.2), ...line }));
            kids.push(el("path", { d: M(X, Y + R * 0.75) + Q(X + R * 0.8, Y + R * 0.7, X + R * 0.55, Y + R * 0.2), ...line }));
            break;
        case "trident":
            kids.push(el("path", { d: M(X, Y - R * 0.2) + L(X, Y + R * 0.95), ...line }));
            kids.push(el("path", {
                d: M(X - R * 0.5, Y - R * 0.15) + L(X - R * 0.5, Y - R * 0.8) +
                    M(X, Y - R * 0.15) + L(X, Y - R * 0.95) +
                    M(X + R * 0.5, Y - R * 0.15) + L(X + R * 0.5, Y - R * 0.8) +
                    M(X - R * 0.5, Y - R * 0.15) + L(X + R * 0.5, Y - R * 0.15),
                ...line,
            }));
            break;
        case "axe":
            kids.push(el("path", { d: M(X - R * 0.4, Y + R * 0.9) + L(X + R * 0.25, Y - R * 0.9), ...line }));
            kids.push(el("path", { d: M(X + R * 0.1, Y - R * 0.9) + Q(X + R, Y - R * 0.45, X + R * 0.45, Y - R * 0.05) + "Z", ...solid }));
            break;
        case "raven":
            // a bird with wings swept up to a small head, over a short body
            kids.push(el("path", {
                d: M(X - R, Y) + Q(X - R * 0.5, Y - R * 0.6, X - R * 0.12, Y - R * 0.05) +
                    M(X + R, Y) + Q(X + R * 0.5, Y - R * 0.6, X + R * 0.12, Y - R * 0.05),
                ...line, "stroke-width": n(R * 0.2),
            }));
            kids.push(el("circle", { cx: n(X), cy: n(Y - R * 0.2), r: n(R * 0.16), fill }));
            kids.push(el("path", { d: M(X, Y - R * 0.05) + L(X, Y + R * 0.55), ...line, "stroke-width": n(R * 0.2) }));
            break;
        case "mountain":
            kids.push(el("path", { d: M(X - R, Y + R * 0.6) + L(X - R * 0.2, Y - R * 0.5) + L(X + R * 0.35, Y + R * 0.6) + "Z", ...solid }));
            kids.push(el("path", { d: M(X - R * 0.15, Y + R * 0.6) + L(X + R * 0.45, Y - R * 0.85) + L(X + R, Y + R * 0.6) + "Z", ...solid }));
            break;
        case "sun": {
            kids.push(el("circle", { cx: n(X), cy: n(Y), r: n(R * 0.42), ...solid }));
            let rays = "";
            for (let k = 0; k < 8; k++) {
                const a = (k * Math.PI) / 4;
                const a2 = a + Math.PI / 16;
                const a3 = a - Math.PI / 16;
                rays += M(X + Math.cos(a) * R, Y + Math.sin(a) * R) +
                    L(X + Math.cos(a2) * R * 0.5, Y + Math.sin(a2) * R * 0.5) +
                    L(X + Math.cos(a3) * R * 0.5, Y + Math.sin(a3) * R * 0.5) + "Z";
            }
            kids.push(el("path", { d: rays, ...solid }));
            break;
        }
        case "crescent":
            kids.push(el("path", {
                d: M(X + R * 0.25, Y - R * 0.92) +
                    `A${n(R)} ${n(R)} 0 1 0 ${n(X + R * 0.25)} ${n(Y + R * 0.92)}` +
                    `A${n(R * 0.78)} ${n(R * 0.78)} 0 1 1 ${n(X + R * 0.25)} ${n(Y - R * 0.92)}Z`,
                ...solid,
            }));
            break;
        case "scimitar":
            // a curved sabre rising from a straight grip, distinct from the crescent
            kids.push(el("path", {
                d: M(X - R * 0.45, Y + R * 0.9) + L(X - R * 0.2, Y + R * 0.45) +
                    Q(X + R * 0.25, Y - R * 0.2, X + R * 0.6, Y - R * 0.9),
                ...line, "stroke-width": n(R * 0.22),
            }));
            kids.push(el("path", { d: M(X - R * 0.5, Y + R * 0.32) + L(X + R * 0.05, Y + R * 0.55), ...line }));
            kids.push(el("circle", { cx: n(X - R * 0.47), cy: n(Y + R * 0.92), r: n(R * 0.12), fill }));
            break;
        case "oak":
            kids.push(el("rect", { x: n(X - R * 0.12), y: n(Y + R * 0.05), width: n(R * 0.24), height: n(R * 0.85), fill, stroke: outline, "stroke-width": n(R * 0.05) }));
            kids.push(el("circle", { cx: n(X), cy: n(Y - R * 0.4), r: n(R * 0.5), ...solid }));
            kids.push(el("circle", { cx: n(X - R * 0.45), cy: n(Y - R * 0.02), r: n(R * 0.4), ...solid }));
            kids.push(el("circle", { cx: n(X + R * 0.45), cy: n(Y - R * 0.02), r: n(R * 0.4), ...solid }));
            break;
        case "leaf":
            kids.push(el("path", { d: M(X, Y - R) + Q(X + R * 0.72, Y, X, Y + R) + Q(X - R * 0.72, Y, X, Y - R) + "Z", ...solid }));
            kids.push(el("path", { d: M(X, Y - R * 0.8) + L(X, Y + R * 0.8), ...line, "stroke-width": n(R * 0.08), stroke: outline }));
            break;
        case "star": {
            let d = "";
            for (let k = 0; k < 5; k++) {
                const ao = (-Math.PI / 2) + (k * 2 * Math.PI) / 5;
                const ai = ao + Math.PI / 5;
                d += (k === 0 ? "M" : "L") + `${n(X + Math.cos(ao) * R)} ${n(Y + Math.sin(ao) * R)}`;
                d += `L${n(X + Math.cos(ai) * R * 0.42)} ${n(Y + Math.sin(ai) * R * 0.42)}`;
            }
            kids.push(el("path", { d: d + "Z", ...solid }));
            break;
        }
        case "wave":
            for (const dy of [-R * 0.45, R * 0.05, R * 0.55]) {
                kids.push(el("path", {
                    d: M(X - R, Y + dy) + Q(X - R * 0.5, Y + dy - R * 0.3, X, Y + dy) + Q(X + R * 0.5, Y + dy + R * 0.3, X + R, Y + dy),
                    ...line, "stroke-width": n(R * 0.13),
                }));
            }
            break;
        case "fish":
            kids.push(el("path", { d: M(X - R * 0.8, Y) + Q(X, Y - R * 0.6, X + R * 0.5, Y) + Q(X, Y + R * 0.6, X - R * 0.8, Y) + "Z", ...solid }));
            kids.push(el("path", { d: M(X + R * 0.4, Y) + L(X + R, Y - R * 0.42) + L(X + R, Y + R * 0.42) + "Z", ...solid }));
            kids.push(el("circle", { cx: n(X - R * 0.45), cy: n(Y - R * 0.08), r: n(R * 0.08), fill: outline }));
            break;
        case "turtle":
            kids.push(el("ellipse", { cx: n(X - R * 0.1), cy: n(Y), rx: n(R * 0.7), ry: n(R * 0.55), ...solid }));
            kids.push(el("circle", { cx: n(X + R * 0.78), cy: n(Y), r: n(R * 0.2), ...solid }));
            for (const [dx, dy] of [[-0.5, -0.55], [0.45, -0.55], [-0.5, 0.55], [0.45, 0.55]]) {
                kids.push(el("ellipse", { cx: n(X + R * dx), cy: n(Y + R * dy), rx: n(R * 0.2), ry: n(R * 0.13), fill }));
            }
            break;
        case "tower":
            kids.push(el("rect", { x: n(X - R * 0.55), y: n(Y - R * 0.35), width: n(R * 1.1), height: n(R * 1.25), ...solid }));
            for (const dx of [-0.5, -0.1, 0.3]) {
                kids.push(el("rect", { x: n(X + R * dx), y: n(Y - R * 0.62), width: n(R * 0.28), height: n(R * 0.3), fill }));
            }
            kids.push(el("rect", { x: n(X - R * 0.18), y: n(Y + R * 0.4), width: n(R * 0.36), height: n(R * 0.5), fill: outline }));
            break;
        case "sword":
            kids.push(el("path", { d: M(X, Y - R) + L(X + R * 0.15, Y + R * 0.35) + L(X - R * 0.15, Y + R * 0.35) + "Z", ...solid }));
            kids.push(el("rect", { x: n(X - R * 0.5), y: n(Y + R * 0.35), width: n(R), height: n(R * 0.16), fill }));
            kids.push(el("path", { d: M(X, Y + R * 0.5) + L(X, Y + R * 0.9), ...line }));
            break;
        case "flame":
            kids.push(el("path", { d: M(X, Y + R * 0.9) + Q(X - R * 0.75, Y + R * 0.1, X, Y - R) + Q(X + R * 0.75, Y + R * 0.1, X, Y + R * 0.9) + "Z", ...solid }));
            kids.push(el("path", { d: M(X, Y + R * 0.8) + Q(X - R * 0.35, Y + R * 0.2, X, Y - R * 0.35) + Q(X + R * 0.35, Y + R * 0.2, X, Y + R * 0.8) + "Z", fill: outline, "fill-opacity": 0.25 }));
            break;
    }
    return el("g", {}, kids);
}
function chargeNodes(arms, g, pal) {
    if (arms.charge === null)
        return [];
    if (arms.charge.kind === "ordinary") {
        return [ordinaryNode(arms.charge.ordinary, g, pal.tincture(arms.charge.tincture))];
    }
    const X = g.cx;
    const Y = g.cy - g.h * 0.02;
    const R = g.w * 0.34;
    return [chargeGlyph(arms.charge.charge, X, Y, R, pal.tincture(arms.charge.tincture), pal.outline)];
}
/** A shield group centered at (cx, cy) with the given width. */
export function armsNode(arms, cx, cy, size, pal, idSuffix) {
    const g = geom(cx, cy, size);
    const d = shieldPath(g);
    const clipId = `vellum-arms-${idSuffix}`;
    return el("g", { class: "vellum-arms" }, [
        el("clipPath", { id: clipId }, [el("path", { d })]),
        el("g", { "clip-path": `url(#${clipId})` }, [
            ...fieldNodes(arms, g, pal),
            ...chargeNodes(arms, g, pal),
        ]),
        el("path", {
            d, fill: "none", stroke: pal.outline,
            "stroke-width": n(g.w * 0.045), "stroke-linejoin": "round",
        }),
    ]);
}
/** A standalone <svg> document for one coat of arms (atlas banners, previews). */
export function armsSvgDocument(arms, size, pal, idSuffix) {
    const pad = size * 0.08;
    const w = size + 2 * pad;
    const h = size * 1.18 + 2 * pad;
    const svg = el("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: n(w),
        height: n(h),
        viewBox: `0 0 ${n(w)} ${n(h)}`,
        role: "img",
        "aria-label": "A procedural coat of arms",
    }, [armsNode(arms, w / 2, h / 2, size, pal, idSuffix)]);
    return renderSvg(svg);
}
/**
 * On-map layer: a small shield just above each placed realm label. Opt-in
 * (gated on RenderOptions.arms in the renderer). Arms are decorative and added
 * last, so each yields to existing labels via the arena and is skipped rather
 * than allowed to collide or spill past the map frame.
 */
export function heraldryLayer(ctx, anchors) {
    const { world, style, proj, labels } = ctx;
    if (world.arms.length === 0)
        return null;
    const k = proj.widthPx / 1500;
    const pal = paletteForStyle(style);
    const size = 30 * k;
    const sh = size * 1.18;
    const gap = 6 * k;
    const m = proj.margin;
    // Multi-realm worlds anchor a shield to each realm label. A single-realm
    // world (citystate, small island) has no realm label, so its one coat of
    // arms rides beside the realm seat instead, so --arms always shows something.
    let placements = anchors;
    if (placements.length === 0) {
        const seatIdx = world.realms.seats[0];
        const seat = seatIdx !== undefined ? world.settlements[seatIdx] : undefined;
        if (seat === undefined)
            return null;
        placements = [
            { realm: 0, cx: proj.px(seat.x), cy: proj.py(seat.y), halfW: 22 * k, halfH: 16 * k },
        ];
    }
    const nodes = [];
    for (const a of placements) {
        const arms = world.arms[a.realm];
        if (arms === undefined)
            continue;
        // try each side of the label; arms are decorative, so they yield to real
        // labels and, if boxed in on every side, are skipped rather than overlap
        const candidates = [
            [a.cx, a.cy - a.halfH - gap - sh / 2],
            [a.cx - a.halfW - gap - size / 2, a.cy],
            [a.cx + a.halfW + gap + size / 2, a.cy],
            [a.cx, a.cy + a.halfH + gap + sh / 2],
        ];
        for (const [cx, cy] of candidates) {
            const box = { x: cx - size / 2, y: cy - sh / 2, w: size, h: sh };
            if (box.x < m || box.y < m || box.x + box.w > proj.widthPx - m || box.y + box.h > proj.heightPx - m) {
                continue;
            }
            if (!labels.tryClaim(box, 2))
                continue;
            nodes.push(armsNode(arms, cx, cy, size, pal, `m${a.realm}`));
            break;
        }
    }
    return nodes.length > 0 ? el("g", { id: "layer-heraldry" }, nodes) : null;
}
