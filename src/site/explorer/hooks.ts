// The window.__vellum* verification hooks (13), extracted from app.ts at #191.
// Deterministic e2e seams, harmless in prod; the suites drive the sweep/camera through
// these rather than racing rAF loops. The declare block is typed from what is assigned.
import type { runJob, runInline, usesWorker } from "./worker-client.ts";
import type { ZoomState } from "../shared/zoom-controller.ts";
import type { LivingChart } from "../living-chart/index.ts";
import type { Glass } from "./glass.ts";

declare global {
  interface Window {
    __vellumSetRedraftEnabled?: (v: boolean) => void;
    __vellumUsesWorker?: typeof usesWorker;
    __vellumRunJob?: typeof runJob;
    __vellumRunInline?: typeof runInline;
    __vellumVoyageStepTo?: LivingChart["voyageStepTo"];
    __vellumVoyagePaintAt?: LivingChart["voyagePaintAt"];
    __vellumVoyagePlan?: LivingChart["voyagePlan"];
    __vellumVoyageLog?: LivingChart["voyageLog"];
    __vellumVoyageLegGeometry?: LivingChart["voyageLegGeometry"];
    __vellumAgesState?: LivingChart["agesState"];
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
  // #169: a test seam, ON by default (production). It lets the geometric-zoom e2e
  // (Z1-Z16) isolate the geometric layer from the semantic redraft; those suites toggle
  // it off, and the Sub 8 suite (Z17-Z20) toggles it back on. Runtime only: the Explorer
  // never persists or reads it, so production is unaffected.
  window.__vellumSetRedraftEnabled = d.setRedraftEnabled;
  window.__vellumUsesWorker = d.usesWorker;
  // Verification hooks for the headless byte-identity check.
  window.__vellumRunJob = d.runJob;
  window.__vellumRunInline = d.runInline;
  // #119: deterministic voyage hooks (drive the sweep by port, read the plan).
  window.__vellumVoyageStepTo = lc.voyageStepTo;
  // #120: voyageStepTo can only land ON a port (legT = 0), so it can never sample a
  // MID-leg frame, which is exactly where the tilt varies and where a switchbacking
  // road would flicker the rider's facing.
  window.__vellumVoyagePaintAt = lc.voyagePaintAt;
  window.__vellumVoyagePlan = lc.voyagePlan;
  window.__vellumVoyageLog = lc.voyageLog; // #121: the margin log (entries, summary, reveal state)
  window.__vellumVoyageLegGeometry = lc.voyageLegGeometry; // #120: projected leg points, for W20b
  // #220: the fused instrument's read hook (chamber, u, held, playing), so a suite can
  // assert a seam crossing or the detent's hold without racing the clock.
  window.__vellumAgesState = lc.agesState;
  // #164: deterministic zoom hooks (Z1-Z4). zoomTo drives the camera through the same
  // clamp a live gesture uses; zoomState reads back the settled {x,y,k}.
  window.__vellumZoomTo = (t) => glass.zoomTo(t);
  window.__vellumZoomState = () => glass.zoomState();
  // #169: the committed region state (Z17-Z20): band, world-uv window, derived title,
  // and a monotonic redraft counter (proves one-job-per-settle + last-wins, no timing).
  window.__vellumRegion = () => glass.lodState();
}
