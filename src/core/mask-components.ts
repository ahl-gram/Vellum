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
      // Land labels 4-connected while the voyage's sea walk is 8-connected, on purpose: the pinch that splits a landmass is the same pinch the sea walker must be able to thread.
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
