import type { Rule } from "eslint";

export const CTX_THROWING_WAITS: readonly string[] = ["waitSettled", "waitTurned", "settle"];

const e2eThrowInsideStep: Rule.RuleModule = {
  meta: { type: "problem", messages: { found: "stub" } },
  create: () => ({}),
};

export default { rules: { "e2e-throw-inside-step": e2eThrowInsideStep } };
