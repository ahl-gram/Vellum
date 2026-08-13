// #170: the pure core of the redraft's name dry-in. The ceremony dries ONLY newly
// labeled names in; every name already labeled on the outgoing composition stays put.
// Name-keyed like the pin continuity (#169): region worlds renumber indices, names are
// the stable identity. Pure and DOM-free (test/explorer/redraft-plan.test.ts).

/** The incoming sheet's labeled names NOT labeled on the outgoing composition, order preserved; the tier stagger reads data-tier in CSS, so the plan carries names only. */
export function dryInNames(
  prevLabeledNames: ReadonlySet<string>,
  labeledNames: readonly string[],
): string[] {
  return labeledNames.filter((name) => !prevLabeledNames.has(name));
}
