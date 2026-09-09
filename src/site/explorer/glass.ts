// The Surveyor's Glass wiring: one factory owns the geometric camera, the semantic redraft, the card counter-scale and the keyboard + on-screen driving; app.ts keeps only the POLICY calls (when to rebase, reset, or home).
import { createZoomController, type ZoomState } from "../shared/zoom-controller.ts";
import { createLodController } from "./lod-controller.ts";
import { cameraFromTransform, transformFromCamera, type Camera } from "./camera.ts";
import type { PlaceManifest } from "../../render/place-manifest.ts";

// #165: keys and buttons route through the controller into d3-zoom's own entry points, so a keystroke enters the EXACT same pipeline as a gesture (one clamp, one settle, one hash write).
const ZOOM_STEP = 1.4;
const PAN_FRACTION = 0.15;

interface GlassDeps {
  mapViewport: HTMLElement;
  mapDiv: HTMLElement;
  runJob: Parameters<typeof createLodController>[0]["runJob"];
  buildPlaceOverlay: (manifest: PlaceManifest, opts?: { preservePinByName?: boolean; box?: { x: number; y: number; w: number; h: number } }) => void;
  reclampCard: () => void;
  setCaption: (text: string) => void;
  setError: (text: string) => void;
  prefersReduce: () => boolean;
  regionEligible: () => boolean;
  syncHash: () => void;
  /** #520: the dog-ear rides the committed inset, so the conductor hangs it here rather than on a sibling that would outlive the sheet. */
  decorateInset?: (el: HTMLElement) => void;
  buttons: { zoomIn: HTMLElement; zoomOut: HTMLElement; reset: HTMLElement; cluster: HTMLElement };
}

export function createGlass(deps: GlassDeps) {
  const { mapViewport, mapDiv, buttons } = deps;

  // #170: single timing source (the --glide token), read per glide so a stylesheet tweak takes effect without a reload; reduced motion never reaches it.
  function glideMs(): number {
    const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--glide"));
    return Number.isFinite(v) ? v : 300;
  }

  // #164/#331: publish k onto the card and the .place-overlay, both LEAF siblings of the chart svg, never the mount: a per-frame non-transform style write on an svg ancestor re-rasterizes the baked labels and they visibly jiggle.
  function setCardZoom(k: number): void {
    const card = document.getElementById("place-card");
    const overlay = mapDiv.querySelector<HTMLElement>(".place-overlay");
        // ALL of them: an outgoing inset stays mounted until its fade ends, up to 700ms, so a singular query hands the counter-scale to the sheet leaving and not the one arriving.
    const ears = [...mapDiv.querySelectorAll<HTMLElement>(".dog-ear")];
    for (const el of [card, overlay, ...ears]) {
      if (!el) continue;
      if (k === 1) el.style.removeProperty("--zoom-k");
      else el.style.setProperty("--zoom-k", String(k));
    }
    // #387/#388: ordered AFTER the publish above, and reached by every camera apply and every redraft rebuild. A redraft's fresh card has no counter-scale until that loop runs, so re-measuring before it measures the card k times too large.
    deps.reclampCard();
  }

  // reducedMotion is left unset so the controller reads the OS setting LIVE.
  const zoomController = createZoomController({
    viewportEl: mapViewport,
    targetEl: mapDiv,
    scaleExtent: [1, 8],
    onApply: (state) => setCardZoom(state.k),
    onSettle: () => onCameraSettle(),
    glideMs,
  });

  const lodController = createLodController({
    mapDiv,
    runJob: deps.runJob,
    // Every controller path (commit, revert, homeToWorld) rebuilds a FRESH #place-card and none touches the camera, so re-publish the zoom here or a card shown after a redraft renders k-times too large.
    buildPlaceOverlay: (manifest, opts) => {
      deps.buildPlaceOverlay(manifest, opts);
      setCardZoom(zoomController.getState().k);
    },
    setCaption: deps.setCaption,
    setError: deps.setError,
    getZoomK: () => zoomController.getState().k,
    prefersReduce: deps.prefersReduce,
    decorateInset: deps.decorateInset,
  });

  // #165/#169: sheet fractions of the WORLD sheet at every band (the inset design never rebases), read from the STABLE viewport; guard a zero-size box (before first layout) so the division is finite.
  function cameraNow(): Camera {
    const W = mapViewport.clientWidth || 1;
    const H = mapViewport.clientHeight || 1;
    return cameraFromTransform(zoomController.getState(), W, H);
  }

  function onCameraSettle(): void {
    deps.syncHash();
    if (deps.regionEligible()) lodController.onSettle(cameraNow());
  }

  // #165: geometric pan/zoom belongs to ALL FOUR styles (the epic's ratified decision); the controller attaches unconditionally, and the reset-home-on-world-change policy lives in the conductor, so no style branch can strand a magnified sheet.
  function syncZoom(): void {
    zoomController.attach();
    setCardZoom(zoomController.getState().k);
  }

  function applyCamera(cam: Camera): void {
    zoomController.zoomTo(transformFromCamera(cam, mapViewport.clientWidth, mapViewport.clientHeight));
  }
  function refitCamera(cam: Camera): void {
    zoomController.refit(transformFromCamera(cam, mapViewport.clientWidth, mapViewport.clientHeight));
  }

  // #170: the voiced home (full-sheet button, the 0 key); the hash writes at the landing (glideHome's onDone), never mid-flight. The programmatic homes (verso, chronicle, voyage, draw) keep their INSTANT homeToWorld() + reset() + explicit syncHash in the conductor.
  function goHomeVoiced(): void {
    lodController.easeHome();
    zoomController.glideHome(deps.syncHash);
  }

  // Scoped to the focusable viewport, not document, so the arrows never hijack page scroll; preventDefault only for keys we consume, so Escape still bubbles to the card dismiss; the pan arrows stay instant on purpose (the accessible pan baseline).
  mapViewport.addEventListener("keydown", (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const W = mapViewport.clientWidth;
    const H = mapViewport.clientHeight;
    switch (e.key) {
      case "+": case "=": zoomController.glideBy(ZOOM_STEP); break;
      case "-": case "_": zoomController.glideBy(1 / ZOOM_STEP); break;
      // ArrowRight reveals what lies to the right, so the content slides left and the screen translate decreases; the sign lives here and the controller stays direction-agnostic.
      case "ArrowLeft": zoomController.panBy(W * PAN_FRACTION, 0); break;
      case "ArrowRight": zoomController.panBy(-W * PAN_FRACTION, 0); break;
      case "ArrowUp": zoomController.panBy(0, H * PAN_FRACTION); break;
      case "ArrowDown": zoomController.panBy(0, -H * PAN_FRACTION); break;
      case "0": goHomeVoiced(); break;
      default: return;
    }
    e.preventDefault();
  });
  buttons.zoomIn.addEventListener("click", () => zoomController.glideBy(ZOOM_STEP));
  buttons.zoomOut.addEventListener("click", () => zoomController.glideBy(1 / ZOOM_STEP));
  buttons.reset.addEventListener("click", goHomeVoiced);
  // The cluster sits INSIDE the element d3-zoom binds its gesture listeners to, so a rapid double-click on a button becomes d3's own double-click-to-zoom about the button corner (a lurch). Stop d3's gesture events at the cluster; click never propagates here, so the button handlers above still fire.
  for (const type of ["mousedown", "dblclick", "wheel", "touchstart"]) {
    buttons.cluster.addEventListener(type, (e) => e.stopPropagation());
  }

  return {
    cameraNow,
    syncZoom,
    applyCamera,
    refitCamera,
    rebase: () => zoomController.rebase(),
    reset: () => zoomController.reset(),
    zoomTo: (t: ZoomState) => zoomController.zoomTo(t),
    zoomState: () => zoomController.getState(),
    cancelRedraft: () => lodController.cancel(),
    setWorld: (ctx: Parameters<typeof lodController.setWorld>[0]) => lodController.setWorld(ctx),
    homeToWorld: () => lodController.homeToWorld(),
    committedSurvey: () => lodController.committedSurvey(),
    lodState: () => lodController.state(),
  };
}

export type Glass = ReturnType<typeof createGlass>;
