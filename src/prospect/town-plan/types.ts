export type PlanPoint = { readonly x: number; readonly y: number }; // grid space, in cells: x east, y south
export type PlanGate = { readonly at: PlanPoint; readonly road: number };
export type LandmarkKind = "market" | "keep" | "church" | "bridge" | "harbour";
export type PlanLandmark = { readonly kind: LandmarkKind; readonly at: PlanPoint };
export type TownPlan = {
  readonly seed: number;
  readonly index: number;
  readonly centre: PlanPoint; // the settlement's world cell
  readonly radius: number; // the footprint's radius, in cells
  readonly wall: ReadonlyArray<PlanPoint> | null; // a closed ring, its first point not repeated; null for a village
  readonly gates: ReadonlyArray<PlanGate>;
  readonly streets: ReadonlyArray<ReadonlyArray<PlanPoint>>;
  readonly blocks: ReadonlyArray<ReadonlyArray<PlanPoint>>;
  readonly landmarks: ReadonlyArray<PlanLandmark>;
  readonly quay: ReadonlyArray<ReadonlyArray<PlanPoint>>; // runs of the wall's points, or an open village's outline's, that stand on the shore
};
