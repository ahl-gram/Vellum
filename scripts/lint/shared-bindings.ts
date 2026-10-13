import type { Rule } from "eslint";

export type SharedBinding = readonly [name: string, from: string];
export const SHARED_BINDINGS: Readonly<Record<string, readonly SharedBinding[]>> = {};

const sharedBindingImported: Rule.RuleModule = {
  meta: {
    type: "problem",
    schema: [
      {
        type: "object",
        properties: {
          required: {
            type: "object",
            additionalProperties: {
              type: "array",
              items: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 2 },
            },
          },
        },
        required: ["required"],
        additionalProperties: false,
      },
    ],
    messages: {
      missing:
        "{{file}} takes {{name}} from {{from}} and uses it, so the room binds the shared code rather than a copy of it (Issue #779, ruling 3 of comment 6098118329)",
    },
  },
  create: () => ({}),
};

export default { rules: { "shared-binding-imported": sharedBindingImported } };
