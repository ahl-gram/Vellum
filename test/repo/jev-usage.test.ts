import assert from "node:assert/strict";
import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { MODEL } from "../../scripts/jev/system-one.ts";
import {
  appendUsage,
  NO_TALLY,
  usageLine,
  usageFileOf,
  withReply,
  withSent,
  type Tally,
  type UsageLine,
} from "../../scripts/jev/usage.ts";
import { answered, ONE_QUESTION, usageTextIn, withHome } from "../../test-support/jev-fakes.ts";

const AT = new Date("2026-11-11T20:00:00.000Z");

test("a run's tally counts every request sent, sums the tokens its answered replies report, and counts the replies that carried TypeSafe's own count", () => {
  let tally = withSent(NO_TALLY, ONE_QUESTION);
  tally = withReply(tally, answered({ q: 0.5 }, 300));
  tally = withSent(tally, ONE_QUESTION);
  tally = withReply(tally, { ...answered({ q: 0.5 }, 120), estimated: true });
  tally = withSent(tally, ONE_QUESTION);
  tally = withReply(tally, { ok: false, reason: "HTTP 429: slow down" });
  assert.deepEqual(tally, { inputTokens: 420, requests: 3, counted: 1, models: [MODEL] });

  const other = withSent(tally, { ...ONE_QUESTION, model: "jev-2" });
  assert.deepEqual(other.models, [MODEL, "jev-2"]);
  assert.deepEqual(withSent(other, ONE_QUESTION).models, [MODEL, "jev-2"]);

  assert.deepEqual(NO_TALLY, { inputTokens: 0, requests: 0, counted: 0, models: [] });
});

test("the line is the run's six totals, estimated when any request sent came back without TypeSafe's own count, and a run that sent nothing has none", () => {
  assert.equal(usageLine(NO_TALLY, "copy-hunt diff", AT), null);

  const whole: Tally = { inputTokens: 500, requests: 2, counted: 2, models: [MODEL] };
  const line = usageLine(whole, "copy-hunt diff", AT);
  assert.deepEqual(line, {
    at: "2026-11-11T20:00:00.000Z",
    input_tokens: 500,
    requests: 2,
    model: MODEL,
    command: "copy-hunt diff",
    estimated: false,
  });
  assert.deepEqual(Object.keys(line!), ["at", "input_tokens", "requests", "model", "command", "estimated"]);

  assert.equal(usageLine({ ...whole, counted: 1 }, "copy-hunt diff", AT)!.estimated, true);
  assert.equal(usageLine({ ...whole, models: [MODEL, "jev-2"] }, "copy-hunt diff", AT)!.model, `${MODEL}, jev-2`);
});

const L1: UsageLine = {
  at: "2026-11-11T20:00:00.000Z",
  input_tokens: 500,
  requests: 2,
  model: MODEL,
  command: "copy-hunt diff",
  estimated: false,
};
const L2: UsageLine = { ...L1, input_tokens: 90, requests: 1, command: "keeper-scan diff" };

test("a line is appended to ~/.config/typesafe/usage.jsonl under the home given, after whatever the file holds, each on its own line", async () => {
  await withHome((home) => {
    appendUsage(home, L1);
    assert.equal(usageTextIn(home), JSON.stringify(L1) + "\n");
    assert.ok(existsSync(join(home, ".config", "typesafe", "usage.jsonl")));
    appendUsage(home, L2);
    assert.equal(usageTextIn(home), JSON.stringify(L1) + "\n" + JSON.stringify(L2) + "\n");
    assert.equal(statSync(join(home, ".config", "typesafe")).mode & 0o777, 0o700);
  });
  await withHome((home) => {
    mkdirSync(join(home, ".config", "typesafe"), { recursive: true });
    writeFileSync(usageFileOf(home), '{"input_tokens":5}');
    appendUsage(home, L1);
    assert.equal(usageTextIn(home), '{"input_tokens":5}\n' + JSON.stringify(L1) + "\n");
  });
});
