// The window.__vellum* verification hooks the EXPLORER publishes (#191, split at #320).
// #321: the Explorer no longer calls the shared installHostHooks (ratified #320 decision
// A, 2026-08-10): test-only seams that paint non-rest positions would leave this page
// holding time machinery against the epic's "every reachable state is a rest". The two
// hosts differ ON PURPOSE from that sub on; do not "re-unify" them. What stays here is
// Explorer-only by nature, plus __vellumRunInline, the in-page ground-truth oracle.
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
  // The ground-truth oracle, declared on Window in ../shared/host-hooks.ts and published here directly since #321.
  window.__vellumRunInline = d.runInline;
  // #169: lets the geometric-zoom e2e isolate the geometric layer from the semantic redraft; runtime only, never persisted, so production is unaffected.
  window.__vellumSetRedraftEnabled = d.setRedraftEnabled;
  window.__vellumUsesWorker = d.usesWorker;
  // Verification hook for the headless byte-identity check (paired with runInline above).
  window.__vellumRunJob = d.runJob;
  // #164: deterministic zoom hooks; zoomTo drives the camera through the same clamp a live gesture uses.
  window.__vellumZoomTo = (t) => glass.zoomTo(t);
  window.__vellumZoomState = () => glass.zoomState();
  // #169: the committed region state (band, window, title, monotonic redraft counter).
  window.__vellumRegion = () => glass.lodState();
}
