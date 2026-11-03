import type { Rule } from "eslint";
import { relative, resolve, sep } from "node:path";

const ROOT = resolve(import.meta.dirname, "..", "..");
export const CDP_HOMES: ReadonlyMap<string, string> = new Map([
  ["Input.dispatchKeyEvent", "e2e/support/input.ts"],
  ["about:blank", "e2e/support/nav.ts"],
  ["Emulation.setScriptExecutionDisabled", "e2e/support/scripts-off.ts"],
]);
const ONCE = "where it is written once (Issue #1016)";
const WHY: ReadonlyMap<string, string> = new Map([
  [
    "Emulation.setScriptExecutionDisabled",
    "whose withScriptsOff always turns page scripts back on, so no check can leave every check after it with scripts off (Issue #779)",
  ],
]);

const cdpThroughHelper: Rule.RuleModule = {
  meta: {
    type: "problem",
    messages: {
      found: "an e2e file sends {{spelling}} only through its helpers in {{home}}, {{why}}",
    },
  },
  create(context) {
    const file = relative(ROOT, context.filename).split(sep).join("/");
    const refuse = (node: Rule.Node, spelling: unknown): void => {
      if (typeof spelling !== "string") return;
      const home = CDP_HOMES.get(spelling);
      if (home !== undefined && home !== file)
        context.report({ node, messageId: "found", data: { spelling, home, why: WHY.get(spelling) ?? ONCE } });
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
