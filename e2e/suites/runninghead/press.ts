import type { Payload, SuiteContext } from "../../types.ts";
import { LADDERS } from "../../../src/site/shared/primer/ladders.ts";
import type { RunningHeadKit } from "./kit.ts";

export type Box = { readonly l: number; readonly t: number; readonly r: number; readonly b: number };
export type Target = { readonly name: string; readonly box: Box };
export type PressRead = { readonly fonts: string; readonly press: Box | null; readonly others: readonly Target[] };

// 2026-11-23: ruled, a thumb's 24px (handbook/specs/ui-design.md, the paragraph opening "The head cluster says where the reader is standing").
export const THUMB = 24;

// 2026-11-23: the fonts read loaded at the first poll in all 36 visits of the Issue #1254 pull request 2 planner's probe; 200 polls of 75 ms are the visit's own readiness budget (visit in e2e/suites/runninghead/kit.ts).
export const PRESS_TRIES = 200;

const centreOf = (b: Box): readonly [number, number] => [(b.l + b.r) / 2, (b.t + b.b) / 2];
const undersized = (b: Box): boolean => b.r - b.l < THUMB || b.b - b.t < THUMB;
const reach = (x: number, y: number, b: Box): number =>
  Math.hypot(Math.max(0, b.l - x, x - b.r), Math.max(0, b.t - y, y - b.b));

export function spacingOf(press: Box, other: Box): { centre: number; full: number } {
  const [px, py] = centreOf(press);
  const [ox, oy] = centreOf(other);
  const centre = Math.hypot(px - ox, py - oy);
  const parts: number[] = [];
  if (undersized(press)) parts.push(reach(px, py, other) - THUMB / 2);
  if (undersized(other)) parts.push(reach(ox, oy, press) - THUMB / 2);
  if (undersized(press) && undersized(other)) parts.push(centre - THUMB);
  return { centre, full: parts.length === 0 ? Infinity : Math.min(...parts) };
}

export function pressSpacingFaults(route: string, read: PressRead | undefined): string[] {
  if (read === undefined) return [`${route}: not visited`];
  if (read.fonts !== "loaded") return [`${route}: read before the fonts loaded (${read.fonts})`];
  if (read.press === null) return [`${route}: no Primer press`];
  if (read.others.length === 0) return [`${route}: no other target read, so the spacing is read against nothing`];
  const faults: string[] = [];
  for (const o of read.others) {
    const s = spacingOf(read.press, o.box);
    if (!(s.centre >= THUMB))
      faults.push(
        `${route}: the Primer press's centre stands ${s.centre.toFixed(2)} px from "${o.name}", under a thumb's ${THUMB}`,
      );
    if (!(s.full >= 0))
      faults.push(
        `${route}: a thumb's ${THUMB} px circle reaches ${(-s.full).toFixed(2)} px between the Primer press and "${o.name}"`,
      );
  }
  return faults;
}

export function nearestOf(read: PressRead): { name: string; centre: number; full: number } | null {
  const press = read.press;
  if (press === null) return null;
  const spaced = read.others.map((o) => ({ name: o.name, ...spacingOf(press, o.box) }));
  return spaced.reduce<{ name: string; centre: number; full: number } | null>(
    (least, s) => (least === null || s.full < least.full ? s : least),
    null,
  );
}

export const PRESS_READ: Payload<string> = `JSON.stringify((() => {
  const box = (e) => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; };
  const shown = (e) => e.getClientRects().length > 0 && e.getBoundingClientRect().width > 0;
  const press = document.querySelector("header.chrome .primer-press a");
  const others = [...document.querySelectorAll("header.chrome a, header.chrome summary, header.chrome button, .corner.tr a, .corner.tr button, .corner.tr input, .corner.tr select")]
    .filter((e) => e !== press && shown(e) && !e.closest(".atelier"))
    .map((e) => ({ name: (e.textContent || e.getAttribute("aria-label") || e.id || e.tagName).replace(/[ \\n\\t]+/g, " ").trim().slice(0, 32), box: box(e) }));
  return { fonts: document.fonts.status, press: press && shown(press) ? box(press) : null, others };
})())`;

export async function pressRead(k: RunningHeadKit, route: string): Promise<PressRead> {
  for (let i = 0; i < PRESS_TRIES; i++) {
    let status = "unread";
    try {
      status = await k.evaluate<string>("document.fonts.status");
    } catch {}
    if (status === "loaded") break;
    await k.sleep(75);
  }
  try {
    return JSON.parse(await k.evaluate(PRESS_READ)) as PressRead;
  } catch {
    return { fonts: `unread at ${route}`, press: null, others: [] };
  }
}

export function rh33Press(
  check: SuiteContext["check"],
  reads: Readonly<Record<string, PressRead | undefined>>,
  taught: readonly string[] = LADDERS.map((l) => l.route),
): void {
  const wrong = taught.flatMap((route) => pressSpacingFaults(route, reads[route]));
  const nearest = taught.flatMap((route) => {
    const read = reads[route];
    const n = read === undefined ? null : nearestOf(read);
    return n === null ? [] : [`${route} ${n.full.toFixed(2)} px from "${n.name}", centre ${n.centre.toFixed(2)}`];
  });
  check(
    "RH33 in every room the Primer teaches, its press under the trail clears a thumb's 24px from every other link and control of the head cluster and the room folio: its centre 24 px or more from each, and each undersized target's 24 px circle clear of the other's box (Issue #1254, Alex's Q1 of comment 7111239318; handbook/specs/ui-design.md)",
    taught.length > 0 && wrong.length === 0,
    [nearest.join("; "), ...wrong].filter((s) => s !== "").join(" | "),
  );
}
