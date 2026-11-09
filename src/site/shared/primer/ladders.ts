import { NAV_ITEMS, ROUTE_CHILDREN, ROUTE_NAMES, seatOf } from "../../../layouts/nav.ts";
import { EXPLORER } from "./explorer.ts";
import type { Ladder } from "./shape.ts";

export const LADDERS: readonly Ladder[] = [EXPLORER];

export const LEANED_ON: readonly string[] = ["/faq/", "/glossary/"];

const AWAITS = "its ladder lands with Issue #1252";
export const LEFT_UNTAUGHT: Readonly<Record<string, string>> = {
  "/explorer/": AWAITS,
  "/seed-of-the-day/": AWAITS,
  "/writing-room/": AWAITS,
  "/reading-room/": AWAITS,
  "/print-room/": AWAITS,
  "/gallery/": AWAITS,
  "/prospect/": AWAITS,
  "/ribbon/": AWAITS,
  "/explorer/portfolio/": AWAITS,
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

export function untaught(_ladders: readonly Ladder[] = LADDERS, tree: RouteTree = ROUTE_TREE): readonly string[] {
  return tree.routes;
}

export interface Seated {
  readonly ladder: Ladder;
  readonly name: string;
  readonly under: readonly Seated[];
}

export function seated(ladders: readonly Ladder[] = LADDERS, tree: RouteTree = ROUTE_TREE): readonly Seated[] {
  return ladders.map((ladder) => ({ ladder, name: tree.names[ladder.route] ?? "", under: [] }));
}
