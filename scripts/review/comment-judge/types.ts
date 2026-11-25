export type CommentRun = {
  readonly file: string;
  readonly line: number;
  readonly endLine: number;
  readonly start: number;
  readonly end: number;
  readonly text: string;
  readonly ownLine: boolean;
  readonly code: string;
};
export type Candidate = { readonly file: string; readonly name: string; readonly body: string };
export type PinnedBy = { readonly file: string; readonly name: string; readonly noul: number };
export type Outcome =
  | { readonly kind: "finding"; readonly pinnedBy: readonly PinnedBy[]; readonly restates: number | null }
  | { readonly kind: "clear" }
  | { readonly kind: "unsettled"; readonly highest: number }
  | { readonly kind: "skipped"; readonly reason: string };
