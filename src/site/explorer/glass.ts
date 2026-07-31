// The Surveyor's Glass wiring (#164/#165/#169/#170), extracted from app.ts at #191 so
// the conductor stays wiring. One factory owns the geometric camera (zoom-controller),
// the semantic redraft (lod-controller), the card counter-scale, and the keyboard +
// on-screen driving; app.ts keeps only the POLICY calls (when to rebase, reset, or home)
// because those belong to the draw/flip/toggle ceremonies it conducts.
import { createZoomController, type ZoomState } from "../shared/zoom-controller.ts";
import { createLodController } from "./lod-controller.ts";
import { cameraFromTransform, transformFromCamera, type Camera } from "./camera.ts";
import type { PlaceManifest } from "../../render/place-manifest.ts";

// #165: a step magnifies by 1.4x about the viewport centre; an arrow pans by ~15% of
// the viewport. The keys and the buttons both route through the controller, which
// drives d3-zoom's own entry points -- so a keystroke enters the EXACT same "zoom"
// event pipeline as a gesture (one clamp, one settle, one hash write), satisfying the
// a11y hard requirement that keyboard-only reaches full zoom.
const ZOOM_STEP = 1.4;
const PAN_FRACTION = 0.15;

interface GlassDeps {
  /** #164: the stable clipping/gesture box wrapping the chart mount. */
  mapViewport: HTMLElement;
  /** The chart mount the live transform lands on. */
  mapDiv: HTMLElement;
  /** worker-client dispatch, for the redraft's region jobs. */
  runJob: Parameters<typeof createLodController>[0]["runJob"];
  /** The engine's overlay builder; every redraft path rebuilds the overlay through it. */
  buildPlaceOverlay: (manifest: PlaceManifest, opts?: { preservePinByName?: boolean; box?: { x: number; y: number; w: number; h: number } }) => void;
  setCaption: (text: string) => void;
  prefersReduce: () => boolean;
  /** #169: whether a settle should redraft (style, chronicle/voyage/verso, test seam). */
  regionEligible: () => boolean;
  /** #165/#169: the conductor's ONE hash writer; settles funnel through it. */
  syncHash: () => void;
  /** The on-screen stand-back / full-sheet / lean-closer cluster (#165, voiced in #170). */
  buttons: { zoomIn: HTMLElement; zoomOut: HTMLElement; reset: HTMLElement; cluster: HTMLElement };
}

export function createGlass(deps: GlassDeps) {
  const { mapViewport, mapDiv, buttons } = deps;

  // #170: the voiced glide's duration, single-timing-source discipline (lazy, with the
  // token's own value as fallback). The controller reads it per glide, so a stylesheet
  // tweak takes effect without a reload; reduced motion never reaches it.
  function glideMs(): number {
    const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--glide"));
    return Number.isFinite(v) ? v : 300;
  }

  // #164: publish the current zoom k onto the place card (a LEAF, sibling of the chart
  // svg) so the card counter-scales to a constant, readable size. #331 adds the
  // .place-overlay container as a second target so the hit ring divides by the same k.
  // Both are siblings of the chart svg, never the mount: a per-frame non-transform
  // style write on the mount (or any svg ancestor) re-rasterizes the baked SVG labels
  // and makes them jiggle (only the mount's `transform` may change per frame).
  function setCardZoom(k: number): void {
    const card = document.getElementById("place-card");
    const overlay = mapDiv.querySelector<HTMLElement>(".place-overlay");
    for (const el of [card, overlay]) {
      if (!el) continue;
      if (k === 1) el.style.removeProperty("--zoom-k");
      else el.style.setProperty("--zoom-k", String(k));
    }
  }

  // #165: the camera is bookmarkable. On settle (a gesture, a keyboard step, or an
  // on-screen button coming to rest) the current frame is mirrored into the hash as
  // cx/cy/k; at home (k=1) those params are dropped, so a home view links clean.
  // reducedMotion is left unset so the controller reads the OS setting LIVE (see
  // zoom-controller.ts), which is both more correct and what lets the e2e prove AC5's
  // collapse.
  const zoomController = createZoomController({
    viewportEl: mapViewport,
    targetEl: mapDiv,
    scaleExtent: [1, 8],
    onApply: (state) => setCardZoom(state.k),
    onSettle: () => onCameraSettle(), // #169: hash + (on antique) the region redraft
    glideMs,
  });

  // #169 The redraft: a camera settle on the antique chart draws a finer regional survey
  // of the window, committed as an INSET laid over the world sheet (the camera never
  // rebases; a zoom-out just fades the inset away over the world chart that was around
  // it all along). The controller owns the band/window state, the worker dispatch, and
  // the inset mount/crossfade; the conductor hands it the pieces and gates it
  // (regionEligible) so a geometric zoom on any other style still only writes the hash.
  const lodController = createLodController({
    mapDiv,
    runJob: deps.runJob,
    // Every controller path (commit, revert, homeToWorld) rebuilds the overlay, which
    // creates a FRESH #place-card -- and none of those paths touches the camera, so
    // nothing else would re-publish the zoom onto it. Re-publish here (the draw paths
    // get the same via syncZoom) or a card shown after a redraft renders k-times too
    // large.
    buildPlaceOverlay: (manifest, opts) => {
      deps.buildPlaceOverlay(manifest, opts);
      setCardZoom(zoomController.getState().k);
    },
    setCaption: deps.setCaption,
    getZoomK: () => zoomController.getState().k,
    prefersReduce: deps.prefersReduce,
  });

  // #165/#169: the camera the controller is framing -- sheet fractions of the WORLD
  // sheet at every band (the inset design never rebases) -- read from the STABLE
  // viewport (its client box is the sheet's size at k=1). Guard a zero-size box
  // (before first layout) so the division is finite.
  function cameraNow(): Camera {
    const W = mapViewport.clientWidth || 1;
    const H = mapViewport.clientHeight || 1;
    return cameraFromTransform(zoomController.getState(), W, H);
  }

  function onCameraSettle(): void {
    deps.syncHash();
    if (deps.regionEligible()) lodController.onSettle(cameraNow());
  }

  // #165: geometric pan/zoom belongs to ALL FOUR styles (the epic's ratified decision;
  // semantic LOD stays antique-only via regionEligible). The controller attaches
  // unconditionally; the reset-home-on-world-change policy lives in the conductor's
  // draw()/verso/chronicle handlers, not here, so there is no style branch that could
  // strand a magnified sheet.
  function syncZoom(): void {
    zoomController.attach();
    // The overlay (and #place-card) was just rebuilt by this draw; re-publish the
    // current zoom onto the fresh card so a card shown before the next gesture is
    // counter-scaled.
    setCardZoom(zoomController.getState().k);
  }

  // #165: restore a deep link's camera. zoomTo clamps, so a centre that would pull an
  // edge past the viewport at that zoom is pinned in bounds.
  function applyCamera(cam: Camera): void {
    zoomController.zoomTo(transformFromCamera(cam, mapViewport.clientWidth, mapViewport.clientHeight));
  }

  // #170: the voiced home, shared by the full-sheet button and the 0 key. A committed
  // inset FADES off over the world chart (easeHome) while the camera glides home; the
  // hash writes at the landing (glideHome's onDone), never mid-flight, so a link copied
  // right after the leaf settles is clean. The programmatic homes (verso, chronicle,
  // voyage, draw) keep their INSTANT homeToWorld() + reset() + explicit syncHash in the
  // conductor: those ceremonies own the sheet and need the bare world chart
  // synchronously.
  function goHomeVoiced(): void {
    lodController.easeHome();
    zoomController.glideHome(deps.syncHash);
  }

  // The map viewport is focusable (tabindex in the HTML), so a keyboard user tabs onto
  // the sheet and pans/zooms it. Scoped to the viewport (not document) so the arrows do
  // not hijack the page scroll from elsewhere; preventDefault only for keys we consume,
  // so Escape et al still bubble to the document (card dismiss). "0" homes the camera.
  // #170: the zoom steps and the home GLIDE (the voiced ceremony); reduced motion
  // collapses both to the instant baseline inside the controller. The pan arrows stay
  // instant on purpose (the accessible pan baseline; #170 scopes the glide to +/- and
  // the home).
  mapViewport.addEventListener("keydown", (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return; // leave browser/OS chords alone
    const W = mapViewport.clientWidth;
    const H = mapViewport.clientHeight;
    switch (e.key) {
      case "+": case "=": zoomController.glideBy(ZOOM_STEP); break;
      case "-": case "_": zoomController.glideBy(1 / ZOOM_STEP); break;
      // Arrow moves the camera the way it points: ArrowRight reveals what lies to the
      // right, so the content slides left, i.e. the screen translate decreases. panBy
      // takes a screen delta, so the sign is applied here and the controller stays
      // direction-agnostic.
      case "ArrowLeft": zoomController.panBy(W * PAN_FRACTION, 0); break;
      case "ArrowRight": zoomController.panBy(-W * PAN_FRACTION, 0); break;
      case "ArrowUp": zoomController.panBy(0, H * PAN_FRACTION); break;
      case "ArrowDown": zoomController.panBy(0, -H * PAN_FRACTION); break;
      case "0": goHomeVoiced(); break; // #170: the full sheet, voiced
      default: return; // not ours: let it through (browse mode, card Escape, tabbing)
    }
    e.preventDefault();
  });
  buttons.zoomIn.addEventListener("click", () => zoomController.glideBy(ZOOM_STEP));
  buttons.zoomOut.addEventListener("click", () => zoomController.glideBy(1 / ZOOM_STEP));
  buttons.reset.addEventListener("click", goHomeVoiced);
  // The cluster sits INSIDE the viewport, the element d3-zoom binds its gesture
  // listeners to. So a gesture over a button bubbles into d3: most visibly, a rapid
  // double-click on a button fires a `dblclick` that d3 turns into its own
  // double-click-to-zoom (a 2x magnify about the pointer, i.e. the button corner),
  // lurching the map on its own. Stop d3's gesture events at the cluster so ONLY the
  // buttons' click handlers act. The chart's own double-click-to-zoom (a dblclick on
  // the viewport, not a button) is unaffected, and click never propagates here so the
  // handlers above still fire.
  for (const type of ["mousedown", "dblclick", "wheel", "touchstart"]) {
    buttons.cluster.addEventListener(type, (e) => e.stopPropagation());
  }

  return {
    cameraNow,
    syncZoom,
    applyCamera,
    // camera policy entry points, called by the conductor's ceremonies
    rebase: () => zoomController.rebase(),
    reset: () => zoomController.reset(),
    zoomTo: (t: ZoomState) => zoomController.zoomTo(t),
    zoomState: () => zoomController.getState(),
    // redraft entry points
    cancelRedraft: () => lodController.cancel(),
    setWorld: (ctx: Parameters<typeof lodController.setWorld>[0]) => lodController.setWorld(ctx),
    homeToWorld: () => lodController.homeToWorld(),
    lodState: () => lodController.state(),
  };
}

export type Glass = ReturnType<typeof createGlass>;
