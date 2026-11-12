import test from "node:test";
import assert from "node:assert/strict";
import { E2E_LANES } from "../../e2e/support/lanes.ts";
import { primerGaps, primerSuiteOf, routeOf } from "../../e2e/support/primer-judge.ts";
import { PRIMER_ROOMS } from "../../e2e/support/primer-rooms.ts";
import { E2E_SUITE_ORDER } from "../../e2e/support/suites.ts";
import { LADDERS } from "../../src/site/shared/primer/ladders.ts";

const routes = LADDERS.map((l) => l.route);

test("PS1 every ladder in the guide has its own suite in the runner's order, in exactly one lane, and a room the check can open; a ladder with none is named", () => {
  assert.deepEqual(primerGaps(routes, E2E_SUITE_ORDER), []);
  for (const route of routes) {
    const suite = primerSuiteOf(route);
    assert.equal(
      E2E_LANES.filter((l) => (l.suites as readonly string[]).includes(suite)).length,
      1,
      `${suite} runs in one lane`,
    );
    assert.ok(PRIMER_ROOMS[route] !== undefined, `PRIMER_ROOMS opens ${route}`);
  }
  assert.deepEqual(primerGaps([...routes, "/ribbon/"], E2E_SUITE_ORDER), ["/ribbon/"]);
  assert.deepEqual(["/explorer/", "/explorer/portfolio/", "/seed-of-the-day/"].map(primerSuiteOf), [
    "primer-explorer",
    "primer-portfolio",
    "primer-seed-of-the-day",
  ]);
});

test("PS2 every step's address opens a room the check can open, the room its Try it opens and not only its ladder's (Issue #1252)", () => {
  const steps = LADDERS.flatMap((l) => l.lessons.flatMap((lesson) => lesson.steps.map((s) => ({ s, route: l.route }))));
  assert.deepEqual(
    steps.filter(({ s }) => PRIMER_ROOMS[routeOf(s.at)] === undefined).map(({ s }) => s.id),
    [],
  );
  assert.ok(
    steps.some(({ s, route }) => routeOf(s.at) !== route),
    "no step opens a room other than its ladder's, so nothing here tells the two keys apart",
  );
});
