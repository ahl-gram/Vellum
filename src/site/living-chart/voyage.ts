// The Wayfarer's Passage overlay (#117/#119/#120): a per-draw DOM layer over the baked
// chart animating the survey that drew it. The honest geometry is prepared in
// voyage-session.ts and the deterministic math lives in src/render/; this file is only
// frame paint, the rAF clock, and the arm/step/paint/reset API. Host-agnostic since #191.
import { frameAt, logEntryCount, toldRow, type VoyageFrame } from "../../render/voyage.ts";
import {
  pointAtDistance,
  headingAt,
  tiltFor,
  resolveFacing,
  markGlyphAt,
  tAtElapsed,
  type MarkGlyph,
} from "../../render/voyage-geometry.ts";
import { createSessionBuilder, type Session, type TourOrderSource } from "./voyage-session.ts";
import { journalText, type VoyageLogPanel } from "./voyage-log-panel.ts";
import type { ToldEntry } from "./told.ts";
import type { PlaceManifest } from "../../render/place-manifest.ts";
import type { Survey } from "../../render/survey.ts";
import type { Pt } from "../../core/rdp.ts";

/** #174: where the resting track mirrors to (the Explorer's verso). The engine paints ONLY where the survey rests, never from the rAF tick, and clears when the voyage leaves. */
export interface RestingTrackSink {
  paint(points: string, viewBox: string): void;
  clear(): void;
}

export interface VoyageDeps {
  /** The chart mount; it holds at most ONE overlay svg child, the builder's (#364). */
  mapEl: HTMLElement;
  statusEl: HTMLElement;
  logPanel: VoyageLogPanel;
  restingTrackSink?: RestingTrackSink;
  tourOrder?: TourOrderSource;
}

function prefersReduce(): boolean {
  return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

const fmt = (p: Pt) => `${p.x},${p.y}`;

export function createVoyage(deps: VoyageDeps) {
  const { mapEl, statusEl, logPanel, restingTrackSink } = deps;
  const sessions = createSessionBuilder({
    mapEl,
    logPanel,
    ...(deps.tourOrder ? { tourOrder: deps.tourOrder } : {}),
  });

  // null when the toggle is off; rebuilt every draw (the host's innerHTML swap wipes the mount's children).
  let voyage: Session | null = null;

  function cancelVoyageRaf(): void {
    if (voyage && voyage.rafId) {
      cancelAnimationFrame(voyage.rafId);
      voyage.rafId = 0;
    }
  }

  function dropOverlays(): void {
    mapEl.querySelectorAll(".voyage-overlay").forEach((overlay) => overlay.remove());
  }

  // The #121 margin log is a SIBLING of the mount, so it survives the innerHTML wipe and must be hidden explicitly.
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

  /** #181: markGlyphAt decides by the leg's water span, so the swap lands at the water's edge; the DOM is toggled only on change. */
  function showMark(session: Session, glyph: MarkGlyph): void {
    if (glyph === session.shownGlyph) return;
    const useShip = glyph === "ship";
    // The SVG `display` presentation attribute, not [hidden]: SVG elements do not honour the HTML hidden attribute through the UA stylesheet.
    session.shipG.setAttribute("display", useShip ? "inline" : "none");
    session.riderG.setAttribute("display", useShip ? "none" : "inline");
    session.activeMark = useShip ? session.shipG : session.riderG;
    session.shownGlyph = glyph;
  }

  // Paint one frame at t (0..1). postLog=false (a resting re-arm) paints silently and never stomps the "" the draw's settle signal depends on.
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
      // The heading is a chord across a lookahead window, not the raw segment under the mark, so a switchbacking road cannot flip the rider every few frames.
      const hd = headingAt(geom, s);
      tiltDeg = tiltFor(hd.x, hd.y);
      session.facing = resolveFacing(hd.x, Math.hypot(hd.x, hd.y), session.facing);
      showMark(session, markGlyphAt(mode, water, f.legT));
    }

    session.trackEl.setAttribute("points", trackString(session, f));
    // scale() before rotate(): the mirror negates x and preserves y, so one unsigned tilt lifts the bow either way it faces (voyage-geometry.ts tiltFor).
    session.activeMark!.setAttribute(
      "transform",
      `translate(${pos.x} ${pos.y}) scale(${session.facing} 1) rotate(${tiltDeg})`,
    );

    if (f.arrived !== session.shownArrived) {
      session.shownArrived = f.arrived;
      // The log brightens per arrival even on a silent re-arm; the ONE polite status summary posts only on the LIVE completion, and any earlier or backward-stepped rest returns the status to "".
      logPanel.revealLog(session.logRows, f.arrived);
      if (postLog) {
        // #275: against logEntryCount, NEVER ports.length, or the summary posts a leg early at the last port and again at the homecoming.
        statusEl.textContent = f.arrived >= logEntryCount(session.plan) ? session.log.summary : "";
      }
    }
  }

  // #174: mirrors the very same points string paintFrame wrote, so the faces can never disagree (e2e SV6); rest-only per the sink contract above, glyph-agnostic, posts nothing to the status.
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
      // tAtElapsed converts to the equal-split global t frameAt expects, so paintFrame, the step hooks, and #220's fused clock share one timeline.
      paintFrame(session, tAtElapsed(session.cumMs, elapsed));
      session.rafId = requestAnimationFrame(tick);
    };
    session.rafId = requestAnimationFrame(tick);
  }

  // Toggle ON: animate the sweep from the capital. Reduced motion and opts.skipSweep (the sheet resting on its verso, #174) take the at-rest path: a ~13s sweep nobody can see is not a feature.
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

  // Re-arm after a redraw with the toggle still on: rebuild against the new world and rest on the full track; only an explicit toggle-ON animates the sweep.
  function rearmVoyage(
    manifest: PlaceManifest | null,
    survey: Survey | null,
    seed: number,
    subtitle: string,
    opts: { quiet?: boolean } = {},
  ): void {
    cancelVoyageRaf();
    voyage = null;
    if (buildVoyage(manifest, survey, seed, subtitle, opts.quiet)) {
      paintFrame(voyage!, 1, false); // silent: the draw's settle needs the status to stay ""
    } else {
      dropOverlays();
      logPanel.hideLog();
    }
    // #366: a DEFERRED arm runs after rebuildVerso and is the one that inks the back face; the conductor's repaint comment in ../explorer/app.ts is the authority.
    // #174 INVARIANT: the sink's ghost and its track come from the SAME draw; a quiet mid-drag redraw freezes the whole back face (re-blobbing the ghost per frame is the ~1 MB leak #116 exists to avoid).
    if (!opts.quiet) syncRestingTrack();
  }

  function exitVoyage(): void {
    cancelVoyageRaf();
    dropOverlays();
    if (voyage) statusEl.textContent = "";
    logPanel.hideLog(); // #121: the margin log is a sibling of the mount, so remove it explicitly
    voyage = null;
    restingTrackSink?.clear(); // #174: the ink leaves the back of the sheet with the front
  }

  // #174: snap a running sweep to its resting track, both faces (a flip must never wait out a 10-16s sweep); the shownArrived diff fires once, so only the final port's line posts.
  function voyageSnapToRest(): void {
    if (!voyage) return;
    cancelVoyageRaf();
    paintFrame(voyage, 1);
    syncRestingTrack();
  }

  // Deterministic e2e hook: land the sweep at the mark's arrival at port N (origin = port 0), at rest. No-op when not voyaging.
  function voyageStepTo(portIndex: number): void {
    if (!voyage) return;
    cancelVoyageRaf();
    const legCount = voyage.legs.length;
    const clampedPort = Math.max(0, Math.min(portIndex, legCount));
    const t = legCount > 0 ? clampedPort / legCount : 0;
    paintFrame(voyage, t);
    syncRestingTrack(); // #174: a step lands the survey at rest, so the two faces agree
  }

  // #120 e2e hook and #220's timeline seam: paint an arbitrary t in [0,1]; voyageStepTo can only land ON a port and can never sample the MID-leg frames where tilt and facing vary.
  function voyagePaintAt(t: number): void {
    if (!voyage) return;
    cancelVoyageRaf();
    paintFrame(voyage, t);
    syncRestingTrack();
  }

  // e2e read hook: the current plan (or null); legs carry the router's mode alongside the logical port pair.
  function voyagePlan() {
    if (!voyage) return null;
    return {
      ports: voyage.plan.ports,
      legs: voyage.plan.legs.map((leg, i) => ({ ...leg, mode: voyage!.legs[i].mode })),
    };
  }

  // #121 e2e read hook: the margin-log snapshot, assembled by voyage-log-panel.ts.
  function voyageLog() {
    if (!voyage) return null;
    return logPanel.logSnapshot(voyage.log, voyage.logRows);
  }

  // e2e read hook: per-leg mode, water span + handoff flag (#181), and PROJECTED vertices, so a suite can find the leg that exhibits what it needs.
  function voyageLegGeometry() {
    if (!voyage) return null;
    return voyage.legs.map((l) => ({
      mode: l.mode,
      water: l.water,
      inlandHandoff: l.inlandHandoff,
      points: l.geom.points.map((p) => ({ x: p.x, y: p.y })),
    }));
  }

  // #220 seams for the fused ages driver, consumed by index.ts and never on the public engine API; paintLive writes NO sink (#174 keeps the sink rest-only).
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
    // #442: the day row the survey has reached, read from the same shownArrived count revealLog brightens against, so the live row and the ink can never disagree. Positional like revealLog, since the homecoming row shares the capital's idx.
    toldEntry: (): ToldEntry | null => {
      if (!voyage) return null;
      const entries = voyage.log.entries;
      const row = toldRow(voyage.shownArrived, entries.length);
      if (row < 0) return null;
      const e = entries[row]!;
      return { chamber: "survey", row, index: e.idx, day: e.day, text: journalText(e.text) };
    },
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
