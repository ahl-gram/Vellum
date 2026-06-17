import { createRng } from "../core/rng.js";
import { minMax } from "../core/grid.js";
import { chaikinSmooth, closedIsoRings } from "../terrain/contours.js";
import { createLabelArena } from "./context.js";
import { createProjection } from "./transform.js";
import { STYLES } from "./style.js";
import { el, renderSvg } from "./svg.js";
import { recipeAttrs, recipeMetadataNode } from "./recipe-meta.js";
import { oceanLayer, waterlinesLayer } from "./layers/water.js";
import { contoursLayer, hypsometricLayer, landLayer } from "./layers/land.js";
import { riversLayer } from "./layers/rivers.js";
import { settlementsLayer } from "./layers/settlements.js";
import { frameLayer } from "./layers/frame.js";
import { glyphSymbolDefs } from "./layers/glyph-symbols.js";
import { glyphsLayer } from "./layers/glyphs.js";
import { cartoucheLayer, planCartouche } from "./layers/cartouche.js";
import { compassLayer, planCompass, rhumbLayer } from "./layers/compass.js";
import { planScalebar, scalebarLayer } from "./layers/scalebar.js";
import { legendLayer, planLegend } from "./layers/legend.js";
import { featureLabelsLayer } from "./layers/feature-labels.js";
import { heraldryLayer } from "./layers/heraldry.js";
import { seaDecorLayer } from "./layers/sea-decor.js";
import { textureDefs, textureOverlay } from "./layers/texture.js";
import { roadsLayer } from "./layers/roads.js";
import { realmBordersLayer, realmTintsLayer } from "./layers/realms.js";
import { soundingsLayer } from "./layers/soundings.js";
import { windsLayer } from "./layers/winds.js";
const TYPE_NOUNS = {
    island: "island",
    archipelago: "archipelago",
    continent: "continent",
    citystate: "city-state",
};
const STYLE_ADJECTIVES = {
    antique: "Antique",
    topographic: "Topographic",
    ink: "Pen-and-ink",
    nautical: "Nautical",
};
/**
 * One-line accessible summary, e.g. "Antique chart of The Isle of Rahai, an
 * island in a temperate climate." Every field is total over its type, so the
 * sentence can never contain `undefined`; derived from the world, so it stays
 * byte-deterministic for a given seed.
 */
function describeChart(world, styleName) {
    const noun = TYPE_NOUNS[world.recipe.mapType];
    const article = /^[aeiou]/.test(noun) ? "an" : "a";
    return (`${STYLE_ADJECTIVES[styleName]} chart of ${world.title.title}, ` +
        `${article} ${noun} in a ${world.recipe.band} climate.`);
}
export function renderMap(world, opts = {}) {
    const style = STYLES[opts.style ?? "antique"];
    const description = describeChart(world, style.name);
    const widthPx = opts.widthPx ?? 1500;
    const margin = Math.round(widthPx * 0.045);
    const proj = createProjection(world.elev.w, world.elev.h, widthPx, margin);
    let coastRings = closedIsoRings(world.elev, world.seaLevel).map((c) => chaikinSmooth(c.points, true, 2).map(([x, y]) => [proj.px(x), proj.py(y)]));
    if (coastRings.length === 0) {
        const mid = world.elev.at(world.elev.w >> 1, world.elev.h >> 1);
        if (mid > world.seaLevel) {
            // window is solid land: the whole map area is the landmass
            const m = margin;
            coastRings = [[
                    [m, m],
                    [proj.widthPx - m, m],
                    [proj.widthPx - m, proj.heightPx - m],
                    [m, proj.heightPx - m],
                ]];
        }
    }
    const { max } = minMax(world.elev);
    const ctx = {
        world,
        style,
        proj,
        coastRings,
        elevSpan: Math.max(1e-9, max - world.seaLevel),
        rng: createRng(world.recipe.seed).fork("render"),
        labels: createLabelArena(),
    };
    // furniture is planned first so text layers can route around it
    const cartouchePlan = planCartouche(ctx);
    ctx.labels.claim(cartouchePlan.rect);
    const scalebarPlan = planScalebar(ctx);
    ctx.labels.claim(scalebarPlan.box);
    const compassPlan = planCompass(ctx, cartouchePlan, scalebarPlan.box);
    if (compassPlan)
        ctx.labels.claim(compassPlan.box);
    const legendReserved = [cartouchePlan.rect, scalebarPlan.box];
    if (compassPlan)
        legendReserved.push(compassPlan.box);
    const legendPlan = opts.legend ? planLegend(ctx, legendReserved) : null;
    if (legendPlan)
        ctx.labels.claim(legendPlan.box);
    // evaluation order = label priority: settlements claim space before
    // flexible feature labels, which claim before decorative art
    const settlements = settlementsLayer(ctx);
    const featureLabels = featureLabelsLayer(ctx);
    const seaDecor = seaDecorLayer(ctx, cartouchePlan, compassPlan);
    // arms claim last: decorative and opt-in, they yield to every real label
    const heraldry = opts.arms ? heraldryLayer(ctx, featureLabels.realmAnchors) : null;
    const mapLayers = [
        oceanLayer(ctx),
        compassPlan ? rhumbLayer(ctx, compassPlan) : null,
        waterlinesLayer(ctx),
        landLayer(ctx),
        hypsometricLayer(ctx),
        contoursLayer(ctx),
        realmTintsLayer(ctx),
        riversLayer(ctx),
        glyphsLayer(ctx),
        roadsLayer(ctx),
        realmBordersLayer(ctx),
        soundingsLayer(ctx, cartouchePlan, compassPlan),
        windsLayer(ctx, cartouchePlan, compassPlan),
        seaDecor,
        settlements,
        featureLabels.node,
        heraldry,
    ];
    const furniture = [
        compassPlan ? compassLayer(ctx, compassPlan) : null,
        scalebarLayer(ctx, scalebarPlan),
        cartoucheLayer(ctx, cartouchePlan),
        legendPlan ? legendLayer(ctx, legendPlan) : null,
    ];
    const defs = el("defs", {}, [
        el("clipPath", { id: "map-clip" }, [
            el("rect", {
                x: margin,
                y: margin,
                width: proj.widthPx - 2 * margin,
                height: proj.heightPx - 2 * margin,
            }),
        ]),
        ...(style.glyphs ? glyphSymbolDefs(style) : []),
        ...featureLabels.defs,
        ...textureDefs(ctx),
    ]);
    // a regional inset also needs its zoom window to redraw, so it is not
    // reproducible from a flat recipe; only standalone charts embed one
    const reproducible = world.region === undefined;
    const root = el("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: Math.round(proj.widthPx),
        height: Math.round(proj.heightPx),
        viewBox: `0 0 ${proj.widthPx} ${proj.heightPx}`,
        // a chart is one graphic to assistive tech; a self-contained aria-label
        // avoids the duplicate-id hazard of aria-labelledby on multi-chart pages
        role: "img",
        "aria-label": description,
        ...(reproducible ? recipeAttrs(world, style.name) : {}),
    }, [
        el("title", {}, [world.title.title]),
        el("desc", {}, [description]),
        ...(reproducible ? [recipeMetadataNode(world, style.name)] : []),
        defs,
        el("rect", {
            x: 0, y: 0,
            width: proj.widthPx, height: proj.heightPx,
            fill: style.paper,
        }),
        el("g", { id: "map", "clip-path": "url(#map-clip)" }, mapLayers.filter((l) => l !== null)),
        el("g", { id: "furniture" }, furniture.filter((l) => l !== null)),
        textureOverlay(ctx) ?? el("g", {}),
        frameLayer(ctx),
    ]);
    return renderSvg(root);
}
