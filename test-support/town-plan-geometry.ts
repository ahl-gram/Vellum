import type { PlanPoint } from "../src/prospect/town-plan/types.ts";

type Pt = PlanPoint;

function distanceToSegment(p: Pt, a: Pt, b: Pt): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  const along = len2 === 0 ? 0 : ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  const t = Math.min(1, Math.max(0, along));
  return Math.hypot(a.x + t * dx - p.x, a.y + t * dy - p.y);
}

export function distanceToLine(p: PlanPoint, line: ReadonlyArray<PlanPoint>): number {
  let least = Infinity;
  for (let i = 1; i < line.length; i++) least = Math.min(least, distanceToSegment(p, line[i - 1]!, line[i]!));
  return least;
}

export function crossingsOf(line: ReadonlyArray<PlanPoint>, ring: ReadonlyArray<PlanPoint>): PlanPoint[] {
  const found: PlanPoint[] = [];
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1]!;
    const b = line[i]!;
    const rx = b.x - a.x;
    const ry = b.y - a.y;
    for (let j = 0; j < ring.length; j++) {
      const c = ring[j]!;
      const d = ring[(j + 1) % ring.length]!;
      const sx = d.x - c.x;
      const sy = d.y - c.y;
      const cross = rx * sy - ry * sx;
      if (cross === 0) continue;
      const along = ((c.x - a.x) * sy - (c.y - a.y) * sx) / cross;
      const across = ((c.x - a.x) * ry - (c.y - a.y) * rx) / cross;
      if (along >= 0 && along < 1 && across >= 0 && across < 1)
        found.push({ x: a.x + along * rx, y: a.y + along * ry });
    }
  }
  return found;
}
