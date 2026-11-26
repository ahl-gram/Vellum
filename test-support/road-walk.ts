// An oracle for the bird's-eye's gate names, written apart from `gateTown` (src/prospect/birdseye/names.ts): it asks which settlements a person leaving by a road meets first, one per branch, so a test can hold a named town to that set.
import type { World } from "../src/world/types.ts";

type Cell = { readonly x: number; readonly y: number };

export function firstTownsByRoad(world: World, place: number, start: Cell, barred: ReadonlySet<number>): Set<number> {
  const width = world.elev.w;
  const key = (c: Cell): number => c.x + c.y * width;
  const joined = new Map<number, Set<number>>();
  const join = (from: number, to: number): void => {
    const row = joined.get(from) ?? new Set<number>();
    row.add(to);
    joined.set(from, row);
  };
  for (const road of world.roads) {
    road.points.forEach((p, i) => {
      const q = road.points[i + 1];
      if (q === undefined || key(p) === key(q)) return;
      join(key(p), key(q));
      join(key(q), key(p));
    });
  }
  const settlementAt = new Map<number, number>();
  world.settlements.forEach((s, i) => settlementAt.set(key(s), i));
  const first = settlementAt.get(key(start));
  if (first !== undefined && first !== place) return new Set([first]);
  const found = new Set<number>();
  const visited = new Set<number>([key(start)]);
  const frontier: number[] = [key(start)];
  while (frontier.length > 0) {
    const here = frontier.shift()!;
    for (const next of joined.get(here) ?? []) {
      if (visited.has(next) || barred.has(next)) continue;
      visited.add(next);
      const town = settlementAt.get(next);
      if (town !== undefined && town !== place) found.add(town);
      else frontier.push(next);
    }
  }
  return found;
}
