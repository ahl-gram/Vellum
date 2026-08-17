// #373: the host half of the off-thread travel order. It holds the answer the living-chart's
// session builder reads synchronously, and it is the only thing that ever asks for one.
// Single-entry, like ./world-cache.ts: the Explorer surveys one world at a time.
import { buildVoyagePlan } from "../../render/voyage.ts";
import { surveyFingerprint, type Survey } from "../../render/survey.ts";
import type { PlaceManifest } from "../../render/place-manifest.ts";
import type { TourJob, TourResult } from "./worker-client.ts";

/** Roughly 10x the slowest matrix measured on CI (2.1s), so it can only fire on a worker that has stopped answering, never on a slow one. */
export const TOUR_TIMEOUT_MS = 20000;

export interface TourOrderDeps {
  runJob: (job: TourJob) => Promise<TourResult>;
  timeoutMs?: number;
}

function keyOf(seed: number, survey: Survey, ports: ReadonlyArray<number>): string {
  return `${seed}:${surveyFingerprint(survey)}:${ports.join(",")}`;
}

export function createTourOrder(deps: TourOrderDeps) {
  const timeoutMs = deps.timeoutMs ?? TOUR_TIMEOUT_MS;
  let held: { key: string; order: ReadonlyArray<number> } | null = null;
  let pending: { key: string; run: Promise<void> } | null = null;

  function get(seed: number, survey: Survey, ports: ReadonlyArray<number>): ReadonlyArray<number> | null {
    return held && held.key === keyOf(seed, survey, ports) ? held.order : null;
  }

  /** Compute this world's order off-thread, resolving when get() can answer for it, or when it is time to stop waiting for one. */
  function prime(manifest: PlaceManifest | null, survey: Survey | null, seed: number): Promise<void> {
    if (!manifest || !survey) return Promise.resolve();
    const ports = buildVoyagePlan(manifest.places, manifest.presentYear).ports.map((p) => p.idx);
    if (ports.length <= 2) return Promise.resolve();
    const key = keyOf(seed, survey, ports);
    if (held && held.key === key) return Promise.resolve();
    if (pending && pending.key === key) return pending.run;
    const sites = manifest.places.map((p) => ({ idx: p.idx, x: p.gx, y: p.gy }));
    // ONE worker, serial: a Draw or a Glass redraft posted while this is in flight waits behind the whole matrix, which is why nothing here is speculative and a quiet mid-drag frame never primes.
    const job = deps
      .runJob({ kind: "tour", seed, sites, survey, ports })
      .then(
        (res) => { held = { key, order: res.order }; },
        () => {},
      )
      .then(() => { if (pending && pending.key === key) pending = null; });
    // The whole worker contract this leans on is best-effort: onerror rejects a job, but a worker that simply stops answering fires nothing, and the arm waiting on this would leave the sheet bare for good.
    const run = new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, timeoutMs);
      void job.then(() => { clearTimeout(timer); resolve(); });
    });
    pending = { key, run };
    return run;
  }

  return { get, prime };
}

export type TourOrder = ReturnType<typeof createTourOrder>;
