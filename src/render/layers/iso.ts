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

export type IsolineSet = {
  readonly value: number;
  readonly contours: ReadonlyArray<Contour>;
};

const ISO_LEVELS = 9; // matches the elevation contours' level count

const MIN_RING_CELLS = 0.6;

type IsoStroke = { readonly color: string; readonly width: number; readonly opacity: number };

type IsoFieldSpec = {
  readonly field: (world: World) => Field;
  readonly stroke?: IsoStroke;
};

const ISO_FIELDS: Partial<Record<string, IsoFieldSpec>> = {
  climate: { field: (world) => world.climate.temperature },
  moisture: {
    field: (world) => world.climate.moisture,
    stroke: { color: "#78765f", width: 1.0, opacity: 0.72 },
  },
};

const FAINT = { width: 0.7, opacity: 0.45 } as const;

export function isoStroke(theme: string, style: MapStyle): IsoStroke {
  return (
    ISO_FIELDS[theme]?.stroke ?? {
      color: style.contourStroke ?? style.inkSoft,
      ...FAINT,
    }
  );
}

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
