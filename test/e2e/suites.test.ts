import { test } from "node:test";
import assert from "node:assert/strict";
import {
  E2E_SUITES_VAR,
  E2E_SUITE_ORDER,
  SMOKE_SUITES,
  formatSuiteTimings,
  resolveSuiteSelection,
  runOutcome,
  runSelected,
  suitesCertifiedByHealth,
  suitesNotWhole,
} from "../../e2e/support/suites.ts";
import type { SuiteTagged } from "../../e2e/support/suites.ts";
import type { E2eSuiteStep } from "../../e2e/support/skips.ts";

// Selection throws rather than narrowing: `every()` is true for [], so a typo'd name that matched nothing would report ALL PASS (0/0) and exit 0.

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
  const rank = (n: string) => E2E_SUITE_ORDER.indexOf(n as never);
  for (let i = 0; i < E2E_SUITE_ORDER.length - 1; i++) {
    const [a, b] = [E2E_SUITE_ORDER[i]!, E2E_SUITE_ORDER[i + 1]!];
    const { names } = resolveSuiteSelection({ [E2E_SUITES_VAR]: `${b},${a}` });
    // Membership can legitimately grow, so assert rank ordering rather than an exact pair.
    assert.deepEqual(
      names.map(rank),
      names
        .map(rank)
        .slice()
        .sort((x, y) => x - y),
      `${b},${a} out of order`,
    );
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
  for (const required of ["render", "health", "fallback"]) {
    assert.ok(SMOKE_SUITES.includes(required as never), `smoke must keep ${required}`);
  }
});

test("health reports the suites its clean bill actually covers, not the whole selection", () => {
  assert.deepEqual(suitesCertifiedByHealth(canonical(SMOKE_SUITES)), ["render"]);
  assert.deepEqual(suitesCertifiedByHealth(["render", "motion", "health", "hunt"]), ["render", "motion"]);
  assert.deepEqual(suitesCertifiedByHealth(["render", "hunt"]), [], "no health in the run certifies nothing");
  assert.deepEqual(suitesCertifiedByHealth(["health", "hunt"]), [], "health first certifies nothing");
});

test("runSelected runs the selected suites, in the order given, and nothing else", () => {
  // Guards the escaping mutation: a loop over E2E_SUITE_ORDER passes every other selection test.
  const ran: string[] = [];
  const suites = Object.fromEntries(
    E2E_SUITE_ORDER.map((n) => [
      n,
      () => {
        ran.push(n);
        return Promise.resolve();
      },
    ]),
  );
  return (async () => {
    const picked = canonical(SMOKE_SUITES);
    await runSelected(picked, suites, {});
    assert.deepEqual(ran, picked.slice(), "runSelected ran a different set or order than it was given");
    assert.ok(ran.length < E2E_SUITE_ORDER.length, "runSelected ran the whole suite despite a subset");
  })();
});

test("runSelected hands each suite the runner's context with that suite's own name, sharing its sinks, and refuses a name the runner cannot run", async () => {
  const results: { name: string; ok: boolean }[] = [];
  const skippedChecks: E2eSuiteStep[] = [];
  const ctx = { marker: 42, results, skippedChecks };
  const seen: SuiteTagged<typeof ctx>[] = [];
  const keep = (c: SuiteTagged<typeof ctx>): Promise<void> => {
    seen.push(c);
    return Promise.resolve();
  };
  await runSelected(["render", "health"], { render: keep, health: keep }, ctx);
  assert.deepEqual(
    seen.map((c) => c.suite),
    ["render", "health"],
    "a suite was handed another suite's name, or none",
  );
  assert.deepEqual(
    seen.map((c) => c.marker),
    [42, 42],
    "a suite was not handed the runner's context",
  );
  assert.ok(
    seen.every((c) => c.results === results && c.skippedChecks === skippedChecks),
    "a suite was handed a copy of a sink, so what it records never reaches the runner's tally",
  );
  await assert.rejects(() => runSelected(["render"], {}, {}), /no suite named render/);
});

test("a run that executed no checks fails instead of reporting ALL PASS (0/0)", () => {
  assert.deepEqual(runOutcome([]), { ok: false, line: "FAIL: no checks ran, so this run proves nothing." });
  assert.equal(runOutcome([{ ok: true }]).ok, true);
  assert.match(runOutcome([{ ok: true }, { ok: true }]).line, /ALL PASS {2}\(2\/2\)/);
  assert.equal(runOutcome([{ ok: true }, { ok: false }]).ok, false);
  assert.match(runOutcome([{ ok: true }, { ok: false }]).line, /SOME FAILED {2}\(1\/2\)/);
});

test("runSelected times each suite it ran, in the order it ran them", () => {
  const clock = [0, 5, 5, 12, 12, 13];
  let tick = 0;
  const now = () => clock[tick++]!;
  const suites = Object.fromEntries(E2E_SUITE_ORDER.map((n) => [n, async () => {}]));
  return (async () => {
    const timings = await runSelected(["render", "health", "hunt"], suites, {}, { now });
    assert.deepEqual(
      timings.map((t) => t.name),
      ["render", "health", "hunt"],
    );
    assert.deepEqual(
      timings.map((t) => t.ms),
      [5, 7, 1],
      "a suite's time is its own, not the elapsed total",
    );
  })();
});

test("a suite that RAN TO ITS END with a check group skipped is recorded as such, and only the suite the skip happened in", async () => {
  const skipped: string[] = [];
  const suites = {
    render: async () => {},
    motion: () => {
      skipped.push("D1, D2");
      return Promise.resolve();
    },
    turn: async () => {},
  };
  const timings = await runSelected(["render", "motion", "turn"], suites, {}, { skippedGroups: () => skipped });
  assert.deepEqual(
    timings.map((t) => t.skipped ?? []),
    [[], ["D1, D2"], []],
    "the skip was read as a running total rather than this suite's own delta, so every suite after the first skip inherits it (or none is recorded at all)",
  );
  assert.deepEqual(
    timings.map((t) => t.aborted === true),
    [false, false, false],
    "a suite that ran to its end was recorded as having stopped early",
  );
});

test("a run that did not run whole is every suite that stopped early AND every suite that skipped a check group", () => {
  const timings = [
    { name: "render" as const, ms: 1, skipped: ["R8"] as readonly string[] },
    { name: "motion" as const, ms: 1, aborted: true },
    { name: "turn" as const, ms: 1 },
    { name: "verso" as const, ms: 1, skipped: [] as readonly string[] },
  ];
  assert.deepEqual(
    suitesNotWhole(timings),
    ["render", "motion"],
    "a suite that skipped a check group is counted as whole, so health certifies a run that exercised fewer interactions than it claims (#560)",
  );
});

test("health certifies no suite that stopped early, since a suite that gave up half way never earned the clean bill", () => {
  assert.deepEqual(
    suitesCertifiedByHealth(["render", "motion", "health", "hunt"], ["motion"]),
    ["render"],
    "a suite that stopped early is still reported as console/network certified",
  );
  assert.deepEqual(
    suitesCertifiedByHealth(["render", "motion", "health", "hunt"]),
    ["render", "motion"],
    "nothing gave up, so the certification is unchanged",
  );
  assert.deepEqual(
    suitesCertifiedByHealth(["render", "motion", "health"], ["render", "motion"]),
    [],
    "every suite before health gave up, so health certifies nothing",
  );
});

test("the timing table ranks suites by cost and totals them, so a split can be measured", () => {
  const lines = formatSuiteTimings([
    { name: "render", ms: 1000 },
    { name: "survey", ms: 3000 },
    { name: "health", ms: 0 },
  ]);
  assert.match(lines[0]!, /4\.0s/, "the header must total the run");
  assert.deepEqual(
    lines.slice(1).map((l) => l.trim().split(/\s+/)[0]),
    ["survey", "render", "health"],
    "the table must rank by cost, since the point is to find the expensive suites",
  );
  assert.match(lines[1]!, /3\.0s/);
  assert.match(lines[1]!, /75\.0%/, "the share of the run is what a split is reasoned from");
  assert.deepEqual(formatSuiteTimings([]), [], "nothing ran, so there is nothing to rank");
  assert.doesNotThrow(() => formatSuiteTimings([{ name: "health", ms: 0 }]), "a zero-cost run must not divide by zero");
});

test("a suite that inherits the harness's page pulls in render, which consumes the boot draw", () => {
  for (const name of ["motion", "turn", "verso", "glass-ceremony", "cards", "fallback"] as const) {
    const { names } = resolveSuiteSelection({ [E2E_SUITES_VAR]: name });
    assert.equal(names[0], "render", `${name} alone must pull in render`);
    assert.ok(names.includes(name), `${name} must still run`);
  }
  for (const name of ["zoom", "zoom-gestures", "hunt", "print-room", "home", "reading-room"] as const) {
    assert.deepEqual(resolveSuiteSelection({ [E2E_SUITES_VAR]: name }).names, [name], `${name} navigates itself`);
  }
  assert.deepEqual(resolveSuiteSelection({ [E2E_SUITES_VAR]: "render" }).names, ["render"]);
  assert.deepEqual(resolveSuiteSelection({ [E2E_SUITES_VAR]: "smoke" }).names, canonical(SMOKE_SUITES));
});
