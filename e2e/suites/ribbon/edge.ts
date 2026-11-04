// The Ribbon ink-in's soft edge, read (Issue #1229): of a strip's middle columns at its half-way frame, the rows that stand part inked, between the same rows on bare paper and on the whole plate.
import type { Rgb } from "../../support/pixel.ts";

const PART_INKED = [0.1, 0.9] as const;

function inkedShare(row: readonly Rgb[], bare: readonly Rgb[], whole: readonly Rgb[], noise: number): number | null {
  let got = 0;
  let full = 0;
  for (let j = 0; j < row.length; j++)
    for (let c = 0; c < 3; c++) {
      got += Math.abs(row[j]![c]! - bare[j]![c]!);
      full += Math.abs(whole[j]![c]! - bare[j]![c]!);
    }
  return full < row.length * noise ? null : got / full;
}

export function partInkedRows(
  band: readonly Rgb[][],
  bare: readonly Rgb[][],
  whole: readonly Rgb[][],
  noise: number,
): number {
  return band.filter((row, r) => {
    const f = inkedShare(row, bare[r]!, whole[r]!, noise);
    return f !== null && f > PART_INKED[0] && f < PART_INKED[1];
  }).length;
}
