import type { Rule } from "eslint";

const packageImportDeclared: Rule.RuleModule = {
  meta: {
    type: "problem",
    schema: [],
    messages: {
      undeclared:
        "{{name}} is imported here, but package.json declares it in neither dependencies nor devDependencies (an import type may declare its @types twin instead): it resolves only while another package pulls it in, and breaks the day that package drops it (Issue #826)",
    },
  },
  create: () => ({}),
};

export default { rules: { "package-import-declared": packageImportDeclared } };
