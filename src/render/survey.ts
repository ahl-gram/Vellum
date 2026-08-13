import type { Field } from "../core/grid.ts";
import type { Road } from "../society/roads.ts";

export type SurveyRoad = ReadonlyArray<readonly [number, number]>;

export type Survey = {
  readonly gridW: number;
  readonly gridH: number;
  readonly land: Uint8Array;
  readonly roads: ReadonlyArray<SurveyRoad>;
};

export function surveyFingerprint(s: Survey): number {
  let h = 0x811c9dc5;
  const mix = (v: number) => {
    h = Math.imul(h ^ (v & 0xff), 0x01000193) >>> 0;
    h = Math.imul(h ^ ((v >>> 8) & 0xff), 0x01000193) >>> 0;
  };
  mix(s.gridW);
  mix(s.gridH);
  for (let i = 0; i < s.land.length; i++) h = Math.imul(h ^ (s.land[i] as number), 0x01000193) >>> 0;
  for (const polyline of s.roads) {
    mix(polyline.length);
    for (const [x, y] of polyline) {
      mix(x);
      mix(y);
    }
  }
  return h >>> 0;
}

export function buildSurvey(elev: Field, seaLevel: number, roads: ReadonlyArray<Road>): Survey {
  const { w, h, data } = elev;
  const land = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) land[i] = (data[i] as number) > seaLevel ? 1 : 0;
  return {
    gridW: w,
    gridH: h,
    land,
    roads: roads.map((r) => r.points.map((p) => [p.x, p.y] as const)),
  };
}
