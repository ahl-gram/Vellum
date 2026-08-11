// The window.__vellum* seams every LivingChart HOST publishes (#320, Survey and Story
// Sub 3), extracted from src/site/explorer/hooks.ts so the Explorer and the Reading
// Room register one surface between them.
//
// Why shared rather than per-host: the live-animation e2e coverage moves from the
// Explorer to the room across Subs 3 and 4, and a check that reads `__vellumVoyageLog`
// must mean the same thing on whichever page hosts it. Two hand-maintained hook lists
// would drift the moment one host grew a seam the other lacked, and the drift would
// surface as a ported check reading `undefined` rather than as a type error. Ratified
// on #320, 2026-08-10 (decision B): a shared installer, not prefixed twins and not
// Explorer-flavored globals copied onto the room.
//
// Deterministic seams, harmless in prod: the suites drive the sweep by port or by
// explicit frame through these rather than racing rAF loops. Everything here reads or
// paints; nothing here is reachable from the page's own UI.
//
// What stays Explorer-only (still in explorer/hooks.ts): the camera pair, the region
// state, the redraft flag, and the worker plumbing. Those describe the Explorer's own
// machinery, and the room has no camera and no draw controls.
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

/**
 * The seam names this installer publishes, as DATA rather than as a list restated in
 * prose somewhere else.
 *
 * The room's RS2 check imports this array and asserts against it instead of hand-copying
 * the names. That matters because a hand-copied list makes a ONE-SIDED guard: it catches
 * a seam REMOVED from a host, and it cannot catch a seam ADDED here that never reaches
 * the room, because both sides would have to be edited by the same hand to disagree.
 * Deriving the expectation from the installer closes the other half (guard the class, not
 * the instance: the guard-prover flagged exactly this shape on the first cut).
 */
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
  // Keyed by HostHookName, so tsc requires an entry for every name in the array and
  // rejects one that is not in it. The array and the implementations cannot drift apart.
  const seams: Record<HostHookName, unknown> = {
    // The oracle every ported check needs. A suite reads places / events / presentYear
    // off this rather than hardcoding a seed's facts, so a re-roll moves the expectations
    // with the world instead of reddening the suite.
    __vellumRunInline: inline,
    // #119: deterministic voyage seams (drive the sweep by port, read the plan).
    __vellumVoyageStepTo: lc.voyageStepTo,
    // #120: voyageStepTo can only land ON a port (legT = 0), so it can never sample a
    // MID-leg frame, which is exactly where the tilt varies and where a switchbacking
    // road would flicker the rider's facing. voyagePaintAt is the mid-leg seam.
    __vellumVoyagePaintAt: lc.voyagePaintAt,
    __vellumVoyagePlan: lc.voyagePlan,
    __vellumVoyageLog: lc.voyageLog, // #121: the margin log (entries, summary, reveal state)
    __vellumVoyageLegGeometry: lc.voyageLegGeometry, // #120: projected leg points, for W20b
    // #220: the fused instrument's read hook (chamber, t, u, held, playing, min, max), so
    // a suite can assert a seam crossing or the detent's hold without racing the clock.
    __vellumAgesState: lc.agesState,
  };
  const w = window as unknown as Record<string, unknown>;
  for (const name of HOST_HOOK_NAMES) w[name] = seams[name];
}
