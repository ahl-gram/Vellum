import { Plugin } from "@opencode/plugin";

const EM_DASH = "—";

const BARE_STASH = /\bgit\s+stash\s+(pop|apply|drop|clear)\b|\bgit\s+stash\s*$/m;
const STASH_WITH_REF = /\bgit\s+stash\s+(apply|drop)\s+(stash@\{|\b[0-9a-f]{7,40}\b)/;

const PERL_I = /\bperl\s+-[0a-zA-Z]*i\b/;
const PERL_NON_ASCII = /[^\x00-\x7f]/;

const GH_API = /\bgh\s+api\b/;
const GH_API_BARE_ITEM = /\/?repos\/[^\s/]+\/[^\s/]+\/(?:issues|pulls)\/\d+\/?(?=\s|$)/;
const GH_API_DATA_FIELD = /(?:-[A-Za-z]*[fF]|--(?:raw-field|field|input)\b)/;

const NEGATED_CLOSE = /(\bnot|\bnever|\bno|\bwithout)\s+(clos(e|es|ed|ing)|fix(es|ed|ing)?)\s+(?:[\w.-]+\/[\w.-]+)?#\d+/i;

export default Plugin.define({
  id: "vellum-footguns",
  async setup(ctx) {
    await ctx.session.hook("prompt", (event) => {
      const text = event.prompt.text ?? "";
      const warnings: string[] = [];

      if (text.includes(EM_DASH)) {
        const inCode = /`[^`]*—[^`]*`|```[\s\S]*?```/.test(text);
        if (!inCode) {
          warnings.push(
            `vellum-footguns: the prompt carries an em-dash. The house forbids em-dashes in the prose of issue and PR bodies and comments; one inside inline backticks or a fenced code block passes.`,
          );
        }
      }

      if (BARE_STASH.test(text) && !STASH_WITH_REF.test(text)) {
        warnings.push(
          `vellum-footguns: a bare \`git stash\` mutation (pop, apply, drop, clear without an explicit ref) is refused by the house; refs/stash is shared across every worktree. Use \`git stash push -m <why> -- <paths>\`, \`git stash apply <sha>\`, or a WIP commit.`,
        );
      }

      if (PERL_I.test(text) && PERL_NON_ASCII.test(text)) {
        warnings.push(
          `vellum-footguns: \`perl -i\` with a non-ASCII replacement re-encodes every existing non-ASCII byte in the file. Use a node script or a heredoc.`,
        );
      }

      if (GH_API.test(text) && GH_API_BARE_ITEM.test(text) && GH_API_DATA_FIELD.test(text)) {
        const hasMethod = /(?:-X|--method)[=\s]*"?\w+/.test(text);
        if (!hasMethod) {
          warnings.push(
            `vellum-footguns: \`gh api\` on a bare issue or pull-request endpoint carrying a data field switches to POST, which UPDATES the item instead of commenting. Put \`/comments\` on the path, use \`gh issue comment N --body-file <file>\`, or say \`-X PATCH\` when editing IS the intent.`,
          );
        }
      }

      if (NEGATED_CLOSE.test(text)) {
        warnings.push(
          `vellum-footguns: GitHub reads "does not close #N" as a CLOSING reference (the keyword beside the number wins, the negation is ignored). Say it without the keyword.`,
        );
      }

      if (warnings.length > 0) {
        event.prompt.text = `${warnings.join("\n\n")}\n\n---\n\n${event.prompt.text}`;
      }
    });
  },
});
