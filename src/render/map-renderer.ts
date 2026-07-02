import { createRng } from "../core/rng.ts";
import { minMax } from "../core/grid.ts";
import { chaikinSmooth, closedIsoRings, coastSmoothingIterations } from "../terrain/contours.ts";
import type { World } from "../world/types.ts";
import type { MapType } from "../terrain/heightfield.ts";
import { createLabelArena, type RenderCtx } from "./context.ts";
import { createProjection } from "./transform.ts";
import { STYLES, type StyleName } from "./style.ts";
import { el, renderSvg, type SvgNode } from "./svg.ts";
import { recipeAttrs, recipeMetadataNode } from "./recipe-meta.ts";
import { oceanLayer, waterlinesLayer } from "./layers/water.ts";
import { contoursLayer, hypsometricLayer, landLayer } from "./layers/land.ts";
import { fieldLayer, type ThemeName } from "./layers/field.ts";
import { isoLayer } from "./layers/iso.ts";
import { riversLayer } from "./layers/rivers.ts";
import { settlementsLayer } from "./layers/settlements.ts";
import { frameLayer } from "./layers/frame.ts";
import { glyphSymbolDefs } from "./layers/glyph-symbols.ts";
import { glyphsLayer } from "./layers/glyphs.ts";
import { cartoucheLayer, planCartouche } from "./layers/cartouche.ts";
import { compassLayer, planCompass, rhumbLayer } from "./layers/compass.ts";
import { planScalebar, scalebarLayer } from "./layers/scalebar.ts";
import { legendLayer, planLegend } from "./layers/legend.ts";
import { featureLabelsLayer } from "./layers/feature-labels.ts";
import { heraldryLayer } from "./layers/heraldry.ts";
import { seaDecorLayer } from "./layers/sea-decor.ts";
import { textureDefs, textureOverlay } from "./layers/texture.ts";
import { roadsLayer } from "./layers/roads.ts";
import { realmBordersLayer, realmTintsLayer } from "./layers/realms.ts";
import { soundingsLayer } from "./layers/soundings.ts";
import { windsLayer, windStreamsLayer } from "./layers/winds.ts";
import { currentsLayer } from "./layers/currents.ts";

export type RenderOptions = {
  widthPx?: number;
  style?: StyleName;
  /** Draw a compact, style-aware key. Opt-in; off by default. */
  legend?: boolean;
  /** Draw each realm's coat of arms beside its label. Opt-in; off by default. */
  arms?: boolean;
  /** Render a thematic data plate instead of the normal land symbology. */
  theme?: ThemeName;
};

const TYPE_NOUNS: Record<MapType, string> = {
  island: "island",
  archipelago: "archipelago",
  continent: "continent",
  citystate: "city-state",
};

const STYLE_ADJECTIVES: Record<StyleName, string> = {
  antique: "Antique",
  topographic: "Topographic",
  ink: "Pen-and-ink",
  nautical: "Nautical",
};

const THEME_LEADS: Record<ThemeName, string> = {
  vegetation: "Vegetation map",
  climate: "Temperature map",
  moisture: "Rainfall map",
  population: "Population map",
};

/**
 * One-line accessible summary, e.g. "Antique chart of The Isle of Rahai, an
 * island in a temperate climate." A thematic plate leads with its subject
 * ("Vegetation map of …") so assistive tech announces what the colors mean.
 * Every field is total over its type, so the sentence can never contain
 * `undefined`; derived from the world, so it stays byte-deterministic.
 */
function describeChart(
  world: World,
  styleName: StyleName,
  theme: ThemeName | undefined,
): string {
  const noun = TYPE_NOUNS[world.recipe.mapType];
  const article = /^[aeiou]/.test(noun) ? "an" : "a";
  const lead = theme ? THEME_LEADS[theme] : `${STYLE_ADJECTIVES[styleName]} chart`;
  return `${lead} of ${world.title.title}, ${article} ${noun} in a ${world.recipe.band} climate.`;
}

export function renderMap(world: World, opts: RenderOptions = {}): string {
  const style = STYLES[opts.style ?? "antique"];
  const description = describeChart(world, style.name, opts.theme);
  const widthPx = opts.widthPx ?? 1500;
  const margin = Math.round(widthPx * 0.045);
  const proj = createProjection(world.elev.w, world.elev.h, widthPx, margin);

  // The coastline gets width-scaled corner-cutting: 2 iterations at chart width
  // (byte-identical there) and more on big posters, so the shore reads as a fine
  // plate at 4200px instead of showing grid-scale facets. Render-time only; the
  // realm borders, names, and rivers are computed elsewhere and do not move.
  const coastIters = coastSmoothingIterations(widthPx);
  let coastRings = closedIsoRings(world.elev, world.seaLevel).map((c) =>
    chaikinSmooth(c.points, true, coastIters).map(
      ([x, y]) => [proj.px(x), proj.py(y)] as const,
    ),
  );
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
  const ctx: RenderCtx = {
    world,
    style,
    proj,
    coastRings,
    elevSpan: Math.max(1e-9, max - world.seaLevel),
    rng: createRng(world.recipe.seed).fork("render"),
    labels: createLabelArena(),
    theme: opts.theme,
  };

  // furniture is planned first so text layers can route around it
  const cartouchePlan = planCartouche(ctx);
  ctx.labels.claim(cartouchePlan.rect);
  const scalebarPlan = planScalebar(ctx);
  ctx.labels.claim(scalebarPlan.box);
  // The legend anchors to a corner, so plan it before the (flexible) compass and
  // let the rose route around it, not the other way round.
  const legendPlan = opts.legend
    ? planLegend(ctx, [cartouchePlan.rect, scalebarPlan.box])
    : null;
  if (legendPlan) ctx.labels.claim(legendPlan.box);
  const compassPlan = planCompass(ctx, cartouchePlan, scalebarPlan.box, legendPlan?.box);
  if (compassPlan) ctx.labels.claim(compassPlan.box);

  // evaluation order = label priority: settlements claim space before
  // flexible feature labels, which claim before decorative art
  const settlements = settlementsLayer(ctx);
  const featureLabels = featureLabelsLayer(ctx);
  const seaDecor = seaDecorLayer(ctx, cartouchePlan, compassPlan);
  // arms claim last: decorative and opt-in, they yield to every real label
  const heraldry = opts.arms ? heraldryLayer(ctx, featureLabels.realmAnchors) : null;

  // A thematic plate replaces the land symbology (elevation tint, contours,
  // terrain glyphs, political wash) with its own colored cells; the coastline,
  // water, rivers, roads, settlements, and labels stay as reference.
  const themed = opts.theme !== undefined;

  const mapLayers: Array<SvgNode | null> = [
    oceanLayer(ctx),
    compassPlan ? rhumbLayer(ctx, compassPlan) : null,
    waterlinesLayer(ctx),
    landLayer(ctx),
    themed ? fieldLayer(ctx) : null,
    themed ? windStreamsLayer(ctx) : null,
    themed ? isoLayer(ctx) : null,
    themed ? null : hypsometricLayer(ctx),
    themed ? null : contoursLayer(ctx),
    themed ? null : realmTintsLayer(ctx),
    riversLayer(ctx),
    themed ? null : glyphsLayer(ctx),
    roadsLayer(ctx),
    realmBordersLayer(ctx),
    soundingsLayer(ctx, cartouchePlan, compassPlan),
    currentsLayer(ctx, cartouchePlan, compassPlan),
    windsLayer(ctx, cartouchePlan, compassPlan),
    seaDecor,
    settlements,
    featureLabels.node,
    heraldry,
  ];

  const furniture: Array<SvgNode | null> = [
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

  const root = el(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: Math.round(proj.widthPx),
      height: Math.round(proj.heightPx),
      viewBox: `0 0 ${proj.widthPx} ${proj.heightPx}`,
      // a chart is one graphic to assistive tech; a self-contained aria-label
      // avoids the duplicate-id hazard of aria-labelledby on multi-chart pages
      role: "img",
      "aria-label": description,
      ...(reproducible ? recipeAttrs(world, style.name) : {}),
    },
    [
      el("title", {}, [world.title.title]),
      el("desc", {}, [description]),
      ...(reproducible ? [recipeMetadataNode(world, style.name)] : []),
      defs,
      el("rect", {
        x: 0, y: 0,
        width: proj.widthPx, height: proj.heightPx,
        fill: style.paper,
      }),
      el(
        "g",
        { id: "map", "clip-path": "url(#map-clip)" },
        mapLayers.filter((l): l is SvgNode => l !== null),
      ),
      el(
        "g",
        { id: "furniture" },
        furniture.filter((l): l is SvgNode => l !== null),
      ),
      textureOverlay(ctx) ?? el("g", {}),
      frameLayer(ctx),
    ],
  );

  return renderSvg(root);
}
