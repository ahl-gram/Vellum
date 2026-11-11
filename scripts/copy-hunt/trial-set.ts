export const SCAN = "276cb6ae7f19fbccb85504ff1e67bffbcbb98039";
export const CONTROL = "bc970d0efdbbca9e21cb747e6c97506aabb63558";
export type TrialSide = { readonly file: string; readonly line: number; readonly name: string };
export type TrialRow = {
  readonly sha: string;
  readonly a: TrialSide;
  readonly b: TrialSide;
  readonly same: boolean;
  readonly then: number;
};
export const TRIAL_ROWS: readonly TrialRow[] = [];
