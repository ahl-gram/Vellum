import type { Rule } from "eslint";
import type { ImportDeclaration, ImportSpecifier, Program } from "estree";
import { repoPath } from "./source-shape.ts";

export type SharedBinding = readonly [name: string, from: string];
const SEATS: readonly SharedBinding[] = [
  ["bindRoom", "../shared/room.ts"],
  ["createZoomController", "../shared/zoom-controller.ts"],
  ["bindGlassKeys", "../shared/glass-keys.ts"],
];
const ANNOUNCER: SharedBinding = ["makeAnnouncer", "../shared/announce.ts"];
const STORE: SharedBinding = ["deviceStorage", "../shared/table-store.ts"];
const ITEM: SharedBinding = ["prospectItemFrom", "../shared/table-address.ts"];

export const SHARED_BINDINGS: Readonly<Record<string, readonly SharedBinding[]>> = {
  "src/site/print-room/seats.ts": SEATS,
  "src/site/prospect/seats.ts": SEATS,
  "src/site/ribbon/seats.ts": SEATS,
  "src/site/reading-room/seats.ts": SEATS,
  "src/site/seed-of-the-day/app.ts": [["createZoomController", "../shared/zoom-controller.ts"]],
  "src/site/explorer/app.ts": [["bindRoom", "../shared/room.ts"], ANNOUNCER, STORE, ["filingAt", "./chart-drawer.ts"]],
  "src/site/portfolio/app.ts": [ANNOUNCER, ["usesWorker", "../explorer/worker-client.ts"], STORE],
  "src/site/prospect/app.ts": [ITEM],
  "src/site/explorer/chart-drawer.ts": [ITEM],
};

type Typed = { importKind?: string };
const importedName = (specifier: ImportSpecifier): string =>
  specifier.imported.type === "Identifier" ? specifier.imported.name : String(specifier.imported.value);
const valueImport = (node: ImportDeclaration | ImportSpecifier): boolean => (node as Typed).importKind !== "type";

const takenAndUsed = (context: Rule.RuleContext, program: Program, name: string, from: string): boolean =>
  program.body
    .filter((st): st is ImportDeclaration => st.type === "ImportDeclaration")
    .filter((decl) => decl.source.value === from && valueImport(decl))
    .flatMap((decl) => decl.specifiers)
    .filter(
      (sp): sp is ImportSpecifier => sp.type === "ImportSpecifier" && importedName(sp) === name && valueImport(sp),
    )
    .some((sp) =>
      context.sourceCode
        .getDeclaredVariables(sp)
        .some((v) => v.references.some((ref) => (ref as { isValueReference?: boolean }).isValueReference !== false)),
    );

const sharedBindingImported: Rule.RuleModule = {
  meta: {
    type: "problem",
    schema: [
      {
        type: "object",
        properties: {
          required: {
            type: "object",
            additionalProperties: {
              type: "array",
              items: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 2 },
            },
          },
        },
        required: ["required"],
        additionalProperties: false,
      },
    ],
    messages: {
      missing:
        "{{file}} takes {{name}} from {{from}} and uses it, so the room binds the shared code rather than a copy of it (Issue #779, ruling 3 of comment 6098118329)",
    },
  },
  create(context) {
    const options = context.options[0] as { required: Record<string, SharedBinding[]> };
    const wanted = options.required[repoPath(context.filename)];
    if (wanted === undefined) return {};
    const file = repoPath(context.filename);
    return {
      "Program:exit"(program: Program) {
        for (const [name, from] of wanted)
          if (!takenAndUsed(context, program, name, from))
            context.report({ node: program, messageId: "missing", data: { file, name, from } });
      },
    };
  },
};

export default { rules: { "shared-binding-imported": sharedBindingImported } };
