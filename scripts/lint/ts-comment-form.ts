import type { Rule } from "eslint";
import { jsModuleNames } from "./css-comment-form.ts";

const noJsModule: Rule.RuleModule = {
  meta: { type: "problem", messages: { js: "a comment names \"{{name}}\", a .js module: the source is TypeScript since Issue #260 and only the *.bundle.js twins are built, so name the .ts module or its successor" } },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          for (const name of jsModuleNames(comment.value)) context.report({ loc: comment.loc!, messageId: "js", data: { name } });
        }
      },
    };
  },
};

export default { rules: { "ts-comment-no-js-module": noJsModule } };
