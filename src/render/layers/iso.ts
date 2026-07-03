import { minMax, type Field } from "../../core/grid.ts";
import {
  chaikinSmooth,
  marchingSquares,
  type Contour,
  type Point,
} from "../../terrain/contours.ts";
import type { World } from "../../world/types.ts";
import type { RenderCtx } from "../context.ts";
import type { MapStyle } from "../style.ts";
import { el, pathFrom, type SvgNode } from "../svg.ts";

/** One isoline level: the field value and the contours that trace it. */
export type IsolineSet = {
  readonly value: number;
  readonly contours: ReadonlyArray<Contour>;
};

const ISO_LEVELS = 9; // matches the elevation contours' level count

/**
 * Closed rings whose grid-space extent falls below this are single-cell mottle
 * (a crossing that hugs one cell corner), not real features: ~2.8px at the
 * 1500px chart width. Dropped so the bolder isohyets (#108) don't light up
 * speck-scale rings, and the SVG stays lean. Open chains are never culled.
 */
const MIN_RING_CELLS = 0.6;

type IsoStroke = { readonly color: string; readonly width: number; readonly opacity: number };

/** One thematic plate's iso layer: the field it traces and, optionally, a
 * stroke that overrides the faint contour default. */
type IsoFieldSpec = {
  readonly field: (world: World) => Field;
  readonly stroke?: IsoStroke;
};

/**
 * Which thematic plates carry isolines, and over which field: isotherms on
 * the Temperature plate, isohyets on the Rainfall plate. The isohyets lead
 * their plate (#108), so moisture takes a heavier, darker stroke; the
 * temperature isotherms stay deliberately faint (no override).
 */
const ISO_FIELDS: Partial<Record<string, IsoFieldSpec>> = {
  climate: { field: (world) => world.climate.temperature },
  moisture: {
    field: (world) => world.climate.moisture,
    stroke: { color: "#78765f", width: 1.0, opacity: 0.72 },
  },
};

const FAINT = { width: 0.7, opacity: 0.45 } as const;

/**
 * The stroke a plate's iso lines are drawn in: the bold per-field override
 * where one exists (moisture), otherwise the style's soft contour stroke at
 * the faint default weight (temperature, byte-identical to pre-#108).
 */
export function isoStroke(theme: string, style: MapStyle): IsoStroke {
  return (
    ISO_FIELDS[theme]?.stroke ?? {
      color: style.contourStroke ?? style.inkSoft,
      ...FAINT,
    }
  );
}

/** The larger of a ring's grid-space width and height, in cells. */
function ringExtent(points: ReadonlyArray<Point>): number {
  let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
  for (const [x, y] of points) {
    if (x < minx) minx = x;
    if (x > maxx) maxx = x;
    if (y < miny) miny = y;
    if (y > maxy) maxy = y;
  }
  return Math.max(maxx - minx, maxy - miny);
}

/**
 * Evenly spaced interior isolines of a continuous field: `levels` values at
 * i/(levels+1) between the field's min and max, each traced by marching
 * squares. Degenerate sub-pixel rings from single-cell mottle are culled.
 * Ordered by value; empty for a flat field.
 */
export function isolines(field: Field, levels: number): IsolineSet[] {
  const { min, max } = minMax(field);
  const span = max - min;
  if (!(span > 0)) return [];
  const sets: IsolineSet[] = [];
  for (let i = 1; i <= levels; i++) {
    const value = min + (i / (levels + 1)) * span;
    const contours = marchingSquares(field, value).filter(
      (c) => !c.closed || ringExtent(c.points) >= MIN_RING_CELLS,
    );
    if (contours.length === 0) continue;
    sets.push({ value, contours });
  }
  return sets;
}

/**
 * Stroked isolines over the active thematic plate: isotherms on the
 * Temperature plate (theme "climate"), isohyets on the Rainfall plate
 * (theme "moisture"). Null for any other theme. Like the field cells, the
 * lines clip to the coastline; open sea stays clean.
 */
export function isoLayer(ctx: RenderCtx): SvgNode | null {
  if (!ctx.theme) return null;
  const spec = ISO_FIELDS[ctx.theme];
  if (!spec) return null;
  const { world, proj, style } = ctx;
  const sets = isolines(spec.field(world), ISO_LEVELS);
  if (sets.length === 0) return null;

  const stroke = isoStroke(ctx.theme, style);
  const lines = sets.map(({ contours }) =>
    el("path", {
      d: contours
        .map((c) =>
          pathFrom(
            chaikinSmooth(c.points, c.closed, 2).map(
              ([x, y]) => [proj.px(x), proj.py(y)] as const,
            ),
            c.closed,
          ),
        )
        .join(""),
      fill: "none",
      stroke: stroke.color,
      "stroke-width": stroke.width,
      "stroke-opacity": stroke.opacity,
    }),
  );

  const coastD = ctx.coastRings.map((r) => pathFrom(r, true)).join("");
  return el("g", { id: "layer-iso" }, [
    el("clipPath", { id: "iso-clip" }, [
      el("path", { d: coastD, "clip-rule": "evenodd" }),
    ]),
    el("g", { "clip-path": "url(#iso-clip)" }, lines),
  ]);
}
