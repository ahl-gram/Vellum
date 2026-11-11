import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { MODEL } from "../../scripts/jev/system-one.ts";
import { keeperRequest, SIGNALS, survivalRequest } from "../../scripts/keeper-scan/questions.ts";
import { RUN } from "../../test-support/keeper-scan-fixtures.ts";

test("the keeper request asks the trial's seven frozen keeper questions about the comment, its file and the code beside it", () => {
  const request = keeperRequest(RUN);
  assert.equal(request.model, MODEL);
  assert.deepEqual(request.state, { comment: "a fact", file: "src/keeper.ts", code: "const k = 1;" });
  assert.deepEqual(Object.keys(request.questions), [
    "measured",
    "platform",
    "deviation",
    "golden",
    "units",
    "convention",
    "sentinel",
  ]);
  assert.equal(
    createHash("sha256").update(JSON.stringify(request.questions)).digest("hex"),
    "ea074695f309d6ad64aad167838e6c8253b893c3657f1e1f5d3771b6afbbc705",
  );
});

test("a survival request asks one frozen survival question per signal it is given, in that order, against the whole file after and never the code beside the comment", () => {
  assert.equal(
    createHash("sha256")
      .update(JSON.stringify(survivalRequest(RUN, "F", SIGNALS).questions))
      .digest("hex"),
    "ab5710cd94fe2ff111add0695d2c10a26fa6af851cb03051632600afd0b7cb09",
  );
  const two = survivalRequest(RUN, "F", ["measured", "units"]);
  assert.equal(two.model, MODEL);
  assert.deepEqual(two.state, { comment: "a fact", file: "src/keeper.ts", file_after: "F" });
  assert.deepEqual(Object.keys(two.questions), ["measured", "units"]);
});
