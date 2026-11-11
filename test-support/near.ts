import assert from "node:assert/strict";

export function near(actual: number, expected: number, message: string): void {
  assert.ok(Math.abs(actual - expected) < 1e-9, `${message}: ${actual} against ${expected}`);
}
