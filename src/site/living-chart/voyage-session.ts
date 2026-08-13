// The voyage session builder: everything that PREPARES a survey before a single frame
// paints. Plan + tour order (#184/#275), routed geometry (#120), grid -> chart
// projection, the margin log's rows (#121), and the overlay svg's construction. Split
// from voyage.ts at #191 along the file's own seam: this module builds the session
// record, voyage.ts animates it.
import {
  applyTourOrder,
  buildVoyagePlan,
  reorderPlanByTravel,
  type VoyagePlan,
} from "../../render/voyage.ts";
import { prepareVoyageRouter, type LegMode, type VoyageRouter } from "../../render/voyage-route.ts";
import type { WaterSpan } from "../../render/voyage-water.ts";
import { createProjection } from "../../render/transform.ts";
import {
  buildLegGeometry,
  netFacing,
  legDurations,
  type Facing,
  type LegGeometry,
  type MarkGlyph,
} from "../../render/voyage-geometry.ts";
import { SHIP_PARTS, RIDER_PARTS, makeMark } from "./voyage-marks.ts";
import type { VoyageLogPanel } from "./voyage-log-panel.ts";
import type { PlaceManifest } from "../../render/place-manifest.ts";
import { surveyFingerprint, type Survey } from "../../render/survey.ts";
import type { VoyageLog } from "../../world/voyage-log.ts";
import type { Pt } from "../../core/rdp.ts";

const SVG_NS = "http://www.w3.org/2000/svg";

// A routed leg as the overlay holds it: the router's mode and water span (#181) plus
// the projected (chart-pixel) polyline with its precomputed arc lengths. The span's
// fractions carry over from grid space unchanged because the projection is uniform.
export interface SessionLeg {
  mode: LegMode;
  water: WaterSpan | null;
  inlandHandoff: boolean;
  geom: LegGeometry;
}

export interface Session {
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
  shownGlyph: MarkGlyph | "";
  facing: Facing;
  rafId: number;
  shownArrived: number;
}

export interface SessionBuilderDeps {
  /** The chart mount; build drops any overlay already here, then appends its own (#364). */
  mapEl: HTMLElement;
  /** The margin-log panel instance; build renders the rows. */
  logPanel: VoyageLogPanel;
}

export function createSessionBuilder(deps: SessionBuilderDeps) {
  const { mapEl, logPanel } = deps;

  // #184: the itinerary is ordered on ACTUAL travel, an all-pairs matrix over the
  // prepared router, so the drawn sweep never backtracks by road and sea the way the
  // straight-line tour could. The matrix costs a beat (~0.9s on a laptop for a 24-port
  // world), so it runs only when the walkable world actually changed: the cache keys on
  // seed + port set + surveyFingerprint, which a style turn or a re-toggle leaves
  // untouched. A QUIET rebuild (a mid-drag sea-level frame) NEVER computes: it reuses a
  // matching cached order or falls back to the straight-line one for that transient
  // frame; the drag's release redraw is non-quiet and recomputes against the settled
  // world. At rest the order is therefore a pure function of the world, never of the
  // interaction path that led there.
  let travelOrder: { key: string; order: ReadonlyArray<number> } | null = null;

  function orderItinerary(
    plan: VoyagePlan,
    router: VoyageRouter,
    survey: Survey,
    seed: number,
    quiet: boolean,
  ): VoyagePlan {
    const key = `${seed}:${surveyFingerprint(survey)}:${plan.ports.map((p) => p.idx).join(",")}`;
    if (travelOrder && travelOrder.key === key) return applyTourOrder(plan, travelOrder.order);
    if (quiet) return plan;
    const ordered = reorderPlanByTravel(plan, router.legLength);
    travelOrder = { key, order: ordered.ports.map((p) => p.idx) };
    return ordered;
  }

  // Build the plan + routed geometry + overlay for a manifest and append it into the
  // mount. Returns null when there is nothing to survey (no capital), so the caller
  // can bail.
  function build(
    manifest: PlaceManifest | null,
    survey: Survey | null,
    seed: number,
    subtitle: string,
    quiet = false,
  ): Session | null {
    if (!manifest || !manifest.places || !survey) return null;
    const straight = buildVoyagePlan(manifest.places, manifest.presentYear);
    if (!straight.ports.length) return null;

    const sites = manifest.places.map((p) => ({ idx: p.idx, x: p.gx, y: p.gy }));
    const router = prepareVoyageRouter(sites, survey);
    const plan = orderItinerary(straight, router, survey, seed, quiet);
    const routed = plan.legs.map(router.route);

    // Grid space -> chart pixels. This margin rule mirrors place-manifest.ts and
    // map-renderer.ts exactly; drift here would slide the track off the drawn roads.
    const wPx = manifest.widthPx;
    const proj = createProjection(survey.gridW, survey.gridH, wPx, Math.round(wPx * 0.045));
    const legs: SessionLeg[] = routed.map((leg) => ({
      mode: leg.mode,
      water: leg.water,
      inlandHandoff: leg.inlandHandoff,
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
    // setting-out. The richer, seed-forked prose lives in the engine (world/voyage-log.ts);
    // the plan's own port.logLine is the pure Sub-1 line and is no longer displayed.
    const logPorts = plan.ports.map((port, i) => {
      const pm = byIdx.get(port.idx)!;
      return {
        idx: pm.idx, name: pm.name, kind: pm.kind, founded: pm.founded,
        arrivalMode: i === 0 ? null : routed[i - 1].mode,
        inlandHandoff: i === 0 ? false : routed[i - 1].inlandHandoff,
        // #312: GRID-space leg length (routed points are pre-projection), so the
        // day counts are world-derived and never move with the render width.
        legLength: i === 0 ? 0 : buildLegGeometry(routed[i - 1].points).total,
      };
    });
    // #275: the closing leg is the last routed leg (it carries the survey home to
    // plan.ports[0]), and it earns the log's final row. A one-port survey has no closing
    // leg, so it logs its departure and stops.
    const closing = plan.ports.length >= 2 ? routed[routed.length - 1]! : null;
    const { log, rows: logRows } = logPanel.buildLogPanel(
      logPorts,
      manifest.presentYear,
      seed,
      subtitle,
      closing
        ? { arrivalMode: closing.mode, inlandHandoff: closing.inlandHandoff, legLength: buildLegGeometry(closing.points).total }
        : null,
    );

    const svg = document.createElementNS(SVG_NS, "svg") as SVGSVGElement;
    svg.setAttribute("class", "voyage-overlay");
    svg.setAttribute("viewBox", `0 0 ${wPx} ${manifest.heightPx}`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true"); // #121: the margin-log panel + one status summary carry the a11y payload
    const trackEl = document.createElementNS(SVG_NS, "polyline") as SVGPolylineElement;
    trackEl.setAttribute("class", "voyage-track");
    const shipG = makeMark("voyage-ship", SHIP_PARTS);
    const riderG = makeMark("voyage-rider", RIDER_PARTS);
    // INVARIANT: the marks are SIBLINGS of trackEl, never inside it. syncRestingTrack
    // feeds the sink trackEl's `points` verbatim, so a mark nested in the track would
    // bleed through to the back of the sheet, which #174 ruled it must never do.
    svg.append(trackEl, shipG, riderG);
    // INVARIANT: on every path that APPENDS, the mount is left holding exactly one
    // overlay, this one (#364). The append is unconditional, so the builder drops whatever
    // overlay is already there rather than trusting the caller to have wiped it. (The
    // bails above return without appending and leave the mount untouched, which is a
    // deliberate limit, spelled out below.) Every arm shipping
    // today is preceded by something that empties the mount (the Explorer's settle
    // innerHTML swap and its turn commit, applyVoyage's own exitVoyage, the Reading
    // Room's draw), which is exactly why nothing enforced this and why a future caller
    // arming OUTSIDE a draw would stack two tracks on the sheet, one of which a later
    // exit would strand. Guarded by e2e SV2g and, from the mount's own side (both nodes
    // dropped, order, scope, the bail), test/site/voyage-session-mount.test.ts.
    //
    // Deliberately HERE and not at the top of build: every bail above returns with the
    // mount exactly as it was found, so a survey-less world never strips the overlay a
    // previous one left resting.
    //
    // What that costs, stated so nobody reads the invariant as wider than it is: a build
    // that BAILS leaves the previous overlay in place, while rearmVoyage's own bail
    // branch hides the margin log and returns. A caller arming outside a draw wipe
    // against a survey-less world therefore leaves a stale track with no log under it.
    // That state predates #364 and is unreachable from every caller today (all four wipe
    // the mount first); the fix would be a wipe on the bail path that no test could
    // reach, so it is left to its own issue, #371, rather than added here unguarded.
    mapEl.querySelectorAll(".voyage-overlay").forEach((stale) => stale.remove());
    mapEl.appendChild(svg);

    return {
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
      shownGlyph: "",
      // The mark's facing carries across frames and legs so a switchbacking road cannot
      // flip it (voyage-geometry.ts resolveFacing). Seeded from the first leg's overall
      // sense, and rebuilt with the session, so no facing leaks between worlds.
      facing: legs.length ? netFacing(legs[0].geom.points) : 1,
      rafId: 0,
      shownArrived: 0,
    };
  }

  return { build };
}
