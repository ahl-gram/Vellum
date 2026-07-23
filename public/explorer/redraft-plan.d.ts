// Hand-written declarations so TS unit tests can import the browser module
// (native type-stripping errors on untyped .js imports; precedent: sheet-turn.d.ts).
export function dryInNames(
  prevLabeledNames: ReadonlySet<string>,
  labeledNames: readonly string[],
): string[];
