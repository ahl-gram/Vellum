/**
 * Label the connected components of a binary mask: a component id per set cell in
 * first-seen row-major order, -1 for clear cells.
 *
 * A sibling of world/landmass.ts rather than a reuse of it: that one takes a
 * `Field` (Float64 elevations plus a sea level) and lives in the world layer. The
 * client holds only the shipped Uint8Array land mask, and building a throwaway
 * 76,800-entry Float64 Field just to reuse the flood would cost more than the
 * flood. Labelling LAND must agree with it, so `connectivity` defaults to 4 and ids
 * are numbered in first-seen row-major order, exactly as landmass.ts numbers them.
 *
 * `connectivity: 8` labels WATER, and must, because the voyage's sea walk is
 * 8-connected: two sea cells are walkable to one another exactly when they share an
 * 8-connected component. Labelling water 4-connected would call a diagonally-joined
 * strait two separate seas.
 */
export function labelComponents(
  mask: Uint8Array,
  w: number,
  h: number,
  connectivity: 4 | 8 = 4,
): Int32Array {
  const n = w * h;
  const ids = new Int32Array(n).fill(-1);
  let next = 0;
  const stack: number[] = [];

  for (let start = 0; start < n; start++) {
    if (mask[start] !== 1 || ids[start] !== -1) continue;
    const id = next++;
    ids[start] = id;
    stack.push(start);
    while (stack.length > 0) {
      const i = stack.pop() as number;
      const x = i % w;
      const y = (i / w) | 0;
      // INVARIANT (land, connectivity 4): matching world/landmass.ts and the drawn
      // coastline, two land cells touching only at a corner are SEPARATE landmasses.
      // That is deliberately the opposite of the voyage's 8-connected sea walk: the
      // pinch that splits a landmass here is the same pinch the sea walker must be
      // able to thread. Making them agree would either classify a crossing that
      // cannot be routed, or route one straight through a wall.
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          if (connectivity === 4 && dx !== 0 && dy !== 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
          const ni = nx + ny * w;
          if (mask[ni] !== 1 || ids[ni] !== -1) continue;
          ids[ni] = id;
          stack.push(ni);
        }
      }
    }
  }
  return ids;
}
