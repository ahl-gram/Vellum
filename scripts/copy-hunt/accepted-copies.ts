export type AcceptedSide = { readonly file: string; readonly name: string; readonly hash: string };
export type AcceptedCopy = {
  readonly a: AcceptedSide;
  readonly b: AcceptedSide;
  readonly reason: string;
  readonly ruling: string;
};
export const ACCEPTED_COPIES: readonly AcceptedCopy[] = [];
