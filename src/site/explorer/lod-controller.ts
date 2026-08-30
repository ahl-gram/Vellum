// The Surveyor's Glass redraft (#169, redesigned in PR #245 review): a camera SETTLE on
// the antique chart dispatches a finer REGIONAL survey of the window, mounted as an INSET
// inside #map riding the same live transform as the chart. The camera stays
// WORLD-relative for good: a commit moves NOTHING, and a zoom-out just fades the inset
// away (the world chart was there all along). The pure settle/inset math lives
// unit-tested in src/world/lod.ts; this module is the DOM conductor. The antique-only
// gate lives in app.ts regionEligible.
import {
  LOD_BANDS,
  decideSettle,
  plotUvFromSheet,
  windowSheetRect,
  insetSheetRect,
  FULL_WINDOW,
} from "../../world/lod.ts";
import type { UvCamera, SheetMargins, SheetRect } from "../../world/lod.ts";
import type { UvWindow } from "../../terrain/heightfield.ts";
import type { WorldRecipe } from "../../world/types.ts";
import type { RenderOptions } from "../../render/map-renderer.ts";
import type { PlaceManifest } from "../../render/place-manifest.ts";
import { startRedraft } from "./draw-ceremony.ts";
import { dryInNames } from "./redraft-plan.ts";

const pct = (f: number) => `${(f * 100).toFixed(4)}%`;

/** The region job dispatched on a settle: worker-client runJob's region message. */
type RegionJobMessage = {
  kind: "region";
  seed: number;
  overrides: Partial<WorldRecipe> | undefined;
  window: UvWindow;
  gridW: number;
  gridH: number;
  band: number;
  render: RenderOptions;
};

/** The fields of a resolved region survey this controller consumes. */
type RegionJobResult = {
  svg: string;
  manifest: PlaceManifest;
  title: string;
};

/** The per-draw world context app.ts hands to setWorld on every world draw. */
type WorldContext = {
  seed: number;
  overrides: Partial<WorldRecipe> | undefined;
  render: RenderOptions;
  manifest: PlaceManifest;
};

interface Deps {
  /** #map, the world sheet's box; insets mount inside it */
  mapDiv: HTMLElement;
  runJob: (msg: RegionJobMessage) => Promise<RegionJobResult>;
  buildPlaceOverlay: (manifest: PlaceManifest, opts?: { preservePinByName?: boolean; box?: SheetRect }) => void;
  setCaption: (text: string) => void;
  /** Where a failed survey is reported; the caption when the host gives none. */
  setError?: (text: string) => void;
  /** current world zoom, to counter-scale the pencil border */
  getZoomK: () => number;
  prefersReduce: () => boolean;
}

export function createLodController(deps: Deps) {
  const { mapDiv, runJob, buildPlaceOverlay, setCaption, getZoomK, prefersReduce } = deps;

  // Band 0 is the bare world sheet (FULL_WINDOW, no inset); 1..3 are regional surveys.
  let currentBand = 0;
  let currentWindow = FULL_WINDOW;

  // The retained world context from the last world draw: enough to fire a region job over the SAME base world (cache hit) and to rebuild the world overlay when the inset drops.
  let world: WorldContext | null = null;

  // The committed inset (for the DOM teardown and the e2e's lodState), or null at the bare world sheet.
  let inset: { el: HTMLDivElement; svg: string; band: number; window: UvWindow; title: string } | null = null;

  // The drafting indicator: a dashed outline over the window being surveyed, up between dispatch and commit; one element, repositioned per dispatch.
  let pencil: HTMLDivElement | null = null;

  let regionGen = 0;
  // Committed-redraft count, surfaced to the e2e so it can prove one-job-per-settle and last-wins without timing.
  let redrafts = 0;

  // marginPx/widthPx differs from marginPx/heightPx (same px inset, different axis lengths), so the conversion carries both; the world manifest is the authority at every band.
  function margins(): SheetMargins {
    // world! is safe: every caller runs behind a non-null world gate (dispatch and commit).
    const m = world!.manifest;
    return { mx: m.marginPx / m.widthPx, my: m.marginPx / m.heightPx };
  }

  function showPencil(window: UvWindow): void {
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

  function hidePencil(): void {
    if (pencil && pencil.parentNode) pencil.remove();
  }

  // Fades in flight are per-element and guarded by isConnected, so sweeping stragglers out from under them is safe.
  function removeInsetsExcept(keep: Element | null): void {
    for (const el of mapDiv.querySelectorAll(".region-inset")) {
      if (el !== keep) el.remove();
    }
  }

  // #170: the outgoing composition's PLACED labels, which the dry-in ceremony must never re-animate. World settlement groups carry only data-idx (data-tier/data-name are region-only, #162), so world names resolve through the manifest; a prior inset carries data-name directly.
  function prevLabeledNames(): Set<string> {
    const names = new Set<string>();
    const worldSvg = mapDiv.querySelector(":scope > svg");
    if (worldSvg && world) {
      for (const g of worldSvg.querySelectorAll<SVGElement>("g.settlement[data-idx]")) {
        if (!g.querySelector("text")) continue;
        const place = world.manifest.places[Number(g.dataset.idx)];
        if (place) names.add(place.name);
      }
    }
    const oldSvg = inset ? inset.el.querySelector("svg") : null;
    if (oldSvg) for (const n of labeledNames(oldSvg)) names.add(n);
    return names;
  }

  // #170: label placement is the reveal; a name dries in the moment it first wins a label.
  function labeledNames(svg: SVGSVGElement): string[] {
    const out: string[] = [];
    for (const g of svg.querySelectorAll<SVGElement>("g.settlement[data-name]")) {
      if (g.querySelector("text")) out.push(g.dataset.name as string);
    }
    return out;
  }

  // Commit: mount the inset aligned over its window and fade it in OVER what it replaces. State, overlay and caption update synchronously at the mount; the outgoing inset is torn down only once the incoming is fully opaque, so the reader never sees a gap frame (the #131 discipline).
  function commitInset(band: number, window: UvWindow, res: RegionJobResult, ms: string): void {
    const rect = insetSheetRect(window, margins());
    // #170: capture the outgoing composition's labeled names BEFORE the sheets change hands.
    const reduce = prefersReduce();
    const prevLabeled = reduce ? null : prevLabeledNames();
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
    // Positioned to the inset's box so the region's own nx/ny fractions land on its drawn glyphs; pin continuity keys by NAME (region worlds renumber indices).
    buildPlaceOverlay(res.manifest, { preservePinByName: true, box: rect });
    redrafts++;
    setCaption(`${res.title} · regional survey · band ${band} · drawn in ${ms}ms`);
    if (reduce) {
      el.classList.add("in");
      if (old) old.remove();
      return;
    }
    void el.offsetWidth; // force layout so the class add transitions from opacity 0
    el.classList.add("in");
    // #170 the ceremony: the incoming survey inks itself in and the newly labeled names dry in tier-staggered; every name already labeled on the outgoing sheets stays put (AC1).
    const insetSvg = el.querySelector("svg");
    // prevLabeled! is non-null here: the reduce path returned above.
    if (insetSvg) startRedraft(insetSvg, dryInNames(prevLabeled!, labeledNames(insetSvg)));
    if (old) {
      let done = false;
      const finish = (): void => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        el.removeEventListener("transitionend", onEnd);
        if (old.isConnected) old.remove();
      };
      const onEnd = (e: TransitionEvent): void => {
        if (e.target === el) finish();
      };
      el.addEventListener("transitionend", onEnd);
      const timer = setTimeout(finish, 700); // fallback if transitionend never fires
    }
  }

  function dispatchRegion(band: number, window: UvWindow): void {
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
      // no title: the worker derives "The Environs of X" from (world, window) so the live redraft and a downloaded sheet's redraw agree byte-for-byte (#169).
    })
      .then((res) => {
        if (myGen !== regionGen) return;
        const ms = (performance.now() - t0).toFixed(0);
        commitInset(band, window, res, ms);
      })
      .catch((err) => {
        if (myGen !== regionGen) return;
        hidePencil();
        (deps.setError ?? setCaption)("The cartographer spilled the ink: " + (err && err.message ? err.message : String(err)));
      });
  }

  // Zoom-out past the world threshold: the world chart is already on screen around the inset, so the return is just the inset fading away. No worker round-trip.
  function revertToWorld(): void {
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
        const drop = (): void => {
          if (going.isConnected) going.remove();
        };
        going.addEventListener("transitionend", drop, { once: true });
        setTimeout(drop, 700); // fallback, as in commitInset
      }
    }
  }

  return {
    /** A camera settle on the antique chart. `cam` is the SHEET-fraction {cx,cy,k}. */
    onSettle(cam: UvCamera) {
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

    /** Record the world sheet just drawn and reset to band 0; the DOM cleanup here is belt-and-suspenders for elements that survived outside the draw's own wipes. */
    setWorld({ seed, overrides, render, manifest }: WorldContext) {
      world = { seed, overrides, render, manifest };
      currentBand = 0;
      currentWindow = FULL_WINDOW;
      inset = null;
      regionGen++; // any region in flight from the previous world is now stale
      hidePencil();
      removeInsetsExcept(null);
    },

    /** Drop any in-flight redraft, unmount everything, reset the band state (a new draw is starting). */
    cancel() {
      regionGen++;
      currentBand = 0;
      currentWindow = FULL_WINDOW;
      inset = null;
      hidePencil();
      removeInsetsExcept(null);
    },

    /** #170: the voiced home (full-sheet button, the 0 key). A committed inset fades off while the caller glides the camera home; with nothing committed it still cancels an in-flight redraft. The programmatic homes (verso, chronicle, voyage, draw) keep homeToWorld below. */
    easeHome() {
      if (!inset) {
        regionGen++;
        hidePencil();
        return;
      }
      revertToWorld();
    },

    // Drop the inset INSTANTLY (no fade) so a world-sheet ceremony (verso flip, chronicle, home/reset) operates on the bare world chart; a region carries no chronicle/realm layers. A no-op at band 0.
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
