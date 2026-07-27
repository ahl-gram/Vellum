// #54 chronicle scrubber: a year-slider + Play that animates the world growing.
// Reveals the world over time using the #52 manifest; never re-renders. Since #93
// it toggles each baked settlement's own <g class="settlement" data-idx> by year
// (real castles/towns/labels, not dots), plus the baked #layer-roads as a whole.
// The host's Download saves the pristine chart string, never the DOM, so the export
// is unaffected no matter the scrubbed frame. Split out of the old living-chart.ts
// at #191: the manifest data and the card dismiss cross the boundary through the
// injected `overlay` handle, and every panel element arrives from the host.
import {
  scrubRange,
  buildScrubMarks,
  glyphVisibleAt,
  glyphRevealedBetween,
  inkGradeFor,
  eventIsPast,
  buildSweepPlan,
  sweepYearAt,
  type ScrubMark,
  type YearRange,
  type SweepPlan,
} from "../../render/chronicle-scrubber.ts";
import type { HistoricalEvent } from "../../society/history.ts";
import type { OverlayData } from "./place-overlay.ts";

// Scrubber session (null when the toggle is off). `groups` maps each world index to
// its baked glyph group, `roadsEl` is the baked road network shown only when parked
// at the present.
interface StripRow {
  li: HTMLLIElement;
  year: number;
}

interface ScrubState {
  marks: ScrubMark[];
  range: YearRange;
  groups: Map<number, SVGGElement>;
  roadsEl: SVGGElement | null;
  strip: StripRow[];
  plan: SweepPlan | null;
  playing: boolean;
  rafId: number;
  elapsed: number;
  year: number;
}

export interface ChronicleDeps {
  /** The chart mount holding the baked chart svg and the place overlay. */
  mapEl: HTMLElement;
  /** The scrubber panel wrapper (hidden while the chronicle is off). */
  panel: HTMLElement;
  /** The Play/Pause button (label swap IS the state for AT). */
  playBtn: HTMLButtonElement;
  /** The year range input. */
  range: HTMLInputElement;
  /** The visual year readout span. */
  year: HTMLElement;
  /** The <ol> the dated chronicle rows render into. */
  strip: HTMLElement;
  /** The place overlay: manifest data in, card dismiss out (the two coupling points). */
  overlay: { data(): OverlayData | null; hideCard(): void };
  /** #192: called when PLAY parks (the Pause click and the sweep's auto-pause), the one
   *  rest the host cannot see through events: paintScrub writes the slider
   *  programmatically, so no input/change fires and the host's address writer would
   *  otherwise keep the pre-Play year. Deliberately NOT called from pauseScrub itself:
   *  a manual drag pauses per input frame, and the address writes on release only. */
  onPark?: () => void;
}

export function createChronicle(deps: ChronicleDeps) {
  const { mapEl, panel, playBtn, range: rangeEl, year: yearEl, strip: stripEl, overlay, onPark } = deps;

  let scrub: ScrubState | null = null;

  /** Whether a scrub session is active (the place-overlay card is suppressed then). */
  function isActive(): boolean {
    return scrub !== null;
  }

  // The road network carries no per-settlement founding year, so it cannot time-
  // reveal; show it only when parked at the present (toggle-on, a manual scrub to
  // the present, end-of-Play) and hide it whenever the shown year is in the past,
  // so roads to not-yet-founded towns never appear. Restore by CLEARING the inline
  // style, never setting "block": an SVG <g> does not take display:block.
  function setRoadsVisible(visible: boolean): void {
    if (scrub && scrub.roadsEl) scrub.roadsEl.style.display = visible ? "" : "none";
  }

  function cancelScrubRaf(): void {
    if (scrub && scrub.rafId) {
      cancelAnimationFrame(scrub.rafId);
      scrub.rafId = 0;
    }
  }

  function setPlayLabel(playing: boolean): void {
    // The label swap (Play/Pause) IS the state for AT; no aria-pressed, which on a
    // label-swapping control announces a contradictory "Pause, pressed" while playing.
    playBtn.textContent = playing ? "Pause" : "Play";
  }

  function buildStrip(events: ReadonlyArray<HistoricalEvent>): StripRow[] {
    stripEl.replaceChildren();
    const rows: StripRow[] = [];
    for (const e of events) {
      const li = document.createElement("li");
      const year = document.createElement("span");
      year.className = "cr-year";
      year.textContent = String(e.year);
      const text = document.createElement("span");
      text.className = "cr-text";
      text.textContent = e.text; // textContent: event prose is plain text
      li.append(year, text);
      stripEl.appendChild(li);
      rows.push({ li, year: e.year });
    }
    return rows;
  }

  // Paint one frame: the year readout, the slider thumb, each settlement glyph's
  // visibility, the roads, and which chronicle rows have come to pass. Setting
  // .value here does NOT fire the slider's input event, so Play never trips the
  // manual-scrub handler.
  //
  // #155 the ink-in: a glyph that CROSSES into view on this frame is tagged
  // data-ink with its grade (founding stamps, a fall dries in) and the Explorer CSS
  // keys a brief ceremony on it. Three things make that attribute the whole scope:
  // nothing else on the site ever writes it, it lives on the injected DOM only, and
  // Download saves the chart string, so the baked chart, the committed charts, and
  // the golden can never see it. Idle is byte-identical by construction.
  //
  // `silent` PARKS instead: it clears every pending grade and reveals nothing, so
  // toggling the chronicle on (applyScrub) and the #180 verso snap set the resting
  // state with no ceremony rather than mass-stamping a whole world at once.
  function paintScrub(year: number, opts: { silent?: boolean } = {}): void {
    if (!scrub) return;
    const fromYear = scrub.year;
    const silent = opts.silent === true;
    scrub.year = year;
    rangeEl.value = String(year);
    // Year on the slider's aria-valuetext (like the sea-level slider), NOT a live
    // region: programmatic value changes during Play stay silent, while a keyboard
    // scrub announces "year N" once per arrow press. The year span is visual.
    rangeEl.setAttribute("aria-valuetext", `year ${year}`);
    yearEl.textContent = `year ${year}`;
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
    for (const row of scrub.strip) {
      row.li.classList.toggle("past", eventIsPast(row.year, year));
    }
  }

  // Enter (or re-apply, after a redraw) scrub mode for the current overlay. Since
  // #93 it drives the baked settlement glyphs directly, so no style/colour is needed.
  function applyScrub(): void {
    const data = overlay.data();
    if (!data || !data.places || !data.places.length) return;
    cancelScrubRaf();
    overlay.hideCard();
    const { places, events, presentYear } = data;
    const overlayEl = mapEl.querySelector(".place-overlay");
    const hits = overlayEl ? [...overlayEl.querySelectorAll<HTMLElement>(".place-hit")] : [];
    // The overlay hits stay as invisible focus targets but go inert while scrubbing
    // (the CSS scopes pointer-events off behind .scrub); the dated chronicle strip
    // below narrates the headline events (a capped subset) as readable text.
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
    rangeEl.min = String(range.min);
    rangeEl.max = String(range.max);
    rangeEl.step = "1";
    const marks = buildScrubMarks(places, events, presentYear);
    // #155: anchor each mark's ink-in press on its OWN town point. The chart mixes
    // projections, so no box centre serves: a profile castle stands ON its point while a
    // town circle is centred on it and a seat halo sits above it, three different points
    // for one settlement. nx/ny are fractions of the rendered chart and the viewBox
    // starts at 0 0, so as percentages against the view box they ARE the point, for every
    // glyph and every style. It is per-element data, so it goes inline on the elements
    // that animate (a stylesheet has nothing true to say about it, and a var() with no
    // honest default would resolve to the middle of the whole sheet). Written over the
    // same marks-crossed-with-groups domain paintScrub grades, so a mark can never be
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
      strip: buildStrip(events),
      plan: null,
      playing: false,
      rafId: 0,
      elapsed: 0,
      year: range.max,
    };
    panel.hidden = false;
    setPlayLabel(false);
    // Park at the present: the world exactly as just drawn, and silent (#155), so
    // turning the chronicle on never stamps every settlement in at once.
    paintScrub(range.max, { silent: true });
  }

  function exitScrub(): void {
    cancelScrubRaf();
    panel.hidden = true;
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

  function pauseScrub(): void {
    if (!scrub) return;
    cancelScrubRaf();
    scrub.playing = false;
    setPlayLabel(false);
  }

  function playScrub(): void {
    if (!scrub) return;
    scrub.plan = buildSweepPlan(scrub.range, overlay.data()!.events.map((e) => e.year));
    if (scrub.year >= scrub.range.max) scrub.elapsed = 0; // at the end: replay from the start
    const begin = performance.now() - scrub.elapsed;
    scrub.playing = true;
    setPlayLabel(true);
    const tick = (now: number) => {
      if (!scrub || !scrub.playing) return;
      const elapsed = now - begin;
      scrub.elapsed = elapsed;
      if (elapsed >= scrub.plan!.totalMs) {
        scrub.elapsed = scrub.plan!.totalMs;
        paintScrub(scrub.range.max);
        pauseScrub(); // auto-pause at the present year, button back to "Play"
        onPark?.(); // #192: the parked present must reach the address
        return;
      }
      paintScrub(sweepYearAt(scrub.plan!, elapsed));
      scrub.rafId = requestAnimationFrame(tick);
    };
    scrub.rafId = requestAnimationFrame(tick);
  }

  // The Play/Pause button: toggle the sweep. No-op when not scrubbing.
  function togglePlay(): void {
    if (!scrub) return;
    if (scrub.playing) {
      pauseScrub();
      onPark?.(); // #192: the mid-sweep park must reach the address
    } else playScrub();
  }

  // #180: flipping the sheet snaps the scrubber to the PRESENT. The Explorer's verso
  // ghost is a Blob of the chart as the WORKER drew it; the scrubber mutates the baked
  // recto (per-glyph display), which the <img> ghost cannot mirror. Parking at the
  // present clears every mutation (glyphVisibleAt is true for all marks,
  // setRoadsVisible(year >= max) is true), so the recto then IS the chart the ghost
  // already holds: both faces agree by construction, with zero ghost work. It also
  // pauses a running Play, matching the voyage's voyageSnapToRest() and the
  // drag-pauses-Play idiom. paintScrub is engine-private, so this is the seam that
  // exposes the park. No-op when the chronicle is off.
  function scrubSnapToPresent(): void {
    if (!scrub) return;
    pauseScrub();
    // Silent (#155): a snap is a park, not the passage of time. The reader turned the
    // sheet, so the recto must simply BE the pristine chart the ghost already holds,
    // not re-ink a century of foundings as it swings away.
    paintScrub(scrub.range.max, { silent: true });
  }

  // Paint an arbitrary year directly, without the slider: the continuous-timeline seam
  // (#191 API, for #220's fused instrument, which owns its own clock and drives the
  // chronicle by year). Same discipline as a manual scrub: a running Play pauses and
  // rebases so the next Play restarts from the earliest founding. Clamped so a driver
  // interpolating past either end parks cleanly at the boundary year.
  function scrubTo(year: number): void {
    if (!scrub) return;
    if (scrub.playing) pauseScrub();
    scrub.elapsed = 0;
    paintScrub(Math.max(scrub.range.min, Math.min(scrub.range.max, Math.round(year))));
  }

  // A manual drag/keyboard scrub on the slider: same rebase, year read off the thumb.
  function onManualScrub(): void {
    scrubTo(Number(rangeEl.value));
  }

  /** The live session for a read (year, range, playing), or null when the toggle is off. */
  function scrubState(): { year: number; min: number; max: number; playing: boolean } | null {
    if (!scrub) return null;
    return { year: scrub.year, min: scrub.range.min, max: scrub.range.max, playing: scrub.playing };
  }

  return {
    isActive,
    applyScrub,
    exitScrub,
    clearScrub,
    cancelScrubRaf,
    pauseScrub,
    togglePlay,
    onManualScrub,
    scrubTo,
    scrubSnapToPresent,
    scrubState,
  };
}

export type Chronicle = ReturnType<typeof createChronicle>;
