import { decide } from "../../scripts/agent-infra/hooks/claude-adapter.ts";
import { decideCodex } from "../../scripts/agent-infra/hooks/codex-adapter.ts";
import { HEADLESS_BUILD_VAR, HOOK_CHECK } from "../../scripts/agent-infra/hooks/headless-build.ts";
import type { Decision } from "../../scripts/agent-infra/hooks/hook-io.ts";
import { asCodex } from "./codex-rows.ts";
import { bash, ROOT, type Fixture, type Kind } from "./kit.ts";

const NEEDLE = "headless Codex build";

const inBuild = (command: string, want: Kind, needle: string): Fixture => {
  const row = `headless build: ${command}`;
  return [row, () => decideCodex(asCodex(bash(command), `selftest-${process.pid}-${row}`), ROOT, true), want, needle];
};

const marked = async (run: () => Promise<Decision>): Promise<Decision> => {
  const old = process.env[HEADLESS_BUILD_VAR];
  process.env[HEADLESS_BUILD_VAR] = "1409";
  try {
    return await run();
  } finally {
    if (old === undefined) delete process.env[HEADLESS_BUILD_VAR];
    else process.env[HEADLESS_BUILD_VAR] = old;
  }
};

const REFUSED = [
  "git push",
  HOOK_CHECK,
  "git -C /tmp/x push -u origin feat/1-x",
  "git add -A && git commit -m wip && git push",
  "env A=1 git push origin HEAD",
  "gh pr create --title t --body-file b.md",
  "gh pr edit 1 --add-label x",
  "gh pr comment 1 --body x",
  "gh pr merge 1 --squash",
  "gh issue create --title t --body x",
  "gh issue comment 1 --body-file f.md",
  "gh api repos/o/r/issues/1/comments -f body=x",
  "gh api -X PATCH repos/o/r/issues/1 -f title=x",
  "gh api --method DELETE repos/o/r/git/refs/heads/x",
  "gh api graphql -f query=x",
  "gh label create builder:codex",
  "gh workflow run ci.yml",
  "gh run rerun 1",
  "gh -R o/r pr create",
  "npm run proof -- send list.json",
  "npm run --silent proof -- read 1",
  "node scripts/proof-runner/main.ts read 1",
  "gh api repos/o/r/issues/1/comments -f body=x --jq -X",
  "gh api repos/o/r/issues/1/comments --input f.json",
  "gh api repos/o/r/issues/1/comments -F body=@f",
  "gh api repos/o/r/issues/1/comments --field body=x",
  "gh api repos/o/r/issues/1/comments --raw-field body=x",
  'gh api -X "GET" repos/o/r/issues/1/comments -f body=x',
  "npm run-script proof -- send list.json",
  "npm rum proof",
  "npm --silent run proof",
  "node ./scripts/proof-runner/main.ts read 1",
  "node --no-warnings scripts/proof-runner/main.ts read 1",
  "node /abs/scripts/proof-runner/main.ts read 1",
  "gh api repos/o/r/issues/1",
  "gh api repos/o/r/issues/1/comments --paginate",
  "gh api -X GET search/issues -f q=x",
  "gh api --method=get repos/o/r/pulls/1",
  "gh pr view 1 --json state",
  "gh pr checks 1",
  "gh pr list --head feat/1-x --state all",
  "gh issue view 1",
  "gh run view 1 --log",
  "gh --version",
  "gh api -X GET repos/o/r/issues/1/comments -f body=x",
  "gh api repos/o/r/issues/1/comments --jq .x -X GET -f body=x",
  "/opt/homebrew/bin/gh api user",
  "/usr/bin/git push",
  '"git" push',
  "'git' push",
  "bash -c 'git push'",
  "sh -c 'git push'",
  "zsh -lc 'npm test'",
  "bash scripts/x.sh",
  "echo x | sh",
  "eval 'git push'",
  "source x.sh",
  ". x.sh",
  "echo x | xargs git push",
  "xargs -n1 git push",
  "timeout 60 git push",
  "nice -n 5 git push",
  "env -u GIT_CONFIG_COUNT git push",
  "echo `git push`",
  "echo $(git push)",
  "git --git-dir=/r/.git push",
  "git -c alias.p=push p",
  "git -c credential.helper=osxkeychain fetch",
  "git --config-env=credential.helper=X fetch",
  "git config alias.p push",
  "git config --global credential.helper osxkeychain",
  "git credential fill",
  "git credential-osxkeychain get",
  "security find-internet-password -s github.com -w",
  "npm -C . run proof",
  "npm --prefix . run-script proof -- send l.json",
  "npx tsx scripts/proof-runner/main.ts read 1",
];

const PASSED = [
  "git commit -m x",
  "git fetch origin",
  "git ls-remote origin refs/heads/x",
  "git log --oneline origin/main..HEAD",
  "git -C /tmp/x status",
  "git config --get user.email",
  "git diff origin/main -- scripts/proof-runner/main.ts",
  'grep -n "git push" notes.md',
  "cat scripts/proof-runner/main.ts",
  "ls .git",
  "npm test",
  "npm run check",
  "npm test -- test/repo/proof-runner-send.test.ts",
  "node scripts/agent-sandbox.ts list",
];

const session = (row: string): string => `selftest-${process.pid}-${row}`;
const OUTSIDE = "outside a build: gh pr comment is not refused";
const CLAUDE = "a Claude session carrying the build variable: git push";
const UNMARKED = "an unmarked Codex call carrying the build variable: git push";

export const HEADLESS_ROWS: Fixture[] = [
  ...REFUSED.map((command) => inBuild(command, "deny", NEEDLE)),
  ...PASSED.map((command) => inBuild(command, null, "")),
  [OUTSIDE, () => decideCodex(asCodex(bash("gh pr comment 1 --body x"), session(OUTSIDE)), ROOT), null, ""],
  [CLAUDE, () => marked(() => decide({ ...bash("git push"), session_id: session(CLAUDE) })), "context", "## Gate 5"],
  [
    UNMARKED,
    () => marked(() => decideCodex(asCodex(bash("git push"), session(UNMARKED)), ROOT, false)),
    "context",
    "## Gate 5",
  ],
];
