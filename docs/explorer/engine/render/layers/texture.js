import { el } from "../svg.js";
/** feTurbulence parchment mottling + radial vignette (antique style). */
export function textureDefs(ctx) {
    if (!ctx.style.parchmentTexture)
        return [];
    const seed = ctx.world.recipe.seed % 997;
    return [
        el("filter", { id: "parchment", x: "0%", y: "0%", width: "100%", height: "100%" }, [
            el("feTurbulence", {
                type: "fractalNoise",
                baseFrequency: "0.012 0.014",
                numOctaves: 3,
                seed,
                stitchTiles: "stitch",
            }),
            el("feColorMatrix", {
                type: "matrix",
                values: "0 0 0 0 0.30  0 0 0 0 0.23  0 0 0 0 0.12  0.45 0 0 0 0",
            }),
        ]),
        el("radialGradient", { id: "vignette", cx: "50%", cy: "48%", r: "72%" }, [
            el("stop", { offset: "62%", "stop-color": "#4a3826", "stop-opacity": 0 }),
            el("stop", { offset: "100%", "stop-color": "#4a3826", "stop-opacity": 0.16 }),
        ]),
    ];
}
export function textureOverlay(ctx) {
    if (!ctx.style.parchmentTexture)
        return null;
    const { proj } = ctx;
    return el("g", { id: "layer-texture" }, [
        el("rect", {
            x: 0, y: 0, width: proj.widthPx, height: proj.heightPx,
            filter: "url(#parchment)", opacity: 0.5,
        }),
        el("rect", {
            x: 0, y: 0, width: proj.widthPx, height: proj.heightPx,
            fill: "url(#vignette)",
        }),
    ]);
}
