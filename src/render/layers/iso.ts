import { minMax, type Field } from "../../core/grid.ts";
import {
  chaikinSmooth,
  marchingSquares,
  type Contour,
} from "../../terrain/contours.ts";
import type { World } from "../../world/types.ts";
import type { RenderCtx } from "../context.ts";
import { el, pathFrom, type SvgNode } from "../svg.ts";

/** One isoline level: the field value and the contours that trace it. */
export type IsolineSet = {
  readonly value: number;
  readonly contours: ReadonlyArray<Contour>;
};

const ISO_LEVELS = 9; // matches the elevation contours' level count

/**
 * Which thematic plates carry isolines, and over which field: isotherms on
 * the Temperature plate, isohyets on the Rainfall plate.
 */
const ISO_FIELDS: Partial<Record<string, (world: World) => Field>> = {
  climate: (world) => world.climate.temperature,
  moisture: (world) => world.climate.moisture,
};

/**
 * Evenly spaced interior isolines of a continuous field: `levels` values at
 * i/(levels+1) between the field's min and max, each traced by marching
 * squares. Ordered by value; empty for a flat field.
 */
export function isolines(field: Field, levels: number): IsolineSet[] {
  const { min, max } = minMax(field);
  const span = max - min;
  if (!(span > 0)) return [];
  const sets: IsolineSet[] = [];
  for (let i = 1; i <= levels; i++) {
    const value = min + (i / (levels + 1)) * span;
    const contours = marchingSquares(field, value);
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
  const pick = ISO_FIELDS[ctx.theme];
  if (!pick) return null;
  const { world, proj, style } = ctx;
  const sets = isolines(pick(world), ISO_LEVELS);
  if (sets.length === 0) return null;

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
      // antique has no elevation-contour stroke; fall back to its soft ink
      stroke: style.contourStroke ?? style.inkSoft,
      "stroke-width": 0.7,
      "stroke-opacity": 0.45,
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
