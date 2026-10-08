import type { Rule } from "eslint";
import { inTypePosition, repoPath, stringText } from "./source-shape.ts";
import { bare, keyName, literalText, memberName } from "./import-bounds.ts";

type Node = Rule.Node;

const problem = (message: string): Rule.RuleMetaData => ({ type: "problem", messages: { found: message } });

const BUILDER = "src/site/shared/table-address.ts";
const prospectItemThroughBuilder: Rule.RuleModule = {
  meta: problem(
    "a prospect table item is built by prospectItemFrom in src/site/shared/table-address.ts alone: a second spelling of the item can differ from it, and the table compares items byte for byte, so one plate would sit twice and miscount the cap (Issue #522)",
  ),
  create(context) {
    if (repoPath(context.filename) === BUILDER) return {};
    return {
      ObjectExpression(node) {
        const values = new Map<string, Node>();
        for (const p of node.properties as Node[]) {
          const key = p.type === "Property" ? keyName(p) : null;
          if (key !== null && p.type === "Property") values.set(key, p.value as Node);
        }
        const kind = values.get("kind");
        if (kind && literalText(bare(kind)) === "prospect" && values.has("style"))
          context.report({ node, messageId: "found" });
      },
    };
  },
};

const SCROLL_CALLS = new Set(["scrollIntoView", "scrollTo", "scrollBy"]);
const SCROLL_WRITES = new Set(["scrollTop", "scrollLeft"]);
const roomNoScroll: Rule.RuleModule = {
  meta: problem(
    "a chart room moves no reading position: no scroll call and no scroll write, so a reader's place holds while the story plays (Issue #442 decision 4, ruled 2026-08-22)",
  ),
  create(context) {
    const found = (node: Node): void => context.report({ node, messageId: "found" });
    const written = (target: Node): void => {
      if (SCROLL_WRITES.has(memberName(bare(target)) ?? "")) found(target);
    };
    return {
      CallExpression(node) {
        const callee = bare(node.callee as Node);
        if (SCROLL_CALLS.has(memberName(callee) ?? "")) found(node);
        else if (callee.type === "Identifier" && (callee.name === "scrollTo" || callee.name === "scrollBy"))
          found(node);
      },
      AssignmentExpression: (node) => written(node.left as Node),
      UpdateExpression: (node) => written(node.argument as Node),
    };
  },
};

const ID_LOOKUPS = new Set(["$", "getElementById"]);
const stageNoStatus: Rule.RuleModule = {
  meta: problem(
    "the prospect stage writes nothing to the polite status line: the settle signal is the host's (Issue #311)",
  ),
  create(context) {
    const found = (node: Node): void => context.report({ node, messageId: "found" });
    const named = (node: Node): void => {
      const at = node.type === "TemplateElement" ? node.parent : node;
      if (stringText(node)?.includes("#status") && !inTypePosition(at.parent ?? at)) found(node);
    };
    return {
      Identifier(node) {
        if (node.name === "statusEl" && !inTypePosition(node.parent)) found(node);
      },
      Literal: named,
      TemplateElement: named,
      CallExpression(node) {
        const callee = bare(node.callee as Node);
        const name = callee.type === "Identifier" ? callee.name : memberName(callee);
        if (ID_LOOKUPS.has(name ?? "") && literalText(node.arguments[0] as Node) === "status") found(node);
      },
    };
  },
};

export default {
  rules: {
    "prospect-item-through-builder": prospectItemThroughBuilder,
    "room-no-scroll": roomNoScroll,
    "stage-no-status": stageNoStatus,
  },
};
