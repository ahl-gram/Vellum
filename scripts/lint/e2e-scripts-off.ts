import type { Rule } from "eslint";

const scriptsOffThroughHelper: Rule.RuleModule = {
  meta: {
    type: "problem",
    messages: { found: "stub" },
  },
  create() {
    return {};
  },
};

export default { rules: { "e2e-scripts-off-through-helper": scriptsOffThroughHelper } };
