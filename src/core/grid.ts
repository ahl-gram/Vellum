/**
 * Row-major Float64 scalar fields over a w×h grid.
 *
 * Fields are immutable by convention: builders fill a fresh array at
 * construction, transforms return new fields. Hot loops may read
 * `field.data` directly with `index()` math.
 */

export type Field = {
  readonly w: number;
  readonly h: number;
  readonly data: Float64Array;
  at(x: number, y: number): number;
  index(x: number, y: number): number;
  inBounds(x: number, y: number): boolean;
};

export const NEIGHBORS_4: ReadonlyArray<readonly [number, number, number]> = [
  [1, 0, 1],
  [-1, 0, 1],
  [0, 1, 1],
  [0, -1, 1],
];

export const NEIGHBORS_8: ReadonlyArray<readonly [number, number, number]> = [
  [1, 0, 1],
  [-1, 0, 1],
  [0, 1, 1],
  [0, -1, 1],
  [1, 1, Math.SQRT2],
  [1, -1, Math.SQRT2],
  [-1, 1, Math.SQRT2],
  [-1, -1, Math.SQRT2],
];

function wrap(w: number, h: number, data: Float64Array): Field {
  return {
    w,
    h,
    data,
    at: (x, y) => data[x + y * w] as number,
    index: (x, y) => x + y * w,
    inBounds: (x, y) => x >= 0 && x < w && y >= 0 && y < h,
  };
}

export function createField(
  w: number,
  h: number,
  fill?: (x: number, y: number) => number,
): Field {
  const data = new Float64Array(w * h);
  if (fill) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        data[x + y * w] = fill(x, y);
      }
    }
  }
  return wrap(w, h, data);
}

export function fieldFrom(w: number, h: number, data: Float64Array): Field {
  if (data.length !== w * h) {
    throw new RangeError(`data length ${data.length} != ${w}×${h}`);
  }
  return wrap(w, h, Float64Array.from(data));
}

export function mapField(
  f: Field,
  fn: (v: number, x: number, y: number) => number,
): Field {
  const data = new Float64Array(f.w * f.h);
  for (let y = 0; y < f.h; y++) {
    for (let x = 0; x < f.w; x++) {
      const i = x + y * f.w;
      data[i] = fn(f.data[i] as number, x, y);
    }
  }
  return wrap(f.w, f.h, data);
}

export function minMax(f: Field): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (const v of f.data) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return { min, max };
}

export function quantile(
  values: Float64Array | readonly number[],
  q: number,
): number {
  const sorted = Float64Array.from(values).sort();
  if (sorted.length === 0) throw new RangeError("quantile of empty set");
  const i = Math.min(
    sorted.length - 1,
    Math.max(0, Math.floor(q * (sorted.length - 1))),
  );
  return sorted[i] as number;
}

export function normalized(f: Field): Field {
  const { min, max } = minMax(f);
  const span = max - min || 1;
  return mapField(f, (v) => (v - min) / span);
}
