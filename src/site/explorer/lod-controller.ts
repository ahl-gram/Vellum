// The Surveyor's Glass redraft: a camera settle on the antique chart dispatches a finer regional survey, mounted as an inset inside #map on the chart's own live transform; the camera stays world-relative (a commit moves nothing, a zoom-out fades the inset away). The pure settle/inset math is in src/world/lod.ts; the antique-only gate is app.ts regionEligible.
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
import { latticeFromSettle } from "../shared/table-address.ts";

const pct = (f: number) => `${(f * 100).toFixed(4)}%`;

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

type RegionJobResult = {
  svg: string;
  manifest: PlaceManifest;
  title: string;
};

type WorldContext = {
  seed: number;
  overrides: Partial<WorldRecipe> | undefined;
  render: RenderOptions;
  manifest: PlaceManifest;
};

interface Deps {
  mapDiv: HTMLElement;
  runJob: (msg: RegionJobMessage) => Promise<RegionJobResult>;
  buildPlaceOverlay: (manifest: PlaceManifest, opts?: { preservePinByName?: boolean; box?: SheetRect }) => void;
  setCaption: (text: string) => void;
  setError?: (text: string) => void;
  getZoomK: () => number;
  prefersReduce: () => boolean;
  decorateInset?: (el: HTMLElement) => void;
}

export function createLodController(deps: Deps) {
  const { mapDiv, runJob, buildPlaceOverlay, setCaption, getZoomK, prefersReduce } = deps;

  let currentBand = 0;
  let currentWindow = FULL_WINDOW;

  let world: WorldContext | null = null;

  let inset: { el: HTMLDivElement; svg: string; band: number; window: UvWindow; title: string; seat: { lx: number; ly: number } | null } | null = null;

  let pencil: HTMLDivElement | null = null;

  let regionGen = 0;
  let redrafts = 0;

  // marginPx/widthPx differs from marginPx/heightPx (same px inset, different axis lengths), so the conversion carries both; the world manifest is the authority at every band.
  function margins(): SheetMargins {
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

  function labeledNames(svg: SVGSVGElement): string[] {
    const out: string[] = [];
    for (const g of svg.querySelectorAll<SVGElement>("g.settlement[data-name]")) {
      if (g.querySelector("text")) out.push(g.dataset.name as string);
    }
    return out;
  }

  // The outgoing inset is torn down only once the incoming is fully opaque, so the reader never sees a gap frame.
  function commitInset(band: number, window: UvWindow, seat: { lx: number; ly: number } | null, res: RegionJobResult, ms: string): void {
    const rect = insetSheetRect(window, margins());
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
    inset = { el, svg: res.svg, band, window, title: res.title, seat };
    // AFTER the assignment: the hook asks the controller what is committed, and before it this still named the outgoing sheet.
    deps.decorateInset?.(el);
    currentBand = band;
    currentWindow = window;
    hidePencil();
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
    const insetSvg = el.querySelector("svg");
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

  function dispatchRegion(band: number, window: UvWindow, seat: { lx: number; ly: number } | null): void {
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
      render: world.render,
    })
      .then((res) => {
        if (myGen !== regionGen) return;
        const ms = (performance.now() - t0).toFixed(0);
        commitInset(band, window, seat, res, ms);
      })
      .catch((err) => {
        if (myGen !== regionGen) return;
        hidePencil();
        (deps.setError ?? setCaption)("The cartographer spilled the ink: " + (err && err.message ? err.message : String(err)));
      });
  }

  function revertToWorld(): void {
    if (!world) return;
    regionGen++;
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
      dispatchRegion(decision.band, decision.window, latticeFromSettle(cam, margins(), decision.band));
    },

    setWorld({ seed, overrides, render, manifest }: WorldContext) {
      world = { seed, overrides, render, manifest };
      currentBand = 0;
      currentWindow = FULL_WINDOW;
      inset = null;
      regionGen++;
      hidePencil();
      removeInsetsExcept(null);
    },

    cancel() {
      regionGen++;
      currentBand = 0;
      currentWindow = FULL_WINDOW;
      inset = null;
      hidePencil();
      removeInsetsExcept(null);
    },

    easeHome() {
      if (!inset) {
        regionGen++;
        hidePencil();
        return;
      }
      revertToWorld();
    },

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

    /** The committed survey as the table's grammar states it, snapshotted so a settle mid-gesture cannot swap the sheet under the reader's hand. Null at the bare world sheet. The centre is the settle's own. */
    committedSurvey(): { seed: number; overrides: Partial<WorldRecipe> | undefined; render: RenderOptions; band: number; seat: { lx: number; ly: number } | null; title: string; svg: string } | null {
      if (!inset || !world) return null;
      return { seed: world.seed, overrides: world.overrides, render: world.render, band: inset.band, seat: inset.seat, title: inset.title, svg: inset.svg };
    },

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
