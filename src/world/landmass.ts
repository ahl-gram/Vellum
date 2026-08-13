import type { Field } from "../core/grid.ts";

export type LandmassLabels = {
  readonly ids: Int32Array;
  readonly sizes: ReadonlyArray<number>;
};

export function labelLandmasses(elev: Field, seaLevel: number): LandmassLabels {
  const { w, h, data } = elev;
  const n = w * h;
  const ids = new Int32Array(n).fill(-1);
  const sizes: number[] = [];
  const isLand = (i: number): boolean => (data[i] as number) > seaLevel;

  for (let start = 0; start < n; start++) {
    if (ids[start] !== -1 || !isLand(start)) continue;
    const id = sizes.length;
    let count = 0;
    const stack = [start];
    ids[start] = id;
    while (stack.length > 0) {
      const i = stack.pop() as number;
      count++;
      const gx = i % w;
      const gy = (i / w) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const nx = gx + dx;
        const ny = gy + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const ni = nx + ny * w;
        if (ids[ni] === -1 && isLand(ni)) {
          ids[ni] = id;
          stack.push(ni);
        }
      }
    }
    sizes.push(count);
  }

  return { ids, sizes };
}
