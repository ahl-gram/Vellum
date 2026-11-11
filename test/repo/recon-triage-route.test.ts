import assert from "node:assert/strict";
import { test } from "node:test";
import type { ClaimRow, Kind } from "../../scripts/recon-triage/claims.ts";
import { routeOf } from "../../scripts/recon-triage/route.ts";

const row = (kind: Kind, paths: string[]): ClaimRow => ({ claim: "c", source: "body", paths, symbols: [], kind });

test("every claim but a behavior claim goes to a command unasked, whatever it cites", () => {
  for (const kind of ["existence", "count", "process"] as const) {
    assert.equal(routeOf(row(kind, ["src/gone.ts"]), ["src/gone.ts"]), "command", kind);
    assert.equal(routeOf(row(kind, []), []), "command", kind);
  }
});

test("a behavior claim citing no file, or a file missing from the tree, is not asked", () => {
  assert.equal(routeOf(row("behavior", []), []), "no code");
  assert.equal(routeOf(row("behavior", ["src/a.ts", "src/gone.ts"]), ["src/gone.ts"]), "no code");
  assert.equal(routeOf(row("behavior", ["src/styles/gone.css"]), ["src/styles/gone.css"]), "no code");
});

test("a behavior claim whose every cited file is a stylesheet is set aside for a browser read, and one citing code beside a stylesheet is asked", () => {
  assert.equal(routeOf(row("behavior", ["src/styles/a.css"]), []), "stylesheet");
  assert.equal(routeOf(row("behavior", ["src/styles/a.css", "src/site/a.ts"]), []), "asked");
  assert.equal(routeOf(row("behavior", ["src/a.ts"]), []), "asked");
  assert.equal(routeOf(row("behavior", ["src/a.css.ts"]), []), "asked");
});
