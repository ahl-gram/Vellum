import type { Rule } from "eslint";

const stub = (message: string): Rule.RuleModule => ({
  meta: { type: "problem", messages: { found: message } },
  create: () => ({}),
});

export default {
  rules: {
    "prospect-item-through-builder": stub("stub"),
    "room-no-scroll": stub("stub"),
    "stage-no-status": stub("stub"),
  },
};
