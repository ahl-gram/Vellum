import { test } from "node:test";
import assert from "node:assert/strict";
import { errorText } from "../../src/site/shared/error-text.ts";

test("an Error reads as its message alone, so a status line says what went wrong and not the class name before it", () => {
  assert.equal(errorText(new Error("boom")), "boom");
  assert.equal(errorText(new TypeError("no such plate")), "no such plate");
});

test("a rejection that is not an Error reads as its own text, where reading its message would print undefined", () => {
  assert.equal(errorText("boom"), "boom");
  assert.equal(errorText(42), "42");
  assert.equal(errorText(undefined), "undefined");
  assert.equal(errorText(null), "null");
  assert.equal(errorText({ code: 7 }), "[object Object]");
});
