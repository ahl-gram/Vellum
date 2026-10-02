import type { Rule } from "eslint";

const stub = (message: string): Rule.RuleModule => ({ meta: { type: "problem", messages: { stub: message } }, create: () => ({}) });

export default {
  rules: {
    "engine-no-id-lookup": stub("engine-no-id-lookup"),
    "worker-spawn-static": stub("worker-spawn-static"),
    "template-silent-escape": stub("template-silent-escape"),
    "e2e-cancellation-roster": stub("e2e-cancellation-roster"),
    "e2e-console-read-through-drop": stub("e2e-console-read-through-drop"),
  },
};
