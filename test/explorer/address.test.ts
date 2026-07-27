// #192 The Address: the live-state keys of the Explorer hash. The grammar is pure and
// DOM-free (src/site/explorer/address.ts) so it is unit-tested here in isolation; the
// live plumbing (readHash/writeHash in hash-sync.ts, the conductor's one-shot restore)
// is proven by the e2e suite-address. Ratified vocabulary (the 2026-07-26 comment on
// #192): two mutually exclusive keys, a bare `survey` flag (the voyage at rest on its
// completed track) and `year=N` (the chronicle wound to in-world year N). The writer
// emits exactly one of them, or neither.
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseLive, emitLive, finalizeHash, liveNow } from "../../src/site/explorer/address.ts";

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

test("liveNow: the survey checkbox addresses the survey", () => {
  assert.deepEqual(liveNow({ survey: true, chronicle: false, year: null }), { kind: "survey" });
});

test("liveNow: the chronicle checkbox with a known year addresses that year", () => {
  assert.deepEqual(liveNow({ survey: false, chronicle: true, year: 812 }), { kind: "year", year: 812 });
});

test("liveNow: an unknowable year or a disarmed instrument emits nothing", () => {
  assert.equal(liveNow({ survey: false, chronicle: true, year: null }), null);
  assert.equal(liveNow({ survey: false, chronicle: true, year: undefined }), null);
  assert.equal(liveNow({ survey: false, chronicle: false, year: 812 }), null);
});
