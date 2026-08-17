// The voyage session builder: everything that PREPARES a survey before a single frame
// paints (plan + tour order, routed geometry, projection, the margin log's rows, the
// overlay svg). Split from voyage.ts at #191: this module builds the session record, voyage.ts animates it.
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

// A routed leg as the overlay holds it; the water span's fractions carry over from grid space unchanged because the projection is uniform.
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

  // #184: the itinerary is ordered on ACTUAL travel (an all-pairs matrix over the prepared router, ~0.9s on a 24-port world), computed only when the walkable world changed: the cache keys on seed + port set + surveyFingerprint.
  // A QUIET rebuild (a mid-drag sea-level frame) NEVER computes: it reuses a matching cached order or falls back to the straight-line tour for that transient frame; the release redraw is non-quiet, so at rest the order is a pure function of the world, never of the interaction path.
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

  // Build the plan + routed geometry + overlay and append it into the mount; null = nothing to survey (no capital), so the caller can bail.
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

    const wPx = manifest.widthPx;
    const proj = createProjection(survey.gridW, survey.gridH, wPx, Math.round(wPx * 0.045));
    const legs: SessionLeg[] = routed.map((leg) => ({
      mode: leg.mode,
      water: leg.water,
      inlandHandoff: leg.inlandHandoff,
      geom: buildLegGeometry(leg.points.map((p) => ({ x: proj.px(p.x), y: proj.py(p.y) }))),
    }));

    // Per-leg animation time by length (#120); cumMs has legs+1 entries: cumMs[i] is when leg i begins, cumMs[legs] is the whole sweep.
    const durations = legDurations(legs.map((l) => l.geom.total));
    const cumMs = [0];
    for (const d of durations) cumMs.push(cumMs[cumMs.length - 1] + d);
    const totalMs = cumMs[cumMs.length - 1];

    const byIdx = new Map(manifest.places.map((p) => [p.idx, p]));
    const origin = byIdx.get(plan.ports[0].idx)!;
    const originPt = { x: proj.px(origin.gx), y: proj.py(origin.gy) };

    // #121 the margin log: each port carries the mode of the leg that ARRIVED at it (the origin has none, so it departs); the seed-forked prose lives in world/voyage-log.ts.
    const logPorts = plan.ports.map((port, i) => {
      const pm = byIdx.get(port.idx)!;
      return {
        idx: pm.idx, name: pm.name, kind: pm.kind, founded: pm.founded,
        arrivalMode: i === 0 ? null : routed[i - 1].mode,
        inlandHandoff: i === 0 ? false : routed[i - 1].inlandHandoff,
        // #312: GRID-space leg length (routed points are pre-projection), so the day counts are world-derived and never move with the render width.
        legLength: i === 0 ? 0 : buildLegGeometry(routed[i - 1].points).total,
      };
    });
    // #275: the closing leg is the last routed leg (it carries the survey home) and earns the log's final row; a one-port survey has no closing leg, so it logs its departure and stops.
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
    // INVARIANT: the marks are SIBLINGS of trackEl, never inside it; syncRestingTrack feeds the sink trackEl's `points` verbatim, and a mark nested in the track would bleed through to the back of the sheet (#174).
    svg.append(trackEl, shipG, riderG);
    // INVARIANT (#364): on every path that APPENDS, the mount is left holding exactly ONE overlay, this one; the builder drops whatever overlay is already there rather than trusting the caller to have wiped it (e2e SV2g; test/site/voyage-session-mount.test.ts).
    // Deliberately HERE and not at the top of build: the builder never owns its caller's teardown, so every bail above returns with the mount exactly as found. Each arm wipes on its own bail path instead (#371).
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
      // Facing carries across frames and legs so a switchbacking road cannot flip it (voyage-geometry.ts resolveFacing); rebuilt with the session, so no facing leaks between worlds.
      facing: legs.length ? netFacing(legs[0].geom.points) : 1,
      rafId: 0,
      shownArrived: 0,
    };
  }

  return { build };
}
