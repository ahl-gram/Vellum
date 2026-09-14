import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const SELFTEST = resolve(import.meta.dirname, "..", "..", ".claude", "skills", "vellum-footguns", "hooks", "footgun-gate.selftest.ts");
const TEMPLATE = resolve(import.meta.dirname, "..", "..", ".github", "PULL_REQUEST_TEMPLATE.md");
// The cap reaches the selftest's own three deployed rows, which pipe input to a child that drains it and so share the shape #564 wedged on; a cap here bounds that whole subtree in one place. Measured 2026-09-11: the selftest runs in 0.34s, so this is about 90x.
const BOUND_MS = 30_000;

test("the footgun hook's fixture table passes, including the deployed settings.json command", () => {
  const out = execFileSync(process.execPath, [SELFTEST], { encoding: "utf8", timeout: BOUND_MS });
  assert.doesNotMatch(out, /^FAIL/m, out);
  assert.match(out, /^ok +deployed: symlinked project dir denies stash pop/m, out);
});

// The table's only other assertion is "no FAIL", which an EMPTY roster satisfies: a headingRows() that returned [] would leave npm test green with the whole PR-section guard gone (#140's deletable-guard shape). The required row per section is derived from the template rather than listed here, so this cannot drift from it either.
test("every section of the PR template has its own denial row in the table", () => {
  const sections = readFileSync(TEMPLATE, "utf8").split("\n").map((l) => l.trim()).filter((l) => l.startsWith("## "));
  assert.ok(sections.length >= 2, `the template carries ${sections.length} sections, so this guard cannot bite`);
  const out = execFileSync(process.execPath, [SELFTEST], { encoding: "utf8", timeout: BOUND_MS });
  for (const section of sections) assert.ok(out.includes(`ok   pr body missing ${section} denied`), `no passing row for ${section}\n${out}`);
});

// This guard lives here, not beside the readDeployed tests, because it has to survive the defect it guards: footgun-deployed-run.test.ts imports the selftest statically, so an entry guard that stops working exits that whole file at import time and the runner reports it green with every assertion silently absent (measured: 7 gone, "pass 2 fail 0"). This file only ever spawns the selftest, so it still runs.
test("a bare import of the fixture table runs nothing and mints nothing", () => {
  const own = mkdtempSync(join(tmpdir(), "footgun-import-probe-"));
  try {
    const out = execFileSync(process.execPath, ["-e", `import(${JSON.stringify(pathToFileURL(SELFTEST).href)})`], {
      encoding: "utf8",
      env: { ...process.env, TMPDIR: own },
    });
    assert.equal(out, "", `run() executed on import and printed ${out.length} bytes`);
    assert.deepEqual(readdirSync(own), []);
  } finally {
    rmSync(own, { recursive: true, force: true });
  }
});

// Both guards below read the TEMPLATE, so neither can red when a PR body ships with no closing reference: the hook that reads a body off disk checks the sections and denies a negated keyword but never requires one, and a body written by hand rather than seeded from this file carries whatever its author typed, so #597's own defect, a merged PR leaving its issue open, is not guardable from a test here and the template line is a prompt rather than a mechanism. The number scan errs toward a false positive, since a number deliberately written as an example would red it, and never toward a miss.
test("the PR template prompts for a closing reference above its first section, with a note beside it", () => {
  const lines = readFileSync(TEMPLATE, "utf8").split("\n");
  const firstSection = lines.findIndex((l) => l.trim().startsWith("## "));
  assert.notEqual(firstSection, -1, "the template carries no `## ` section, so this guard cannot bite");
  const closing = lines.findIndex((l) => l.trim().startsWith("Closes #"));
  assert.notEqual(closing, -1, "the template carries no `Closes #` line, so nothing prompts the author for the closing reference");
  assert.ok(closing < firstSection, `the closing line is at ${closing}, at or past the first \`## \` section at ${firstSection}, where the hook would enforce whatever heading precedes it`);
  const note = lines.slice(closing + 1, firstSection).filter((l) => l.trim().startsWith("<!--")).join("\n");
  assert.notEqual(note, "", "the closing line carries no note between it and the first section");
  assert.match(note, /No issue:/, "the note beside the closing line does not say what a PR with no issue writes in its place, which is the half of the prompt an author without an issue needs");
  assert.match(note, /stays open/, "the note beside the closing line does not say what a PR that HAS an issue and deliberately leaves it open writes in its place, which is the third form: the first of a pair of PRs on one issue has an issue number to name and no closing keyword to name it with");
  // Presence only: a note keeping every phrase below and adding guidance that contradicts them stays green, which costs a miss on self-contradiction and never a false red on a rewording, the direction a prompt the hook does not enforce should err in.
  assert.match(note, /no closing keyword/, "the third form does not say to keep every closing keyword away from the number, which is the whole of it: GitHub reads a keyword beside a number as closing it however the sentence is worded");
  assert.match(note, /closingIssuesReferences` is then empty by intent/, "the third form does not say how to tell a deliberately open issue from a dropped closing line, which is the only check that distinguishes them");
  assert.match(note, /Issue: #N/, "the third form names no worked shape, so an author following it can write `Closes #N, stays open because ...`, which reads as the rule and closes the issue on merge");
});

test("the PR template names no literal issue number", () => {
  const hits = readFileSync(TEMPLATE, "utf8").match(/#\d+|issues\/\d+/g);
  assert.equal(hits, null, `the template names ${hits?.join(", ")}, and a body opened from it carries that text: a number beside a negated close keyword is denied by the hook, and any reference at all cross-references that issue from every PR opened from the template afterwards`);
});
