import { createRng } from "../core/rng.ts";
import { minMax } from "../core/grid.ts";
import { coastSmoothingIterations } from "../terrain/contours.ts";
import { coastRingsGrid } from "./coast.ts";
import type { World } from "../world/types.ts";
import type { MapType } from "../terrain/heightfield.ts";
import { createLabelArena, type RenderCtx } from "./context.ts";
import { createProjection, marginFor } from "./transform.ts";
import { STYLES, type StyleName } from "./style.ts";
import { el, pathFrom, renderSvg, type SvgNode } from "./svg.ts";
import { recipeAttrs, recipeMetadataNode, regionRecipeAttrs, type RegionRecipe } from "./recipe-meta.ts";
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
import { beastsLayer } from "./layers/beasts.ts";
import { textureDefs, textureOverlay } from "./layers/texture.ts";
import { roadsLayer } from "./layers/roads.ts";
import { realmBordersLayer, realmTintsLayer } from "./layers/realms.ts";
import { realmTintIndices } from "./realm-tints.ts";
import { soundingsLayer } from "./layers/soundings.ts";
import { windsLayer, windStreamsLayer } from "./layers/winds.ts";
import { currentsLayer } from "./layers/currents.ts";

export type RenderOptions = {
  widthPx?: number;
  style?: StyleName;
  legend?: boolean;
  arms?: boolean;
  beasts?: boolean;
  theme?: ThemeName;
  regionRecipe?: RegionRecipe;
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
  const margin = marginFor(widthPx);
  const proj = createProjection(world.elev.w, world.elev.h, widthPx, margin);

  const coastIters = coastSmoothingIterations(widthPx);
  let coastRings = coastRingsGrid(world, coastIters).map((ring) =>
    ring.map(([x, y]) => [proj.px(x), proj.py(y)] as const),
  );
  if (coastRings.length === 0) {
    const mid = world.elev.at(world.elev.w >> 1, world.elev.h >> 1);
    if (mid > world.seaLevel) {
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
    realmTint: realmTintIndices(
      world.realms.labels,
      world.elev.w,
      world.elev.h,
      world.realms.seats.length,
      style,
    ),
    labels: createLabelArena(),
    theme: opts.theme,
  };

  const cartouchePlan = planCartouche(ctx);
  ctx.labels.claim(cartouchePlan.rect);
  const scalebarPlan = planScalebar(ctx);
  ctx.labels.claim(scalebarPlan.box);
  const legendPlan = opts.legend
    ? planLegend(ctx, [cartouchePlan.rect, scalebarPlan.box])
    : null;
  if (legendPlan) ctx.labels.claim(legendPlan.box);
  const compassPlan = planCompass(ctx, cartouchePlan, scalebarPlan.box, legendPlan?.box);
  if (compassPlan) ctx.labels.claim(compassPlan.box);

  // Evaluation order IS label priority: settlements claim before feature labels, before decorative art.
  const settlements = settlementsLayer(ctx);
  const featureLabels = featureLabelsLayer(ctx);
  const bestiary = opts.beasts ? beastsLayer(ctx, cartouchePlan, compassPlan) : null;
  const seaDecor = seaDecorLayer(ctx, cartouchePlan, compassPlan, { serpent: bestiary === null });
  const heraldry = opts.arms ? heraldryLayer(ctx, featureLabels.realmAnchors) : null;

  const themed = opts.theme !== undefined;

  const clipRegionLand = (node: SvgNode): SvgNode =>
    world.region
      ? el("g", { "clip-path": "url(#region-land-clip)" }, [node])
      : node;

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
    clipRegionLand(riversLayer(ctx)),
    themed ? null : glyphsLayer(ctx),
    roadsLayer(ctx),
    realmBordersLayer(ctx),
    soundingsLayer(ctx, cartouchePlan, compassPlan),
    currentsLayer(ctx, cartouchePlan, compassPlan),
    windsLayer(ctx, cartouchePlan, compassPlan),
    seaDecor,
    bestiary,
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
    ...(world.region
      ? [
          el("clipPath", { id: "region-land-clip" }, [
            el("path", {
              d: coastRings.map((r) => pathFrom(r, true)).join(""),
              "clip-rule": "evenodd",
            }),
          ]),
        ]
      : []),
    ...(style.glyphs ? glyphSymbolDefs(style) : []),
    ...featureLabels.defs,
    ...textureDefs(ctx),
  ]);

  const reproducible = world.region === undefined || opts.regionRecipe !== undefined;

  const root = el(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: Math.round(proj.widthPx),
      height: Math.round(proj.heightPx),
      viewBox: `0 0 ${proj.widthPx} ${proj.heightPx}`,
      // A self-contained aria-label avoids the duplicate-id hazard of aria-labelledby on multi-chart pages.
      role: "img",
      "aria-label": description,
      ...(reproducible ? recipeAttrs(world, style.name) : {}),
      ...(opts.regionRecipe ? regionRecipeAttrs(opts.regionRecipe) : {}),
    },
    [
      el("title", {}, [world.title.title]),
      el("desc", {}, [description]),
      ...(reproducible ? [recipeMetadataNode(world, style.name, opts.regionRecipe)] : []),
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
