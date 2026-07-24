import type { PlaceMark } from "./place-manifest.ts";
import { orderTour, refineTour } from "./voyage-tour.ts";

/**
 * The pure core of the Wayfarer's Passage (#117, Sub 1 = #118). It turns a place
 * manifest into a deterministic survey itinerary: an ordered list of ports
 * starting at the capital, the legs that connect them, and one dated log line per
 * port in the surveyor's period voice.
 *
 * No DOM, no RNG. The animated overlay (a dotted track with a moving marker, the
 * log lines streamed into #status) lives in src/site/explorer/voyage.ts (Sub 2) and
 * is covered by the Explorer e2e. Only this deterministic math lives here, kept
 * engine-side with no worker or draw-payload changes.
 *
 * Determinism is same-input-same-output plus idx tiebreaks: every selection keys
 * on the settlement's `idx`, never its array position, so a shuffled manifest
 * yields a byte-identical plan. Sub 3 (#120) swaps only the leg geometry and Sub 4
 * (#121) swaps only the log prose; both keep this plan shape and these callers.
 * #184 adds reorderPlanByTravel below: the overlay refines this plan's straight-line
 * order on actual routed travel before drawing it.
 */

export type VoyageLeg = {
  readonly fromIdx: number;
  readonly toIdx: number;
};

export type VoyagePort = {
  readonly idx: number;
  readonly name: string;
  readonly logLine: string;
};

export type VoyagePlan = {
  readonly ports: ReadonlyArray<VoyagePort>;
  readonly legs: ReadonlyArray<VoyageLeg>;
};

const EMPTY_PLAN: VoyagePlan = { ports: [], legs: [] };

function logLineFor(place: PlaceMark, presentYear: number, isOrigin: boolean): string {
  if (isOrigin) {
    return `Year ${presentYear}: set out from ${place.name}, seat of this survey, raised in the year ${place.founded}.`;
  }
  const noun = place.kind === "village" ? "village" : "town";
  return `Year ${presentYear}: we came to ${place.name}, a ${noun} standing since ${place.founded}.`;
}

/**
 * Build a deterministic voyage itinerary from a place manifest.
 *
 * The survey departs the single capital (its home port, included even if the
 * chronicle later ruined it) and visits every living town and village once, ordered
 * as an open path that sweeps AROUND the world rather than backtracking (the tour
 * algorithm lives in voyage-tour.ts). A world with no capital has no survey and
 * yields an empty plan.
 */
export function buildVoyagePlan(
  places: ReadonlyArray<PlaceMark>,
  presentYear: number,
): VoyagePlan {
  const origin = places.find((p) => p.kind === "capital");
  if (!origin) return EMPTY_PLAN;

  // The survey visits the capital plus every living town/village. The origin is kept
  // even if the chronicle later ruined it (a ruined capital still departs); other
  // ruins are excluded. Ordering keys on nx/ny (chart fractions), the same layout the
  // marker draws over, so the drawn route matches the plotted one.
  const survey = places.filter((p) => p.idx === origin.idx || !p.ruined);
  const order = orderTour(survey.map((p) => ({ idx: p.idx, x: p.nx, y: p.ny })), origin.idx);
  const byIdx = new Map(places.map((p) => [p.idx, p]));
  const visited: PlaceMark[] = order.map((idx) => byIdx.get(idx)!);

  const ports: VoyagePort[] = visited.map((p, i) => ({
    idx: p.idx,
    name: p.name,
    logLine: logLineFor(p, presentYear, i === 0),
  }));

  const legs: VoyageLeg[] = [];
  for (let i = 1; i < visited.length; i++) {
    legs.push({ fromIdx: visited[i - 1].idx, toIdx: visited[i].idx });
  }

  return { ports, legs };
}

/**
 * Rebuild a plan's ports and legs in the given visiting order (#184). `order` must
 * be a permutation of the plan's port idxs that keeps the origin first; each port
 * keeps its own log line (only the origin's line is position-bound, and the origin
 * does not move). Validated here because the order arrives from a caller-supplied
 * refinement, and a bad one would surface far away as a mid-sweep missing port.
 */
export function applyTourOrder(plan: VoyagePlan, order: ReadonlyArray<number>): VoyagePlan {
  const current = plan.ports.map((p) => p.idx);
  const sameSet =
    order.length === current.length &&
    [...order].sort((a, b) => a - b).join(",") === [...current].sort((a, b) => a - b).join(",");
  if (!sameSet) {
    throw new Error(`tour order [${order.join(",")}] is not a permutation of the plan's ports`);
  }
  if (order[0] !== current[0]) {
    throw new Error(`tour order must keep the origin port ${current[0]} first, got ${order[0]}`);
  }
  if (order.every((idx, i) => idx === current[i])) return plan;

  const byIdx = new Map(plan.ports.map((p) => [p.idx, p]));
  const ports = order.map((idx) => byIdx.get(idx)!);
  const legs: VoyageLeg[] = [];
  for (let i = 1; i < ports.length; i++) {
    legs.push({ fromIdx: ports[i - 1]!.idx, toIdx: ports[i]!.idx });
  }
  return { ports, legs };
}

/**
 * Reorder a plan's itinerary on ACTUAL travel distances (#184). `d` measures the
 * routed miles between two ports by idx (prepareVoyageRouter's legLength), so the
 * order is chosen on exactly the miles the drawn legs will ride, where the
 * straight-line tour above can still place two ports adjacent whose real road/sea
 * path backtracks. The straight-line plan seeds the refinement; the result never
 * rides more miles than it.
 */
export function reorderPlanByTravel(plan: VoyagePlan, d: (a: number, b: number) => number): VoyagePlan {
  if (plan.ports.length <= 2) return plan;
  return applyTourOrder(plan, refineTour(plan.ports.map((p) => p.idx), d));
}

/**
 * A frame of the sweep: which leg the marker is on, how far along it (0..1), and how
 * many ports it has reached so far (the origin counts, so `arrived` runs 1..legCount+1).
 */
export type VoyageFrame = {
  readonly legIndex: number;
  readonly legT: number;
  readonly arrived: number;
};

/**
 * The animation timeline as a pure function of progress `t` (0..1), with time split
 * EQUALLY across legs so the survey arrives at a steady cadence (one log line per
 * port). Geometry (the port pixel positions, the marker) stays in the overlay; this
 * is only the deterministic progress math, so it is unit-tested like the plan.
 *
 * Assumes a non-empty plan (ports = legCount + 1). `legCount <= 0` is the one-port
 * survey: the marker rests at the origin, which counts as arrived.
 */
export function frameAt(legCount: number, t: number): VoyageFrame {
  if (legCount <= 0) return { legIndex: -1, legT: 0, arrived: 1 };
  const clamped = t < 0 ? 0 : t > 1 ? 1 : t;
  const scaled = clamped * legCount;
  const legIndex = Math.min(Math.floor(scaled), legCount - 1);
  const legT = scaled - legIndex;
  const arrived = Math.min(Math.floor(scaled) + 1, legCount + 1);
  return { legIndex, legT, arrived };
}
