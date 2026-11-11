import type { Rule, SourceCode } from "eslint";
import type { CallExpression, Node } from "estree";
import { repoPath } from "./source-shape.ts";

type Keys = SourceCode.VisitorKeys;
type Found = { node: Node; path: readonly Node[] };
type Body = Node & { params: Node[]; body: Node };

const range = (n: Node): [number, number] => n.range as [number, number];
const within = (inner: Node, outer: Node | null | undefined): boolean =>
  outer != null && range(inner)[0] >= range(outer)[0] && range(inner)[1] <= range(outer)[1];
const isFn = (n: Node): boolean =>
  n.type === "FunctionDeclaration" || n.type === "FunctionExpression" || n.type === "ArrowFunctionExpression";
const isLoop = (n: Node): boolean =>
  n.type === "ForStatement" ||
  n.type === "ForInStatement" ||
  n.type === "ForOfStatement" ||
  n.type === "WhileStatement" ||
  n.type === "DoWhileStatement";

const dottedName = (n: Node): string | null => {
  if (n.type === "Identifier") return n.name;
  if (n.type !== "MemberExpression" || n.computed || n.property.type !== "Identifier") return null;
  const head = dottedName(n.object);
  return head === null ? null : `${head}.${n.property.name}`;
};

function testBody(call: CallExpression): Body | null {
  const fns = call.arguments.filter((a) => a.type === "ArrowFunctionExpression" || a.type === "FunctionExpression");
  return (fns[fns.length - 1] as Body | undefined) ?? null;
}

function titleOf(call: CallExpression, text: string): string {
  const first = call.arguments[0];
  if (first === undefined) return "";
  if (first.type === "Literal" && typeof first.value === "string") return first.value;
  if (first.type === "TemplateLiteral" && first.expressions.length === 0) return first.quasis[0]?.value.cooked ?? "";
  return text.slice(range(first)[0], range(first)[1]);
}

function collect(body: Body, keys: Keys) {
  const ctx = body.params[0]?.type === "Identifier" ? body.params[0].name : null;
  const isCheck = (name: string): boolean =>
    name === "assert" ||
    name.startsWith("assert.") ||
    /^(assert|expect)[A-Z]\w*$/.test(name) ||
    (ctx !== null && name.startsWith(`${ctx}.assert.`));
  const checks: Found[] = [];
  const announced: number[] = [];
  const exits: Found[] = [];
  const walk = (n: Node, path: readonly Node[]): void => {
    if (isFn(n)) return;
    if (n.type === "CallExpression") {
      const name = dottedName(n.callee);
      if (name !== null && isCheck(name)) checks.push({ node: n, path });
      if (ctx !== null && name === `${ctx}.skip`) announced.push(range(n)[0]);
    }
    if (n.type === "ReturnStatement" || n.type === "ContinueStatement") exits.push({ node: n, path });
    for (const key of keys[n.type] ?? []) {
      const value = (n as unknown as Record<string, unknown>)[key];
      for (const c of Array.isArray(value) ? (value as unknown[]) : [value])
        if (typeof (c as Node | null)?.type === "string") walk(c as Node, [...path, n]);
    }
  };
  walk(body.body, []);
  return { checks, announced, exits };
}

function everyCheckSkippable(body: Body, keys: Keys): boolean {
  const { checks, announced, exits } = collect(body, keys);
  if (checks.length === 0) return false;
  const holds = (n: Node | null | undefined): boolean => n != null && checks.some((c) => within(c.node, n));
  const underIf = ({ node, path }: Found): boolean =>
    path.some((g, i) => {
      const child = path[i + 1] ?? node;
      if (g.type === "ConditionalExpression") return child !== g.test;
      if (g.type !== "IfStatement" || child === g.test) return false;
      return !holds(child === g.consequent ? g.alternate : g.consequent);
    });
  const branchOf = ({ node, path }: Found): Node | undefined => {
    for (let i = path.length - 1; i >= 0; i--) {
      const g = path[i]!;
      if (g.type !== "IfStatement") continue;
      const child = path[i + 1] ?? node;
      return child === g.test ? undefined : child;
    }
    return undefined;
  };
  const skips = exits.filter((e) => {
    const branch = branchOf(e);
    if (branch === undefined) return false;
    const before = (at: number): boolean => at >= range(branch)[0] && at < range(e.node)[0];
    return !checks.some((c) => before(range(c.node)[0])) && !announced.some(before);
  });
  const skipped = (c: Found): boolean =>
    underIf(c) ||
    skips.some((e) => {
      if (range(e.node)[0] >= range(c.node)[0]) return false;
      if (e.node.type === "ReturnStatement") return true;
      const loop = [...e.path].reverse().find(isLoop);
      return loop !== undefined && within(c.node, loop);
    });
  return checks.every(skipped);
}

export const SKIPPABLE_TESTS: Readonly<Record<string, string>> = {
  "test/prospect/plate-face.test.ts :: every glyph's outline decodes to its own ink box, so no two numbers in the path data run together":
    'it walks FACES, the committed face tables that "the committed face tables are exactly what npm run plate-face writes" in this file pins, and skips only the space, the one glyph in each face with no outline to decode',
  "test/render/region-scalebar.test.ts :: #249, Issue #954: every region band's scale bar has its ticks inside its claimed box, so its labels stay on their paper":
    "it walks LOD_BANDS, a literal table in src/world/lod.ts, and skips only the world band; the Issue #954 tick test in this file pins its five region bands",
  "test/repo/constant-contracts.test.ts :: every region band obeys lodWindowFor's size <= 0.98 precondition":
    "it walks LOD_BANDS, a literal table in src/world/lod.ts whose five region bands the Issue #954 tick test in test/render/region-scalebar.test.ts pins, and checks only the region bands the precondition names",
  "test/site/astro-scaffold.test.ts :: every stage's notices stand in the kit's one shape, last in the stage: the live status pill, on the words its entry names and never on whitespace alone, the hidden render-worker warning, the scripts-off notice, and no page carries a pill or a warning its entry does not name (Issue #827, Issue #913)":
    "it walks PAGES, this file's literal roster, and checks every page: one NOTICES does not name by the two refusals above the continue, one it names by the shape below it",
  "test/site/astro-scaffold.test.ts :: every internal link and embed on the rendered pages resolves in the built tree":
    "it skips a link only by its kind (another site's, a page's own route, a file the deploy generates) and resolves every other, and every page links /shared/shell.css, which the shell.css test in this file pins, so each page resolves at least that one",
  "test/site/hero-charts.test.ts :: committed src/static/charts heroes match a fresh src/ render (structure exact, numbers ULP-tolerant)":
    "a chart byte-identical to its committed copy is the pass, so its continue skips no comparison it owes, and a render that produced no chart leaves every committed one an orphan, which the orphans test in this file reds on",
};

const testUnskippableCheck: Rule.RuleModule = {
  meta: {
    type: "problem",
    schema: [
      {
        type: "object",
        properties: { excused: { type: "object", additionalProperties: { type: "string", minLength: 1 } } },
        required: ["excused"],
        additionalProperties: false,
      },
    ],
    messages: {
      found:
        '"{{title}}" can pass with nothing checked: each of its checks sits under an if whose else checks nothing or under a ?:, or after a return or a continue that an if takes first, so a fixture that lacks the case passes it. Assert after the loop that the case was reached (a floor such as checked >= 1), announce the skip with t.skip(), or give the if an else that checks; a deliberate case is an entry in SKIPPABLE_TESTS in scripts/lint/skippable-checks.ts with its reason (Alex, Issue #1315 comment 6785163784)',
      stale:
        "{{entry}} is in SKIPPABLE_TESTS, but no test of that title in this file can pass with nothing checked, so the excuse lifts nothing: delete it rather than leave it looking like a decision (Issue #1329)",
    },
  },
  create(context) {
    const options = context.options[0] as { excused: Record<string, string> };
    const prefix = `${repoPath(context.filename)} :: `;
    const excused = new Set(Object.keys(options.excused).filter((k) => k.startsWith(prefix)));
    const used = new Set<string>();
    const keys = context.sourceCode.visitorKeys;
    const text = context.sourceCode.text;
    return {
      CallExpression(call) {
        if (call.callee.type !== "Identifier" || (call.callee.name !== "test" && call.callee.name !== "it")) return;
        const body = testBody(call);
        if (body === null || !everyCheckSkippable(body, keys)) return;
        const title = titleOf(call, text);
        const key = `${prefix}${title}`;
        if (excused.has(key)) used.add(key);
        else context.report({ node: call.callee, messageId: "found", data: { title } });
      },
      "Program:exit"(program) {
        for (const entry of excused)
          if (!used.has(entry)) context.report({ node: program, messageId: "stale", data: { entry } });
      },
    };
  },
};

export default { rules: { "test-unskippable-check": testUnskippableCheck } };
