import type { Rule } from "eslint";
import type { CSSRuleDefinition } from "@eslint/css";

export const CITED_ROOTS: readonly string[] = [];

const tsCitation: Rule.RuleModule = {
  meta: { type: "problem", messages: { found: "stub" } },
  create: () => ({}),
};

const cssCitation: CSSRuleDefinition = {
  meta: { type: "problem", messages: { found: "stub" } },
  create: () => ({}),
};

export default { rules: { "ts-comment-citation-resolves": tsCitation, "css-comment-citation-resolves": cssCitation } };
