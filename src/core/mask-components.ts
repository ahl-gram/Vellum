const OFFSETS_8: ReadonlyArray<readonly [number, number]> = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0], [1, 0],
  [-1, 1], [0, 1], [1, 1],
];

const OFFSETS_4: ReadonlyArray<readonly [number, number]> = [[0, -1], [-1, 0], [1, 0], [0, 1]];

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
  const offsets = connectivity === 4 ? OFFSETS_4 : OFFSETS_8;

  for (let start = 0; start < n; start++) {
    if (mask[start] !== 1 || ids[start] !== -1) continue;
    const id = next++;
    ids[start] = id;
    stack.push(start);
    while (stack.length > 0) {
      const i = stack.pop() as number;
      const x = i % w;
      const y = (i / w) | 0;
      for (const [dx, dy] of offsets) {
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
  return ids;
}
