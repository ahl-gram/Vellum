import assert from "node:assert/strict";
import { test } from "node:test";
import { memoryTree } from "../../scripts/comment-judge/tree.ts";
import { liveSender, type Answered } from "../../scripts/jev/system-one.ts";
import type { ClaimRow, Kind } from "../../scripts/recon-triage/claims.ts";
import type { Excerpt } from "../../scripts/recon-triage/excerpt.ts";
import { requestFor } from "../../scripts/recon-triage/questions.ts";
import { replyLines, reportLines, requestLines } from "../../scripts/recon-triage/report.ts";
import { RUN_INPUT_TOKEN_CAP, triage, type Triaged } from "../../scripts/recon-triage/triage.ts";
import { keyEchoingFetch } from "../../test-support/jev-fakes.ts";

const row = (claim: string, source: string, kind: Kind, paths: string[]): ClaimRow => ({
  claim,
  source,
  paths,
  symbols: [],
  kind,
});
const ex = (missingPaths: string[], missingSymbols: string[]): Excerpt => ({ code: "x", missingPaths, missingSymbols });
const ok = (holds: number, contradicts: number): Answered => ({
  ok: true,
  model: "jev-1.14.0",
  nouls: { holds, contradicts },
  inputTokens: 600,
  ms: 5,
});
const A: ClaimRow = { claim: "a is one", source: "body", paths: ["src/a.ts"], symbols: ["a"], kind: "behavior" };

const rows: Triaged[] = [
  {
    row: row("A moved file", "body", "behavior", ["src/gone.ts"]),
    route: "no code",
    excerpt: ex(["src/gone.ts"], []),
    request: null,
    reply: null,
    score: null,
  },
  {
    row: row("B cites nothing", "comment 2026-11-01", "behavior", []),
    route: "no code",
    excerpt: ex([], []),
    request: null,
    reply: null,
    score: null,
  },
  {
    row: row("C fails", "body", "behavior", ["src/c.ts"]),
    route: "asked",
    excerpt: ex([], []),
    request: requestFor("C fails", "x"),
    reply: { ok: false, reason: "HTTP 529: overloaded" },
    score: null,
  },
  {
    row: row("D holds | pipes", "body", "behavior", ["src/d.ts"]),
    route: "asked",
    excerpt: ex([], ["gone"]),
    request: requestFor("D holds | pipes", "x"),
    reply: ok(0.75, 0.25),
    score: 0.75,
  },
  {
    row: row("E is stale", "body", "behavior", ["src/e.ts"]),
    route: "asked",
    excerpt: ex([], []),
    request: requestFor("E is stale", "x"),
    reply: ok(0.25, 0.75),
    score: 0.25,
  },
  {
    row: row("F paints", "body", "behavior", ["src/styles/f.css"]),
    route: "stylesheet",
    excerpt: ex([], []),
    request: null,
    reply: null,
    score: null,
  },
  {
    row: row("G lives in src/g.ts", "body", "existence", ["src/g.ts"]),
    route: "command",
    excerpt: null,
    request: null,
    reply: null,
    score: null,
  },
];

test("the report lists the claims in the order they are checked: no code, skipped, ranked likely stale first, stylesheet, then command", () => {
  assert.deepEqual(reportLines("abc1234", rows), [
    "recon triage at abc1234 (jev-1.14.0): 7 claims, 3 asked, 2 answered, 1 skipped, 1200 input tokens",
    "",
    "## Check first: no code to read",
    "",
    "- A moved file (body): not at abc1234: src/gone.ts",
    "- B cites nothing (comment 2026-11-01): cites no file",
    "",
    "## Triage skipped",
    "",
    "- C fails (body): HTTP 529: overloaded",
    "",
    "## Ranked, likely stale first",
    "",
    "| rank | band | score | holds | contradicts | claim | source | symbols not found |",
    "|---|---|---|---|---|---|---|---|",
    "| 1 | likely stale | 0.25 | 0.25 | 0.75 | E is stale | body | none |",
    "| 2 | likely current | 0.75 | 0.75 | 0.25 | D holds \\| pipes | body | gone |",
    "",
    "## Not asked: every cited file is a stylesheet, so a browser read settles it",
    "",
    "- F paints (body)",
    "",
    "## Not asked: a command settles it",
    "",
    "- [existence] G lives in src/g.ts (body)",
  ]);
});

test("ranked rows run from the lowest score, ties kept in the claims' order", () => {
  const three = [
    { name: "X1", reply: ok(0.6, 0.4), score: 0.6 },
    { name: "X2", reply: ok(0.2, 0.8), score: 0.2 },
    { name: "X3", reply: ok(0.6, 0.4), score: 0.6 },
  ].map((x): Triaged => ({
    row: row(x.name, "body", "behavior", ["src/x.ts"]),
    route: "asked",
    excerpt: ex([], []),
    request: requestFor(x.name, "x"),
    reply: x.reply,
    score: x.score,
  }));
  const ranked = reportLines("t", three)
    .filter((l) => /^\| \d/.test(l))
    .map((l) => l.split(" | ")[5]);
  assert.deepEqual(ranked, ["X2", "X1", "X3"]);
});

test("no line of the report, the request log or the reply log carries the key", async () => {
  const KEY = "k-recon-secret-77";
  const send = liveSender({}, "/h", () => `${KEY}\n`, keyEchoingFetch(KEY));
  const tree = memoryTree("t", { "src/a.ts": "export const a = 1;\n" });
  const triaged = await triage([A], tree, send, RUN_INPUT_TOKEN_CAP);
  const written = [...reportLines("t", triaged), ...requestLines(triaged), ...replyLines(triaged)].join("\n");
  assert.ok(!written.includes(KEY));
  assert.ok(written.includes("<TYPESAFE_API_KEY>"));
});

test("the logs hold one line for each request asked and each reply, naming its claim", () => {
  const claimsOf = (lines: string[]): string[] => lines.map((l) => (JSON.parse(l) as { claim: string }).claim);
  const three = ["C fails", "D holds | pipes", "E is stale"];
  assert.deepEqual(claimsOf(requestLines(rows)), three);
  assert.deepEqual((JSON.parse(requestLines(rows)[0]!) as { request: unknown }).request, rows[2]!.request);
  assert.deepEqual(claimsOf(replyLines(rows)), three);
  assert.deepEqual((JSON.parse(replyLines(rows)[0]!) as { reply: unknown }).reply, rows[2]!.reply);
});
