import type { Rule } from "eslint";

const noErrorCast: Rule.RuleModule = {
  meta: { type: "problem", messages: { cast: "a value is never cast to Error or one of its kinds (Issue #799)" } },
  create: () => ({}),
};

export default { rules: { "no-error-cast": noErrorCast } };
