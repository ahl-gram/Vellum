import type { Rule } from "eslint";
import type { CSSRuleDefinition } from "@eslint/css";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { noteText, ownLineAt, runs, type Loc, type Note } from "./comment-notes.ts";

const ROOT = resolve(import.meta.dirname, "..", "..");
export const CITED_ROOTS: readonly string[] = ["src", "test", "scripts", "e2e", "test-support", "public"];
const CITATION = new RegExp(
  `\`([A-Za-z_]\\w*)\`\\s+in\\s+\`?((?:${CITED_ROOTS.join("|")})/[\\w./-]+\\.(?:ts|mjs|astro|css))\`?`,
  "g",
);

type Finding = { readonly loc: Loc; readonly message: string };

function findings(notes: readonly Note[]): Finding[] {
  return runs(notes).flatMap((run) => {
    const starts: number[] = [];
    let at = 0;
    for (const note of run) {
      starts.push(at);
      at += note.text.length + 1;
    }
    const joined = run.map((n) => n.text).join(" ");
    return [...joined.matchAll(CITATION)].flatMap((m): Finding[] => {
      const [, symbol, path] = m;
      const where = run[starts.findLastIndex((s) => s <= m.index)]!.loc;
      const target = resolve(ROOT, path!);
      if (!existsSync(target)) return [{ loc: where, message: `cites ${path}, which does not exist` }];
      const found = new RegExp(`\\b${symbol}\\b`).test(readFileSync(target, "utf8"));
      return found ? [] : [{ loc: where, message: `cites \`${symbol}\` in ${path}, which does not name it` }];
    });
  });
}

const MESSAGE =
  "a comment {{finding}}: cite code as `symbol` in `repo/relative/path`, a file that exists and names the symbol, and never fall back to a line number (handbook/specs/conventions.md, How code is cited)";

const tsCitation: Rule.RuleModule = {
  meta: { type: "problem", messages: { found: MESSAGE } },
  create(context) {
    return {
      Program() {
        const text = context.sourceCode.text;
        const notes = context.sourceCode.getAllComments().map((c): Note => ({
          text: noteText(c.value, c.type === "Block"),
          ownLine: ownLineAt(text, c.range![0]),
          loc: c.loc!,
        }));
        for (const f of findings(notes))
          context.report({ loc: f.loc, messageId: "found", data: { finding: f.message } });
      },
    };
  },
};

const cssCitation: CSSRuleDefinition = {
  meta: { type: "problem", messages: { found: MESSAGE } },
  create(context) {
    return {
      StyleSheet() {
        const text = context.sourceCode.text;
        const notes = (context.sourceCode.comments ?? []).flatMap((c): Note[] =>
          c.loc ? [{ text: noteText(c.value, true), ownLine: ownLineAt(text, c.loc.start.offset), loc: c.loc }] : [],
        );
        for (const f of findings(notes))
          context.report({ loc: f.loc, messageId: "found", data: { finding: f.message } });
      },
    };
  },
};

export default { rules: { "ts-comment-citation-resolves": tsCitation, "css-comment-citation-resolves": cssCitation } };
