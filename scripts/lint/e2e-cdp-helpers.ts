import type { Rule } from "eslint";

export const CDP_HOMES: ReadonlyMap<string, string> = new Map([["Input.dispatchKeyEvent", "e2e/support/input.ts"]]);

const cdpThroughHelper: Rule.RuleModule = {
  meta: {
    type: "problem",
    messages: {
      found:
        "an e2e file sends {{spelling}} only through its helpers in {{home}}, where it is written once (Issue #1016)",
    },
  },
  create() {
    return {};
  },
};

export default { rules: { "e2e-cdp-through-helper": cdpThroughHelper } };
