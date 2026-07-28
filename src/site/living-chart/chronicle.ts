// #54 chronicle scrubber, chart side: reveal the world's settlements by year using
// the #52 manifest; never re-render. Since #93 it toggles each baked settlement's own
// <g class="settlement" data-idx> by year (real castles/towns/labels, not dots), plus
// the baked #layer-roads as a whole. The host's Download saves the pristine chart
// string, never the DOM, so the export is unaffected no matter the scrubbed frame.
//
// #220 slimmed this module to the CHART half of the chronicle. The instrument half it
// used to own (the year slider, the Play clock and its rAF loop, the readout, the
// dated strip) belongs to the fused ages driver (ages.ts), which owns the one bar and
// the one journal and drives this module through paintYear on its own clock. Writing
// the host's range input from here again would put two hands on the fused bar; the
// sweep-plan math this module used to consume (buildSweepPlan, sweepYearAt) is now
// imported by ages.ts alone.
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

// Scrubber session (null when the instrument is off). `groups` maps each world index
// to its baked glyph group, `roadsEl` is the baked road network shown only when
// parked at the present.
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

  // The road network carries no per-settlement founding year, so it cannot time-
  // reveal; show it only when parked at the present and hide it whenever the shown
  // year is in the past, so roads to not-yet-founded towns never appear. Restore by
  // CLEARING the inline style, never setting "block": an SVG <g> does not take it.
  function setRoadsVisible(visible: boolean): void {
    if (scrub && scrub.roadsEl) scrub.roadsEl.style.display = visible ? "" : "none";
  }

  // Paint one year onto the chart: each settlement glyph's visibility and the roads.
  //
  // #155 the ink-in: a glyph that CROSSES into view on this frame is tagged
  // data-ink with its grade (founding stamps, a fall dries in) and the shared
  // /living-chart.css (#302) keys a brief ceremony on it, scoped to the
  // .living-chart class the host puts on the chart mount. Three things make that
  // attribute the whole scope: nothing else on the site ever writes it, it lives on
  // the injected DOM only, and Download saves the chart string, so the baked chart,
  // the committed charts, and the golden can never see it. Idle is byte-identical by
  // construction.
  //
  // `silent` PARKS instead: it clears every pending grade and reveals nothing, so
  // arming the instrument and the #180 verso snap set the resting state with no
  // ceremony rather than mass-stamping a whole world at once.
  function paintYear(year: number, silent: boolean): void {
    if (!scrub) return;
    const fromYear = scrub.year;
    scrub.year = year;
    for (const m of scrub.marks) {
      const g = scrub.groups.get(m.idx);
      if (!g) continue;
      const shown = glyphVisibleAt(m, year);
      g.style.display = shown ? "" : "none";
      // Every paint drives display straight off the year, so DOM visibility always
      // equals glyphVisibleAt(m, scrub.year) and the year-based crossing test IS the
      // DOM hidden->shown test. That also restarts the animation for free: per spec
      // display:none terminates a running animation and restoring display starts it
      // afresh, so #128's none/reflow/restore dance is not owed here (and offsetWidth
      // does not exist on an SVGGElement anyway). A glyph that is up and steady keeps
      // its grade untouched, or the next frame would cut its ceremony off mid-press.
      if (silent || !shown) g.removeAttribute("data-ink");
      else if (glyphRevealedBetween(m, fromYear, year)) g.dataset.ink = inkGradeFor(m);
    }
    setRoadsVisible(year >= scrub.range.max); // roads only at the present-day park
  }

  // Enter (or re-apply, after a redraw) scrub mode for the current overlay. Since
  // #93 it drives the baked settlement glyphs directly, so no style/colour is needed.
  function applyScrub(): void {
    const data = overlay.data();
    if (!data || !data.places || !data.places.length) return;
    overlay.hideCard();
    const { places, events, presentYear } = data;
    const overlayEl = mapEl.querySelector(".place-overlay");
    const hits = overlayEl ? [...overlayEl.querySelectorAll<HTMLElement>(".place-hit")] : [];
    // The overlay hits stay as invisible focus targets but go inert while scrubbing
    // (the CSS scopes pointer-events off behind .scrub); the fused journal below
    // narrates the headline events (a capped subset) as readable text.
    if (overlayEl) overlayEl.classList.add("scrub");
    for (const h of hits) h.tabIndex = -1;
    // Address every baked settlement glyph by its world index (== manifest idx) so a
    // year can show/hide each one; the roads layer reveals only at the present park.
    const groups = new Map<number, SVGGElement>();
    const settleLayer = mapEl.querySelector("#layer-settlements");
    if (settleLayer) {
      for (const g of settleLayer.querySelectorAll<SVGGElement>("g.settlement")) {
        groups.set(Number(g.dataset.idx), g);
      }
    }
    const range = scrubRange(places, presentYear);
    const marks = buildScrubMarks(places, events, presentYear);
    // #155: anchor each mark's ink-in press on its OWN town point. The chart mixes
    // projections, so no box centre serves: a profile castle stands ON its point while a
    // town circle is centred on it and a seat halo sits above it, three different points
    // for one settlement. nx/ny are fractions of the rendered chart and the viewBox
    // starts at 0 0, so as percentages against the view box they ARE the point, for every
    // glyph and every style. It is per-element data, so it goes inline on the elements
    // that animate (a stylesheet has nothing true to say about it, and a var() with no
    // honest default would resolve to the middle of the whole sheet). Written over the
    // same marks-crossed-with-groups domain paintYear grades, so a mark can never be
    // graded without its origin; exitScrub clears both together.
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
    // Park at the present: the world exactly as just drawn, and silent (#155), so
    // arming the instrument never stamps every settlement in at once.
    paintYear(range.max, true);
  }

  function exitScrub(): void {
    const overlayEl = mapEl.querySelector(".place-overlay");
    if (overlayEl) {
      overlayEl.classList.remove("scrub");
      for (const h of overlayEl.querySelectorAll(".place-hit")) h.removeAttribute("tabindex");
    }
    // #93: the sweep may have hidden individual glyph groups; restore the full
    // present-day chart by clearing every inline display it set (never "block": an
    // SVG <g> does not take it), plus the roads. #155: and drop every ink grade with the
    // press origin it was armed with, so the chart the reader is handed back carries no
    // scrub-only attribute or style at all. Grade and origin go together, always.
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

  // Drop the scrub session without restoring layers: used after a redraw with the
  // toggle off, where the host's innerHTML swap already replaced the baked layers fresh.
  function clearScrub(): void {
    scrub = null;
  }

  // Paint an arbitrary year directly: the continuous-timeline seam (#191 API; #220's
  // fused instrument owns the clock and drives the chronicle by year). Clamped so a
  // driver interpolating past either end parks cleanly at the boundary year.
  function scrubTo(year: number): void {
    if (!scrub) return;
    paintYear(Math.max(scrub.range.min, Math.min(scrub.range.max, Math.round(year))), false);
  }

  // #180: flipping the sheet snaps the chart to the PRESENT. The Explorer's verso
  // ghost is a Blob of the chart as the WORKER drew it; the scrubber mutates the baked
  // recto (per-glyph display), which the <img> ghost cannot mirror. Parking at the
  // present clears every mutation, so the recto then IS the chart the ghost already
  // holds: both faces agree by construction, with zero ghost work. Silent (#155): a
  // snap is a park, not the passage of time. No-op when the instrument is off.
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
    // #220 internal seam for the fused ages driver (consumed by index.ts, never
    // public): the unclamped-ceremony paint the driver's clock and drag both ride.
    paintYear,
  };
}

export type Chronicle = ReturnType<typeof createChronicle>;
