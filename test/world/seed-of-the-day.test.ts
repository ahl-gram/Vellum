import { test } from "node:test";
import assert from "node:assert/strict";
import { seedForDate } from "../../src/world/seed-of-the-day.ts";

test("a date maps to its UTC YYYYMMDD as the seed", () => {
  assert.equal(seedForDate(new Date("2026-06-19T00:00:00Z")), 20260619);
  assert.equal(seedForDate(new Date("2026-01-05T12:00:00Z")), 20260105);
});

test("the mapping is deterministic for a given date", () => {
  const a = seedForDate(new Date("2026-06-19T08:30:00Z"));
  const b = seedForDate(new Date("2026-06-19T08:30:00Z"));
  assert.equal(a, b);
});

test("any instant within one UTC day yields the same seed", () => {
  const morning = seedForDate(new Date("2026-06-19T00:00:00Z"));
  const night = seedForDate(new Date("2026-06-19T23:59:59Z"));
  assert.equal(morning, night);
  assert.equal(morning, 20260619);
});

test("the day boundary is UTC, not local", () => {
  // late UTC on the 19th is still the 19th's world, never the 20th's
  assert.equal(seedForDate(new Date("2026-06-19T23:30:00Z")), 20260619);
});

test("consecutive days produce different seeds", () => {
  const d19 = seedForDate(new Date("2026-06-19T00:00:00Z"));
  const d20 = seedForDate(new Date("2026-06-20T00:00:00Z"));
  assert.notEqual(d19, d20);
});

test("seeds are positive 8-digit YYYYMMDD integers in range for the RNG", () => {
  const seed = seedForDate(new Date("2026-06-19T00:00:00Z"));
  assert.ok(Number.isInteger(seed));
  assert.ok(seed > 0);
  assert.ok(seed <= 99999999);
  assert.ok(seed < 2 ** 31, "stays in the non-negative 32-bit range the RNG masks to");
});
