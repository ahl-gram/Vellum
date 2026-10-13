export type ReadKind = "data" | "witness" | "kept";
export interface SourceRead {
  readonly reads: string;
  readonly kind: ReadKind;
}

export const SOURCE_READS: Readonly<Record<string, readonly SourceRead[]>> = {};
