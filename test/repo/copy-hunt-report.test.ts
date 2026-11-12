import assert from "node:assert/strict";
import { test } from "node:test";
import type { AcceptedCopy } from "../../scripts/copy-hunt/accepted-copies.ts";
import type { Fn } from "../../scripts/copy-hunt/functions.ts";
import { hunt, RUN_INPUT_TOKEN_CAP, type Found, type Run } from "../../scripts/copy-hunt/hunt.ts";
import { requestFor } from "../../scripts/copy-hunt/questions.ts";
import { BLIND_SPOTS, pairLines, replyLines, reportLines, requestLines } from "../../scripts/copy-hunt/report.ts";
import { liveSender } from "../../scripts/jev/system-one.ts";
import { alphaFns, asked, fnOf, pair, sameAnswer } from "../../test-support/copy-hunt-fixtures.ts";
import { keyEchoingFetch, unmetered } from "../../test-support/jev-fakes.ts";

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
  pair(n1x, n1y, 0.65, asked(0.1, 0.1), [sameAnswer(0.1), sameAnswer(0.1)]),
  pair(fnOf("src/c.ts", 20, "delta", []), fnOf("src/d.ts", 2, "deltaAt", []), 0.62, asked(0.9, 0.8), [
    sameAnswer(0.9),
    sameAnswer(0.8),
  ]),
  pair(fnOf("src/b.ts", 3, "beta", []), fnOf("src/a.ts", 9, "alpha", []), 1, { kind: "exact" }),
  pair(fnOf("src/e.ts", 5, "eps", []), fnOf("src/f.ts", 6, "epsOf", []), 0.7, asked(0.4, 0.6), [
    sameAnswer(0.4),
    sameAnswer(0.6),
  ]),
  pair(fnOf("src/c.ts", 1, "gamma", []), fnOf("test/g.test.ts", 4, "gammaOf", []), 0.8, asked(0.96, 0.94), [
    sameAnswer(0.96),
    sameAnswer(0.94),
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
  const send = liveSender({}, "/h", () => `${KEY}\n`, keyEchoingFetch(KEY), unmetered);
  const fns = alphaFns();
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

test("the pair log names the ruling of an accepted pair and the reason of a skipped one", () => {
  assert.deepEqual(parsed(pairLines(found)[6]!), {
    a: { file: "src/j.ts", line: 1, name: "kappa", hash: "0123456789abcdef" },
    b: { file: "test/k.test.ts", line: 2, name: "kappaMirror", hash: "0123456789abcdef" },
    similarity: 0.9,
    outcome: "accepted",
    ruling: STALE.ruling,
  });
  assert.equal(parsed(pairLines(found)[5]!).reason, "HTTP 529: overloaded");
});

test("every section lists its entries in place order, and the copies by mean first, whatever order they were found in", () => {
  const at = (file: string, name: string): Fn => fnOf(file, 1, name, []);
  const sorted: Run = {
    sha: "s",
    base: null,
    functions: 10,
    hunted: 10,
    tooLong: [at("src/z.ts", "zed"), at("src/y.ts", "why")],
    unread: [],
    stale: [],
    found: [
      pair(at("src/m.ts", "m"), at("src/n.ts", "n"), 1, { kind: "exact" }),
      pair(at("src/b.ts", "b"), at("src/c.ts", "c"), 1, { kind: "exact" }),
      pair(at("src/a.ts", "a"), at("src/a2.ts", "a2"), 0.7, asked(0.8, 0.8)),
      pair(at("src/z.ts", "z"), at("src/z2.ts", "z2"), 0.7, asked(0.96, 0.96)),
      pair(at("src/t2.ts", "t2"), at("src/t3.ts", "t3"), 0.7, asked(0.9, 0.9)),
      pair(at("src/t1.ts", "t1"), at("src/t3.ts", "t3"), 0.7, asked(0.9, 0.9)),
      pair(at("src/s2.ts", "s2"), at("src/s3.ts", "s3"), 0.7, { kind: "skipped", reason: "late" }),
      pair(at("src/s1.ts", "s1"), at("src/s3.ts", "s3"), 0.7, { kind: "skipped", reason: "early" }),
    ],
  };
  assert.deepEqual(
    reportLines(sorted).filter((l) => l.startsWith("- ") || l.startsWith("| 0.")),
    [
      "- src/b.ts:1 b = src/c.ts:1 c",
      "- src/m.ts:1 m = src/n.ts:1 n",
      "| 0.96 | 0.96 | 0.96 | 0.70 | src/z.ts:1 z | src/z2.ts:1 z2 |",
      "| 0.90 | 0.90 | 0.90 | 0.70 | src/t1.ts:1 t1 | src/t3.ts:1 t3 |",
      "| 0.90 | 0.90 | 0.90 | 0.70 | src/t2.ts:1 t2 | src/t3.ts:1 t3 |",
      "| 0.80 | 0.80 | 0.80 | 0.70 | src/a.ts:1 a | src/a2.ts:1 a2 |",
      "- src/s1.ts:1 s1 | src/s3.ts:1 s3: early",
      "- src/s2.ts:1 s2 | src/s3.ts:1 s3: late",
      "- src/y.ts:1 why",
      "- src/z.ts:1 zed",
    ],
  );
});
