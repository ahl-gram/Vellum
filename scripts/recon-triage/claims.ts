export const KINDS = ["behavior", "existence", "count", "process"] as const;
export type Kind = (typeof KINDS)[number];
export type ClaimRow = {
  readonly claim: string;
  readonly source: string;
  readonly paths: readonly string[];
  readonly symbols: readonly string[];
  readonly kind: Kind;
};

export const parseClaims = (_text: string): ClaimRow[] => [];
