import assert from "node:assert/strict";
import { test } from "node:test";
import { requestFor, verdictOf } from "../../scripts/copy-hunt/questions.ts";
import { fnOf } from "../../test-support/copy-hunt-fixtures.ts";

test("a request asks the scan's frozen question about both functions, each sent as its file, name and body", () => {
  const request = requestFor(
    fnOf("src/a.ts", 1, "alpha", [], { body: "A" }),
    fnOf("src/b.ts", 2, "beta", [], { body: "B" }),
  );
  assert.equal(
    JSON.stringify(request),
    '{"model":"jev-1.14.0","state":{"fn_a":{"file":"src/a.ts","name":"alpha","body":"A"},"fn_b":{"file":"src/b.ts","name":"beta","body":"B"}},"questions":{"same":{"type":"noul","instructions":"Do `fn_a` and `fn_b` implement the same logic, so one could replace the other?","criteria":{"true":"Given the same inputs they compute the same result, even where names or formatting differ.","false":"They compute different things, even where they look alike."}}}}',
  );
});

test("a mean above 0.7 is a copy, below 0.3 not a copy, and 0.3 and 0.7 themselves unsettled", () => {
  assert.equal(verdictOf(0.71), "copy");
  assert.equal(verdictOf(0.7), "unsettled");
  assert.equal(verdictOf(0.5), "unsettled");
  assert.equal(verdictOf(0.3), "unsettled");
  assert.equal(verdictOf(0.29), "not a copy");
});
