// The Wayfarer's Passage overlay (epic #117; Sub 2 = #119, Sub 3 = #120): a per-draw
// DOM layer over the baked chart that animates the survey that drew it. A dotted track
// sets out from the capital and threads port to port behind the survey party, and the
// surveyor's dated log accumulates in the margin (#121): a chronicle-strip-style panel
// whose entries brighten as the survey reaches each port. When the sweep ends the full
// track rests on the chart until the toggle goes off.
//
// #120 replaced v1's straight lerp between ports with honest geometry: road-connected
// ports are joined by a walk along the drawn roads, ports on different landmasses by a
// path across open water. The mark knows which: a rider on the road, a ship at sea, both
// drawn in PROFILE like every other glyph on the chart (mountains, hills, trees all stand
// on a baseline at y=0). Profile glyphs have an "up", so the mark flips east/west and
// tilts north/south rather than rotating; a full rotate would lay the ship on its
// beam-ends on a due-north leg.
//
// It clones the Living Chart chassis (living-chart.js): module-private state, an overlay
// appended AFTER app.js wipes #map with innerHTML, and a requestAnimationFrame loop the
// conductor cancels on any redraw. All the deterministic math (plan, timeline, routing,
// arc length, tilt, facing) lives in the engine under src/render/, so this file is only
// projection, DOM, and animation. Download SVG blobs the pristine chart string, never
// this overlay, so the exported plate never learns it was animated.
import {
  buildVoyagePlan,
  frameAt,
  type VoyageFrame,
  type VoyagePlan,
} from "../../render/voyage.ts";
import { routeVoyage, type LegMode } from "../../render/voyage-route.ts";
import { createProjection } from "../../render/transform.ts";
import {
  buildLegGeometry,
  pointAtDistance,
  headingAt,
  tiltFor,
  resolveFacing,
  netFacing,
  legDurations,
  type Facing,
  type LegGeometry,
} from "../../render/voyage-geometry.ts";
import { paintVersoTrack, clearVersoTrack } from "./verso.ts";
import { buildLogPanel, revealLog, hideLog, logSnapshot } from "./voyage-log-panel.ts";
import type { PlaceManifest } from "../../render/place-manifest.ts";
import type { Survey } from "../../render/survey.ts";
import type { VoyageLog } from "../../world/voyage-log.ts";
import type { Pt } from "../../core/rdp.ts";

const mapDiv = document.getElementById("map") as HTMLElement;
const versoEl = document.getElementById("verso") as HTMLElement;
const statusEl = document.getElementById("status") as HTMLElement;
const SVG_NS = "http://www.w3.org/2000/svg";

// The sweep no longer runs a fixed duration split equally: v1 did that, so a long
// crossing blurred past while a near-town hop crawled. Each leg is now timed by its
// length (legDurations), anchored to the near-town speed, so the whole sweep grows with
// the world (capped inside legDurations). The pacing knobs live in voyage-geometry.js.

// One drawn piece of a mark: a path (d) or a circle (cx, cy, r), optionally classed.
type MarkPart =
  | { readonly d: string; readonly circle?: undefined; readonly cls?: string }
  | { readonly circle: readonly [number, number, number]; readonly d?: undefined; readonly cls?: string };

// Both marks are drawn in PROFILE, pointing +x (bow / muzzle east), with the origin on
// their ground contact line: the ship's waterline, the horse's hooves. So the mark stands
// ON its track point the way a mountain stands on its own, and the tilt pivots about that
// contact point. Sized in viewBox pixels against the 1500px chart.
// A cog under sail: hull, stern castle, standing rigging, a square sail bellying east,
// and a pennant. About 40 units wide against a chart whose peaks run 18 to 20.
const SHIP_PARTS: ReadonlyArray<MarkPart> = [
  { d: "M -17 -5 Q -19 -1 -13 4 L 11 4 Q 17 1 17 -5 Z" },
  { d: "M -17 -5 L -17 -10 L -11 -10 L -11 -5 Z" },
  { d: "M -1 -5 L -1 -23 M -9 -19 L 8 -19 M 17 -3 L 21 -6", cls: "rig" },
  { d: "M -8 -19 L 7 -19 Q 12 -13 7 -7 L -8 -7 Q -4 -13 -8 -19 Z" },
  { d: "M -1 -23 L 6 -24 L -1 -25.5 Z", cls: "ink" },
];
// A horse walking east under a cloaked, hatted rider, in profile with the hooves on
// the baseline: a flowing tail, the barrel, the arched neck rising to a small eared
// head, four legs mid-stride, then the rider (torso, hatted head, hat brim, rein).
const RIDER_PARTS: ReadonlyArray<MarkPart> = [
  { d: "M -13 -11 Q -18 -10 -21 -4", cls: "tail" },
  { d: "M -13 -11 Q -14 -14 -10 -14 L 4 -14 Q 8 -14 9 -11 L 9 -8 Q 8 -6 3 -6 L -8 -6 Q -12 -6 -13 -11 Z" },
  { d: "M 5 -13 Q 9 -15 12 -21 Q 13 -24 16 -24 L 19 -22 Q 17 -20 15 -20 Q 14 -18 13 -15 Q 11 -12 6 -12 Z" },
  { d: "M 15 -24 L 16 -27 M 17 -23 L 19 -26", cls: "detail" },
  { d: "M -9 -6 L -10 0 M -5 -6 L -6 0 M 3 -7 L 4 0 M 7 -8 L 8 0", cls: "leg" },
  { d: "M -3 -13 L -4 -19 Q -1 -21 2 -20 L 3 -13 Z" },
  { circle: [-0.5, -22, 2.3], cls: "ink" },
  { d: "M -3.4 -23.4 L 2.6 -23.4", cls: "detail" },
  { d: "M 2 -17 Q 7 -18 11 -18", cls: "detail" },
];

// A routed leg as the overlay holds it: the router's mode plus the projected
// (chart-pixel) polyline with its precomputed arc lengths.
interface SessionLeg {
  mode: LegMode;
  geom: LegGeometry;
}

interface Session {
  plan: VoyagePlan;
  legs: SessionLeg[];
  log: VoyageLog;
  logRows: HTMLLIElement[];
  cumMs: number[];
  totalMs: number;
  originPt: Pt;
  svg: SVGSVGElement;
  trackEl: SVGPolylineElement;
  shipG: SVGGElement;
  riderG: SVGGElement;
  activeMark: SVGGElement | null;
  shownMode: LegMode | "";
  facing: Facing;
  rafId: number;
  shownArrived: number;
}

// The current voyage session, or null when the toggle is off. Rebuilt every draw
// because mapDiv.innerHTML wipes #map's children (the overlay among them).
let voyage: Session | null = null;

function prefersReduce(): boolean {
  return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

export function cancelVoyageRaf(): void {
  if (voyage && voyage.rafId) {
    cancelAnimationFrame(voyage.rafId);
    voyage.rafId = 0;
  }
}

// Drop the session after a redraw with the toggle off. mapDiv.innerHTML already removed
// the overlay with the old chart, but the #121 margin log is a SIBLING of #map, so it
// survives that wipe and must be hidden explicitly.
export function clearVoyage(): void {
  hideLog();
  voyage = null;
}

function makeMark(className: string, parts: ReadonlyArray<MarkPart>): SVGGElement {
  const g = document.createElementNS(SVG_NS, "g");
  g.setAttribute("class", className);
  for (const part of parts) {
    const node = document.createElementNS(SVG_NS, part.circle ? "circle" : "path");
    if (part.circle) {
      const [cx, cy, r] = part.circle;
      node.setAttribute("cx", String(cx));
      node.setAttribute("cy", String(cy));
      node.setAttribute("r", String(r));
    } else {
      node.setAttribute("d", part.d);
    }
    if (part.cls) node.setAttribute("class", part.cls);
    g.appendChild(node);
  }
  return g;
}

// Build the plan + routed geometry + overlay for a manifest and append it into #map.
// Returns false when there is nothing to survey (no capital), so the caller can bail.
function buildVoyage(
  manifest: PlaceManifest | null,
  survey: Survey | null,
  seed: number,
  subtitle: string,
): boolean {
  if (!manifest || !manifest.places || !survey) return false;
  const plan = buildVoyagePlan(manifest.places, manifest.presentYear);
  if (!plan.ports.length) return false;

  const sites = manifest.places.map((p) => ({ idx: p.idx, x: p.gx, y: p.gy }));
  const routed = routeVoyage(plan.legs, sites, survey);

  // Grid space -> chart pixels. This margin rule mirrors place-manifest.ts and
  // map-renderer.ts exactly; drift here would slide the track off the drawn roads.
  const wPx = manifest.widthPx;
  const proj = createProjection(survey.gridW, survey.gridH, wPx, Math.round(wPx * 0.045));
  const legs: SessionLeg[] = routed.map((leg) => ({
    mode: leg.mode,
    geom: buildLegGeometry(leg.points.map((p) => ({ x: proj.px(p.x), y: proj.py(p.y) }))),
  }));

  // Per-leg animation time by length (#120 follow-up), plus the cumulative start times
  // play() reads to map real elapsed ms to which leg the mark is on. cumMs has legs+1
  // entries: cumMs[i] is when leg i begins, cumMs[legs] is the whole sweep.
  const durations = legDurations(legs.map((l) => l.geom.total));
  const cumMs = [0];
  for (const d of durations) cumMs.push(cumMs[cumMs.length - 1] + d);
  const totalMs = cumMs[cumMs.length - 1];

  const byIdx = new Map(manifest.places.map((p) => [p.idx, p]));
  const origin = byIdx.get(plan.ports[0].idx)!;
  const originPt = { x: proj.px(origin.gx), y: proj.py(origin.gy) };

  // #121 The margin log. Each port carries the mode of the leg that ARRIVED at it (the
  // origin has none, so it departs), so the surveyor's voice reads a ride, a sail, or a
  // setting-out. The richer, seed-forked prose lives in the engine (world/voyage-log.js);
  // the plan's own port.logLine is the pure Sub-1 line and is no longer displayed.
  const logPorts = plan.ports.map((port, i) => {
    const pm = byIdx.get(port.idx)!;
    return {
      idx: pm.idx, name: pm.name, kind: pm.kind, founded: pm.founded,
      arrivalMode: i === 0 ? null : routed[i - 1].mode,
    };
  });
  const { log, rows: logRows } = buildLogPanel(logPorts, manifest.presentYear, seed, subtitle);

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "voyage-overlay");
  svg.setAttribute("viewBox", `0 0 ${wPx} ${manifest.heightPx}`);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("aria-hidden", "true"); // #121: the margin-log panel + one #status summary carry the a11y payload
  const trackEl = document.createElementNS(SVG_NS, "polyline");
  trackEl.setAttribute("class", "voyage-track");
  const shipG = makeMark("voyage-ship", SHIP_PARTS);
  const riderG = makeMark("voyage-rider", RIDER_PARTS);
  // INVARIANT: the marks are SIBLINGS of trackEl, never inside it. syncVersoTrack feeds
  // the verso trackEl's `points` verbatim, so a mark nested in the track would bleed
  // through to the back of the sheet, which #174 ruled it must never do.
  svg.append(trackEl, shipG, riderG);
  mapDiv.appendChild(svg);

  voyage = {
    plan,
    legs,
    log,
    logRows,
    cumMs,
    totalMs,
    originPt,
    svg,
    trackEl,
    shipG,
    riderG,
    activeMark: null,
    shownMode: "",
    // The mark's facing carries across frames and legs so a switchbacking road cannot
    // flip it (voyage-geometry.js resolveFacing). Seeded from the first leg's overall
    // sense, and rebuilt with the session, so no facing leaks between worlds.
    facing: legs.length ? netFacing(legs[0].geom.points) : 1,
    rafId: 0,
    shownArrived: 0,
  };
  return true;
}

const fmt = (p: Pt) => `${p.x},${p.y}`;

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

/** Show the glyph this leg's mode calls for. Toggled only on change, never per frame. */
function showMark(session: Session, mode: LegMode): void {
  if (mode === session.shownMode) return;
  const useShip = mode === "sea";
  // The SVG `display` presentation attribute, not [hidden]: SVG elements do not honour
  // the HTML hidden attribute through the UA stylesheet.
  session.shipG.setAttribute("display", useShip ? "inline" : "none");
  session.riderG.setAttribute("display", useShip ? "none" : "inline");
  session.activeMark = useShip ? session.shipG : session.riderG;
  session.shownMode = mode;
}

// Paint one frame at progress t (0..1): grow the track through every arrived port plus
// the partial current leg, move the mark to its position/facing/tilt, and brighten the
// margin-log rows reached so far. On the LIVE completion (postLog) it posts the one
// #status summary. A resting re-arm after a redraw paints silently (postLog false): it
// still brightens the log, but never stomps the "" the draw's own settle signal depends on.
function paintFrame(session: Session, t: number, postLog = true): void {
  const legCount = session.legs.length;
  const f = frameAt(legCount, t);

  let pos: Pt;
  let tiltDeg = 0;
  if (legCount <= 0) {
    pos = session.originPt;
    showMark(session, "straight");
  } else {
    const { geom, mode } = session.legs[f.legIndex];
    const s = f.legT * geom.total;
    pos = pointAtDistance(geom, s);
    // The heading is a chord across a lookahead window, not the raw segment under the
    // mark. That is what keeps a switchbacking road from flipping the rider every few
    // frames, and it damps the tilt through a bend rather than snapping it.
    const hd = headingAt(geom, s);
    tiltDeg = tiltFor(hd.x, hd.y);
    session.facing = resolveFacing(hd.x, Math.hypot(hd.x, hd.y), session.facing);
    showMark(session, mode);
  }

  session.trackEl.setAttribute("points", trackString(session, f));
  // scale() before rotate(): the mirror negates x and preserves y, so one unsigned tilt
  // lifts the bow whether the mark faces east or west. See voyage-geometry.js tiltFor.
  session.activeMark!.setAttribute(
    "transform",
    `translate(${pos.x} ${pos.y}) scale(${session.facing} 1) rotate(${tiltDeg})`,
  );

  if (f.arrived !== session.shownArrived) {
    session.shownArrived = f.arrived;
    // The margin log brightens per arrival ALWAYS, even on a silent re-arm (it is visual,
    // not the live region). #121: the single polite #status summary is the whole survey's
    // announcement, posted only on the LIVE completion (postLog) so a silent re-arm keeps
    // #status "" for the draw's settle signal and the e2e waitSettled. On any earlier OR
    // backward-stepped resting frame (the deterministic step hooks can move `arrived` DOWN)
    // #status returns to "", so a stale summary never lingers at a mid-survey rest.
    revealLog(session.logRows, f.arrived);
    if (postLog) {
      statusEl.textContent = f.arrived >= session.plan.ports.length ? session.log.summary : "";
    }
  }
}

// #174: mirror the recto track onto the verso's back face, reading the very same `points`
// string paintFrame just wrote, so the two faces can never disagree.
//
// INVARIANT: the verso track is STATIC, never live. It is painted only where the survey
// comes to REST (a sweep ending, a flip snapping it to rest, a silent re-arm after a
// redraw) and removed on exit, never from the rAF tick. Decision 2 (a flip snaps the
// voyage to rest first) is what makes that safe: no flip can land mid-sweep, so the back
// face is never revealed showing a half-drawn track. Painting per frame would also churn
// layout on a hidden face 60 times a second for nothing.
//
// It stays glyph-agnostic: only trackEl's polyline crosses over, never the ship or the
// rider. The track is ink the surveyor laid on the recto; the mark is the survey itself.
//
// It posts nothing to #status, so it is safe inside a settle (the draw's settle signal and
// the e2e waitSettled both key on #status === "").
export function syncVersoTrack(): void {
  if (!voyage) { clearVersoTrack(versoEl); return; }
  paintVersoTrack(
    versoEl,
    voyage.trackEl.getAttribute("points") as string,
    voyage.svg.getAttribute("viewBox") as string,
  );
}

function play(session: Session): void {
  const legCount = session.legs.length;
  // A one-port survey (no legs) has nothing to sweep: rest at the origin at once.
  if (legCount <= 0 || session.totalMs <= 0) {
    paintFrame(session, 1);
    syncVersoTrack();
    return;
  }
  const begin = performance.now();
  const tick = (now: number) => {
    if (!voyage || voyage !== session || !session.rafId) return; // superseded or cancelled
    const elapsed = now - begin;
    if (elapsed >= session.totalMs) {
      paintFrame(session, 1);
      session.rafId = 0; // the full track now rests on the chart
      syncVersoTrack(); // #174: at rest, so the ink may bleed through to the back
      return;
    }
    // Which leg is the mark on, and how far along it? Convert to the equal-split global
    // t that frameAt expects (t = (legIndex + legT)/legCount), so paintFrame and the
    // deterministic step hooks keep sharing one timeline; only the pacing differs.
    let i = 0;
    while (i < legCount - 1 && session.cumMs[i + 1] <= elapsed) i++;
    const dur = session.cumMs[i + 1] - session.cumMs[i];
    const legT = dur > 0 ? Math.min((elapsed - session.cumMs[i]) / dur, 1) : 0;
    paintFrame(session, (i + legT) / legCount);
    session.rafId = requestAnimationFrame(tick);
  };
  session.rafId = requestAnimationFrame(tick);
}

// Toggle voyage ON: build the survey and animate the sweep from the capital. Under
// reduced motion the full track and the final port's line appear at once, no sweep.
// #174: opts.skipSweep takes the same at-rest path when the sheet is resting on its verso.
// The sweep is a recto ceremony: a 12 second animation nobody can see, narrating into
// #status the whole way, is not a feature. The caller (app.js) owns the flipped state.
//
// During a sweep the verso carries NO track: exitVoyage cleared it above, and it is
// repainted when the survey comes to rest. A flip mid-sweep snaps to rest first, so the
// back face never turns into view empty.
export function applyVoyage(
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
    syncVersoTrack();
    return;
  }
  paintFrame(voyage!, 0);
  play(voyage!);
}

// Re-arm after a redraw while the toggle stayed on: rebuild against the new world
// and rest on the full track. Only an explicit toggle-ON animates the sweep, so a
// style turn or a sea-level nudge never replays the whole voyage.
export function rearmVoyage(
  manifest: PlaceManifest | null,
  survey: Survey | null,
  seed: number,
  subtitle: string,
  opts: { quiet?: boolean } = {},
): void {
  cancelVoyageRaf();
  voyage = null;
  if (!buildVoyage(manifest, survey, seed, subtitle)) { hideLog(); return; }
  paintFrame(voyage!, 1, false); // silent: the draw's settle needs #status to stay ""
  // #174: repaint the back face too. renderVerso's replaceChildren wipes the verso track
  // on every draw, exactly as mapDiv.innerHTML wipes the recto overlay, so BOTH faces have
  // to be rebuilt. In app.js's settle path rebuildVerso runs AFTER this and wipes it again,
  // which is why app.js calls syncVersoTrack once more on the far side of that wipe.
  //
  // INVARIANT: the verso's ghost and its track always come from the SAME draw. A quiet
  // mid-drag redraw (the sea-level slider) deliberately does NOT rebuild the ghost, because
  // re-blobbing the chart every frame is the ~1 MB per redraw leak #116 exists to avoid. So
  // the track must not be repainted for the new world either: a fresh survey struck over a
  // stale coastline registers with nothing. Leave the whole back face frozen on the last
  // non-quiet draw; the drag's release redraw is not quiet and refreshes both together.
  if (!opts.quiet) syncVersoTrack();
}

// Toggle voyage OFF: cancel the sweep, remove the overlay, and clear the log line so
// #map is byte-identical to today (only the place overlay remains).
export function exitVoyage(): void {
  cancelVoyageRaf();
  const existing = mapDiv.querySelector(".voyage-overlay");
  if (existing) existing.remove();
  if (voyage) statusEl.textContent = "";
  hideLog(); // #121: the margin log is a sibling of #map, so remove it explicitly
  voyage = null;
  clearVersoTrack(versoEl); // #174: the ink leaves the back of the sheet with the front
}

// #174: snap a running sweep to its resting track, both faces, and stay there. Called by
// the flip: a 12 second sweep must never hold the sheet hostage, and a Turn button that
// goes dead for that long reads as a bug rather than as a rule, so interaction interrupts
// the animation instead (the same idiom as the scrubber's drag pausing Play).
//
// paintFrame's shownArrived diff fires exactly ONCE here, so #status posts only the final
// port's line, never a burst of every port the snap skipped. No-op when not voyaging, and
// a no-op on an already-resting voyage (no diff, so nothing is posted).
export function voyageSnapToRest(): void {
  if (!voyage) return;
  cancelVoyageRaf();
  paintFrame(voyage, 1);
  syncVersoTrack();
}

// Deterministic e2e hook: jump the sweep to the mark's arrival at port N (the origin
// is port 0), mirroring how the scrubber is driven through its slider rather than its
// Play timer. No-op when not voyaging.
export function voyageStepTo(portIndex: number): void {
  if (!voyage) return;
  cancelVoyageRaf();
  const legCount = voyage.legs.length;
  const clampedPort = Math.max(0, Math.min(portIndex, legCount));
  const t = legCount > 0 ? clampedPort / legCount : 0;
  paintFrame(voyage, t);
  syncVersoTrack(); // #174: a step lands the survey at rest, so the two faces agree
}

// #120 e2e hook: paint an arbitrary progress t in [0,1]. voyageStepTo can only land ON a
// port (legT = 0), so it can never sample a MID-leg frame, which is exactly where the
// tilt varies and where a switchbacking road would flicker the rider's facing. Like
// voyageStepTo this lands the survey at a resting frame, never inside the rAF loop.
export function voyagePaintAt(t: number): void {
  if (!voyage) return;
  cancelVoyageRaf();
  paintFrame(voyage, t);
  syncVersoTrack();
}

// e2e read hook: the current plan (or null), so a suite can assert the itinerary. Legs
// carry the router's `mode` alongside the logical port pair.
export function voyagePlan() {
  if (!voyage) return null;
  return {
    ports: voyage.plan.ports,
    legs: voyage.plan.legs.map((leg, i) => ({ ...leg, mode: voyage!.legs[i].mode })),
  };
}

// #121 e2e read hook: the margin log (attribution, summary, entries) plus how many rows
// are currently revealed and whether the panel is shown, so a suite can assert the mode-
// aware prose and the reveal-per-arrival without racing the rAF loop. The payload (and the
// panel's visibility) is assembled by voyage-log-panel.js; this stays exported here because
// app.js wires it to window.__vellumVoyageLog from "./voyage.js".
export function voyageLog() {
  if (!voyage) return null;
  return logSnapshot(voyage.log, voyage.logRows);
}

// e2e read hook: each leg's mode plus its PROJECTED (chart-pixel) vertices, so a suite can
// find a genuinely switchbacking road leg to prove the anti-flicker wiring, rather than
// assuming the first road leg bends.
export function voyageLegGeometry() {
  if (!voyage) return null;
  return voyage.legs.map((l) => ({ mode: l.mode, points: l.geom.points.map((p) => ({ x: p.x, y: p.y })) }));
}
