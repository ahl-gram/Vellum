import type { Rule } from "eslint";
import { relative, sep } from "node:path";

const EM_DASH = String.fromCharCode(0x2014);

const noEmDashInString: Rule.RuleModule = {
  meta: {
    type: "problem",
    schema: [
      {
        type: "object",
        properties: { allow: { type: "object", additionalProperties: { type: "integer" } } },
        additionalProperties: false,
      },
    ],
    messages: {
      dash: "an em-dash is not written in a string in shipped code; use a comma, a colon or a period, or write the escape for U+2014 where the character itself is the subject (Issue #935)",
    },
  },
  create(context) {
    const allow = (context.options[0] as { allow?: Record<string, number> } | undefined)?.allow ?? {};
    const tolerated = allow[relative(context.cwd, context.filename).split(sep).join("/")] ?? 0;
    let seen = 0;
    const judge = (node: Rule.Node): void => {
      if (!context.sourceCode.getText(node).includes(EM_DASH)) return;
      seen += 1;
      if (seen > tolerated) context.report({ node, messageId: "dash" });
    };
    return {
      Literal: (node) => {
        if (typeof node.value === "string") judge(node);
      },
      TemplateElement: judge,
    };
  },
};

export default { rules: { "no-em-dash-in-string": noEmDashInString } };
