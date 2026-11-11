import type { Rule } from "eslint";

export const readCounts = (): { readonly trees: number; readonly texts: number } => ({ trees: 0, texts: 0 });

const wordForWord: Rule.RuleModule = {
  meta: {
    type: "problem",
    schema: [
      {
        type: "object",
        properties: {
          roots: { type: "array", items: { type: "string" }, minItems: 1 },
          accepted: { type: "array" },
        },
        required: ["roots", "accepted"],
        additionalProperties: false,
      },
    ],
    messages: {
      copy: "{{name}} is word for word {{copies}}: fold them into one function, or list each pair in scripts/copy-hunt/accepted-copies.ts with the ruling that keeps it (Issue #1332)",
    },
  },
  create: () => ({}),
};

export default { rules: { "no-word-for-word-copy": wordForWord } };
