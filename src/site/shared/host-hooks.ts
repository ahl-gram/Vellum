// The window.__vellum* seams every LivingChart HOST publishes (#320), extracted from
// explorer/hooks.ts so the Explorer and the Reading Room register ONE surface between
// them (ratified 2026-08-10, decision B: a shared installer, not prefixed twins). The
// seams are deterministic and harmless in prod: the suites drive the sweep through them
// rather than racing rAF loops, and nothing here is reachable from the page's own UI.
// Explorer-only seams (camera, region state, redraft flag, worker plumbing) stay in explorer/hooks.ts.
import type { runInline } from "../explorer/worker-client.ts";
import type { LivingChart } from "../living-chart/index.ts";

declare global {
  interface Window {
    __vellumRunInline?: typeof runInline;
    __vellumVoyageStepTo?: LivingChart["voyageStepTo"];
    __vellumVoyagePaintAt?: LivingChart["voyagePaintAt"];
    __vellumVoyagePlan?: LivingChart["voyagePlan"];
    __vellumVoyageLog?: LivingChart["voyageLog"];
    __vellumVoyageLegGeometry?: LivingChart["voyageLegGeometry"];
    __vellumAgesState?: LivingChart["agesState"];
  }
}

interface HostHookDeps {
  livingChart: LivingChart;
  /** The in-page ground-truth oracle: the manifest this page's own engine would draw. */
  runInline: typeof runInline;
}

/** The seam names as DATA: the room's RS2 check imports this array and asserts against it, because a hand-copied list is a ONE-SIDED guard (it catches a seam removed from a host but never one added here that never reaches the room). */
export const HOST_HOOK_NAMES = [
  "__vellumRunInline",
  "__vellumVoyageStepTo",
  "__vellumVoyagePaintAt",
  "__vellumVoyagePlan",
  "__vellumVoyageLog",
  "__vellumVoyageLegGeometry",
  "__vellumAgesState",
] as const;

export type HostHookName = (typeof HOST_HOOK_NAMES)[number];

export function installHostHooks({ livingChart: lc, runInline: inline }: HostHookDeps): void {
  // Keyed by HostHookName, so tsc requires an entry for every name in the array and rejects one that is not in it; the array and the implementations cannot drift apart.
  const seams: Record<HostHookName, unknown> = {
    // The oracle every ported check needs: a suite reads world facts off this rather than hardcoding a seed's, so a re-roll moves the expectations with the world.
    __vellumRunInline: inline,
    __vellumVoyageStepTo: lc.voyageStepTo, // #119: drive the sweep by port
    // #120: voyageStepTo can only land ON a port; voyagePaintAt is the mid-leg seam, where tilt and facing vary.
    __vellumVoyagePaintAt: lc.voyagePaintAt,
    __vellumVoyagePlan: lc.voyagePlan,
    __vellumVoyageLog: lc.voyageLog, // #121: the margin log (entries, summary, reveal state)
    __vellumVoyageLegGeometry: lc.voyageLegGeometry, // #120: projected leg points, for W20b
    // #220: the fused instrument's read hook (chamber, t, u, held, playing, min, max).
    __vellumAgesState: lc.agesState,
  };
  const w = window as unknown as Record<string, unknown>;
  for (const name of HOST_HOOK_NAMES) w[name] = seams[name];
}
