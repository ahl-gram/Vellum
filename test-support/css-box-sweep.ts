/** The shape #565 is an instance of: a rule that takes a percentage width AND something that widens a content box, which on paper runs past the page box unless its border counts inside its width. Blind spots, and the direction each errs: a width written through calc() or a var, a widener declared in a DIFFERENT rule than the one carrying the width (this reads one rule at a time, and that direction is a false positive rather than a miss), and native nesting, which no sheet here uses. Comments are stripped first, because a comment between the width and the border silently hid the widener from the first cut of this. */
export interface WideningRule {
  readonly selector: string;
  readonly declarations: Readonly<Record<string, string>>;
}

// Only the properties that widen a box HORIZONTALLY: border-top and its kin are left out on purpose, since they move nothing toward a page's right edge. The longhand spellings are here because border-style alone widens a box (border-width defaults to medium), which escaped the first cut of this regex (guard-prover, 2026-09-11).
const WIDENS = /^(border|border-(width|style)|border-(left|right|inline|inline-start|inline-end)(-(width|style))?|padding|padding-(left|right|inline|inline-start|inline-end))$/;

const ZERO = /^(0|none|0px|0rem|0%)$/;

const declarationsIn = (body: string): Record<string, string> =>
  Object.fromEntries(
    body.split(";").map((d) => d.split(":")).filter((p) => p.length >= 2)
      .map(([k, ...v]) => [k!.trim().toLowerCase(), v.join(":").trim()]),
  );

export function fullWidthWideningRules(css: string): readonly WideningRule[] {
  return [...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .map((m) => ({ selector: m[1]!.trim().replace(/\s+/g, " "), declarations: declarationsIn(m[2]!) }))
    .filter((rule) => /^[0-9.]+%$/.test(rule.declarations["width"] ?? "")
      && Object.entries(rule.declarations).some(([prop, value]) => WIDENS.test(prop) && !ZERO.test(value)));
}
