import type { PlaceMark } from "./place-manifest.ts";

/**
 * The pure core of the Wayfarer's Passage (#117, Sub 1 = #118). It turns a place
 * manifest into a deterministic survey itinerary: an ordered list of ports
 * starting at the capital, the legs that connect them, and one dated log line per
 * port in the surveyor's period voice.
 *
 * No DOM, no RNG. The animated overlay (a dotted track with a moving marker, the
 * log lines streamed into #status) lives in docs/explorer/voyage.js (Sub 2) and
 * is covered by the Explorer e2e. Only this deterministic math lives here, so the
 * existing browser tsc pass compiles it into docs/explorer/engine/ with no worker
 * or draw-payload changes.
 *
 * Determinism is same-input-same-output plus idx tiebreaks: every selection keys
 * on the settlement's `idx`, never its array position, so a shuffled manifest
 * yields a byte-identical plan. Sub 3 (#120) swaps only the leg geometry and Sub 4
 * (#121) swaps only the log prose; both keep this plan shape and these callers.
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

/** Squared Euclidean distance on the 0..1 projected fractions; sqrt is needless for ordering. */
function distSq(a: PlaceMark, b: PlaceMark): number {
  const dx = a.nx - b.nx;
  const dy = a.ny - b.ny;
  return dx * dx + dy * dy;
}

/**
 * The nearest unvisited port to `from`, ties broken by the lower `idx` so the
 * choice never depends on array order. Returns null when none remain.
 */
function nearest(from: PlaceMark, remaining: ReadonlyArray<PlaceMark>): PlaceMark | null {
  let best: PlaceMark | null = null;
  let bestDist = Infinity;
  for (const cand of remaining) {
    const d = distSq(from, cand);
    if (d < bestDist || (d === bestDist && best !== null && cand.idx < best.idx)) {
      best = cand;
      bestDist = d;
    }
  }
  return best;
}

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
 * chronicle later ruined it) and greedily visits every living town and village
 * once by nearest-neighbour, as an open path with no return leg. A world with no
 * capital has no survey and yields an empty plan.
 */
export function buildVoyagePlan(
  places: ReadonlyArray<PlaceMark>,
  presentYear: number,
): VoyagePlan {
  const origin = places.find((p) => p.kind === "capital");
  if (!origin) return EMPTY_PLAN;

  // Destinations: every living town/village. The origin is excluded by idx (so a
  // ruined capital still departs) and ruins are excluded (a survey visits the
  // living world).
  const remaining = places.filter((p) => p.idx !== origin.idx && !p.ruined);

  const visited: PlaceMark[] = [origin];
  let current = origin;
  while (remaining.length > 0) {
    const next = nearest(current, remaining);
    if (!next) break;
    visited.push(next);
    remaining.splice(remaining.indexOf(next), 1);
    current = next;
  }

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
