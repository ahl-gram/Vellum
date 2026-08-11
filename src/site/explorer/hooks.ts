// The window.__vellum* verification hooks the EXPLORER publishes, extracted from
// app.ts at #191 and split again at #320.
//
// #321: the Explorer no longer calls the shared installHostHooks. That is ratified
// #320 decision A (2026-08-10): the deterministic voyage/ages seams retire from the
// static Explorer WITH the wiring, because test-only seams that paint non-rest
// positions would leave this page holding time machinery against the epic's "every
// reachable state is a rest". The shared installer in ../shared/host-hooks.ts is the
// Reading Room's surface now (the room's RS2 check derives from HOST_HOOK_NAMES
// there); the two hosts differ ON PURPOSE from this sub on, so do not "re-unify"
// them. What stays here is Explorer-only by nature (the camera, the region state,
// the redraft flag, the worker plumbing) plus __vellumRunInline, the in-page
// ground-truth oracle the surviving Explorer suites (render/cards/turn/verso) read.
import type { runJob, runInline, usesWorker } from "./worker-client.ts";
import type { ZoomState } from "../shared/zoom-controller.ts";
import type { Glass } from "./glass.ts";

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
  glass: Glass;
  usesWorker: typeof usesWorker;
  runJob: typeof runJob;
  runInline: typeof runInline;
  /** #169: the redraft test seam, ON by default; the conductor owns the flag. */
  setRedraftEnabled: (v: boolean) => void;
}

export function installExplorerHooks({ glass, ...d }: HookDeps): void {
  // The ground-truth oracle (manifest/survey the page's own engine would draw),
  // declared on Window in ../shared/host-hooks.ts and published here directly since
  // #321 (the rest of that installer's seams are the room's).
  window.__vellumRunInline = d.runInline;
  // #169: a test seam, ON by default (production). It lets the geometric-zoom e2e
  // (Z1-Z16) isolate the geometric layer from the semantic redraft; those suites toggle
  // it off, and the Sub 8 suite (Z17-Z20) toggles it back on. Runtime only: the Explorer
  // never persists or reads it, so production is unaffected.
  window.__vellumSetRedraftEnabled = d.setRedraftEnabled;
  window.__vellumUsesWorker = d.usesWorker;
  // Verification hook for the headless byte-identity check (paired with runInline above).
  window.__vellumRunJob = d.runJob;
  // #164: deterministic zoom hooks (Z1-Z4). zoomTo drives the camera through the same
  // clamp a live gesture uses; zoomState reads back the settled {x,y,k}.
  window.__vellumZoomTo = (t) => glass.zoomTo(t);
  window.__vellumZoomState = () => glass.zoomState();
  // #169: the committed region state (Z17-Z20): band, world-uv window, derived title,
  // and a monotonic redraft counter (proves one-job-per-settle + last-wins, no timing).
  window.__vellumRegion = () => glass.lodState();
}
