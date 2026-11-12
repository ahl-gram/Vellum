import { NAV_ITEMS, ROUTE_CHILDREN, ROUTE_NAMES, seatOf } from "../../../layouts/nav.ts";
import { EXPLORER } from "./explorer.ts";
import { PORTFOLIO } from "./portfolio.ts";
import { PRINT_ROOM } from "./print-room.ts";
import { PROSPECT } from "./prospect.ts";
import { READING_ROOM } from "./reading-room.ts";
import { RIBBON } from "./ribbon.ts";
import type { Ladder } from "./shape.ts";

export const LADDERS: readonly Ladder[] = [EXPLORER, PROSPECT, RIBBON, PORTFOLIO, READING_ROOM, PRINT_ROOM];

export const LEANED_ON: readonly string[] = ["/faq/", "/glossary/"];

const AWAITS = "its ladder lands with Issue #1252";
export const LEFT_UNTAUGHT: Readonly<Record<string, string>> = {
  "/seed-of-the-day/": AWAITS,
  "/writing-room/": AWAITS,
  "/gallery/": AWAITS,
  "/primer/": "the Primer is the guide itself",
};

export interface RouteTree {
  readonly routes: readonly string[];
  readonly seat: (route: string) => string | null | undefined;
  readonly names: Readonly<Record<string, string>>;
}

export const ROUTE_TREE: RouteTree = {
  routes: [...new Set([...NAV_ITEMS.map((i) => i.href), ...Object.values(ROUTE_CHILDREN).flat()])],
  seat: seatOf,
  names: ROUTE_NAMES,
};

export function untaught(ladders: readonly Ladder[] = LADDERS, tree: RouteTree = ROUTE_TREE): readonly string[] {
  const covered = new Set([...ladders.map((l) => l.route), ...LEANED_ON, ...Object.keys(LEFT_UNTAUGHT)]);
  return tree.routes.filter((r) => !covered.has(r));
}

export interface Seated {
  readonly ladder: Ladder;
  readonly name: string;
  readonly under: readonly Seated[];
}

export const nameIn = (tree: RouteTree, route: string): string => {
  const name = tree.names[route];
  if (name === undefined) throw new Error(`no ROUTE_NAMES entry for ${route}`);
  return name;
};

export function seated(ladders: readonly Ladder[] = LADDERS, tree: RouteTree = ROUTE_TREE): readonly Seated[] {
  return ladders
    .filter((l) => tree.seat(l.route) === null)
    .map((ladder) => ({
      ladder,
      name: nameIn(tree, ladder.route),
      under: ladders
        .filter((l) => tree.seat(l.route) === ladder.route)
        .map((l) => ({ ladder: l, name: nameIn(tree, l.route), under: [] })),
    }));
}
