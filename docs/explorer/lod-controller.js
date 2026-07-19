// The Surveyor's Glass, Sub 8 (#169): the redraft. Wires a camera SETTLE on the antique
// chart to a finer REGIONAL survey of the window. Redesigned in PR #245 review: the camera
// stays WORLD-relative for good. A committed survey never replaces the world sheet and never
// rebases the controller; it mounts as an INSET -- a smaller region sheet laid over the exact
// window it re-surveys, inside #map, riding the same live transform as the chart and its
// overlays. That one decision is what makes the interactions continuous:
//   - pan/zoom always run against the world sheet's own extent (the proven Sub 3/4 geometry),
//     so panning works at every band and no per-band scaleExtent exists;
//   - a commit moves NOTHING (the transform is untouched): the window's content sharpens in
//     place and the region sheet's own frame appears around it, a detail survey pasted on the
//     master chart;
//   - a zoom-out shows the world chart around the inset immediately (it was there all along),
//     and the region -> world hop just fades the inset away, no worker round-trip.
// The pure settle/inset math lives (unit-tested) in src/world/lod.js; this module is the DOM
// conductor -- inset mount, crossfade, worker dispatch, overlay, the drafting indicator.
//
// Kept out of app.js so the conductor stays glue: app.js owns the controls + the draw race,
// and hands this module the pieces it needs plus a per-draw world context (setWorld).
// Antique-only redraft: app.js gates onSettle on the style, so a non-antique settle only
// writes the hash (geometric zoom).
import {
  LOD_BANDS,
  decideSettle,
  plotUvFromSheet,
  windowSheetRect,
  insetSheetRect,
  FULL_WINDOW,
} from "./engine/world/lod.js";

const pct = (f) => `${(f * 100).toFixed(4)}%`;

/**
 * @param {{
 *   mapDiv: HTMLElement,            // #map, the world sheet's box; insets mount inside it
 *   runJob: (msg:any)=>Promise<any>,// worker-client dispatch
 *   buildPlaceOverlay: (manifest:any, opts?:any)=>void,
 *   setCaption: (text:string)=>void,
 *   getZoomK: ()=>number,           // current world zoom, to counter-scale the pencil border
 *   prefersReduce: ()=>boolean,
 * }} deps
 */
export function createLodController(deps) {
  const { mapDiv, runJob, buildPlaceOverlay, setCaption, getZoomK, prefersReduce } = deps;

  // The plot-uv window the committed inset covers, and the LOD band held. Band 0 is the
  // bare world sheet (FULL_WINDOW, no inset); 1..3 are regional surveys.
  let currentBand = 0;
  let currentWindow = FULL_WINDOW;

  // The retained world context, from the last world draw: enough to fire a region job over
  // the SAME base world (cache hit) and to rebuild the world overlay when the inset drops.
  let world = null; // { seed, overrides, render, manifest } | null

  // The committed inset (for the Download-saves-what-you-see policy and the DOM teardown),
  // or null at the bare world sheet.
  let inset = null; // { el, svg, band, window, title } | null

  // The drafting indicator: a dashed outline over the window being surveyed, up between
  // dispatch and commit. One element, repositioned per dispatch.
  let pencil = null;

  // Monotonic guard, the drawGen idiom: every dispatch bumps it; a resolved job that is no
  // longer the latest is silently dropped, so only the LAST settle in a flurry commits.
  let regionGen = 0;
  // A monotonic count of committed redrafts, surfaced to the e2e so it can prove one-job-per-
  // settle and last-wins without timing.
  let redrafts = 0;

  // marginPx/widthPx differ from marginPx/heightPx (same px inset, different axis lengths),
  // so the conversion carries both. The world manifest is the authority: the camera is read
  // against the world sheet at every band.
  function margins() {
    const m = world.manifest;
    return { mx: m.marginPx / m.widthPx, my: m.marginPx / m.heightPx };
  }

  function showPencil(window) {
    const r = windowSheetRect(window, margins());
    if (!pencil) {
      pencil = document.createElement("div");
      pencil.className = "survey-pencil";
      pencil.setAttribute("aria-hidden", "true");
    }
    pencil.style.left = pct(r.x);
    pencil.style.top = pct(r.y);
    pencil.style.width = pct(r.w);
    pencil.style.height = pct(r.h);
    // The pencil rides #map's transform, so a fixed border would fatten k-fold on screen.
    pencil.style.borderWidth = `${Math.max(0.4, 2 / Math.max(1, getZoomK()))}px`;
    if (!pencil.parentNode) mapDiv.appendChild(pencil);
  }

  function hidePencil() {
    if (pencil && pencil.parentNode) pencil.remove();
  }

  // Remove every mounted inset except `keep`. Fades in flight are per-element and guarded
  // by isConnected, so sweeping stragglers out from under them is safe.
  function removeInsetsExcept(keep) {
    for (const el of mapDiv.querySelectorAll(".region-inset")) {
      if (el !== keep) el.remove();
    }
  }

  // Commit a resolved survey: mount the new inset aligned over its window and fade it in
  // OVER whatever it replaces (the world content, or a previous inset). State, overlay and
  // caption update synchronously at the mount -- the fade is pure paint, and the outgoing
  // inset is only torn down once the incoming one is fully opaque, so the reader never sees
  // a gap frame (the sheet-turn discipline, #131). Reduced motion swaps instantly.
  function commitInset(band, window, res, ms) {
    const rect = insetSheetRect(window, margins());
    const el = document.createElement("div");
    el.className = "region-inset";
    el.style.left = pct(rect.x);
    el.style.top = pct(rect.y);
    el.style.width = pct(rect.w);
    el.style.height = pct(rect.h);
    el.innerHTML = res.svg;
    const old = inset ? inset.el : null;
    mapDiv.appendChild(el);
    inset = { el, svg: res.svg, band, window, title: res.title };
    currentBand = band;
    currentWindow = window;
    hidePencil();
    // The overlay rebuilds against the region manifest, positioned to the inset's box so the
    // region's own nx/ny fractions land on its drawn glyphs. Pin continuity keys by NAME
    // (region worlds renumber indices).
    buildPlaceOverlay(res.manifest, { preservePinByName: true, box: rect });
    redrafts++;
    setCaption(`${res.title} · regional survey · band ${band} · drawn in ${ms}ms`);
    if (prefersReduce()) {
      el.classList.add("in");
      if (old) old.remove();
      return;
    }
    void el.offsetWidth; // force layout so the class add transitions from opacity 0
    el.classList.add("in");
    if (old) {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        el.removeEventListener("transitionend", onEnd);
        if (old.isConnected) old.remove();
      };
      const onEnd = (e) => {
        if (e.target === el) finish();
      };
      el.addEventListener("transitionend", onEnd);
      // Fallback: if transitionend never fires (a dropped transition), tear down anyway.
      const timer = setTimeout(finish, 700);
    }
  }

  // Dispatch a region job for (band, window) over the retained base world, guarded so a
  // superseding settle drops this one.
  function dispatchRegion(band, window) {
    if (!world) return;
    const myGen = ++regionGen;
    showPencil(window);
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
        commitInset(band, window, res, ms);
      })
      .catch((err) => {
        if (myGen !== regionGen) return;
        hidePencil();
        setCaption("The cartographer spilled the ink: " + (err && err.message ? err.message : String(err)));
      });
  }

  // Zoom-out past the world threshold: the world chart is already on screen around the
  // inset, so the return is just the inset fading away. No worker round-trip.
  function revertToWorld() {
    if (!world) return;
    regionGen++; // cancel any in-flight region so it cannot commit after the revert
    hidePencil();
    const going = inset ? inset.el : null;
    inset = null;
    currentBand = 0;
    currentWindow = FULL_WINDOW;
    buildPlaceOverlay(world.manifest, { preservePinByName: true });
    setCaption("");
    if (going) {
      removeInsetsExcept(going);
      if (prefersReduce()) {
        going.remove();
      } else {
        going.classList.remove("in");
        const drop = () => {
          if (going.isConnected) going.remove();
        };
        going.addEventListener("transitionend", drop, { once: true });
        setTimeout(drop, 700); // fallback, as in commitInset
      }
    }
  }

  return {
    /** A camera settle on the antique chart. `cam` is the SHEET-fraction {cx,cy,k}. */
    onSettle(cam) {
      if (!world) return;
      const decision = decideSettle({
        camera: plotUvFromSheet(cam, margins()),
        currentWindow,
        currentBand,
      });
      if (decision.action === "noop") return;
      if (decision.action === "world") return revertToWorld();
      dispatchRegion(decision.band, decision.window);
    },

    /** Record the world sheet just drawn, and reset to band 0. Called on every world draw.
     *  The draw wiped #map (settle) or will at landing (turn), so the DOM cleanup here is
     *  belt-and-suspenders for elements that survived outside those paths. */
    setWorld({ seed, overrides, render, manifest }) {
      world = { seed, overrides, render, manifest };
      currentBand = 0;
      currentWindow = FULL_WINDOW;
      inset = null;
      regionGen++; // any region in flight from the previous world is now stale
      hidePencil();
      removeInsetsExcept(null);
    },

    /** Drop any in-flight redraft, unmount everything, reset the band state (a new draw
     *  is starting). */
    cancel() {
      regionGen++;
      currentBand = 0;
      currentWindow = FULL_WINDOW;
      inset = null;
      hidePencil();
      removeInsetsExcept(null);
    },

    // Drop the inset INSTANTLY (no fade) if one is committed, so a world-sheet action
    // (verso flip, chronicle, home/reset) operates on the bare world chart -- a region
    // carries no chronicle/realm layers, and those ceremonies own the sheet. A no-op at
    // band 0. The caller still snaps the camera home (zoomController.reset) and writes
    // the hash.
    homeToWorld() {
      regionGen++;
      hidePencil();
      removeInsetsExcept(null);
      if (currentBand > 0 && world) {
        buildPlaceOverlay(world.manifest);
        setCaption("");
      }
      currentBand = 0;
      currentWindow = FULL_WINDOW;
      inset = null;
    },

    /** The committed region sheet for the Download policy, or null at the world sheet. */
    committedRegion() {
      return inset ? { svg: inset.svg, band: inset.band, title: inset.title } : null;
    },

    /** Observable state for the e2e (band, window, title, redraft count). */
    state() {
      return {
        band: currentBand,
        window: currentWindow,
        committed: inset !== null,
        title: inset ? inset.title : null,
        redrafts,
      };
    },
  };
}
