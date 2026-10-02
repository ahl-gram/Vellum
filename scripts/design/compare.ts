export type Row = {
  readonly name: string;
  readonly present: readonly [boolean, boolean, boolean];
  readonly control: number | null;
  readonly branch: number | null;
  readonly errors: readonly string[];
};
export type Verdict = "same" | "differs" | "untrusted" | "errors" | "new" | "gone" | "missing";

export const aeOf = (stderr: string): number => Number.parseInt(stderr, 10);
export const verdictOf = (_row: Row): Verdict => "same";
export const failed = (_rows: readonly Row[]): boolean => false;
