const DX_8: ReadonlyArray<number> = [-1, 0, 1, -1, 1, -1, 0, 1];
const DY_8: ReadonlyArray<number> = [-1, -1, -1, 0, 0, 1, 1, 1];
const DX_4: ReadonlyArray<number> = [0, -1, 1, 0];
const DY_4: ReadonlyArray<number> = [-1, 0, 0, 1];

export function labelComponents(mask: Uint8Array, w: number, h: number, connectivity: 4 | 8 = 4): Int32Array {
  const n = w * h;
  const ids = new Int32Array(n).fill(-1);
  let next = 0;
  const stack: number[] = [];
  const dxs = connectivity === 4 ? DX_4 : DX_8;
  const dys = connectivity === 4 ? DY_4 : DY_8;

  for (let start = 0; start < n; start++) {
    if (mask[start] !== 1 || ids[start] !== -1) continue;
    const id = next++;
    ids[start] = id;
    stack.push(start);
    while (stack.length > 0) {
      const i = stack.pop() as number;
      const x = i % w;
      const y = (i / w) | 0;
      for (let k = 0; k < dxs.length; k++) {
        const dx = dxs[k] as number;
        const dy = dys[k] as number;
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
