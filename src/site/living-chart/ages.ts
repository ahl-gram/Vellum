// The fused instrument: one scrubber whose left half is the survey chamber (voyage t) and right half the ages chamber (the chronicle's years), with a hard detent at the seam for drags only (ratified 2026-07-28). Owns the one clock, bar and journal; the chronicle and voyage modules are the two chamber painters it drives through their internal seams.
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
import { DEFAULT_PACE, anchorAt, repaced, storyAt, type Pace, type SweepAnchor } from "./pace.ts";
import type { Chronicle } from "./chronicle.ts";
import type { Voyage } from "./voyage.ts";
import type { OverlayData } from "./place-overlay.ts";
import type { HistoricalEvent } from "../../society/history.ts";
import type { PlaceManifest } from "../../render/place-manifest.ts";
import type { Survey } from "../../render/survey.ts";
import { toldAnnal, type ToldEntry } from "./told.ts";
import { buildAnnals, type AnnalRow } from "./annals.ts";

interface AgesSession {
  pos: AgesPos;
  drag: DetentDrag | null;
  dragEscapeU: number;
  playing: boolean;
  rafId: number;
  anchor: SweepAnchor;
  annals: AnnalRow[];
  chamberShown: Chamber;
  barMax: number;
}

export interface AgesDeps {
  panel: HTMLElement;
  playBtn: HTMLButtonElement;
  range: HTMLInputElement;
  readout: HTMLElement;
  strip: HTMLElement;
  onPark?: () => void;
  onAgesTold?: (told: ToldEntry | null) => void;
  overlay: { data(): OverlayData | null };
  chronicle: Chronicle;
  voyage: Voyage;
}

function prefersReduce(): boolean {
  return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

export function createAges(deps: AgesDeps) {
  const { panel, playBtn, range: rangeEl, readout: readoutEl, strip: stripEl, onPark, onAgesTold, overlay, chronicle, voyage } = deps;

  let ages: AgesSession | null = null;
  let pace: Pace = DEFAULT_PACE;

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
    // The label swap IS the state for AT; aria-pressed on a label-swapping control announces a contradictory "Pause, pressed" while playing.
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

  function syncSinkAtRest(): void {
    if (!ages) return;
    if (ages.pos.chamber === "survey") voyage.syncRestingTrack();
    else voyage.internals.clearRestingTrack();
  }

  // The one paint primitive: a chamber crossing settles the chamber being left exactly once, never per frame, and it writes no sink (rest sites call syncSinkAtRest themselves).
  function paintPos(pos: AgesPos, opts: { silent?: boolean; postLog?: boolean } = {}): void {
    if (!ages) return;
    const silent = opts.silent === true;
    const postLog = opts.postLog === true;
    const range = rangeOf();
    if (pos.chamber === "survey") {
      if (ages.chamberShown !== "survey") {
        chronicle.paintYear(range.max, true); // the present world, silently restored
        voyage.internals.setOverlayVisible(true);
        for (const r of ages.annals) r.li.classList.remove("inked");
        ages.chamberShown = "survey";
      }
      voyage.internals.paintLive(pos.t, postLog); // also reveals the prologue rows
    } else {
      if (ages.chamberShown !== "ages") {
        voyage.internals.paintLive(1, postLog); // the prologue completes (summary may post)
        voyage.internals.setOverlayVisible(false);
        ages.chamberShown = "ages";
      }
      chronicle.paintYear(pos.year, silent);
      for (const r of ages.annals) r.li.classList.toggle("inked", eventIsPast(r.year, pos.year));
    }
    ages.pos = pos;
    onAgesTold?.(pos.chamber === "survey" ? voyage.internals.toldEntry() : toldAnnal(ages.annals, pos.year));
    rangeEl.value = String(Math.round(uFor(pos, range) * ages.barMax));
    const text = readoutFor(pos);
    // aria-valuetext, NOT a live region: a keyboard step announces once per press, programmatic Play frames stay silent.
    rangeEl.setAttribute("aria-valuetext", text);
    readoutEl.textContent = text;
  }

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
      anchor: { begin: 0, floor: 0 },
      annals: buildAnnals(stripEl, overlay.data()!.events),
      chamberShown: "survey",
      barMax,
    };
    panel.hidden = false;
    setPlayLabel(false);
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
    voyage.exitVoyage();
    panel.hidden = true;
    rangeEl.removeAttribute("aria-valuetext");
    ages = null;
    onAgesTold?.(null);
  }

  function clearAges(): void {
    cancelRaf();
    chronicle.clearScrub();
    voyage.clearVoyage();
    panel.hidden = true;
    ages = null;
    onAgesTold?.(null);
  }

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

  /** 16 is the .ages-range thumb width in living-chart.css, so the escape band derives from the real track. */
  function dragStart(): void {
    if (!ages) return;
    ages.drag = detentStart(Number(rangeEl.value) / ages.barMax);
    ages.dragEscapeU = detentEscapeU(rangeEl.getBoundingClientRect().width - 16);
  }

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
    const pos = playStart(ages.pos, range);
    const sched = voyage.internals.schedule();
    const cumMs = sched ? sched.cumMs : [0];
    const surveyMs = sched ? sched.totalMs : 0;
    const elapsed0 =
      pos.chamber === "survey" ? elapsedAtT(cumMs, pos.t) : surveyMs + sweepElapsedAt(range, pos.year);
    const totalMs = surveyMs + SWEEP_MS;
    ages.anchor = anchorAt(performance.now(), elapsed0, pace);
    ages.playing = true;
    setPlayLabel(true);
    const tick = (now: number) => {
      if (!ages || !ages.playing) return;
      const elapsed = storyAt(ages.anchor, now, pace);
      if (elapsed >= totalMs) {
        paintPos({ chamber: "ages", year: range.max }, { postLog: true });
        pause();
        syncSinkAtRest();
        onPark?.();
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

  function setPace(k: Pace): void {
    if (ages && ages.playing) ages.anchor = repaced(ages.anchor, performance.now(), pace, k);
    pace = k;
  }

  function togglePlay(): void {
    if (!ages) return;
    if (ages.playing) {
      pause();
      syncSinkAtRest();
      onPark?.();
    } else play();
  }

  // The flip snaps to the CURRENT chamber's rest: a survey-chamber flip rests on the full track (both faces agree, the one summary posts at most once, #174); an ages-chamber flip parks at the present (#180).
  function snapToRest(): void {
    if (!ages) return;
    pause();
    const rest: AgesPos =
      ages.pos.chamber === "survey" ? { chamber: "survey", t: 1 } : { chamber: "ages", year: rangeOf().max };
    paintPos(rest, { silent: true, postLog: true });
    syncSinkAtRest();
  }

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
      pace,
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
    setPace,
    onBarInput,
    dragStart,
    dragEnd,
    snapToRest,
    scrubToYear,
    agesState,
  };
}

export type Ages = ReturnType<typeof createAges>;
