export type P = readonly [number, number];

export function segmentDistance2(p: P, a: P, b: P): number {
  const dx = b[0] - a[0],
    dy = b[1] - a[1];
  const l2 = dx * dx + dy * dy;
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2));
  const ex = p[0] - a[0] - t * dx,
    ey = p[1] - a[1] - t * dy;
  return ex * ex + ey * ey;
}

export function simplify(pts: readonly P[], tolerance: number): P[] {
  if (pts.length < 3) return [...pts];
  const keep = new Uint8Array(pts.length);
  keep[0] = 1;
  keep[pts.length - 1] = 1;
  const stack: Array<readonly [number, number]> = [[0, pts.length - 1]];
  for (let top = stack.pop(); top !== undefined; top = stack.pop()) {
    const [a, b] = top;
    let best = -1,
      bd = 0;
    for (let i = a + 1; i < b; i++) {
      const d = segmentDistance2(pts[i]!, pts[a]!, pts[b]!);
      if (d > bd) {
        bd = d;
        best = i;
      }
    }
    if (best >= 0 && bd > tolerance * tolerance) {
      keep[best] = 1;
      stack.push([a, best], [best, b]);
    }
  }
  return pts.filter((_, i) => keep[i] === 1);
}

export function simplifyRing(ring: readonly P[], tolerance: number): P[] {
  if (ring.length < 4) return [...ring];
  let far = 0,
    fd = -1;
  for (let i = 1; i < ring.length; i++) {
    const dx = ring[i]![0] - ring[0]![0],
      dy = ring[i]![1] - ring[0]![1];
    if (dx * dx + dy * dy > fd) {
      fd = dx * dx + dy * dy;
      far = i;
    }
  }
  const head = simplify(ring.slice(0, far + 1), tolerance);
  const tail = simplify([...ring.slice(far), ring[0]!], tolerance);
  return [...head, ...tail.slice(1, -1)];
}
