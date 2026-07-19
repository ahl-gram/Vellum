/** Uniform grid→pixel projection with a frame margin. */

/**
 * The frame margin as a fraction of the rendered width (the same px inset on all four
 * sides). Shared by renderMap and buildPlaceManifest, and shipped to the Explorer as
 * the manifest's marginPx (#169): the client's sheet-fraction <-> plot-uv conversion
 * must agree with the drawn chart exactly, so the constant lives in one place.
 */
export const MARGIN_FRACTION = 0.045;

export function marginFor(widthPx: number): number {
  return Math.round(widthPx * MARGIN_FRACTION);
}

export type Projection = {
  readonly widthPx: number;
  readonly heightPx: number;
  readonly margin: number;
  readonly scale: number;
  px(x: number): number;
  py(y: number): number;
};

export function createProjection(
  gridW: number,
  gridH: number,
  widthPx: number,
  margin: number,
): Projection {
  const scale = (widthPx - 2 * margin) / (gridW - 1);
  const heightPx = 2 * margin + (gridH - 1) * scale;
  return {
    widthPx,
    heightPx,
    margin,
    scale,
    px: (x: number) => margin + x * scale,
    py: (y: number) => margin + y * scale,
  };
}
