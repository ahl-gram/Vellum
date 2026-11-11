import assert from "node:assert/strict";
import { test } from "node:test";
import { parseClaims } from "../../scripts/recon-triage/claims.ts";

const FIRST =
  '{"claim":"a is one","source":"body","paths":["src/a.ts"],"symbols":["a"],"kind":"behavior","verdict":"stale"}';
const OK = '{"claim":"b lives in src/b.ts","source":"comment 2026-11-10","paths":[],"symbols":[],"kind":"existence"}';

test("a claims file is read a line at a time, blank lines skipped and fields beyond the five dropped", () => {
  assert.deepEqual(parseClaims(`${FIRST}\n\n${OK}`), [
    { claim: "a is one", source: "body", paths: ["src/a.ts"], symbols: ["a"], kind: "behavior" },
    { claim: "b lives in src/b.ts", source: "comment 2026-11-10", paths: [], symbols: [], kind: "existence" },
  ]);
});

test("a malformed row is refused by its line number and what is wrong", () => {
  const row = (fields: Record<string, unknown>): string =>
    JSON.stringify({ claim: "c", source: "body", paths: [], symbols: [], kind: "count", ...fields });
  const refused = (text: string, message: string): void => {
    assert.throws(() => parseClaims(text), { message });
  };
  refused(`${OK}\nnot json`, "line 2: not a JSON object");
  refused(`${OK}\n\nnot json`, "line 3: not a JSON object");
  refused("[1]", "line 1: not a JSON object");
  refused(row({ claim: " " }), "line 1: claim is missing or empty");
  refused(row({ source: 3 }), "line 1: source is not a string");
  refused(row({ paths: ["a", 1] }), "line 1: paths is not a list of strings");
  refused(row({ symbols: "x" }), "line 1: symbols is not a list of strings");
  refused(row({ kind: "appearance" }), "line 1: kind is not one of behavior, existence, count, process");
});
