// Issue #793 round: the TownPlan shape the plan (out/793-dry-run/793-plan.md, contract) names, in the world's grid space (x east, y south, cells), plus two fields this round adds and names for the fold: `quay` and `direction`.
export type PlanPoint = { readonly x: number; readonly y: number };
export type PlanGate = { readonly at: PlanPoint; readonly road: number };
export type LandmarkKind = "market" | "keep" | "church" | "bridge" | "harbour";
export type PlanLandmark = { readonly kind: LandmarkKind; readonly at: PlanPoint };
export type StreetSystem = "land" | "grid";
export type TownPlan = {
  readonly seed: number;
  readonly index: number;
  readonly centre: PlanPoint;
  readonly wall: ReadonlyArray<PlanPoint> | null;
  readonly gates: ReadonlyArray<PlanGate>;
  readonly streets: ReadonlyArray<ReadonlyArray<PlanPoint>>;
  readonly blocks: ReadonlyArray<ReadonlyArray<PlanPoint>>;
  readonly landmarks: ReadonlyArray<PlanLandmark>;
  // Added by this round: the runs of the wall ring that stand on the shore, each a run of consecutive wall points, so a drawer can close the town on the water with wall or open it with a quay (the menu's question).
  readonly quay: ReadonlyArray<ReadonlyArray<PlanPoint>>;
  // Added by this round for the sitting only: which street system drew the plan. A ruled planner has one and drops this.
  readonly direction: StreetSystem;
  // The radius in cells the plan was laid out in, for drawers framing it.
  readonly radius: number;
};
