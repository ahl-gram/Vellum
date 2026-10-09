// A hand-authored file outside src/ (CLAUDE.md): the house's lint rules that keep a hover's lift a token, its tip a promise that the surface goes somewhere, and an inline-block's bullet on line one (Issue #779 part 2d), imported by eslint.config.ts and never run by Node directly.
import type { CSSRuleDefinition } from "@eslint/css";
import { generate, type CssNode } from "@eslint/css-tree";
import {
  armsOf,
  childrenOf,
  collapse,
  declarationsOf,
  sheetKey,
  sourceOf,
  subjectOf,
  walkValue,
  type RuleNode,
} from "./sheet-tokens.ts";

// The grander plate, gallery and atlas scales are a question Issue #405 left standing, so each literal is sanctioned at its exact file, selector and value.
export const SANCTIONED_LIFTS: Readonly<Record<string, string>> = {
  "motion.css :: .plate:hover": "-5px",
  "motion.css :: .plate:active": "-1px",
  "src/atlas/document.ts :: .atlas-sheet figure a img:hover": "-5px",
  "src/atlas/document.ts :: .atlas-sheet figure a img:active": "-1px",
  "src/cli/gallery.ts :: figure img:hover": "-4px",
  "src/cli/gallery.ts :: figure img:active": "-1px",
};

/** The surfaces that tip AND navigate (each is a link or wraps one). */
export const TIPPING_LINKS: readonly string[] = [
  "motion.css :: .plate:hover",
  "motion.css :: body:has(.room-name) .wordmark a:hover, body:has(.room-name) .wordmark a:focus-visible",
  // Issue #270 ruling 7: the footnote marks follow through to /glossary/ anchors, so the ruling extended the tipping surface to them.
  "explorer/broadside.css :: a.fn:hover",
  // `cardFigureHtml` in `src/cli/gallery.ts` wraps every contact-sheet plate in a link to the Explorer at the plate's seed (gallery-room.test.ts GR5 pins it).
  "src/cli/gallery.ts :: figure img:hover",
  // The lift is scoped to figure a img, so where no link is made no lift applies (the Print Room's hidden copy carries no link).
  "src/atlas/document.ts :: .atlas-sheet figure a img:hover",
  "living-chart.css :: .pc-prospect:hover, .pc-prospect:focus-visible",
  "reading-room/index.css :: .rr-prospect a:hover img, .rr-prospect a:focus-visible img",
];

/** Chart instruments (ratified 2026-08-24, PR #468 live review): a station pip's grow promises "this opens the station's slip in place" and the slip's Enter link is what leaves the page; kept apart from TIPPING_LINKS so that set stays true when it says a surface goes somewhere. */
export const CHART_INSTRUMENTS: readonly string[] = [
  "index.css :: .lf-station:hover .lf-station-glyph, .lf-station:focus-visible .lf-station-glyph",
];

/** Park a line here only with the measurement written under it. */
export const TIPS_AWAITING_A_RULING: readonly string[] = [];

// Hand-measured (Issue #356): an inline-block takes its baseline from its LAST line box, so a wrapped slip drops its bullet 26.00px to line two; each entry is a measurement of the markup taken 2026-08-12 that the box is no list item, so re-take it when you touch one.
export const INLINE_BLOCKS_OUTSIDE_MARKER_LISTS: readonly string[] = [
  // Inside <p class="wordmark"> or <h1 class="wordmark"> in BaseLayout's head cluster (Issue #461; the rooms nav pins vertical-align itself).
  "motion.css :: .wordmark a",
  // A period mark inline in a control's label (Issue #270), not a list item.
  "explorer/broadside.css :: a.fn",
];

const strings = { type: "array", items: { type: "string" } } as const;
const objectOf = (properties: Record<string, unknown>) => [
  { type: "object", properties, required: Object.keys(properties), additionalProperties: false },
];

type Loc = NonNullable<CssNode["loc"]>;
const locOf = (node: unknown): Loc => (node as { loc: Loc }).loc;

const functionsNamed = (value: CssNode, name: string): CssNode[] => {
  const found: CssNode[] = [];
  walkValue(value, (n) => {
    if (n.type === "Function" && n.name.toLowerCase() === name) found.push(n);
  });
  return found;
};

const atRest = (fn: CssNode): boolean => {
  const kids = childrenOf(fn);
  const first = kids[0];
  if (kids.length !== 1 || !first) return false;
  if (first.type === "Function") return first.name.toLowerCase() === "var";
  return (first.type === "Number" || first.type === "Dimension") && Number(first.value) === 0;
};

const argumentOf = (fn: CssNode & { type: "Function" }): string =>
  generate(fn)
    .slice(fn.name.length + 1, -1)
    .trim();

const staleEntries = (key: string, entries: readonly string[], used: ReadonlySet<string>): string[] =>
  entries.filter((entry) => entry.startsWith(`${key} :: `) && !used.has(entry));

const liftByToken: CSSRuleDefinition = {
  meta: {
    type: "problem",
    schema: objectOf({ sanctioned: { type: "object", additionalProperties: { type: "string" } } }),
    messages: {
      literal:
        '"{{selector}}" lifts by the literal {{lift}}: the house lift is translateY(var(--raise)) (or --press), and a literal stands only as a SANCTIONED_LIFTS entry for this file, every arm at this value (Issue #405)',
      stale:
        "{{entry}} is in SANCTIONED_LIFTS but no hover or active rule in this file lifts by it: delete the entry rather than leaving it to look like a decision (Issue #405)",
    },
  },
  create(context) {
    const { sanctioned } = context.options[0] as { sanctioned: Readonly<Record<string, string>> };
    const key = sheetKey(context.filename);
    const text = context.sourceCode.text;
    const used = new Set<string>();
    return {
      Rule(node) {
        const rule = node as unknown as RuleNode;
        const selector = collapse(sourceOf(text, rule.prelude));
        if (!/:hover|:active/.test(selector)) return;
        const arms = armsOf(text, rule.prelude).map((arm) => `${key} :: ${arm.text}`);
        for (const d of declarationsOf(rule))
          for (const fn of functionsNamed(d.value, "translatey")) {
            if (atRest(fn) || fn.type !== "Function") continue;
            const lift = argumentOf(fn);
            if (arms.length > 0 && arms.every((arm) => Object.hasOwn(sanctioned, arm) && sanctioned[arm] === lift))
              for (const arm of arms) used.add(arm);
            else context.report({ loc: locOf(d), messageId: "literal", data: { selector, lift } });
          }
      },
      "StyleSheet:exit"(node) {
        for (const entry of staleEntries(key, Object.keys(sanctioned), used))
          context.report({ loc: locOf(node), messageId: "stale", data: { entry } });
      },
    };
  },
};

type TipLists = {
  readonly links: readonly string[];
  readonly instruments: readonly string[];
  readonly awaiting: readonly string[];
};

const tipGoesSomewhere: CSSRuleDefinition = {
  meta: {
    type: "problem",
    schema: objectOf({ links: strings, instruments: strings, awaiting: strings }),
    messages: {
      tip: '{{entry}} tips on hover but is no TIPPING_LINKS entry: the tip promises "goes somewhere" (Issue #289), and only a ratified CHART_INSTRUMENTS entry carries a different rule, or a TIPS_AWAITING_A_RULING entry with its measurement until Alex rules',
      stale:
        "{{entry}} is on a tip list but no hover rule in this file tips there: delete the line rather than leaving it to look like a decision someone made (Issue #360)",
    },
  },
  create(context) {
    const { links, instruments, awaiting } = context.options[0] as TipLists;
    const listed = [...links, ...instruments, ...awaiting];
    const key = sheetKey(context.filename);
    const text = context.sourceCode.text;
    const used = new Set<string>();
    return {
      Rule(node) {
        const rule = node as unknown as RuleNode;
        const selector = collapse(sourceOf(text, rule.prelude));
        if (!selector.includes(":hover")) return;
        if (!declarationsOf(rule).some((d) => functionsNamed(d.value, "rotate").length > 0)) return;
        const entry = `${key} :: ${selector}`;
        if (listed.includes(entry)) used.add(entry);
        else context.report({ loc: locOf(rule.prelude), messageId: "tip", data: { entry } });
      },
      "StyleSheet:exit"(node) {
        for (const entry of staleEntries(key, listed, used))
          context.report({ loc: locOf(node), messageId: "stale", data: { entry } });
      },
    };
  },
};

type Settled = { readonly props: Map<string, string>; readonly pseudo: boolean; at: Loc | null };
const valueText = (value: CssNode): string =>
  (value.type === "Raw" ? collapse(value.value) : generate(value)).toLowerCase();

const inlineBlockBullet: CSSRuleDefinition = {
  meta: {
    type: "problem",
    schema: objectOf({ outside: strings }),
    messages: {
      bullet:
        "{{entry}} settles display: inline-block, so as a marker-bearing list item a wrapped entry drops its bullet to line two (Issue #356): settle vertical-align: top for it in this file, or record it in INLINE_BLOCKS_OUTSIDE_MARKER_LISTS with the markup that exempts it (Issue #358)",
      stale:
        "{{entry}} is in INLINE_BLOCKS_OUTSIDE_MARKER_LISTS but is no inline-block this file settles: delete the exemption rather than leaving it to look like cover (Issue #358)",
    },
  },
  create(context) {
    const { outside } = context.options[0] as { outside: readonly string[] };
    const key = sheetKey(context.filename);
    const text = context.sourceCode.text;
    const settled = new Map<string, Settled>();
    return {
      Rule(node) {
        const rule = node as unknown as RuleNode;
        for (const arm of armsOf(text, rule.prelude)) {
          const pseudo = subjectOf(arm.node).some(
            (n) => n.type === "PseudoClassSelector" || n.type === "PseudoElementSelector",
          );
          const entry = settled.get(arm.text) ?? { props: new Map<string, string>(), pseudo, at: null };
          for (const d of declarationsOf(rule)) {
            entry.props.set(d.property.toLowerCase(), valueText(d.value));
            if (d.property.toLowerCase() === "display") entry.at = locOf(d);
          }
          settled.set(arm.text, entry);
        }
      },
      "StyleSheet:exit"(node) {
        const used = new Set<string>();
        for (const [arm, { props, pseudo, at }] of settled) {
          if (pseudo || props.get("display") !== "inline-block" || !at) continue;
          const entry = `${key} :: ${arm}`;
          if (outside.includes(entry)) used.add(entry);
          else if (props.get("vertical-align") !== "top")
            context.report({ loc: at, messageId: "bullet", data: { entry } });
        }
        for (const entry of staleEntries(key, outside, used))
          context.report({ loc: locOf(node), messageId: "stale", data: { entry } });
      },
    };
  },
};

export default {
  rules: {
    "css-lift-by-token": liftByToken,
    "css-tip-goes-somewhere": tipGoesSomewhere,
    "css-inline-block-bullet": inlineBlockBullet,
  },
};
