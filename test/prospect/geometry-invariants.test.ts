import { test } from "node:test";
import assert from "node:assert/strict";
import type { ProspectInput } from "../../src/prospect/input.ts";
import { band, makeInput } from "../../test-support/prospect-fixtures.ts";
import { composeProspect } from "../../src/prospect/compose.ts";
import {
  PLATE_H,
  VIEW_X0,
  VIEW_X1,
  groundingViolations,
  type Mass,
  type ProspectGeometry,
} from "../../src/prospect/geometry.ts";

test("every composition is grounded and in frame", () => {
  const cases: ProspectInput[] = [
    makeInput({ kind: "capital", harbor: true }),
    makeInput({ kind: "seat", siteRel: 0.6 }),
    makeInput({ kind: "town", onRiver: true }),
    makeInput({ kind: "village", foreground: band("marsh") }),
    makeInput({ kind: "town", ruined: true }),
    makeInput({ kind: "hamlet" }),
    // Unwalled hamlets are where the back-row containment filter fires; these seeds are measured live witnesses (2026-08-10).
    makeInput({ kind: "hamlet", seed: 3 }),
    makeInput({ kind: "hamlet", ruined: true, seed: 1 }),
  ];
  for (const input of cases) {
    const g = composeProspect(input);
    assert.deepEqual(
      groundingViolations(g),
      [],
      `${input.kind} h${String(input.harbor)} r${String(input.onRiver)} is grounded`,
    );
    for (const m of g.masses) {
      assert.ok(m.x >= VIEW_X0 - 2 && m.x + m.w <= VIEW_X1 + 2, "mass inside the view");
      assert.ok(m.base - m.h > 0 && m.base < PLATE_H, "mass inside the plate");
    }
  }
  // At seed 3 the hamlet packs TWO back-row masses and the filter must drop exactly one (measured); a deleted filter reds here on the count.
  const filtered = composeProspect(makeInput({ kind: "hamlet", seed: 3 }));
  assert.equal(
    filtered.masses.filter((m) => m.raise > 0).length,
    1,
    "the seed 3 hamlet keeps exactly one covered back mass",
  );
});

test("the grounding check bites on a floated or uncovered mass", () => {
  const g = composeProspect(makeInput({ kind: "capital" }));
  const firstIdx = g.masses.findIndex((m) => m.raise === 0);
  const floated: ProspectGeometry = {
    ...g,
    masses: g.masses.map((m, i) => (i === firstIdx ? { ...m, base: m.base - 3 } : m)),
  };
  assert.ok(groundingViolations(floated).length > 0, "a floated mass is reported");

  const backIdx = g.masses.findIndex((m) => m.raise > 0);
  assert.ok(backIdx >= 0, "a capital composes a raised back row");
  const escaped: ProspectGeometry = {
    ...g,
    masses: g.masses.map((m, i) =>
      i === backIdx ? { ...m, x: VIEW_X0 + 1, base: groundingBase(g, VIEW_X0 + 1, m) } : m,
    ),
  };
  assert.ok(
    groundingViolations(escaped).length > 0,
    "a raised mass outside the front cover is reported",
  );
});

/** Base that keeps the moved mass on the ground function, so the uncovered case fails on COVER alone, not incidentally on the ground equation. */
function groundingBase(g: ProspectGeometry, x: number, m: Mass): number {
  return g.ground.base - m.raise;
}

test("the same input composes byte-identical geometry", () => {
  const input = makeInput({ kind: "capital", harbor: true, siteRel: 0.3 });
  const a = composeProspect(input);
  const b = composeProspect(structuredClone(input));
  assert.deepEqual(a, b);
  assert.equal(JSON.stringify(a), JSON.stringify(b));
  assert.deepEqual(JSON.parse(JSON.stringify(a)), a, "survives a JSON round trip");
});

test("geometry carries no style tokens", () => {
  const forbidden = /^(fill|stroke|color|font|opacity|ink|paper|style|hatch)/i;
  const walk = (v: unknown, path: string): void => {
    if (Array.isArray(v)) {
      v.forEach((item, i) => walk(item, `${path}[${i}]`));
    } else if (v !== null && typeof v === "object") {
      for (const [k, val] of Object.entries(v)) {
        assert.ok(!forbidden.test(k), `style-flavored key "${k}" at ${path}`);
        walk(val, `${path}.${k}`);
      }
    }
  };
  walk(composeProspect(makeInput({ kind: "capital", harbor: true, ruined: true })), "$");
});
