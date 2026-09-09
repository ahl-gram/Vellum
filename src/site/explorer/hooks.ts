// The window.__vellum* verification hooks the Explorer publishes. It does NOT call the shared installHostHooks (ratified #320 decision A, 2026-08-10: seams that paint non-rest positions would break "every reachable state is a rest"); the two hosts differ on purpose, do not re-unify them.
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
  setRedraftEnabled: (v: boolean) => void;
}

export function installExplorerHooks({ glass, ...d }: HookDeps): void {
  window.__vellumRunInline = d.runInline;
  window.__vellumSetRedraftEnabled = d.setRedraftEnabled;
  window.__vellumUsesWorker = d.usesWorker;
  window.__vellumRunJob = d.runJob;
  window.__vellumZoomTo = (t) => glass.zoomTo(t);
  window.__vellumZoomState = () => glass.zoomState();
  window.__vellumRegion = () => glass.lodState();
}
