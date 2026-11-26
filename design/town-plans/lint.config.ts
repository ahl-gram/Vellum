// Issue #793 round: the house's own prospect rule, vellum/prospect-libm-clock-free (prospectLibmClockFree in scripts/lint/source-shape.ts at this sha), run over the round's code with nothing else switched on. Run from the tree: npx eslint --flag unstable_native_nodejs_ts_config --no-config-lookup -c out/793/lint.config.ts <files>
import tseslint from "typescript-eslint";
import sourceShape from "../../scripts/lint/source-shape.ts";

export default [
  {
    files: ["**/*.ts"],
    languageOptions: { parser: tseslint.parser, ecmaVersion: "latest", sourceType: "module" },
    plugins: { vellum: { rules: sourceShape.rules } },
    rules: { "vellum/prospect-libm-clock-free": "error" },
  },
];
