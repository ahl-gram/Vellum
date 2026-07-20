// Types for the parts of zoom-controller.js consumed from TypeScript. Only the two
// pure helpers are unit-tested and imported by a .ts, so only they are declared here;
// createZoomController touches the DOM + d3-selection and is consumed solely by the
// untyped browser conductor (app.js), verified by e2e suite-zoom. Keeping this
// DOM-free lets the project tsconfig (no "dom" lib) type-check the test.

export interface ZoomState {
  x: number;
  y: number;
  k: number;
}

/** Format a zoom transform as a browser-valid CSS `transform` (px-suffixed). */
export function zoomTransformToCss(t: ZoomState): string;

/** Clamp a proposed transform to the scaleExtent and to the sheet (mirrors d3's constrain). */
export function constrainZoom(
  t: ZoomState,
  extent: ReadonlyArray<ReadonlyArray<number>>,
  scaleExtent: ReadonlyArray<number>,
): ZoomState;

/** The absolute k a voiced glide flies to: baseK * factor, clamped to scaleExtent (#170). */
export function nextGlideTarget(
  baseK: number,
  factor: number,
  scaleExtent: ReadonlyArray<number>,
): number;
