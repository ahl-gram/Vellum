import type { Rule } from "eslint";
import { bareNumbers, jsModuleNames } from "./css-comment-form.ts";

const noJsModule: Rule.RuleModule = {
  meta: {
    type: "problem",
    messages: {
      js: 'a comment names "{{name}}", a .js module: the source is TypeScript since Issue #260 and only the *.bundle.js twins are built, so name the .ts module or its successor',
    },
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          for (const name of jsModuleNames(comment.value))
            context.report({ loc: comment.loc!, messageId: "js", data: { name } });
        }
      },
    };
  },
};

const issueForm: Rule.RuleModule = {
  meta: {
    type: "problem",
    messages: { bare: "a comment names {{numbers}} bare: write Issue #N or PR #N, never a bare #N (Issue #675)" },
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          const numbers = bareNumbers(comment.value);
          if (numbers.length > 0)
            context.report({ loc: comment.loc!, messageId: "bare", data: { numbers: numbers.join(", ") } });
        }
      },
    };
  },
};

export default { rules: { "ts-comment-no-js-module": noJsModule, "ts-comment-issue-form": issueForm } };
