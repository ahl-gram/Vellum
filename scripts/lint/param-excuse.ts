import type { Rule } from "eslint";

const paramExcuseHoldsElement: Rule.RuleModule = {
  meta: {
    type: "problem",
    schema: [
      {
        type: "object",
        properties: { names: { type: "array", items: { type: "string" } } },
        required: ["names"],
        additionalProperties: false,
      },
    ],
    messages: { found: "stub" },
  },
  create: () => ({}),
};

export default { rules: { "param-excuse-holds-element": paramExcuseHoldsElement } };
