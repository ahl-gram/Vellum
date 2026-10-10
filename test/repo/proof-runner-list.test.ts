import { test } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  BUDGET_SECONDS,
  LIST_FILE,
  MAX_JOBS,
  parseList,
  planFromCheckout,
  planJobs,
  selectionKey,
} from "../../scripts/proof-runner/list.ts";
import { commitAll, withTempRepo } from "../../test-support/proof-runner-repo.ts";

const SHA = "a".repeat(40);
const patchOf = (path: string, from = "a", to = "b") =>
  `diff --git a/${path} b/${path}\n--- a/${path}\n+++ b/${path}\n@@ -1 +1 @@\n-${from}\n+${to}\n`;
const PATCH = patchOf("src/x.ts");
const unit = (file = "test/a.test.ts", expect = ["a test"]) => ({ files: [file], expect });
const entry = (id: string, more: Record<string, unknown> = {}) => ({ id, patch: PATCH, unit: unit(), ...more });
const list = (entries: unknown[]) => ({ version: 1, sha: SHA, entries });
const refuses = (entries: unknown[], words: RegExp) => assert.throws(() => parseList(list(entries)), words);

test("a list plans one job per entry, then a control per distinct suite selection, then one lint and one unit control over the union of their files", () => {
  const plan = planJobs(
    parseList(
      list([
        entry("one", { e2e: { suites: "document-rooms", expect: ["IX9"] } }),
        entry("two", { unit: unit("test/b.test.ts", ["b"]), e2e: { suites: "specimen", expect: ["SB13"] } }),
        { id: "three", patch: PATCH, lint: { files: ["src/x.ts"], expect: ["vellum/ts-comment-issue-form"] } },
      ]),
    ),
  );
  assert.equal(plan.sha, SHA);
  assert.deepEqual(
    plan.jobs.map((j) => j.id),
    ["one", "two", "three", "control-e2e-1", "control-e2e-2", "control-lint", "control-unit"],
  );
  const byId = new Map(plan.jobs.map((j) => [j.id, j]));
  assert.deepEqual(byId.get("control-e2e-1"), {
    id: "control-e2e-1",
    control: "e2e",
    e2e: { suites: "document-rooms", expect: [] },
  });
  assert.deepEqual(byId.get("control-unit"), {
    id: "control-unit",
    control: "unit",
    unit: { files: ["test/a.test.ts", "test/b.test.ts"], expect: [] },
  });
  assert.deepEqual(byId.get("control-lint")?.lint, { files: ["src/x.ts"], expect: [] });
  assert.equal(byId.get("control-unit")?.patch, undefined, "a control carries a patch, so it is no control");
});

test("selections that differ only in order, case and spacing are one selection and share one control", () => {
  assert.equal(selectionKey("Survey, landfall"), selectionKey("landfall,survey"));
  assert.notEqual(selectionKey("landfall"), selectionKey("landfall,survey"));
  const plan = planJobs(
    parseList(
      list([
        entry("one", { e2e: { suites: " Survey ,landfall", expect: ["L1"] } }),
        entry("two", { e2e: { suites: "landfall,survey", expect: ["L2"] } }),
        entry("three", { e2e: { suites: "LANDFALL, survey", expect: ["L3"] } }),
      ]),
    ),
  );
  assert.equal(
    plan.jobs.filter((j) => j.control === "e2e").length,
    1,
    "the first selection is written out of canonical form, so a control keyed by the raw string would split here",
  );
});

test("a duplicate id, an id outside the safe set and an id in the controls' namespace are each refused by name", () => {
  refuses([entry("one"), entry("one")], /duplicate id "one"/);
  refuses([entry("a b")], /id "a b"/);
  refuses([entry("control-e2e-1")], /"control-e2e-1".*reserved/);
});

test("an entry that names no check is refused", () => {
  refuses([{ id: "bare", patch: PATCH }], /"bare" names no check/);
});

test("a check on a patched entry that expects no red is refused, since a mutation must name what it reds", () => {
  refuses([entry("quiet", { unit: unit("test/a.test.ts", []) })], /"quiet".*unit check expects no red/);
});

test("an entry with no patch that expects a red is refused, since nothing was broken", () => {
  refuses(
    [{ id: "sample", e2e: { suites: "specimen", expect: ["SB1"] } }],
    /"sample" has no patch, so its e2e check must expect no red/,
  );
});

test("a selection of every suite, the smoke tier or nothing at all is refused, since a proof names its suites", () => {
  for (const suites of ["full", "ALL", "smoke", " "]) {
    refuses([entry("wide", { e2e: { suites, expect: ["X1"] } })], /"wide" selects .* name the suites/);
  }
});

test("a patch that touches the package manifest or the lockfile is refused, since the install runs before the patch", () => {
  refuses([entry("deps", { patch: patchOf("package.json") })], /"deps".*package\.json/);
  refuses([entry("lock", { patch: patchOf("package-lock.json") })], /"lock".*package-lock\.json/);
});

test("a patch path that is absolute or climbs out of the tree is refused", () => {
  refuses([entry("abs", { patch: PATCH.replace("+++ b/src/x.ts", "+++ /etc/passwd") })], /"abs".*outside the tree/);
  refuses([entry("up", { patch: patchOf("../x.ts") })], /"up".*outside the tree/);
});

test("a budget may only lower its kind's default", () => {
  refuses([entry("slow", { unit: { ...unit(), budgetSeconds: BUDGET_SECONDS.unit + 1 } })], /"slow".*budget/);
  assert.doesNotThrow(() => parseList(list([entry("fast", { unit: { ...unit(), budgetSeconds: 20 } })])));
});

test("a lint plant in a new file is refused, since a file the type checker does not include fails before any rule runs", () => {
  const added =
    "diff --git a/src/new.ts b/src/new.ts\nnew file mode 100644\n--- /dev/null\n+++ b/src/new.ts\n@@ -0,0 +1 @@\n+x\n";
  refuses([{ id: "fresh", patch: added, lint: { files: ["src/new.ts"], expect: ["r"] } }], /"fresh".*new file/);
});

test("every problem in a list is named in one refusal, not the first alone", () => {
  assert.throws(
    () => parseList(list([{ id: "bare", patch: PATCH }, entry("one"), entry("one")])),
    (err: Error) => /"bare" names no check/.test(err.message) && /duplicate id "one"/.test(err.message),
  );
});

test("a list of 256 jobs counting its controls is planned, and one of 257 is refused naming the count", () => {
  const many = (n: number) =>
    Array.from({ length: n }, (_, i) =>
      entry(`m${i}`, { unit: undefined, e2e: { suites: "specimen", expect: ["S"] } }),
    );
  assert.equal(planJobs(parseList(list(many(MAX_JOBS - 1)))).jobs.length, MAX_JOBS);
  assert.throws(() => planJobs(parseList(list(many(MAX_JOBS)))), /257 jobs/);
});

test("the plan job reads the list from a proof/ branch whose head commit adds the list and nothing else", async () => {
  await withTempRepo({ "src/x.ts": "a\n" }, (dir) => {
    writeFileSync(join(dir, LIST_FILE), JSON.stringify(list([entry("one")])));
    commitAll(dir, "list");
    assert.deepEqual(
      planFromCheckout(dir, "proof/838-a").jobs.map((j) => j.id),
      ["one", "control-unit"],
    );
    assert.throws(() => planFromCheckout(dir, "main"), /proof\//);
    writeFileSync(join(dir, "src/x.ts"), "changed\n");
    commitAll(dir, "list and code");
    assert.throws(() => planFromCheckout(dir, "proof/838-a"), /src\/x\.ts/);
  });
});
