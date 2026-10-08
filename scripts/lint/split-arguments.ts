import type { Rule } from "eslint";
import { repoPath } from "./source-shape.ts";

export const SPLIT_FILES: readonly string[] = [
  "src/site/explorer/app.ts",
  "src/site/explorer/chart-drawer-bind.ts",
  "src/site/explorer/controls.ts",
  "src/site/explorer/glass.ts",
  "src/site/explorer/hash-sync.ts",
  "src/site/explorer/sheet-turn.ts",
  "src/site/explorer/worker.ts",
  "src/site/shared/zoom-controller.ts",
  "src/site/home/input.ts",
  "src/site/home/veil.ts",
  "src/site/print-room/app.ts",
  "src/site/reading-frame/dated-log.ts",
  "src/site/reading-frame/index.ts",
  "src/site/reading-room/app.ts",
  "src/site/reading-room/prospect-stage.ts",
  "src/site/seed-of-the-day/app.ts",
  "src/site/seed-of-the-day/app-hunt.ts",
  "src/site/seed-of-the-day/app-dispatch.ts",
];

// Older calls that hand values on under other names, excused as written (Alex, Issue #654 comment 5939656565, decision B).
export const OLDER_CALLS: Readonly<Record<string, readonly string[]>> = {
  "src/site/home/veil.ts": ["startSounding(veil.status, opts.random ?? Math.random)"],
  "src/site/print-room/app.ts": [
    'downloadBlob(new Blob([svg], { type: "image/svg+xml" }), filename)',
    "downloadSvg(res.svg, filename)",
    "downloadBlob(png.blob, filename)",
    "orderPoster(b.dataset.poster as string)",
  ],
  "src/site/reading-room/app.ts": [
    "onTold(t)",
    "prospectHrefFor(forSeed, s)",
    "armRoom(lastRes, shownSeed, undefined)",
    "restFor(pendingLive)",
  ],
  "src/site/seed-of-the-day/app.ts": [
    'dryIn($("folio-title"), "120ms")',
    'dryIn($("folio-sub"), "260ms")',
    'dryIn($("folio-coords"), "320ms")',
    'dryIn($("folio-note"), "400ms")',
  ],
  "src/site/seed-of-the-day/app-hunt.ts": [
    'restart(line, "wet")',
    "prevSeed(seed)",
    "writeStore({ solved: seed, streak })",
    'restart(share, "rise")',
    'setHuntStatus(fromClick ? `Found it in ${guesses} ${guesses === 1 ? "guess" : "guesses"}.` : "Already found today. Come back tomorrow for a new world.")',
    'restart($("streak"), "stamp")',
    "setHuntStatus(`${BAND_PROSE[feedback.band]}${marked}${trail}`)",
    'setHuntStatus("Copied your result to the clipboard.")',
  ],
};

type Node = Rule.Node;
const collapse = (text: string): string => text.replace(/\s+/g, " ").trim();

function paramName(param: Node, text: string): string {
  if (param.type === "Identifier") return param.name;
  if (param.type === "AssignmentPattern") return paramName(param.left as Node, text);
  if (param.type === "RestElement") return paramName(param.argument as Node, text);
  const typed = param as Node & { range: [number, number]; typeAnnotation?: { range: [number, number] } };
  const inner = (param as unknown as { parameter?: Node }).parameter;
  if (inner) return paramName(inner, text);
  return text.slice(typed.range[0], typed.typeAnnotation ? typed.typeAnnotation.range[0] : typed.range[1]).trim();
}

const splitArgumentsByName: Rule.RuleModule = {
  meta: {
    type: "problem",
    schema: [
      {
        type: "object",
        properties: {
          excused: { type: "object", additionalProperties: { type: "array", items: { type: "string" } } },
        },
        required: ["excused"],
        additionalProperties: false,
      },
    ],
    messages: {
      swapped:
        "{{call}} hands ({{args}}) for its parameters ({{params}}): a split builder hands each value under the name of the parameter it lands in, so two values of one type cannot trade places with the type check green (Issue #654)",
      stale:
        "the excused call {{call}} is no longer found as written in this file, so the excuse is stale or the call was edited (Alex, Issue #654 comment 5939656565, decision B)",
      idle: "this file is on the split builders' list but hands nothing to a function of its own, so the list is stale (Issue #654)",
    },
  },
  create(context) {
    const options = context.options[0] as { excused: Record<string, string[]> };
    const excused = [...(options.excused[repoPath(context.filename)] ?? [])];
    const text = context.sourceCode.text;
    const parts = new Map<string, string[]>();
    let handed = 0;
    return {
      Program(program) {
        for (const st of program.body as Node[])
          if (st.type === "FunctionDeclaration")
            parts.set(
              st.id.name,
              st.params.map((q) => paramName(q as Node, text)),
            );
      },
      CallExpression(node) {
        const params = node.callee.type === "Identifier" ? parts.get(node.callee.name) : undefined;
        if (!params || node.arguments.length === 0) return;
        handed++;
        const args = node.arguments.map((a) => context.sourceCode.getText(a));
        const call = `${(node.callee as { name: string }).name}(${args.map(collapse).join(", ")})`;
        const at = excused.indexOf(call);
        if (at !== -1) excused.splice(at, 1);
        else if (args.length !== params.length || args.some((a, i) => a !== params[i]))
          context.report({
            node,
            messageId: "swapped",
            data: { call: (node.callee as { name: string }).name, args: args.join(", "), params: params.join(", ") },
          });
      },
      "Program:exit"(program) {
        for (const call of excused) context.report({ node: program, messageId: "stale", data: { call } });
        if (handed === 0) context.report({ node: program, messageId: "idle" });
      },
    };
  },
};

export default { rules: { "split-arguments-by-name": splitArgumentsByName } };
