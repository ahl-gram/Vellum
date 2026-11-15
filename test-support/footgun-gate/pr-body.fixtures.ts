import { join } from "node:path";
import { headingCheck, type Decision } from "../../.claude/skills/vellum-footguns/hooks/footgun-gate.ts";
import { bash, bodyWith, prBody, SCRATCH, SECTIONS, WHOLE_BODY, type Fixture } from "./kit.ts";

const asContext = (text: string): Decision => ({
  hookSpecificOutput: { hookEventName: "PreToolUse", additionalContext: text },
});
// Returns a deny when the check denied, so a row wanting context reds on the channel itself rather than on the text: warn and deny are different slots and only one of them stops the call.
const templateCheck = (file: string) => (): Decision => {
  const { deny: reason, warn } = headingCheck(WHOLE_BODY, file);
  return reason
    ? {
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: reason,
        },
      }
    : asContext(warn ?? "");
};
const headingRows = (): Fixture[] =>
  SECTIONS.map((heading): Fixture => [
    `pr body missing ${heading} denied`,
    prBody(bodyWith(SECTIONS.filter((s) => s !== heading))),
    "deny",
    `"${heading}"`,
  ]);

export const PR_BODY_ROWS: Fixture[] = [
  ["pr body via subshell cat read", bash('gh pr create --body "$(cat body.md)"', SCRATCH), "deny", "em-dash"],
  ["relative body-file resolved against cwd", bash("gh pr create --body-file body.md", SCRATCH), "deny", "em-dash"],
  ["unreadable body-file warns", bash("gh pr create --body-file nope.md", "/"), "context", "could not read"],
  [
    "pr body clean and whole gets gate 5 once",
    prBody(`Closes #519. #518 stays open.\n\n${WHOLE_BODY}`),
    "context",
    "## Gate 5",
  ],
  ...headingRows(),
  [
    "a section named mid-line does not count as the section",
    prBody(bodyWith(["see the ## Guards section above", ...SECTIONS.slice(1)])),
    "deny",
    "## Guards",
  ],
  ["short -b body carrying every section allowed", bash(`gh pr create -b '${WHOLE_BODY}'`), "context", "## Gate 5"],
  [
    "pr edit with no body at all is not held to the shape",
    bash("gh pr edit 5 --add-label chore"),
    "context",
    "## Gate 5",
  ],
  ["--fill builds the body inside gh and is not checked", bash("gh pr create --fill"), "context", "## Gate 5"],
  ["an inline body in a shell variable is not checked", bash('gh pr create --body "$BODY"'), "context", "## Gate 5"],
  [
    "an inline body from an unreadable file is not checked",
    bash('gh pr create --body "$(cat nope.md)"', "/"),
    "context",
    "could not read",
  ],
  ["pr comment is not held to the PR body shape", bash("gh pr comment 5 --body 'a note'"), null, ""],
  ["issue create is not held to the PR body shape", bash("gh issue create --title t --body 'a note'"), null, ""],
  [
    "a missing template warns and never denies",
    templateCheck("/nonexistent/PULL_REQUEST_TEMPLATE.md"),
    "context",
    "there is no PR template",
  ],
  [
    "a readable --body-file missing a section is denied",
    bash("gh pr create --body-file no-ran.md", SCRATCH),
    "deny",
    '"## Ran"',
  ],
  [
    "a readable --body-file carrying every section is allowed",
    bash("gh pr create --body-file whole.md", SCRATCH),
    "context",
    "## Gate 5",
  ],
  [
    "a $(cat file) on a non-body flag is not a PR body",
    bash('gh pr edit 5 --add-label "$(cat no-ran.md)"', SCRATCH),
    "context",
    "## Gate 5",
  ],
  [
    "a literal $ in a single-quoted body does not disarm the check",
    prBody(`${bodyWith(SECTIONS.filter((x) => x !== "## Ran"))}\nit cost $5\n`),
    "deny",
    '"## Ran"',
  ],
  [
    "a headingless template says so rather than missing",
    templateCheck(join(SCRATCH, "headingless.md")),
    "context",
    "carries no `## ` heading",
  ],
  // The same payload as the row above it, with the other needle: a warning returned in ghRefusal's DECISION slot short-circuits checkBash before the Gate 5 note is pushed, and every row that asserts only the warning's own text passes while the gate is gone.
  ["a warning does not swallow the gate 5 note", bash("gh pr create --body-file nope.md", "/"), "context", "## Gate 5"],
];
