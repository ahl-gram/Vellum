import assert from "node:assert/strict";
import { test } from "node:test";
import { replyLines, requestLines } from "../../scripts/comment-judge/report.ts";
import { liveSender } from "../../scripts/jev/system-one.ts";
import { BY_HAND } from "../../scripts/keeper-scan/collect.ts";
import { keeperRequest } from "../../scripts/keeper-scan/questions.ts";
import { reportLines } from "../../scripts/keeper-scan/report.ts";
import { RUN_INPUT_TOKEN_CAP, scanAll, type Scanned } from "../../scripts/keeper-scan/scan.ts";
import { answered, keyEchoingFetch } from "../../test-support/jev-fakes.ts";
import { RUN } from "../../test-support/keeper-scan-fixtures.ts";

const NOT_READ = [{ path: "src/styles/a.css", reason: BY_HAND }];
const AT = { base: "b1", head: "h1" };

test("the report lists each lost, unsettled and skipped comment with its confident signals and its text, never an unsure one, names each file not read, and counts every band", () => {
  const scanned: Scanned[] = [
    {
      sha: "b1",
      run: { ...RUN, file: "src/a.ts", line: 3, text: "measured over 945 legs" },
      requests: [],
      replies: [answered({})],
      outcome: {
        kind: "read",
        band: "lost",
        signals: [
          { signal: "measured", keeper: 0.91, survival: 0.1 },
          { signal: "units", keeper: 0.8, survival: 0.85 },
        ],
      },
    },
    {
      sha: "b1",
      run: { ...RUN, file: "src/a.ts", line: 9, text: "-1 is no basin" },
      requests: [],
      replies: [answered({})],
      outcome: { kind: "read", band: "unsettled", signals: [{ signal: "sentinel", keeper: 0.85, survival: 0.45 }] },
    },
    {
      sha: "b1",
      run: { ...RUN, file: "src/b.ts", line: 4, text: "still said" },
      requests: [],
      replies: [answered({})],
      outcome: { kind: "read", band: "said", signals: [{ signal: "measured", keeper: 0.9, survival: 0.8 }] },
    },
    {
      sha: "b1",
      run: { ...RUN, file: "src/b.ts", line: 5, text: "probably cells" },
      requests: [],
      replies: [answered({})],
      outcome: { kind: "read", band: "unsure", signals: [] },
    },
    {
      sha: "b1",
      run: { ...RUN, file: "src/b.ts", line: 7, text: "plain" },
      requests: [],
      replies: [answered({})],
      outcome: { kind: "read", band: "clear", signals: [] },
    },
    {
      sha: "b1",
      run: { ...RUN, file: "src/c.ts", line: 2, text: "px" },
      requests: [],
      replies: [{ ok: false, reason: "HTTP 529" }],
      outcome: { kind: "skipped", reason: "HTTP 529" },
    },
  ];
  assert.deepEqual(reportLines(scanned, NOT_READ, AT, false), [
    "deleted comments read at b1, their files at h1; answered by jev-1.14.0",
    "LOST src/a.ts:3: measured (keeper 0.91, survival 0.10); units (keeper 0.80, survival 0.85)",
    "  > measured over 945 legs",
    "UNSETTLED src/a.ts:9: sentinel (keeper 0.85, survival 0.45)",
    "  > -1 is no basin",
    "SKIPPED src/c.ts:2: HTTP 529",
    "  > px",
    `NOT READ src/styles/a.css: ${BY_HAND}`,
    "keeper-scan: 6 deleted comments; lost 1, unsettled 1, still said 1, unsure 1 (not listed), no signal 1, skipped 1 (a skipped comment was not read, so it is scanned by hand); files not read 1",
  ]);
  const dry: Scanned[] = [
    {
      sha: "b1",
      run: RUN,
      requests: [keeperRequest(RUN)],
      replies: [{ ok: false, reason: "dry run: nothing was sent" }],
      outcome: { kind: "skipped", reason: "dry run: nothing was sent" },
    },
    {
      sha: "b1",
      run: { ...RUN, line: 9 },
      requests: [keeperRequest(RUN)],
      replies: [{ ok: false, reason: "dry run: nothing was sent" }],
      outcome: { kind: "skipped", reason: "dry run: nothing was sent" },
    },
  ];
  const characters = 2 * JSON.stringify(keeperRequest(RUN)).length;
  assert.deepEqual(reportLines(dry, NOT_READ, AT, true), [
    `NOT READ src/styles/a.css: ${BY_HAND}`,
    `dry run: 2 deleted comments, 2 keeper requests, 14 questions, ${characters} characters; the survival questions follow the keeper answers, so none was built; nothing was sent`,
  ]);
});

test("no line of the report, the request log or the reply log carries the key", async () => {
  const KEY = "k-keeper-secret-31";
  const send = liveSender({}, "/h", () => `${KEY}\n`, keyEchoingFetch(KEY));
  const scanned = await scanAll([{ sha: "b1", run: RUN, fileAfter: "F" }], send, RUN_INPUT_TOKEN_CAP);
  const written = [
    ...reportLines(scanned, [], { base: "b1", head: "h1" }, false),
    ...requestLines(scanned),
    ...replyLines(scanned),
  ].join("\n");
  assert.ok(!written.includes(KEY));
  assert.ok(written.includes("<TYPESAFE_API_KEY>"));
});
