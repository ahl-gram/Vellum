import type { PlaceRank } from "./atelier-chart.ts";

export interface ChartStep {
  readonly id: string;
  readonly only?: "touch" | "motion";
}
export interface ChartLesson {
  readonly steps: readonly ChartStep[];
}
export interface ChartRoom {
  readonly id: string;
  readonly route: string;
  readonly lessons: readonly ChartLesson[];
}
export interface Box {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}
export interface Arc {
  readonly from: number;
  readonly to: number;
  readonly step: string;
  readonly lesson: number;
}
export interface Ring {
  readonly r: number;
  readonly arcs: readonly Arc[];
}
export interface Mark {
  readonly step: string;
  readonly only?: "touch" | "motion";
  readonly d: string;
  readonly hand: string;
  readonly side: "east" | "west";
}
export interface Label {
  readonly route: string;
  readonly text: string;
  readonly size: number;
  readonly x: number;
  readonly y: number;
  readonly anchor: "start" | "middle" | "end";
  readonly side: "above" | "right" | "left" | "below";
  readonly forced: boolean;
  readonly box: Box;
}
export interface ChartPlace {
  readonly route: string;
  readonly x: number;
  readonly y: number;
  readonly rank: PlaceRank;
  readonly pip: number;
  readonly room: string | null;
  readonly ring: number | null;
  readonly marks: readonly Mark[];
  readonly halo: number | null;
  readonly label: Label;
}
export interface ChartRoad {
  readonly pair: readonly [string, string];
  readonly d: string;
  readonly rooms: readonly string[];
}
export interface LessonChart {
  readonly frame: Box;
  readonly places: readonly ChartPlace[];
  readonly roads: readonly ChartRoad[];
  readonly tracks: readonly string[];
}

export const SLOT_ARC = 3.3;
export const RING_FLOOR = 9;

export function ringOf(_lessons: readonly ChartLesson[]): Ring {
  return { r: RING_FLOOR, arcs: [] };
}

export function pathFromHome(_route: string): readonly (readonly [string, string])[] | null {
  return null;
}

export function chartOfLessons(_rooms: readonly ChartRoom[]): LessonChart {
  return { frame: { x: 0, y: 0, w: 0, h: 0 }, places: [], roads: [], tracks: [] };
}
