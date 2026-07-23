// Sub 9 (#170) Ceremony: the pure core of the redraft's name dry-in. A region sheet
// labels more names than the coarser sheet it replaces (finer scale, fewer collisions);
// the ceremony dries ONLY those newly labeled names in, tier-staggered, while every
// name that already had a placed label on the outgoing composition (the world sheet
// plus a prior inset) stays put. Name-keyed, like the pin continuity (#169): region
// worlds renumber indices, names are the stable identity.
// Pure and DOM-free so it is unit-testable under Node (test/explorer/redraft-plan.test.ts);
// lod-controller.js owns reading the DOM sheets into the inputs.

/**
 * The labeled names of the incoming sheet that were NOT labeled on the outgoing
 * composition: these are the names the ceremony dries in. Order is preserved. Names
 * only: the tier stagger reads each group's own data-tier attribute in CSS, so the
 * plan does not carry it.
 * @param {Set<string>} prevLabeledNames  names with a placed label on the outgoing sheets
 * @param {ReadonlyArray<string>} labeledNames  the incoming sheet's labeled settlement names
 * @returns {Array<string>}
 */
export function dryInNames(prevLabeledNames, labeledNames) {
  return labeledNames.filter((name) => !prevLabeledNames.has(name));
}
