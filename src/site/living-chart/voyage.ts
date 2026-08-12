// The Wayfarer's Passage overlay (epic #117; Sub 2 = #119, Sub 3 = #120): a per-draw
// DOM layer over the baked chart that animates the survey that drew it. A dotted track
// sets out from the capital and threads port to port behind the survey party, and the
// surveyor's dated log accumulates in the margin (#121): a chronicle-strip-style panel
// whose entries brighten as the survey reaches each port. #275 closed the itinerary
// into a round trip (a final leg carries the survey home, the log closes with a
// homecoming line); when the sweep ends the full track rests until the toggle goes off.
//
// #120's honest geometry (roads walked, water crossed; a rider ashore, a ship in the
// leg's #181 water span, both PROFILE glyphs) is prepared in voyage-session.ts; the
// deterministic math is in the engine under src/render/. This file is only frame
// paint, the rAF clock, and the arm/step/paint/reset API.
//
// Host-agnostic since #191: the chart mount and the status line arrive from the host,
// the margin log is an injected panel instance, and the resting track mirrors to an
// OPTIONAL sink (the Explorer's verso; a page host may pass none). The host's Download
// blobs the pristine chart string, never this overlay, so the exported plate never
// learns it was animated. The sweep's pacing is measured, not eyeballed: #185 clocked
// 150 seeds at 10.2s to 16.1s per sweep (mean 13.4s), with MAX_SWEEP_MS 26s a
// never-binding safety valve (voyage-geometry.ts).
import { frameAt, logEntryCount, type VoyageFrame } from "../../render/voyage.ts";
import {
  pointAtDistance,
  headingAt,
  tiltFor,
  resolveFacing,
  markGlyphAt,
  tAtElapsed,
  type MarkGlyph,
} from "../../render/voyage-geometry.ts";
import { createSessionBuilder, type Session } from "./voyage-session.ts";
import type { VoyageLogPanel } from "./voyage-log-panel.ts";
import type { PlaceManifest } from "../../render/place-manifest.ts";
import type { Survey } from "../../render/survey.ts";
import type { Pt } from "../../core/rdp.ts";

/**
 * Where the resting track mirrors to (#174: the Explorer's verso bleed-through). The
 * engine calls paint ONLY where the survey comes to rest, never from the rAF tick, and
 * clear when the voyage leaves; a host with no second surface simply passes no sink.
 */
export interface RestingTrackSink {
  paint(points: string, viewBox: string): void;
  clear(): void;
}

export interface VoyageDeps {
  /** The chart mount; the overlay svg is appended as its child. */
  mapEl: HTMLElement;
  /** The polite status line the one live-completion summary posts to. */
  statusEl: HTMLElement;
  /** The margin-log panel instance (voyage-log-panel.ts). */
  logPanel: VoyageLogPanel;
  /** Optional second surface for the resting track. */
  restingTrackSink?: RestingTrackSink;
}

function prefersReduce(): boolean {
  return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

const fmt = (p: Pt) => `${p.x},${p.y}`;

export function createVoyage(deps: VoyageDeps) {
  const { mapEl, statusEl, logPanel, restingTrackSink } = deps;
  const sessions = createSessionBuilder({ mapEl, logPanel });

  // The current voyage session, or null when the toggle is off. Rebuilt every draw
  // because the host's innerHTML swap wipes the mount's children (the overlay among them).
  let voyage: Session | null = null;

  function cancelVoyageRaf(): void {
    if (voyage && voyage.rafId) {
      cancelAnimationFrame(voyage.rafId);
      voyage.rafId = 0;
    }
  }

  // Drop the session after a redraw with the toggle off. The host's innerHTML swap
  // already removed the overlay with the old chart, but the #121 margin log is a
  // SIBLING of the mount, so it survives that wipe and must be hidden explicitly.
  function clearVoyage(): void {
    logPanel.hideLog();
    voyage = null;
  }

  /** Prepare a fresh session (voyage-session.ts) and adopt it; false = nothing to survey. */
  function buildVoyage(
    manifest: PlaceManifest | null,
    survey: Survey | null,
    seed: number,
    subtitle: string,
    quiet = false,
  ): boolean {
    voyage = sessions.build(manifest, survey, seed, subtitle, quiet);
    return voyage !== null;
  }

  /** The track drawn so far: every vertex of every completed leg, plus the partial one. */
  function trackString(session: Session, f: VoyageFrame): string {
    if (session.legs.length === 0) return fmt(session.originPt);
    const out: string[] = [];
    const push = (p: Pt) => {
      const s = fmt(p);
      if (out[out.length - 1] !== s) out.push(s); // a leg starts where the last one ended
    };
    for (let i = 0; i < f.legIndex; i++) for (const p of session.legs[i].geom.points) push(p);

    const { geom } = session.legs[f.legIndex];
    const s = f.legT * geom.total;
    push(geom.points[0]);
    for (let k = 1; k < geom.points.length && geom.cum[k] <= s; k++) push(geom.points[k]);
    push(pointAtDistance(geom, s));
    return out.join(" ");
  }

  /** Show the glyph this frame calls for (#181: markGlyphAt decides by the leg's water
   *  span, so the swap lands at the water's edge, not at the port). The DOM is still
   *  toggled only on change, never per frame. */
  function showMark(session: Session, glyph: MarkGlyph): void {
    if (glyph === session.shownGlyph) return;
    const useShip = glyph === "ship";
    // The SVG `display` presentation attribute, not [hidden]: SVG elements do not honour
    // the HTML hidden attribute through the UA stylesheet.
    session.shipG.setAttribute("display", useShip ? "inline" : "none");
    session.riderG.setAttribute("display", useShip ? "none" : "inline");
    session.activeMark = useShip ? session.shipG : session.riderG;
    session.shownGlyph = glyph;
  }

  // Paint one frame at progress t (0..1): grow the track through every arrived port plus
  // the partial current leg, move the mark to its position/facing/tilt, and brighten the
  // margin-log rows reached so far. On the LIVE completion (postLog) it posts the one
  // status summary. A resting re-arm after a redraw paints silently (postLog false): it
  // still brightens the log, but never stomps the "" the draw's own settle signal depends on.
  function paintFrame(session: Session, t: number, postLog = true): void {
    const legCount = session.legs.length;
    const f = frameAt(legCount, t);

    let pos: Pt;
    let tiltDeg = 0;
    if (legCount <= 0) {
      pos = session.originPt;
      showMark(session, "rider");
    } else {
      const { geom, mode, water } = session.legs[f.legIndex];
      const s = f.legT * geom.total;
      pos = pointAtDistance(geom, s);
      // The heading is a chord across a lookahead window, not the raw segment under the
      // mark. That is what keeps a switchbacking road from flipping the rider every few
      // frames, and it damps the tilt through a bend rather than snapping it.
      const hd = headingAt(geom, s);
      tiltDeg = tiltFor(hd.x, hd.y);
      session.facing = resolveFacing(hd.x, Math.hypot(hd.x, hd.y), session.facing);
      showMark(session, markGlyphAt(mode, water, f.legT));
    }

    session.trackEl.setAttribute("points", trackString(session, f));
    // scale() before rotate(): the mirror negates x and preserves y, so one unsigned tilt
    // lifts the bow whether the mark faces east or west. See voyage-geometry.ts tiltFor.
    session.activeMark!.setAttribute(
      "transform",
      `translate(${pos.x} ${pos.y}) scale(${session.facing} 1) rotate(${tiltDeg})`,
    );

    if (f.arrived !== session.shownArrived) {
      session.shownArrived = f.arrived;
      // The margin log brightens per arrival ALWAYS, even on a silent re-arm (it is visual,
      // not the live region). #121: the single polite status summary is the whole survey's
      // announcement, posted only on the LIVE completion (postLog) so a silent re-arm keeps
      // the status "" for the draw's settle signal and the e2e waitSettled. On any earlier OR
      // backward-stepped resting frame (the deterministic step hooks can move `arrived` DOWN)
      // the status returns to "", so a stale summary never lingers at a mid-survey rest.
      logPanel.revealLog(session.logRows, f.arrived);
      if (postLog) {
        // #275: against logEntryCount, NEVER ports.length. Once the tour closes, the last
        // port is no longer the end of the survey: comparing against ports.length would
        // post the one summary a leg early, at the last port, and again at the homecoming.
        statusEl.textContent = f.arrived >= logEntryCount(session.plan) ? session.log.summary : "";
      }
    }
  }

  // #174: mirror the recto track onto the host's sink (the Explorer's verso back face),
  // reading the very same `points` string paintFrame just wrote, so the two faces can
  // never disagree. A no-op for a host with no sink.
  //
  // INVARIANT: the sink track is STATIC, never live. It is painted only where the survey
  // comes to REST (a sweep ending, a flip snapping it to rest, a silent re-arm after a
  // redraw) and cleared on exit, never from the rAF tick. Decision 2 (a flip snaps the
  // voyage to rest first) is what makes that safe: no flip can land mid-sweep, so the back
  // face is never revealed showing a half-drawn track. Painting per frame would also churn
  // layout on a hidden face 60 times a second for nothing.
  //
  // It stays glyph-agnostic: only trackEl's polyline crosses over, never the ship or the
  // rider. The track is ink the surveyor laid on the recto; the mark is the survey itself.
  //
  // It posts nothing to the status line, so it is safe inside a settle (the draw's settle
  // signal and the e2e waitSettled both key on the status being "").
  function syncRestingTrack(): void {
    if (!restingTrackSink) return;
    if (!voyage) { restingTrackSink.clear(); return; }
    restingTrackSink.paint(
      voyage.trackEl.getAttribute("points") as string,
      voyage.svg.getAttribute("viewBox") as string,
    );
  }

  function play(session: Session): void {
    const legCount = session.legs.length;
    // A one-port survey (no legs) has nothing to sweep: rest at the origin at once.
    if (legCount <= 0 || session.totalMs <= 0) {
      paintFrame(session, 1);
      syncRestingTrack();
      return;
    }
    const begin = performance.now();
    const tick = (now: number) => {
      if (!voyage || voyage !== session || !session.rafId) return; // superseded or cancelled
      const elapsed = now - begin;
      if (elapsed >= session.totalMs) {
        paintFrame(session, 1);
        session.rafId = 0; // the full track now rests on the chart
        syncRestingTrack(); // #174: at rest, so the ink may bleed through to the back
        return;
      }
      // Which leg is the mark on, and how far along it? tAtElapsed converts to the
      // equal-split global t that frameAt expects (t = (legIndex + legT)/legCount), so
      // paintFrame, the deterministic step hooks, and #220's fused clock keep sharing
      // one timeline; only the pacing differs.
      paintFrame(session, tAtElapsed(session.cumMs, elapsed));
      session.rafId = requestAnimationFrame(tick);
    };
    session.rafId = requestAnimationFrame(tick);
  }

  // Toggle voyage ON: build the survey and animate the sweep from the capital. Under
  // reduced motion the full track and the final port's line appear at once, no sweep.
  // #174: opts.skipSweep takes the same at-rest path when the surface is hidden (the
  // Explorer passes it while the sheet rests on its verso). The sweep is a visible-face
  // ceremony: a ~13-second animation nobody can see (10-16s measured across 150 seeds,
  // #185), narrating into the status line the whole way, is not a feature. The host owns
  // the hidden/flipped state.
  //
  // During a sweep the sink carries NO track: exitVoyage cleared it above, and it is
  // repainted when the survey comes to rest. A flip mid-sweep snaps to rest first, so the
  // back face never turns into view empty.
  function applyVoyage(
    manifest: PlaceManifest | null,
    survey: Survey | null,
    seed: number,
    subtitle: string,
    opts: { skipSweep?: boolean } = {},
  ): void {
    exitVoyage();
    if (!buildVoyage(manifest, survey, seed, subtitle)) return;
    if (opts.skipSweep || prefersReduce()) {
      paintFrame(voyage!, 1);
      syncRestingTrack();
      return;
    }
    paintFrame(voyage!, 0);
    play(voyage!);
  }

  // Re-arm after a redraw while the toggle stayed on: rebuild against the new world
  // and rest on the full track. Only an explicit toggle-ON animates the sweep, so a
  // style turn or a sea-level nudge never replays the whole voyage.
  function rearmVoyage(
    manifest: PlaceManifest | null,
    survey: Survey | null,
    seed: number,
    subtitle: string,
    opts: { quiet?: boolean } = {},
  ): void {
    cancelVoyageRaf();
    voyage = null;
    if (!buildVoyage(manifest, survey, seed, subtitle, opts.quiet)) { logPanel.hideLog(); return; }
    paintFrame(voyage!, 1, false); // silent: the draw's settle needs the status to stay ""
    // #174: repaint the back face too. The Explorer's renderVerso replaceChildren wipes
    // the verso track on every draw, exactly as the mount's innerHTML wipes the recto
    // overlay, so BOTH faces have to be rebuilt. In the conductor's settle path
    // rebuildVerso runs AFTER this and wipes it again, which is why the conductor calls
    // syncRestingTrack once more on the far side of that wipe.
    //
    // INVARIANT: the sink's ghost and its track always come from the SAME draw. A quiet
    // mid-drag redraw (the sea-level slider) deliberately does NOT rebuild the ghost,
    // because re-blobbing the chart every frame is the ~1 MB per redraw leak #116 exists
    // to avoid. So the track must not be repainted for the new world either: a fresh
    // survey struck over a stale coastline registers with nothing. Leave the whole back
    // face frozen on the last non-quiet draw; the drag's release redraw is not quiet and
    // refreshes both together.
    if (!opts.quiet) syncRestingTrack();
  }

  // Toggle voyage OFF: cancel the sweep, remove the overlay, and clear the status line
  // so the mount is byte-identical to before (only the place overlay remains).
  function exitVoyage(): void {
    cancelVoyageRaf();
    // EVERY match, not the first (#364). The session builder holds "one mount, one
    // overlay" from the other end, so this is belt and braces: it costs one token and it
    // means a sheet that somehow arrived carrying two is left truly bare rather than with
    // one track stranded on an unticked sheet. Guarded by e2e SV2h, which plants the
    // second overlay because no arm path can produce it any more.
    mapEl.querySelectorAll(".voyage-overlay").forEach((overlay) => overlay.remove());
    if (voyage) statusEl.textContent = "";
    logPanel.hideLog(); // #121: the margin log is a sibling of the mount, so remove it explicitly
    voyage = null;
    restingTrackSink?.clear(); // #174: the ink leaves the back of the sheet with the front
  }

  // #174: snap a running sweep to its resting track, both faces, and stay there. Called
  // by the Explorer's flip: a sweep runs 10-16s (#185) and must never hold the sheet
  // hostage, and a Turn button that goes dead that long reads as a bug rather than as a
  // rule, so interaction interrupts the animation instead (the same idiom as the
  // scrubber's drag pausing Play).
  //
  // paintFrame's shownArrived diff fires exactly ONCE here, so the status posts only the
  // final port's line, never a burst of every port the snap skipped. No-op when not
  // voyaging, and a no-op on an already-resting voyage (no diff, so nothing is posted).
  function voyageSnapToRest(): void {
    if (!voyage) return;
    cancelVoyageRaf();
    paintFrame(voyage, 1);
    syncRestingTrack();
  }

  // Deterministic e2e hook: jump the sweep to the mark's arrival at port N (the origin
  // is port 0), mirroring how the scrubber is driven through its slider rather than its
  // Play timer. No-op when not voyaging.
  function voyageStepTo(portIndex: number): void {
    if (!voyage) return;
    cancelVoyageRaf();
    const legCount = voyage.legs.length;
    const clampedPort = Math.max(0, Math.min(portIndex, legCount));
    const t = legCount > 0 ? clampedPort / legCount : 0;
    paintFrame(voyage, t);
    syncRestingTrack(); // #174: a step lands the survey at rest, so the two faces agree
  }

  // #120 e2e hook, and the continuous-timeline seam (#220 drives the sweep with it):
  // paint an arbitrary progress t in [0,1]. voyageStepTo can only land ON a port
  // (legT = 0), so it can never sample a MID-leg frame, which is exactly where the
  // tilt varies and where a switchbacking road would flicker the rider's facing. Like
  // voyageStepTo this lands the survey at a resting frame, never inside the rAF loop.
  function voyagePaintAt(t: number): void {
    if (!voyage) return;
    cancelVoyageRaf();
    paintFrame(voyage, t);
    syncRestingTrack();
  }

  // e2e read hook: the current plan (or null), so a suite can assert the itinerary. Legs
  // carry the router's `mode` alongside the logical port pair.
  function voyagePlan() {
    if (!voyage) return null;
    return {
      ports: voyage.plan.ports,
      legs: voyage.plan.legs.map((leg, i) => ({ ...leg, mode: voyage!.legs[i].mode })),
    };
  }

  // #121 e2e read hook: the margin log (attribution, summary, entries) plus how many rows
  // are currently revealed and whether the panel is shown, so a suite can assert the mode-
  // aware prose and the reveal-per-arrival without racing the rAF loop. The payload (and
  // the panel's visibility) is assembled by voyage-log-panel.ts.
  function voyageLog() {
    if (!voyage) return null;
    return logPanel.logSnapshot(voyage.log, voyage.logRows);
  }

  // e2e read hook: each leg's mode, water span + handoff flag (#181), and its PROJECTED
  // (chart-pixel) vertices, so a suite can find a genuinely switchbacking road leg to prove
  // the anti-flicker wiring, or an inland-handoff leg to sample the glyph along, rather
  // than assuming which leg exhibits what.
  function voyageLegGeometry() {
    if (!voyage) return null;
    return voyage.legs.map((l) => ({
      mode: l.mode,
      water: l.water,
      inlandHandoff: l.inlandHandoff,
      points: l.geom.points.map((p) => ({ x: p.x, y: p.y })),
    }));
  }

  // #220 internal seams for the fused ages driver, consumed by index.ts and never on
  // the public engine API: a live per-frame paint that writes NO sink (#174 keeps the
  // sink rest-only, and the fused clock paints sixty times a second), the overlay's
  // chamber visibility (the track leaves the sheet while the chronicler holds it), the
  // pacing schedule for the fused clock, and the rest-side sink clear for an
  // ages-chamber rest, where the recto shows no track for the verso to bleed through.
  const internals = {
    hasSession: (): boolean => voyage !== null,
    paintLive: (t: number, postLog: boolean): void => {
      if (voyage) paintFrame(voyage, t, postLog);
    },
    schedule: (): { cumMs: ReadonlyArray<number>; totalMs: number } | null =>
      voyage ? { cumMs: voyage.cumMs, totalMs: voyage.totalMs } : null,
    setOverlayVisible: (visible: boolean): void => {
      if (voyage) voyage.svg.style.display = visible ? "" : "none";
    },
    clearRestingTrack: (): void => restingTrackSink?.clear(),
  };

  return {
    applyVoyage,
    rearmVoyage,
    exitVoyage,
    clearVoyage,
    cancelVoyageRaf,
    voyageSnapToRest,
    voyageStepTo,
    voyagePaintAt,
    voyagePlan,
    voyageLog,
    voyageLegGeometry,
    syncRestingTrack,
    internals,
  };
}

export type Voyage = ReturnType<typeof createVoyage>;
