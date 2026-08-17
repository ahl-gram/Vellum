// #373: the host half of the off-thread travel order. It holds the answer the living-chart's
// session builder reads synchronously, and it is the only thing that ever asks for one.
// Single-entry, like ./world-cache.ts: the Explorer surveys one world at a time.
import { buildVoyagePlan } from "../../render/voyage.ts";
import { surveyFingerprint, type Survey } from "../../render/survey.ts";
import type { PlaceManifest } from "../../render/place-manifest.ts";
import type { TourJob, TourResult } from "./worker-client.ts";

export interface TourOrderDeps {
  runJob: (job: TourJob) => Promise<TourResult>;
}

function keyOf(seed: number, survey: Survey, ports: ReadonlyArray<number>): string {
  return `${seed}:${surveyFingerprint(survey)}:${ports.join(",")}`;
}

export function createTourOrder(deps: TourOrderDeps) {
  let held: { key: string; order: ReadonlyArray<number> } | null = null;
  let pending: { key: string; run: Promise<void> } | null = null;

  function get(seed: number, survey: Survey, ports: ReadonlyArray<number>): ReadonlyArray<number> | null {
    return held && held.key === keyOf(seed, survey, ports) ? held.order : null;
  }

  /** Compute this world's order off-thread, resolving when get() can answer for it. */
  function prime(manifest: PlaceManifest | null, survey: Survey | null, seed: number): Promise<void> {
    if (!manifest || !survey) return Promise.resolve();
    const ports = buildVoyagePlan(manifest.places, manifest.presentYear).ports.map((p) => p.idx);
    if (ports.length <= 2) return Promise.resolve();
    const key = keyOf(seed, survey, ports);
    if (held && held.key === key) return Promise.resolve();
    if (pending && pending.key === key) return pending.run;
    const sites = manifest.places.map((p) => ({ idx: p.idx, x: p.gx, y: p.gy }));
    const run = deps
      .runJob({ kind: "tour", seed, sites, survey, ports })
      // A crashed or absent worker is handled, not swallowed: nothing is held, so the builder computes the order inline exactly as a host with no worker does.
      .then(
        (res) => { held = { key, order: res.order }; },
        () => {},
      )
      .then(() => { if (pending && pending.key === key) pending = null; });
    pending = { key, run };
    return run;
  }

  return { get, prime };
}

export type TourOrder = ReturnType<typeof createTourOrder>;
