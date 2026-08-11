// The window.__vellum* verification hooks the EXPLORER adds on top of the shared host
// surface, extracted from app.ts at #191 and split again at #320.
//
// The six seams every LivingChart host publishes (the ages read, the five voyage seams)
// plus the runInline oracle now live in ../shared/host-hooks.ts, so the Reading Room
// registers the identical surface and a ported e2e check means the same thing on either
// page. What remains here is Explorer-only by nature: the camera, the region state, the
// redraft flag, and the worker plumbing. The declare block is typed from what is
// assigned in this file.
import type { runJob, runInline, usesWorker } from "./worker-client.ts";
import type { ZoomState } from "../shared/zoom-controller.ts";
import type { LivingChart } from "../living-chart/index.ts";
import type { Glass } from "./glass.ts";
import { installHostHooks } from "../shared/host-hooks.ts";

declare global {
  interface Window {
    __vellumSetRedraftEnabled?: (v: boolean) => void;
    __vellumUsesWorker?: typeof usesWorker;
    __vellumRunJob?: typeof runJob;
    __vellumZoomTo: (t: ZoomState) => void;
    __vellumZoomState: () => ZoomState;
    __vellumRegion?: () => ReturnType<Glass["lodState"]>;
  }
}

interface HookDeps {
  livingChart: LivingChart;
  glass: Glass;
  usesWorker: typeof usesWorker;
  runJob: typeof runJob;
  runInline: typeof runInline;
  /** #169: the redraft test seam, ON by default; the conductor owns the flag. */
  setRedraftEnabled: (v: boolean) => void;
}

export function installExplorerHooks({ livingChart: lc, glass, ...d }: HookDeps): void {
  // The shared surface first: ages + the voyage seams + the runInline oracle.
  installHostHooks({ livingChart: lc, runInline: d.runInline });
  // #169: a test seam, ON by default (production). It lets the geometric-zoom e2e
  // (Z1-Z16) isolate the geometric layer from the semantic redraft; those suites toggle
  // it off, and the Sub 8 suite (Z17-Z20) toggles it back on. Runtime only: the Explorer
  // never persists or reads it, so production is unaffected.
  window.__vellumSetRedraftEnabled = d.setRedraftEnabled;
  window.__vellumUsesWorker = d.usesWorker;
  // Verification hook for the headless byte-identity check (its runInline half is shared).
  window.__vellumRunJob = d.runJob;
  // #164: deterministic zoom hooks (Z1-Z4). zoomTo drives the camera through the same
  // clamp a live gesture uses; zoomState reads back the settled {x,y,k}.
  window.__vellumZoomTo = (t) => glass.zoomTo(t);
  window.__vellumZoomState = () => glass.zoomState();
  // #169: the committed region state (Z17-Z20): band, world-uv window, derived title,
  // and a monotonic redraft counter (proves one-job-per-settle + last-wins, no timing).
  window.__vellumRegion = () => glass.lodState();
}
