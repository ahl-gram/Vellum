// The Surveyor's Glass, Sub 3 (#164): the glass itself. A shared, page-agnostic
// controller that gives an element geometric pan/zoom driven by d3-zoom. It lives
// in docs/shared/ -- the first hand-authored module shared across page directories
// -- and is the ONLY file that imports d3-zoom (and, to attach it, d3-selection;
// d3-zoom cannot bind gestures without a selection). Both resolve at bundle time via
// the #163 esbuild press, so the pages still load a single native-ESM twin.
//
// The live gesture is CSS-ONLY: each transform lands on targetEl's `style.transform`,
// so the SVG and the %-positioned overlays already inside it (place hits, cards, the
// voyage track) ride one composited frame with no redraw. Nothing is re-rendered
// until a later sub (Sub 8) wires onSettle to a region redraft; here onSettle is
// optional infrastructure and the magnify is purely geometric (blurrier at k=8 is
// expected and correct until the semantic redraft arrives).
//
// Kept free of top-level DOM access (the factory takes its elements as arguments) so
// the two pure helpers below are unit-testable under Node; createZoomController is
// proven by e2e suite-zoom (Z1-Z4). See test/site/zoom-controller.test.ts.
import { zoom, zoomIdentity } from "d3-zoom";
import { select } from "d3-selection";

// ---- pure helpers (unit-tested) -------------------------------------------------

/**
 * Format a zoom transform as a browser-valid CSS `transform` value. d3's own
 * ZoomTransform.toString() emits `translate(x,y)` with NO unit, which the CSS
 * property silently rejects, so the controller must build the px-suffixed string.
 * @param {{x:number, y:number, k:number}} t
 * @returns {string}
 */
export function zoomTransformToCss(t) {
  return `translate(${t.x}px, ${t.y}px) scale(${t.k})`;
}

/**
 * Clamp a proposed transform to the scaleExtent and to the sheet. The sheet fills
 * the viewport at k=1, so the world extent used for the translate clamp IS the
 * viewport extent; this mirrors d3-zoom's defaultConstrain, recomputed against a
 * scale that has itself been clamped, so the programmatic path (zoomTo) clamps
 * identically to a live gesture.
 * @param {{x:number, y:number, k:number}} t
 * @param {ReadonlyArray<ReadonlyArray<number>>} extent  [[x0,y0],[x1,y1]]
 * @param {ReadonlyArray<number>} scaleExtent  [min,max]
 * @returns {{x:number, y:number, k:number}}
 */
export function constrainZoom(t, extent, scaleExtent) {
  const k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], t.k));
  const [[x0, y0], [x1, y1]] = extent;
  // d3-zoom defaultConstrain with translateExtent == the viewport extent, so the
  // sheet always covers the viewport. invertX(v) maps a viewport point back into the
  // pre-transform world using the CLAMPED k, and the axis is nudged the minimum
  // amount to keep the world edges outside (or centered inside) the viewport.
  const invX0 = (x0 - t.x) / k - x0;
  const invX1 = (x1 - t.x) / k - x1;
  const invY0 = (y0 - t.y) / k - y0;
  const invY1 = (y1 - t.y) / k - y1;
  const dx = invX1 > invX0 ? (invX0 + invX1) / 2 : Math.min(0, invX0) || Math.max(0, invX1);
  const dy = invY1 > invY0 ? (invY0 + invY1) / 2 : Math.min(0, invY0) || Math.max(0, invY1);
  return { x: t.x + k * dx, y: t.y + k * dy, k };
}

// ---- the controller -------------------------------------------------------------

/**
 * @param {{
 *   viewportEl: HTMLElement,   // the clipping/gesture box (stable across redraws)
 *   targetEl: HTMLElement,     // the element the live CSS transform lands on
 *   scaleExtent?: [number, number],
 *   settleMs?: number,
 *   onSettle?: (state: {x:number,y:number,k:number}) => void,
 *   reducedMotion?: boolean,
 * }} opts
 */
export function createZoomController({
  viewportEl,
  targetEl,
  scaleExtent = [1, 8],
  settleMs = 250,
  onSettle,
  reducedMotion = false,
}) {
  const viewportExtent = () => [[0, 0], [viewportEl.clientWidth, viewportEl.clientHeight]];

  const behavior = zoom()
    .scaleExtent(scaleExtent)
    .extent(viewportExtent)
    // The one animated d3 path here is the double-click zoom (default 250ms); reduced
    // motion collapses it to an instant jump. Nothing else animates in this sub.
    .duration(reducedMotion ? 0 : 250)
    .constrain((transform, ext) => {
      const c = constrainZoom({ x: transform.x, y: transform.y, k: transform.k }, ext, scaleExtent);
      return zoomIdentity.translate(c.x, c.y).scale(c.k);
    });

  let settleTimer = 0;
  const clearSettle = () => {
    if (settleTimer) {
      clearTimeout(settleTimer);
      settleTimer = 0;
    }
  };

  const isHome = (t) => t.k === 1 && t.x === 0 && t.y === 0;

  function apply(transform) {
    // Home leaves the idle DOM byte-identical (no inline transform, no clip): the
    // arrival ceremony's translate/rotate and the chart's drop shadow overflow the
    // frame exactly as today. Clip only once actually zoomed.
    if (isHome(transform)) {
      targetEl.style.transform = "";
      viewportEl.classList.remove("zoomed");
    } else {
      targetEl.style.transform = zoomTransformToCss(transform);
      viewportEl.classList.add("zoomed");
    }
  }

  behavior.on("zoom", (event) => {
    apply(event.transform);
    // A settle debounce independent of d3's internal wheel coalescing: fire onSettle
    // only once the gesture goes quiet. Dormant until a later sub passes onSettle.
    if (onSettle) {
      clearSettle();
      settleTimer = setTimeout(() => {
        settleTimer = 0;
        onSettle(getState());
      }, settleMs);
    }
  });

  const sel = () => select(viewportEl);

  function getState() {
    const t = viewportEl.__zoom || zoomIdentity;
    return { x: t.x, y: t.y, k: t.k };
  }

  return {
    /** Bind the gesture listeners to viewportEl. Idempotent (re-binds in place). */
    attach() {
      sel().call(behavior);
      // touch-action:none is REQUIRED for touch drag/pinch: d3-zoom does not set it,
      // and without it the browser's native pan/pinch-zoom preempts the gesture. Gated
      // to when the controller is attached (antique in this sub) so non-zoomable styles
      // keep normal page scrolling over the chart. It must be present even at k=1 so the
      // very first pinch (from home) reaches the controller rather than scrolling.
      viewportEl.classList.add("zoomable");
    },
    /** Remove the gesture listeners. Leaves the current transform in place. */
    detach() {
      sel().on(".zoom", null);
      viewportEl.classList.remove("zoomable"); // restore normal touch scrolling
      clearSettle();
    },
    /** Snap the camera home (k=1, no offset) and restore the idle DOM. */
    reset() {
      clearSettle();
      sel().call(behavior.transform, zoomIdentity);
      apply(zoomIdentity);
    },
    /**
     * Adopt the current sheet as a fresh home without a transition: the chart under
     * the camera was replaced. For this sub the effect equals reset(); it is kept
     * distinct for the redraft path a later sub (Sub 8) consumes.
     */
    rebase() {
      clearSettle();
      viewportEl.__zoom = zoomIdentity;
      apply(zoomIdentity);
    },
    /** Programmatically zoom to a proposed transform, clamped like a live gesture. */
    zoomTo(next) {
      const c = constrainZoom({ x: next.x, y: next.y, k: next.k }, viewportExtent(), scaleExtent);
      sel().call(behavior.transform, zoomIdentity.translate(c.x, c.y).scale(c.k));
    },
    getState,
  };
}
