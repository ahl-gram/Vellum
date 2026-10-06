import type { Rule } from "eslint";

type TypeNode = { type: string; typeName?: { type: string; name?: string }; types?: readonly TypeNode[] };

const ERROR_KINDS = new Set(["Error", "TypeError", "RangeError", "ReferenceError", "SyntaxError", "EvalError", "URIError", "AggregateError"]);

const namesErrorKind = (type: TypeNode): boolean =>
  (type.type === "TSTypeReference" && type.typeName?.type === "Identifier" && ERROR_KINDS.has(type.typeName.name ?? "")) ||
  ((type.type === "TSUnionType" || type.type === "TSIntersectionType") && (type.types ?? []).some(namesErrorKind));

const noErrorCast: Rule.RuleModule = {
  meta: {
    type: "problem",
    messages: {
      cast: "a value is never cast to Error or one of its kinds (Issue #799): a failure that is not an Error then reads as undefined, or throws for undefined and null; read a caught or rejected value's text through errorText (src/site/shared/error-text.ts, or the e2e runner's copy in e2e/support/suites.ts), narrow it with instanceof Error, or build a stand-in with new Error",
    },
  },
  create(context) {
    const judge = (node: Rule.Node): void => {
      if (namesErrorKind((node as unknown as { typeAnnotation: TypeNode }).typeAnnotation)) context.report({ node, messageId: "cast" });
    };
    return { TSAsExpression: judge, TSTypeAssertion: judge };
  },
};

export default { rules: { "no-error-cast": noErrorCast } };
