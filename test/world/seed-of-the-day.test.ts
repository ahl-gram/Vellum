import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { datelineFor, seedForDate } from "../../src/world/seed-of-the-day.ts";

test("the room folio's dateline names the UTC day in full and the seed it yields", () => {
  assert.equal(datelineFor(new Date("2026-07-06T00:00:00Z")), "Monday, 6 July 2026 · seed 20260706");
  assert.equal(datelineFor(new Date("2026-09-23T23:59:59Z")), "Wednesday, 23 September 2026 · seed 20260923");
});

test("the dateline names the UTC day whatever the clock's own zone, on both sides of the date line", () => {
  const module = pathToFileURL(resolve(import.meta.dirname, "..", "..", "src/world/seed-of-the-day.ts")).href;
  const script = `import(${JSON.stringify(module)}).then((m) => process.stdout.write(m.datelineFor(new Date("2026-09-23T23:59:59Z")) + "|" + m.datelineFor(new Date("2026-07-06T00:00:00Z"))))`;
  for (const zone of ["Pacific/Kiritimati", "Pacific/Pago_Pago"]) {
    const out = execFileSync(process.execPath, ["--input-type=module", "-e", script], { env: { ...process.env, TZ: zone }, encoding: "utf8", timeout: 30_000 });
    assert.equal(out, "Wednesday, 23 September 2026 · seed 20260923|Monday, 6 July 2026 · seed 20260706", `under TZ=${zone}`);
  }
});

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
