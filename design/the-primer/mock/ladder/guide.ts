// Issue #1155 round: the guide's ladders in reading order, and the subrooms seated under their parents by the route tree itself, so a subroom's ladder is a child of the room it opens from without a field saying so.
import { NAV_ITEMS, ROUTE_NAMES, seatOf } from "../../../../src/layouts/nav.ts";
import { EXPLORER } from "./explorer.ts";
import { GALLERY, PORTFOLIO, PRINT_ROOM, PROSPECT, READING_ROOM, RIBBON, TODAY, WRITING_ROOM } from "./rooms.ts";
import type { Ladder, Step } from "./shape.ts";

export const LADDERS: readonly Ladder[] = [EXPLORER, PROSPECT, RIBBON, PORTFOLIO, WRITING_ROOM, READING_ROOM, PRINT_ROOM, TODAY, GALLERY];

/** The routes the guide leans on rather than teaches, Alex's ruling of 2026-11-05 (Issue #1155 comment 6660218955). */
export const LEANED_ON: readonly string[] = ["/faq/", "/glossary/"];

export interface Seated {
  readonly ladder: Ladder;
  readonly name: string;
  readonly under: readonly Seated[];
}

const nameOf = (route: string): string => {
  const name = ROUTE_NAMES[route];
  if (name === undefined) throw new Error(`no ROUTE_NAMES entry for ${route}`);
  return name;
};

/** The ladders as the guide seats them: each nav room in the guide's own order (the order a learner climbs, not the nav's), its subrooms under it wherever the route tree seats them. */
export function seated(ladders: readonly Ladder[] = LADDERS, seat: (route: string) => string | null | undefined = seatOf, names: Readonly<Record<string, string>> = ROUTE_NAMES): readonly Seated[] {
  const rooms = new Set(NAV_ITEMS.map((i) => i.href));
  const named = (route: string): string => names[route] ?? nameOf(route);
  return ladders.filter((l) => rooms.has(l.route)).map((ladder) => ({
    ladder,
    name: named(ladder.route),
    under: ladders.filter((l) => seat(l.route) === ladder.route).map((l) => ({ ladder: l, name: named(l.route), under: [] })),
  }));
}

/** What the unit check behind "the guide grows with the site" asks: every room in the route tree has a ladder, or is leaned on, or is named here as deliberately untaught. */
export function untaught(ladders: readonly Ladder[] = LADDERS, names: Readonly<Record<string, string>> = ROUTE_NAMES, seat: (route: string) => string | null | undefined = seatOf): readonly string[] {
  const taught = new Set([...ladders.map((l) => l.route), ...LEANED_ON]);
  return Object.keys(names).filter((r) => r !== "/" && seat(r) !== undefined && !taught.has(r));
}

export const everyStep = (): ReadonlyArray<{ readonly ladder: Ladder; readonly lesson: string; readonly step: Step }> =>
  LADDERS.flatMap((ladder) => ladder.lessons.flatMap((lesson) => lesson.steps.map((step) => ({ ladder, lesson: lesson.id, step }))));
