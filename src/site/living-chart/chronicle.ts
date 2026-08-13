// #54 chronicle scrubber, CHART side: reveal the world's settlements by year by toggling
// each baked <g class="settlement" data-idx> (plus #layer-roads as a whole); never
// re-render, and the host's Download saves the pristine chart string, so the export is
// unaffected no matter the scrubbed frame. #220 moved the instrument half (bar, Play
// clock, readout, strip) to ages.ts, which drives this module through paintYear; writing
// the host's range input from here again would put two hands on the fused bar.
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

// Scrubber session (null when the instrument is off): world index -> baked glyph group, plus the roads layer shown only parked at the present.
interface ScrubState {
  marks: ScrubMark[];
  range: YearRange;
  groups: Map<number, SVGGElement>;
  roadsEl: SVGGElement | null;
  year: number;
}

export interface ChronicleDeps {
  /** The chart mount holding the baked chart svg and the place overlay. */
  mapEl: HTMLElement;
  /** The place overlay: manifest data in, card dismiss out (the two coupling points). */
  overlay: { data(): OverlayData | null; hideCard(): void };
}

export function createChronicle(deps: ChronicleDeps) {
  const { mapEl, overlay } = deps;

  let scrub: ScrubState | null = null;

  /** Whether a scrub session is active (the place-overlay card is suppressed then). */
  function isActive(): boolean {
    return scrub !== null;
  }

  // Roads carry no per-settlement founding year, so they show only when parked at the present; restore by CLEARING the inline style, never setting "block" (an SVG <g> does not take it).
  function setRoadsVisible(visible: boolean): void {
    if (scrub && scrub.roadsEl) scrub.roadsEl.style.display = visible ? "" : "none";
  }

  // Paint one year onto the chart: each settlement glyph's visibility and the roads.
  // #155 the ink-in: a glyph that CROSSES into view is tagged data-ink with its grade, and the shared /living-chart.css keys the ceremony on it. Nothing else ever writes that attribute, it lives on the injected DOM only, and Download saves the chart string, so idle is byte-identical by construction.
  // `silent` PARKS instead: it clears every pending grade and reveals nothing, so arming the instrument and the #180 verso snap never mass-stamp a whole world at once.
  function paintYear(year: number, silent: boolean): void {
    if (!scrub) return;
    const fromYear = scrub.year;
    scrub.year = year;
    for (const m of scrub.marks) {
      const g = scrub.groups.get(m.idx);
      if (!g) continue;
      const shown = glyphVisibleAt(m, year);
      g.style.display = shown ? "" : "none";
      // Display drives straight off the year, so DOM visibility always equals glyphVisibleAt and the crossing test IS the hidden->shown test. display:none also terminates a running animation and restoring display starts it afresh, so #128's none/reflow/restore dance is not owed (offsetWidth does not exist on an SVGGElement anyway).
      // A glyph that is up and steady keeps its grade untouched, or the next frame would cut its ceremony off mid-press.
      if (silent || !shown) g.removeAttribute("data-ink");
      else if (glyphRevealedBetween(m, fromYear, year)) g.dataset.ink = inkGradeFor(m);
    }
    setRoadsVisible(year >= scrub.range.max); // roads only at the present-day park
  }

  // Enter (or re-apply after a redraw) scrub mode for the current overlay; drives the baked settlement glyphs directly (#93), so no style/colour is needed.
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
    // Address every baked settlement glyph by its world index (== manifest idx).
    const groups = new Map<number, SVGGElement>();
    const settleLayer = mapEl.querySelector("#layer-settlements");
    if (settleLayer) {
      for (const g of settleLayer.querySelectorAll<SVGGElement>("g.settlement")) {
        groups.set(Number(g.dataset.idx), g);
      }
    }
    const range = scrubRange(places, presentYear);
    const marks = buildScrubMarks(places, events, presentYear);
    // #155: anchor each mark's ink-in press on its OWN town point. The chart mixes projections, so no box centre serves; nx/ny as percentages against the viewBox ARE the point, for every glyph and every style.
    // Per-element data goes inline on the elements that animate (a stylesheet has nothing true to say about it, and a var() with no honest default resolves to mid-sheet); written over the same marks-crossed-with-groups domain paintYear grades, so a mark can never be graded without its origin, and exitScrub clears both together.
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
    // Park at the present, silent (#155): arming never stamps every settlement in at once.
    paintYear(range.max, true);
  }

  function exitScrub(): void {
    const overlayEl = mapEl.querySelector(".place-overlay");
    if (overlayEl) {
      overlayEl.classList.remove("scrub");
      for (const h of overlayEl.querySelectorAll(".place-hit")) h.removeAttribute("tabindex");
    }
    // Restore the full present-day chart: clear every inline display the sweep set (never "block"), the roads, and every ink grade WITH the press origin it was armed with, so the chart handed back carries no scrub-only attribute or style at all.
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

  // The continuous-timeline seam (#191 API); clamped so a driver interpolating past either end parks cleanly at the boundary year.
  function scrubTo(year: number): void {
    if (!scrub) return;
    paintYear(Math.max(scrub.range.min, Math.min(scrub.range.max, Math.round(year))), false);
  }

  // #180: the flip snaps the chart to the PRESENT. Parking clears every recto mutation, so the recto then IS the chart the worker-drawn ghost already holds: both faces agree by construction, zero ghost work. Silent (#155): a snap is a park, not the passage of time.
  function scrubSnapToPresent(): void {
    if (!scrub) return;
    paintYear(scrub.range.max, true);
  }

  /** The live session for a read (year painted, range), or null when off. */
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
    // #220 internal seam for the fused ages driver (consumed by index.ts, never public): the unclamped-ceremony paint its clock and drag both ride.
    paintYear,
  };
}

export type Chronicle = ReturnType<typeof createChronicle>;
