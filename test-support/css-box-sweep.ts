/** The shape #565 is an instance of: a rule that takes a percentage width AND something that widens a content box, which on paper runs past the page box unless its border counts inside its width. */
export interface WideningRule {
  readonly selector: string;
  readonly declarations: Readonly<Record<string, string>>;
}

const WIDENS = /^(border|border-(left|right|inline|inline-start|inline-end)|padding|padding-(left|right|inline|inline-start|inline-end))$/;

const declarationsIn = (body: string): Record<string, string> =>
  Object.fromEntries(
    body.split(";").map((d) => d.split(":")).filter((p) => p.length >= 2)
      .map(([k, ...v]) => [k!.trim().toLowerCase(), v.join(":").trim()]),
  );

/** Blind spots, and the direction each errs: a width written through calc() or a var, a border added by a rule other than the one carrying the width (this reads one rule at a time), and native nesting, which no sheet here uses. Each costs a miss, never a false positive, so a caller that needs certainty reads the resolved page instead. */
export function fullWidthWideningRules(css: string): readonly WideningRule[] {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .map((m) => ({ selector: m[1]!.trim().replace(/\s+/g, " "), declarations: declarationsIn(m[2]!) }))
    .filter((rule) => /^[0-9.]+%$/.test(rule.declarations["width"] ?? "")
      && Object.entries(rule.declarations).some(([prop, value]) => WIDENS.test(prop) && !/^(0|none|0px|0rem|0%)$/.test(value)));
}
