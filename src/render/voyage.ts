import type { PlaceMark } from "./place-manifest.ts";
import { orderTour, refineTour } from "./voyage-tour.ts";

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

function closedLegs(ports: ReadonlyArray<{ readonly idx: number }>): VoyageLeg[] {
  const legs: VoyageLeg[] = [];
  for (let i = 1; i < ports.length; i++) {
    legs.push({ fromIdx: ports[i - 1]!.idx, toIdx: ports[i]!.idx });
  }
  if (ports.length >= 2) {
    legs.push({ fromIdx: ports[ports.length - 1]!.idx, toIdx: ports[0]!.idx });
  }
  return legs;
}

function logLineFor(place: PlaceMark, presentYear: number, isOrigin: boolean): string {
  if (isOrigin) {
    return `Year ${presentYear}: set out from ${place.name}, seat of this survey, raised in the year ${place.founded}.`;
  }
  const noun = place.kind === "village" ? "village" : "town";
  return `Year ${presentYear}: we came to ${place.name}, a ${noun} standing since ${place.founded}.`;
}

export function buildVoyagePlan(
  places: ReadonlyArray<PlaceMark>,
  presentYear: number,
): VoyagePlan {
  const origin = places.find((p) => p.kind === "capital");
  if (!origin) return EMPTY_PLAN;

  const survey = places.filter((p) => p.idx === origin.idx || !p.ruined);
  const order = orderTour(survey.map((p) => ({ idx: p.idx, x: p.nx, y: p.ny })), origin.idx);
  const byIdx = new Map(places.map((p) => [p.idx, p]));
  const visited: PlaceMark[] = order.map((idx) => byIdx.get(idx)!);

  const ports: VoyagePort[] = visited.map((p, i) => ({
    idx: p.idx,
    name: p.name,
    logLine: logLineFor(p, presentYear, i === 0),
  }));

  return { ports, legs: closedLegs(ports) };
}

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
  return { ports, legs: closedLegs(ports) };
}

export function reorderPlanByTravel(plan: VoyagePlan, d: (a: number, b: number) => number): VoyagePlan {
  if (plan.ports.length <= 2) return plan;
  return applyTourOrder(plan, refineTour(plan.ports.map((p) => p.idx), d));
}

export function logEntryCount(plan: VoyagePlan): number {
  return plan.ports.length === 0 ? 0 : plan.legs.length + 1;
}

/** #442: the journal row the survey has REACHED; revealLog inks [0, arrived), so the told row is the last inked one. Pure rather than inline at the seam because the off-by-one hides behind the clamp at t=1, where both readings land on the last row. */
export function toldRow(arrived: number, rows: number): number {
  if (rows <= 0) return -1;
  return Math.min(Math.max(arrived - 1, 0), rows - 1);
}

export type VoyageFrame = {
  readonly legIndex: number;
  readonly legT: number;
  readonly arrived: number;
};

export function frameAt(legCount: number, t: number): VoyageFrame {
  if (legCount <= 0) return { legIndex: -1, legT: 0, arrived: 1 };
  const clamped = t < 0 ? 0 : t > 1 ? 1 : t;
  const scaled = clamped * legCount;
  const legIndex = Math.min(Math.floor(scaled), legCount - 1);
  const legT = scaled - legIndex;
  const arrived = Math.min(Math.floor(scaled) + 1, legCount + 1);
  return { legIndex, legT, arrived };
}
