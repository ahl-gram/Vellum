import type { Rule } from "eslint";
import { relative, resolve, sep } from "node:path";

const ROOT = resolve(import.meta.dirname, "..", "..");
const METHOD = "Emulation.setScriptExecutionDisabled";
const HELPER = "e2e/support/scripts-off.ts";

const scriptsOffThroughHelper: Rule.RuleModule = {
  meta: {
    type: "problem",
    messages: {
      found: `an e2e file turns page scripts off only through withScriptsOff in ${HELPER}, which always turns them back on, so no check can leave every check after it with scripts off (Issue #779)`,
    },
  },
  create(context) {
    if (relative(ROOT, context.filename).split(sep).join("/") === HELPER) return {};
    return {
      Literal(node) {
        if (node.value === METHOD) context.report({ node, messageId: "found" });
      },
      TemplateLiteral(node) {
        if (node.expressions.length === 0 && node.quasis[0]?.value.cooked === METHOD)
          context.report({ node, messageId: "found" });
      },
    };
  },
};

export default { rules: { "e2e-scripts-off-through-helper": scriptsOffThroughHelper } };
