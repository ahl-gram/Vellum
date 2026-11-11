import assert from "node:assert/strict";
import { test } from "node:test";
import type { Reply } from "../../scripts/jev/system-one.ts";
import { COMPARISON_RULE } from "../../scripts/still-judge/compare.ts";
import { scoreLines, winRate } from "../../scripts/still-judge/score.ts";
import { reaskedOf, stillsOf, type TrialStill } from "../../scripts/still-judge/trial-set.ts";
import { answered } from "../../test-support/jev-fakes.ts";
import { RAIN, SHEET } from "../../test-support/still-judge-fixtures.ts";

const seeds = [1, 2];
const stills = seeds.flatMap((seed) => stillsOf(seed, SHEET, RAIN).stills);
const asked = [...stills, ...reaskedOf(stills, seeds, 1)];
const DRY: Reply = { ok: false, reason: "dry run: nothing was sent" };

type Replies = (s: TrialStill) => Reply;
const table: Replies = (s) => {
  const at = `${s.kind} ${s.arm}`;
  if (at === "sheet clean") return answered({ realm_names_read: 0.9, title_reads_first: 0.8 });
  if (at === "rainfall clean") return answered({ realm_names_read: 0.9, rain_lines_lead: 0.8, title_reads_first: 0.8 });
  if (at === "rainfall rain-faint")
    return s.seed === 2
      ? { ok: false, reason: "HTTP 500: x" }
      : answered({ realm_names_read: 0.9, rain_lines_lead: 0.2, title_reads_first: 0.8 });
  if (at === "sheet realm-faint") return answered({ realm_names_read: 0.2, title_reads_first: 0.8 });
  if (at === "crop range-thin") return answered({ names_read: 0.1 });
  if (at === "sheet title-small")
    return answered({ realm_names_read: 0.9, title_reads_first: s.seed === 2 ? 0.85 : 0.75 });
  return answered({ names_read: 0.9 });
};
const lines = (replies: Replies, rows = asked): string[] =>
  scoreLines(
    seeds,
    rows,
    rows.map((s, i) =>
      i >= stills.length && s.kind === "sheet"
        ? answered({ realm_names_read: 0.85, title_reads_first: 0.8 })
        : replies(s),
    ),
    stills.length,
  );

test("a pair is won when today's chart reads higher than its restaged twin, and half won on a tie", () => {
  assert.equal(
    winRate([
      { clean: 0.9, restaged: 0.2 },
      { clean: 0.4, restaged: 0.4 },
      { clean: 0.1, restaged: 0.6 },
    ]),
    0.5,
  );
  assert.equal(winRate([{ clean: 0.9, restaged: 0.2 }]), 1);
  assert.ok(Number.isNaN(winRate([])));
});

test("each defect is scored on its own question, over the seeds whose twins both answered, and kept only when every pair answered and enough were won", () => {
  const out = lines(table);
  for (const row of [
    "| rain-faint | #108 | rain_lines_lead | 1 | 1.00 | - | 1 | 1 | no |",
    "| realm-faint | #158 | realm_names_read | 2 | 1.00 | 0.50 | 2 | 2 | yes |",
    "| range-thin | #9 | names_read | 2 | 1.00 | - | 2 | 2 | yes |",
    "| title-small | #1309 | title_reads_first | 2 | 0.50 | 0.50 | 2 | 0 | no |",
  ])
    assert.ok(out.includes(row), `${row}\n${out.join("\n")}`);
});

test("the off-target rows read each restaged still's other questions", () => {
  const out = lines(table);
  for (const row of [
    "| rain-faint | realm_names_read | 1 | 0.50 |",
    "| rain-faint | title_reads_first | 1 | 0.50 |",
    "| realm-faint | title_reads_first | 2 | 0.50 |",
    "| title-small | realm_names_read | 2 | 0.50 |",
  ])
    assert.ok(out.includes(row), `${row}\n${out.join("\n")}`);
  assert.equal(
    out.some((l) => l.startsWith("| realm-faint | realm_names_read | ")),
    false,
  );
  assert.equal(
    out.some((l) => l.startsWith("| range-thin | ") && !l.startsWith("| range-thin | #9 |")),
    false,
  );
});

test("the first line counts requests built, answered and not answered, so a dry run claims nothing sent, and the score ends with the comparison rule", () => {
  const dry = scoreLines(
    seeds,
    asked,
    asked.map(() => DRY),
    stills.length,
  );
  for (const line of [
    "17 requests built (14 stills over 2 seeds, 3 re-asked), 0 answered, 17 not answered, 0 input tokens reported, models: none.",
    "Not answered: 17 (dry run: nothing was sent).",
    "| realm-faint | #158 | realm_names_read | 0 | n/a | n/a | 0 | 0 | - |",
    "| rain-faint | #108 | rain_lines_lead | 0 | n/a | - | 0 | 0 | - |",
  ])
    assert.ok(dry.includes(line), `${line}\n${dry.join("\n")}`);
  assert.equal(dry.at(-1), COMPARISON_RULE);

  const out = lines(table);
  assert.ok(
    out.includes(
      "17 requests built (14 stills over 2 seeds, 3 re-asked), 16 answered, 1 not answered, 8000 input tokens reported, models: jev-1.14.0.",
    ),
    out.join("\n"),
  );
  assert.ok(out.includes("Not answered: 1 (HTTP 500: x)."), out.join("\n"));
  assert.equal(out.at(-1), COMPARISON_RULE);
});

test("a re-asked still reports the largest difference between its two answers", () => {
  assert.ok(lines(table).includes("Re-asked: 6 answers compared, largest difference 0.05."));
});

test("a question that also drops on a defect it is not about is not kept", () => {
  const dropped: Replies = (s) =>
    s.kind === "sheet" && s.arm === "title-small"
      ? answered({ realm_names_read: 0.2, title_reads_first: 0.75 })
      : table(s);
  const out = lines(dropped);
  assert.ok(out.includes("| realm-faint | #158 | realm_names_read | 2 | 1.00 | 1.00 | 2 | 2 | no |"), out.join("\n"));
});

const tenSeeds = Array.from({ length: 10 }, (_, i) => i + 1);
const tenStills = tenSeeds.flatMap((seed) => stillsOf(seed, SHEET, RAIN).stills);
const bounds =
  (level: boolean): Replies =>
  (s) => {
    const at = `${s.kind} ${s.arm}`;
    const i = s.seed;
    if (at === "sheet clean") return answered({ realm_names_read: 0.9, title_reads_first: 0.8 });
    if (at === "rainfall clean")
      return answered({ realm_names_read: 0.9, rain_lines_lead: 0.8, title_reads_first: 0.8 });
    if (at === "rainfall rain-faint")
      return answered({ realm_names_read: 0.9, rain_lines_lead: 0.2, title_reads_first: 0.8 });
    if (at === "sheet realm-faint")
      return level
        ? answered({ realm_names_read: i <= 8 ? 0.2 : 0.95, title_reads_first: 0.8 })
        : answered({
            realm_names_read: i <= 7 ? 0.2 : i === 8 ? 0.9 : 0.95,
            title_reads_first: i <= 7 ? 0.5 : i === 8 ? 0.8 : 0.95,
          });
    if (at === "crop range-thin") return answered({ names_read: i === 1 ? 0.3 : 0.1 });
    if (at === "sheet title-small")
      return answered({ realm_names_read: i <= 7 ? 0.5 : 0.95, title_reads_first: i <= 8 ? 0.5 : 0.95 });
    return answered({ names_read: i === 1 ? 0.7 : 0.9 });
  };
const tenLines = (level: boolean): string[] =>
  scoreLines(tenSeeds, tenStills, tenStills.map(bounds(level)), tenStills.length);

test("a question is kept at exactly 0.80 of its own pairs and 0.70 elsewhere, and not at 0.75 of its own or 0.75 elsewhere", () => {
  const short = tenLines(false);
  for (const row of [
    "| realm-faint | #158 | realm_names_read | 10 | 0.75 | 0.70 | 10 | 7 | no |",
    "| title-small | #1309 | title_reads_first | 10 | 0.80 | 0.75 | 10 | 0 | no |",
    "| range-thin | #9 | names_read | 10 | 1.00 | - | 9 | 9 | yes |",
    "Re-asked: 0 answers compared, largest difference n/a.",
  ])
    assert.ok(short.includes(row), `${row}\n${short.join("\n")}`);
  assert.equal(
    short.some((l) => l.startsWith("Not answered")),
    false,
  );
  const level = tenLines(true);
  for (const row of [
    "| realm-faint | #158 | realm_names_read | 10 | 0.80 | 0.70 | 10 | 8 | yes |",
    "| title-small | #1309 | title_reads_first | 10 | 0.80 | 0.50 | 10 | 0 | yes |",
  ])
    assert.ok(level.includes(row), `${row}\n${level.join("\n")}`);
});

test("a pair needs both its answers, and a defect no other asks about leaves the others' rate alone", () => {
  const noCleanSheet: Replies = (s) =>
    s.kind === "sheet" && s.arm === "clean" && s.seed === 2 ? { ok: false, reason: "HTTP 500: x" } : table(s);
  const missing = lines(noCleanSheet);
  assert.ok(
    missing.includes("| realm-faint | #158 | realm_names_read | 1 | 1.00 | 0.50 | 1 | 1 | no |"),
    missing.join("\n"),
  );
  const noRain: Replies = (s) => (s.arm === "rain-faint" ? { ok: false, reason: "HTTP 500: x" } : table(s));
  const silent = lines(noRain);
  assert.ok(
    silent.includes("| realm-faint | #158 | realm_names_read | 2 | 1.00 | 0.50 | 2 | 2 | yes |"),
    silent.join("\n"),
  );
});

test("a re-asked still is compared with the first still of its own seed, in either direction, and not when either answer failed", () => {
  const again = [...stills, ...reaskedOf(stills, seeds, 2)];
  const replies = again.map((s, i): Reply => {
    if (i < stills.length) {
      if (s.kind === "sheet" && s.arm === "clean")
        return answered({ realm_names_read: s.seed === 1 ? 0.9 : 0.5, title_reads_first: 0.8 });
      if (s.kind === "rainfall" && s.arm === "clean" && s.seed === 2) return { ok: false, reason: "HTTP 500: x" };
      return table(s);
    }
    if (i === 16) return { ok: false, reason: "HTTP 500: x" };
    if (i === 17) return answered({ realm_names_read: 0.3, title_reads_first: 0.8 });
    return table(s);
  });
  const out = scoreLines(seeds, again, replies, stills.length);
  assert.ok(out.includes("Re-asked: 8 answers compared, largest difference 0.20."), out.join("\n"));
});
