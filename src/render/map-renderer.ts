import { createRng } from "../core/rng.ts";
import { minMax } from "../core/grid.ts";
import { coastSmoothingIterations } from "../terrain/contours.ts";
import { coastRingsGrid } from "./coast.ts";
import type { World } from "../world/types.ts";
import type { MapType } from "../terrain/heightfield.ts";
import { createLabelArena, type PxRing, type RenderCtx } from "./context.ts";
import { createProjection, marginFor, type Projection } from "./transform.ts";
import { STYLES, type MapStyle, type StyleName } from "./style.ts";
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
import { cartoucheLayer, planCartouche, type CartouchePlan } from "./layers/cartouche.ts";
import { compassLayer, planCompass, rhumbLayer, type CompassPlan } from "./layers/compass.ts";
import { planScalebar, scalebarLayer, type ScalebarPlan } from "./layers/scalebar.ts";
import { legendLayer, planLegend, type LegendPlan } from "./layers/legend.ts";
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

function describeChart(world: World, styleName: StyleName, theme: ThemeName | undefined): string {
  const noun = TYPE_NOUNS[world.recipe.mapType];
  const article = /^[aeiou]/.test(noun) ? "an" : "a";
  const lead = theme ? THEME_LEADS[theme] : `${STYLE_ADJECTIVES[styleName]} chart`;
  return `${lead} of ${world.title.title}, ${article} ${noun} in a ${world.recipe.band} climate.`;
}

function projectedCoastRings(world: World, proj: Projection): ReadonlyArray<PxRing> {
  const coastIters = coastSmoothingIterations(proj.widthPx);
  const coastRings = coastRingsGrid(world, coastIters).map((ring) =>
    ring.map(([x, y]) => [proj.px(x), proj.py(y)] as const),
  );
  if (coastRings.length === 0) {
    const mid = world.elev.at(world.elev.w >> 1, world.elev.h >> 1);
    if (mid > world.seaLevel) {
      const m = proj.margin;
      return [
        [
          [m, m],
          [proj.widthPx - m, m],
          [proj.widthPx - m, proj.heightPx - m],
          [m, proj.heightPx - m],
        ],
      ];
    }
  }
  return coastRings;
}

function renderContext(
  world: World,
  style: MapStyle,
  proj: Projection,
  coastRings: ReadonlyArray<PxRing>,
  theme: ThemeName | undefined,
): RenderCtx {
  const { max } = minMax(world.elev);
  return {
    world,
    style,
    proj,
    coastRings,
    elevSpan: Math.max(1e-9, max - world.seaLevel),
    rng: createRng(world.recipe.seed).fork("render"),
    realmTint: world.region?.parentRealmLabels
      ? realmTintIndices(
          world.region.parentRealmLabels,
          world.region.worldGridW,
          world.region.worldGridH ?? world.elev.h,
          world.realms.seats.length,
          style,
        )
      : realmTintIndices(world.realms.labels, world.elev.w, world.elev.h, world.realms.seats.length, style),
    labels: createLabelArena(),
    theme,
  };
}

type ChartPlans = {
  readonly cartouche: CartouchePlan;
  readonly scalebar: ScalebarPlan;
  readonly legend: LegendPlan | null;
  readonly compass: CompassPlan | null;
};

function planFurniture(ctx: RenderCtx, opts: RenderOptions): ChartPlans {
  const cartouchePlan = planCartouche(ctx);
  ctx.labels.claim(cartouchePlan.rect);
  const scalebarPlan = planScalebar(ctx);
  ctx.labels.claim(scalebarPlan.box);
  const legendPlan = opts.legend ? planLegend(ctx, [cartouchePlan.rect, scalebarPlan.box]) : null;
  if (legendPlan) ctx.labels.claim(legendPlan.box);
  const compassPlan = planCompass(ctx, cartouchePlan, scalebarPlan.box, legendPlan?.box);
  if (compassPlan) ctx.labels.claim(compassPlan.box);
  return { cartouche: cartouchePlan, scalebar: scalebarPlan, legend: legendPlan, compass: compassPlan };
}

type LabelledLayers = {
  readonly settlements: SvgNode;
  readonly featureLabels: ReturnType<typeof featureLabelsLayer>;
  readonly bestiary: SvgNode | null;
  readonly seaDecor: SvgNode | null;
  readonly heraldry: SvgNode | null;
};

function labelledLayers(ctx: RenderCtx, plans: ChartPlans, opts: RenderOptions): LabelledLayers {
  // Evaluation order IS label priority: settlements claim before feature labels, before decorative art.
  const settlements = settlementsLayer(ctx);
  const featureLabels = featureLabelsLayer(ctx);
  const bestiary = opts.beasts ? beastsLayer(ctx, plans.cartouche, plans.compass) : null;
  const seaDecor = seaDecorLayer(ctx, plans.cartouche, plans.compass, { serpent: bestiary === null });
  const heraldry = opts.arms ? heraldryLayer(ctx, featureLabels.realmAnchors) : null;
  return { settlements, featureLabels, bestiary, seaDecor, heraldry };
}

function clipRegionLand(world: World, node: SvgNode): SvgNode {
  return world.region ? el("g", { "clip-path": "url(#region-land-clip)" }, [node]) : node;
}

function clipRegionLandMaybe(world: World, node: SvgNode | null): SvgNode | null {
  return node === null ? null : clipRegionLand(world, node);
}

function mapLayersFor(ctx: RenderCtx, plans: ChartPlans, labelled: LabelledLayers): Array<SvgNode | null> {
  const { world } = ctx;
  const { cartouche: cartouchePlan, compass: compassPlan } = plans;
  const themed = ctx.theme !== undefined;
  return [
    oceanLayer(ctx),
    compassPlan ? rhumbLayer(ctx, compassPlan) : null,
    waterlinesLayer(ctx),
    landLayer(ctx),
    themed ? fieldLayer(ctx) : null,
    themed ? windStreamsLayer(ctx) : null,
    themed ? isoLayer(ctx) : null,
    themed ? null : hypsometricLayer(ctx),
    themed ? null : contoursLayer(ctx),
    themed ? null : clipRegionLandMaybe(world, realmTintsLayer(ctx)),
    clipRegionLand(world, riversLayer(ctx)),
    themed ? null : glyphsLayer(ctx),
    roadsLayer(ctx),
    clipRegionLandMaybe(world, realmBordersLayer(ctx)),
    soundingsLayer(ctx, cartouchePlan, compassPlan),
    currentsLayer(ctx, cartouchePlan, compassPlan),
    windsLayer(ctx, cartouchePlan, compassPlan),
    labelled.seaDecor,
    labelled.bestiary,
    labelled.settlements,
    labelled.featureLabels.node,
    labelled.heraldry,
  ];
}

function furnitureFor(ctx: RenderCtx, plans: ChartPlans): Array<SvgNode | null> {
  return [
    plans.compass ? compassLayer(ctx, plans.compass) : null,
    scalebarLayer(ctx, plans.scalebar),
    cartoucheLayer(ctx, plans.cartouche),
    plans.legend ? legendLayer(ctx, plans.legend) : null,
  ];
}

function chartDefs(ctx: RenderCtx, featureDefs: ReadonlyArray<SvgNode>): SvgNode {
  const { world, style, proj, coastRings } = ctx;
  const margin = proj.margin;
  return el("defs", {}, [
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
    ...featureDefs,
    ...textureDefs(ctx),
  ]);
}

type ChartBody = {
  readonly description: string;
  readonly defs: SvgNode;
  readonly mapLayers: ReadonlyArray<SvgNode | null>;
  readonly furniture: ReadonlyArray<SvgNode | null>;
};

function chartRoot(ctx: RenderCtx, opts: RenderOptions, body: ChartBody): SvgNode {
  const { world, style, proj } = ctx;
  const { description, defs, mapLayers, furniture } = body;
  const reproducible = world.region === undefined || opts.regionRecipe !== undefined;

  return el(
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
        x: 0,
        y: 0,
        width: proj.widthPx,
        height: proj.heightPx,
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
}

export function renderMap(world: World, opts: RenderOptions = {}): string {
  const style = STYLES[opts.style ?? "antique"];
  const description = describeChart(world, style.name, opts.theme);
  const widthPx = opts.widthPx ?? 1500;
  const margin = marginFor(widthPx);
  const proj = createProjection(world.elev.w, world.elev.h, widthPx, margin);
  const ctx = renderContext(world, style, proj, projectedCoastRings(world, proj), opts.theme);

  const plans = planFurniture(ctx, opts);
  const labelled = labelledLayers(ctx, plans, opts);
  const mapLayers = mapLayersFor(ctx, plans, labelled);
  const furniture = furnitureFor(ctx, plans);
  const defs = chartDefs(ctx, labelled.featureLabels.defs);

  return renderSvg(chartRoot(ctx, opts, { description, defs, mapLayers, furniture }));
}
