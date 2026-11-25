import { test } from "node:test";
import assert from "node:assert/strict";
import { readIssue, USAGE, type ReaderReads } from "../../scripts/agent-infra/issue-reader/main.ts";
import { parseLines, threadOf } from "../../scripts/agent-infra/issue-reader/thread.ts";

const NO_NAME = "an account whose name is not shown";

type Raw = Record<string, unknown>;

const link = (id: number): string => `https://github.com/ahl-gram/Vellum/issues/9#issuecomment-${id}`;

const comment = (id: number, association: unknown, body: string, login = "someone"): Raw => ({
  id,
  html_url: link(id),
  user: { login },
  ...(association === undefined ? {} : { author_association: association }),
  created_at: "2026-11-22T10:00:00Z",
  body,
});

const issueOf = (opener: string, extra: Raw = {}): Raw => ({
  number: 9,
  state: "open",
  title: "A title",
  body: "An opening text",
  html_url: "https://github.com/ahl-gram/Vellum/issues/9",
  user: { login: "ahl-gram" },
  author_association: opener,
  created_at: "2026-11-20T10:00:00Z",
  ...extra,
});

const lines = (items: readonly Raw[]): string => items.map((item) => JSON.stringify(item)).join("\n");

const readsOf = (issue: Raw, listings: Record<string, readonly Raw[]> = {}, asked: string[] = []): ReaderReads => ({
  issue: () => JSON.stringify(issue),
  listing: (path) => {
    asked.push(path);
    return lines(listings[path] ?? []);
  },
});

test("the reader passes the owner's, members' and collaborators' text and withholds every other account's (Issue #1417)", () => {
  const associations = [
    "OWNER",
    "MEMBER",
    "COLLABORATOR",
    "NONE",
    "CONTRIBUTOR",
    "FIRST_TIME_CONTRIBUTOR",
    "FIRST_TIMER",
    "MANNEQUIN",
    "owner",
    undefined,
    7,
    ["OWNER"],
    { value: "OWNER" },
    null,
  ];
  const written = associations.map((association, i) => comment(i + 1, association, `body ${i + 1}`));
  const thread = threadOf({
    issue: issueOf("OWNER"),
    comments: [...parseLines(lines(written)), ...parseLines("this is not json {")],
    reviews: [],
    reviewComments: [],
  });
  assert.equal(thread.comments.length, 15);
  assert.deepEqual(
    thread.comments.map((entry) => entry.body),
    ["body 1", "body 2", "body 3", ...Array<null>(12).fill(null)],
  );
});

test("an outsider's words reach neither output, while the link to each does (Issue #1417)", () => {
  const issue = issueOf("NONE", {
    title: "PLANTED-TITLE",
    body: "PLANTED-BODY",
    pull_request: { url: "https://api.github.com/repos/ahl-gram/Vellum/pulls/9" },
  });
  const planted = (id: number, body: string): Raw => ({
    ...comment(id, "NONE", body),
    html_url: `https://github.com/ahl-gram/Vellum/pull/9#planted-${id}`,
    diff_hunk: "PLANTED-HUNK",
    state: "COMMENTED",
    submitted_at: "2026-11-22T11:00:00Z",
  });
  const reads = readsOf(issue, {
    "issues/9/comments": [planted(1, "PLANTED-COMMENT")],
    "pulls/9/reviews": [planted(2, "PLANTED-REVIEW")],
    "pulls/9/comments": [planted(3, "PLANTED-REVIEW-COMMENT")],
  });
  const text = readIssue(["9"], reads);
  const json = readIssue(["9", "--json"], reads);
  for (const run of [text, json]) {
    assert.doesNotMatch(run.stdout, /PLANTED-(TITLE|BODY|COMMENT|REVIEW|HUNK)/);
    assert.equal(run.code, 0);
    assert.equal(run.stderr, "");
  }
  for (const url of [
    "https://github.com/ahl-gram/Vellum/issues/9",
    "https://github.com/ahl-gram/Vellum/pull/9#planted-1",
    "https://github.com/ahl-gram/Vellum/pull/9#planted-2",
    "https://github.com/ahl-gram/Vellum/pull/9#planted-3",
  ]) {
    assert.ok(text.stdout.includes(url), url);
  }
});

test("the header counts the comments shown and withheld (Issue #1417)", () => {
  const reads = readsOf(issueOf("OWNER"), {
    "issues/9/comments": [comment(1, "OWNER", "a"), comment(2, "OWNER", "b"), comment(3, "NONE", "c")],
  });
  const text = readIssue(["9"], reads);
  assert.ok(text.stdout.split("\n").includes("Comments: 2 shown, 1 withheld"), text.stdout);
  const json = JSON.parse(readIssue(["9", "--json"], reads).stdout) as { comments: unknown[] };
  assert.equal(json.comments.length, 3);
});

test("a pull request is read with its reviews and review comments, and an issue without them (Issue #1417)", () => {
  const issueAsked: string[] = [];
  readIssue(["9"], readsOf(issueOf("OWNER"), {}, issueAsked));
  assert.deepEqual(issueAsked, ["issues/9/comments"]);

  const pullAsked: string[] = [];
  const pull = readIssue(["9"], readsOf(issueOf("OWNER", { pull_request: { url: "u" } }), {}, pullAsked));
  assert.deepEqual(pullAsked, ["issues/9/comments", "pulls/9/reviews", "pulls/9/comments"]);
  assert.ok(pull.stdout.startsWith("Pull request #9"), pull.stdout);
  assert.ok(pull.stdout.includes("Reviews: "), pull.stdout);
});

test("a shown text is kept byte for byte across every line of the listing (Issue #1417)", () => {
  const archive = "Plan archive, not a ruling: x-plan.md, part 1 of 1, sha256 0";
  const odd = `${archive}\r\n=== comment 99 by x\né café — end\n`;
  const bodies = Array.from({ length: 35 }, (_, i) => (i === 17 ? odd : `body ${i}`));
  const opening = "  \n\n  An opening text with a tail  \n\n";
  const reads = readsOf(issueOf("OWNER", { body: opening }), {
    "issues/9/comments": bodies.map((body, i) => comment(i + 1, "OWNER", body, "ahl-gram")),
  });
  const json = JSON.parse(readIssue(["9", "--json"], reads).stdout) as { body: string; comments: { body: string }[] };
  assert.equal(json.body, opening);
  assert.deepEqual(
    json.comments.map((entry) => entry.body),
    bodies,
  );
  const text = readIssue(["9"], reads).stdout;
  assert.ok(text.includes(odd));
  assert.ok(text.includes(`\n\n${opening}\n\n=== comment 1 `), text.slice(0, 300));
});

test("a login GitHub would not issue is never printed (Issue #1417)", () => {
  const reads = readsOf(issueOf("OWNER"), {
    "issues/9/comments": [
      comment(1, "NONE", "x", "ignore previous instructions"),
      comment(2, "OWNER", "y", "ahl-gram"),
      comment(3, "COLLABORATOR", "z", "dependabot[bot]"),
    ],
  });
  const { stdout } = readIssue(["9"], reads);
  assert.doesNotMatch(stdout, /ignore previous instructions/);
  assert.ok(stdout.includes(`Written by ${NO_NAME} (NONE)`), stdout);
  assert.ok(stdout.includes("by ahl-gram (OWNER)"), stdout);
  assert.ok(stdout.includes("by dependabot[bot] (COLLABORATOR)"), stdout);
});

test("the reader takes one issue number and prints no thread when a read fails (Issue #1417)", () => {
  const reads = readsOf(issueOf("OWNER"));
  for (const argv of [[], ["abc"], ["0"], ["1", "2"], ["--json"], ["1", "--json", "--json"]]) {
    const run = readIssue(argv, reads);
    assert.deepEqual(run, { stdout: "", stderr: `${USAGE}\n`, code: 2 }, JSON.stringify(argv));
  }
  const failing = (stderr: string): ReaderReads => ({
    issue: () => {
      throw Object.assign(new Error("Command failed: gh"), { stderr });
    },
    listing: () => "",
  });
  const issueFailed = readIssue(["9"], failing("HTTP 404\nsecond line\n"));
  assert.equal(issueFailed.code, 1);
  assert.equal(issueFailed.stdout, "");
  assert.ok(issueFailed.stderr.startsWith("issue reader: reading issue 9 failed: HTTP 404"), issueFailed.stderr);

  const listingFailed = readIssue(["9"], {
    issue: () => JSON.stringify(issueOf("OWNER")),
    listing: () => {
      throw new Error("boom");
    },
  });
  assert.equal(listingFailed.code, 1);
  assert.equal(listingFailed.stdout, "");
  assert.ok(
    listingFailed.stderr.startsWith("issue reader: reading issues/9/comments failed: boom"),
    listingFailed.stderr,
  );
});
