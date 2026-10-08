import type { Rule } from "eslint";

const stub = (message: string): Rule.RuleModule => ({
  meta: { type: "problem", messages: { found: message } },
  create: () => ({}),
});

export default {
  rules: {
    "world-no-philology": stub("stub"),
    "philology-no-entropy": stub("stub"),
    "home-client-no-engine": stub("stub"),
    "hunt-fixed-world": stub("stub"),
  },
};
