// The Wayfarer's Passage overlay (epic #117; Sub 2 = #119, Sub 3 = #120): a per-draw
// DOM layer over the baked chart that animates the survey that drew it. A dotted track
// sets out from the capital and threads port to port behind the survey party, and each
// port's dated log line lands in #status as it arrives. When the sweep ends the full
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
import { buildVoyagePlan, frameAt } from "./engine/render/voyage.js";
import { routeVoyage } from "./engine/render/voyage-route.js";
import { createProjection } from "./engine/render/transform.js";
import {
  buildLegGeometry,
  pointAtDistance,
  headingAt,
  tiltFor,
  resolveFacing,
  netFacing,
} from "./engine/render/voyage-geometry.js";
import { paintVersoTrack, clearVersoTrack } from "./verso.js";

const mapDiv = document.getElementById("map");
const versoEl = document.getElementById("verso");
const statusEl = document.getElementById("status");
const SVG_NS = "http://www.w3.org/2000/svg";

// The full sweep runs about 12 seconds, split equally across legs so the survey
// arrives at a steady cadence (one log line per port), whatever each leg's length.
const SWEEP_MS = 12000;

// Both marks are drawn in PROFILE, pointing +x (bow / muzzle east), with the origin on
// their ground contact line: the ship's waterline, the horse's hooves. So the mark stands
// ON its track point the way a mountain stands on its own, and the tilt pivots about that
// contact point. Sized in viewBox pixels against the 1500px chart.
// A cog under sail: hull, stern castle, standing rigging, a square sail bellying east,
// and a pennant. About 40 units wide against a chart whose peaks run 18 to 20.
const SHIP_PARTS = [
  { d: "M -17 -5 Q -19 -1 -13 4 L 11 4 Q 17 1 17 -5 Z" },
  { d: "M -17 -5 L -17 -10 L -11 -10 L -11 -5 Z" },
  { d: "M -1 -5 L -1 -23 M -9 -19 L 8 -19 M 17 -3 L 21 -6", cls: "rig" },
  { d: "M -8 -19 L 7 -19 Q 12 -13 7 -7 L -8 -7 Q -4 -13 -8 -19 Z" },
  { d: "M -1 -23 L 6 -24 L -1 -25.5 Z", cls: "ink" },
];
// A horse walking east under a cloaked, hatted rider. Tail, barrel, arched neck and head,
// four legs mid-stride, the rider, then the fine work (hat brim, rein, ears).
const RIDER_PARTS = [
  { d: "M -9 -13 Q -14 -12 -14.5 -5", cls: "tail" },
  { d: "M -9 -14 Q -2 -16.5 6 -13.5 Q 8.5 -12 8 -9 Q 0 -6.5 -8 -8 Q -11 -10 -9 -14 Z" },
  { d: "M 4 -13 Q 9 -14.5 11 -19 Q 12 -22 15 -21.5 Q 17.5 -21 17 -19 Q 16.5 -17.5 14 -17 Q 11.5 -15 10 -11 Z" },
  { d: "M 5 -9 L 5.5 -4 L 7.5 0 M 2.5 -9 L 2 -4 L 3 0 M -7.5 -10 Q -9 -6 -7 -4 L -6.5 0 M -4.5 -10 Q -6 -6 -4.2 -4 L -3.8 0", cls: "leg" },
  { d: "M -1.5 -13.5 L -3 -18.5 Q -1 -20 1.5 -19.8 L 2.5 -13.5 Z" },
  { circle: [0.4, -21.6, 2.1], cls: "ink" },
  { d: "M -2.4 -22.8 L 3.4 -22.8 M 1.5 -17.5 Q 6 -17 10 -16.5 M 13.8 -21.6 L 14.3 -23.6 M 15.6 -21.4 L 16.6 -23.2", cls: "detail" },
];

// The current voyage session, or null when the toggle is off. Rebuilt every draw
// because mapDiv.innerHTML wipes #map's children (the overlay among them).
let voyage = null;

function prefersReduce() {
  return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

export function cancelVoyageRaf() {
  if (voyage && voyage.rafId) {
    cancelAnimationFrame(voyage.rafId);
    voyage.rafId = 0;
  }
}

// Drop the session without touching the DOM: used after a redraw with the toggle
// off, where mapDiv.innerHTML already removed the overlay with the old chart.
export function clearVoyage() {
  voyage = null;
}

function makeMark(className, parts) {
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
function buildVoyage(manifest, survey) {
  if (!manifest || !manifest.places || !survey) return false;
  const plan = buildVoyagePlan(manifest.places, manifest.presentYear);
  if (!plan.ports.length) return false;

  const sites = manifest.places.map((p) => ({ idx: p.idx, x: p.gx, y: p.gy }));
  const routed = routeVoyage(plan.legs, sites, survey);

  // Grid space -> chart pixels. This margin rule mirrors place-manifest.ts and
  // map-renderer.ts exactly; drift here would slide the track off the drawn roads.
  const wPx = manifest.widthPx;
  const proj = createProjection(survey.gridW, survey.gridH, wPx, Math.round(wPx * 0.045));
  const legs = routed.map((leg) => ({
    mode: leg.mode,
    geom: buildLegGeometry(leg.points.map((p) => ({ x: proj.px(p.x), y: proj.py(p.y) }))),
  }));

  const byIdx = new Map(manifest.places.map((p) => [p.idx, p]));
  const origin = byIdx.get(plan.ports[0].idx);
  const originPt = { x: proj.px(origin.gx), y: proj.py(origin.gy) };

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "voyage-overlay");
  svg.setAttribute("viewBox", `0 0 ${wPx} ${manifest.heightPx}`);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("aria-hidden", "true"); // the dated log lines in #status carry the a11y payload
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

const fmt = (p) => `${p.x},${p.y}`;

/** The track drawn so far: every vertex of every completed leg, plus the partial one. */
function trackString(session, f) {
  if (session.legs.length === 0) return fmt(session.originPt);
  const out = [];
  const push = (p) => {
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
function showMark(session, mode) {
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
// the partial current leg, move the mark to its position/facing/tilt, and (when postLog
// is set) post the newly arrived port's log line to #status. A resting re-arm after a
// redraw paints silently (postLog false), so it never stomps the "" that the draw's own
// settle signal depends on.
function paintFrame(session, t, postLog = true) {
  const legCount = session.legs.length;
  const f = frameAt(legCount, t);

  let pos;
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
  session.activeMark.setAttribute(
    "transform",
    `translate(${pos.x} ${pos.y}) scale(${session.facing} 1) rotate(${tiltDeg})`,
  );

  if (postLog && f.arrived !== session.shownArrived) {
    session.shownArrived = f.arrived;
    const port = session.plan.ports[f.arrived - 1];
    if (port) statusEl.textContent = port.logLine;
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
export function syncVersoTrack() {
  if (!voyage) { clearVersoTrack(versoEl); return; }
  paintVersoTrack(versoEl, voyage.trackEl.getAttribute("points"), voyage.svg.getAttribute("viewBox"));
}

function play(session) {
  const begin = performance.now();
  const tick = (now) => {
    if (!voyage || voyage !== session || !session.rafId) return; // superseded or cancelled
    const t = Math.min((now - begin) / SWEEP_MS, 1);
    paintFrame(session, t);
    if (t >= 1) {
      session.rafId = 0; // the full track now rests on the chart
      syncVersoTrack(); // #174: at rest, so the ink may bleed through to the back
      return;
    }
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
export function applyVoyage(manifest, survey, opts = {}) {
  exitVoyage();
  if (!buildVoyage(manifest, survey)) return;
  if (opts.skipSweep || prefersReduce()) {
    paintFrame(voyage, 1);
    syncVersoTrack();
    return;
  }
  paintFrame(voyage, 0);
  play(voyage);
}

// Re-arm after a redraw while the toggle stayed on: rebuild against the new world
// and rest on the full track. Only an explicit toggle-ON animates the sweep, so a
// style turn or a sea-level nudge never replays the whole voyage.
export function rearmVoyage(manifest, survey, opts = {}) {
  cancelVoyageRaf();
  voyage = null;
  if (!buildVoyage(manifest, survey)) return;
  paintFrame(voyage, 1, false); // silent: the draw's settle needs #status to stay ""
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
export function exitVoyage() {
  cancelVoyageRaf();
  const existing = mapDiv.querySelector(".voyage-overlay");
  if (existing) existing.remove();
  if (voyage) statusEl.textContent = "";
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
export function voyageSnapToRest() {
  if (!voyage) return;
  cancelVoyageRaf();
  paintFrame(voyage, 1);
  syncVersoTrack();
}

// Deterministic e2e hook: jump the sweep to the mark's arrival at port N (the origin
// is port 0), mirroring how the scrubber is driven through its slider rather than its
// Play timer. No-op when not voyaging.
export function voyageStepTo(portIndex) {
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
export function voyagePaintAt(t) {
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
    legs: voyage.plan.legs.map((leg, i) => ({ ...leg, mode: voyage.legs[i].mode })),
  };
}
