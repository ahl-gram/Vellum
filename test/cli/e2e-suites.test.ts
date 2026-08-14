import { test } from "node:test";
import assert from "node:assert/strict";
import {
  E2E_SUITES_VAR,
  E2E_SUITE_ORDER,
  SMOKE_SUITES,
  resolveSuiteSelection,
  runOutcome,
  runSelected,
  suitesCertifiedByHealth,
} from "../../src/cli/e2e-suites.ts";

// The dangerous half of suite selection is the VACUOUS GREEN: `results.every(r => r.ok)` is true for
// an empty array, so a typo'd name that selected nothing would print ALL PASS (0/0) and exit 0.
// Selection therefore throws rather than narrowing, and the runner fails a run that executed nothing.

const canonical = (names: readonly string[]) => E2E_SUITE_ORDER.filter((s) => names.includes(s));

test("unset or empty keeps the full suite, so every existing invocation is unchanged", () => {
  assert.deepEqual(resolveSuiteSelection({}), { names: E2E_SUITE_ORDER.slice(), tier: "full" });
  assert.deepEqual(resolveSuiteSelection({ [E2E_SUITES_VAR]: "" }).names, E2E_SUITE_ORDER.slice());
  assert.deepEqual(resolveSuiteSelection({ [E2E_SUITES_VAR]: "   " }).names, E2E_SUITE_ORDER.slice());
});

test("the full and smoke keywords resolve to their tiers", () => {
  for (const word of ["full", "all", "FULL", " all "]) {
    const sel = resolveSuiteSelection({ [E2E_SUITES_VAR]: word });
    assert.deepEqual(sel.names, E2E_SUITE_ORDER.slice(), word);
    assert.equal(sel.tier, "full", word);
  }
  for (const word of ["smoke", "SMOKE", " smoke "]) {
    const sel = resolveSuiteSelection({ [E2E_SUITES_VAR]: word });
    assert.deepEqual(sel.names, canonical(SMOKE_SUITES), word);
    assert.equal(sel.tier, "smoke", word);
  }
});

test("an explicit list is returned in canonical runner order, never request order", () => {
  // Sweep the whole class, not one example: every adjacent pair, requested backwards, must come back
  // in runner order. Order is load-bearing (render asserts the pristine boot; health is a checkpoint
  // over what preceded it), so honouring request order would silently change what a run means.
  const rank = (n: string) => E2E_SUITE_ORDER.indexOf(n as never);
  for (let i = 0; i < E2E_SUITE_ORDER.length - 1; i++) {
    const [a, b] = [E2E_SUITE_ORDER[i], E2E_SUITE_ORDER[i + 1]];
    const { names } = resolveSuiteSelection({ [E2E_SUITES_VAR]: `${b},${a}` });
    // Membership can legitimately grow (an inheritor pulls in render), so assert the ORDER property
    // directly: strictly ascending runner rank, with both requested suites present.
    assert.deepEqual(names.map(rank), names.map(rank).slice().sort((x, y) => x - y), `${b},${a} out of order`);
    assert.equal(new Set(names).size, names.length, `${b},${a} duplicated a suite`);
    for (const want of [a, b]) assert.ok(names.includes(want), `${b},${a} dropped ${want}`);
  }
  const reversed = E2E_SUITE_ORDER.slice().reverse().join(",");
  assert.deepEqual(resolveSuiteSelection({ [E2E_SUITES_VAR]: reversed }).names, E2E_SUITE_ORDER.slice());
});

test("a list tolerates whitespace, case, and duplicates without changing what runs", () => {
  const sel = resolveSuiteSelection({ [E2E_SUITES_VAR]: " HEALTH , render ,health,  Render " });
  assert.deepEqual(sel.names, ["render", "health"]);
  assert.equal(sel.tier, "custom");
});

test("an unknown suite name throws, naming the offender and the valid set", () => {
  assert.throws(
    () => resolveSuiteSelection({ [E2E_SUITES_VAR]: "render,rendr" }),
    (err: Error) => {
      assert.match(err.message, /rendr/);
      assert.match(err.message, /render/);
      assert.match(err.message, new RegExp(E2E_SUITES_VAR));
      return true;
    },
  );
  // A near-miss on a real name must not be silently dropped down to the suites that DID parse.
  assert.throws(() => resolveSuiteSelection({ [E2E_SUITES_VAR]: "print_room" }), /print_room/);
});

test("a list that selects nothing throws instead of reporting a vacuous ALL PASS (0/0)", () => {
  for (const raw of [",", " , , ", ","]) {
    assert.throws(() => resolveSuiteSelection({ [E2E_SUITES_VAR]: raw }), /at least one suite/i, raw);
  }
});

test("the smoke tier is a real, non-empty, strict subset of the runner's suites", () => {
  assert.ok(SMOKE_SUITES.length > 0);
  assert.ok(SMOKE_SUITES.length < E2E_SUITE_ORDER.length, "a smoke tier equal to the full suite saves nothing");
  for (const name of SMOKE_SUITES) assert.ok(E2E_SUITE_ORDER.includes(name), `${name} is not a runner suite`);
  assert.equal(new Set(SMOKE_SUITES).size, SMOKE_SUITES.length, "duplicate smoke entries");
  // The ratified coverage floor: the engine/worker core, the inline fallback, the health checkpoint,
  // and every page that ships its own bundle. Losing any of these silently lowers what a green PR means.
  for (const required of ["render", "health", "fallback"]) {
    assert.ok(SMOKE_SUITES.includes(required as never), `smoke must keep ${required}`);
  }
});

test("health reports the suites its clean bill actually covers, not the whole selection", () => {
  // N1/N2 assert over ACCUMULATED console/network state, so they certify only what ran before them.
  assert.deepEqual(suitesCertifiedByHealth(canonical(SMOKE_SUITES)), ["render"]);
  assert.deepEqual(suitesCertifiedByHealth(["render", "motion", "health", "hunt"]), ["render", "motion"]);
  assert.deepEqual(suitesCertifiedByHealth(["render", "hunt"]), [], "no health in the run certifies nothing");
  assert.deepEqual(suitesCertifiedByHealth(["health", "hunt"]), [], "health first certifies nothing");
});

test("runSelected runs the selected suites, in the order given, and nothing else", () => {
  // The mutation this exists for: a run loop that iterates E2E_SUITE_ORDER instead of the selection.
  // Every selection test above still passes under it, because they test the resolver and never its
  // one caller, so the whole tier silently becomes the full suite.
  const ran: string[] = [];
  const suites = Object.fromEntries(
    E2E_SUITE_ORDER.map((n) => [n, async () => { ran.push(n); }]),
  );
  return (async () => {
    const picked = canonical(SMOKE_SUITES);
    await runSelected(picked, suites, {});
    assert.deepEqual(ran, picked.slice(), "runSelected ran a different set or order than it was given");
    assert.ok(ran.length < E2E_SUITE_ORDER.length, "runSelected ran the whole suite despite a subset");
  })();
});

test("runSelected hands every suite the same ctx, and refuses a name the runner cannot run", async () => {
  const ctx = { marker: 42 };
  const seen: unknown[] = [];
  await runSelected(["render", "health"], { render: async (c) => { seen.push(c); }, health: async (c) => { seen.push(c); } }, ctx);
  assert.deepEqual(seen, [ctx, ctx]);
  await assert.rejects(() => runSelected(["render"], {}, {}), /no suite named render/);
});

test("a run that executed no checks fails instead of reporting ALL PASS (0/0)", () => {
  assert.deepEqual(runOutcome([]), { ok: false, line: "FAIL: no checks ran, so this run proves nothing." });
  assert.equal(runOutcome([{ ok: true }]).ok, true);
  assert.match(runOutcome([{ ok: true }, { ok: true }]).line, /ALL PASS {2}\(2\/2\)/);
  assert.equal(runOutcome([{ ok: true }, { ok: false }]).ok, false);
  assert.match(runOutcome([{ ok: true }, { ok: false }]).line, /SOME FAILED {2}\(1\/2\)/);
});

test("a suite that inherits the harness's page pulls in render, which consumes the boot draw", () => {
  // waitSettled resolves the moment the page is settled, so a suite that clicks draw and waits can
  // settle on the boot world instead of its own: VELLUM_E2E_SUITES=turn failed T1b with the
  // seed-of-the-day seed where it asserts 42, while render,turn passed 27/27. render is the suite
  // that consumes that boot draw, so requesting any inheritor pulls it in.
  for (const name of ["motion", "turn", "verso", "glass-ceremony", "cards", "fallback"] as const) {
    const { names } = resolveSuiteSelection({ [E2E_SUITES_VAR]: name });
    assert.equal(names[0], "render", `${name} alone must pull in render`);
    assert.ok(names.includes(name), `${name} must still run`);
  }
  // Suites that navigate themselves get a fresh page and need nothing added.
  for (const name of ["zoom", "zoom-gestures", "hunt", "print-room", "home", "reading-room"] as const) {
    assert.deepEqual(resolveSuiteSelection({ [E2E_SUITES_VAR]: name }).names, [name], `${name} navigates itself`);
  }
  // render alone stays alone, so the smoke tier is not inflated by its own dependency rule.
  assert.deepEqual(resolveSuiteSelection({ [E2E_SUITES_VAR]: "render" }).names, ["render"]);
  assert.deepEqual(resolveSuiteSelection({ [E2E_SUITES_VAR]: "smoke" }).names, canonical(SMOKE_SUITES));
});
