// A hand-authored file outside src/ (CLAUDE.md): the house's ESLint plugin for the sheets under public/, imported by eslint.config.ts and never run by Node directly; it exists here because Issue #648 rules that a house lint rule is a local plugin in TypeScript under scripts/.
import type { CSSRuleDefinition } from "@eslint/css";
import type { Comment } from "@eslint/css-tree";

type Placed = Comment & { loc: NonNullable<Comment["loc"]> };

const placed = (comments: ReadonlyArray<Comment> | undefined): Placed[] =>
  (comments ?? []).filter((c): c is Placed => c.loc !== null && c.loc !== undefined);

const isHead = (text: string, comment: Placed): boolean => text.slice(0, comment.loc.start.offset).trim() === "";

// A # followed by digits, not preceded by "issue" or "pr" (either case, singular or plural) and one space, and not followed by a hex letter; whitespace is collapsed first so a head block may wrap between the word and the number. Named directions, all false reds and never a miss: an all-digit hex colour (#333), a fragment after a word (page.html#12), an HTML entity (&#8212;), and any prefix other than Issue and PR.
const BARE_NUMBER = /(?<!\b(?:issue|issues|pr) )#\d+(?![0-9a-f])/i;

const oneLine: CSSRuleDefinition = {
  meta: {
    type: "problem",
    messages: { multi: "a mid-file CSS comment is one physical line; only the file-head block may span several (Issue #648)" },
  },
  create(context) {
    return {
      StyleSheet() {
        for (const c of placed(context.sourceCode.comments)) {
          if (c.loc.start.line !== c.loc.end.line && !isHead(context.sourceCode.text, c)) context.report({ loc: c.loc, messageId: "multi" });
        }
      },
    };
  },
};

const noEmDash: CSSRuleDefinition = {
  meta: { type: "problem", messages: { dash: "no em-dash in a CSS comment (Issue #648)" } },
  create(context) {
    return {
      StyleSheet() {
        for (const c of placed(context.sourceCode.comments)) {
          if (c.value.includes("\u2014")) context.report({ loc: c.loc, messageId: "dash" });
        }
      },
    };
  },
};

const issueForm: CSSRuleDefinition = {
  meta: { type: "problem", messages: { bare: "write Issue #N or PR #N in a CSS comment, never a bare #N (Issue #648)" } },
  create(context) {
    return {
      StyleSheet() {
        for (const c of placed(context.sourceCode.comments)) {
          if (BARE_NUMBER.test(c.value.replace(/\s+/g, " "))) context.report({ loc: c.loc, messageId: "bare" });
        }
      },
    };
  },
};

export default {
  meta: { name: "vellum" },
  rules: { "css-comment-one-line": oneLine, "css-comment-no-em-dash": noEmDash, "css-comment-issue-form": issueForm },
};
