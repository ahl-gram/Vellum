import { createField, type Field } from "./grid.ts";

export function boxBlur(f: Field, passes: number): Field {
  let cur = f;
  for (let p = 0; p < passes; p++) {
    const { w, h, data } = cur;
    cur = createField(w, h, (x, y) => {
      let sum = 0;
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
          sum += data[nx + ny * w] as number;
          n++;
        }
      }
      return sum / n;
    });
  }
  return cur;
}
