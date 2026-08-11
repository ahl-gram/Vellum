// #192 The Address: the live-state keys of the Explorer hash. The grammar is pure and
// DOM-free (src/site/explorer/address.ts) so it is unit-tested here in isolation; the
// live plumbing (readHash/writeHash in hash-sync.ts, the conductor's one-shot restore)
// is proven by the e2e suite-survey and the room-hosted RA suite (#321). Ratified
// vocabulary (the 2026-07-26 comment on
// #192): two mutually exclusive keys, a bare `survey` flag (the voyage at rest on its
// completed track) and `year=N` (the chronicle wound to in-world year N). The writer
// emits exactly one of them, or neither.
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseLive, emitLive, finalizeHash, liveNow, forwardTarget } from "../../src/site/explorer/address.ts";

const P = (s: string) => new URLSearchParams(s);

test("parseLive: no live key means no live state", () => {
  assert.equal(parseLive(P("")), null);
  assert.equal(parseLive(P("seed=42&style=antique")), null);
});

test("parseLive: the bare survey flag and its survey= spelling both address the survey", () => {
  assert.deepEqual(parseLive(P("seed=42&survey")), { kind: "survey" });
  assert.deepEqual(parseLive(P("seed=42&survey=")), { kind: "survey" });
});

test("parseLive: year=N addresses the chronicle at a real in-world year", () => {
  assert.deepEqual(parseLive(P("seed=42&year=814")), { kind: "year", year: 814 });
  assert.deepEqual(parseLive(P("year=1")), { kind: "year", year: 1 });
});

test("parseLive: year has no sentinel and no garbage; invalid years are ignored", () => {
  // year=0 is dead by ratification (no world has a year 0; the survey key is the address
  // of the survey), and the presence-gate discipline means a malformed value never throws.
  assert.equal(parseLive(P("year=0")), null);
  assert.equal(parseLive(P("year=-3")), null);
  assert.equal(parseLive(P("year=8.5")), null);
  assert.equal(parseLive(P("year=abc")), null);
  assert.equal(parseLive(P("year=")), null);
});

test("parseLive: both keys at once is a nonsensical set and is ignored whole", () => {
  // The camera precedent in readHash: a partial or nonsensical set is ignored, never split.
  assert.equal(parseLive(P("survey&year=814")), null);
  assert.equal(parseLive(P("year=814&survey=")), null);
});

test("emitLive + finalizeHash: the survey emits as the ratified bare flag, no equals", () => {
  const p = P("");
  p.set("seed", "42");
  emitLive(p, { kind: "survey" });
  assert.equal(finalizeHash(p), "seed=42&survey");
});

test("emitLive + finalizeHash: the bare respelling holds mid-string, before the camera", () => {
  const p = P("");
  p.set("seed", "42");
  emitLive(p, { kind: "survey" });
  p.set("cx", "0.3500");
  assert.equal(finalizeHash(p), "seed=42&survey&cx=0.3500");
});

test("emitLive + finalizeHash: year emits as a plain pair", () => {
  const p = P("");
  p.set("seed", "42");
  emitLive(p, { kind: "year", year: 814 });
  assert.equal(finalizeHash(p), "seed=42&year=814");
});

test("emitLive: no live state leaves the hash byte-identical to today's", () => {
  const p = P("");
  p.set("seed", "42");
  p.set("style", "antique");
  const before = p.toString();
  emitLive(p, null);
  assert.equal(finalizeHash(p), before);
});

test("the grammar round-trips: parse(finalize(emit(live))) === live", () => {
  for (const live of [{ kind: "survey" } as const, { kind: "year", year: 650 } as const]) {
    const p = P("seed=42&style=ink");
    emitLive(p, live);
    assert.deepEqual(parseLive(P(finalizeHash(p))), live);
  }
});

test("liveNow: a survey-chamber rest addresses the bare survey (#220)", () => {
  assert.deepEqual(
    liveNow({ ages: true, chamber: "survey", year: null, pending: null }),
    { kind: "survey" },
  );
});

test("liveNow: an ages-chamber rest with a known year addresses that year (#220)", () => {
  assert.deepEqual(
    liveNow({ ages: true, chamber: "ages", year: 812, pending: null }),
    { kind: "year", year: 812 },
  );
});

test("liveNow: while the arm lags the gesture, the restored key survives as the fallback (#220)", () => {
  const pending = { kind: "year", year: 640 } as const;
  assert.deepEqual(liveNow({ ages: true, chamber: null, year: null, pending }), pending);
  assert.deepEqual(
    liveNow({ ages: true, chamber: null, year: null, pending: { kind: "survey" } }),
    { kind: "survey" },
  );
});

test("liveNow: an unknowable state or a disarmed instrument emits nothing", () => {
  assert.equal(liveNow({ ages: true, chamber: null, year: null, pending: null }), null);
  assert.equal(liveNow({ ages: true, chamber: "ages", year: null, pending: null }), null);
  assert.equal(liveNow({ ages: false, chamber: "ages", year: 812, pending: null }), null);
  assert.equal(
    liveNow({ ages: false, chamber: null, year: null, pending: { kind: "survey" } }),
    null,
    "a disarmed instrument emits nothing even with a stale pending key",
  );
});

// #321 (Survey & Story Sub 4): the time forward. An Explorer link carrying a valid
// `year=N` forwards to the Reading Room BEFORE any draw, hash verbatim (decision 2,
// 2026-08-11: the room reads the same recipe keys and ignores what it cannot use, so
// the forward strips nothing). Everything else stays in the Explorer exactly as today:
// the bare survey flag is the Explorer's own address, a malformed year is ignored, and
// the both-keys set is nonsensical and ignored whole (parseLive's discipline, reused).
test("forwardTarget: a valid year=N link forwards to the Reading Room, hash verbatim", () => {
  assert.equal(
    forwardTarget("#seed=42&style=antique&legend=1&arms=0&year=814"),
    "/reading-room/#seed=42&style=antique&legend=1&arms=0&year=814",
  );
  // The camera and every other rider forwards untouched; the room ignores what it
  // cannot use (its applyHash allowlists), so nothing is stripped here.
  assert.equal(
    forwardTarget("#seed=7&style=ink&year=1&cx=0.5100&cy=0.4900&k=3.0000"),
    "/reading-room/#seed=7&style=ink&year=1&cx=0.5100&cy=0.4900&k=3.0000",
  );
});

test("forwardTarget: a survey link is the Explorer's own address and stays", () => {
  assert.equal(forwardTarget("#seed=42&survey"), null);
  assert.equal(forwardTarget("#seed=42&survey="), null);
});

test("forwardTarget: a malformed year stays in the Explorer, ignored as today", () => {
  assert.equal(forwardTarget("#seed=42&year=0"), null);
  assert.equal(forwardTarget("#seed=42&year=-3"), null);
  assert.equal(forwardTarget("#seed=42&year=8.5"), null);
  assert.equal(forwardTarget("#seed=42&year=abc"), null);
  assert.equal(forwardTarget("#seed=42&year="), null);
  assert.equal(forwardTarget(""), null);
  assert.equal(forwardTarget("#seed=42&style=antique"), null);
});

test("forwardTarget: the both-keys set is ignored whole, so it stays", () => {
  assert.equal(forwardTarget("#seed=42&survey&year=814"), null);
});
