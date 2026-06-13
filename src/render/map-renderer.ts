import { createRng } from "../core/rng.ts";
import { minMax } from "../core/grid.ts";
import { chaikinSmooth, closedIsoRings } from "../terrain/contours.ts";
import type { World } from "../world/types.ts";
import { createLabelArena, type RenderCtx } from "./context.ts";
import { createProjection } from "./transform.ts";
import { STYLES, type StyleName } from "./style.ts";
import { el, renderSvg, type SvgNode } from "./svg.ts";
import { oceanLayer, waterlinesLayer } from "./layers/water.ts";
import { contoursLayer, hypsometricLayer, landLayer } from "./layers/land.ts";
import { riversLayer } from "./layers/rivers.ts";
import { settlementsLayer } from "./layers/settlements.ts";
import { frameLayer } from "./layers/frame.ts";
import { glyphSymbolDefs } from "./layers/glyph-symbols.ts";
import { glyphsLayer } from "./layers/glyphs.ts";
import { cartoucheLayer, planCartouche } from "./layers/cartouche.ts";
import { compassLayer, planCompass, rhumbLayer } from "./layers/compass.ts";
import { planScalebar, scalebarLayer } from "./layers/scalebar.ts";
import { featureLabelsLayer } from "./layers/feature-labels.ts";
import { seaDecorLayer } from "./layers/sea-decor.ts";
import { textureDefs, textureOverlay } from "./layers/texture.ts";
import { roadsLayer } from "./layers/roads.ts";
import { realmBordersLayer, realmTintsLayer } from "./layers/realms.ts";
import { soundingsLayer } from "./layers/soundings.ts";

export type RenderOptions = {
  widthPx?: number;
  style?: StyleName;
};

export function renderMap(world: World, opts: RenderOptions = {}): string {
  const style = STYLES[opts.style ?? "antique"];
  const widthPx = opts.widthPx ?? 1500;
  const margin = Math.round(widthPx * 0.045);
  const proj = createProjection(world.elev.w, world.elev.h, widthPx, margin);

  let coastRings = closedIsoRings(world.elev, world.seaLevel).map((c) =>
    chaikinSmooth(c.points, true, 2).map(
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
  };

  // furniture is planned first so text layers can route around it
  const cartouchePlan = planCartouche(ctx);
  ctx.labels.claim(cartouchePlan.rect);
  const compassPlan = planCompass(ctx, cartouchePlan);
  if (compassPlan) ctx.labels.claim(compassPlan.box);
  const scalebarPlan = planScalebar(ctx);
  ctx.labels.claim(scalebarPlan.box);

  // evaluation order = label priority: settlements claim space before
  // flexible feature labels, which claim before decorative art
  const settlements = settlementsLayer(ctx);
  const featureLabels = featureLabelsLayer(ctx);
  const seaDecor = seaDecorLayer(ctx, cartouchePlan, compassPlan);

  const mapLayers: Array<SvgNode | null> = [
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
    seaDecor,
    settlements,
    featureLabels.node,
  ];

  const furniture: Array<SvgNode | null> = [
    compassPlan ? compassLayer(ctx, compassPlan) : null,
    scalebarLayer(ctx, scalebarPlan),
    cartoucheLayer(ctx, cartouchePlan),
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

  const root = el(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: Math.round(proj.widthPx),
      height: Math.round(proj.heightPx),
      viewBox: `0 0 ${proj.widthPx} ${proj.heightPx}`,
    },
    [
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
