import { fieldFrom, type Field } from "../src/core/grid.ts";
import { labelLandmasses } from "../src/world/landmass.ts";

export function fieldFromRows(rows: ReadonlyArray<string>, land = 0.5, water = -0.5): Field {
  const h = rows.length;
  const w = (rows[0] as string).length;
  const data = new Float64Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      data[x + y * w] = (rows[y] as string)[x] === "#" ? land : water;
    }
  }
  return fieldFrom(w, h, data);
}

export function landmassCount(f: Field, seaLevel: number): number {
  return labelLandmasses(f, seaLevel).sizes.length;
}
