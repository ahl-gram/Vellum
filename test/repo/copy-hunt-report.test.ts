import assert from "node:assert/strict";
import { test } from "node:test";
import type { AcceptedCopy } from "../../scripts/copy-hunt/accepted-copies.ts";
import { functionsIn, type Fn } from "../../scripts/copy-hunt/functions.ts";
import { hunt, RUN_INPUT_TOKEN_CAP, type Found, type Outcome, type Run } from "../../scripts/copy-hunt/hunt.ts";
import { requestFor, verdictOf } from "../../scripts/copy-hunt/questions.ts";
import { BLIND_SPOTS, pairLines, replyLines, reportLines, requestLines } from "../../scripts/copy-hunt/report.ts";
import { liveSender, type Answered, type Fetch, type Reply } from "../../scripts/jev/system-one.ts";

const ALPHA = [
  "export const alpha = (items: readonly Item[], limit: number): Item[] =>",
  "  items.filter((item) => item.weight <= limit).sort((left, right) => left.weight - right.weight);",
  "",
].join("\n");
const ALPHA_COPY = [
  "// the same function, commented",
  "export const alpha = (items: readonly Item[], limit: number): Item[] =>",
  "  items.filter((item) => item.weight <= limit).sort((left, right) => left.weight - right.weight); // light first",
  "",
].join("\n");
const ALPHA_NEAR = [
  "export const alphaOf = (items: readonly Item[], cap: number): Item[] =>",
  "  items.filter((item) => item.weight <= cap).sort((left, right) => left.weight - right.weight);",
  "",
].join("\n");
const OTHER =
  "export const unrelated = (name: string, count: number): string => name.repeat(count).toUpperCase().trim();\n";

const fnOf = (file: string, line: number, name: string, tokens: string[], extra: Partial<Fn> = {}): Fn => ({
  file,
  line,
  end: line,
  name,
  body: `${name}()`,
  norm: `${name}()`,
  tokens: [...tokens].sort(),
  hash: "0123456789abcdef",
  ...extra,
});
const ok = (same: number): Answered => ({ ok: true, model: "jev-1.14.0", nouls: { same }, inputTokens: 500, ms: 5 });
const pair = (x: Fn, y: Fn, similarity: number, outcome: Outcome, replies: Reply[] = []): Found => ({
  x,
  y,
  similarity,
  requests: replies.length === 0 ? [] : [requestFor(x, y), requestFor(y, x)],
  replies,
  outcome,
});
const asked = (ab: number, ba: number): Outcome => ({
  kind: "asked",
  asked: { ab, ba, mean: (ab + ba) / 2, verdict: verdictOf((ab + ba) / 2) },
});
const STALE: AcceptedCopy = {
  a: { file: "src/gone.ts", name: "gone", hash: "0123456789abcdef" },
  b: { file: "src/x.ts", name: "x", hash: "0123456789abcdef" },
  reason: "mirror",
  ruling: "https://github.com/ahl-gram/Vellum/issues/1#issuecomment-2",
};

const parsed = (line: string): Record<string, unknown> => JSON.parse(line) as Record<string, unknown>;
const n1x = fnOf("src/e.ts", 30, "zeta", []);
const n1y = fnOf("src/h.ts", 1, "eta", []);
const found: Found[] = [
  pair(n1x, n1y, 0.65, asked(0.1, 0.1), [ok(0.1), ok(0.1)]),
  pair(fnOf("src/c.ts", 20, "delta", []), fnOf("src/d.ts", 2, "deltaAt", []), 0.62, asked(0.9, 0.8), [
    ok(0.9),
    ok(0.8),
  ]),
  pair(fnOf("src/b.ts", 3, "beta", []), fnOf("src/a.ts", 9, "alpha", []), 1, { kind: "exact" }),
  pair(fnOf("src/e.ts", 5, "eps", []), fnOf("src/f.ts", 6, "epsOf", []), 0.7, asked(0.4, 0.6), [ok(0.4), ok(0.6)]),
  pair(fnOf("src/c.ts", 1, "gamma", []), fnOf("test/g.test.ts", 4, "gammaOf", []), 0.8, asked(0.96, 0.94), [
    ok(0.96),
    ok(0.94),
  ]),
  pair(
    fnOf("src/e.ts", 40, "theta", []),
    fnOf("src/i.ts", 3, "iota", []),
    0.61,
    { kind: "skipped", reason: "HTTP 529: overloaded" },
    [{ ok: false, reason: "HTTP 529: overloaded" }],
  ),
  pair(fnOf("src/j.ts", 1, "kappa", []), fnOf("test/k.test.ts", 2, "kappaMirror", []), 0.9, {
    kind: "accepted",
    copy: STALE,
  }),
];
const run: Run = {
  sha: "abc1234",
  base: "def5678",
  functions: 40,
  hunted: 6,
  tooLong: [fnOf("src/big.ts", 1, "huge", [])],
  unread: [{ file: "src/broken.ts", reason: "src/broken.ts does not parse: Unexpected token" }],
  found,
  stale: [STALE],
};
const HEADER = "similar pairs 5 (copies 2, unsettled 1, not copies 1, skipped 1); accepted 1; input tokens 4000";

test("the report gives the counts and the blind spots, then each kind of pair in its own section, in the order a reviewer reads them", () => {
  assert.deepEqual(reportLines(run), [
    `copy hunt at abc1234 (jev-1.14.0): 6 of 40 functions added or changed since def5678; exact copies 1; ${HEADER}`,
    BLIND_SPOTS,
    "",
    "## Exact copies, found by code",
    "",
    "- src/b.ts:3 beta = src/a.ts:9 alpha",
    "",
    "## Read as copies: the mean of both orders is above 0.7",
    "",
    "| mean | a then b | b then a | similarity | function | copy |",
    "|---|---|---|---|---|---|",
    "| 0.95 | 0.96 | 0.94 | 0.80 | src/c.ts:1 gamma | test/g.test.ts:4 gammaOf |",
    "| 0.85 | 0.90 | 0.80 | 0.62 | src/c.ts:20 delta | src/d.ts:2 deltaAt |",
    "",
    "## Unsettled, 0.3 to 0.7: hypotheses to read, not findings",
    "",
    "| mean | a then b | b then a | similarity | function | copy |",
    "|---|---|---|---|---|---|",
    "| 0.50 | 0.40 | 0.60 | 0.70 | src/e.ts:5 eps | src/f.ts:6 epsOf |",
    "",
    "## Skipped: not answered, so not judged",
    "",
    "- src/e.ts:40 theta | src/i.ts:3 iota: HTTP 529: overloaded",
    "",
    "## Not asked: over 6,000 characters, so held to exact copies",
    "",
    "- src/big.ts:1 huge",
    "",
    "## Not read: the file does not parse",
    "",
    "- src/broken.ts: src/broken.ts does not parse: Unexpected token",
    "",
    "## Accepted copies no function now matches: renew the entry or remove it",
    "",
    "- src/gone.ts gone | src/x.ts x: mirror (https://github.com/ahl-gram/Vellum/issues/1#issuecomment-2)",
  ]);
});

test("a run over every function says so in its header", () => {
  assert.equal(
    reportLines({ ...run, base: null, hunted: 40 })[0],
    `copy hunt at abc1234 (jev-1.14.0): all 40 functions; exact copies 1; ${HEADER}`,
  );
  const empty = reportLines({ ...run, found: [], tooLong: [], unread: [], stale: [] });
  assert.equal(empty.length, 2);
  assert.equal(empty[1], BLIND_SPOTS);
});

test("no line of the report, the request log, the reply log or the pair log carries the key", async () => {
  const KEY = "k-copy-secret-77";
  const echo: Fetch = () =>
    Promise.resolve(new Response(JSON.stringify({ error: `bad key Bearer ${KEY}` }), { status: 401 }));
  const send = liveSender({}, "/h", () => `${KEY}\n`, echo);
  const fns = [
    ...functionsIn("src/a.ts", ALPHA),
    ...functionsIn("src/b.ts", ALPHA_COPY),
    ...functionsIn("src/c.ts", ALPHA_NEAR),
    ...functionsIn("src/d.ts", OTHER),
  ];
  const hunted = await hunt(fns, null, { send, cap: RUN_INPUT_TOKEN_CAP, accepted: [] });
  const written = [
    ...reportLines({
      sha: "t",
      base: null,
      functions: 4,
      hunted: 4,
      tooLong: [],
      unread: [],
      found: hunted,
      stale: [],
    }),
    ...requestLines(hunted),
    ...replyLines(hunted),
    ...pairLines(hunted),
  ].join("\n");
  assert.ok(!written.includes(KEY));
  assert.ok(written.includes("<TYPESAFE_API_KEY>"));
});

test("the logs hold one line per request built, per reply and per pair, naming the pair and the order", () => {
  assert.equal(requestLines(found).length, 10);
  assert.deepEqual(JSON.parse(requestLines(found)[0]!), {
    a: "src/e.ts:30 zeta",
    b: "src/h.ts:1 eta",
    order: "ab",
    request: requestFor(n1x, n1y),
  });
  assert.equal(replyLines(found).length, 9);
  assert.equal(parsed(replyLines(found)[1]!).order, "ba");
  assert.deepEqual(
    pairLines(found).map((l) => parsed(l).outcome),
    ["asked", "asked", "exact", "asked", "asked", "skipped", "accepted"],
  );
  assert.deepEqual(JSON.parse(pairLines(found)[1]!), {
    a: { file: "src/c.ts", line: 20, name: "delta", hash: "0123456789abcdef" },
    b: { file: "src/d.ts", line: 2, name: "deltaAt", hash: "0123456789abcdef" },
    similarity: 0.62,
    outcome: "asked",
    ab: 0.9,
    ba: 0.8,
    mean: (0.9 + 0.8) / 2,
    verdict: "copy",
  });
});
