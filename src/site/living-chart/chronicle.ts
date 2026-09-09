// The chronicle scrubber's chart side: reveals settlements by year by toggling the baked glyph groups and the roads layer, never re-rendering. The instrument half (ages.ts) drives it through paintYear; nothing here writes the host's range input, or two hands would be on the fused bar.
import {
  scrubRange,
  buildScrubMarks,
  glyphVisibleAt,
  glyphRevealedBetween,
  inkGradeFor,
  type ScrubMark,
  type YearRange,
} from "../../render/chronicle-scrubber.ts";
import type { OverlayData } from "./place-overlay.ts";

interface ScrubState {
  marks: ScrubMark[];
  range: YearRange;
  groups: Map<number, SVGGElement>;
  roadsEl: SVGGElement | null;
  year: number;
}

export interface ChronicleDeps {
  mapEl: HTMLElement;
  overlay: { data(): OverlayData | null; hideCard(): void };
}

export function createChronicle(deps: ChronicleDeps) {
  const { mapEl, overlay } = deps;

  let scrub: ScrubState | null = null;

  function isActive(): boolean {
    return scrub !== null;
  }

  // Restore by clearing the inline display, never by setting "block": an SVG <g> does not take it.
  function setRoadsVisible(visible: boolean): void {
    if (scrub && scrub.roadsEl) scrub.roadsEl.style.display = visible ? "" : "none";
  }

  function paintYear(year: number, silent: boolean): void {
    if (!scrub) return;
    const fromYear = scrub.year;
    scrub.year = year;
    for (const m of scrub.marks) {
      const g = scrub.groups.get(m.idx);
      if (!g) continue;
      const shown = glyphVisibleAt(m, year);
      g.style.display = shown ? "" : "none";
      // A glyph up and steady keeps its grade, or the next frame would cut its ceremony off mid-press; display:none ends a running animation and restoring it starts afresh, so no reflow dance is owed (offsetWidth does not exist on an SVGGElement).
      if (silent || !shown) g.removeAttribute("data-ink");
      else if (glyphRevealedBetween(m, fromYear, year)) g.dataset.ink = inkGradeFor(m);
    }
    setRoadsVisible(year >= scrub.range.max);
  }

  function applyScrub(): void {
    const data = overlay.data();
    if (!data || !data.places || !data.places.length) return;
    overlay.hideCard();
    const { places, events, presentYear } = data;
    const overlayEl = mapEl.querySelector(".place-overlay");
    const hits = overlayEl ? [...overlayEl.querySelectorAll<HTMLElement>(".place-hit")] : [];
    // The overlay hits stay as invisible focus targets but go inert while scrubbing (the CSS scopes pointer-events off behind .scrub).
    if (overlayEl) overlayEl.classList.add("scrub");
    for (const h of hits) h.tabIndex = -1;
    const groups = new Map<number, SVGGElement>();
    const settleLayer = mapEl.querySelector("#layer-settlements");
    if (settleLayer) {
      for (const g of settleLayer.querySelectorAll<SVGGElement>("g.settlement")) {
        groups.set(Number(g.dataset.idx), g);
      }
    }
    const range = scrubRange(places, presentYear);
    const marks = buildScrubMarks(places, events, presentYear);
    // The press origin goes inline on the elements that animate: the chart mixes projections, so no box centre serves, and a stylesheet var() with no honest default resolves to mid-sheet.
    for (const m of marks) {
      const g = groups.get(m.idx);
      if (!g) continue;
      for (const mark of g.querySelectorAll<SVGGraphicsElement>(":scope > :not(text)")) {
        mark.style.transformBox = "view-box"; // not the initial value everywhere, so say it
        mark.style.transformOrigin = `${m.nx * 100}% ${m.ny * 100}%`;
      }
    }
    scrub = {
      marks,
      range,
      groups,
      roadsEl: mapEl.querySelector<SVGGElement>("#layer-roads"),
      year: range.max,
    };
    paintYear(range.max, true);
  }

  function exitScrub(): void {
    const overlayEl = mapEl.querySelector(".place-overlay");
    if (overlayEl) {
      overlayEl.classList.remove("scrub");
      for (const h of overlayEl.querySelectorAll(".place-hit")) h.removeAttribute("tabindex");
    }
    // The chart handed back carries no scrub-only attribute or style at all: every grade goes with the press origin it was armed with.
    const settleLayer = mapEl.querySelector("#layer-settlements");
    if (settleLayer) {
      for (const g of settleLayer.querySelectorAll<SVGGElement>("g.settlement")) {
        g.style.display = "";
        g.removeAttribute("data-ink");
        for (const mark of g.querySelectorAll<SVGGraphicsElement>(":scope > :not(text)")) {
          mark.style.removeProperty("transform-box");
          mark.style.removeProperty("transform-origin");
          if (!mark.getAttribute("style")) mark.removeAttribute("style");
        }
      }
    }
    const roads = mapEl.querySelector<SVGGElement>("#layer-roads");
    if (roads) roads.style.display = "";
    scrub = null;
  }

  // Drop the session without restoring layers: after a redraw with the toggle off, the host's innerHTML swap already replaced the baked layers fresh.
  function clearScrub(): void {
    scrub = null;
  }

  // Clamped so a driver interpolating past either end parks at the boundary year.
  function scrubTo(year: number): void {
    if (!scrub) return;
    paintYear(Math.max(scrub.range.min, Math.min(scrub.range.max, Math.round(year))), false);
  }

  // The flip parks at the present, silently: the recto is then the chart the worker-drawn ghost already holds, so both faces agree with no ghost work.
  function scrubSnapToPresent(): void {
    if (!scrub) return;
    paintYear(scrub.range.max, true);
  }

  function scrubState(): { year: number; min: number; max: number } | null {
    if (!scrub) return null;
    return { year: scrub.year, min: scrub.range.min, max: scrub.range.max };
  }

  return {
    isActive,
    applyScrub,
    exitScrub,
    clearScrub,
    scrubTo,
    scrubSnapToPresent,
    scrubState,
    // Internal seam for the ages driver, never on the public engine API: the unclamped paint its clock and drag both ride.
    paintYear,
  };
}

export type Chronicle = ReturnType<typeof createChronicle>;
