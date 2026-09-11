/** The shape #565 is an instance of: a rule that takes a full width AND something that widens a content box, which on paper runs past the page box unless its border counts inside its width. Blind spots, each a silent miss unless named otherwise: a width written through calc() or a var, and native nesting, which no sheet here uses. Out of contract rather than missed: a side margin overflows a container too, but box-sizing cannot cure it, so this sweep is not the guard for it. The one false-positive direction, deliberate, is a widener declared in a DIFFERENT rule than the width, since this reads one rule at a time. */
export interface WideningRule {
  readonly selector: string;
  readonly declarations: Readonly<Record<string, string>>;
}

const WIDENS = /^(border|border-(width|style)|border-(left|right|inline|inline-start|inline-end)(-(width|style))?|padding|padding-(left|right|inline|inline-start|inline-end))$/;

const ZERO = /^(0|none|0px|0rem|0%)$/;

const FULL = /^[0-9.]+%$/;

const declarationsIn = (body: string): Record<string, string> =>
  Object.fromEntries(
    body.split(";").map((d) => d.split(":")).filter((p) => p.length >= 2)
      .map(([k, ...v]) => [k!.trim().toLowerCase(), v.join(":").trim()]),
  );

export function fullWidthWideningRules(css: string): readonly WideningRule[] {
  return [...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .map((m) => ({ selector: m[1]!.trim().replace(/\s+/g, " "), declarations: declarationsIn(m[2]!) }))
    .filter((rule) => (FULL.test(rule.declarations["width"] ?? "") || FULL.test(rule.declarations["inline-size"] ?? ""))
      && Object.entries(rule.declarations).some(([prop, value]) => WIDENS.test(prop) && !ZERO.test(value)));
}
