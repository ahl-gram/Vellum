// The Surveyor's Glass (#164): a shared, page-agnostic controller giving an element
// geometric pan/zoom via d3-zoom. The ONLY file that imports d3-zoom (plus d3-selection
// to attach it). The live gesture is CSS-only: transforms land on targetEl's
// style.transform, so the SVG and its overlays ride one composited frame with no redraw.
import { zoom, zoomIdentity, type D3ZoomEvent, type ZoomBehavior, type ZoomTransform } from "d3-zoom";
import { select } from "d3-selection";
// #170: side-effect import for the voiced glide; it patches d3-selection's prototype and was already in the bundle transitively.
import "d3-transition";

export interface ZoomState {
  x: number;
  y: number;
  k: number;
}

/** d3's own ZoomTransform.toString() emits unit-less translate, which the CSS property silently rejects; build the px-suffixed string. */
export function zoomTransformToCss(t: ZoomState): string {
  return `translate(${t.x}px, ${t.y}px) scale(${t.k})`;
}

/** Mirrors d3-zoom's defaultConstrain against a clamped k, so zoomTo clamps identically to a live gesture. */
export function constrainZoom(
  t: ZoomState,
  extent: ReadonlyArray<ReadonlyArray<number>>,
  scaleExtent: ReadonlyArray<number>,
): ZoomState {
  const k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], t.k));
  const [[x0, y0], [x1, y1]] = extent;
  const invX0 = (x0 - t.x) / k - x0;
  const invX1 = (x1 - t.x) / k - x1;
  const invY0 = (y0 - t.y) / k - y0;
  const invY1 = (y1 - t.y) / k - y1;
  const dx = invX1 > invX0 ? (invX0 + invX1) / 2 : Math.min(0, invX0) || Math.max(0, invX1);
  const dy = invY1 > invY0 ? (invY0 + invY1) / 2 : Math.min(0, invY0) || Math.max(0, invY1);
  return { x: t.x + k * dx, y: t.y + k * dy, k };
}

/** #170: the absolute k a glide flies to; compounds against the PENDING target so hammering "+" lands factor^presses, clamped to scaleExtent. */
export function nextGlideTarget(
  baseK: number,
  factor: number,
  scaleExtent: ReadonlyArray<number>,
): number {
  return Math.max(scaleExtent[0], Math.min(scaleExtent[1], baseK * factor));
}

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

// d3-zoom stashes the live transform on the element itself as `__zoom`; typed so getState/rebase read and write it through one cast.
type ZoomStoredElement = HTMLElement & { __zoom?: ZoomTransform };

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

  // #165: reduced motion is read LIVE (boolean, getter, or matchMedia), so an OS toggle and the e2e emulation take effect without a reload.
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
  // #170: read live; a getter lets the page hand in a lazy /motion.css token read (the stylesheet may not be applied at construction).
  const glideMsNow = () => {
    const v = typeof glideMs === "function" ? glideMs() : glideMs;
    return Number.isFinite(v) && v >= 0 ? v : 250;
  };
  // #170: the in-flight glide's absolute target k; glideSeq guards so only the LATEST glide's end/interrupt clears it (a superseding press interrupts its predecessor one frame AFTER setting the new target).
  let glideTargetK: number | null = null;
  let glideSeq = 0;

  const behavior: ZoomBehavior<HTMLElement, unknown> = zoom<HTMLElement, unknown>()
    .scaleExtent(scaleExtent)
    .extent(viewportExtent)
    .duration(prefersReduced() ? 0 : DBLCLICK_MS)
    .constrain((transform, ext) => {
      const c = constrainZoom({ x: transform.x, y: transform.y, k: transform.k }, ext, scaleExtent);
      return zoomIdentity.translate(c.x, c.y).scale(c.k);
    });

  // d3-zoom reads behavior.duration() inside its own bubble-phase dblclick handler, so this capture-phase refresh runs first and keeps reduced motion live per click.
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
    if (isHome(transform)) {
      targetEl.style.transform = "";
      viewportEl.classList.remove("zoomed");
    } else {
      targetEl.style.transform = zoomTransformToCss(transform);
      viewportEl.classList.add("zoomed");
    }
    if (onApply) onApply({ x: transform.x, y: transform.y, k: transform.k });
  }

  behavior.on("zoom", (event: D3ZoomEvent<HTMLElement, unknown>) => {
    apply(event.transform);
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
      // Registered BEFORE d3 binds its own dblclick so ours always runs first: capture beats bubble, and AT_TARGET fires in registration order.
      viewportEl.addEventListener("dblclick", syncDblDuration, true);
      sel().call(behavior);
      viewportEl.classList.add("zoomable");
    },
    /** Remove the gesture listeners. Leaves the current transform in place. */
    detach() {
      sel().on(".zoom", null);
      viewportEl.removeEventListener("dblclick", syncDblDuration, true);
      viewportEl.classList.remove("zoomable");
      clearSettle();
    },
    reset() {
      clearSettle();
      sel().call(behavior.transform, zoomIdentity);
      apply(zoomIdentity);
    },
    /** Adopt the current sheet as a fresh home, no transition: the chart under the camera was replaced. */
    rebase() {
      clearSettle();
      // #170: a rebase writes __zoom directly (no d3 entry point, so no implicit interrupt); stop any camera transition in flight or its remaining frames would stomp the fresh home.
      sel().interrupt();
      (viewportEl as ZoomStoredElement).__zoom = zoomIdentity;
      apply(zoomIdentity);
    },
    /** Programmatically zoom to a proposed transform, clamped like a live gesture. */
    zoomTo(next: ZoomState) {
      const c = constrainZoom({ x: next.x, y: next.y, k: next.k }, viewportExtent(), scaleExtent);
      sel().call(behavior.transform, zoomIdentity.translate(c.x, c.y).scale(c.k));
    },
    /** #170: magnify by `factor` about the viewport centre as a d3 transition through the same zoom pipeline; reduced motion collapses to the instant scaleBy. */
    glideBy(factor: number) {
      if (prefersReduced()) {
        sel().call(behavior.scaleBy, factor);
        return;
      }
      const base = glideTargetK != null ? glideTargetK : getState().k;
      glideTargetK = nextGlideTarget(base, factor, scaleExtent);
      const myGlide = ++glideSeq;
      sel()
        .transition()
        .duration(glideMsNow())
        .call(behavior.scaleTo, glideTargetK)
        .on("end interrupt", () => {
          if (myGlide === glideSeq) glideTargetK = null;
        });
    },
    /** #170: glide the camera to k=1; onDone fires at the landing and is skipped on interrupt (the interrupting action owns the camera and the hash). */
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
    /** d3's translateBy works in the pre-scale frame (it adds k*arg to the screen translate), so divide by k to pan in screen px. */
    panBy(dxScreen: number, dyScreen: number) {
      const k = getState().k;
      sel().call(behavior.translateBy, dxScreen / k, dyScreen / k);
    },
    getState,
  };
}
