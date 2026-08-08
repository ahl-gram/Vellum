import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_E2E_DPORT,
  DEFAULT_E2E_PORT,
  debugPortConflictMessage,
  resolveE2ePorts,
  resolvePort,
} from "../../src/cli/e2e-ports.ts";

// Two behaviors matter here, and the second is the dangerous one (#339).
//
// 1. Both ports must be overridable, so two checkouts can run the e2e at once.
//    A bad override must THROW rather than fall back to the default: a silent
//    fallback puts both lanes back on the same port, which is the bug.
// 2. A stray browser already holding the debug port must be a loud failure.
//    Nothing binds that port during launch, so `getPageTarget` happily attaches
//    to whatever answers /json. On 2026-07-29 that meant a whole run reported
//    results from an OLD browser and an OLD build, with no error anywhere.

test("unset env keeps today's defaults, so every existing invocation is unchanged", () => {
  assert.equal(resolvePort({}, "VELLUM_E2E_PORT", DEFAULT_E2E_PORT), DEFAULT_E2E_PORT);
  assert.deepEqual(resolveE2ePorts({}), { PORT: DEFAULT_E2E_PORT, DPORT: DEFAULT_E2E_DPORT });
});

test("an override wins over the default", () => {
  assert.equal(resolvePort({ VELLUM_E2E_PORT: "8790" }, "VELLUM_E2E_PORT", DEFAULT_E2E_PORT), 8790);
  assert.deepEqual(resolveE2ePorts({ VELLUM_E2E_PORT: "8790", VELLUM_E2E_DPORT: "9333" }), {
    PORT: 8790,
    DPORT: 9333,
  });
});

test("each port can be overridden alone", () => {
  assert.deepEqual(resolveE2ePorts({ VELLUM_E2E_DPORT: "9333" }), {
    PORT: DEFAULT_E2E_PORT,
    DPORT: 9333,
  });
});

// process.env yields "" for `FOO=` rather than undefined (the browser-policy rule).
test("empty-string env vars count as unset", () => {
  assert.equal(resolvePort({ VELLUM_E2E_PORT: "" }, "VELLUM_E2E_PORT", DEFAULT_E2E_PORT), DEFAULT_E2E_PORT);
});

test("a non-numeric port throws and names the variable, instead of falling back", () => {
  assert.throws(() => resolvePort({ VELLUM_E2E_PORT: "abc" }, "VELLUM_E2E_PORT", DEFAULT_E2E_PORT), /VELLUM_E2E_PORT/);
});

test("an out-of-range port throws", () => {
  for (const bad of ["0", "-1", "65536", "1.5", "9333x", " "]) {
    assert.throws(
      () => resolvePort({ VELLUM_E2E_DPORT: bad }, "VELLUM_E2E_DPORT", DEFAULT_E2E_DPORT),
      /VELLUM_E2E_DPORT/,
      `expected ${JSON.stringify(bad)} to be rejected`,
    );
  }
});

test("surrounding whitespace is tolerated", () => {
  assert.equal(resolvePort({ VELLUM_E2E_PORT: " 8790 " }, "VELLUM_E2E_PORT", DEFAULT_E2E_PORT), 8790);
});

// Setting one port onto the other's default is the easy way to break a lane by
// hand, and it fails deep inside the browser launch rather than at the setting.
test("the two ports may not collide, including against the other's default", () => {
  assert.throws(() => resolveE2ePorts({ VELLUM_E2E_PORT: "9333", VELLUM_E2E_DPORT: "9333" }), /9333/);
  assert.throws(() => resolveE2ePorts({ VELLUM_E2E_PORT: String(DEFAULT_E2E_DPORT) }), /9222/);
});

test("a free debug port is no conflict", () => {
  assert.equal(debugPortConflictMessage(9222, { listening: false }), null);
});

test("a debug port already answering fails loud and names the port", () => {
  const msg = debugPortConflictMessage(9222, { listening: true });
  assert.ok(msg, "expected a conflict message for an occupied debug port");
  assert.match(msg, /9222/);
  assert.match(msg, /VELLUM_E2E_DPORT/);
});

test("the conflict message names the stray browser when it identified itself", () => {
  const msg = debugPortConflictMessage(9222, { listening: true, identity: "Chrome/141.0.0.0" });
  assert.ok(msg);
  assert.match(msg, /Chrome\/141\.0\.0\.0/);
});

// The whole point: attaching to a live browser is worse than colliding with one,
// because the run stays green while reporting on a build that is not this one.
test("the conflict message explains that the run would otherwise use a stale build", () => {
  const msg = debugPortConflictMessage(9222, { listening: true });
  assert.ok(msg);
  assert.match(msg, /stale|old|previous/i);
});
