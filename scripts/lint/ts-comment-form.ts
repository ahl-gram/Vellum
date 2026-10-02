import type { Rule } from "eslint";

const noJsModule: Rule.RuleModule = { meta: { type: "problem", messages: { js: "stub" } }, create: () => ({}) };

export default { rules: { "ts-comment-no-js-module": noJsModule } };
