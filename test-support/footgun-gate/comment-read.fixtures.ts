import { bash, type Fixture } from "./kit.ts";

const DENIED = [
  "gh api repos/o/r/issues/1/comments",
  "gh api --paginate repos/o/r/issues/1/comments --jq length",
  "gh api repos/o/r/issues/1/comments?per_page=100",
  "gh api https://api.github.com/repos/o/r/issues/1/comments",
  "gh api -X GET repos/o/r/issues/1/comments -f per_page=100",
  "gh api --method=get repos/o/r/pulls/1/comments",
  "gh api repos/o/r/pulls/1/reviews",
  "gh api repos/o/r/pulls/1/reviews/2/comments",
  "gh api repos/o/r/issues/1/timeline",
  "gh api repos/o/r/issues/comments",
  "gh api repos/o/r/issues/comments/7",
  "gh api repos/o/r/pulls/comments",
  "gh api repos/{owner}/{repo}/issues/1/comments",
  "env GH_PAGER=cat gh api repos/o/r/issues/1/comments",
  "ls && gh api repos/o/r/issues/1/comments",
  'gh api -X "GET" repos/o/r/issues/1/comments',
  "gh issue view 1 --comments",
  "gh issue view 1 --comments=true",
  "gh pr view 1 -c",
  "gh pr view 1 --json number -c",
  "gh issue view 1 --json number --comments=true",
  "gh pr view 1 --json comments,reviews",
  "gh pr view 1 --json latestReviews",
  "gh issue list --json number,comments",
  "gh issue view 1",
  "gh pr view 1",
];

const ALLOWED = [
  "gh api -X PATCH repos/o/r/issues/comments/7 -f body=x",
  "gh api -X DELETE repos/o/r/issues/comments/7",
  "gh api repos/o/r/pulls/1/reviews --input review.json",
  'gh api -X "POST" repos/o/r/issues/1/comments -f body=x',
  "gh api repos/o/r/issues/1 --jq .labels",
  "gh api repos/o/r/issues/1/labels",
  "gh api repos/o/r/pulls/1/files",
  "gh pr view 1 --json closingIssuesReferences",
  "gh pr view 1 --json state,headRefOid",
  "gh issue list --state open",
  "grep -n 'gh api repos/o/r/issues/1/comments' notes.md",
  "npm run --silent issue -- 1",
];

export const COMMENT_READ_ROWS: Fixture[] = [
  ...DENIED.map((command): Fixture => [
    `comment read denied: ${command}`,
    bash(command),
    "deny",
    "npm run --silent issue",
  ]),
  ...ALLOWED.map((command): Fixture => [`comment read allowed: ${command}`, bash(command), null, ""]),
  [
    "comment read allowed: gh issue comment 1 --body-file f.md (the missing body file is warned of, the post is not refused)",
    bash("gh issue comment 1 --body-file f.md"),
    "context",
    "vellum-footguns could not read the body file",
    "npm run --silent issue",
  ],
  ["a QUOTED comments path is a known miss, not a boundary", bash('gh api "repos/o/r/issues/1/comments"'), null, ""],
];
