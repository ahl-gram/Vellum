// The Surveyor's Glass, Sub 3 (#164): the glass itself. A shared, page-agnostic
// controller that gives an element geometric pan/zoom driven by d3-zoom. It lives
// in src/site/shared/ -- the first hand-authored module shared across page directories
// -- and is the ONLY file that imports d3-zoom (and, to attach it, d3-selection;
// d3-zoom cannot bind gestures without a selection). Both resolve at bundle time via
// the Vite press (#163's esbuild originally, folded by #208), so the pages still
// load a single native-ESM twin.
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
import { zoom, zoomIdentity, type D3ZoomEvent, type ZoomBehavior, type ZoomTransform } from "d3-zoom";
import { select } from "d3-selection";
// #170: selection.transition() for the voiced glide. A side-effect import (it patches
// d3-selection's prototype); the module was ALREADY in the bundle transitively (d3-zoom's
// double-click smooth zoom uses it), so declaring it adds no bundle weight.
import "d3-transition";

export interface ZoomState {
  x: number;
  y: number;
  k: number;
}

// ---- pure helpers (unit-tested) -------------------------------------------------

/**
 * Format a zoom transform as a browser-valid CSS `transform` value. d3's own
 * ZoomTransform.toString() emits `translate(x,y)` with NO unit, which the CSS
 * property silently rejects, so the controller must build the px-suffixed string.
 * @param {{x:number, y:number, k:number}} t
 * @returns {string}
 */
export function zoomTransformToCss(t: ZoomState): string {
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
export function constrainZoom(
  t: ZoomState,
  extent: ReadonlyArray<ReadonlyArray<number>>,
  scaleExtent: ReadonlyArray<number>,
): ZoomState {
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

/**
 * The absolute k a voiced glide should fly to (#170). Compounds against the PENDING
 * glide target when one is in flight (baseK = that target), so hammering "+" lands
 * factor^presses rather than re-deriving from a mid-flight k; clamped to scaleExtent
 * so a run of presses saturates at the extent exactly like the live gesture.
 * @param {number} baseK  the current k, or the in-flight glide's target k
 * @param {number} factor
 * @param {ReadonlyArray<number>} scaleExtent  [min,max]
 * @returns {number}
 */
export function nextGlideTarget(
  baseK: number,
  factor: number,
  scaleExtent: ReadonlyArray<number>,
): number {
  return Math.max(scaleExtent[0], Math.min(scaleExtent[1], baseK * factor));
}

// ---- the controller -------------------------------------------------------------

export interface ZoomControllerOptions {
  viewportEl: HTMLElement;
  targetEl: HTMLElement;
  scaleExtent?: [number, number];
  settleMs?: number;
  onSettle?: (state: ZoomState) => void;
  onApply?: (state: ZoomState) => void;
  reducedMotion?: boolean | (() => boolean);
  glideMs?: number | (() => number);
}

export interface ZoomController {
  attach(): void;
  detach(): void;
  reset(): void;
  rebase(): void;
  zoomTo(next: ZoomState): void;
  glideBy(factor: number): void;
  glideHome(onDone?: () => void): void;
  panBy(dxScreen: number, dyScreen: number): void;
  getState(): ZoomState;
}

// d3-zoom stashes the live transform on the element itself as `__zoom`; typed here so
// getState/rebase can read and write it through a single cast at each lookup.
type ZoomStoredElement = HTMLElement & { __zoom?: ZoomTransform };

/**
 * @param {{
 *   viewportEl: HTMLElement,   // the clipping/gesture box (stable across redraws)
 *   targetEl: HTMLElement,     // the element the live CSS transform lands on
 *   scaleExtent?: [number, number],
 *   settleMs?: number,
 *   onSettle?: (state: {x:number,y:number,k:number}) => void,
 *   reducedMotion?: boolean,
 *   glideMs?: number | (() => number),
 * }} opts
 */
export function createZoomController({
  viewportEl,
  targetEl,
  scaleExtent = [1, 8],
  settleMs = 250,
  onSettle,
  onApply,
  reducedMotion,
  glideMs = 250,
}: ZoomControllerOptions): ZoomController {
  const viewportExtent = (): [[number, number], [number, number]] =>
    [[0, 0], [viewportEl.clientWidth, viewportEl.clientHeight]];

  // #165: reduced motion is read LIVE, not frozen at construction. It accepts a boolean
  // or a getter (() => boolean); with neither, it reads the OS setting live via
  // matchMedia. Live is both more correct (an OS toggle takes effect without a reload)
  // and what lets the e2e emulate reduced-motion and prove AC5's collapse (a value
  // baked in at construction could never be flipped mid-page).
  const mq =
    typeof globalThis.matchMedia === "function"
      ? globalThis.matchMedia("(prefers-reduced-motion: reduce)")
      : null;
  const prefersReduced = () => {
    if (typeof reducedMotion === "function") return !!reducedMotion();
    if (typeof reducedMotion === "boolean") return reducedMotion;
    return !!(mq && mq.matches);
  };
  const DBLCLICK_MS = 250;
  // #170: the glide duration, like reducedMotion read live (a getter lets the page hand
  // in a lazy /motion.css token read; the stylesheet may not be applied at construction).
  const glideMsNow = () => {
    const v = typeof glideMs === "function" ? glideMs() : glideMs;
    return Number.isFinite(v) && v >= 0 ? v : 250;
  };
  // #170: the in-flight glide's absolute target k, so stacked presses compound against
  // the INTENT (factor^presses) rather than a mid-flight k. Cleared when the LATEST
  // glide ends or anything interrupts it (a gesture, zoomTo, reset: all of d3-zoom's
  // plain-selection entry points call selection.interrupt() first). glideSeq is the
  // drawGen idiom: a superseding glide interrupts its predecessor one frame AFTER
  // setting the new target (d3 starts transitions on the next timer tick), so the
  // predecessor's own end/interrupt must not clear the newer press's pending target.
  let glideTargetK: number | null = null;
  let glideSeq = 0;

  const behavior: ZoomBehavior<HTMLElement, unknown> = zoom<HTMLElement, unknown>()
    .scaleExtent(scaleExtent)
    .extent(viewportExtent)
    // The double-click zoom's animated path; reduced motion collapses it to an instant
    // jump. syncDblDuration (below) keeps this live per click. Since #170 the keyboard
    // and on-screen buttons glide too (glideBy/glideHome below), each carrying its own
    // live reduced-motion gate; panBy stays instant (the accessible pan baseline).
    .duration(prefersReduced() ? 0 : DBLCLICK_MS)
    .constrain((transform, ext) => {
      const c = constrainZoom({ x: transform.x, y: transform.y, k: transform.k }, ext, scaleExtent);
      return zoomIdentity.translate(c.x, c.y).scale(c.k);
    });

  // Keep the double-click honoring reduced motion LIVE. d3-zoom reads behavior.duration()
  // inside its own (bubble-phase) dblclick handler, so a capture-phase listener that runs
  // FIRST can refresh the duration from the current setting just before d3 uses it. This
  // is bulletproof where relying on a matchMedia "change" event would not be.
  const syncDblDuration = () => behavior.duration(prefersReduced() ? 0 : DBLCLICK_MS);

  let settleTimer: ReturnType<typeof setTimeout> | 0 = 0;
  const clearSettle = () => {
    if (settleTimer) {
      clearTimeout(settleTimer);
      settleTimer = 0;
    }
  };

  const isHome = (t: ZoomTransform) => t.k === 1 && t.x === 0 && t.y === 0;

  function apply(transform: ZoomTransform) {
    // Home leaves the idle DOM byte-identical (no inline transform, no clip): the arrival
    // ceremony's translate/rotate and the chart's drop shadow overflow the frame exactly
    // as today. Clip only once actually zoomed.
    if (isHome(transform)) {
      targetEl.style.transform = "";
      viewportEl.classList.remove("zoomed");
    } else {
      targetEl.style.transform = zoomTransformToCss(transform);
      viewportEl.classList.add("zoomed");
    }
    // Per-frame hook for overlays that must counter-scale to a constant size (the place
    // card). It MUST write to a LEAF element, never here on #map: the only per-frame
    // mutation on #map stays the composited `transform`, so #map keeps its rasterize-once
    // / GPU-scale layer. A non-transform style write on #map (an ancestor of the chart
    // <svg>) invalidates the whole subtree every frame, re-rasterizing the baked SVG
    // labels at the live fractional scale, and they visibly jiggle. Learned the hard way.
    if (onApply) onApply({ x: transform.x, y: transform.y, k: transform.k });
  }

  behavior.on("zoom", (event: D3ZoomEvent<HTMLElement, unknown>) => {
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

  function getState(): ZoomState {
    const t = (viewportEl as ZoomStoredElement).__zoom || zoomIdentity;
    return { x: t.x, y: t.y, k: t.k };
  }

  return {
    /** Bind the gesture listeners to viewportEl. Idempotent (re-binds in place). */
    attach() {
      // Refresh the double-click duration from the live reduced-motion setting. Registered
      // BEFORE d3 binds its own dblclick so ours wins the ordering: during capturing (a real
      // click on a child of the viewport) capture beats bubble, and AT_TARGET (a click/dispatch
      // on the viewport itself) listeners fire in registration order, so ours-first requires
      // registering first. d3's on() re-appends on every re-bind, keeping ours ahead. Adding
      // the same listener twice (attach is idempotent) is a no-op, so no guard is needed.
      viewportEl.addEventListener("dblclick", syncDblDuration, true);
      sel().call(behavior);
      // touch-action:none is REQUIRED for touch drag/pinch: d3-zoom does not set it,
      // and without it the browser's native pan/pinch-zoom preempts the gesture. Gated
      // to when the controller is attached (all four styles zoom as of #165) so a detached
      // surface keeps normal page scrolling over the chart. It must be present even at k=1
      // so the very first pinch (from home) reaches the controller rather than scrolling.
      viewportEl.classList.add("zoomable");
    },
    /** Remove the gesture listeners. Leaves the current transform in place. */
    detach() {
      sel().on(".zoom", null);
      viewportEl.removeEventListener("dblclick", syncDblDuration, true);
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
      // #170: a rebase writes __zoom directly (no d3 entry point, so no implicit
      // interrupt); stop any camera transition in flight (a glide, the double-click
      // zoom) or its remaining frames would stomp the fresh home and leave a replaced
      // chart magnified. Pre-existed the glide (the 250ms double-click had the same
      // window) but the glide widened it enough to close.
      sel().interrupt();
      (viewportEl as ZoomStoredElement).__zoom = zoomIdentity;
      apply(zoomIdentity);
    },
    /** Programmatically zoom to a proposed transform, clamped like a live gesture. */
    zoomTo(next: ZoomState) {
      const c = constrainZoom({ x: next.x, y: next.y, k: next.k }, viewportExtent(), scaleExtent);
      sel().call(behavior.transform, zoomIdentity.translate(c.x, c.y).scale(c.k));
    },
    /**
     * #170 the voiced glide: magnify by `factor` about the viewport centre as a short
     * d3 transition (interpolateZoom) through the same "zoom" pipeline, so the settle
     * debounce fires once the glide comes to rest exactly as after a gesture, and it
     * still clamps like one (d3-zoom's scaleBy/scaleTo, the Sub 4 entry points).
     * Reduced motion collapses to the instant scaleBy (the Sub 4 baseline, zero
     * functional loss). Flies to an ABSOLUTE k from nextGlideTarget so rapid presses
     * compound against the pending target, never a mid-flight k.
     */
    glideBy(factor: number) {
      if (prefersReduced()) {
        sel().call(behavior.scaleBy, factor);
        return;
      }
      const base = glideTargetK != null ? glideTargetK : getState().k;
      glideTargetK = nextGlideTarget(base, factor, scaleExtent);
      // Only the LATEST glide's end/interrupt may clear the pending target: a
      // superseding press interrupts THIS transition one frame after setting its own
      // newer target, and an unguarded clear here would null that target mid-flight,
      // making the 3rd-and-later press in a burst compound from a mid-flight k.
      const myGlide = ++glideSeq;
      sel()
        .transition()
        .duration(glideMsNow())
        .call(behavior.scaleTo, glideTargetK)
        .on("end interrupt", () => {
          if (myGlide === glideSeq) glideTargetK = null;
        });
    },
    /**
     * #170 the voiced home: glide the camera to k=1 (the full sheet) and call `onDone`
     * when the leaf lands, so the caller can write the hash at the landing rather than
     * mid-flight (a link copied during the glide must never carry a stale camera).
     * Reduced motion lands home and calls onDone in the same turn. If something
     * interrupts the glide (a gesture, a draw), onDone is skipped on purpose: the
     * interrupting action owns the camera and the hash from that point.
     */
    glideHome(onDone?: () => void) {
      clearSettle();
      glideTargetK = null;
      if (prefersReduced()) {
        sel().call(behavior.transform, zoomIdentity);
        apply(zoomIdentity);
        if (onDone) onDone();
        return;
      }
      sel()
        .transition()
        .duration(glideMsNow())
        .call(behavior.transform, zoomIdentity)
        .on("end", () => {
          if (onDone) onDone();
        });
    },
    /**
     * Pan the view by (dxScreen, dyScreen) screen px (#165: the keyboard arrows). d3's
     * translateBy works in the pre-scale frame (it adds k*arg to the screen translate), so
     * dividing by k turns a screen-px delta into that frame; the constrain then keeps the
     * sheet covering the viewport. Same "zoom" pipeline as scaleBy.
     */
    panBy(dxScreen: number, dyScreen: number) {
      const k = getState().k;
      sel().call(behavior.translateBy, dxScreen / k, dyScreen / k);
    },
    getState,
  };
}
