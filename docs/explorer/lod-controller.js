// The Surveyor's Glass, Sub 8 (#169): the redraft. Wires a camera SETTLE on the antique
// chart to a finer REGIONAL survey of the window, and a zoom-out back to the retained world
// sheet. The convergence point of the epic: Sub 4 gave the camera, Sub 7 gave the region
// engine + LOD schedule, the sheet-turn (#131) gave the commit discipline; only the rebase
// math is new, and it lives (pure, unit-tested) in src/world/lod.ts. This module is the DOM
// conductor around that math -- crossfade, rebase, worker dispatch, overlay -- proven by e2e.
//
// Kept out of app.js so the conductor stays glue: app.js owns the controls + the draw race,
// and hands this module the pieces it needs (the zoom controller, runJob, buildPlaceOverlay,
// the camera reader) plus a per-draw world context (setWorld). Antique-only redraft: app.js
// gates onSettle on the style, so a non-antique settle only writes the hash (geometric zoom).
import {
  LOD_BANDS,
  decideSettle,
  scaleExtentFor,
  FULL_WINDOW,
} from "./engine/world/lod.js";

/**
 * @param {{
 *   mapDiv: HTMLElement,            // #map, holds the current sheet (world or region)
 *   mapViewport: HTMLElement,       // #map-viewport, the stable clip/gesture box (crossfade host)
 *   zoomController: any,            // createZoomController(): rebase/reset/setScaleExtent/getState
 *   runJob: (msg:any)=>Promise<any>,// worker-client dispatch
 *   buildPlaceOverlay: (manifest:any, opts?:any)=>void,
 *   setCaption: (text:string)=>void,
 *   syncHash: ()=>void,
 *   prefersReduce: ()=>boolean,
 * }} deps
 */
export function createLodController(deps) {
  const { mapDiv, mapViewport, zoomController, runJob, buildPlaceOverlay, setCaption, syncHash, prefersReduce } = deps;

  // The world-uv window the mounted sheet covers, and the LOD band held. Band 0 is the world
  // sheet (window = the whole sheet); 1..3 are regional surveys. currentWindow is what the
  // settle math composes the region-relative camera against, so it MUST track the mounted sheet.
  let currentBand = 0;
  let currentWindow = FULL_WINDOW;

  // The retained world context, from the last world draw: enough to (a) fire a region job over
  // the SAME base world (cache hit) and (b) restore the world sheet on a zoom-out with no worker.
  let world = null; // { seed, overrides, render, svg, manifest } | null

  // The region sheet currently committed (for the Download-saves-what-you-see policy), or null
  // at the world sheet.
  let committed = null; // { svg, band, title } | null

  // Monotonic guard, the drawGen idiom: every dispatch bumps it; a resolved job that is no
  // longer the latest is silently dropped, so only the LAST settle in a flurry commits.
  let regionGen = 0;
  // A monotonic count of committed redrafts, surfaced to the e2e so it can prove one-job-per-
  // settle and last-wins without timing.
  let redrafts = 0;

  const crossfade = makeCrossfade(mapViewport);

  function setBandExtent(band) {
    if (zoomController.setScaleExtent) zoomController.setScaleExtent(scaleExtentFor(band));
  }

  // Dispatch a region job for (band, window) over the retained base world, guarded so a
  // superseding settle drops this one. On commit the finer sheet crossfades in and the camera
  // rebases to it, so the SAME framing shows at a finer grid with no visible jump.
  function dispatchRegion(band, window) {
    if (!world) return;
    const myGen = ++regionGen;
    setCaption("Drafting the finer survey…");
    const t0 = performance.now();
    runJob({
      kind: "region",
      seed: world.seed,
      overrides: world.overrides,
      window,
      gridW: LOD_BANDS[band].gridW,
      gridH: LOD_BANDS[band].gridH,
      band,
      render: world.render, // same style/legend/arms/theme/width as the world sheet
      // no title: the worker derives "The Environs of X" from (world, window) so the live
      // redraft and a downloaded sheet's redraw agree byte-for-byte (#169).
    })
      .then((res) => {
        if (myGen !== regionGen) return; // superseded by a newer settle
        const ms = (performance.now() - t0).toFixed(0);
        crossfade.run(res.svg, prefersReduce(), () => {
          // One synchronous tick (the sheet-turn discipline): band/window state, then the new
          // SVG, then rebase, then the overlay, so the reader never sees a gap frame.
          currentBand = band;
          currentWindow = window;
          committed = { svg: res.svg, band, title: res.title };
          mapDiv.innerHTML = res.svg;
          zoomController.rebase(); // the region sheet is the new home: identity fills the viewport
          setBandExtent(band); // region-relative ck now maps to world zoom [1,8]
          buildPlaceOverlay(res.manifest, { preservePinByName: true });
          redrafts++;
          setCaption(`${res.title} · regional survey · band ${band} · drawn in ${ms}ms`);
          syncHash(); // the composed world framing (post-rebase) links correctly
        });
      })
      .catch((err) => {
        if (myGen !== regionGen) return;
        setCaption("The cartographer spilled the ink: " + (err && err.message ? err.message : String(err)));
      });
  }

  // Zoom-out past the world threshold: crossfade back to the RETAINED world sheet, no worker
  // round-trip (the scope's "no worker round-trip" is why a region never steps down band by
  // band; the only coarser sheet kept is the world). bandFor only returns 0 below the down-
  // cross, so the camera lands near home and rebasing to home reads as a clean zoom-out.
  function revertToWorld() {
    if (!world) return;
    const myGen = ++regionGen; // cancel any in-flight region so it cannot commit after the revert
    crossfade.run(world.svg, prefersReduce(), () => {
      if (myGen !== regionGen) return;
      currentBand = 0;
      currentWindow = FULL_WINDOW;
      committed = null;
      mapDiv.innerHTML = world.svg;
      zoomController.rebase(); // home: the world sheet fills the viewport
      setBandExtent(0);
      buildPlaceOverlay(world.manifest, { preservePinByName: true });
      setCaption("");
      syncHash();
    });
  }

  return {
    /** A camera settle on the antique chart. `cam` is the REGION-RELATIVE {cx,cy,k}. */
    onSettle(cam) {
      if (!world) return;
      const decision = decideSettle({ camera: cam, currentWindow, currentBand });
      if (decision.action === "noop") return;
      if (decision.action === "world") return revertToWorld();
      dispatchRegion(decision.band, decision.window);
    },

    /** Record the world sheet just drawn, and reset to band 0. Called on every world draw. */
    setWorld({ seed, overrides, render, svg, manifest }) {
      world = { seed, overrides, render, svg, manifest };
      currentBand = 0;
      currentWindow = FULL_WINDOW;
      committed = null;
      regionGen++; // any region in flight from the previous world is now stale
      crossfade.cancel();
      setBandExtent(0);
    },

    /** Drop any in-flight redraft and reset the band state (a new draw is starting). */
    cancel() {
      regionGen++;
      crossfade.cancel();
      currentBand = 0;
      currentWindow = FULL_WINDOW;
      committed = null;
      setBandExtent(0);
    },

    // Restore the WORLD sheet instantly (no crossfade) if a region is committed, so a world-
    // sheet-changing action (verso flip, chronicle, home/reset) operates on the world chart,
    // not a region (whose baked layers have no chronicle/realm data). A no-op at band 0. The
    // caller still snaps the camera home (zoomController.reset) and writes the hash.
    homeToWorld() {
      regionGen++;
      crossfade.cancel();
      if (currentBand > 0 && world) {
        mapDiv.innerHTML = world.svg;
        buildPlaceOverlay(world.manifest);
        setCaption("");
      }
      currentBand = 0;
      currentWindow = FULL_WINDOW;
      committed = null;
      setBandExtent(0);
    },

    /** The world-uv window the mounted sheet covers, for the composed hash camera. */
    worldWindow() {
      return currentWindow;
    },

    /** The committed region sheet for the Download policy, or null at the world sheet. */
    committedRegion() {
      return committed;
    },

    /** Observable state for the e2e (band, window, title, redraft count). */
    state() {
      return {
        band: currentBand,
        window: currentWindow,
        committed: committed !== null,
        title: committed ? committed.title : null,
        redrafts,
      };
    },
  };
}

// A crossfade that follows the sheet-turn commit discipline: fade the incoming sheet in as a
// blob <img> laid over the viewport, and only when it is fully opaque write the new SVG into
// #map and tear the layer down in ONE synchronous tick, so the reader never sees a gap frame
// between the old chart and the re-dressed one. Reduced motion collapses it to an instant swap.
// The layer lives on #map-viewport (NOT #map): #map carries the live zoom transform, so an
// overlay inside it would inherit that transform; the incoming sheet must show at identity (the
// framing #map rebases to), which is the viewport's own box.
function makeCrossfade(mapViewport) {
  let active = null;
  return {
    run(newSvg, reduced, commit) {
      if (active) active.abort();
      if (reduced) {
        commit();
        return;
      }
      let blobUrl = "";
      let layer = null;
      try {
        blobUrl = URL.createObjectURL(new Blob([newSvg], { type: "image/svg+xml" }));
        layer = document.createElement("div");
        layer.className = "region-fade";
        layer.setAttribute("aria-hidden", "true");
        const img = document.createElement("img");
        img.alt = "";
        img.src = blobUrl;
        layer.appendChild(img);
        mapViewport.appendChild(layer);
        void layer.offsetWidth; // force layout so the class add transitions from opacity 0
        layer.classList.add("in");

        let settled = false;
        const finish = (doCommit) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          layer.removeEventListener("transitionend", onEnd);
          if (doCommit) commit(); // new SVG in + rebase, before the layer is removed: no gap frame
          if (layer.parentNode) layer.remove();
          if (blobUrl) URL.revokeObjectURL(blobUrl);
          active = null;
        };
        const onEnd = (e) => {
          if (e.target === layer) finish(true);
        };
        layer.addEventListener("transitionend", onEnd);
        // Fallback: if transitionend never fires (e.g. a zero-duration or dropped transition),
        // commit anyway so the redraft is never stranded behind the fade.
        const timer = setTimeout(() => finish(true), 700);
        active = { abort: () => finish(false) };
      } catch {
        // Setup failed (no Blob/URL): undo any partial scaffold and swap instantly.
        if (layer && layer.parentNode) layer.remove();
        if (blobUrl) {
          try {
            URL.revokeObjectURL(blobUrl);
          } catch {}
        }
        active = null;
        commit();
      }
    },
    cancel() {
      if (active) active.abort();
    },
  };
}
