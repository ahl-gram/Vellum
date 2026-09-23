export type RuntimeEdit = { readonly line: number; readonly before: string; readonly after: string };
export type PortComparison = {
  readonly tokens: readonly [number, number];
  readonly literals: readonly [number, number];
  readonly literalDiffs: number;
  readonly payloads: readonly [number, number];
  readonly payloadDiffs: number;
  readonly renames: readonly string[];
  readonly edits: readonly RuntimeEdit[];
};

export function compareSources(before: string, after: string, afterIsTs: boolean, existsAsTs: (specifier: string) => boolean): PortComparison {
  return { tokens: [0, 0], literals: [0, 0], literalDiffs: 0, payloads: [0, 0], payloadDiffs: 0, renames: [], edits: [] };
}
