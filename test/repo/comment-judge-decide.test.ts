import assert from "node:assert/strict";
import { test } from "node:test";
import { decide } from "../../scripts/comment-judge/decide.ts";
import type { Candidate } from "../../scripts/comment-judge/types.ts";

const A: Candidate = { file: "test/a.test.ts", name: "a", body: "" };
const B: Candidate = { file: "test/b.test.ts", name: "b", body: "" };

test("a candidate test above 0.7 is a finding that names the test", () => {
  assert.deepEqual(decide({ restates: 0.1, pins: [0.2, 0.71] }, [A, B]), {
    kind: "finding",
    pinnedBy: [{ file: "test/b.test.ts", name: "b", noul: 0.71 }],
    restates: null,
  });
});

test("the restatement answer above 0.7 is a finding that names no test", () => {
  assert.deepEqual(decide({ restates: 0.8, pins: [] }, []), { kind: "finding", pinnedBy: [], restates: 0.8 });
});

test("every answer below 0.3 is clear, and one at 0.3 is unsettled", () => {
  assert.deepEqual(decide({ restates: 0.29, pins: [0.1, 0.29] }, [A, B]), { kind: "clear" });
  assert.deepEqual(decide({ restates: 0.3, pins: [0.1] }, [A]), { kind: "unsettled", highest: 0.3 });
});

test("an answer of exactly 0.7 is unsettled, not a finding", () => {
  assert.deepEqual(decide({ restates: 0.7, pins: [0.7] }, [A]), { kind: "unsettled", highest: 0.7 });
  assert.deepEqual(decide({ restates: 0.7, pins: [0.8] }, [A]), {
    kind: "finding",
    pinnedBy: [{ file: "test/a.test.ts", name: "a", noul: 0.8 }],
    restates: null,
  });
});
