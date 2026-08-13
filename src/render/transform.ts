/** Lives in one place only: renderMap, buildPlaceManifest, and the Explorer's sheet-fraction conversion must agree on this margin exactly. */
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
