import type { Pt } from "../geometry.ts";
import type { BiomeName } from "../../climate/biomes.ts";
import type { PlanPoint } from "../town-plan/types.ts";
import type { PlateEra } from "../caption.ts";
import type { PlateKeyEntry } from "../key.ts";

export type BirdseyeKind = "capital" | "seat" | "town" | "village";
export type Box = { readonly x0: number; readonly x1: number; readonly y0: number; readonly y1: number };

export type Sample = {
  readonly u: number;
  readonly v: number;
  readonly x: number;
  readonly y: number;
  readonly e: number;
  readonly land: boolean;
  readonly biome: BiomeName;
};
export type BirdseyeWindow = {
  readonly cols: number;
  readonly rows: number;
  readonly samples: ReadonlyArray<Sample>;
  readonly site: PlanPoint;
  readonly view: { readonly dx: number; readonly dy: number };
  readonly right: { readonly dx: number; readonly dy: number };
  readonly seaLevel: number;
  readonly span: number;
};

export type Stroke = { readonly from: Pt; readonly by: Pt };
export type Way = { readonly run: ReadonlyArray<Pt>; readonly grid: ReadonlyArray<PlanPoint>; readonly trunk: boolean };
export type Scatter =
  | {
      readonly kind: "tree";
      readonly x: number;
      readonly y: number;
      readonly s: number;
      readonly species: "round" | "pine" | "palm";
    }
  | {
      readonly kind: "field";
      readonly quad: ReadonlyArray<Pt>;
      readonly wash: "grass" | "ground";
      readonly slope: number;
    }
  | { readonly kind: "marsh"; readonly x: number; readonly y: number };

export type TownItem =
  | {
      readonly kind: "house";
      readonly grid: PlanPoint;
      readonly x: number;
      readonly y: number;
      readonly w: number;
      readonly depth: number;
      readonly h: number;
      readonly window: boolean;
    }
  | {
      readonly kind: "church";
      readonly x: number;
      readonly y: number;
      readonly great: boolean;
      readonly window: boolean;
    }
  | { readonly kind: "keep"; readonly x: number; readonly y: number; readonly scale: number; readonly window: boolean }
  | { readonly kind: "market"; readonly x: number; readonly y: number };
export type BirdseyeTown = {
  readonly ground: ReadonlyArray<ReadonlyArray<Pt>>;
  readonly blocks: ReadonlyArray<ReadonlyArray<Pt>>;
  readonly streets: ReadonlyArray<ReadonlyArray<Pt>>;
  readonly bridges: ReadonlyArray<readonly [Pt, Pt]>;
  readonly items: ReadonlyArray<TownItem>;
  readonly wall: {
    readonly ring: ReadonlyArray<Pt>;
    readonly towers: ReadonlyArray<Pt>;
    readonly gates: ReadonlyArray<Pt>;
    readonly grid: ReadonlyArray<PlanPoint>;
    readonly gateGrid: ReadonlyArray<PlanPoint>;
  } | null;
  readonly keepOut: ReadonlyArray<Pt>;
  readonly extent: Box;
};
export type Ship = {
  readonly x: number;
  readonly y: number;
  readonly s: number;
  readonly great: boolean;
  readonly wake: readonly [number, number, number];
  readonly grid: PlanPoint;
};
export type BirdseyeHarbour = { readonly quay: ReadonlyArray<Pt> | null; readonly ships: ReadonlyArray<Ship> };
export type Neighbour = {
  readonly x: number;
  readonly y: number;
  readonly name: string;
  readonly steeple: boolean;
  readonly houses: ReadonlyArray<{ readonly x: number; readonly y: number }>;
};
export type SeaBand = { readonly x0: number; readonly x1: number; readonly y: number; readonly score: number };

export type BirdseyeGeometry = {
  readonly seed: number;
  readonly index: number;
  readonly kind: BirdseyeKind;
  readonly era: PlateEra;
  readonly strips: ReadonlyArray<ReadonlyArray<Pt>>;
  readonly coast: ReadonlyArray<readonly [Pt, Pt]>;
  readonly hatch: ReadonlyArray<Stroke>;
  readonly shade: ReadonlyArray<Stroke>;
  readonly rivers: ReadonlyArray<ReadonlyArray<Pt>>;
  readonly roads: ReadonlyArray<Way>;
  readonly scatter: ReadonlyArray<Scatter>;
  readonly town: BirdseyeTown | null;
  readonly harbour: BirdseyeHarbour;
  readonly neighbours: ReadonlyArray<Neighbour>;
  readonly seaName: { readonly text: string; readonly bands: ReadonlyArray<SeaBand> } | null;
  readonly key: ReadonlyArray<PlateKeyEntry>;
};
