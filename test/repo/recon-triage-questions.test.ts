import assert from "node:assert/strict";
import { test } from "node:test";
import { bandOf, requestFor, scoreOf } from "../../scripts/recon-triage/questions.ts";

test("a request asks the trial's two frozen questions about the claim and its code, holds first", () => {
  assert.equal(
    JSON.stringify(requestFor("c", "x")),
    '{"model":"jev-1.14.0","state":{"claim":"c","code":"x"},"questions":{"holds":{"type":"noul","instructions":"Does `code` do what `claim` says?","criteria":{"true":"`code` behaves the way `claim` describes, for example a function `claim` says takes a URL does take one.","false":"`code` does something `claim` does not allow, for example a function `claim` says takes a URL takes no arguments."}},"contradicts":{"type":"noul","instructions":"Does `code` show that `claim` is wrong?","criteria":{"true":"Something in `code` behaves differently from what `claim` says, for example `claim` says a list has five ids and `code` declares three.","false":"Nothing in `code` goes against `claim`."}}}}',
  );
});

test("the score is the mean of holds and one minus contradicts, and an equal score never crosses 0.3 or 0.7", () => {
  assert.equal(scoreOf(0.5, 1), 0.25);
  assert.equal(scoreOf(1, 0), 1);
  assert.equal(scoreOf(0.75, 0.25), 0.75);
  assert.equal(bandOf(0.29), "likely stale");
  assert.equal(bandOf(0.3), "unsettled");
  assert.equal(bandOf(0.7), "unsettled");
  assert.equal(bandOf(0.71), "likely current");
});
