// #220 the fused instrument: one scrubber drives the world from the founding survey
// through its recorded ages. The bar's left half is the SURVEY chamber (voyage
// progress t, the drawing of the finished chart), the right half the AGES chamber
// (the chronicle's years), an even 50/50 split with a HARD DETENT at the seam for
// drags only (ratified 2026-07-28; the pure math is src/render/ages-track.ts). This
// module owns the one clock, the one bar, and the one journal; the chronicle and
// voyage modules stay the two chamber painters it drives through internal seams.
//
// The journal is ONE document (the Overture framing, ratified 2026-07-17): the
// surveyor's prologue rows, dated at the present and built by voyage-log-panel, then
// the chronicler's dated annals, built here. One arrived-class, `inked`, lights both
// blocks: the prologue positionally as the survey reaches each port, the annals by
// year. The voice handoff is the prologue dressing plus the readout flip.
//
// Play at EITHER chamber-end rest opens the whole story from the survey's first leg
// (Alex's PR #311 ruling, 2026-07-28: arming parks at the present, and Play there
// must tell the whole ~20s story, not just replay the annals). Play from any
// interior position runs forward from where it stands. A running Play crosses the
// seam without pausing (the detent governs drags only).
import {
  SEAM_U,
  posAt,
  uFor,
  readoutFor,
  detentStart,
  detentStep,
  detentEscapeU,
  playStart,
  type AgesPos,
  type Chamber,
  type DetentDrag,
} from "../../render/ages-track.ts";
import {
  SWEEP_MS,
  sweepYearAt,
  sweepElapsedAt,
  eventIsPast,
  type YearRange,
} from "../../render/chronicle-scrubber.ts";
import { tAtElapsed, elapsedAtT } from "../../render/voyage-geometry.ts";
import type { Chronicle } from "./chronicle.ts";
import type { Voyage } from "./voyage.ts";
import type { OverlayData } from "./place-overlay.ts";
import type { HistoricalEvent } from "../../society/history.ts";
import type { PlaceManifest } from "../../render/place-manifest.ts";
import type { Survey } from "../../render/survey.ts";

interface AnnalRow {
  li: HTMLLIElement;
  year: number;
}

interface AgesSession {
  pos: AgesPos;
  drag: DetentDrag | null;
  /** The active drag's escape band, derived from the real track width at pointer
   *  down (the #185-style measured pin lives in ages-track.ts as pixels). */
  dragEscapeU: number;
  playing: boolean;
  rafId: number;
  annals: AnnalRow[];
  /** Which chamber's paint currently holds the chart, so a crossing repaints the
   *  other chamber's rest exactly once, never per frame. */
  chamberShown: Chamber;
  /** The bar's value domain is [0, 2 * yearSpan]: the seam lands at the midpoint and
   *  an arrow key steps exactly one year inside the ages half. */
  barMax: number;
}

export interface AgesDeps {
  /** The instrument panel (hidden while the instrument is off). */
  panel: HTMLElement;
  /** The Play/Pause button (label swap IS the state for AT). */
  playBtn: HTMLButtonElement;
  /** The one bar. */
  range: HTMLInputElement;
  /** The readout span: a word in the survey half, the year in the ages half. */
  readout: HTMLElement;
  /** The journal strip the annal rows append into (after the prologue rows). */
  strip: HTMLElement;
  /** #192: invoked when Play parks, the one rest no input event announces. */
  onPark?: () => void;
  /** The place overlay's data (events + presentYear for the annals and the plan). */
  overlay: { data(): OverlayData | null };
  chronicle: Chronicle;
  voyage: Voyage;
}

function prefersReduce(): boolean {
  return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

export function createAges(deps: AgesDeps) {
  const { panel, playBtn, range: rangeEl, readout: readoutEl, strip: stripEl, onPark, overlay, chronicle, voyage } = deps;

  let ages: AgesSession | null = null;

  function isActive(): boolean {
    return ages !== null;
  }

  function isPlaying(): boolean {
    return ages !== null && ages.playing;
  }

  function rangeOf(): YearRange {
    const s = chronicle.scrubState();
    return s ? { min: s.min, max: s.max } : { min: 0, max: 1 };
  }

  function setPlayLabel(playing: boolean): void {
    // The label swap (Play/Pause) IS the state for AT; no aria-pressed, which on a
    // label-swapping control announces a contradictory "Pause, pressed" while playing.
    playBtn.textContent = playing ? "Pause" : "Play";
  }

  function cancelRaf(): void {
    if (ages && ages.rafId) {
      cancelAnimationFrame(ages.rafId);
      ages.rafId = 0;
    }
  }

  function pause(): void {
    if (!ages) return;
    cancelRaf();
    ages.playing = false;
    setPlayLabel(false);
  }

  // The annal rows: the chronicler's block of the one journal, appended AFTER the
  // prologue rows voyage-log-panel just built into the same strip. Same row idiom.
  // #312 (the manuscript dressing): the block opens with the chronicler's heading,
  // the mirror of the surveyor's signature, and its first line takes an initial.
  function buildAnnals(events: ReadonlyArray<HistoricalEvent>): AnnalRow[] {
    const rows: AnnalRow[] = [];
    if (events.length > 0) {
      const head = document.createElement("li");
      head.className = "annals-head";
      head.textContent = "Here follow the annals of these waters";
      stripEl.appendChild(head);
    }
    for (const [i, e] of events.entries()) {
      const li = document.createElement("li");
      const year = document.createElement("span");
      year.className = "cr-year";
      year.textContent = String(e.year);
      const text = document.createElement("span");
      text.className = "cr-text";
      if (i === 0 && e.text.length > 0) {
        const dc = document.createElement("span");
        dc.className = "cr-dc";
        dc.textContent = e.text[0]!;
        text.append(dc, document.createTextNode(e.text.slice(1)));
      } else {
        text.textContent = e.text; // textContent: event prose is plain text
      }
      li.append(year, text);
      stripEl.appendChild(li);
      rows.push({ li, year: e.year });
    }
    return rows;
  }

  // #174: the verso sink is rest-only. Every rest lands here: a survey-chamber rest
  // mirrors the track the recto shows; an ages-chamber rest shows no track at all, so
  // the sink clears rather than bleeding ink the recto does not carry.
  function syncSinkAtRest(): void {
    if (!ages) return;
    if (ages.pos.chamber === "survey") voyage.syncRestingTrack();
    else voyage.internals.clearRestingTrack();
  }

  // The one paint primitive: land the instrument on a chamber position. A chamber
  // CROSSING settles the chamber being left exactly once (the survey completes and
  // its track leaves the sheet for the chronicler; or the world returns to the
  // present and the track comes back for the surveyor), then the position paints.
  // Writes NO sink (rest sites call syncSinkAtRest themselves; #174).
  function paintPos(pos: AgesPos, opts: { silent?: boolean; postLog?: boolean } = {}): void {
    if (!ages) return;
    const silent = opts.silent === true;
    const postLog = opts.postLog === true;
    const range = rangeOf();
    if (pos.chamber === "survey") {
      if (ages.chamberShown !== "survey") {
        chronicle.paintYear(range.max, true); // the present world, silently restored
        voyage.internals.setOverlayVisible(true);
        for (const r of ages.annals) r.li.classList.remove("inked"); // annals untold again
        ages.chamberShown = "survey";
      }
      voyage.internals.paintLive(pos.t, postLog); // also reveals the prologue rows
    } else {
      if (ages.chamberShown !== "ages") {
        voyage.internals.paintLive(1, postLog); // the prologue completes (summary may post)
        voyage.internals.setOverlayVisible(false); // the surveyor's ink leaves the sheet
        ages.chamberShown = "ages";
      }
      chronicle.paintYear(pos.year, silent);
      for (const r of ages.annals) r.li.classList.toggle("inked", eventIsPast(r.year, pos.year));
    }
    ages.pos = pos;
    rangeEl.value = String(Math.round(uFor(pos, range) * ages.barMax));
    const text = readoutFor(pos);
    // The word or the year on the bar's aria-valuetext (NOT a live region): a keyboard
    // step announces once per press, programmatic Play frames stay silent.
    rangeEl.setAttribute("aria-valuetext", text);
    readoutEl.textContent = text;
  }

  // Arm (or re-arm after a redraw). Never sweeps: a first arm parks at the present
  // (the world exactly as drawn, the journal fully told), a re-arm keeps the CHAMBER
  // the reader was in (normalized to its rest, today's idiom in both halves: a
  // survey-chamber rest keeps the track and the verso bleed, an ages-chamber rest
  // keeps the parked present), and a hash restore parks at the addressed rest. Play
  // is the story's one entry.
  function armAges(
    manifest: PlaceManifest | null,
    survey: Survey | null,
    seed: number,
    subtitle: string,
    opts: { quiet?: boolean; rest?: AgesPos } = {},
  ): void {
    cancelRaf();
    const priorChamber: Chamber | null = ages ? ages.pos.chamber : null;
    ages = null;
    chronicle.applyScrub();
    if (!chronicle.isActive()) {
      clearAges();
      return;
    }
    // The quiet flag passes THROUGH, never pinned on: rearmVoyage's quiet does double
    // duty (skip the sink AND reuse-or-skip the #184 travel-order matrix), so pinning
    // it true here armed every fresh world on an UNORDERED itinerary (caught by e2e
    // W25 on the 526413615 fixture: 6 sea legs and no handoff where the ordered tour
    // sails 9 with one). A non-quiet rearm's own sink paint is immediately settled by
    // syncSinkAtRest below, so the sink still ends rest-correct (#174).
    voyage.rearmVoyage(manifest, survey, seed, subtitle, { quiet: !!opts.quiet });
    const range = rangeOf();
    const barMax = 2 * Math.max(1, range.max - range.min);
    rangeEl.min = "0";
    rangeEl.max = String(barMax);
    rangeEl.step = "1";
    ages = {
      pos: { chamber: "survey", t: 1 },
      drag: null,
      dragEscapeU: 0,
      playing: false,
      rafId: 0,
      annals: buildAnnals(overlay.data()!.events),
      chamberShown: "survey",
      barMax,
    };
    panel.hidden = false;
    setPlayLabel(false);
    // The adopted rest CLAMPS against this world's range: parseLive only gates on
    // "integer > 0", so a hand-edited year=999999 reaches here and, unclamped, would
    // paint a blank chart and write itself back into the hash forever (the internal
    // paintYear seam is deliberately unclamped; this is its boundary).
    const rawRest: AgesPos =
      opts.rest ??
      (priorChamber === "survey" ? { chamber: "survey", t: 1 } : { chamber: "ages", year: range.max });
    const rest: AgesPos =
      rawRest.chamber === "ages"
        ? { chamber: "ages", year: Math.max(range.min, Math.min(range.max, Math.round(rawRest.year))) }
        : { chamber: "survey", t: Math.max(0, Math.min(1, rawRest.t)) };
    paintPos(rest, { silent: true, postLog: false });
    if (!opts.quiet) syncSinkAtRest();
  }

  function exitAges(): void {
    pause();
    chronicle.exitScrub();
    voyage.exitVoyage(); // clears the status, empties + hides the journal, clears the sink
    panel.hidden = true;
    rangeEl.removeAttribute("aria-valuetext");
    ages = null;
  }

  // Drop the session after a redraw with the toggle off (the host's innerHTML swap
  // already replaced the baked layers; the journal is a sibling and hides explicitly).
  function clearAges(): void {
    cancelRaf();
    chronicle.clearScrub();
    voyage.clearVoyage();
    panel.hidden = true;
    ages = null;
  }

  // A bar input frame: a pointer drag rides the detent, a keyboard step crosses freely
  // (a discrete press is already deliberate). Manual input pauses a running Play, the
  // house idiom since the chronicle's first slider.
  function onBarInput(): void {
    if (!ages) return;
    if (ages.playing) pause();
    const raw = Number(rangeEl.value) / ages.barMax;
    let u = raw;
    let side: Chamber | undefined;
    if (ages.drag) {
      const step = detentStep(ages.drag, raw, ages.dragEscapeU);
      ages.drag = step.drag;
      u = step.u;
      side = step.drag.side;
    }
    paintPos(posAt(u, rangeOf(), side), { postLog: true });
    if (!ages.drag) syncSinkAtRest(); // a keyboard step is a rest; a drag rests on release
  }

  /** Pointer down on the bar: the detent arms against the grabbed side, with its
   *  escape band derived from the track this drag actually runs on (16 is the
   *  .ages-range thumb width, living-chart.css). */
  function dragStart(): void {
    if (!ages) return;
    ages.drag = detentStart(Number(rangeEl.value) / ages.barMax);
    ages.dragEscapeU = detentEscapeU(rangeEl.getBoundingClientRect().width - 16);
  }

  /** Pointer up or cancel: the drag rests where it stands. */
  function dragEnd(): void {
    if (!ages || !ages.drag) return;
    ages.drag = null;
    syncSinkAtRest();
  }

  function play(): void {
    if (!ages) return;
    const range = rangeOf();
    if (prefersReduce()) {
      // A still frame at the story's end, no sweep; the park still reaches the address.
      paintPos({ chamber: "ages", year: range.max }, { silent: true, postLog: false });
      syncSinkAtRest();
      onPark?.();
      return;
    }
    // At a chamber-end rest, open the whole story (see the module header).
    const pos = playStart(ages.pos, range);
    const sched = voyage.internals.schedule();
    const cumMs = sched ? sched.cumMs : [0];
    const surveyMs = sched ? sched.totalMs : 0;
    const elapsed0 =
      pos.chamber === "survey" ? elapsedAtT(cumMs, pos.t) : surveyMs + sweepElapsedAt(range, pos.year);
    const totalMs = surveyMs + SWEEP_MS;
    const begin = performance.now() - elapsed0;
    ages.playing = true;
    setPlayLabel(true);
    const tick = (now: number) => {
      if (!ages || !ages.playing) return;
      // Clamped below the resume point: a rAF timestamp is vsync-aligned and can
      // PRECEDE the performance.now() that anchored `begin`, so an unclamped first
      // frame can land a hair before elapsed0 and step the year BACKWARD across a
      // rounding boundary (a one-frame flicker; CI's slower VM caught it in e2e S9).
      const elapsed = Math.max(now - begin, elapsed0);
      if (elapsed >= totalMs) {
        paintPos({ chamber: "ages", year: range.max }, { postLog: true });
        pause(); // auto-park at the present, button back to "Play"
        syncSinkAtRest();
        onPark?.(); // #192: the parked present must reach the address
        return;
      }
      if (elapsed < surveyMs) {
        paintPos({ chamber: "survey", t: tAtElapsed(cumMs, elapsed) }, { postLog: true });
      } else {
        paintPos({ chamber: "ages", year: sweepYearAt(range, elapsed - surveyMs) }, { postLog: true });
      }
      ages.rafId = requestAnimationFrame(tick);
    };
    ages.rafId = requestAnimationFrame(tick);
  }

  // The Play/Pause button. No-op when the instrument is off.
  function togglePlay(): void {
    if (!ages) return;
    if (ages.playing) {
      pause();
      syncSinkAtRest();
      onPark?.(); // #192: the mid-story park must reach the address
    } else play();
  }

  // The flip snaps the instrument to the CURRENT chamber's rest, preserving both
  // pre-fusion behaviours: a survey-chamber flip rests on the full track (both faces
  // agree, the one summary posts at most once, #174), an ages-chamber flip parks at
  // the present (the pristine ghost is correct by construction, #180).
  function snapToRest(): void {
    if (!ages) return;
    pause();
    const rest: AgesPos =
      ages.pos.chamber === "survey" ? { chamber: "survey", t: 1 } : { chamber: "ages", year: rangeOf().max };
    paintPos(rest, { silent: true, postLog: true });
    syncSinkAtRest();
  }

  /** Paint a year directly (the roster's scrubTo under the fused instrument). */
  function scrubToYear(year: number): void {
    if (!ages) return;
    if (ages.playing) pause();
    const range = rangeOf();
    paintPos(
      { chamber: "ages", year: Math.max(range.min, Math.min(range.max, Math.round(year))) },
      { postLog: false },
    );
    syncSinkAtRest();
  }

  /** The live instrument for a read (address writer, e2e), or null when off. */
  function agesState() {
    if (!ages) return null;
    const range = rangeOf();
    return {
      chamber: ages.pos.chamber,
      t: ages.pos.chamber === "survey" ? ages.pos.t : null,
      year: ages.pos.chamber === "ages" ? ages.pos.year : null,
      u: uFor(ages.pos, range),
      seamU: SEAM_U,
      held: ages.drag !== null && ages.drag.held,
      playing: ages.playing,
      min: range.min,
      max: range.max,
    };
  }

  return {
    isActive,
    isPlaying,
    syncSinkAtRest,
    armAges,
    exitAges,
    clearAges,
    cancelRaf,
    pause,
    togglePlay,
    onBarInput,
    dragStart,
    dragEnd,
    snapToRest,
    scrubToYear,
    agesState,
  };
}

export type Ages = ReturnType<typeof createAges>;
