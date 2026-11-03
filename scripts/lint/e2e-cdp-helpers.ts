import type { Rule } from "eslint";
import { relative, resolve, sep } from "node:path";

const ROOT = resolve(import.meta.dirname, "..", "..");
export const CDP_HOMES: ReadonlyMap<string, string> = new Map([["Input.dispatchKeyEvent", "e2e/support/input.ts"]]);

const cdpThroughHelper: Rule.RuleModule = {
  meta: {
    type: "problem",
    messages: {
      found:
        "an e2e file sends {{spelling}} only through its helpers in {{home}}, where it is written once (Issue #1016)",
    },
  },
  create(context) {
    const file = relative(ROOT, context.filename).split(sep).join("/");
    const refuse = (node: Rule.Node, spelling: unknown): void => {
      if (typeof spelling !== "string") return;
      const home = CDP_HOMES.get(spelling);
      if (home !== undefined && home !== file) context.report({ node, messageId: "found", data: { spelling, home } });
    };
    return {
      Literal(node) {
        refuse(node, node.value);
      },
      TemplateLiteral(node) {
        if (node.expressions.length === 0) refuse(node, node.quasis[0]?.value.cooked);
      },
    };
  },
};

export default { rules: { "e2e-cdp-through-helper": cdpThroughHelper } };
