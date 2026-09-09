// The pure core of the redraft's name dry-in: only newly labeled names dry in, keyed by name because region worlds renumber indices.

export function dryInNames(
  prevLabeledNames: ReadonlySet<string>,
  labeledNames: readonly string[],
): string[] {
  return labeledNames.filter((name) => !prevLabeledNames.has(name));
}
