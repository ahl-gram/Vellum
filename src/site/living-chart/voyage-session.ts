// The voyage session builder: everything that PREPARES a survey before a frame paints (plan + tour order, routed geometry, projection, the log rows, the overlay svg); voyage.ts animates the record this builds.
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

export interface TourOrderSource {
  get(seed: number, survey: Survey, ports: ReadonlyArray<number>): ReadonlyArray<number> | null;
}

export interface SessionBuilderDeps {
  mapEl: HTMLElement;
  logPanel: VoyageLogPanel;
  tourOrder?: TourOrderSource;
}

export function createSessionBuilder(deps: SessionBuilderDeps) {
  const { mapEl, logPanel, tourOrder } = deps;

  let travelOrder: { key: string; order: ReadonlyArray<number> } | null = null;

  function orderItinerary(
    plan: VoyagePlan,
    router: VoyageRouter,
    survey: Survey,
    seed: number,
    quiet: boolean,
  ): VoyagePlan {
    const ports = plan.ports.map((p) => p.idx);
    const key = `${seed}:${surveyFingerprint(survey)}:${ports.join(",")}`;
    if (travelOrder && travelOrder.key === key) return applyTourOrder(plan, travelOrder.order);
    const supplied = tourOrder ? tourOrder.get(seed, survey, ports) : null;
    if (supplied) {
      travelOrder = { key, order: supplied };
      return applyTourOrder(plan, supplied);
    }
    if (quiet) return plan;
    const ordered = reorderPlanByTravel(plan, router.legLength);
    travelOrder = { key, order: ordered.ports.map((p) => p.idx) };
    return ordered;
  }

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

    const durations = legDurations(legs.map((l) => l.geom.total));
    const cumMs = [0];
    for (const d of durations) cumMs.push(cumMs[cumMs.length - 1] + d);
    const totalMs = cumMs[cumMs.length - 1];

    const byIdx = new Map(manifest.places.map((p) => [p.idx, p]));
    const origin = byIdx.get(plan.ports[0].idx)!;
    const originPt = { x: proj.px(origin.gx), y: proj.py(origin.gy) };

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
      facing: legs.length ? netFacing(legs[0].geom.points) : 1,
      rafId: 0,
      shownArrived: 0,
    };
  }

  return { build };
}
