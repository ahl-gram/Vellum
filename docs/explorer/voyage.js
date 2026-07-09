// The Wayfarer's Passage overlay (epic #117, Sub 2 = #119): a per-draw DOM layer
// over the baked chart that animates the survey that drew it. A dotted track sets
// out from the capital and threads port to port behind a little ship, and each
// port's dated log line lands in #status as the ship arrives. When the sweep ends
// the full track rests on the chart until the toggle goes off.
//
// It clones the Living Chart chassis (living-chart.js): module-private state, an
// overlay appended AFTER app.js wipes #map with innerHTML, and a requestAnimation-
// Frame loop the conductor cancels on any redraw. The deterministic plan + timeline
// math live in the engine (src/render/voyage.ts), so this file is only geometry,
// DOM, and animation. Download SVG blobs the pristine chart string, never this
// overlay, so the exported plate never learns it was animated.
import { buildVoyagePlan, frameAt } from "./engine/render/voyage.js";

const mapDiv = document.getElementById("map");
const statusEl = document.getElementById("status");
const SVG_NS = "http://www.w3.org/2000/svg";

// The full sweep runs about 12 seconds, split equally across legs so the survey
// arrives at a steady cadence (one log line per port).
const SWEEP_MS = 12000;

// The little survey ship, drawn top-down and pointing +x (its bow to the east), so
// a rotate() to the leg's heading reads right at any bearing. Sized in viewBox
// pixels (~40 wide against the 1500px chart, about 2.5% of the width).
const SHIP_HULL = "M 20 0 C 8 -8, -8 -9, -18 -6 L -18 6 C -8 9, 8 8, 20 0 Z";

// The current voyage session, or null when the toggle is off. Rebuilt every draw
// because mapDiv.innerHTML wipes #map's children (the overlay among them).
let voyage = null;
// { plan, points:[{x,y}], svg, trackEl, ship, rafId, shownArrived }

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

function makeShip() {
  const g = document.createElementNS(SVG_NS, "g");
  g.setAttribute("class", "voyage-ship");
  const hull = document.createElementNS(SVG_NS, "path");
  hull.setAttribute("d", SHIP_HULL);
  const mast = document.createElementNS(SVG_NS, "circle");
  mast.setAttribute("r", "2.6");
  mast.setAttribute("cx", "0");
  mast.setAttribute("cy", "0");
  mast.setAttribute("class", "voyage-mast");
  g.append(hull, mast);
  return g;
}

// Build the plan + overlay for a manifest and append it into #map. Returns false
// when there is nothing to survey (no capital), so the caller can bail cleanly.
function buildVoyage(manifest) {
  if (!manifest || !manifest.places) return false;
  const plan = buildVoyagePlan(manifest.places, manifest.presentYear);
  if (!plan.ports.length) return false;
  const byIdx = new Map(manifest.places.map((p) => [p.idx, p]));
  const wPx = manifest.widthPx;
  const hPx = manifest.heightPx;
  const points = plan.ports.map((port) => {
    const p = byIdx.get(port.idx);
    return { x: p.nx * wPx, y: p.ny * hPx };
  });

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "voyage-overlay");
  svg.setAttribute("viewBox", `0 0 ${wPx} ${hPx}`);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("aria-hidden", "true"); // the dated log lines in #status carry the a11y payload
  const trackEl = document.createElementNS(SVG_NS, "polyline");
  trackEl.setAttribute("class", "voyage-track");
  const ship = makeShip();
  svg.append(trackEl, ship);
  mapDiv.appendChild(svg);

  voyage = { plan, points, svg, trackEl, ship, rafId: 0, shownArrived: 0 };
  return true;
}

// Paint one frame at progress t (0..1): grow the track through every arrived port
// plus the partial current leg, move the ship to its heading, and (when postLog is
// set) post the newly arrived port's log line to #status. A resting re-arm after a
// redraw paints silently (postLog false), so it never stomps the "" that the draw's
// own settle signal depends on.
function paintFrame(session, t, postLog = true) {
  const legCount = session.plan.legs.length;
  const f = frameAt(legCount, t);
  const { points } = session;

  let mx;
  let my;
  let angleDeg = 0;
  if (legCount <= 0) {
    mx = points[0].x;
    my = points[0].y;
  } else {
    const a = points[f.legIndex];
    const b = points[f.legIndex + 1];
    mx = a.x + (b.x - a.x) * f.legT;
    my = a.y + (b.y - a.y) * f.legT;
    angleDeg = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
  }

  const coords = [];
  const upto = legCount <= 0 ? 0 : f.legIndex;
  for (let i = 0; i <= upto; i++) coords.push(`${points[i].x},${points[i].y}`);
  if (legCount > 0) coords.push(`${mx},${my}`);
  session.trackEl.setAttribute("points", coords.join(" "));
  session.ship.setAttribute("transform", `translate(${mx} ${my}) rotate(${angleDeg})`);

  if (postLog && f.arrived !== session.shownArrived) {
    session.shownArrived = f.arrived;
    const port = session.plan.ports[f.arrived - 1];
    if (port) statusEl.textContent = port.logLine;
  }
}

function play(session) {
  const begin = performance.now();
  const tick = (now) => {
    if (!voyage || voyage !== session || !session.rafId) return; // superseded or cancelled
    const t = Math.min((now - begin) / SWEEP_MS, 1);
    paintFrame(session, t);
    if (t >= 1) {
      session.rafId = 0; // the full track now rests on the chart
      return;
    }
    session.rafId = requestAnimationFrame(tick);
  };
  session.rafId = requestAnimationFrame(tick);
}

// Toggle voyage ON: build the survey and animate the sweep from the capital. Under
// reduced motion the full track and the final port's line appear at once, no sweep.
export function applyVoyage(manifest) {
  exitVoyage();
  if (!buildVoyage(manifest)) return;
  if (prefersReduce()) {
    paintFrame(voyage, 1);
    return;
  }
  paintFrame(voyage, 0);
  play(voyage);
}

// Re-arm after a redraw while the toggle stayed on: rebuild against the new world
// and rest on the full track. Only an explicit toggle-ON animates the sweep, so a
// style turn or a sea-level nudge never replays the whole voyage.
export function rearmVoyage(manifest) {
  cancelVoyageRaf();
  voyage = null;
  if (!buildVoyage(manifest)) return;
  paintFrame(voyage, 1, false); // silent: the draw's settle needs #status to stay ""
}

// Toggle voyage OFF: cancel the sweep, remove the overlay, and clear the log line so
// #map is byte-identical to today (only the place overlay remains).
export function exitVoyage() {
  cancelVoyageRaf();
  const existing = mapDiv.querySelector(".voyage-overlay");
  if (existing) existing.remove();
  if (voyage) statusEl.textContent = "";
  voyage = null;
}

// Deterministic e2e hook: jump the sweep to the ship's arrival at port N (the origin
// is port 0), mirroring how the scrubber is driven through its slider rather than its
// Play timer. No-op when not voyaging.
export function voyageStepTo(portIndex) {
  if (!voyage) return;
  cancelVoyageRaf();
  const legCount = voyage.plan.legs.length;
  const clampedPort = Math.max(0, Math.min(portIndex, legCount));
  const t = legCount > 0 ? clampedPort / legCount : 0;
  paintFrame(voyage, t);
}

// e2e read hook: the current plan (or null), so a suite can assert the itinerary.
export function voyagePlan() {
  return voyage ? voyage.plan : null;
}
