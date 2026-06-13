import { quantile, type Field } from "../core/grid.ts";

/** Sea level as an elevation quantile, so land fraction hits the target. */
export function pickSeaLevel(elev: Field, landFraction: number): number {
  if (landFraction <= 0 || landFraction >= 1) {
    throw new RangeError(`landFraction must be in (0, 1), got ${landFraction}`);
  }
  return quantile(elev.data, 1 - landFraction);
}

export function landMask(elev: Field, seaLevel: number): Uint8Array {
  const mask = new Uint8Array(elev.data.length);
  for (let i = 0; i < elev.data.length; i++) {
    mask[i] = (elev.data[i] as number) > seaLevel ? 1 : 0;
  }
  return mask;
}

export function landFractionOf(mask: Uint8Array): number {
  let land = 0;
  for (const v of mask) land += v;
  return land / mask.length;
}
