import { bfsPath } from "../core/bfs-path.ts";
import type { World } from "../world/types.ts";

export function roadMask(world: World): Uint8Array {
  const w = world.elev.w;
  const mask = new Uint8Array(w * world.elev.h);
  for (const road of world.roads) {
    for (const p of road.points) mask[p.x + p.y * w] = 1;
  }
  for (const s of world.settlements) mask[s.x + s.y * w] = 1;
  return mask;
}

export function roadWalk(
  world: World,
  mask: Uint8Array,
  fromIdx: number,
  toIdx: number,
): number[] | null {
  const w = world.elev.w;
  const from = world.settlements[fromIdx];
  const to = world.settlements[toIdx];
  if (!from || !to || fromIdx === toIdx) return null;
  const goal = to.x + to.y * w;
  return bfsPath(
    w,
    world.elev.h,
    from.x + from.y * w,
    (c) => c === goal,
    (c) => mask[c] === 1,
  );
}

export function roadReachable(world: World, mask: Uint8Array, fromIdx: number): number[] {
  const w = world.elev.w;
  const h = world.elev.h;
  const from = world.settlements[fromIdx];
  if (!from) return [];
  const seen = new Uint8Array(w * h);
  const queue: number[] = [from.x + from.y * w];
  seen[queue[0] as number] = 1;
  let head = 0;
  while (head < queue.length) {
    const c = queue[head++] as number;
    const x = c % w;
    const y = (c / w) | 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const n = nx + ny * w;
        if (seen[n] || !mask[n]) continue;
        seen[n] = 1;
        queue.push(n);
      }
    }
  }
  return world.settlements
    .map((s, i) => ({ i, cell: s.x + s.y * w }))
    .filter((e) => e.i !== fromIdx && seen[e.cell] === 1)
    .map((e) => e.i);
}
