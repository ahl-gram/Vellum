// A hand-authored file outside src/ (CLAUDE.md): the house's lint rules that keep each piece of dress in the sheet that owns it, the house's, the kit's and the engine's (Issue #779 part 2d), imported by eslint.config.ts and never run by Node directly.
import type { CSSRuleDefinition } from "@eslint/css";
import { parse, toPlainObject, walk, type CssNode } from "@eslint/css-tree";
import {
  armsOf,
  childrenOf,
  declarationsOf,
  readSheet,
  sheetKey,
  sheetsOnDisk,
  subjectOf,
  type Arm,
  type RuleNode,
} from "./sheet-tokens.ts";

const selectorNodes = (node: CssNode, outsideNot: boolean): CssNode[] => {
  if (outsideNot && node.type === "PseudoClassSelector" && node.name.toLowerCase() === "not") return [];
  return [node, ...childrenOf(node).flatMap((kid) => selectorNodes(kid, outsideNot))];
};

const classesIn = (arm: CssNode, outsideNot = false): string[] =>
  selectorNodes(arm, outsideNot).flatMap((n) => (n.type === "ClassSelector" ? [n.name] : []));
const idsIn = (arm: CssNode): string[] =>
  selectorNodes(arm, false).flatMap((n) => (n.type === "IdSelector" ? [n.name] : []));
const subjectIs = (arm: CssNode, element: string): boolean =>
  subjectOf(arm).some((n) => n.type === "TypeSelector" && n.name.toLowerCase() === element);

type Check = (args: {
  key: string;
  arms: Arm[];
  rule: RuleNode;
}) => Array<{ node: CssNode; data: Record<string, string> }>;

const ruleOf = (message: string, check: (key: string) => Check | null): CSSRuleDefinition => ({
  meta: { type: "problem", messages: { found: message } },
  create(context) {
    const key = sheetKey(context.filename);
    const run = check(key);
    if (!run) return {};
    return {
      Rule(node) {
        const rule = node as unknown as RuleNode;
        for (const { node: at, data } of run({ key, arms: armsOf(context.sourceCode.text, rule.prelude), rule }))
          context.report({ loc: (at as { loc: NonNullable<typeof node.loc> }).loc, messageId: "found", data });
      },
    };
  },
});

const declarationsIf = (hit: boolean, rule: RuleNode, wanted: (property: string) => boolean): ReturnType<Check> =>
  hit
    ? declarationsOf(rule).flatMap((d) =>
        wanted(d.property.toLowerCase()) ? [{ node: d, data: { property: d.property } }] : [],
      )
    : [];

const INTRO_VOICE: ReadonlySet<string> = new Set(["color", "font", "font-family", "font-style"]);
const houseOwnsIntro = ruleOf(
  "{{property}} binds the intro voice outside public/house.css, the one sheet that writes it: give the page's own element a class of its own instead (Issue #324, Issue #709)",
  (key) =>
    key === "house.css"
      ? null
      : ({ arms, rule }) =>
          declarationsIf(
            arms.some((a) => classesIn(a.node, true).includes("intro")),
            rule,
            (p) => INTRO_VOICE.has(p),
          ),
);

const houseOwnsControls = ruleOf(
  "{{property}} re-skins the controls on a select-and-button list outside public/house.css, the one sheet that writes the control idiom (Issue #324, Issue #709)",
  (key) =>
    key === "house.css"
      ? null
      : ({ arms, rule }) =>
          declarationsIf(
            arms.some((a) => subjectIs(a.node, "select")) && arms.some((a) => subjectIs(a.node, "button")),
            rule,
            (p) => p === "background" || p.startsWith("background-"),
          ),
);

const classesNamedIn = (text: string): string[] => {
  const names: string[] = [];
  walk(toPlainObject(parse(text, { onParseError() {} })), (node) => {
    if (node.type === "Rule")
      names.push(...selectorNodes(node.prelude, false).flatMap((n) => (n.type === "ClassSelector" ? [n.name] : [])));
  });
  return names;
};

export const kitClassesFrom = (kit: readonly string[], others: readonly string[]): Set<string> => {
  const theirs = new Set(others.flatMap(classesNamedIn));
  return new Set(kit.flatMap(classesNamedIn).filter((c) => !theirs.has(c) && c !== "strip")).add("room");
};

const kitClasses = (): Set<string> => {
  const sheets = sheetsOnDisk();
  const read = (paths: readonly string[]): string[] => paths.flatMap((path) => readSheet(path) ?? []);
  return kitClassesFrom(
    read(sheets.filter((path) => /^public\/atelier[^/]*\.css$/.test(path))),
    read(["public/house.css", "public/motion.css", "public/shell.css"]),
  );
};

const HOUSE_SHEETS = /^(atelier[^/]*|house|motion|fonts|shell)\.css$/;
const KIT_IDS: ReadonlySet<string> = new Set(["sheet", "map-viewport", "map", "zoom-in", "zoom-out", "zoom-reset"]);
const OWN_ELEMENT: ReadonlySet<string> = new Set(["select", "input", "option", "optgroup", "textarea", "label"]);
const REDRESS =
  /^(color|background(-color|-image)?|border(-[a-z]+)?|outline(-color)?|box-shadow|font(-[a-z]+)?|letter-spacing|text-decoration|text-transform|opacity)$/;

const redressing = (kit: ReadonlySet<string>, arm: CssNode): boolean => {
  if (idsIn(arm).some((id) => !KIT_IDS.has(id))) return false;
  const classes = classesIn(arm);
  if (classes.length === 0 || !classes.every((c) => kit.has(c))) return false;
  return !subjectOf(arm).some((n) => n.type === "TypeSelector" && OWN_ELEMENT.has(n.name.toLowerCase()));
};

const kitNotRedressed = ruleOf(
  "{{arm}} re-dresses the kit with {{property}}: a page seats a component and does not re-dress it, so move the dress onto the page's own element or state, or into public/atelier.css (Issue #487, Issue #302)",
  (key) => {
    if (HOUSE_SHEETS.test(key)) return null;
    const kit = kitClasses();
    return ({ arms, rule }) =>
      arms
        .filter((a) => redressing(kit, a.node))
        .flatMap((a) =>
          declarationsIf(true, rule, (p) => REDRESS.test(p)).map((f) => ({ ...f, data: { ...f.data, arm: a.text } })),
        );
  },
);

const ROW_ARMS: ReadonlySet<string> = new Set([".cr-num", ".cr-text", ".contents .cr-num", ".contents .cr-text"]);
const kitOwnsContentsRow = ruleOf(
  "{{arm}} re-dresses the kit's contents row, which public/atelier.css dresses; a page inks a row only under its own state (.contents li.on .cr-num) (Issue #487)",
  (key) =>
    key === "atelier.css"
      ? null
      : ({ arms }) => arms.filter((a) => ROW_ARMS.has(a.text)).map((a) => ({ node: a.node, data: { arm: a.text } })),
);

const SELECT_DRESS = (p: string): boolean =>
  p.replace(/^-[a-z]+-/, "") === "appearance" || p === "background-image" || p === "background";
const kitOwnsSelectDress = ruleOf(
  "{{property}} on .folio-controls select.control re-dresses the corner's select, which public/atelier.css dresses; a page sets only its width (Issue #487)",
  (key) =>
    key === "atelier.css"
      ? null
      : ({ arms, rule }) =>
          declarationsIf(
            arms.some((a) => a.text === ".folio-controls select.control"),
            rule,
            SELECT_DRESS,
          ),
);

const isHook = (n: CssNode): boolean =>
  (n.type === "ClassSelector" && /^(place-overlay|place-hit|ages-range|pc-.+|voyage-.+)$/.test(n.name)) ||
  (n.type === "IdSelector" && n.name === "place-card") ||
  (n.type === "AttributeSelector" && n.name.name === "data-ink");

const engineDressOneHome = ruleOf(
  "{{arm}} dresses an engine hook outside public/living-chart.css, the engine's one sheet: edit the dressing there, keyed on the mount class (Issue #302)",
  (key) =>
    key === "living-chart.css"
      ? null
      : ({ arms }) =>
          arms
            .filter((a) => selectorNodes(a.node, true).some(isHook))
            .map((a) => ({ node: a.node, data: { arm: a.text } })),
);

const engineNoHostId = ruleOf(
  "{{arm}} names #{{id}}, a host's own element: the engine's sheet keys on the mount class and the engine's own #place-card, never a host's id (Issue #302)",
  (key) =>
    key === "living-chart.css"
      ? ({ arms }) =>
          arms.flatMap((a) =>
            idsIn(a.node)
              .filter((id) => id !== "place-card")
              .map((id) => ({ node: a.node, data: { arm: a.text, id } })),
          )
      : null,
);

export default {
  rules: {
    "css-house-owns-intro": houseOwnsIntro,
    "css-house-owns-controls": houseOwnsControls,
    "css-kit-not-redressed": kitNotRedressed,
    "css-kit-owns-contents-row": kitOwnsContentsRow,
    "css-kit-owns-select-dress": kitOwnsSelectDress,
    "css-engine-dress-one-home": engineDressOneHome,
    "css-engine-no-host-id": engineNoHostId,
  },
};
