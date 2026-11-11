import assert from "node:assert/strict";
import { test } from "node:test";
import type { Reply } from "../../scripts/jev/system-one.ts";
import { askStills, COMPARISON_RULE, differenceOf, readingOf, type Asked } from "../../scripts/still-judge/compare.ts";
import { limitProblem } from "../../scripts/still-judge/png.ts";
import { requestFor } from "../../scripts/still-judge/questions.ts";
import { compareLines } from "../../scripts/still-judge/report.ts";
import { answered, recordingSender } from "../../test-support/jev-fakes.ts";
import { pngHeader } from "../../test-support/still-judge-fixtures.ts";

const TOO_BIG = "1680 by 2478 pixels: each side must be 280 to 1568";

const gave = (path: string, reply: Reply): Asked => ({ path, problem: null, request: null, reply });
const refused = (path: string, problem: string): Asked => ({ path, problem, request: null, reply: null });

test("a picture outside TypeSafe's limits is refused before anything is sent, and the rest are asked", async () => {
  const { send, seen } = recordingSender([answered({ realm_names_read: 0.9, title_reads_first: 0.2 })]);
  const results = await askStills(
    "sheet",
    [
      { path: "a.png", bytes: pngHeader(1500, 1158) },
      { path: "b.png", bytes: pngHeader(1680, 2478) },
    ],
    send,
    1_000_000,
  );
  assert.equal(seen.length, 1);
  assert.deepEqual(seen[0], requestFor("sheet", pngHeader(1500, 1158)));
  assert.deepEqual(results[1], { path: "b.png", problem: TOO_BIG, request: null, reply: null });
  assert.equal(results[0]!.path, "a.png");
  assert.ok(results[0]!.reply!.ok);

  const first = answered({ realm_names_read: 0.9, title_reads_first: 0.2 });
  const second = answered({ realm_names_read: 0.4, title_reads_first: 0.6 });
  const two = recordingSender([first, second]);
  const mixed = await askStills(
    "sheet",
    [
      { path: "c.png", bytes: pngHeader(1680, 2478) },
      { path: "a.png", bytes: pngHeader(1500, 1158) },
      { path: "d.png", bytes: pngHeader(1400, 1100) },
    ],
    two.send,
    1_000_000,
  );
  assert.deepEqual(
    mixed.map((m) => [m.path, m.reply]),
    [
      ["c.png", null],
      ["a.png", first],
      ["d.png", second],
    ],
  );
  assert.deepEqual(mixed[2]!.request, requestFor("sheet", pngHeader(1400, 1100)));
});

test("a difference is read in hundredths, and one under 0.12 either way is no difference", () => {
  assert.equal(differenceOf(0.45, 0.57), 0.12);
  assert.equal(readingOf(differenceOf(0.45, 0.57)), "reads better");
  assert.equal(differenceOf(0.57, 0.45), -0.12);
  assert.equal(readingOf(differenceOf(0.57, 0.45)), "reads worse");
  assert.equal(differenceOf(0.3, 0.41), 0.11);
  assert.equal(readingOf(differenceOf(0.3, 0.41)), "no difference");
  assert.equal(differenceOf(0.6, 0.49), -0.11);
  assert.equal(readingOf(differenceOf(0.6, 0.49)), "no difference");
  assert.equal(readingOf(0), "no difference");
  assert.equal(
    COMPARISON_RULE,
    "Read as a comparison of two versions of one chart: a difference under 0.12 is no difference, and one picture's number is never a pass or a fail.",
  );
});

test("each other version is set against today's picture question by question, and one not answered is not compared", () => {
  const asked = [
    gave("today.png", answered({ realm_names_read: 0.3, title_reads_first: 0.6 })),
    gave("a.png", answered({ realm_names_read: 0.18, title_reads_first: 0.72 })),
    gave("b.png", answered({ realm_names_read: 0.41, title_reads_first: 0.65 })),
    refused("c.png", TOO_BIG),
    gave("d.png", { ok: false, reason: "HTTP 429: slow down" }),
  ];
  assert.deepEqual(compareLines("sheet", asked), [
    "still-judge compare sheet at jev-1.14.0: 5 pictures, 3 answered, 1 refused unsent, 1 skipped, 1500 input tokens reported",
    "today: today.png",
    "a.png: realm_names_read today 0.30, this 0.18, difference -0.12, reads worse",
    "a.png: title_reads_first today 0.60, this 0.72, difference +0.12, reads better",
    "b.png: realm_names_read today 0.30, this 0.41, difference +0.11, no difference",
    "b.png: title_reads_first today 0.60, this 0.65, difference +0.05, no difference",
    `c.png: not compared: refused unsent: ${TOO_BIG}`,
    "d.png: not compared: skipped: HTTP 429: slow down",
    COMPARISON_RULE,
  ]);

  const same = { realm_names_read: 0.5, rain_lines_lead: 0.5, title_reads_first: 0.5 };
  assert.deepEqual(
    compareLines("rainfall", [
      gave("today.png", answered(same)),
      gave("a.png", answered(same)),
      refused("c.png", TOO_BIG),
      refused("e.png", TOO_BIG),
      gave("d.png", { ok: false, reason: "HTTP 429: slow down" }),
    ]),
    [
      "still-judge compare rainfall at jev-1.14.0: 5 pictures, 2 answered, 2 refused unsent, 1 skipped, 1000 input tokens reported",
      "today: today.png",
      "a.png: realm_names_read today 0.50, this 0.50, difference +0.00, no difference",
      "a.png: rain_lines_lead today 0.50, this 0.50, difference +0.00, no difference",
      "a.png: title_reads_first today 0.50, this 0.50, difference +0.00, no difference",
      `c.png: not compared: refused unsent: ${TOO_BIG}`,
      `e.png: not compared: refused unsent: ${TOO_BIG}`,
      "d.png: not compared: skipped: HTTP 429: slow down",
      COMPARISON_RULE,
    ],
  );
  assert.deepEqual(
    compareLines("crop", [
      gave("today.png", answered({ names_read: 0.4 })),
      gave("a.png", answered({ names_read: 0.6 })),
    ]),
    [
      "still-judge compare crop at jev-1.14.0: 2 pictures, 2 answered, 0 refused unsent, 0 skipped, 1000 input tokens reported",
      "today: today.png",
      "a.png: names_read today 0.40, this 0.60, difference +0.20, reads better",
      COMPARISON_RULE,
    ],
  );
});

test("when today's picture is not answered, no other version is compared", () => {
  const other = gave("a.png", answered({ realm_names_read: 0.2, title_reads_first: 0.7 }));
  const failed = compareLines("sheet", [gave("today.png", { ok: false, reason: "HTTP 500: x" }), other]);
  assert.equal(failed[2], "a.png: not compared: today's picture was skipped: HTTP 500: x");
  const problem = limitProblem(pngHeader(279, 1000))!;
  const small = compareLines("sheet", [refused("today.png", problem), other]);
  assert.equal(
    small[2],
    "a.png: not compared: today's picture was refused unsent: 279 by 1000 pixels: each side must be 280 to 1568",
  );
});
