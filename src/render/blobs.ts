/** Largest 4-connected component of cells satisfying a predicate. */
export function largestBlob(
  w: number,
  h: number,
  predicate: (i: number) => boolean,
): number[] {
  const seen = new Uint8Array(w * h);
  let best: number[] = [];
  for (let start = 0; start < w * h; start++) {
    if (seen[start] || !predicate(start)) continue;
    const blob: number[] = [];
    const queue = [start];
    seen[start] = 1;
    while (queue.length > 0) {
      const i = queue.pop() as number;
      blob.push(i);
      const gx = i % w;
      const gy = (i / w) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const nx = gx + dx;
        const ny = gy + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const ni = nx + ny * w;
        if (!seen[ni] && predicate(ni)) {
          seen[ni] = 1;
          queue.push(ni);
        }
      }
    }
    if (blob.length > best.length) best = blob;
  }
  return best;
}
