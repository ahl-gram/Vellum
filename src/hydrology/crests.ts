import { quantile, type Field } from "../core/grid.ts";
import { computeBasins, watershedDivides } from "./basins.ts";
import type { FlowResult } from "./flow.ts";

const MAJOR_BASIN_FRACTION = 0.03;

const CREST_ELEV_QUANTILE = 0.5;

export function gateDivideElevation(
  divides: Uint8Array,
  elev: Field,
  seaLevel: number,
  q: number,
): Uint8Array {
  const { data } = elev;
  const threshold = landElevationQuantile(data, seaLevel, q);
  const out = new Uint8Array(divides.length);
  for (let i = 0; i < divides.length; i++) {
    if (divides[i] === 1 && (data[i] as number) >= threshold) out[i] = 1;
  }
  return out;
}

export function mountainCrests(elev: Field, flow: FlowResult, seaLevel: number): Uint8Array {
  const { w, h } = elev;
  const basins = computeBasins(elev, flow, seaLevel);
  const divides = watershedDivides(basins, w, h, MAJOR_BASIN_FRACTION);
  return gateDivideElevation(divides, elev, seaLevel, CREST_ELEV_QUANTILE);
}

function landElevationQuantile(
  data: Float64Array,
  seaLevel: number,
  q: number,
): number {
  const land: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const v = data[i] as number;
    if (v > seaLevel) land.push(v);
  }
  if (land.length === 0) return Infinity;
  return quantile(land, q);
}
