import type { Field } from "../core/grid.ts";

/**
 * Border-connected open sea: a 1 for every water cell (<= seaLevel) reachable
 * from the map edge, 0 elsewhere. The water cells this leaves out are exactly
 * the inland lakes (the same partition `findLakes` draws), so this is the
 * "is this the sea, not a lake?" test that furniture placement needs. Pure.
 */
export function seaMask(elev: Field, seaLevel: number): Uint8Array {
  const { w, h, data } = elev;
  const isWater = (i: number): boolean => (data[i] as number) <= seaLevel;
  const sea = new Uint8Array(w * h);
  const stack: number[] = [];
  const visit = (i: number): void => {
    if (sea[i] === 0 && isWater(i)) {
      sea[i] = 1;
      stack.push(i);
    }
  };

  // seed from every border cell, then flood 4-connected (matching findLakes)
  for (let x = 0; x < w; x++) {
    visit(x);
    visit(x + (h - 1) * w);
  }
  for (let y = 0; y < h; y++) {
    visit(y * w);
    visit(w - 1 + y * w);
  }
  while (stack.length > 0) {
    const i = stack.pop() as number;
    const x = i % w;
    const y = (i / w) | 0;
    if (x + 1 < w) visit(i + 1);
    if (x - 1 >= 0) visit(i - 1);
    if (y + 1 < h) visit(i + w);
    if (y - 1 >= 0) visit(i - w);
  }
  return sea;
}
