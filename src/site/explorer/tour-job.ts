// #373: the #184 travel matrix as a job. ONE implementation, called by ./worker.ts and mirrored
// by runInline in ./worker-client.ts, so the itinerary cannot depend on which thread computed it.
import { prepareVoyageRouter, type Site } from "../../render/voyage-route.ts";
import { refineTour } from "../../render/voyage-tour.ts";
import type { Survey } from "../../render/survey.ts";

export interface TourJobInput {
  readonly sites: ReadonlyArray<Site>;
  readonly survey: Survey;
  /** The straight-line port set, origin first. */
  readonly ports: ReadonlyArray<number>;
}

/** The travel-ordered ports. Mirrors reorderPlanByTravel's own guard: two ports admit one tour, so the matrix is never walked for them. */
export function tourOrderFor(job: TourJobInput): ReadonlyArray<number> {
  if (job.ports.length <= 2) return [...job.ports];
  return refineTour(job.ports, prepareVoyageRouter(job.sites, job.survey).legLength);
}
